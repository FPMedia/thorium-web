import { buildPayfastUrls } from "@/config/payfast-urls";

export interface PayfastConfig {
  merchantId: string;
  merchantKey: string;
  passphrase: string;
  mode: "sandbox" | "production";
  returnUrl: string;
  cancelUrl: string;
  notifyUrl: string;
}

/**
 * Get Payfast configuration from environment variables
 * @param baseUrl Optional base URL to build callback URLs from (defaults to env vars if provided)
 */
export function getPayfastConfig(baseUrl?: string | URL): PayfastConfig {
  const merchantId = process.env.PAYFAST_MERCHANT_ID;
  const merchantKey = process.env.PAYFAST_MERCHANT_KEY;
  const passphrase = process.env.PAYFAST_PASSPHRASE || "";
  const mode = (process.env.PAYFAST_MODE || "sandbox") as "sandbox" | "production";

  if (!merchantId || !merchantKey) {
    throw new Error(
      "Payfast configuration is missing. Please set PAYFAST_MERCHANT_ID and PAYFAST_MERCHANT_KEY environment variables."
    );
  }

  // Build URLs from base URL if provided, otherwise use env vars (for backward compatibility)
  let returnUrl: string;
  let cancelUrl: string;
  let notifyUrl: string;

  if (baseUrl) {
    const urls = buildPayfastUrls(baseUrl);
    returnUrl = urls.returnUrl;
    cancelUrl = urls.cancelUrl;
    notifyUrl = urls.notifyUrl;
  } else {
    // Fallback to environment variables if baseUrl not provided
    returnUrl = process.env.NEXT_PUBLIC_PAYFAST_RETURN_URL || "";
    cancelUrl = process.env.NEXT_PUBLIC_PAYFAST_CANCEL_URL || "";
    notifyUrl = process.env.NEXT_PUBLIC_PAYFAST_NOTIFY_URL || "";

    if (!returnUrl || !cancelUrl || !notifyUrl) {
      throw new Error(
        "Payfast URLs are missing. Either provide a baseUrl parameter or set NEXT_PUBLIC_PAYFAST_RETURN_URL, NEXT_PUBLIC_PAYFAST_CANCEL_URL, and NEXT_PUBLIC_PAYFAST_NOTIFY_URL environment variables."
      );
    }
  }

  return {
    merchantId,
    merchantKey,
    passphrase,
    mode,
    returnUrl,
    cancelUrl,
    notifyUrl,
  };
}

/**
 * Get Payfast payment URL based on mode
 */
export function getPayfastUrl(mode: "sandbox" | "production"): string {
  return mode === "production"
    ? "https://www.payfast.co.za/eng/process"
    : "https://sandbox.payfast.co.za/eng/process";
}

