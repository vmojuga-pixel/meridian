async function sendViaBrevo(env, { to, factoryName, verifyUrl, from }) {
  const key = env.BREVO_API_KEY;
  if (!key) return { ok: false, reason: "no_brevo_key" };

  const html = renderHtml(factoryName, verifyUrl);
  const r = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": key, "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify({
      sender: { email: from, name: "Meridian" },
      to: [{ email: to }],
      subject: "Verify your Meridian account",
      htmlContent: html,
    }),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) return { ok: false, provider: "brevo", status: r.status, error: j };
  return { ok: true, provider: "brevo", messageId: j.messageId };
}

async function sendViaMailtrap(env, { to, factoryName, verifyUrl, from }) {
  const token = env.MAILTRAP_TOKEN;
  if (!token) return { ok: false, reason: "no_mailtrap_token" };

  const html = renderHtml(factoryName, verifyUrl);
  const inboxId = env.MAILTRAP_INBOX_ID || "default";
  const endpoint = `https://sandbox.api.mailtrap.io/api/send/${inboxId}`;

  const r = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Api-Token": token,
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify({
      from: { email: from, name: "Meridian" },
      to: [{ email: to }],
      subject: "Verify your Meridian account",
      html,
      category: "verify",
    }),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) return { ok: false, provider: "mailtrap", status: r.status, error: j };
  return { ok: true, provider: "mailtrap", messageId: j.message_ids?.[0] };
}

export async function sendVerifyEmail(env, { to, factoryName, verifyUrl }) {
  const from = env.EMAIL_FROM || "noreply@meridian.local";
  const attempts = [];

  if (env.BREVO_API_KEY) {
    const a = await sendViaBrevo(env, { to, factoryName, verifyUrl, from });
    attempts.push(a);
    if (a.ok) return a;
  }

  console.error("All email providers failed:", attempts);
  return { ok: false, attempts };
}

function renderHtml(factoryName, verifyUrl) {
  return `<!DOCTYPE html><html><body style="font-family:-apple-system,sans-serif;background:#0a0a0a;color:#e5e5e5;padding:40px 20px;">
<div style="max-width:520px;margin:0 auto;background:#141414;border:1px solid #262626;border-radius:12px;padding:40px;">
  <div style="font-size:12px;letter-spacing:3px;text-transform:uppercase;color:#737373;margin-bottom:8px;">Meridian</div>
  <h1 style="font-size:24px;margin:0 0 16px;">Verify your email</h1>
  <p style="color:#a3a3a3;line-height:1.6;margin-bottom:24px;">Welcome, ${factoryName}. Click the button below to verify your Meridian account.</p>
  <a href="${verifyUrl}" style="display:inline-block;background:#e5e5e5;color:#0a0a0a;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">Verify email</a>
  <p style="color:#525252;font-size:13px;margin-top:32px;">If you did not create this account, ignore this email.</p>
</div></body></html>`;
}
