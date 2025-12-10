import { NextRequest, NextResponse } from "next/server";
import { verifyITNSignature } from "@/lib/payfast/payfast";
import { createPurchaseServer, getPurchaseByIdServer, updatePurchaseStatusServer } from "@/lib/firebase/purchases-server";
import { getBookById } from "@/config/books";

/**
 * Handle Payfast ITN (Instant Transaction Notification) callbacks
 * This endpoint receives POST requests from Payfast with payment status updates
 */
export async function POST(request: NextRequest) {
  try {
    // Get form data from Payfast
    const formData = await request.formData();
    
    // Convert FormData to object while preserving order
    // PayFast ITN signature verification requires parameters in the order they're sent
    const data: Record<string, string> = {};
    const parameterOrder: string[] = []; // Preserve the order from PayFast
    formData.forEach((value, key) => {
      // Capture all keys in order (we'll exclude signature/signphrase when building signature)
      parameterOrder.push(key);
      data[key] = value.toString();
    });
    
    // Debug: Log the parameter order we received from PayFast
    console.log("PayFast ITN parameter order:", parameterOrder.filter(k => k !== "signature" && k !== "signphrase"));

    // Get signature from data
    const signature = data.signature;
    if (!signature) {
      return NextResponse.json(
        { error: "Missing signature" },
        { status: 400 }
      );
    }

    // Verify ITN signature
    // Pass baseUrl and parameter order for signature verification
    const baseUrl = request.nextUrl.origin;
    const isValid = verifyITNSignature(data, signature, baseUrl, parameterOrder);
    if (!isValid) {
      console.error("Invalid ITN signature:", data);
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    // Get payment details from ITN callback
    const paymentId = data.m_payment_id; // This is our purchase ID (UUID generated in initiate route)
    const paymentStatus = data.payment_status;
    const pfPaymentId = data.pf_payment_id; // Payfast payment ID
    const userId = data.custom_str2; // User ID stored in custom field
    const bookId = data.custom_str1; // Book ID stored in custom field
    const bookTitle = data.item_name; // Book title
    const amountGross = data.amount_gross; // Amount paid
    const userEmail = data.email_address; // User email

    // Validate required fields
    if (!paymentId) {
      return NextResponse.json(
        { error: "Missing payment ID" },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: "Missing user ID" },
        { status: 400 }
      );
    }

    if (!bookId) {
      return NextResponse.json(
        { error: "Missing book ID" },
        { status: 400 }
      );
    }

    // Get book details to get price and currency
    const book = getBookById(bookId);
    if (!book) {
      console.error("Book not found in ITN callback:", bookId);
      return NextResponse.json(
        { error: "Book not found" },
        { status: 404 }
      );
    }

    // Determine purchase status based on Payfast payment status
    let purchaseStatus: "completed" | "pending" | "refunded" | "failed";
    
    switch (paymentStatus) {
      case "COMPLETE":
        purchaseStatus = "completed";
        break;
      case "FAILED":
      case "CANCELLED":
        purchaseStatus = "failed";
        break;
      case "PENDING":
        purchaseStatus = "pending";
        break;
      default:
        console.warn("Unknown payment status:", paymentStatus);
        purchaseStatus = "pending";
    }

    // Check if purchase already exists (PayFast may send multiple ITN callbacks)
    const existingPurchase = await getPurchaseByIdServer(paymentId);
    
    if (existingPurchase) {
      // Purchase already exists - update its status based on the latest payment status
      // PayFast may send multiple callbacks with status updates (e.g., PENDING -> COMPLETE)
      const currentStatus = existingPurchase.status;
      
      if (currentStatus !== purchaseStatus) {
        console.log(`Updating purchase status from ${currentStatus} to ${purchaseStatus} for purchase:`, paymentId);
        await updatePurchaseStatusServer(paymentId, purchaseStatus, pfPaymentId || undefined);
        console.log("Purchase status updated successfully:", paymentId);
      } else {
        console.log("Purchase status unchanged, acknowledging duplicate ITN callback:", paymentId);
      }
      
      return new NextResponse("OK", { status: 200 });
    }

    // Create purchase record in Firestore (only on ITN callback)
    // Use paymentId as the Firestore document ID
    await createPurchaseServer({
      userId,
      bookId: book.id,
      bookTitle: book.title,
      purchaseDate: new Date(),
      price: book.price,
      currency: book.currency,
      paymentMethod: "payfast",
      status: purchaseStatus,
      transactionId: pfPaymentId || undefined,
    }, paymentId); // Pass paymentId as the document ID
    
    console.log("Purchase created successfully from ITN:", paymentId, "Status:", purchaseStatus);

    // Return success response to Payfast
    // Payfast expects "OK" response
    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("Error processing ITN:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Also handle GET requests (Payfast may send GET for testing)
export async function GET(request: NextRequest) {
  return NextResponse.json(
    { message: "ITN endpoint - POST only" },
    { status: 405 }
  );
}

