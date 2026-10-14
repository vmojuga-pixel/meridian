export const LANDING_HTML = `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Meridian — Deterministic AI for Legacy Industry</title>
<script src="https://cdn.tailwindcss.com"></script>
<script>
tailwind.config = {
  darkMode: 'class',
  theme: { extend: {
    colors: { ink: { 950:'#0a0a0a', 900:'#111111', 800:'#1a1a1a', 700:'#262626', 600:'#404040' } }
  }}
}
</script>
<style>
  html { scroll-behavior: smooth; }
  body { -webkit-font-smoothing: antialiased; }
  .grid-bg {
    background-image: linear-gradient(rgba(255,255,255,.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.02) 1px, transparent 1px);
    background-size: 48px 48px;
  }
</style>
</head>
<body class="bg-ink-950 text-neutral-200 font-sans">

<header class="fixed top-0 inset-x-0 z-50 border-b border-white/5 backdrop-blur-xl bg-ink-950/70">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
    <a href="/" class="font-mono text-sm tracking-[0.3em] uppercase text-neutral-300">Meridian</a>
    <nav class="hidden md:flex items-center gap-8 text-sm text-neutral-500">
      <a href="#product" class="hover:text-neutral-100 transition">Product</a>
      <a href="#principles" class="hover:text-neutral-100 transition">Principles</a>
      <a href="#compliance" class="hover:text-neutral-100 transition">Compliance</a>
    </nav>
    <div class="flex items-center gap-3">
      <a href="/login" class="text-sm text-neutral-400 hover:text-neutral-100 transition">Login</a>
      <a href="/signup" class="text-sm px-4 py-2 rounded-lg bg-white text-black font-medium hover:bg-neutral-200 transition">Get started</a>
    </div>
  </div>
</header>

<section class="relative pt-32 sm:pt-40 pb-20 sm:pb-32 grid-bg border-b border-white/5">
  <div class="max-w-6xl mx-auto px-6">
    <div class="inline-flex items-center gap-2 text-xs font-mono tracking-widest uppercase text-neutral-500 border border-white/10 rounded-full px-4 py-1.5 mb-8">
      <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>
      Edge-native · EU AI Act ready
    </div>
    <h1 class="text-4xl sm:text-5xl md:text-7xl font-semibold tracking-tight leading-[1.1] max-w-4xl mb-8">
      Deterministic intelligence for <span class="text-neutral-500">legacy industrial systems.</span>
    </h1>
    <p class="text-lg md:text-xl text-neutral-400 max-w-2xl leading-relaxed mb-12">
      Meridian bridges Modbus, OPC-UA, and Serial with modern AI operations — without replacing your existing infrastructure. Edge-native. Multi-tenant. Auditable.
    </p>
    <div class="flex flex-wrap items-center gap-4">
      <a href="/signup" class="px-6 py-3.5 rounded-lg bg-white text-black font-medium text-sm hover:bg-neutral-200 transition">Get started free</a>
      <a href="/login" class="px-6 py-3.5 rounded-lg border border-white/10 text-sm hover:border-white/25 transition">Login</a>
    </div>
  </div>
</section>

<section id="product" class="py-28 border-b border-white/5">
  <div class="max-w-6xl mx-auto px-6">
    <div class="text-xs font-mono tracking-[0.3em] uppercase text-neutral-600 mb-4">Product</div>
    <h2 class="text-3xl md:text-4xl font-semibold tracking-tight max-w-2xl mb-16">
      Rules control. AI advises. Humans decide.
    </h2>
    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5 rounded-xl overflow-hidden border border-white/5">
      <div class="bg-ink-950 p-8 hover:bg-ink-900 transition">
        <div class="font-mono text-xs text-neutral-600 mb-6">01</div>
        <h3 class="font-semibold mb-2">Rules Engine</h3>
        <p class="text-sm text-neutral-500 leading-relaxed">Deterministic evaluation. Temperature, power, machine state. Every decision logged with reason.</p>
      </div>
      <div class="bg-ink-950 p-8 hover:bg-ink-900 transition">
        <div class="font-mono text-xs text-neutral-600 mb-6">02</div>
        <h3 class="font-semibold mb-2">Edge Gateway</h3>
        <p class="text-sm text-neutral-500 leading-relaxed">Runs on-premise. Reads industrial equipment via Modbus, OPC-UA, Serial. Store-and-forward when offline.</p>
      </div>
      <div class="bg-ink-950 p-8 hover:bg-ink-900 transition">
        <div class="font-mono text-xs text-neutral-600 mb-6">03</div>
        <h3 class="font-semibold mb-2">Multi-Tenant</h3>
        <p class="text-sm text-neutral-500 leading-relaxed">Isolated environment per factory. Separate data, rules, and audit trail.</p>
      </div>
      <div class="bg-ink-950 p-8 hover:bg-ink-900 transition">
        <div class="font-mono text-xs text-neutral-600 mb-6">04</div>
        <h3 class="font-semibold mb-2">Guardrails</h3>
        <p class="text-sm text-neutral-500 leading-relaxed">Rate limits, kill switch, human override. Machines never run without oversight.</p>
      </div>
      <div class="bg-ink-950 p-8 hover:bg-ink-900 transition">
        <div class="font-mono text-xs text-neutral-600 mb-6">05</div>
        <h3 class="font-semibold mb-2">Immutable Audit</h3>
        <p class="text-sm text-neutral-500 leading-relaxed">Every command recorded. Append-only. Auditor-ready for EU compliance.</p>
      </div>
      <div class="bg-ink-950 p-8 hover:bg-ink-900 transition">
        <div class="font-mono text-xs text-neutral-600 mb-6">06</div>
        <h3 class="font-semibold mb-2">Meri</h3>
        <p class="text-sm text-neutral-500 leading-relaxed">AI advisor. Summarizes, explains, suggests. Never controls machines. Advisory only.</p>
      </div>
    </div>
  </div>
</section>

<section id="principles" class="py-28 border-b border-white/5">
  <div class="max-w-6xl mx-auto px-6">
    <div class="text-xs font-mono tracking-[0.3em] uppercase text-neutral-600 mb-4">Principles</div>
    <h2 class="text-3xl md:text-4xl font-semibold tracking-tight max-w-2xl mb-16">
      Built on restraint, not hype.
    </h2>
    <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
      <div>
        <h3 class="font-semibold mb-3 text-sm">Deterministic first</h3>
        <p class="text-sm text-neutral-500 leading-relaxed">LLMs do not touch control loops. Rules do. No black box in safety-critical paths.</p>
      </div>
      <div>
        <h3 class="font-semibold mb-3 text-sm">Data sovereignty</h3>
        <p class="text-sm text-neutral-500 leading-relaxed">Factory data stays on-premise by default. Only summaries sync, and only when you allow it.</p>
      </div>
      <div>
        <h3 class="font-semibold mb-3 text-sm">Edge-native</h3>
        <p class="text-sm text-neutral-500 leading-relaxed">No servers to manage. Auto-scales from one factory to thousands.</p>
      </div>
      <div>
        <h3 class="font-semibold mb-3 text-sm">Auditable by design</h3>
        <p class="text-sm text-neutral-500 leading-relaxed">Every action has a reason. Every reason is logged. Nothing is hidden.</p>
      </div>
    </div>
  </div>
</section>

<section id="compliance" class="py-28 border-b border-white/5">
  <div class="max-w-6xl mx-auto px-6">
    <div class="text-xs font-mono tracking-[0.3em] uppercase text-neutral-600 mb-4">Compliance</div>
    <h2 class="text-3xl md:text-4xl font-semibold tracking-tight max-w-2xl mb-16">
      Built for the EU AI Act.
    </h2>
    <div class="grid lg:grid-cols-2 gap-16">
      <ul class="space-y-1">
        <li class="flex items-start gap-4 py-4 border-b border-white/5">
          <span class="text-green-500 mt-0.5">+</span>
          <span class="text-sm text-neutral-300">Human oversight on every rule</span>
        </li>
        <li class="flex items-start gap-4 py-4 border-b border-white/5">
          <span class="text-green-500 mt-0.5">+</span>
          <span class="text-sm text-neutral-300">Transparency with reason fields</span>
        </li>
        <li class="flex items-start gap-4 py-4 border-b border-white/5">
          <span class="text-green-500 mt-0.5">+</span>
          <span class="text-sm text-neutral-300">Immutable record-keeping</span>
        </li>
        <li class="flex items-start gap-4 py-4 border-b border-white/5">
          <span class="text-green-500 mt-0.5">+</span>
          <span class="text-sm text-neutral-300">Risk management with kill switch</span>
        </li>
        <li class="flex items-start gap-4 py-4 border-b border-white/5">
          <span class="text-green-500 mt-0.5">+</span>
          <span class="text-sm text-neutral-300">Data governance on-premise</span>
        </li>
        <li class="flex items-start gap-4 py-4 border-b border-white/5">
          <span class="text-green-500 mt-0.5">+</span>
          <span class="text-sm text-neutral-300">Technical documentation included</span>
        </li>
      </ul>
      <div class="space-y-6 text-sm text-neutral-500 leading-relaxed">
        <p>Meridian is classified as High-Risk AI under Annex III when used in industrial safety contexts. Controls are in place to meet Chapter III requirements.</p>
        <p>LLM usage is advisory only. Meri cannot send commands, cannot change rules, cannot bypass guardrails.</p>
        <div class="p-6 rounded-xl bg-ink-900 border border-white/5">
          <div class="font-mono text-xs text-neutral-600 mb-2">CLASSIFICATION</div>
          <div class="text-neutral-200 font-medium">High-Risk · Annex III</div>
        </div>
      </div>
    </div>
  </div>
</section>

<footer class="py-16">
  <div class="max-w-6xl mx-auto px-6 flex flex-wrap items-center justify-between gap-6 text-sm text-neutral-600">
    <div class="font-mono tracking-widest">MERIDIAN · © 2026</div>
    <div class="flex items-center gap-6">
      <a href="/dashboard" class="hover:text-neutral-300 transition">Dashboard</a>
      <a href="/health" class="hover:text-neutral-300 transition">Status</a>
      <a href="https://github.com/vmojuga-pixel/meridian" class="hover:text-neutral-300 transition">GitHub</a>
    </div>
  </div>
</footer>


<!-- Meri Inline Chatbox -->
<section id="ask-meri" style="padding:80px 24px 100px;border-bottom:1px solid rgba(255,255,255,0.05);">
  <div style="max-width:640px;margin:0 auto 32px;">
    <div style="font-family:ui-monospace,monospace;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#525252;margin-bottom:12px;">Ask Meri</div>
    <h2 style="font-size:32px;font-weight:600;letter-spacing:-0.5px;margin-bottom:12px;">Questions? Ask Meri.</h2>
    <p style="color:#737373;font-size:15px;line-height:1.5;">Meri knows Meridian inside-out. Features, pricing, architecture, compliance. Ask anything.</p>
  </div>
<div id="meri-panel" style="display:flex;width:100%;max-width:640px;height:520px;background:#141414;border:1px solid #262626;border-radius:16px;flex-direction:column;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.4);margin:0 auto;">
  <div style="padding:14px 16px;border-bottom:1px solid #262626;display:flex;align-items:center;gap:8px;flex-shrink:0;">
    <div style="font-weight:600;font-size:14px;">Meri</div>
    <div style="font-size:11px;color:#737373;margin-left:auto;font-family:ui-monospace,monospace;">meridian assistant</div>
    
  </div>
  <div id="meri-msgs" style="flex:1;overflow-y:auto;padding:14px 16px;display:flex;flex-direction:column;gap:10px;">
    <div style="background:#1a1a1a;border:1px solid #262626;border-radius:10px;padding:10px 13px;font-size:13px;color:#d4d4d4;line-height:1.5;max-width:90%;">Hi. I can explain Meridian — features, pricing, architecture, compliance. Ask me anything.</div>
  </div>
  <form id="meri-form" style="padding:12px;border-top:1px solid #262626;display:flex;gap:8px;flex-shrink:0;">
    <input id="meri-input" type="text" placeholder="Ask about Meridian..." autocomplete="off" required style="flex:1;padding:10px 12px;background:#0a0a0a;border:1px solid #262626;border-radius:8px;color:#e5e5e5;font-size:13px;outline:none;">
    <button type="submit" id="meri-send" style="padding:10px 14px;background:#e5e5e5;color:#0a0a0a;border:none;border-radius:8px;font-weight:600;font-size:13px;cursor:pointer;">Send</button>
  </form>
</div>
</section>

<script>
(function(){
  const form = document.getElementById("meri-form");
  const input = document.getElementById("meri-input");
  const msgs = document.getElementById("meri-msgs");
  const send = document.getElementById("meri-send");
  let history = [];

  function add(text, who){
    const d = document.createElement("div");
    const base = "border-radius:10px;padding:10px 13px;font-size:13px;line-height:1.5;max-width:90%;white-space:pre-wrap;";
    d.style.cssText = base + (who === "user"
      ? "background:#1d4ed8;color:#fff;align-self:flex-end;"
      : "background:#1a1a1a;border:1px solid #262626;color:#d4d4d4;align-self:flex-start;");
    d.textContent = text;
    msgs.appendChild(d);
    msgs.scrollTop = msgs.scrollHeight;
    return d;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    add(text, "user");
    input.value = "";
    send.disabled = true;
    const loading = add("...", "meri");
    try {
      const r = await fetch("/api/meri/public", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history })
      });
      const j = await r.json();
      loading.textContent = j.reply || j.error || "No reply.";
      history.push({ role: "user", content: text });
      history.push({ role: "assistant", content: loading.textContent });
      history = history.slice(-6);
    } catch (err) {
      loading.textContent = "Error: " + err.message;
    } finally {
      send.disabled = false;
      input.focus();
    }
  });
})();
</script>

</body>
</html>`;
