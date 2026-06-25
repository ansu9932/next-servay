/* ============================================================
 * next — survey backend server
 * Zero npm dependencies. Built only on Node.js core modules.
 *
 * Run:   node server.js
 * Env:   PORT (default 3000)
 *        ADMIN_PASSWORD (default "next-admin-721401")
 *        DATA_DIR (default ./data)
 * ============================================================ */

'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = parseInt(process.env.PORT, 10) || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'next-admin-721401';
const PUBLIC_DIR = path.join(__dirname, 'public');
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'responses.json');

const MAX_BODY = 64 * 1024; // 64 KB per submission — plenty, blocks abuse

/* ---------- storage helpers ---------- */
function ensureStore() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]', 'utf8');
}
function readAll() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch (e) {
    return [];
  }
}
function writeAll(list) {
  const tmp = DATA_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(list, null, 2), 'utf8');
  fs.renameSync(tmp, DATA_FILE); // atomic-ish write
}

/* ---------- admin session tokens (in-memory) ---------- */
const sessions = new Set();
function newToken() {
  const t = crypto.randomBytes(24).toString('hex');
  sessions.add(t);
  return t;
}
function parseCookies(req) {
  const out = {};
  const h = req.headers.cookie;
  if (!h) return out;
  h.split(';').forEach((p) => {
    const i = p.indexOf('=');
    if (i > -1) out[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim());
  });
  return out;
}
function isAuthed(req) {
  const c = parseCookies(req);
  return c.next_admin && sessions.has(c.next_admin);
}

/* ---------- sanitising ---------- */
function clean(val, maxLen) {
  if (val === null || val === undefined) return '';
  let s = String(val);
  if (s.length > maxLen) s = s.slice(0, maxLen);
  // strip control chars except newline/tab
  return s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim();
}
function cleanArray(arr, maxItems, maxLen) {
  if (!Array.isArray(arr)) return [];
  return arr.slice(0, maxItems).map((v) => clean(v, maxLen)).filter(Boolean);
}

const ALLOWED_ROLES = ['customer', 'rider', 'merchant'];

/* Build a stored record from raw submission, keeping only known fields. */
function buildRecord(raw) {
  const role = ALLOWED_ROLES.includes(raw.role) ? raw.role : 'customer';
  const rec = {
    id: crypto.randomBytes(8).toString('hex'),
    submittedAt: new Date().toISOString(),
    role,
    // shared / profile
    name: clean(raw.name, 80),
    area: clean(raw.area, 120),
    pincode: clean(raw.pincode, 10),
    ageGroup: clean(raw.ageGroup, 30),
    contact: clean(raw.contact, 120),
    joinWaitlist: !!raw.joinWaitlist,
    comments: clean(raw.comments, 1000),
  };

  if (role === 'customer') {
    rec.shopFrequency = clean(raw.shopFrequency, 40);
    rec.currentMethod = cleanArray(raw.currentMethod, 12, 60);
    rec.categories = cleanArray(raw.categories, 20, 60);
    rec.frustration = cleanArray(raw.frustration, 12, 80);
    rec.wantApp = clean(raw.wantApp, 30);
    rec.acceptableTime = clean(raw.acceptableTime, 30);
    rec.deliveryFee = clean(raw.deliveryFee, 30);
    rec.orderValue = clean(raw.orderValue, 30);
    rec.payment = cleanArray(raw.payment, 8, 40);
    rec.orderTime = cleanArray(raw.orderTime, 8, 40);
    rec.nps = clean(raw.nps, 4);
  } else if (role === 'rider') {
    rec.vehicle = clean(raw.vehicle, 40);
    rec.availability = clean(raw.availability, 40);
    rec.targetEarning = clean(raw.targetEarning, 40);
    rec.knowsArea = clean(raw.knowsArea, 30);
    rec.hasSmartphone = clean(raw.hasSmartphone, 30);
    rec.riderInterest = clean(raw.riderInterest, 30);
  } else if (role === 'merchant') {
    rec.shopType = clean(raw.shopType, 60);
    rec.deliversNow = clean(raw.deliversNow, 40);
    rec.dailyOrders = clean(raw.dailyOrders, 40);
    rec.listInterest = clean(raw.listInterest, 30);
    rec.appComfort = clean(raw.appComfort, 30);
    rec.commission = clean(raw.commission, 40);
    rec.stockEssentials = clean(raw.stockEssentials, 30);
  }
  return rec;
}

