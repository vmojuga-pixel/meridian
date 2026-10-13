const SAFE_PROMPT = `You are Meri, the public assistant for Meridian.

SCOPE — answer ONLY about Meridian: what it is, what it does, philosophy, compliance, deployment, pricing, integration, safety, data handling, industries served.

RULES:
1. NEVER mention any of these terms: Cloudflare, Workers, Durable Objects, D1, R2, KV, Workers AI, Raspberry Pi, Llama, SQLite, Postgres, Redis, Node, JavaScript, TypeScript, Docker, Kubernetes. NEVER name any cloud provider, framework, database, or AI model. If the user asks, reply only: "That detail is shared during technical evaluation."
2. NEVER list specific industrial protocols (Modbus, OPC-UA, PROFINET, PROFIBUS, EtherNet/IP). Say only "industrial protocols in common use."
3. NEVER describe internal architecture, storage, or infrastructure.
2. Refer to architecture only in corporate terms: "our platform", "our operational layer", "our data governance", "our intelligence layer".
3. Keep answers under 90 words.
4. Professional tone. No emojis. No hype. No exclamation marks.
5. If asked about internal implementation, reply: "That level of detail is shared during a technical evaluation with our team."
6. If asked something outside Meridian: "I can only help with Meridian. Contact hello@meridian.eu for other questions."
7. Never invent features. Use only the knowledge base context provided.
8. Never promise specific financial results. Say "typically" or "in pilot deployments".

FORMAT: 1–3 short paragraphs. Plain prose. No bullet spam.`;


const BANNED = [
  "cloudflare", "workers ai", "workers", "durable objects", "durable object",
  "d1", "r2", "kv", "workers api", "raspberry pi", "llama", "meta llama",
  "sqlite", "postgres", "redis", "node.js", "javascript", "typescript",
  "v8", "isolate", "edge worker", "serverless", "kubernetes", "docker"
];

function sanitize(text) {
  if (!text) return text;
  let out = text;
  const lower = out.toLowerCase();
  for (const term of BANNED) {
    if (lower.includes(term)) {
      // Remove sentence containing banned term
      const sentences = out.split(/(?<=[.!?])\s+/);
      out = sentences.filter(s => !s.toLowerCase().includes(term)).join(" ");
    }
  }
  // Collapse spaces
  out = out.replace(/\s+/g, " ").trim();
  if (!out) out = "I can only share what is publicly documented. For technical detail, contact hello@meridian.eu.";
  return out;
}

async function loadKB(env) {
  try {
    const rows = await env.DB.prepare(
      "SELECT topic, question, answer FROM public_kb ORDER BY priority DESC LIMIT 30"
    ).all();
    return rows.results || [];
  } catch (e) {
    return [];
  }
}

export async function handlePublicMeriChat(request, env) {
  if (request.method !== "POST") {
    return Response.json({ error: "POST required" }, { status: 405 });
  }

  // Rate limit by IP: 20 messages / hour
  const ip = request.headers.get("CF-Connecting-IP") || "anon";
  const rlKey = "rl:meri:public:" + ip;
  const now = Math.floor(Date.now() / 1000);
  const raw = await env.KV.get(rlKey, "json");
  if (raw && now - raw.start < 3600 && raw.count >= 20) {
    return Response.json({ error: "Rate limit reached. Try again later.", retry_after: 3600 - (now - raw.start) }, { status: 429 });
  }
  if (!raw || now - raw.start >= 3600) {
    await env.KV.put(rlKey, JSON.stringify({ count: 1, start: now }), { expirationTtl: 3600 });
  } else {
    await env.KV.put(rlKey, JSON.stringify({ count: raw.count + 1, start: raw.start }), { expirationTtl: 3600 });
  }

  const { message, history } = await request.json();
  if (!message || typeof message !== "string" || message.length > 400) {
    return Response.json({ error: "Invalid message" }, { status: 400 });
  }

  if (!env.AI) {
    return Response.json({ reply: "Meri is temporarily offline.", advisory_only: true });
  }

  // Load KB as context
  const kb = await loadKB(env);
  const kbText = kb.map(k => "Q: " + k.question + "\nA: " + k.answer).join("\n\n");

  const messages = [
    { role: "system", content: SAFE_PROMPT + "\n\nKNOWLEDGE BASE:\n" + kbText },
  ];

  if (Array.isArray(history)) {
    for (const h of history.slice(-4)) {
      if (h.role && h.content && (h.role === "user" || h.role === "assistant")) {
        messages.push({ role: h.role, content: String(h.content).slice(0, 400) });
      }
    }
  }
  messages.push({ role: "user", content: message });

  try {
    const response = await env.AI.run("@cf/meta/llama-3.2-3b-instruct", {
      messages,
      max_tokens: 220,
    });
    const raw = response.response ?? "I could not generate a reply.";
    const safe = sanitize(raw);
    return Response.json({
      reply: safe,
      advisory_only: true,
      scope: "meridian_only",
    });
  } catch (e) {
    return Response.json({ error: "AI error" }, { status: 500 });
  }
}
