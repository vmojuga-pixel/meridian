export const MERI_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Meri — Meridian</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, system-ui, sans-serif; background: #0a0a0a; color: #e5e5e5; height: 100vh; display: flex; flex-direction: column; }
  header { padding: 16px 24px; border-bottom: 1px solid #1f1f1f; display: flex; align-items: center; gap: 12px; }
  .logo { font-size: 12px; letter-spacing: 3px; text-transform: uppercase; color: #737373; }
  .name { font-size: 16px; font-weight: 600; }
  .dot { width: 6px; height: 6px; background: #22c55e; border-radius: 50%; margin-left: auto; }
  main { flex: 1; overflow-y: auto; padding: 24px; display: flex; flex-direction: column; gap: 16px; max-width: 800px; width: 100%; margin: 0 auto; }
  .msg { padding: 12px 16px; border-radius: 12px; line-height: 1.5; font-size: 14px; max-width: 85%; white-space: pre-wrap; }
  .user { background: #1d4ed8; align-self: flex-end; }
  .meri { background: #171717; border: 1px solid #262626; align-self: flex-start; }
  .meta { font-size: 11px; color: #525252; margin-top: 6px; }
  form { padding: 16px 24px; border-top: 1px solid #1f1f1f; display: flex; gap: 8px; max-width: 800px; width: 100%; margin: 0 auto; }
  input[type=text] { flex: 1; padding: 12px 16px; background: #171717; border: 1px solid #262626; border-radius: 8px; color: #e5e5e5; font-size: 14px; outline: none; }
  input[type=text]:focus { border-color: #404040; }
  button { padding: 12px 20px; background: #e5e5e5; color: #0a0a0a; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 14px; }
  button:disabled { opacity: 0.5; cursor: not-allowed; }
  .tenant { font-size: 12px; color: #525252; padding: 8px 24px; border-bottom: 1px solid #1f1f1f; }
</style>
</head>
<body>
<header>
  <div class="logo">Meridian</div>
  <div class="name">Meri</div>
  <div class="dot"></div>
</header>
<div class="tenant">Tenant: <span id="tenant"></span></div>
<main id="chat">
  <div class="msg meri">Hi. Saya Meri. Saya boleh ringkaskan prestasi mesin, alert, dan cadangan. Saya tak kawal mesin. Tanya apa-apa.</div>
</main>
<form id="f">
  <input type="text" id="q" placeholder="Tanya Meri..." autocomplete="off" required>
  <button type="submit" id="b">Hantar</button>
</form>
<script>
  const params = new URLSearchParams(location.search);
  const tenant = params.get('tenant') || 'factory-001';
  document.getElementById('tenant').textContent = tenant;
  const chat = document.getElementById('chat');
  const f = document.getElementById('f');
  const q = document.getElementById('q');
  const b = document.getElementById('b');

  function add(text, cls) {
    const d = document.createElement('div');
    d.className = 'msg ' + cls;
    d.textContent = text;
    chat.appendChild(d);
    chat.scrollTop = chat.scrollHeight;
  }

  f.addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = q.value.trim();
    if (!msg) return;
    add(msg, 'user');
    q.value = '';
    b.disabled = true;
    add('...', 'meri');
    const loading = chat.lastChild;
    try {
      const r = await fetch('/api/meri/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Tenant-ID': tenant },
        body: JSON.stringify({ message: msg })
      });
      const j = await r.json();
      loading.textContent = j.reply || j.error || '(no response)';
      if (j.advisory_only) {
        const m = document.createElement('div');
        m.className = 'meta';
        m.textContent = 'advisory only · meri';
        loading.appendChild(m);
      }
    } catch (err) {
      loading.textContent = 'Error: ' + err.message;
    } finally {
      b.disabled = false;
      q.focus();
    }
  });

  q.focus();
</script>
</body>
</html>`;