/* ---------- response helpers ---------- */
function sendJson(res, code, obj, extraHeaders) {
  const body = JSON.stringify(obj);
  res.writeHead(code, Object.assign({
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  }, extraHeaders || {}));
  res.end(body);
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.json': 'application/json; charset=utf-8',
  '.woff2': 'font/woff2',
};

function serveStatic(req, res, urlPath) {
  let rel = decodeURIComponent(urlPath.split('?')[0]);
  if (rel === '/') rel = '/index.html';
  // prevent path traversal
  const safe = path.normalize(rel).replace(/^(\.\.[/\\])+/, '');
  const filePath = path.join(PUBLIC_DIR, safe);
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403); return res.end('Forbidden');
  }
  fs.stat(filePath, (err, st) => {
    if (err || !st.isFile()) {
      // SPA-ish fallback: unknown path -> survey home
      const fallback = path.join(PUBLIC_DIR, 'index.html');
      return fs.readFile(fallback, (e2, buf) => {
        if (e2) { res.writeHead(404); return res.end('Not found'); }
        res.writeHead(200, { 'Content-Type': MIME['.html'] });
        res.end(buf);
      });
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=3600',
    });
    fs.createReadStream(filePath).pipe(res);
  });
}

function readBody(req, cb) {
  let size = 0;
  const chunks = [];
  let aborted = false;
  req.on('data', (c) => {
    size += c.length;
    if (size > MAX_BODY) {
      aborted = true;
      cb(new Error('payload too large'));
      req.destroy();
      return;
    }
    chunks.push(c);
  });
  req.on('end', () => {
    if (aborted) return;
    try {
      const str = Buffer.concat(chunks).toString('utf8');
      cb(null, str ? JSON.parse(str) : {});
    } catch (e) {
      cb(e);
    }
  });
  req.on('error', (e) => { if (!aborted) cb(e); });
}

/* ---------- aggregation for admin stats ---------- */
function countBy(list, fn) {
  const m = {};
  list.forEach((r) => {
    const vals = fn(r);
    (Array.isArray(vals) ? vals : [vals]).forEach((v) => {
      if (v === '' || v === undefined || v === null) return;
      m[v] = (m[v] || 0) + 1;
    });
  });
  return m;
}

function buildStats(list) {
  const customers = list.filter((r) => r.role === 'customer');
  const npsScores = customers
    .map((r) => parseInt(r.nps, 10))
    .filter((n) => !isNaN(n));
  const promoters = npsScores.filter((n) => n >= 9).length;
  const detractors = npsScores.filter((n) => n <= 6).length;
  const nps = npsScores.length
    ? Math.round(((promoters - detractors) / npsScores.length) * 100)
    : null;

  const wantYes = customers.filter((r) => /yes/i.test(r.wantApp)).length;
  const demandPct = customers.length
    ? Math.round((wantYes / customers.length) * 100)
    : null;

  // responses per day (last 14)
  const byDay = {};
  list.forEach((r) => {
    const d = (r.submittedAt || '').slice(0, 10);
    if (d) byDay[d] = (byDay[d] || 0) + 1;
  });

  return {
    total: list.length,
    byRole: countBy(list, (r) => r.role),
    waitlist: list.filter((r) => r.joinWaitlist).length,
    nps,
    npsCount: npsScores.length,
    demandPct,
    customerCount: customers.length,
    byDay,
    wantApp: countBy(customers, (r) => r.wantApp),
    categories: countBy(customers, (r) => r.categories),
    deliveryFee: countBy(customers, (r) => r.deliveryFee),
    payment: countBy(customers, (r) => r.payment),
    acceptableTime: countBy(customers, (r) => r.acceptableTime),
    orderValue: countBy(customers, (r) => r.orderValue),
    frustration: countBy(customers, (r) => r.frustration),
    area: countBy(list, (r) => r.area),
    riderInterest: countBy(list.filter((r) => r.role === 'rider'), (r) => r.riderInterest),
    listInterest: countBy(list.filter((r) => r.role === 'merchant'), (r) => r.listInterest),
    shopType: countBy(list.filter((r) => r.role === 'merchant'), (r) => r.shopType),
  };
}

