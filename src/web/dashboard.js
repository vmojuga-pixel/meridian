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
  <span class="font-mono text-xs text-neutral-500 border border-white/10 rounded px-2 py-1" id="tenant-label">...</span>
  <button id="logout-btn" class="ml-auto text-xs text-neutral-500 hover:text-red-400 transition">Logout</button>
  <div class="flex items-center gap-2 text-xs text-green-500">
    <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>
    <span id="status-label">Live</span>
  </div>
</header>

<main class="flex-1 overflow-y-auto lg:grid lg:grid-cols-12 lg:overflow-hidden">

  <!-- LEFT SIDEBAR -->
  <aside class="p-5 border-b lg:border-b-0 lg:border-r border-white/5 lg:col-span-3 lg:overflow-y-auto">
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
  <section class="p-5 border-b lg:border-b-0 border-white/5 lg:col-span-6 lg:overflow-y-auto">
    <div class="flex items-center justify-between mb-3"><div class="text-xs font-mono tracking-[0.2em] uppercase text-neutral-600">Machines</div><button id="add-machine-btn" class="text-xs px-3 py-1.5 bg-white text-black rounded-md font-medium hover:bg-neutral-200 transition">+ Add</button></div>
    <div class="rounded-lg border border-white/5 overflow-x-auto">
      <table class="w-full text-sm min-w-[520px]">
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
  <aside class="lg:col-span-3 lg:border-l border-white/5 flex flex-col h-[70vh] lg:h-auto lg:overflow-hidden">
    <div class="px-4 py-3 border-b border-white/5 flex items-center gap-2">
      <span class="font-semibold text-sm">Meri</span>
      <span class="ml-auto text-xs font-mono text-neutral-600">advisor</span>
    </div>
    <div id="meri-chat" class="flex-1 overflow-y-auto p-4 space-y-3">
      <div class="text-sm bg-ink-900 border border-white/5 rounded-lg p-3 text-neutral-400 leading-relaxed">Hi. Ask me about machine status, alerts, or recommendations.</div>
    </div>
    <form id="meri-form" class="border-t border-white/5 p-3 flex gap-2">
      <input id="meri-input" type="text" placeholder="Ask Meri..." autocomplete="off" required
        class="flex-1 px-3 py-2 bg-ink-900 border border-white/10 rounded-lg text-sm outline-none focus:border-white/25 transition">
      <button id="meri-btn" type="submit"
        class="px-3.5 py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-neutral-200 transition disabled:opacity-50">Send</button>
    </form>
  </aside>

</main>

<div id="machine-modal" class="hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
  <div class="w-full max-w-md bg-ink-900 border border-white/10 rounded-xl p-6">
    <h3 class="text-lg font-semibold mb-4">Add machine</h3>
    <form id="machine-form" class="space-y-3">
      <input name="name" placeholder="Name (e.g. Press-01)" required class="w-full px-3 py-2 bg-ink-950 border border-white/10 rounded-lg text-sm outline-none focus:border-white/30">
      <div class="grid grid-cols-2 gap-3">
        <input name="brand" placeholder="Brand" class="w-full px-3 py-2 bg-ink-950 border border-white/10 rounded-lg text-sm outline-none focus:border-white/30">
        <input name="model" placeholder="Model" class="w-full px-3 py-2 bg-ink-950 border border-white/10 rounded-lg text-sm outline-none focus:border-white/30">
      </div>
      <div class="grid grid-cols-2 gap-3">
        <select name="protocol" class="w-full px-3 py-2 bg-ink-950 border border-white/10 rounded-lg text-sm outline-none focus:border-white/30">
          <option value="">Protocol</option>
          <option value="modbus">Modbus</option>
          <option value="opcua">OPC-UA</option>
          <option value="serial">Serial</option>
          <option value="profinet">Profinet</option>
        </select>
        <input name="serial" placeholder="Serial no." class="w-full px-3 py-2 bg-ink-950 border border-white/10 rounded-lg text-sm outline-none focus:border-white/30">
      </div>
      <div id="machine-msg" class="text-sm text-center"></div>
      <div class="flex gap-2 pt-2">
        <button type="button" id="machine-cancel" class="flex-1 py-2 border border-white/10 rounded-lg text-sm hover:border-white/25 transition">Cancel</button>
        <button type="submit" class="flex-1 py-2 bg-white text-black rounded-lg font-medium text-sm hover:bg-neutral-200 transition">Save</button>
      </div>
    </form>
  </div>
