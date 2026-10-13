const SHARED = `<script src="https://cdn.tailwindcss.com"></script>
<script>tailwind.config={darkMode:'class',theme:{extend:{colors:{ink:{950:'#0a0a0a',900:'#111111',800:'#1a1a1a',700:'#262626'}}}}}</script>
<style>body{-webkit-font-smoothing:antialiased}::-webkit-scrollbar{width:8px}::-webkit-scrollbar-track{background:#0a0a0a}::-webkit-scrollbar-thumb{background:#262626;border-radius:4px}</style>`;

export const SIGNUP_HTML = `<!DOCTYPE html>
<html lang="en" class="dark"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Sign up — Meridian</title>${SHARED}</head>
<body class="bg-ink-950 text-neutral-200 font-sans min-h-screen flex flex-col">
<header class="border-b border-white/5 px-6 h-14 flex items-center"><a href="/" class="font-mono text-xs tracking-[0.3em] uppercase text-neutral-400 hover:text-neutral-100">Meridian</a></header>
<main class="flex-1 flex items-center justify-center p-6">
<div class="w-full max-w-md">
  <h1 class="text-3xl font-semibold tracking-tight mb-2">Create account</h1>
  <p class="text-sm text-neutral-500 mb-8">Set up your factory on Meridian.</p>
  <form id="f" class="space-y-4">
    <div><label class="block text-xs text-neutral-500 mb-1.5">Email</label>
    <input name="email" type="email" required class="w-full px-3.5 py-2.5 bg-ink-900 border border-white/10 rounded-lg text-sm outline-none focus:border-white/30 transition"></div>
    <div><label class="block text-xs text-neutral-500 mb-1.5">Password <span class="text-neutral-600">(min 12, upper+lower+number)</span></label>
    <input name="password" type="password" required minlength="12" class="w-full px-3.5 py-2.5 bg-ink-900 border border-white/10 rounded-lg text-sm outline-none focus:border-white/30 transition"></div>
    <div><label class="block text-xs text-neutral-500 mb-1.5">Factory name</label>
    <input name="factory_name" type="text" required class="w-full px-3.5 py-2.5 bg-ink-900 border border-white/10 rounded-lg text-sm outline-none focus:border-white/30 transition"></div>
    <div class="grid grid-cols-2 gap-3">
      <div><label class="block text-xs text-neutral-500 mb-1.5">Country</label>
      <input name="country" type="text" placeholder="e.g. Germany" class="w-full px-3.5 py-2.5 bg-ink-900 border border-white/10 rounded-lg text-sm outline-none focus:border-white/30 transition"></div>
      <div><label class="block text-xs text-neutral-500 mb-1.5">Industry</label>
      <input name="industry" type="text" placeholder="e.g. Automotive" class="w-full px-3.5 py-2.5 bg-ink-900 border border-white/10 rounded-lg text-sm outline-none focus:border-white/30 transition"></div>
    </div>
    <button type="submit" class="w-full py-2.5 bg-white text-black rounded-lg font-medium text-sm hover:bg-neutral-200 transition disabled:opacity-50">Create account</button>
    <div id="msg" class="text-sm text-center"></div>
  </form>
  <p class="text-sm text-neutral-500 text-center mt-6">Already have an account? <a href="/login" class="text-neutral-200 hover:underline">Log in</a></p>
</div>
</main>
<script>
const f = document.getElementById('f');
const msg = document.getElementById('msg');
f.addEventListener('submit', async (e) => {
  e.preventDefault();
  msg.textContent = '';
  const btn = f.querySelector('button');
  btn.disabled = true;
  const data = Object.fromEntries(new FormData(f));
  try {
    const r = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const j = await r.json();
    if (!r.ok) { msg.innerHTML = '<span class="text-red-400">' + (j.error || 'Signup failed') + '</span>'; return; }
    msg.innerHTML = '<span class="text-green-400">Account created. Redirecting to verify...</span>';
    setTimeout(() => location.href = j.verify_url, 1200);
  } catch (err) { msg.innerHTML = '<span class="text-red-400">' + err.message + '</span>'; }
  finally { btn.disabled = false; }
});
</script>
</body></html>`;

