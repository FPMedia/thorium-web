import crypto from "crypto";
import { getPayfastConfig, getPayfastUrl } from "./config";

export interface PayfastPaymentData {
  merchant_id: string;
  merchant_key: string;
  return_url: string;
  cancel_url: string;
  notify_url: string;
  name_first?: string;
  name_last?: string;
  email_address: string;
  cell_number?: string;
  m_payment_id: string; // Unique payment ID (purchase ID from Firestore)
  amount: string; // Amount as decimal string (e.g., "179.00" for R179.00)
  item_name: string; // Book title
  item_description?: string;
  custom_str1?: string; // Can store bookId
  custom_str2?: string; // Can store userId
  signature: string;
}

/**
 * Valid PayFast parameter names (whitelist to prevent invalid fields)
 */
const VALID_PAYFAST_PARAMS = new Set([
  "merchant_id",
  "merchant_key",
  "return_url",
  "cancel_url",
  "notify_url",
  "name_first",
  "name_last",
  "email_address",
  "cell_number",
  "m_payment_id",
  "amount",
  "item_name",
  "item_description",
  "custom_int1",
  "custom_int2",
  "custom_int3",
  "custom_int4",
  "custom_int5",
  "custom_str1",
  "custom_str2",
  "custom_str3",
  "custom_str4",
  "custom_str5",
]);

/**
 * Generate MD5 signature for Payfast payment request
 * According to Payfast docs: https://developers.payfast.co.za/docs#step_2_signature
 * 
 * IMPORTANT: Parameters must be in the order they appear in the attributes description,
 * NOT alphabetical order! This matches PayFast's official signature generation format.
 * 
 * Steps:
 * 1. Take all parameters in their original order (excluding signature and invalid fields)
 * 2. Trim values and URL encode (space becomes +, not %20)
 * 3. Join with &
 * 4. Append passphrase if provided
 * 5. Generate MD5 hash
 */
export function generatePaymentSignature(
  paymentData: Omit<PayfastPaymentData, "signature">,
  merchantKey: string,
  passphrase: string
): string {
  // Create parameter string - use original order (NOT alphabetical!)
  // PayFast requires parameters in the order they appear in the attributes description
  let pfOutput = "";
  
  for (const key in paymentData) {
    if (paymentData.hasOwnProperty(key)) {
      // Only include valid PayFast parameters
      if (!VALID_PAYFAST_PARAMS.has(key)) {
        continue;
      }
      
      const value = paymentData[key as keyof typeof paymentData];
      // Exclude empty values
      if (value !== null && value !== undefined && String(value).trim() !== "") {
        const trimmedValue = String(value).trim();
        const encodedValue = encodeURIComponent(trimmedValue).replace(/%20/g, "+");
        pfOutput += `${key}=${encodedValue}&`;
      }
    }
  }
  
  // Remove last ampersand
  let getString = pfOutput.slice(0, -1);
  
  // Add passphrase if provided (check for null and empty string)
  if (passphrase !== null && passphrase !== undefined && passphrase.trim().length > 0) {
    getString += `&passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, "+")}`;
  }

  // Generate MD5 hash (lowercase)
  return crypto.createHash("md5").update(getString).digest("hex");
}

/**
 * Sanitize string for Payfast - remove problematic special characters
 * Payfast can be sensitive to certain special characters (like apostrophes) in item_name
 * that cause signature mismatches even when properly URL encoded
 */