</div>

<script>
  let tenant = null;
  let csrf = sessionStorage.getItem('csrf') || '';

  const $ = (id) => document.getElementById(id);

  function authHeaders(extra = {}) {
    return { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf, ...extra };
  }

  async function loadMe() {
    try {
      const r = await fetch('/api/auth/me', { headers: { 'X-CSRF-Token': csrf } });
      if (r.status === 401 || r.status === 403) { location.href = '/login'; return null; }
      const j = await r.json();
      tenant = j.user.tenant_id;
      csrf = j.csrf_token;
      sessionStorage.setItem('csrf', csrf);
      $('tenant-label').textContent = (j.tenant && j.tenant.factory_name) || tenant;
      return j;
    } catch (e) {
      location.href = '/login';
      return null;
    }
  }

  async function loadMachines() {
    try {
      const r = await fetch('/api/machines', { headers: { 'X-CSRF-Token': csrf } });
      const j = await r.json();
      const body = $('machines-body');
      const machines = j.machines || [];
      if (!machines.length) {
        body.innerHTML = '<tr><td colspan="5" class="text-xs text-neutral-600 text-center py-12">No machines. Click + Add.</td></tr>';
        return;
      }
      body.innerHTML = machines.map(m => {
        const s2 = (m.status || 'offline').toLowerCase();
        const cls = s2 === 'running' ? 'text-green-400 bg-green-500/10 border-green-500/20'
                  : s2 === 'idle' ? 'text-neutral-400 bg-white/5 border-white/10'
                  : 'text-red-400 bg-red-500/10 border-red-500/20';
        return '<tr class="border-b border-white/5 hover:bg-white/[0.02] transition">' +
          '<td class="px-4 py-2.5 font-medium">' + (m.name || '') + '</td>' +
          '<td class="px-4 py-2.5"><span class="px-2 py-0.5 rounded text-xs font-mono border ' + cls + '">' + s2 + '</span></td>' +
          '<td class="px-4 py-2.5 text-right text-neutral-500 font-mono text-xs">' + (m.brand || '—') + '</td>' +
          '<td class="px-4 py-2.5 text-right text-neutral-500 font-mono text-xs">' + (m.model || '—') + '</td>' +
          '<td class="px-4 py-2.5 text-right text-neutral-500 font-mono text-xs">' + (m.protocol || '—') + '</td>' +
        '</tr>';
      }).join('');
    } catch (e) { console.error(e); }
  }


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
      const r = await fetch('/api/dashboard', { headers: { 'X-Tenant-ID': tenant, 'X-CSRF-Token': csrf } });
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
        headers: { 'Content-Type': 'application/json', 'X-Tenant-ID': tenant, 'X-CSRF-Token': csrf },
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

  $('logout-btn').addEventListener('click', async () => {
    await fetch('/api/auth/logout', { method: 'POST', headers: { 'X-CSRF-Token': csrf } });
    sessionStorage.removeItem('csrf');
    location.href = '/login';
  });

  $('add-machine-btn').addEventListener('click', () => $('machine-modal').classList.remove('hidden'));
  $('machine-cancel').addEventListener('click', () => $('machine-modal').classList.add('hidden'));

  $('machine-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = $('machine-msg');
    msg.textContent = '';
    const data = Object.fromEntries(new FormData(e.target));
    try {
      const r = await fetch('/api/machines', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data)
      });
      const j = await r.json();
      if (!r.ok) { msg.innerHTML = '<span class="text-red-400">' + (j.error || 'Failed') + '</span>'; return; }
      $('machine-modal').classList.add('hidden');
      e.target.reset();
      loadMachines();
      loadDashboard();
    } catch (err) { msg.innerHTML = '<span class="text-red-400">' + err.message + '</span>'; }
  });

  (async () => {
    const me = await loadMe();
    if (!me) return;
    await loadMachines();
    await loadDashboard();
    setInterval(loadDashboard, 15000);
  })();
</script>
</body>
</html>`;
