"use client";

const SESSION_COOKIE = "__session";
const SESSION_MAX_AGE_SECONDS = 60 * 60;

function clientCookieFlags(): string {
  const isSecure = typeof window !== "undefined" && window.location.protocol === "https:";
  return `path=/; max-age=${SESSION_MAX_AGE_SECONDS}; SameSite=Lax${isSecure ? "; Secure" : ""}`;
}

function writeClientSessionCookie(token: string) {
  document.cookie = `${SESSION_COOKIE}=${token}; ${clientCookieFlags()}`;
}

function clearClientSessionCookie() {
  const isSecure = typeof window !== "undefined" && window.location.protocol === "https:";
  document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0; SameSite=Lax${isSecure ? "; Secure" : ""}`;
}

/**
 * Persist the Firebase ID token so middleware can authorize /read/* navigations.
 * Prefers an HttpOnly cookie from the session API; falls back to a client cookie.
 */
export async function persistSessionCookie(token: string): Promise<void> {
  writeClientSessionCookie(token);

  try {
    const response = await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
      credentials: "same-origin",
    });

    if (!response.ok) {
      console.error("Failed to persist HttpOnly session cookie:", response.status);
      return;
    }

    // HttpOnly cookie is now set; drop the JS-visible duplicate.
    clearClientSessionCookie();
  } catch (error) {
    console.error("Failed to persist HttpOnly session cookie:", error);
  }
}

export async function clearSessionCookie(): Promise<void> {
  clearClientSessionCookie();

  try {
    await fetch("/api/auth/session", {
      method: "DELETE",
      credentials: "same-origin",
    });
  } catch (error) {
    console.error("Failed to clear HttpOnly session cookie:", error);
  }
}