export const LOGIN_HTML = `<!DOCTYPE html>
<html lang="en" class="dark"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Log in — Meridian</title>${SHARED}</head>
<body class="bg-ink-950 text-neutral-200 font-sans min-h-screen flex flex-col">
<header class="border-b border-white/5 px-6 h-14 flex items-center"><a href="/" class="font-mono text-xs tracking-[0.3em] uppercase text-neutral-400 hover:text-neutral-100">Meridian</a></header>
<main class="flex-1 flex items-center justify-center p-6">
<div class="w-full max-w-md">
  <h1 class="text-3xl font-semibold tracking-tight mb-2">Log in</h1>
  <p class="text-sm text-neutral-500 mb-8">Welcome back.</p>
  <form id="f" class="space-y-4">
    <div><label class="block text-xs text-neutral-500 mb-1.5">Email</label>
    <input name="email" type="email" required class="w-full px-3.5 py-2.5 bg-ink-900 border border-white/10 rounded-lg text-sm outline-none focus:border-white/30 transition"></div>
    <div><label class="block text-xs text-neutral-500 mb-1.5">Password</label>
    <input name="password" type="password" required class="w-full px-3.5 py-2.5 bg-ink-900 border border-white/10 rounded-lg text-sm outline-none focus:border-white/30 transition"></div>
    <button type="submit" class="w-full py-2.5 bg-white text-black rounded-lg font-medium text-sm hover:bg-neutral-200 transition disabled:opacity-50">Log in</button>
    <div id="msg" class="text-sm text-center"></div>
  </form>
  <p class="text-sm text-neutral-500 text-center mt-6">No account? <a href="/signup" class="text-neutral-200 hover:underline">Sign up</a></p>
</div>
</main>
<script>
const f = document.getElementById('f');
const msg = document.getElementById('msg');
f.addEventListener('submit', async (e) => {
  e.preventDefault();
  msg.textContent = '';
  const btn = f.querySelector('button');
  btn.disabled = true;
  const data = Object.fromEntries(new FormData(f));
  try {
    const r = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const j = await r.json();
    if (!r.ok) { msg.innerHTML = '<span class="text-red-400">' + (j.error || 'Login failed') + '</span>'; return; }
    sessionStorage.setItem('csrf', j.csrf_token);
    // Check onboarding status
    try {
      const me = await fetch('/api/auth/me', { headers: { 'X-CSRF-Token': j.csrf_token } });
      const mj = await me.json();
      if (mj.tenant && mj.tenant.factory_name && mj.tenant.onboarded !== 0) {
        location.href = '/dashboard';
      } else {
        location.href = '/onboarding';
      }
    } catch (e) {
      location.href = '/dashboard';
    }
  } catch (err) { msg.innerHTML = '<span class="text-red-400">' + err.message + '</span>'; }
  finally { btn.disabled = false; }
});
</script>
</body></html>`;

export const VERIFY_HTML = `<!DOCTYPE html>
<html lang="en" class="dark"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Verify — Meridian</title>${SHARED}</head>
<body class="bg-ink-950 text-neutral-200 font-sans min-h-screen flex flex-col">
<header class="border-b border-white/5 px-6 h-14 flex items-center"><a href="/" class="font-mono text-xs tracking-[0.3em] uppercase text-neutral-400">Meridian</a></header>
<main class="flex-1 flex items-center justify-center p-6">
<div class="w-full max-w-md text-center">
  <h1 class="text-2xl font-semibold mb-4" id="title">Verifying...</h1>
  <p class="text-sm text-neutral-500 mb-8" id="sub">Please wait.</p>
  <a href="/login" class="inline-block px-5 py-2.5 bg-white text-black rounded-lg font-medium text-sm hover:bg-neutral-200 transition" id="cta" style="display:none">Go to login</a>
</div>
</main>
<script>
(async () => {
  const token = new URLSearchParams(location.search).get('token');
  const title = document.getElementById('title');
  const sub = document.getElementById('sub');
  const cta = document.getElementById('cta');
  if (!token) { title.textContent = 'Missing token'; sub.textContent = 'No verification token provided.'; cta.style.display = 'inline-block'; return; }
  try {
    const r = await fetch('/api/auth/verify?token=' + encodeURIComponent(token));
    const j = await r.json();
    if (r.ok) { title.textContent = 'Email verified'; sub.textContent = j.message; }
    else { title.textContent = 'Verification failed'; sub.textContent = j.error; }
  } catch (e) { title.textContent = 'Error'; sub.textContent = e.message; }
  cta.style.display = 'inline-block';
})();
</script>
</body></html>`;
