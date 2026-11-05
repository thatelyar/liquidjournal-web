// Cloud sync: keeps the workspace snapshot (the same JSON as "Export complete backup") in Neon.
// Includes profile and appearance (theme, accent, font...), so desktop and phone look the same.
// Rules: the cloud copy wins unless this browser has changes that were never uploaded.
(function (G) {
  const A = G.NeonAuth;
  if (!A) return;
  const state = { status: 'idle', error: '', syncedAt: 0, listeners: new Set() };
  const set = (patch) => { Object.assign(state, patch); state.listeners.forEach((f) => f()); };
  let suppress = false;
  let ready = false;
  let busy = false;
  const user = () => A.user();
  const dirtyKey = () => 'liquid-neon-dirty:' + (user() || {}).id;
  const lastKey = () => 'liquid-neon-remote-at:' + (user() || {}).id;
  const isDirty = () => localStorage.getItem(dirtyKey()) === '1';
  const setDirty = (v) => { try { v ? localStorage.setItem(dirtyKey(), '1') : localStorage.removeItem(dirtyKey()); } catch {} };
  const rememberRemote = (iso) => { try { localStorage.setItem(lastKey(), String(Date.parse(iso) || Date.now())); } catch {} };

  // ---- Appearance (theme etc.) lives in localStorage; watch it so changes get uploaded ----
  const APPEARANCE = ['tv-theme', 'tv-accent', 'tv-accent-custom-hex', 'tv-accent-custom-css', 'tv-ink', 'tv-font', 'tv-lines', 'tv-palette-css', 'tv-app-bg', 'tv-app-bg-css', 'tv-app-surface-css'];
  const isAppearanceKey = (k) => APPEARANCE.includes(String(k).replace(/:demo$/, ''));
  const changed = () => { if (!suppress) G.dispatchEvent(new Event('liquid-workspace-change')); };
  const rawSet = Storage.prototype.setItem;
  const rawRemove = Storage.prototype.removeItem;
  Storage.prototype.setItem = function (k, v) {
    const watch = this === G.localStorage && isAppearanceKey(k);
    const before = watch ? this.getItem(k) : null;
    rawSet.call(this, k, v);
    if (watch && before !== String(v)) changed();
  };
  Storage.prototype.removeItem = function (k) {
    const watch = this === G.localStorage && isAppearanceKey(k);
    const had = watch && this.getItem(k) !== null;
    rawRemove.call(this, k);
    if (had) changed();
  };
  const localAppearance = () => {
    const out = {};
    for (const k of APPEARANCE) for (const s of ['', ':demo']) { const v = localStorage.getItem(k + s); if (v !== null) out[k + s] = v; }
    return out;
  };

  async function api(method, path, body, extra) {
    const jwt = await A.jwt();
    const res = await A.fetch(A.REST + path, {
      method,
      headers: Object.assign({ Authorization: 'Bearer ' + jwt, 'Content-Type': 'application/json' }, extra || {}),
      body: body === undefined ? undefined : JSON.stringify(body),
      keepalive: false,
    });
    if (!res.ok) throw new Error('Cloud ' + method + ' failed (' + res.status + ') ' + (await res.text()).slice(0, 160));
    return res.status === 204 ? null : res.json().catch(() => null);
  }

  // Applies a cloud snapshot. Reloads once if the theme/appearance differs, so it takes effect everywhere.
  function importRemote(data, allowReload) {
    const hasAppearance = !!(data && data.appearance && typeof data.appearance === 'object');
    const remoteAppearance = hasAppearance ? data.appearance : {};
    const local = localAppearance();
    let differs = false;
    if (hasAppearance) {
      for (const k of Object.keys(remoteAppearance)) if (local[k] !== remoteAppearance[k]) differs = true;
      for (const k of Object.keys(local)) if (!(k in remoteAppearance)) differs = true;
    }
    suppress = true;
    try {
      G.originalStore.import(Object.assign({}, data, { plan: null }));
      if (hasAppearance) for (const k of Object.keys(local)) if (!(k in remoteAppearance)) rawRemove.call(localStorage, k);
    } finally { suppress = false; }
    if (differs && allowReload !== false) setTimeout(() => location.reload(), 50);
    return differs;
  }
  const snapshot = () => JSON.parse(G.originalStore.export());

  // Combine two workspace snapshots without losing records: lists are merged by id,
  // other values come from `prefer` ("local" or "remote") when both sides have one.
  function mergeData(local, remote, prefer) {
    const isRec = (x) => x && typeof x === 'object' && !Array.isArray(x) && 'id' in x;
    if (Array.isArray(local) && Array.isArray(remote)) {
      if (local.every(isRec) && remote.every(isRec)) {
        const localIds = new Set(local.map((x) => x.id));
        const remoteIds = new Set(remote.map((x) => x.id));
        return prefer === 'local' ? local.concat(remote.filter((x) => !localIds.has(x.id))) : remote.concat(local.filter((x) => !remoteIds.has(x.id)));
      }
      return prefer === 'local' ? (local.length ? local : remote) : (remote.length ? remote : local);
    }
    if (local && remote && typeof local === 'object' && typeof remote === 'object' && !Array.isArray(local) && !Array.isArray(remote)) {
      const out = Object.assign({}, remote);
      for (const k of Object.keys(local)) out[k] = k in remote ? mergeData(local[k], remote[k], prefer) : local[k];
      return out;
    }
    if (local === undefined || local === null) return remote;
    if (remote === undefined || remote === null) return local;
    return prefer === 'local' ? local : remote;
  }


  async function push() {
    const data = snapshot();
    delete data.plan; // the plan preview stays local
    const at = new Date().toISOString();
    await api('POST', '/workspaces?on_conflict=user_id', { data, updated_at: at }, { Prefer: 'resolution=merge-duplicates,return=minimal' });
    rememberRemote(at);
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
      const sameOwner = !owner || owner === u.id;
      if (remote && sameOwner && (!owner || isDirty())) {
        // First sign-in on this browser, or changes here that were never uploaded: merge, never overwrite.
        const merged = mergeData(snapshot(), remote.data, isDirty() ? 'local' : 'remote');
        localStorage.setItem(A.OWNER_KEY, u.id);
        importRemote(merged, true);
        await push();
        return;
      }
      if (remote && (!isDirty() || (owner && owner !== u.id))) {
        localStorage.setItem(A.OWNER_KEY, u.id);
        setDirty(false);
        rememberRemote(remote.updated_at);
        set({ status: 'synced', syncedAt: Date.now() });
        importRemote(remote.data);
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
    } finally { ready = true; }
  }

  // Cheap check for changes made on another device (runs when the app comes back to the front).
  async function checkRemote() {
    if (!ready || busy || !user() || isDirty() || document.visibilityState !== 'visible') return;
    busy = true;
    try {
      const rows = await api('GET', '/workspaces?select=updated_at');
      const at = rows && rows[0] && Date.parse(rows[0].updated_at);
      if (!at || at <= Number(localStorage.getItem(lastKey()) || 0)) return;
      const remote = await pull();
      if (!remote || isDirty()) return;
      rememberRemote(remote.updated_at);
      importRemote(remote.data);
      set({ status: 'synced', error: '', syncedAt: Date.now() });
    } catch {} finally { busy = false; }
  }

  let timer = null;
  function schedule() {
    if (!user() || suppress || !ready) return;
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
    pullNow: async () => { const r = await pull(); if (r) { setDirty(false); rememberRemote(r.updated_at); importRemote(r.data); set({ status: 'synced', syncedAt: Date.now() }); } return !!r; },
  };

  G.addEventListener('liquid-workspace-ready', initial);
  G.addEventListener('liquid-workspace-change', schedule);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && isDirty() && user()) { clearTimeout(timer); push().catch(() => {}); }
    if (document.visibilityState === 'visible') checkRemote();
  });
  G.addEventListener('pageshow', () => checkRemote());
  G.addEventListener('online', () => { if (user() && isDirty()) schedule(); else checkRemote(); });
  setInterval(checkRemote, 60000);
})(globalThis);
