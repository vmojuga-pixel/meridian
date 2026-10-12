import { MERI_SYSTEM_PROMPT } from "./prompts.js";

export async function askMeri(env, summary, question) {
  if (!env.AI) {
    return {
      reply: "LLM not configured. Enable Workers AI binding (AI) in wrangler.toml.",
      advisory_only: true,
      source: "meri",
    };
  }

  const context = JSON.stringify(summary, null, 2);

  const response = await env.AI.run("@cf/meta/llama-3.2-3b-instruct", {
    messages: [
      { role: "system", content: MERI_SYSTEM_PROMPT },
      { role: "user", content: `Tenant data:\n${context}\n\nQuestion: ${question}` },
    ],
    max_tokens: 400,
  });

  return {
    reply: response.response ?? "(no response)",
    advisory_only: true,
    source: "meri",
  };
}
