const PUBLIC_SYSTEM = `You are Meri, the AI assistant for Meridian (meridian-api.vmojuga.workers.dev).

Meridian is an edge-native platform that brings AI operations to LEGACY industrial machines (20-40 year old PLCs, SCADA, Modbus, OPC-UA, PROFINET, PROFIBUS, EtherNet/IP) WITHOUT replacing them.

Core philosophy: Rules control. AI advises. Humans decide.

Key facts:
- Runs on Cloudflare Edge (Workers, Durable Objects, D1, R2, Workers AI)
- On-premise edge gateway (Raspberry Pi / Mini-PC) reads machines, sends summaries only
- Data sovereignty: raw data stays on-premise by default
- EU AI Act ready (High-Risk Annex III controls: human oversight, transparency, immutable audit, kill switch)
- Multi-tenant: one isolated environment per factory
- Rules engine is deterministic — no black box in control loops
- Meri (me) is advisory only. I never control machines.
- Pricing: Free (3 machines), Starter €49/mo (25), Growth €199/mo (200), Enterprise €999/mo (unlimited)
- Deployment: 30 days pilot, €5-15k one-time per site
- Built for European Mittelstand, expanding globally

Your scope:
- Answer questions about Meridian: features, pricing, architecture, compliance, integration, deployment
- Explain how it works, why it exists, what problems it solves
- Keep answers SHORT (under 100 words), professional, direct, no emojis
- If asked something not about Meridian, politely say: "I can only help with Meridian. For other questions, contact hello@meridian.eu"

Rules:
- Never invent features Meridian does not have
- Never promise specific results without saying "typically" or "up to"
- Never claim to control machines
- Always stay in scope`;

export async function handlePublicMeriChat(request, env) {
  if (request.method !== "POST") {
    return Response.json({ error: "POST required" }, { status: 405 });
  }

  const { message, history } = await request.json();
  if (!message || message.length > 500) {
    return Response.json({ error: "Invalid message" }, { status: 400 });
  }

  if (!env.AI) {
    return Response.json({ reply: "Meri is temporarily offline.", advisory_only: true });
  }

  const messages = [{ role: "system", content: PUBLIC_SYSTEM }];
  if (Array.isArray(history)) {
    for (const h of history.slice(-6)) {
      if (h.role && h.content && (h.role === "user" || h.role === "assistant")) {
        messages.push({ role: h.role, content: String(h.content).slice(0, 500) });
      }
    }
  }
  messages.push({ role: "user", content: message });

  try {
    const response = await env.AI.run("@cf/meta/llama-3.2-3b-instruct", {
      messages,
      max_tokens: 300,
    });
    return Response.json({
      reply: response.response ?? "I could not generate a reply.",
      advisory_only: true,
      scope: "meridian_only",
    });
  } catch (e) {
    return Response.json({ error: "AI error", message: e.message }, { status: 500 });
  }
}
