import { NextRequest, NextResponse } from "next/server";
import { verifyIdToken } from "@/lib/firebase/admin";
import { generatePaymentRequest, getPaymentUrl, getSignaturePayloadString } from "@/lib/payfast/payfast";
import { getBookById } from "@/config/books";
import { getPayfastConfig } from "@/lib/payfast/config";
import { randomUUID } from "crypto";

export async function POST(request: NextRequest) {
  try {
    // Get token from cookie (matches middleware pattern)
    const token = request.cookies.get("__session")?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify Firebase token
    const decodedToken = await verifyIdToken(token);
    const userId = decodedToken.uid;
    const userEmail = decodedToken.email || "";

    // Get request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      console.error("Error parsing request body:", error);
      return NextResponse.json(
        { error: "Invalid request body", message: "Invalid request body" },
        { status: 400 }
      );
    }
    
    const { bookId } = body;

    if (!bookId) {
      return NextResponse.json(
        { error: "bookId is required", message: "bookId is required" },
        { status: 400 }
      );
    }

    // Get book details
    const book = getBookById(bookId);
    if (!book) {
      return NextResponse.json(
        { error: "Book not found", message: "Book not found" },
        { status: 404 }
      );
    }

    // Generate a unique purchase ID (will be used as Firestore document ID when ITN callback is received)
    // We don't create the purchase record here - it will be created in the ITN handler
    const purchaseId = randomUUID();

    // Generate Payfast payment request
    // Detect the actual base URL from request headers (works with ngrok, direct access, etc.)
    // Check for forwarded host (ngrok sets this) or use the host header
    const forwardedHost = request.headers.get("x-forwarded-host");
    const host = request.headers.get("host");
    let protocol = request.headers.get("x-forwarded-proto") || request.nextUrl.protocol;
    
    // Ensure protocol has colon (x-forwarded-proto returns "https" not "https:")
    if (protocol && !protocol.endsWith(":")) {
      protocol = `${protocol}:`;
    }
    
    // Use forwarded host if available (ngrok), otherwise use host header, fallback to nextUrl
    const actualHost = forwardedHost || host || request.nextUrl.host;
    
    if (!actualHost) {
      console.error("Unable to determine host from request headers");
      return NextResponse.json(
        { error: "Unable to determine server URL", message: "Unable to determine server URL" },
        { status: 500 }
      );
    }
    
    const baseUrl = `${protocol}//${actualHost}`;
    
    // Validate baseUrl is a valid URL
    try {
      new URL(baseUrl);
    } catch (urlError) {
      console.error("Invalid baseUrl constructed:", baseUrl, urlError);
      return NextResponse.json(
        { error: "Invalid server configuration", message: "Invalid server configuration" },
        { status: 500 }
      );
    }
    
    // Validate Payfast configuration before proceeding
    let config;
    try {
      config = getPayfastConfig(baseUrl);
    } catch (configError) {
      console.error("Payfast configuration error:", configError);
      return NextResponse.json(
        { 
          error: "Payment configuration error", 
          message: configError instanceof Error ? configError.message : "Payment configuration error" 
        },
        { status: 500 }
      );
    }
    
    let paymentData;
    try {
      paymentData = generatePaymentRequest(
        userId,
        book.id,
        book.title,
        userEmail,
        purchaseId,
        book.price,
        baseUrl
      );
    } catch (paymentError) {
      console.error("Error generating payment request:", paymentError);
      return NextResponse.json(
        { 
          error: "Failed to generate payment request", 
          message: paymentError instanceof Error ? paymentError.message : "Failed to generate payment request" 
        },
        { status: 500 }
      );
    }

    // Debug: Log payload string for PayFast Signature Troubleshooter
    // Extract only valid PayFast parameters (exclude signature and any extra fields)
    const { signature: _, ...paymentDataForSignature } = paymentData;
    const payloadString = getSignaturePayloadString(
      paymentDataForSignature,
      config.passphrase
    );
    
    console.log("\n=== PayFast Signature Debug ===");
    console.log("Payment Data Keys:", Object.keys(paymentDataForSignature));
    console.log("\nPayload String (paste into PayFast troubleshooter):");
    console.log(payloadString);
    console.log("\nGenerated Signature:", paymentData.signature);
    console.log("==============================\n");

    // Get Payfast payment URL
    const paymentUrl = getPaymentUrl(baseUrl);

    return NextResponse.json({
      purchaseId,
      paymentData,
      paymentUrl,
    });
  } catch (error) {
    console.error("Error initiating payment:", error);
    
    if (error instanceof Error) {
      // Handle Firebase auth errors
      if (error.message.includes("token") || error.message.includes("auth")) {
        return NextResponse.json(
          { error: "Unauthorized", message: "Unauthorized" },
          { status: 401 }
        );
      }
      
      // Return the actual error message for debugging
      return NextResponse.json(
        { error: error.message, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error", message: "Internal server error" },
      { status: 500 }
    );
  }
}

