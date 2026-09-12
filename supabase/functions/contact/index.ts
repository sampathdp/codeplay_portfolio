// Supabase Edge Function: forwards the marketing-site contact forms
// (ContactSection on Home, and the /contact page) to Resend as an email —
// the browser never sees the Resend API key.
//
// Deploy:
//   supabase functions deploy contact --project-ref <ref>
//   supabase secrets set RESEND_API_KEY=re_xxx --project-ref <ref>
//
// Called from the client as:
//   POST {VITE_SUPABASE_URL}/functions/v1/contact
//   Headers: apikey / Authorization: Bearer {VITE_SUPABASE_ANON_KEY}
//   Body: { name, email, subject?, message }

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_ADDRESS = "CodePlay Studios <info@codeplaystudios.com>";
const TO_ADDRESS = "info@codeplaystudios.com";

// Same-origin marketing site + local dev — everything else is refused.
const ALLOWED_ORIGINS = new Set([
  "https://codeplaystudios.com",
  "https://www.codeplaystudios.com",
  "http://localhost:5173",
]);

function corsHeaders(origin: string | null): Record<string, string> {
  const allowOrigin = origin && ALLOWED_ORIGINS.has(origin) ? origin : "https://codeplaystudios.com";
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
}

function json(body: unknown, status: number, origin: string | null) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
  });
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_FIELD_LEN = 200;
const MAX_MESSAGE_LEN = 5000;

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }
  if (req.method !== "POST") {
    return json({ ok: false, error: "Method not allowed" }, 405, origin);
  }
  if (!RESEND_API_KEY) {
    console.error("contact: RESEND_API_KEY is not set");
    return json({ ok: false, error: "Contact form is not configured" }, 500, origin);
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ ok: false, error: "Invalid request body" }, 400, origin);
  }

  // Honeypot: a real visitor never fills the hidden "company" field.
  if (typeof body.company === "string" && body.company.trim() !== "") {
    return json({ ok: true }, 200, origin); // pretend success, drop silently
  }

  const name = String(body.name ?? "").trim().slice(0, MAX_FIELD_LEN);
  const email = String(body.email ?? "").trim().slice(0, MAX_FIELD_LEN);
  const subject = String(body.subject ?? "Project Inquiry").trim().slice(0, MAX_FIELD_LEN) || "Project Inquiry";
  const message = String(body.message ?? "").trim().slice(0, MAX_MESSAGE_LEN);

  if (!name || !email || !message) {
    return json({ ok: false, error: "Name, email, and message are required" }, 400, origin);
  }
  if (!EMAIL_RE.test(email)) {
    return json({ ok: false, error: "Enter a valid email address" }, 400, origin);
  }

  const resendResp = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_ADDRESS,
      to: [TO_ADDRESS],
      reply_to: email,
      subject: `[Website] ${subject} — ${name}`,
      text: `${message}\n\n—\nFrom: ${name} <${email}>\nSubject/Service: ${subject}`,
    }),
  });

  if (!resendResp.ok) {
    const detail = await resendResp.text().catch(() => "");
    console.error("contact: Resend error", resendResp.status, detail);
    return json({ ok: false, error: "Failed to send — please email us directly" }, 502, origin);
  }

  return json({ ok: true }, 200, origin);
});
