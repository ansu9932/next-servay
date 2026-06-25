/* ============================================================
 * next — admin dashboard (vanilla JS, no dependencies)
 * Login gate, KPIs, pure SVG/CSS charts, filterable table, CSV export.
 * ============================================================ */
(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var allResponses = [];
  var stats = null;

  var PALETTE = ['#00D26A', '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899', '#06B6D4', '#84CC16', '#EF4444', '#0EA5E9'];

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function fmtDate(iso) {
    try {
      var d = new Date(iso);
      return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) + ', ' +
        d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    } catch (e) { return iso; }
  }

  /* ---------- auth ---------- */
  function login(e) {
    e.preventDefault();
    var btn = $('#loginBtn');
    var pwd = $('#pwd').value;
    $('#loginErr').classList.remove('show');
    btn.disabled = true; btn.innerHTML = '<span class="spinner"></span>';
    fetch('/api/admin/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pwd })
    }).then(function (r) { return r.json(); })
      .then(function (res) {
        if (res && res.ok) { showDashboard(); load(); }
        else { $('#loginErr').classList.add('show'); btn.disabled = false; btn.innerHTML = 'Log in →'; }
      })
      .catch(function () { $('#loginErr').classList.add('show'); btn.disabled = false; btn.innerHTML = 'Log in →'; });
  }

  function logout() {
    fetch('/api/admin/logout', { method: 'POST' }).then(function () { location.reload(); });
  }

  function showDashboard() {
    $('#loginScreen').style.display = 'none';
    $('#dashboard').style.display = '';
  }

  /* ---------- data ---------- */
  function load() {
    $('#lastUpdated').textContent = 'Loading…';
    fetch('/api/admin/data').then(function (r) {
      if (r.status === 401) { location.reload(); throw new Error('unauth'); }
      return r.json();
    }).then(function (res) {
      if (!res.ok) return;
      allResponses = res.responses || [];
      stats = res.stats || {};
      $('#lastUpdated').textContent = 'Updated ' + fmtDate(new Date().toISOString()) + ' · ' + stats.total + ' total responses';
      renderKpis();
      renderCharts();
      renderTable();
    });
  }

  /* ---------- KPIs ---------- */
  function kpi(icCls, ic, val, label, sub) {
    return '<div class="kpi"><div class="k-top"><div class="k-ic ' + icCls + '">' + ic + '</div></div>' +
      '<div class="k-val">' + val + '</div><div class="k-label">' + label + '</div>' +
      (sub ? '<div class="k-sub">' + sub + '</div>' : '') + '</div>';
  }
  function renderKpis() {
    var r = stats.byRole || {};
    var html = '';
    html += kpi('bg-green', '📊', stats.total, 'Total responses', 'across all roles');
    html += kpi('bg-blue', '🛒', r.customer || 0, 'Customers', (stats.demandPct != null ? stats.demandPct + '% want next' : '—'));
    html += kpi('bg-violet', '🏪', (r.merchant || 0) + ' / ' + (r.rider || 0), 'Merchants / Riders', 'supply side');
    html += kpi('bg-amber', '🔔', stats.waitlist, 'On the waitlist', 'ready for launch');
    html += kpi('bg-green', '😍', stats.demandPct != null ? stats.demandPct + '%' : '—', 'Demand signal', 'customers who would use it');
    html += kpi('bg-pink', '⭐', stats.nps != null ? stats.nps : '—', 'NPS score', (stats.npsCount || 0) + ' rated');
    // squeeze to 4-col grid: show first 4 prominently, rest wrap
    $('#kpis').innerHTML = html;
  }

  /* ---------- charts ---------- */
  function toSorted(obj) {
    return Object.keys(obj || {}).map(function (k) { return { label: k, value: obj[k] }; })
      .sort(function (a, b) { return b.value - a.value; });
  }
  function maxVal(arr) { return arr.reduce(function (m, x) { return Math.max(m, x.value); }, 0) || 1; }

  function bars(hostId, obj, opts) {
    opts = opts || {};
    var arr = toSorted(obj);
    if (opts.limit) arr = arr.slice(0, opts.limit);
    var host = $('#' + hostId);
    if (!arr.length) { host.innerHTML = '<p style="color:var(--muted-2); font-size:13px;">No data yet.</p>'; return; }
    var mx = maxVal(arr);
    host.innerHTML = arr.map(function (x, i) {
      var pct = Math.round((x.value / mx) * 100);
      var color = opts.color || PALETTE[i % PALETTE.length];
      return '<div class="bar-row"><div class="b-label" title="' + esc(x.label) + '">' + esc(x.label) + '</div>' +
        '<div class="bar-track"><div class="bar-fill" style="background:' + color + '"></div></div>' +
        '<div class="b-val">' + x.value + '</div></div>';
    }).join('');
    // animate widths
    requestAnimationFrame(function () {
      Array.prototype.forEach.call(host.querySelectorAll('.bar-row'), function (row, i) {
        var pct = Math.round((arr[i].value / mx) * 100);
        row.querySelector('.bar-fill').style.width = pct + '%';
      });
    });
  }

  function donut(svgId, legendId, obj) {
    var arr = toSorted(obj);
    var total = arr.reduce(function (s, x) { return s + x.value; }, 0);
    var svg = $('#' + svgId), legend = $('#' + legendId);
    svg.innerHTML = '';
    if (!total) { legend.innerHTML = '<p style="color:var(--muted-2);font-size:13px;">No data yet.</p>'; return; }
    var ns = 'http://www.w3.org/2000/svg';
    var radius = 15.915, cx = 21, cy = 21, sw = 5;
    var bg = document.createElementNS(ns, 'circle');
    bg.setAttribute('cx', cx); bg.setAttribute('cy', cy); bg.setAttribute('r', radius);
    bg.setAttribute('fill', 'none'); bg.setAttribute('stroke', '#EEF2F7'); bg.setAttribute('stroke-width', sw);
    svg.appendChild(bg);
    var offset = 25; // start at top
    arr.forEach(function (x, i) {
      var pct = (x.value / total) * 100;
      var c = document.createElementNS(ns, 'circle');
      c.setAttribute('cx', cx); c.setAttribute('cy', cy); c.setAttribute('r', radius);
      c.setAttribute('fill', 'none');
      c.setAttribute('stroke', PALETTE[i % PALETTE.length]);
      c.setAttribute('stroke-width', sw);
      c.setAttribute('stroke-dasharray', pct.toFixed(2) + ' ' + (100 - pct).toFixed(2));
      c.setAttribute('stroke-dashoffset', offset.toFixed(2));
      c.setAttribute('transform', 'rotate(0 ' + cx + ' ' + cy + ')');
      svg.appendChild(c);
      offset = (offset - pct + 100) % 100;
    });
    var center = document.createElementNS(ns, 'text');
    center.setAttribute('x', cx); center.setAttribute('y', cy + 1.4);
    center.setAttribute('text-anchor', 'middle'); center.setAttribute('font-size', '6');
    center.setAttribute('font-weight', '800'); center.setAttribute('fill', '#0F172A');
    center.textContent = total;
    svg.appendChild(center);
    legend.innerHTML = arr.map(function (x, i) {
      var pct = Math.round((x.value / total) * 100);
      return '<div class="li"><span class="sw" style="background:' + PALETTE[i % PALETTE.length] + '"></span>' +
        '<span>' + esc(cap(x.label)) + '</span><span class="n">' + x.value + ' · ' + pct + '%</span></div>';
    }).join('');
  }
  function cap(s) { return String(s).charAt(0).toUpperCase() + String(s).slice(1); }

  function renderCharts() {
    donut('roleDonut', 'roleLegend', stats.byRole);
    bars('wantAppBars', stats.wantApp);
    bars('categoryBars', stats.categories, { limit: 8, color: '#00D26A' });
    bars('feeBars', stats.deliveryFee, { color: '#3B82F6' });
    bars('paymentBars', stats.payment, { color: '#8B5CF6' });
    bars('areaBars', stats.area, { limit: 6, color: '#F59E0B' });
  }

  /* ---------- table ---------- */
  function keySignal(r) {
    if (r.role === 'customer') return r.wantApp ? '“' + r.wantApp + '”' + (r.nps !== undefined && r.nps !== '' ? ' · NPS ' + r.nps : '') : '—';
    if (r.role === 'rider') return r.riderInterest || '—';
    if (r.role === 'merchant') return r.listInterest || '—';
    return '—';
  }

  function filtered() {
    var q = $('#search').value.trim().toLowerCase();
    var role = $('#roleFilter').value;
    var wait = $('#waitFilter').value;
    return allResponses.filter(function (r) {
      if (role && r.role !== role) return false;
      if (wait === '1' && !r.joinWaitlist) return false;
      if (q) {
        var hay = [r.name, r.area, r.comments, r.contact, r.role].join(' ').toLowerCase();
        if (hay.indexOf(q) < 0) return false;
      }
      return true;
    });
  }

  var FIELD_LABELS = {
    shopFrequency: 'Shopping frequency', currentMethod: 'Shops via', categories: 'Wants delivered',
    frustration: 'Frustrations', wantApp: 'Would use next', acceptableTime: 'Acceptable time',
    deliveryFee: 'Delivery fee', orderValue: 'Typical order', payment: 'Payment', orderTime: 'Order time',
    nps: 'NPS (0–10)', vehicle: 'Vehicle', availability: 'Hours/day', targetEarning: 'Target earning',
    knowsArea: 'Knows area', hasSmartphone: 'Smartphone', riderInterest: 'Rider interest',
    shopType: 'Shop type', deliversNow: 'Delivers now', dailyOrders: 'Daily customers',
    listInterest: 'List interest', appComfort: 'App comfort', commission: 'Fair commission',
    stockEssentials: 'Stocks essentials', ageGroup: 'Age', pincode: 'Pincode', contact: 'Contact',
    comments: 'Comments'
  };
  var FIELD_ORDER = Object.keys(FIELD_LABELS);

  function detailHtml(r) {
    var rows = '';
    FIELD_ORDER.forEach(function (k) {
      var v = r[k];
      if (v === undefined || v === '' || (Array.isArray(v) && !v.length)) return;
      rows += '<div><div class="dk">' + FIELD_LABELS[k] + '</div><div class="dv">' +
        esc(Array.isArray(v) ? v.join(', ') : v) + '</div></div>';
    });
    if (!rows) rows = '<div class="dv">No extra details.</div>';
    return '<td class="detail-cell" colspan="6"><div class="detail-grid">' + rows + '</div></td>';
  }

  function renderTable() {
    var list = filtered();
    var body = $('#respBody');
    body.innerHTML = '';
    $('#emptyState').style.display = list.length ? 'none' : '';
    list.forEach(function (r) {
      var tr = document.createElement('tr');
      tr.className = 'row-expand';
      tr.innerHTML =
        '<td>' + fmtDate(r.submittedAt) + '</td>' +
        '<td><span class="tag ' + r.role + '">' + cap(r.role) + '</span></td>' +
        '<td>' + (esc(r.name) || '<span style="color:var(--muted-2)">Anonymous</span>') + '</td>' +
        '<td>' + (esc(r.area) || '—') + '</td>' +
        '<td>' + esc(keySignal(r)) + '</td>' +
        '<td>' + (r.joinWaitlist ? '🔔 ' + (esc(r.contact) || 'yes') : '—') + '</td>';
      var detail = document.createElement('tr');
      detail.style.display = 'none';
      detail.innerHTML = detailHtml(r);
      tr.addEventListener('click', function () {
        detail.style.display = detail.style.display === 'none' ? '' : 'none';
      });
      body.appendChild(tr);
      body.appendChild(detail);
    });
  }

  /* ---------- CSV export ---------- */
  function exportCsv() {
    if (!allResponses.length) { alert('No responses to export yet.'); return; }
    var cols = ['submittedAt', 'role', 'name', 'area', 'pincode', 'ageGroup', 'joinWaitlist', 'contact']
      .concat(FIELD_ORDER.filter(function (k) { return ['ageGroup', 'pincode', 'contact'].indexOf(k) < 0; }));
    // de-dupe
    cols = cols.filter(function (c, i) { return cols.indexOf(c) === i; });
    var lines = [cols.join(',')];
    allResponses.forEach(function (r) {
      lines.push(cols.map(function (c) {
        var v = r[c];
        if (Array.isArray(v)) v = v.join(' | ');
        v = v == null ? '' : String(v);
        return '"' + v.replace(/"/g, '""') + '"';
      }).join(','));
    });
    var blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'next-survey-' + new Date().toISOString().slice(0, 10) + '.csv';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /* ---------- boot ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    $('#loginForm').addEventListener('submit', login);
    $('#logoutBtn').addEventListener('click', logout);
    $('#refreshBtn').addEventListener('click', load);
    $('#exportBtn').addEventListener('click', exportCsv);
    $('#search').addEventListener('input', renderTable);
    $('#roleFilter').addEventListener('change', renderTable);
    $('#waitFilter').addEventListener('change', renderTable);

    // already logged in?
    fetch('/api/admin/me').then(function (r) { return r.json(); }).then(function (res) {
      if (res && res.ok) { showDashboard(); load(); }
    });
  });
})();