/* ---------- router ---------- */
const server = http.createServer((req, res) => {
  const { method, url } = req;

  // --- API ---
  if (url.startsWith('/api/')) {
    // submit survey
    if (url === '/api/survey' && method === 'POST') {
      return readBody(req, (err, raw) => {
        if (err) return sendJson(res, 400, { ok: false, error: 'Invalid submission' });
        try {
          const rec = buildRecord(raw || {});
          const list = readAll();
          list.push(rec);
          writeAll(list);
          // return the running total so the client can show "you're respondent #N"
          return sendJson(res, 201, { ok: true, id: rec.id, total: list.length });
        } catch (e) {
          return sendJson(res, 500, { ok: false, error: 'Could not save' });
        }
      });
    }

    // public: total response count (for social proof on the survey page)
    if (url === '/api/stats/public' && method === 'GET') {
      return sendJson(res, 200, { ok: true, total: readAll().length });
    }

    // admin login
    if (url === '/api/admin/login' && method === 'POST') {
      return readBody(req, (err, body) => {
        if (err) return sendJson(res, 400, { ok: false });
        const pwd = (body && body.password) || '';
        const a = Buffer.from(String(pwd));
        const b = Buffer.from(ADMIN_PASSWORD);
        const match = a.length === b.length && crypto.timingSafeEqual(a, b);
        if (!match) return sendJson(res, 401, { ok: false, error: 'Wrong password' });
        const token = newToken();
        return sendJson(res, 200, { ok: true }, {
          'Set-Cookie': `next_admin=${token}; HttpOnly; Path=/; SameSite=Strict; Max-Age=86400`,
        });
      });
    }

    // admin logout
    if (url === '/api/admin/logout' && method === 'POST') {
      const c = parseCookies(req);
      if (c.next_admin) sessions.delete(c.next_admin);
      return sendJson(res, 200, { ok: true }, {
        'Set-Cookie': 'next_admin=; HttpOnly; Path=/; Max-Age=0',
      });
    }

    // admin: list responses + stats
    if (url === '/api/admin/data' && method === 'GET') {
      if (!isAuthed(req)) return sendJson(res, 401, { ok: false, error: 'Unauthorized' });
      const list = readAll().slice().reverse(); // newest first
      return sendJson(res, 200, { ok: true, stats: buildStats(readAll()), responses: list });
    }

    // admin: check session
    if (url === '/api/admin/me' && method === 'GET') {
      return sendJson(res, 200, { ok: isAuthed(req) });
    }

    return sendJson(res, 404, { ok: false, error: 'Unknown endpoint' });
  }

  // --- static files ---
  if (method === 'GET' || method === 'HEAD') {
    return serveStatic(req, res, url);
  }

  res.writeHead(405); res.end('Method not allowed');
});

ensureStore();
server.listen(PORT, () => {
  console.log(`\n  next survey server running`);
  console.log(`  ────────────────────────────────────────`);
  console.log(`  Survey   →  http://localhost:${PORT}/`);
  console.log(`  Admin    →  http://localhost:${PORT}/admin.html`);
  console.log(`  Password →  ${ADMIN_PASSWORD}`);
  console.log(`  Data     →  ${DATA_FILE}\n`);
});