function sanitizeForPayfast(value: string): string {
  return value
    .replace(/'/g, "") // Remove apostrophes (known issue with Payfast signatures)
    .replace(/"/g, "") // Remove quotes
    .replace(/[^\w\s-]/g, "") // Remove any other special characters except word chars, spaces, and hyphens
    .replace(/\s+/g, " ") // Normalize multiple spaces to single space
    .trim();
}

/**
 * Generate Payfast payment request data
 */
export function generatePaymentRequest(
  userId: string,
  bookId: string,
  bookTitle: string,
  userEmail: string,
  purchaseId: string,
  amount: number,
  baseUrl?: string | URL
): PayfastPaymentData {
  const config = getPayfastConfig(baseUrl);

  // Format amount as decimal string (e.g., 179 -> "179.00")
  // PayFast expects the amount in the main currency unit, not cents
  const amountFormatted = amount.toFixed(2);

  // Sanitize book title for Payfast (remove special characters that cause signature issues)
  const sanitizedTitle = sanitizeForPayfast(bookTitle);

  const paymentData: Omit<PayfastPaymentData, "signature"> = {
    merchant_id: config.merchantId,
    merchant_key: config.merchantKey,
    return_url: config.returnUrl,
    cancel_url: config.cancelUrl,
    notify_url: config.notifyUrl,
    email_address: userEmail,
    m_payment_id: purchaseId,
    amount: amountFormatted,
    item_name: sanitizedTitle, // Use sanitized title to avoid signature issues
    custom_str1: bookId, // Store bookId in custom field
    custom_str2: userId, // Store userId in custom field for ITN callback
  };

  // Generate signature
  const signature = generatePaymentSignature(
    paymentData,
    config.merchantKey,
    config.passphrase
  );

  return {
    ...paymentData,
    signature,
  };
}

/**
 * Verify Payfast ITN (Instant Transaction Notification) signature
 * Note: ITN verification doesn't need URLs, but we keep baseUrl optional for consistency
 * 
 * According to PayFast ITN docs (step 4: confirm payment), signature verification requires:
 * 1. Exclude signature and signphrase fields
 * 2. Use parameters in the ORDER they are received from PayFast (NOT alphabetical)
 * 3. Trim values and URL encode (space becomes +)
 * 4. Join with &
 * 5. Append passphrase if provided
 * 6. Generate MD5 hash
 * 
 * IMPORTANT: ITN signature verification uses the ORIGINAL ORDER from PayFast's POST request,
 * which is different from payment request signature generation (which also uses original order).
 * This is confirmed by PayFast's signature troubleshooter which rejects alphabetically sorted parameters.
 */
export function verifyITNSignature(
  data: Record<string, string>,
  signature: string,
  baseUrl?: string | URL,
  parameterOrder?: string[]
): boolean {
  const config = getPayfastConfig(baseUrl);

  // Remove signature from data if it exists
  const dataCopy = { ...data };
  delete dataCopy.signature;

  // Use provided parameter order if available (from PayFast's POST request)
  // Otherwise fall back to Object.keys() which preserves insertion order in modern JS
  let keys: string[];
  if (parameterOrder && parameterOrder.length > 0) {
    // Use the order from PayFast's POST request, filtering out signature and signphrase
    keys = parameterOrder.filter(key => key !== "signature" && key !== "signphrase");
  } else {
    // Fallback: use keys in insertion order (modern JS preserves this)
    keys = Object.keys(dataCopy).filter(key => key !== "signphrase");
  }

  // Debug: Log the keys we're using for signature (in order)
  console.log("Keys used for ITN signature (in order):", keys);

  // Build parameter string in the order PayFast sent them
  // PayFast ITN includes ALL fields in signature, even empty ones
  let pfOutput = "";
  
  for (const key of keys) {
    const value = dataCopy[key];
    // Include all fields, even empty ones (PayFast ITN includes empty fields in signature)
    if (value !== null && value !== undefined) {
      const trimmedValue = String(value).trim();
      // For empty strings, include them as key= (no value)
      const encodedValue = trimmedValue === "" 
        ? "" 
        : encodeURIComponent(trimmedValue).replace(/%20/g, "+");
      pfOutput += `${key}=${encodedValue}&`;
    }
  }
  
  // Remove last ampersand
  let getString = pfOutput.slice(0, -1);
  
  // Store the base string before passphrase for debugging
  const baseString = getString;
  
  // Add passphrase if provided (check for null and empty string)
  // PayFast ITN: According to some docs, passphrase should be appended WITHOUT URL encoding
  // But we'll try both methods and log for debugging
  if (config.passphrase !== null && config.passphrase !== undefined && config.passphrase.trim().length > 0) {
    const trimmedPassphrase = config.passphrase.trim();
    // Try without URL encoding first (as some PayFast docs suggest)
    getString += `&passphrase=${trimmedPassphrase}`;
  }

  // Generate expected signature (lowercase)
  const expectedSignature = crypto
    .createHash("md5")
    .update(getString)
    .digest("hex");

  // Debug logging for signature verification
  if (expectedSignature !== signature.toLowerCase()) {
    console.error("ITN Signature mismatch:");
    console.error("Expected:", expectedSignature);
    console.error("Received:", signature.toLowerCase());
    console.error("Base string (before passphrase, INCLUDING empty fields):", baseString);
    console.error("Final string (with passphrase, NOT URL-encoded):", getString);
    console.error("Passphrase configured:", config.passphrase ? "YES (length: " + config.passphrase.length + ")" : "NO");
    if (config.passphrase) {
      console.error("Passphrase (first 3 chars):", config.passphrase.substring(0, 3) + "...");
    }
    console.error("Parameter order used:", keys);
    
    // Try alternative: exclude empty fields (for debugging)
    let noEmptyOutput = "";
    for (const key of keys) {
      const value = dataCopy[key];
      if (value !== null && value !== undefined && String(value).trim() !== "") {
        const trimmedValue = String(value).trim();
        const encodedValue = encodeURIComponent(trimmedValue).replace(/%20/g, "+");
        noEmptyOutput += `${key}=${encodedValue}&`;
      }
    }
    const noEmptyString = noEmptyOutput.slice(0, -1);
    if (config.passphrase && config.passphrase.trim().length > 0) {
      const noEmptyStringWithPass = noEmptyString + `&passphrase=${config.passphrase.trim()}`;
      const noEmptySignature = crypto.createHash("md5").update(noEmptyStringWithPass).digest("hex");
      console.error("Alternative (EXCLUDING empty fields) signature:", noEmptySignature);
      console.error("Alternative string (excluding empty fields):", noEmptyStringWithPass);
    }
    
    // Try alternative: passphrase WITH URL encoding (for debugging)
    if (config.passphrase && config.passphrase.trim().length > 0) {
      const encodedPassphrase = encodeURIComponent(config.passphrase.trim()).replace(/%20/g, "+");
      const altString = baseString + `&passphrase=${encodedPassphrase}`;
      const altSignature = crypto.createHash("md5").update(altString).digest("hex");
      console.error("Alternative (passphrase URL-encoded) signature:", altSignature);
      console.error("Alternative string (with URL-encoded passphrase):", altString);
    }
  } else {
    console.log("✓ ITN Signature verified successfully!");
  }

  return expectedSignature === signature.toLowerCase();
}

/**
 * Get Payfast payment URL
 * @param baseUrl Optional base URL to build callback URLs from (only needed if env vars aren't set)
 */
export function getPaymentUrl(baseUrl?: string | URL): string {
  const config = getPayfastConfig(baseUrl);
  return getPayfastUrl(config.mode);
}

/**
 * Debug helper: Generate the payload string used for signature (for PayFast troubleshooter)
 * This returns the exact string that will be hashed to create the signature.
 * Use this in PayFast's Signature Troubleshooter tool to verify signature generation.
 * 
 * @param paymentData Payment data (excluding signature)
 * @param passphrase PayFast passphrase
 * @returns The payload string that should be pasted into PayFast's Signature Troubleshooter
 */
export function getSignaturePayloadString(
  paymentData: Omit<PayfastPaymentData, "signature">,
  passphrase: string
): string {
  // Create parameter string - use original order (NOT alphabetical!)
  // This matches the exact logic in generatePaymentSignature
  let pfOutput = "";
  
  for (const key in paymentData) {
    if (paymentData.hasOwnProperty(key)) {
      // Only include valid PayFast parameters
      if (!VALID_PAYFAST_PARAMS.has(key)) {
        continue;
      }
      
      const value = paymentData[key as keyof typeof paymentData];
      // Exclude empty values
      if (value !== null && value !== undefined && String(value).trim() !== "") {
        const trimmedValue = String(value).trim();
        const encodedValue = encodeURIComponent(trimmedValue).replace(/%20/g, "+");
        pfOutput += `${key}=${encodedValue}&`;
      }
    }
  }
  
  // Remove last ampersand
  let getString = pfOutput.slice(0, -1);
  
  // Add passphrase if provided (check for null and empty string)
  if (passphrase !== null && passphrase !== undefined && passphrase.trim().length > 0) {
    getString += `&passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, "+")}`;
  }

  return getString;
}

