export const DASHBOARD_HTML = `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Meridian — Dashboard</title>
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
  body { -webkit-font-smoothing: antialiased; }
  ::-webkit-scrollbar { width: 8px; height: 8px; }
  ::-webkit-scrollbar-track { background: #0a0a0a; }
  ::-webkit-scrollbar-thumb { background: #262626; border-radius: 4px; }
  ::-webkit-scrollbar-thumb:hover { background: #404040; }
</style>
</head>
<body class="bg-ink-950 text-neutral-200 font-sans h-screen flex flex-col overflow-hidden">

<header class="border-b border-white/5 px-6 h-14 flex items-center gap-4 flex-shrink-0">
  <a href="/" class="font-mono text-xs tracking-[0.3em] uppercase text-neutral-400 hover:text-neutral-100">Meridian</a>
  <span class="font-mono text-xs text-neutral-600 border border-white/10 rounded px-2 py-1" id="tenant-label">factory-001</span>
  <div class="ml-auto flex items-center gap-2 text-xs text-green-500">
    <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>
    <span id="status-label">Live</span>
  </div>
</header>

<main class="flex-1 grid grid-cols-12 overflow-hidden">

  <!-- LEFT SIDEBAR -->
  <aside class="col-span-3 border-r border-white/5 p-5 overflow-y-auto">
    <div class="text-xs font-mono tracking-[0.2em] uppercase text-neutral-600 mb-3">Overview</div>
    <div class="space-y-2 mb-8">
      <div class="p-3.5 rounded-lg bg-ink-900 border border-white/5">
        <div class="text-xs text-neutral-500 mb-1">Machines</div>
        <div class="text-2xl font-semibold" id="s-machines">—</div>
      </div>
      <div class="p-3.5 rounded-lg bg-ink-900 border border-white/5">
        <div class="text-xs text-neutral-500 mb-1">Open alerts</div>
        <div class="text-2xl font-semibold" id="s-alerts">—</div>
      </div>
      <div class="p-3.5 rounded-lg bg-ink-900 border border-white/5">
        <div class="text-xs text-neutral-500 mb-1">Commands 24h</div>
        <div class="text-2xl font-semibold" id="s-commands">—</div>
      </div>
    </div>
    <div class="text-xs font-mono tracking-[0.2em] uppercase text-neutral-600 mb-3">Recent alerts</div>
    <div id="alerts-list" class="space-y-2">
      <div class="text-xs text-neutral-600 text-center py-6">No alerts</div>
    </div>
  </aside>

  <!-- CENTER -->
  <section class="col-span-6 p-5 overflow-y-auto">
    <div class="text-xs font-mono tracking-[0.2em] uppercase text-neutral-600 mb-3">Machines</div>
    <div class="rounded-lg border border-white/5 overflow-hidden">
      <table class="w-full text-sm">
        <thead>
          <tr class="bg-ink-900 text-xs font-mono uppercase tracking-wider text-neutral-600">
            <th class="text-left px-4 py-2.5 font-normal">Machine</th>
            <th class="text-left px-4 py-2.5 font-normal">Status</th>
            <th class="text-right px-4 py-2.5 font-normal">Temp</th>
            <th class="text-right px-4 py-2.5 font-normal">RPM</th>
            <th class="text-right px-4 py-2.5 font-normal">Power</th>
          </tr>
        </thead>
        <tbody id="machines-body">
          <tr><td colspan="5" class="text-xs text-neutral-600 text-center py-12">No data</td></tr>
        </tbody>
      </table>
    </div>
  </section>

  <!-- RIGHT: MERI -->
  <aside class="col-span-3 border-l border-white/5 flex flex-col overflow-hidden">
    <div class="px-4 py-3 border-b border-white/5 flex items-center gap-2">
      <span class="font-semibold text-sm">Meri</span>
      <span class="ml-auto text-xs font-mono text-neutral-600">advisor</span>
    </div>
    <div id="meri-chat" class="flex-1 overflow-y-auto p-4 space-y-3">
      <div class="text-sm bg-ink-900 border border-white/5 rounded-lg p-3 text-neutral-400 leading-relaxed">Hi. Tanya saya pasal status mesin, alert, atau cadangan.</div>
    </div>
    <form id="meri-form" class="border-t border-white/5 p-3 flex gap-2">
      <input id="meri-input" type="text" placeholder="Tanya Meri..." autocomplete="off" required
        class="flex-1 px-3 py-2 bg-ink-900 border border-white/10 rounded-lg text-sm outline-none focus:border-white/25 transition">
      <button id="meri-btn" type="submit"
        class="px-3.5 py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-neutral-200 transition disabled:opacity-50">Send</button>
    </form>
  </aside>

</main>

<script>
  const tenant = new URLSearchParams(location.search).get('tenant') || 'factory-001';
  document.getElementById('tenant-label').textContent = tenant;

  const $ = (id) => document.getElementById(id);

  function fmt(n, digits = 0) {
    if (n === null || n === undefined || n === '') return '—';
    return Number(n).toFixed(digits);
  }

  function statusBadge(status) {
    const s = (status || 'unknown').toLowerCase();
    const cls = s === 'running' ? 'text-green-400 bg-green-500/10 border-green-500/20'
              : s === 'idle' ? 'text-neutral-400 bg-white/5 border-white/10'
              : s === 'offline' ? 'text-red-400 bg-red-500/10 border-red-500/20'
              : 'text-neutral-400 bg-white/5 border-white/10';
    return '<span class="px-2 py-0.5 rounded text-xs font-mono border ' + cls + '">' + s + '</span>';
  }

  async function loadDashboard() {
    try {
      const r = await fetch('/api/dashboard', { headers: { 'X-Tenant-ID': tenant } });
      const j = await r.json();

      $('s-machines').textContent = j.machines ?? 0;
      $('s-commands').textContent = j.commands_24h ?? 0;

      const alerts = j.alerts || [];
      const totalAlerts = alerts.reduce((sum, a) => sum + (a.n || 0), 0);
      $('s-alerts').textContent = totalAlerts;

      const list = $('alerts-list');
      if (!alerts.length) {
        list.innerHTML = '<div class="text-xs text-neutral-600 text-center py-6">No alerts</div>';
      } else {
        list.innerHTML = alerts.map(a => {
          const sev = a.severity || 'info';
          const border = sev === 'critical' ? 'border-l-red-500'
                       : sev === 'warning' ? 'border-l-amber-500'
                       : 'border-l-neutral-600';
          return '<div class="border-l-2 ' + border + ' bg-ink-900 rounded-r-lg px-3 py-2">' +
            '<div class="flex items-center justify-between">' +
              '<span class="text-xs font-mono uppercase text-neutral-500">' + sev + '</span>' +
              '<span class="text-sm font-semibold">' + a.n + '</span>' +
            '</div>' +
          '</div>';
        }).join('');
      }

      $('status-label').textContent = 'Live';
    } catch (e) {
      $('status-label').textContent = 'Error';
      console.error(e);
    }
  }

  const meriChat = $('meri-chat');
  const meriForm = $('meri-form');
  const meriInput = $('meri-input');
  const meriBtn = $('meri-btn');

  function meriAdd(text, cls) {
    const div = document.createElement('div');
    div.className = cls === 'user'
      ? 'text-sm bg-blue-600 text-white rounded-lg p-3 ml-auto max-w-[85%] whitespace-pre-wrap'
      : 'text-sm bg-ink-900 border border-white/5 rounded-lg p-3 max-w-[85%] whitespace-pre-wrap text-neutral-200';
    div.textContent = text;
    meriChat.appendChild(div);
    meriChat.scrollTop = meriChat.scrollHeight;
    return div;
  }

  meriForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = meriInput.value.trim();
    if (!msg) return;
    meriAdd(msg, 'user');
    meriInput.value = '';
    meriBtn.disabled = true;
    const loading = meriAdd('...', 'meri');
    try {
      const r = await fetch('/api/meri/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Tenant-ID': tenant },
        body: JSON.stringify({ message: msg })
      });
      const j = await r.json();
      loading.textContent = j.reply || j.error || '(no response)';
      if (j.advisory_only) {
        const meta = document.createElement('div');
        meta.className = 'text-xs text-neutral-600 mt-1 font-mono';
        meta.textContent = 'advisory only · meri';
        loading.appendChild(meta);
      }
    } catch (err) {
      loading.textContent = 'Error: ' + err.message;
    } finally {
      meriBtn.disabled = false;
      meriInput.focus();
    }
  });

  loadDashboard();
  setInterval(loadDashboard, 15000);
</script>
</body>
</html>`;
