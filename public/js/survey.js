/* ============================================================
 * next — survey engine (vanilla JS, no dependencies)
 * Schema-driven multi-step form with role-based branching.
 * ============================================================ */
(function () {
  'use strict';

  var DEFAULT_PINCODE = '721401';

  /* ---------- Question schema ---------- */
  // Shared profile step
  var profileStep = {
    id: 'profile',
    eyebrow: 'About you',
    title: 'Tell us where you are',
    help: 'This helps us know which neighbourhoods to launch in first.',
    fields: [
      { name: 'name', type: 'text', q: 'Your name', optional: true, placeholder: 'e.g. Riya' },
      { name: 'area', type: 'text', q: 'Your area / locality', required: true, placeholder: 'e.g. Rabindra Nagar, Midnapore' },
      { name: 'pincode', type: 'text', q: 'Pincode', required: true, value: DEFAULT_PINCODE, placeholder: '721401', inputmode: 'numeric' },
      { name: 'ageGroup', type: 'radio', q: 'Your age group', cols: 3, options: ['Under 18', '18–25', '26–35', '36–50', '50+'] }
    ]
  };

  // Customer steps
  var customerSteps = [
    {
      id: 'cust-habits',
      eyebrow: 'Your habits',
      title: 'How do you shop today?',
      help: 'There are no wrong answers — we just want the real picture.',
      fields: [
        { name: 'shopFrequency', type: 'radio', required: true, q: 'How often do you buy groceries / daily essentials?',
          options: ['Daily', 'Few times a week', 'Weekly', 'Occasionally'] },
        { name: 'currentMethod', type: 'checkbox', required: true, q: 'How do you usually get them now?', sub: 'Choose all that apply.',
          options: ['🚶 Go to a local shop myself', '📞 Phone the shop / WhatsApp order', '🛵 Ask a family member', '📦 Other delivery apps', '🏪 Big supermarket'] },
        { name: 'categories', type: 'checkbox', required: true, q: 'What would you most want delivered fast?', sub: 'Pick everything you would use.',
          options: ['🥦 Vegetables & fruit', '🛒 Groceries & staples', '🥛 Milk & dairy', '💊 Medicines', '🍿 Snacks & drinks', '🧴 Personal care', '🧹 Household items', '🍱 Cooked food / meals', '📒 Stationery'] }
      ]
    },
    {
      id: 'cust-demand',
      eyebrow: 'The big question',
      title: 'Would you actually use next?',
      help: 'Be honest — this is the answer that matters most.',
      fields: [
        { name: 'frustration', type: 'checkbox', q: 'Biggest frustration with shopping today?', sub: 'Optional — choose any that apply.',
          options: ['⏳ Wastes my time', '🚗 Travel / distance', '❌ Items out of stock', '💸 Prices too high', '🌧️ Weather / going out', '🕗 Shop timings'] },
        { name: 'wantApp', type: 'radio', required: true, q: 'If next delivered to your door in 15–30 minutes, would you use it?',
          options: ['🤩 Yes, definitely', '🙂 Probably yes', '🤔 Maybe / not sure', '🙅 Probably not', '🚫 No'] },
        { name: 'acceptableTime', type: 'radio', required: true, q: 'What delivery time feels good to you?', cols: 2,
          options: ['Under 15 min', '15–30 min', '30–45 min', 'Up to 1 hour is fine'] }
      ]
    },
    {
      id: 'cust-money',
      eyebrow: 'Making it work',
      title: 'A few money questions',
      help: 'This helps us price delivery fairly so next can survive in our city.',
      fields: [
        { name: 'deliveryFee', type: 'radio', required: true, q: 'What delivery fee would you happily pay?', cols: 2,
          options: ['Only if it is free', '₹10', '₹20', '₹30+', 'Free above a cart value'] },
        { name: 'orderValue', type: 'radio', required: true, q: 'A typical order would be worth about…', cols: 2,
          options: ['Under ₹100', '₹100–₹300', '₹300–₹500', '₹500+'] },
        { name: 'payment', type: 'checkbox', required: true, q: 'How would you like to pay?', cols: 3,
          options: ['💵 Cash on delivery', '📲 UPI', '💳 Card', '👛 Wallet'] },
        { name: 'orderTime', type: 'checkbox', q: 'When would you order most? (optional)', cols: 2,
          options: ['🌅 Morning', '🌞 Afternoon', '🌆 Evening', '🌙 Late night'] },
        { name: 'nps', type: 'scale', required: true, q: 'How likely are you to recommend next to a friend?',
          low: 'Not likely', high: 'Very likely' }
      ]
    }
  ];

  // Rider steps
  var riderSteps = [
    {
      id: 'rider',
      eyebrow: 'Become a delivery partner',
      title: 'Riding with next',
      help: 'We want partners to earn well. Tell us about you.',
      fields: [
        { name: 'vehicle', type: 'radio', required: true, q: 'What will you deliver on?', cols: 2,
          options: ['🏍️ Motorbike', '🛵 Scooter', '🚲 Bicycle', '🚶 On foot', 'No vehicle yet'] },
        { name: 'availability', type: 'radio', required: true, q: 'How many hours a day can you give?', cols: 2,
          options: ['1–2 hours', '3–5 hours', '6–8 hours', 'Full time (8+)'] },
        { name: 'targetEarning', type: 'radio', required: true, q: 'What daily earning makes it worth it?', cols: 2,
          options: ['₹300–₹500', '₹500–₹800', '₹800–₹1200', '₹1200+'] },
        { name: 'knowsArea', type: 'radio', required: true, q: 'How well do you know the local roads?', cols: 3,
          options: ['Very well', 'Somewhat', 'Not much'] },
        { name: 'hasSmartphone', type: 'radio', required: true, q: 'Do you have a smartphone with internet?', cols: 3,
          options: ['Yes', 'No', 'Can arrange'] },
        { name: 'riderInterest', type: 'radio', required: true, q: 'Do you want to join as a rider when we launch?',
          options: ['🙌 Yes, sign me up', '🤔 Maybe', '👀 Just curious'] }
      ]
    }
  ];

  // Merchant steps
  var merchantSteps = [
    {
      id: 'merchant',
      eyebrow: 'For shop owners',
      title: 'Selling on next',
      help: 'Get more orders from your neighbourhood without extra staff.',
      fields: [
        { name: 'shopType', type: 'radio', required: true, q: 'What kind of shop do you run?', cols: 2,
          options: ['🛒 Grocery / Kirana', '🥦 Vegetables & fruit', '💊 Pharmacy', '🍱 Restaurant / food', '🧁 Bakery / sweets', '🧴 General / cosmetics', '📦 Other'] },
        { name: 'deliversNow', type: 'radio', required: true, q: 'Do you deliver to customers today?', cols: 2,
          options: ['Yes, on phone orders', 'Sometimes', 'No, walk-in only'] },
        { name: 'dailyOrders', type: 'radio', required: true, q: 'Roughly how many customers per day?', cols: 2,
          options: ['Under 20', '20–50', '50–100', '100+'] },
        { name: 'listInterest', type: 'radio', required: true, q: 'Would you list your products on next to get more orders?',
          options: ['🤩 Yes, very interested', '🙂 Probably', '🤔 Maybe', '🙅 Not now'] },
        { name: 'appComfort', type: 'radio', required: true, q: 'Comfortable managing orders on a phone app?', cols: 3,
          options: ['Very', 'Somewhat', 'Need help'] },
        { name: 'commission', type: 'radio', required: true, q: 'A fair commission per order would be…', cols: 2,
          options: ['Up to 5%', '5–10%', '10–15%', 'Prefer flat fee'] },
        { name: 'stockEssentials', type: 'radio', required: true, q: 'Do you keep daily essentials in stock?', cols: 3,
          options: ['Yes, lots', 'Some', 'No'] }
      ]
    }
  ];

  // Closing step (all roles)
  var closingStep = {
    id: 'closing',
    eyebrow: 'Almost done',
    title: 'Anything else + stay in the loop',
    help: 'Join the waitlist to be among the first when next goes live.',
    fields: [
      { name: 'comments', type: 'textarea', optional: true, q: 'Anything you want next to know?', placeholder: 'Ideas, worries, products you miss…' },
      { name: 'joinWaitlist', type: 'radio', required: true, q: 'Want early access / launch updates?', cols: 2,
        options: ['✅ Yes, add me', 'No thanks'] },
      { name: 'contact', type: 'text', q: 'Phone or email for updates', sub: 'Only if you said yes above.', placeholder: 'e.g. 98XXXXXXXX or you@email.com', dependsOn: { field: 'joinWaitlist', value: '✅ Yes, add me' } }
    ]
  };

  var roleStep = {
    id: 'role',
    eyebrow: 'Welcome to next',
    title: 'First, who are you?',
    help: "We'll ask a few questions made just for you.",
    isRole: true
  };

  var ROLES = [
    { value: 'customer', ic: '🛒', t: 'I want to order', d: 'A shopper / customer' },
    { value: 'rider', ic: '🛵', t: 'I want to deliver', d: 'A delivery rider' },
    { value: 'merchant', ic: '🏪', t: 'I own a shop', d: 'A merchant / seller' }
  ];

  /* ---------- State ---------- */
  var state = { role: null, data: {} };
  var steps = [roleStep, profileStep, closingStep]; // recomputed after role chosen
  var current = 0;

  function computeSteps() {
    var mid = [];
    if (state.role === 'customer') mid = customerSteps;
    else if (state.role === 'rider') mid = riderSteps;
    else if (state.role === 'merchant') mid = merchantSteps;
    steps = [roleStep, profileStep].concat(mid).concat([closingStep]);
  }

  /* ---------- DOM helpers ---------- */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  /* ---------- Rendering ---------- */
  function render() {
    var host = $('#steps');
    host.innerHTML = '';
    var step = steps[current];

    var wrap = el('div', 'step active');
    wrap.appendChild(el('div', 'step-eyebrow', step.eyebrow));
    wrap.appendChild(el('h2', null, step.title));
    if (step.help) wrap.appendChild(el('p', 'help', step.help));

    if (step.isRole) {
      wrap.appendChild(renderRoles());
    } else {
      step.fields.forEach(function (f) {
        var node = renderField(f);
        if (node) wrap.appendChild(node);
      });
    }
    host.appendChild(wrap);

    updateChrome();
    applyDependencies();
  }

  function renderRoles() {
    var grid = el('div', 'roles');
    ROLES.forEach(function (r) {
      var c = el('div', 'role' + (state.role === r.value ? ' selected' : ''));
      c.setAttribute('role', 'button');
      c.setAttribute('tabindex', '0');
      c.innerHTML = '<div class="ic">' + r.ic + '</div><div class="t">' + r.t + '</div><div class="d">' + r.d + '</div>';
      function pick() {
        state.role = r.value;
        computeSteps();
        Array.prototype.forEach.call(grid.children, function (ch) { ch.classList.remove('selected'); });
        c.classList.add('selected');
        updateChrome();
      }
      c.addEventListener('click', pick);
      c.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
      grid.appendChild(c);
    });
    return grid;
  }

  function renderField(f) {
    var field = el('div', 'field');
    field.dataset.name = f.name;
    if (f.dependsOn) field.dataset.depends = JSON.stringify(f.dependsOn);

    var label = el('label', 'q');
    label.setAttribute('for', 'f_' + f.name);
    label.innerHTML = f.q + (f.required ? ' <span class="req">*</span>' : (f.optional ? ' <span class="optional">(optional)</span>' : ''));
    field.appendChild(label);
    if (f.sub) field.appendChild(el('div', 'sub', f.sub));

    var saved = state.data[f.name];

    if (f.type === 'text' || f.type === 'email' || f.type === 'tel') {
      var inp = el('input');
      inp.type = f.type;
      inp.id = 'f_' + f.name;
      inp.name = f.name;
      if (f.placeholder) inp.placeholder = f.placeholder;
      if (f.inputmode) inp.setAttribute('inputmode', f.inputmode);
      inp.value = saved != null ? saved : (f.value || '');
      inp.addEventListener('input', function () { state.data[f.name] = inp.value; clearErr(field); });
      field.appendChild(inp);
    } else if (f.type === 'textarea') {
      var ta = el('textarea');
      ta.id = 'f_' + f.name; ta.name = f.name;
      if (f.placeholder) ta.placeholder = f.placeholder;
      ta.value = saved || '';
      ta.addEventListener('input', function () { state.data[f.name] = ta.value; });
      field.appendChild(ta);
    } else if (f.type === 'radio' || f.type === 'checkbox') {
      var opts = el('div', 'options' + (f.cols ? ' cols-' + f.cols : ''));
      f.options.forEach(function (optText) {
        var lab = el('label', 'opt' + (f.type === 'checkbox' ? ' check' : ''));
        var input = el('input');
        input.type = f.type === 'checkbox' ? 'checkbox' : 'radio';
        input.name = f.name;
        input.value = optText;
        if (f.type === 'checkbox') {
          if (Array.isArray(saved) && saved.indexOf(optText) > -1) input.checked = true;
        } else if (saved === optText) input.checked = true;

        input.addEventListener('change', function () {
          if (f.type === 'checkbox') {
            var arr = Array.isArray(state.data[f.name]) ? state.data[f.name] : [];
            if (input.checked) { if (arr.indexOf(optText) < 0) arr.push(optText); }
            else { arr = arr.filter(function (v) { return v !== optText; }); }
            state.data[f.name] = arr;
          } else {
            state.data[f.name] = optText;
          }
          clearErr(field);
          applyDependencies();
        });

        lab.appendChild(input);
        lab.appendChild(el('span', 'mark'));
        lab.appendChild(el('span', 'label', optText));
        opts.appendChild(lab);
      });
      field.appendChild(opts);
    } else if (f.type === 'scale') {
      var scale = el('div', 'scale');
      for (var i = 0; i <= 10; i++) {
        (function (n) {
          var b = el('button', saved == n ? 'sel' : null, String(n));
          b.type = 'button';
          b.addEventListener('click', function () {
            state.data[f.name] = n;
            Array.prototype.forEach.call(scale.children, function (c) { c.classList.remove('sel'); });
            b.classList.add('sel');
            clearErr(field);
          });
          scale.appendChild(b);
        })(i);
      }
      field.appendChild(scale);
      var legend = el('div', 'scale-legend');
      legend.appendChild(el('span', null, f.low || '0'));
      legend.appendChild(el('span', null, f.high || '10'));
      field.appendChild(legend);
    }

    field.appendChild(el('div', 'err-msg', 'Please answer this question.'));
    return field;
  }

  /* ---------- conditional fields ---------- */
  function applyDependencies() {
    var host = $('#steps');
    Array.prototype.forEach.call(host.querySelectorAll('.field[data-depends]'), function (field) {
      var dep = JSON.parse(field.dataset.depends);
      var show = state.data[dep.field] === dep.value;
      field.style.display = show ? '' : 'none';
    });
  }

  /* ---------- validation ---------- */
  function clearErr(field) {
    field.querySelector('.err-msg').classList.remove('show');
    var inp = field.querySelector('input, textarea, select');
    if (inp) inp.classList.remove('input-error');
  }
  function showErr(field, msg) {
    var e = field.querySelector('.err-msg');
    e.textContent = msg || 'Please answer this question.';
    e.classList.add('show');
    var inp = field.querySelector('input[type=text], input[type=email], input[type=tel], textarea');
    if (inp) inp.classList.add('input-error');
  }

  function validateStep() {
    var step = steps[current];
    if (step.isRole) {
      if (!state.role) { alert('Please choose one option to continue.'); return false; }
      return true;
    }
    var ok = true, firstBad = null;
    var host = $('#steps');
    step.fields.forEach(function (f) {
      var field = host.querySelector('.field[data-name="' + f.name + '"]');
      if (!field || field.style.display === 'none') return;
      var v = state.data[f.name];
      var empty = (f.type === 'checkbox') ? (!Array.isArray(v) || v.length === 0)
        : (f.type === 'scale') ? (v === undefined || v === null)
        : (!v || String(v).trim() === '');
      if (f.required && empty) {
        showErr(field);
        ok = false; if (!firstBad) firstBad = field;
      }
      // light format checks
      if (f.name === 'pincode' && v && !/^\d{6}$/.test(String(v).trim())) {
        showErr(field, 'Enter a valid 6-digit pincode.'); ok = false; if (!firstBad) firstBad = field;
      }
      if (f.name === 'contact' && field.style.display !== 'none' && state.data.joinWaitlist === '✅ Yes, add me') {
        if (!v || String(v).trim() === '') { showErr(field, 'Please add a phone or email so we can reach you.'); ok = false; if (!firstBad) firstBad = field; }
      }
    });
    if (firstBad) firstBad.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return ok;
  }

  /* ---------- chrome (progress + buttons) ---------- */
  function updateChrome() {
    var total = steps.length;
    var n = current + 1;
    $('#stepLabel').textContent = steps[current].eyebrow || ('Step ' + n);
    $('#stepCount').textContent = n + ' / ' + total;
    $('#progressFill').style.width = Math.round((n / total) * 100) + '%';
    $('#backBtn').style.display = current === 0 ? 'none' : '';
    var isLast = current === steps.length - 1;
    $('#nextBtn').innerHTML = isLast ? 'Submit survey <span class="arrow">✓</span>' : 'Continue <span class="arrow">→</span>';
  }

  /* ---------- navigation ---------- */
  function next() {
    if (!validateStep()) return;
    if (current === 0) computeSteps(); // ensure role steps included
    if (current < steps.length - 1) {
      current++;
      render();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      submit();
    }
  }
  function back() {
    if (current > 0) { current--; render(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  }

  /* ---------- submit ---------- */
  function submit() {
    var btn = $('#nextBtn');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Sending…';

    var payload = Object.assign({ role: state.role }, state.data);
    payload.joinWaitlist = state.data.joinWaitlist === '✅ Yes, add me';

    fetch('/api/survey', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (r) { return r.json(); })
      .then(function (res) {
        if (res && res.ok) showThankYou();
        else throw new Error('save failed');
      })
      .catch(function () {
        btn.disabled = false;
        btn.innerHTML = 'Submit survey <span class="arrow">✓</span>';
        alert('Sorry, something went wrong saving your answers. Please try again.');
      });
  }

  function showThankYou() {
    $('#progressWrap').style.display = 'none';
    var waitlisted = state.data.joinWaitlist === '✅ Yes, add me';
    $('#surveyCard').innerHTML =
      '<div class="done">' +
        '<div class="badge"><svg viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#00D26A" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg></div>' +
        '<h2>Thank you! 🎉</h2>' +
        '<p>' + (waitlisted
          ? "You're on the waitlist — we'll reach out the moment next launches near you."
          : 'Your answers help us decide how to launch next in 721401. We really appreciate it.') + '</p>' +
        '<div class="actions" style="justify-content:center;">' +
          '<button class="btn btn-ghost" id="againBtn">Submit another response</button>' +
          '<a class="btn btn-green" href="/">Back to home</a>' +
        '</div>' +
      '</div>';
    var again = document.getElementById('againBtn');
    if (again) again.addEventListener('click', function () { location.reload(); });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ---------- boot ---------- */
  function startSurvey() {
    $('#hero').style.display = 'none';
    $('#surveyCard').style.display = '';
    current = 0;
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  document.addEventListener('DOMContentLoaded', function () {
    $('#startBtn').addEventListener('click', startSurvey);
    $('#nextBtn').addEventListener('click', next);
    $('#backBtn').addEventListener('click', back);
    // allow deep-link ?start=1
    if (/[?&]start=1/.test(location.search)) startSurvey();
  });
})();
