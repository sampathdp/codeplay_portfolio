// Supabase Edge Function: forwards the marketing-site contact forms
// (ContactSection on Home, and the /contact page) to Resend as email —
// the browser never sees the Resend API key.
//
// Sends two emails per submission:
//   1. Internal notification -> TO_ADDRESS, reply-to the visitor.
//   2. Branded auto-reply -> the visitor, confirming receipt.
// #2 is best-effort: if it fails, the submission still succeeds (the lead
// is captured either way) — only #1 failing fails the whole request.
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
const SITE_URL = "https://codeplaystudios.com";
const BRAND_COLOR = "#0ea5e9"; // matches --primary (hsl(199 89% 48%)) in client/src/index.css
const DARK_BG = "#0f172a"; // matches the site's dark theme background

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

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Turns plain-text newlines into <br> after escaping — never trust raw HTML from form input. */
function escapeMultiline(s: string): string {
  return escapeHtml(s).replace(/\n/g, "<br>");
}

/** Shared email chrome: dark brand header + light card body, table-based for client compatibility. */
function emailShell(headerLabel: string, bodyHtml: string): string {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
            <tr>
              <td style="background:${DARK_BG};padding:24px 32px;">
                <span style="color:#ffffff;font-size:18px;font-weight:700;letter-spacing:-0.02em;">CodePlay Studios</span>
                <div style="color:${BRAND_COLOR};font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;margin-top:4px;">${escapeHtml(headerLabel)}</div>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;color:#1e293b;font-size:15px;line-height:1.6;">
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;color:#94a3b8;font-size:12px;">
                CodePlay Studios · Panadura, Sri Lanka · <a href="${SITE_URL}" style="color:#94a3b8;">codeplaystudios.com</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function fieldRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:6px 0;color:#64748b;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;width:110px;vertical-align:top;">${escapeHtml(label)}</td>
    <td style="padding:6px 0;color:#1e293b;font-size:14px;">${escapeHtml(value)}</td>
  </tr>`;
}

function renderNotificationEmail(name: string, email: string, subject: string, message: string) {
  const html = emailShell(
    "New Website Inquiry",
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
      ${fieldRow("Name", name)}
      ${fieldRow("Email", email)}
      ${fieldRow("Subject", subject)}
    </table>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px 20px;color:#334155;white-space:normal;">
      ${escapeMultiline(message)}
    </div>
    <p style="margin:20px 0 0;color:#94a3b8;font-size:13px;">Reply to this email to respond directly to ${escapeHtml(name)}.</p>`,
  );
  const text = `New website inquiry\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\n\n${message}\n\n— Reply to this email to respond directly to ${name}.`;
  return { html, text };
}

function renderAutoReplyEmail(name: string, subject: string, message: string) {
  const firstName = name.split(" ")[0] || name;
  const html = emailShell(
    "Message Received",
    `<p style="margin:0 0 16px;font-size:16px;">Hi ${escapeHtml(firstName)},</p>
    <p style="margin:0 0 16px;">Thanks for reaching out to CodePlay Studios — we've received your message and will get back to you <strong>within 24 hours</strong>.</p>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-left:3px solid ${BRAND_COLOR};border-radius:8px;padding:16px 20px;margin:20px 0;color:#475569;font-size:14px;">
      <div style="color:#94a3b8;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;margin-bottom:8px;">Your message</div>
      <div style="color:#64748b;font-size:12px;margin-bottom:6px;"><strong>${escapeHtml(subject)}</strong></div>
      ${escapeMultiline(message)}
    </div>
    <p style="margin:0 0 8px;">In the meantime, feel free to look through some of our recent work:</p>
    <p style="margin:0 0 24px;"><a href="${SITE_URL}/case-studies" style="color:${BRAND_COLOR};font-weight:600;text-decoration:none;">View Case Studies →</a></p>
    <p style="margin:0;color:#64748b;font-size:14px;">— The CodePlay Studios Team</p>`,
  );
  const text = `Hi ${firstName},\n\nThanks for reaching out to CodePlay Studios — we've received your message and will get back to you within 24 hours.\n\nYour message (${subject}):\n${message}\n\nIn the meantime, check out our work: ${SITE_URL}/case-studies\n\n— The CodePlay Studios Team`;
  return { html, text };
}

async function sendEmail(payload: {
  from: string;
  to: string[];
  replyTo?: string;
  subject: string;
  html: string;
  text: string;
}): Promise<{ ok: boolean; status: number; detail?: string }> {
  const resp = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: payload.from,
      to: payload.to,
      reply_to: payload.replyTo,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    }),
  });
  if (!resp.ok) {
    const detail = await resp.text().catch(() => "");
    return { ok: false, status: resp.status, detail };
  }
  return { ok: true, status: resp.status };
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

  const notification = renderNotificationEmail(name, email, subject, message);
  const primary = await sendEmail({
    from: FROM_ADDRESS,
    to: [TO_ADDRESS],
    replyTo: email,
    subject: `[Website] ${subject} — ${name}`,
    html: notification.html,
    text: notification.text,
  });

  if (!primary.ok) {
    console.error("contact: Resend error (notification)", primary.status, primary.detail);
    return json({ ok: false, error: "Failed to send — please email us directly" }, 502, origin);
  }

  // Best-effort — the lead is already captured above, so a failure here
  // (e.g. the visitor's own mail server rejecting us) shouldn't surface
  // as an error to them.
  const autoReply = renderAutoReplyEmail(name, subject, message);
  const secondary = await sendEmail({
    from: FROM_ADDRESS,
    to: [email],
    replyTo: TO_ADDRESS,
    subject: "We've received your message — CodePlay Studios",
    html: autoReply.html,
    text: autoReply.text,
  });
  if (!secondary.ok) {
    console.error("contact: Resend error (auto-reply)", secondary.status, secondary.detail);
  }

  return json({ ok: true }, 200, origin);
});
