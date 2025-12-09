/**
 * Payfast URL configuration
 * These paths are relative and will be combined with the request base URL
 */
export const PAYFAST_URL_PATHS = {
  return: "/payment/success",
  cancel: "/payment/cancel",
  notify: "/api/payment/itn",
} as const;

/**
 * Build Payfast URLs from a base URL
 */
export function buildPayfastUrls(baseUrl: string | URL) {
  const base = typeof baseUrl === "string" ? new URL(baseUrl) : baseUrl;
  const origin = `${base.protocol}//${base.host}`;

  return {
    returnUrl: `${origin}${PAYFAST_URL_PATHS.return}`,
    cancelUrl: `${origin}${PAYFAST_URL_PATHS.cancel}`,
    notifyUrl: `${origin}${PAYFAST_URL_PATHS.notify}`,
  };
}

