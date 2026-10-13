export const ONBOARDING_HTML = `<!DOCTYPE html>
<html lang="en" class="dark"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Onboarding — Meridian</title>
<script src="https://cdn.tailwindcss.com"></script>
<script>tailwind.config={darkMode:'class',theme:{extend:{colors:{ink:{950:'#0a0a0a',900:'#111111',800:'#1a1a1a',700:'#262626'}}}}}</script>
<style>body{-webkit-font-smoothing:antialiased}</style>
</head>
<body class="bg-ink-950 text-neutral-200 font-sans min-h-screen flex flex-col">
<header class="border-b border-white/5 px-6 h-14 flex items-center justify-between">
  <a href="/" class="font-mono text-xs tracking-[0.3em] uppercase text-neutral-400">Meridian</a>
  <button id="logout" class="text-xs text-neutral-500 hover:text-red-400 transition">Logout</button>
</header>
<main class="flex-1 flex items-center justify-center p-6">
<div class="w-full max-w-2xl">
  <div class="text-xs font-mono tracking-[0.3em] uppercase text-neutral-600 mb-3">Step <span id="step-num">1</span> of 3</div>
  <h1 class="text-3xl font-semibold tracking-tight mb-2" id="step-title">Factory details</h1>
  <p class="text-sm text-neutral-500 mb-8" id="step-sub">Tell us about your facility.</p>

  <form id="step-form" class="space-y-4">
    <div id="step-1">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label class="block text-xs text-neutral-500 mb-1.5">Factory name</label>
        <input name="factory_name" required class="w-full px-3.5 py-2.5 bg-ink-900 border border-white/10 rounded-lg text-sm outline-none focus:border-white/30"></div>
        <div><label class="block text-xs text-neutral-500 mb-1.5">Country</label>
        <input name="country" placeholder="e.g. Germany" class="w-full px-3.5 py-2.5 bg-ink-900 border border-white/10 rounded-lg text-sm outline-none focus:border-white/30"></div>
        <div><label class="block text-xs text-neutral-500 mb-1.5">Industry</label>
        <input name="industry" placeholder="e.g. Automotive" class="w-full px-3.5 py-2.5 bg-ink-900 border border-white/10 rounded-lg text-sm outline-none focus:border-white/30"></div>
        <div><label class="block text-xs text-neutral-500 mb-1.5">Default protocol</label>
        <select name="default_protocol" class="w-full px-3.5 py-2.5 bg-ink-900 border border-white/10 rounded-lg text-sm outline-none focus:border-white/30">
          <option value="modbus">Modbus</option>
          <option value="opcua">OPC-UA</option>
          <option value="profinet">Profinet</option>
          <option value="serial">Serial</option>
        </select></div>
      </div>
    </div>

    <div id="step-2" class="hidden">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label class="block text-xs text-neutral-500 mb-1.5">Machine name</label>
        <input name="machine_name" placeholder="e.g. Press-01" class="w-full px-3.5 py-2.5 bg-ink-900 border border-white/10 rounded-lg text-sm outline-none focus:border-white/30"></div>
        <div><label class="block text-xs text-neutral-500 mb-1.5">Brand</label>
        <input name="machine_brand" placeholder="e.g. Siemens" class="w-full px-3.5 py-2.5 bg-ink-900 border border-white/10 rounded-lg text-sm outline-none focus:border-white/30"></div>
        <div><label class="block text-xs text-neutral-500 mb-1.5">Model</label>
        <input name="machine_model" class="w-full px-3.5 py-2.5 bg-ink-900 border border-white/10 rounded-lg text-sm outline-none focus:border-white/30"></div>
        <div><label class="block text-xs text-neutral-500 mb-1.5">Protocol</label>
        <select name="machine_protocol" class="w-full px-3.5 py-2.5 bg-ink-900 border border-white/10 rounded-lg text-sm outline-none focus:border-white/30">
          <option value="modbus">Modbus</option>
          <option value="opcua">OPC-UA</option>
          <option value="profinet">Profinet</option>
          <option value="serial">Serial</option>
        </select></div>
      </div>
    </div>

    <div id="step-3" class="hidden">
      <div class="p-6 rounded-xl bg-ink-900 border border-white/10">
        <div class="text-sm text-neutral-300 mb-4">Your API key will be generated. Paste it into your edge gateway.</div>
        <div id="api-key-box" class="hidden">
          <div class="bg-ink-950 border border-white/10 rounded-lg p-3 font-mono text-xs break-all text-green-400" id="api-key-value"></div>
          <button type="button" id="copy-key" class="mt-3 w-full py-2 border border-white/10 rounded-lg text-sm hover:border-white/25">Copy key</button>
        </div>
      </div>
    </div>

    <div id="msg" class="text-sm text-center"></div>
    <div class="flex gap-2 pt-2">
      <button type="button" id="back-btn" class="hidden flex-1 py-2.5 border border-white/10 rounded-lg text-sm hover:border-white/25">Back</button>
      <button type="submit" id="next-btn" class="flex-1 py-2.5 bg-white text-black rounded-lg font-medium text-sm hover:bg-neutral-200 transition">Continue</button>
    </div>
  </form>
</div>
</main>
<script>
const $ = (id) => document.getElementById(id);
let step = 1;
let csrf = sessionStorage.getItem('csrf') || '';
let apiKey = null;

$('logout').addEventListener('click', async () => {
  await fetch('/api/auth/logout', { method: 'POST', headers: { 'X-CSRF-Token': csrf } });
  sessionStorage.removeItem('csrf');
  location.href = '/login';
});

async function loadMe() {
  const r = await fetch('/api/auth/me', { headers: { 'X-CSRF-Token': csrf } });
  if (r.status === 401 || r.status === 403) { location.href = '/login'; return; }
  const j = await r.json();
  csrf = j.csrf_token;
  sessionStorage.setItem('csrf', csrf);
  if (j.tenant && j.tenant.factory_name) {
    document.querySelector('[name=factory_name]').value = j.tenant.factory_name;
    document.querySelector('[name=country]').value = j.tenant.country || '';
    document.querySelector('[name=industry]').value = j.tenant.industry || '';
    document.querySelector('[name=default_protocol]').value = j.tenant.default_protocol || 'modbus';
  }
}

function setStep(n) {
  step = n;
  $('step-num').textContent = n;
  [1,2,3].forEach(i => $('step-' + i).classList.toggle('hidden', i !== n));
  $('back-btn').classList.toggle('hidden', n === 1);
  const titles = ['Factory details', 'First machine', 'API key'];
  const subs = ['Tell us about your facility.', 'Optional. You can add more later.', 'Use this key for your edge gateway.'];
  $('step-title').textContent = titles[n-1];
  $('step-sub').textContent = subs[n-1];
  if (n === 3) { $('next-btn').textContent = 'Finish'; }
  else { $('next-btn').textContent = 'Continue'; }
}

$('back-btn').addEventListener('click', () => setStep(step - 1));

$('step-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const msg = $('msg');
  msg.textContent = '';
  const form = Object.fromEntries(new FormData(e.target));

  if (step === 1) {
    const r = await fetch('/api/tenants/me', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf },
      body: JSON.stringify({
        factory_name: form.factory_name,
        country: form.country,
        industry: form.industry,
        default_protocol: form.default_protocol,
      }),
    });
    const j = await r.json();
    if (!r.ok) { msg.innerHTML = '<span class="text-red-400">' + (j.error || 'Failed') + '</span>'; return; }
    setStep(2);
    return;
  }

  if (step === 2) {
    if (form.machine_name) {
      const r = await fetch('/api/machines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf },
        body: JSON.stringify({
          name: form.machine_name,
          brand: form.machine_brand,
          model: form.machine_model,
          protocol: form.machine_protocol,
        }),
      });
      if (!r.ok) { const j = await r.json(); msg.innerHTML = '<span class="text-red-400">' + (j.error || 'Failed') + '</span>'; return; }
    }
    // create API key
    const r = await fetch('/api/keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf },
      body: JSON.stringify({ name: 'Edge Gateway', scope: 'ingest:write' }),
    });
    const j = await r.json();
    if (!r.ok) { msg.innerHTML = '<span class="text-red-400">' + (j.error || 'Failed') + '</span>'; return; }
    apiKey = j.key.key;
    $('api-key-value').textContent = apiKey;
    $('api-key-box').classList.remove('hidden');
    setStep(3);
    return;
  }

  if (step === 3) {
    location.href = '/dashboard';
  }
});

$('copy-key').addEventListener('click', () => {
  navigator.clipboard.writeText($('api-key-value').textContent);
  $('copy-key').textContent = 'Copied';
});

(async () => {
  await loadMe();
  setStep(1);
})();
</script>
</body></html>`;
