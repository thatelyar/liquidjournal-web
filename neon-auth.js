// Neon Auth (Better Auth) + Neon Data API client for the static GitHub Pages build.
// Only public endpoint URLs live here. No database password or secret key is used in the browser.
(function (G) {
  const BASE = '/liquidjournal-web/';
  const AUTH = 'https://ep-falling-lake-za8hrf6e.neonauth.c-2.eu-west-2.aws.neon.tech/neondb/auth';
  const REST = 'https://ep-falling-lake-za8hrf6e.apirest.c-2.eu-west-2.aws.neon.tech/neondb/rest/v1';
  const SESSION_KEY = 'liquid-neon-session';
  const OWNER_KEY = 'liquid-neon-owner';

  const read = () => { try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); } catch { return null; } };
  const write = (s) => { try { s ? localStorage.setItem(SESSION_KEY, JSON.stringify(s)) : localStorage.removeItem(SESSION_KEY); } catch {} };

  async function call(path, { method = 'GET', body } = {}) {
    const s = read();
    const headers = { 'Content-Type': 'application/json' };
    if (s && s.token) headers.Authorization = 'Bearer ' + s.token;
    const res = await fetch(AUTH + path, {
      method, headers, credentials: 'include',
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await res.text();
    let data = null;
    try { data = JSON.parse(text); } catch {}
    return { ok: res.ok, status: res.status, data, headerToken: res.headers.get('set-auth-token') };
  }

  const message = (r, fallback) => (r && r.data && (r.data.message || r.data.error)) || fallback;

  function remember(r) {
    const d = r.data || {};
    const user = d.user || (d.session && d.user) || null;
    const token = r.headerToken || d.token || (d.session && d.session.token) || null;
    if (!user && !token) return null;
    const prev = read() || {};
    const next = { token: token || prev.token || null, user: user || prev.user || null, at: Date.now() };
    write(next);
    return next;
  }

  const Auth = {
    BASE, AUTH, REST, OWNER_KEY,
    loginUrl: () => BASE + 'login/',
    appUrl: () => BASE + 'app.html#/demo/dashboard',
    current: () => read(),
    user: () => (read() || {}).user || null,

    async signIn(email, password) {
      const r = await call('/sign-in/email', { method: 'POST', body: { email, password } });
      if (!r.ok) throw new Error(message(r, 'Sign in failed (' + r.status + ')'));
      const s = remember(r);
      if (!s) throw new Error('Sign in did not return a session. Try again.');
      return Auth.verified(s);
    },

    async signUp(email, password, name) {
      const r = await call('/sign-up/email', { method: 'POST', body: { email, password, name: name || email.split('@')[0] } });
      if (!r.ok) throw new Error(message(r, 'Could not create the account (' + r.status + ')'));
      const s = remember(r);
      if (!s || !s.user) throw new Error('Account created. Check your email to verify it, then sign in.');
      return Auth.verified(s);
    },

    // Confirms the browser really keeps the session (some browsers block cross-site cookies).
    async verified(s) {
      const u = await Auth.refresh();
      if (!u) {
        write(null);
        throw new Error('Signed in, but this browser did not keep the session. Allow cookies for this site or try another browser.');
      }
      return read() || s;
    },

    async google() {
      const r = await call('/sign-in/social', { method: 'POST', body: { provider: 'google', callbackURL: location.origin + BASE + 'app.html#/demo/dashboard' } });
      if (!r.ok || !r.data || !r.data.url) throw new Error(message(r, 'Google sign-in is not available right now.'));
      location.href = r.data.url;
    },

    // Confirms the stored session is still valid; returns the user or null.
    async refresh() {
      try {
        const r = await call('/get-session');
        if (r.ok && r.data && r.data.user) { remember(r); if (r.data.session && r.data.session.token && !(read() || {}).token) {} return r.data.user; }
        if (r.status === 401 || (r.ok && !r.data)) { write(null); return null; }
      } catch {}
      return (read() || {}).user || null; // offline: keep the local session
    },

    async jwt() {
      const cached = Auth._jwt;
      if (cached && cached.exp - 60 > Date.now() / 1000) return cached.token;
      const r = await call('/token');
      const token = r.ok && r.data && r.data.token;
      if (!token) throw new Error(message(r, 'Could not get an access token'));
      let exp = Date.now() / 1000 + 300;
      try { exp = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))).exp || exp; } catch {}
      Auth._jwt = { token, exp };
      return token;
    },

    async signOut() {
      try { await call('/sign-out', { method: 'POST', body: {} }); } catch {}
      write(null); Auth._jwt = null;
    },

    // Send signed-out visitors to the login page; send signed-in visitors away from it.
    guard(kind) {
      const signedIn = !!(read() && read().user);
      if (kind === 'app' && !signedIn) location.replace(Auth.loginUrl());
      if (kind === 'login' && signedIn) location.replace(Auth.appUrl());
      if (kind === 'app' && signedIn) Auth.refresh().then((u) => { if (!u) location.replace(Auth.loginUrl()); });
    },
  };

  G.NeonAuth = Auth;

  // ---- Login / sign-up pages -------------------------------------------------
  const onAuthPage = /\/(login|auth)(\/|$)/.test(location.pathname);
  if (!onAuthPage) return;
  const isSignup = /\/auth\/signup/.test(location.pathname);
  Auth.guard('login');

  function showError(form, text) {
    let el = document.getElementById('neon-auth-msg');
    if (!el) {
      el = document.createElement('p');
      el.id = 'neon-auth-msg';
      el.setAttribute('role', 'alert');
      el.style.cssText = 'margin:10px 0 0;font-size:12.5px;line-height:1.4;color:#ef4444;text-align:left';
      (form.querySelector('button[type=submit]') || form).closest('div').appendChild(el);
    }
    el.textContent = text || '';
  }

  document.addEventListener('submit', async (e) => {
    const form = e.target;
    if (!(form instanceof HTMLFormElement)) return;
    const email = form.querySelector('input[type=email]');
    const password = form.querySelector('input[type=password]');
    if (!email || !password) return;
    e.preventDefault(); e.stopImmediatePropagation();
    const btn = form.querySelector('button[type=submit]');
    if (btn) btn.disabled = true;
    showError(form, '');
    try {
      if (isSignup) await Auth.signUp(email.value.trim(), password.value, '');
      else await Auth.signIn(email.value.trim(), password.value);
      location.href = Auth.appUrl();
    } catch (err) {
      showError(form, err.message || String(err));
      if (btn) btn.disabled = false;
    }
  }, true);


  // The copied pages use root-absolute links (/auth/signup, /login). Keep them inside this site.
  document.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    const raw = a.getAttribute('href') || '';
    if (!raw.startsWith('/') || raw.startsWith('//') || raw.startsWith(BASE)) return;
    const path = raw.split(/[?#]/)[0].replace(/\/+$/, '');
    const routes = { '/auth/signup': 'auth/signup/', '/login': 'login/', '/auth/login': 'login/' };
    if (routes[path]) { e.preventDefault(); e.stopImmediatePropagation(); location.href = BASE + routes[path]; return; }
    if (path === '') { e.preventDefault(); e.stopImmediatePropagation(); location.href = Auth.appUrl(); return; }
    if (path === '/auth/forgot') { e.preventDefault(); e.stopImmediatePropagation(); showError(document.querySelector('form') || document.body, 'Password reset is not available yet. Create a new account or contact the site owner.'); }
  }, true);

  document.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b || !/continue with google/i.test(b.textContent)) return;
    e.preventDefault(); e.stopImmediatePropagation();
    Auth.google().catch((err) => showError(document.querySelector('form') || document.body, err.message));
  }, true);
})(globalThis);
