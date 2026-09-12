/**
 * Thin client for the contact-form relay (supabase/functions/contact).
 *
 * Deliberately plain `fetch()`, not `@supabase/supabase-js` — that SDK is
 * lazy-loaded only for the Insights routes (see App.tsx) to keep it out of
 * the marketing site's main bundle. ContactSection renders on the eagerly
 * loaded homepage, so pulling the SDK in here would undo that.
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as
  | string
  | undefined;

export class ContactApiError extends Error {}

export interface ContactPayload {
  name: string;
  email: string;
  subject?: string;
  message: string;
  /** Honeypot — must stay empty. Real form fields never set this. */
  company?: string;
}

export function isContactConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

export async function submitContact(payload: ContactPayload): Promise<void> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new ContactApiError("Contact form is not configured.");
  }

  let res: Response;
  try {
    res = await fetch(`${SUPABASE_URL}/functions/v1/contact`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new ContactApiError(
      "Could not reach the server. Check your connection and try again.",
    );
  }

  let data: { ok?: boolean; error?: string } = {};
  try {
    data = await res.json();
  } catch {
    // non-JSON error body — fall through to the generic message below
  }

  if (!res.ok || !data.ok) {
    throw new ContactApiError(
      data.error || "Something went wrong sending your message.",
    );
  }
}
