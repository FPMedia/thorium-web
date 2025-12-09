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
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify Firebase token
    const decodedToken = await verifyIdToken(token);
    const userId = decodedToken.uid;
    const userEmail = decodedToken.email || "";

    // Get request body
    const body = await request.json();
    const { bookId } = body;

    if (!bookId) {
      return NextResponse.json(
        { error: "bookId is required" },
        { status: 400 }
      );
    }

    // Get book details
    const book = getBookById(bookId);
    if (!book) {
      return NextResponse.json(
        { error: "Book not found" },
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
    const baseUrl = `${protocol}//${actualHost}`;
    
    const paymentData = generatePaymentRequest(
      userId,
      book.id,
      book.title,
      userEmail,
      purchaseId,
      book.price,
      baseUrl
    );

    // Debug: Log payload string for PayFast Signature Troubleshooter
    const config = getPayfastConfig(baseUrl);
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
          { error: "Unauthorized" },
          { status: 401 }
        );
      }
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

