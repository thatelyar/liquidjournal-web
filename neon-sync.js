// Cloud sync: keeps the workspace snapshot (the same JSON as "Export complete backup") in Neon.
// Rules: the cloud copy wins unless this browser has changes that were never uploaded.
(function (G) {
  const A = G.NeonAuth;
  if (!A) return;
  const state = { status: 'idle', error: '', syncedAt: 0, listeners: new Set() };
  const set = (patch) => { Object.assign(state, patch); state.listeners.forEach((f) => f()); };
  const user = () => A.user();
  const dirtyKey = () => 'liquid-neon-dirty:' + (user() || {}).id;
  const isDirty = () => localStorage.getItem(dirtyKey()) === '1';
  const setDirty = (v) => { try { v ? localStorage.setItem(dirtyKey(), '1') : localStorage.removeItem(dirtyKey()); } catch {} };

  async function api(method, path, body, extra) {
    const jwt = await A.jwt();
    const res = await fetch(A.REST + path, {
      method,
      headers: Object.assign({ Authorization: 'Bearer ' + jwt, 'Content-Type': 'application/json' }, extra || {}),
      body: body === undefined ? undefined : JSON.stringify(body),
      keepalive: false,
    });
    if (!res.ok) throw new Error('Cloud ' + method + ' failed (' + res.status + ') ' + (await res.text()).slice(0, 160));
    return res.status === 204 ? null : res.json().catch(() => null);
  }

  let suppress = false;
  const importRemote = (data) => { suppress = true; try { G.originalStore.import(Object.assign({}, data, { plan: null })); } finally { suppress = false; } };
  const snapshot = () => JSON.parse(G.originalStore.export());

  async function push() {
    const data = snapshot();
    delete data.plan; // the plan preview stays local
    await api('POST', '/workspaces?on_conflict=user_id', { data, updated_at: new Date().toISOString() }, { Prefer: 'resolution=merge-duplicates,return=minimal' });
    setDirty(false);
    set({ status: 'synced', error: '', syncedAt: Date.now() });
  }

  async function pull() {
    const rows = await api('GET', '/workspaces?select=data,updated_at');
    return Array.isArray(rows) && rows.length ? rows[0] : null;
  }

  async function initial() {
    const u = user();
    if (!u) return;
    set({ status: 'syncing', error: '' });
    try {
      const owner = localStorage.getItem(A.OWNER_KEY);
      const remote = await pull();
      if (remote && (!isDirty() || (owner && owner !== u.id))) {
        importRemote(remote.data);
        localStorage.setItem(A.OWNER_KEY, u.id);
        setDirty(false);
        set({ status: 'synced', syncedAt: Date.now() });
        return;
      }
      if (!remote && owner && owner !== u.id) {
        // Another account used this browser before: never copy its records into this account.
        localStorage.setItem(A.OWNER_KEY, u.id);
        set({ status: 'synced', syncedAt: Date.now() });
        return;
      }
      localStorage.setItem(A.OWNER_KEY, u.id);
      await push(); // first sign-in on this browser: migrate the local workspace to the account
    } catch (e) {
      set({ status: 'error', error: String(e.message || e) });
    }
  }

  let timer = null;
  function schedule() {
    if (!user() || suppress) return;
    setDirty(true);
    clearTimeout(timer);
    timer = setTimeout(() => { set({ status: 'syncing' }); push().catch((e) => set({ status: 'error', error: String(e.message || e) })); }, 2000);
  }

  G.NeonSync = {
    state,
    subscribe: (f) => (state.listeners.add(f), () => state.listeners.delete(f)),
    now: async () => { clearTimeout(timer); set({ status: 'syncing', error: '' }); try { await push(); } catch (e) { set({ status: 'error', error: String(e.message || e) }); throw e; } },
    // Push pending changes before leaving; resolves false if the cloud copy could not be updated.
    flush: async () => { if (!user() || !isDirty()) return true; try { await G.NeonSync.now(); return true; } catch { return false; } },
    pullNow: async () => { const r = await pull(); if (r) { importRemote(r.data); setDirty(false); set({ status: 'synced', syncedAt: Date.now() }); } return !!r; },
  };

  G.addEventListener('liquid-workspace-ready', initial);
  G.addEventListener('liquid-workspace-change', schedule);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden' && isDirty() && user()) { clearTimeout(timer); push().catch(() => {}); } });
  G.addEventListener('online', () => { if (user() && isDirty()) schedule(); });
})(globalThis);
