/* The Agent Doctrine: interactive tools. Nothing here stores or sends what the reader enters. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var el = function (tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  };
  var LEVELS = ['', 'Unknown', 'Listed', 'Owned', 'Controlled', 'Assured'];
  var todayISO = function () {
    var d = new Date();
    var p = function (n) { return (n < 10 ? '0' : '') + n; };
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
  };
  function copyText(text, note) {
    var done = function (ok) { note.textContent = ok ? 'Copied. Paste it into a mail or a document.' : 'Copying is not available here. Select the text on the page instead.'; };
    try {
      navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(false); });
    } catch (e) { done(false); }
  }

  /* ---------- Ladder Assessment: same rules as the Excel file ---------- */
  var DIMS = [
    ['Inventory', [
      'Do we have a list of agents, reconciled against the platforms and at least two other sources in the last quarter?',
      'Does every entry in scope have the fields from A.2 filled in?',
      'Is the record synchronised from the platforms, with differences followed up each month?',
      'Has completeness been tested in both directions by the risk function or internal audit in the last year?']],
    ['Ownership', [
      'Do we know who built each agent on the list?',
      'Does every agent in scope have an owner who accepted in writing, a purpose sentence and an end date?',
      'Are large agents renewed on evidence, and is every missed end date reported?',
      'Has the board approved a risk appetite for agents and a target level?']],
    ['Access and limits', [
      'Do we know which identity each agent runs under?',
      'Do large agents have their own identity, and is every agent sized using the floors?',
      'Are tolerances written and held outside the agent, and is access reviewed on schedule?',
      'Are limits approved and widened by someone other than the owner?']],
    ['Assurance', [
      'Do we know which agents were tested before they went live?',
      'Does each medium or larger agent have a test set with known answers?',
      'Over the last year, was the test repeated after every change, and do we count changes found?',
      'Are test sets for large agents owned outside the builder, and are results reviewed independently?']],
    ['Response', [
      'Do we know who can switch each agent off?',
      'Is a stop holder named for each agent, and are the five incident types defined?',
      'Is the stop tested and timed, are logs sampled, and are incidents reviewed?',
      'Is there an exercised manual procedure for agents in critical processes?']],
    ['Suppliers', [
      'Do we know which suppliers and models each agent depends on?',
      'Have we read the terms that govern the agent features we use, and is our role under the AI Act recorded?',
      'Do the terms for large agents cover the twelve areas in A.10?',
      'Is exit described for agents in critical functions, and is concentration reported to the board?']]
  ];
  var TESTS = {
    2: ['Reconcile in both directions: from platforms, identity system, licences and provider invoices to the record, and from a sample of the record back.', 'The reconciliation, dated, with differences explained.'],
    3: ['For a sample of entries: owner accepted in writing, and purpose, end date, size and stop holder are in the record.', 'The entries and acceptances. An owner’s recollection does not count.'],
    4: ['For every large and extra large agent, over twelve months: changes approved against changes found, tests per change, log reviews, stop test with time.', 'Records from the period.'],
    5: ['Confirmation by the risk function, a review by internal audit, supplier terms for each large agent, decisions recorded on findings.', 'Dated confirmation, audit report, the terms, the minutes.']
  };
  /* answers: 24 items {a:'Yes'|'No'|'', e:string, d:'YYYY-MM-DD'|''} in the order of the Assessment sheet */
  function ladderStatus(x) { return !x.a ? '' : x.a === 'Yes' ? (x.e ? 'Counts' : 'Evidence missing') : 'No'; }
  function ladderResult(answers) {
    var st = answers.map(ladderStatus), dims = [], i, k;
    for (i = 0; i < 6; i++) {
      var lvl = 5;
      for (k = 0; k < 4; k++) if (st[i * 4 + k] !== 'Counts') { lvl = k + 1; break; }
      dims.push(lvl);
    }
    var org = Math.min.apply(null, dims);
    var dates = answers.filter(function (x) { return x.a === 'Yes' && x.d; }).map(function (x) { return x.d; }).sort();
    return {
      status: st, dims: dims, level: org,
      lowest: DIMS.filter(function (d, n) { return dims[n] === org; }).map(function (d) { return d[0]; }),
      oldest: dates.length ? dates[0] : '',
      noEvidence: st.filter(function (s) { return s === 'Evidence missing'; }).length
    };
  }

  /* ---------- Agent Register: same Check as the Excel file ---------- */
  var SIZES = ['Small', 'Medium', 'Large', 'Extra large'];
  var FLOORS = [
    ['Acts on its own with write access to financial records', 'Large'],
    ['Produces output that reaches customers without review', 'Large'],
    ['Reads confidential or sensitive personal data at scale', 'Large'],
    ['Supports a critical function', 'Extra large'],
    ['Can change production systems on its own', 'Extra large']
  ];
  function edate(iso, months) {
    var y = Number(iso.slice(0, 4)), m = Number(iso.slice(5, 7)) - 1 + months, d = Number(iso.slice(8, 10));
    y += Math.floor(m / 12); m = ((m % 12) + 12) % 12;
    var last = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
    if (d > last) d = last;
    var p = function (n) { return (n < 10 ? '0' : '') + n; };
    return y + '-' + p(m + 1) + '-' + p(d);
  }
  /* returns the checks that apply, in the order of the Check column; open ones carry the message of the Excel file */
  function registerChecks(e, today) {
    var out = [], big = e.size === 'Large' || e.size === 'Extra large';
    var add = function (label, open, msg) { out.push({ label: label, open: !!open, msg: open ? msg : '' }); };
    add('Owner', !e.owner, 'Owner missing');
    add('Purpose', !e.purpose, 'Purpose missing');
    add('Size', !e.size, 'Size missing');
    if (e.size) add('Reason for size', !e.reason, 'Reason for size missing');
    add('Legal position', !e.legal, 'Legal position missing');
    if (e.size && e.size !== 'Small') add('Limits', !e.limits, 'Limits missing');
    add('Stop holder', !e.stop, 'Stop holder missing');
    add('End date', !e.end || e.end < today, !e.end ? 'End date missing' : 'End date passed');
    if (e.size === 'Small' && e.approved && e.end) add('Renewal interval', e.end > edate(e.approved, 12), 'End date beyond 12 months');
    if (e.size === 'Extra large' && e.approved && e.end) add('Renewal interval', e.end > edate(e.approved, 6), 'End date beyond 6 months');
    if (big) {
      add('Sponsor', !e.sponsor, 'Sponsor missing');
      add('Own identity', e.identity !== 'Its own', 'Needs its own identity');
      add('Deputy', !e.deputy, 'Deputy missing');
    }
    return out;
  }
  function registerCheckText(e, today) {
    if (!e.name) return '';
    var open = registerChecks(e, today).filter(function (c) { return c.open; }).map(function (c) { return c.msg; });
    return open.length ? open.join('; ') : 'OK';
  }
  window.agentDoctrineTools = { ladderResult: ladderResult, registerCheckText: registerCheckText, edate: edate };

  /* ---------- Ladder Assessment page ---------- */
  (function () {
    var root = $('#ladder-tool');
    if (!root) return;
    var form = $('#ladder-form'), side = $('#ladder-result');
    var answers = [], nodes = [], heads = [];
    for (var n = 0; n < 24; n++) answers.push({ a: '', e: '', d: '' });
    var target = '', confirmed = '';

    DIMS.forEach(function (dim, di) {
      var g = el('details', 't-group');
      if (di === 0) g.open = true;
      var sum = el('summary');
      sum.appendChild(el('span', '', dim[0]));
      var lv = el('span', 'lvl');
      sum.appendChild(lv);
      heads.push(lv);
      g.appendChild(sum);
      var inn = el('div', 'in');
      dim[1].forEach(function (q, qi) {
        var idx = di * 4 + qi;
        var box = el('div', 't-q');
        box.appendChild(el('span', 'lv', 'Level ' + (qi + 2)));
        box.appendChild(el('p', '', q));
        var row = el('div', 'row');
        var seg = el('div', 'g-seg');
        seg.setAttribute('role', 'group');
        seg.setAttribute('aria-label', dim[0] + ', level ' + (qi + 2));
        var btns = ['Yes', 'No'].map(function (t) {
          var b = el('button', '', t);
          b.type = 'button';
          b.setAttribute('aria-pressed', 'false');
          b.addEventListener('click', function () {
            answers[idx].a = answers[idx].a === t ? '' : t;
            render();
          });
          seg.appendChild(b);
          return b;
        });
        row.appendChild(seg);
        var st = el('span', 't-st');
        row.appendChild(st);
        box.appendChild(row);
        var ev = el('div', 't-two t-ev');
        var f1 = el('label', 't-field');
        f1.appendChild(el('span', '', 'Evidence'));
        var i1 = el('input');
        i1.type = 'text';
        i1.setAttribute('autocomplete', 'off');
        i1.addEventListener('input', function () { answers[idx].e = i1.value.trim(); render(); });
        f1.appendChild(i1);
        var f2 = el('label', 't-field');
        f2.appendChild(el('span', '', 'Date of evidence'));
        var i2 = el('input');
        i2.type = 'date';
        i2.addEventListener('input', function () { answers[idx].d = i2.value; render(); });
        f2.appendChild(i2);
        ev.appendChild(f1);
        ev.appendChild(f2);
        box.appendChild(ev);
        inn.appendChild(box);
        nodes.push({ btns: btns, st: st, ev: ev, i1: i1, i2: i2 });
      });
      g.appendChild(inn);
      form.appendChild(g);
    });

    function summary(r) {
      var lines = ['The Agent Doctrine: Ladder Assessment',
        'Reported level: ' + r.level + ' ' + LEVELS[r.level],
        'Lowest dimensions: ' + r.lowest.join(', '),
        'Target level: ' + (target || 'not entered'),
        'Date of the oldest evidence: ' + (r.oldest || 'none'),
        'Answers without evidence: ' + r.noEvidence,
        'Confirmed by: ' + (confirmed || 'not entered'), ''];
      DIMS.forEach(function (d, i) { lines.push(d[0] + ': ' + r.dims[i] + ' ' + LEVELS[r.dims[i]]); });
      lines.push('', 'Source: elkaermeisner.com/doctrine. The Agent Doctrine by Michael Elkær Meisner, CC BY 4.0.');
      return lines.join('\n');
    }

    function render() {
      var r = ladderResult(answers);
      nodes.forEach(function (nd, i) {
        var a = answers[i].a, s = r.status[i];
        nd.btns.forEach(function (b) { b.setAttribute('aria-pressed', b.textContent === a ? 'true' : 'false'); });
        nd.st.textContent = s || 'Not answered';
        nd.st.className = 't-st' + (s === 'Counts' ? ' counts' : s === 'Evidence missing' ? ' missing' : s === 'No' ? ' no' : '');
        nd.ev.hidden = a !== 'Yes';
        if (nd.i1.value.trim() !== answers[i].e) nd.i1.value = answers[i].e;
        if (nd.i2.value !== answers[i].d) nd.i2.value = answers[i].d;
      });
      heads.forEach(function (h, i) { h.textContent = 'Level ' + r.dims[i] + ', ' + LEVELS[r.dims[i]]; });

      side.textContent = '';
      var top = el('div', 'g-result' + (r.level >= 2 ? ' is-ok' : ''));
      top.appendChild(el('span', 'g-label', 'The organisation: the lowest of the six'));
      top.appendChild(el('div', 'big', 'Level ' + r.level + ', ' + LEVELS[r.level]));
      var ul = el('ul', 'g-profile');
      DIMS.forEach(function (d, i) {
        var li = el('li');
        li.appendChild(el('span', '', d[0]));
        var tr = el('span', 'track');
        for (var k = 1; k <= 5; k++) tr.appendChild(el('span', k <= r.dims[i] ? (r.dims[i] === r.level ? 'low' : 'f') : ''));
        tr.setAttribute('role', 'img');
        tr.setAttribute('aria-label', 'Level ' + r.dims[i]);
        li.appendChild(tr);
        ul.appendChild(li);
      });
      top.appendChild(ul);
      side.appendChild(top);

      var rep = el('div', 'g-result');
      rep.appendChild(el('span', 'g-label', 'For the report'));
      var kv = el('ul', 't-kv');
      [['Reported level', r.level + ' ' + LEVELS[r.level]], ['Lowest dimensions', r.lowest.join(', ')],
        ['Date of the oldest evidence', r.oldest || 'None'], ['Answers without evidence', String(r.noEvidence)]].forEach(function (p) {
        var li = el('li');
        li.appendChild(el('span', '', p[0]));
        li.appendChild(el('span', '', p[1]));
        kv.appendChild(li);
      });
      rep.appendChild(kv);
      var two = el('div', 't-two');
      var f1 = el('label', 't-field');
      f1.appendChild(el('span', '', 'Target level'));
      var sel = el('select');
      ['', '2', '3', '4', '5'].forEach(function (v) {
        var o = el('option', '', v ? v + ' ' + LEVELS[Number(v)] : 'Not entered');
        o.value = v;
        if (v === target) o.selected = true;
        sel.appendChild(o);
      });
      sel.addEventListener('change', function () { target = sel.value; });
      f1.appendChild(sel);
      var f2 = el('label', 't-field');
      f2.appendChild(el('span', '', 'Confirmed by'));
      var inp = el('input');
      inp.type = 'text';
      inp.value = confirmed;
      inp.setAttribute('autocomplete', 'off');
      inp.addEventListener('input', function () { confirmed = inp.value.trim(); });
      f2.appendChild(inp);
      two.appendChild(f1);
      two.appendChild(f2);
      rep.appendChild(two);
      var bar = el('div', 't-bar');
      var cp = el('button', 'btn btn-dark', 'Copy the result');
      cp.type = 'button';
      var note = el('p', 't-copy-note');
      note.setAttribute('aria-live', 'polite');
      cp.addEventListener('click', function () { copyText(summary(ladderResult(answers)), note); });
      bar.appendChild(cp);
      rep.appendChild(bar);
      rep.appendChild(note);
      side.appendChild(rep);

      var tst = el('div', 'g-result');
      tst.appendChild(el('span', 'g-label', 'Before the level is reported'));
      if (r.level === 1) {
        tst.appendChild(el('p', '', 'Level 1 is the starting point. If the first question in a dimension cannot be answered yes, the dimension is at level 1.'));
      } else {
        tst.appendChild(el('p', '', 'Test for level ' + r.level + ', ' + LEVELS[r.level] + ': ' + TESTS[r.level][0]));
        tst.appendChild(el('p', '', 'Evidence: ' + TESTS[r.level][1]));
        tst.appendChild(el('p', 'g-note', 'The first line reports the level, and the risk function confirms it.'));
      }
      side.appendChild(tst);

      if (r.level < 5) {
        var nx = el('div', 'g-result');
        nx.appendChild(el('span', 'g-label', 'Where the next effort goes'));
        nx.appendChild(el('p', '', 'The first question that does not yet count in each of the lowest dimensions.'));
        var cl = el('ul', 't-ctrl');
        DIMS.forEach(function (d, i) {
          if (r.dims[i] !== r.level) return;
          var li = el('li');
          li.appendChild(el('strong', '', d[0] + ', level ' + (r.level + 1)));
          li.appendChild(document.createTextNode(d[1][r.level - 1]));
          cl.appendChild(li);
        });
        nx.appendChild(cl);
        side.appendChild(nx);
      }
    }

    $('#ladder-example').addEventListener('click', function () {
      var ex = 'YYN-YN--YYYNYN--YYN-YN--';
      answers = ex.split('').map(function (c) {
        return c === 'Y' ? { a: 'Yes', e: 'Example entry', d: '2026-10-01' } : { a: c === 'N' ? 'No' : '', e: '', d: '' };
      });
      render();
    });
    $('#ladder-clear').addEventListener('click', function () {
      answers = answers.map(function () { return { a: '', e: '', d: '' }; });
      target = ''; confirmed = '';
      render();
    });
    render();
  })();

  /* ---------- Agent Register page ---------- */
  (function () {
    var root = $('#register-tool');
    if (!root) return;
    var form = $('#register-form'), side = $('#register-result');
    var GROUPS = [
      ['Who answers', [
        ['name', 'Name and identifier', 'Unambiguous name', 'text'],
        ['cls', 'Class', '', ['Individual agent', 'Personal assistants (class)', 'Agent feature in bought software']],
        ['owner', 'Owner', 'A named person', 'text'],
        ['sponsor', 'Sponsor', 'A named person. Sponsor for large agents', 'text'],
        ['purpose', 'Purpose', 'One sentence: input, action, recipient', 'area'],
        ['trigger', 'Trigger', 'A person asking, or an event', 'text']]],
      ['What it may do', [
        ['identity', 'Identity', 'Its own, its builder’s or its user’s', ['', 'Its own', 'Its builder\'s', 'Its user\'s']],
        ['users', 'Who may use it', 'People or systems', 'text'],
        ['data', 'Data sources', 'What it can read', 'area'],
        ['untrusted', 'Untrusted sources', 'Mark untrusted sources', 'text'],
        ['perms', 'Permissions and tools', 'What it can do', 'area'],
        ['platform', 'Platform and model', 'Including whose model', 'text'],
        ['limits', 'Limits', 'The tolerances and how each is held', 'area']]],
      ['Size and legal position', [
        ['floor', 'Floor that applies', 'The floors are the organisation’s own. These five are the example from chapter 8', [''].concat(FLOORS.map(function (f) { return f[0]; }))],
        ['size', 'Size', 'Small, medium, large, extra large', [''].concat(SIZES)],
        ['reason', 'Reason for size', '', 'text'],
        ['legal', 'Legal position', 'AI Act classification and role, with date', 'text'],
        ['legalDate', 'Legal assessment date', '', 'date']]],
      ['How we know', [
        ['test', 'Test evidence', 'Test set, latest result, model version tested', 'area'],
        ['gate', 'Gate', 'Where the agent is in the lifecycle', ['', 'Proposed', 'Sized and classified', 'Limits approved', 'Tested', 'Live', 'Changed or renewed', 'Retired']],
        ['reads', 'Reads from', 'Which systems the agent reads from', 'text'],
        ['used', 'Output used by', 'Which processes use its output', 'text'],
        ['calls', 'Calls other agents', 'Which other agents it calls', 'text']]],
      ['End and stop', [
        ['stop', 'Stop holder', 'A named person', 'text'],
        ['deputy', 'Deputy', 'A named person', 'text'],
        ['approved', 'Approved or last renewed', '', 'date'],
        ['end', 'End date', 'Renewal or retirement', 'date'],
        ['rule', 'End date rule', '', 'text']]]
    ];
    var EX = {
      voice: { name: 'Critical voice, programme X', cls: 'Individual agent', owner: 'Head of internal audit', sponsor: 'Chief executive',
        purpose: 'Reads the monthly governance material for programme X and lists, on one page, the points that do not hold together',
        trigger: 'Monthly, when the material is filed', identity: 'Its own', users: 'The steward in internal audit',
        data: 'Status reports, risk log, budget follow-up, supplier invoices, decision papers', untrusted: 'Invoices and reports',
        perms: 'Read access to one named folder. Writes one page. No other tools', platform: 'Approved internal platform. The supplier\'s model',
        size: 'Large', reason: 'Floor for confidential material', floor: 'Reads confidential or sensitive personal data at scale',
        legal: 'Recorded separately, with the date of the assessment', limits: 'No action, no recommendation, no named individuals. Held by its permissions',
        test: 'Material from closed programmes with known outcomes', stop: 'Head of internal audit', deputy: 'Named deputy', gate: 'Limits approved',
        approved: '2026-11-02', end: '2027-11-02', rule: 'Programme closure, at most twelve months from approval' },
      complaint: { name: 'Complaint agent', cls: 'Individual agent', owner: 'The head of customer service',
        purpose: 'Sorts incoming complaints into five queues and proposes replies to the small ones', trigger: 'A complaint arriving in the mailbox',
        identity: 'Its own', users: 'The twelve complaint handlers', data: 'The complaints mailbox and the customer file', untrusted: 'The complaints mailbox',
        perms: 'Writes drafts in the case system. It cannot send', platform: 'The platform vendor and, through it, the model provider',
        size: 'Large', reason: 'Its replies concern customers and contain their personal data', legal: 'Recorded separately, with the date of the assessment',
        limits: 'Five tolerances, each held outside the agent. It proposes and does not send', test: 'Three hundred past complaints, owned by the quality team',
        stop: 'The head of customer service', deputy: 'Named deputy', gate: 'Live', end: '2027-06-30', rule: '30 June, then every six months',
        reads: 'The complaints mailbox, the customer file', used: 'Complaint handling, the case system' }
    };
    var CONTROLS = [
      ['Owner, purpose, record', 'Required. Small may be a class', 'Required, individually'],
      ['End date', 'Automatic suspension', 'Escalation and reported deviation. No automatic stop'],
      ['Identity', 'Any of the three, recorded', 'Its own identity. Access reviewed on schedule'],
      ['Limits', 'Purpose sentence for small. Tolerances for medium', 'Tolerances, each held outside the agent, approved outside the owner'],
      ['Test', 'Short check for small. Test set for medium', 'Test set owned outside the builder. Sampling in operation'],
      ['Change', 'Owner approves. Standard route for patterns', 'Forum approves. Tests repeated'],
      ['Log', 'Minimum: run, versions, identity', 'Full trace, out of the steward’s reach, sampled by someone else'],
      ['Stop', 'Owner or platform owner', 'Named holder and deputy, cover at night, tested and timed'],
      ['Incidents', 'All five types recorded', 'Recorded and reviewed in the forum']
    ];
    var entry = {}, inputs = {}, labels = {};
    GROUPS.forEach(function (g, gi) {
      var d = el('details', 't-group');
      if (gi === 0) d.open = true;
      var sum = el('summary');
      sum.appendChild(el('span', '', (gi + 1) + ' ' + g[0]));
      d.appendChild(sum);
      var inn = el('div', 'in');
      g[1].forEach(function (f) {
        entry[f[0]] = '';
        labels[f[0]] = f[1];
        var lab = el('label', 't-field');
        lab.appendChild(el('span', '', f[1]));
        if (f[2]) lab.appendChild(el('small', '', f[2]));
        var inp;
        if (Array.isArray(f[3])) {
          inp = el('select');
          f[3].forEach(function (v) { var o = el('option', '', v || 'Not entered'); o.value = v; inp.appendChild(o); });
        } else if (f[3] === 'area') {
          inp = el('textarea');
        } else {
          inp = el('input');
          inp.type = f[3];
          inp.setAttribute('autocomplete', 'off');
        }
        inp.addEventListener(inp.tagName === 'SELECT' ? 'change' : 'input', function () { entry[f[0]] = inp.value.trim(); render(); });
        inputs[f[0]] = inp;
        lab.appendChild(inp);
        inn.appendChild(lab);
      });
      d.appendChild(inn);
      form.appendChild(d);
    });
    entry.cls = 'Individual agent';

    function load(e) {
      Object.keys(entry).forEach(function (k) { entry[k] = e[k] || ''; inputs[k].value = entry[k]; });
      if (!entry.cls) { entry.cls = 'Individual agent'; inputs.cls.value = entry.cls; }
      render();
    }
    function summary(text) {
      var lines = ['The Agent Doctrine: Agent Register, one entry', 'Check: ' + (text || 'no name entered'), ''];
      Object.keys(entry).forEach(function (k) { if (entry[k]) lines.push(labels[k] + ': ' + entry[k]); });
      lines.push('', 'Source: elkaermeisner.com/doctrine. The Agent Doctrine by Michael Elkær Meisner, CC BY 4.0.');
      return lines.join('\n');
    }
    function render() {
      var today = todayISO();
      var text = registerCheckText(entry, today);
      var checks = registerChecks(entry, today);
      side.textContent = '';
      var top = el('div', 'g-result' + (text === 'OK' ? ' is-ok' : text ? ' is-alert' : ''));
      top.appendChild(el('span', 'g-label', 'Check'));
      if (!text) {
        top.appendChild(el('p', '', 'Enter a name to start the check, or load one of the two entries from the book.'));
      } else {
        var open = checks.filter(function (c) { return c.open; }).length;
        top.appendChild(el('div', 'big', text === 'OK' ? 'OK' : open + ' open'));
        top.appendChild(el('p', '', text === 'OK' ? 'The Check finds nothing missing for this size.' : 'What the entry still lacks for its size.'));
        var ul = el('ul', 't-checks');
        checks.forEach(function (c) {
          var li = el('li', c.open ? 'open' : 'ok');
          li.appendChild(el('span', 's', c.open ? 'Open' : 'OK'));
          li.appendChild(el('span', '', c.open ? c.msg : c.label));
          ul.appendChild(li);
        });
        top.appendChild(ul);
        if (entry.end) {
          var days = Math.round((Date.parse(entry.end) - Date.parse(today)) / 86400000);
          top.appendChild(el('p', 'g-note', 'Days to end date: ' + days));
        }
      }
      side.appendChild(top);

      var fl = FLOORS.filter(function (f) { return f[0] === entry.floor; })[0];
      if (fl && entry.size && SIZES.indexOf(entry.size) < SIZES.indexOf(fl[1])) {
        var w = el('div', 'g-result is-alert');
        w.appendChild(el('span', 'g-label', 'Sized below a floor'));
        w.appendChild(el('p', '', 'With this floor the agent is at least ' + fl[1] + '. The floors set the smallest size an agent can be given.'));
        side.appendChild(w);
      }

      if (entry.size) {
        var big = entry.size === 'Large' || entry.size === 'Extra large';
        var c = el('div', 'g-result');
        c.appendChild(el('span', 'g-label', 'Controls for ' + (big ? 'large and extra large' : 'small and medium')));
        var cl = el('ul', 't-ctrl');
        CONTROLS.forEach(function (r) {
          var li = el('li');
          li.appendChild(el('strong', '', r[0]));
          li.appendChild(document.createTextNode(r[big ? 2 : 1]));
          cl.appendChild(li);
        });
        c.appendChild(cl);
        c.appendChild(el('p', 'g-note', 'Maximum renewal interval: twelve months for small agents, six for extra large.'));
        side.appendChild(c);
      }

      var cpb = el('div', 'g-result');
      cpb.appendChild(el('span', 'g-label', 'Take it with you'));
      var bar = el('div', 't-bar');
      bar.style.marginTop = '12px';
      var cp = el('button', 'btn btn-dark', 'Copy the entry');
      cp.type = 'button';
      var note = el('p', 't-copy-note');
      note.setAttribute('aria-live', 'polite');
      cp.addEventListener('click', function () { copyText(summary(registerCheckText(entry, todayISO())), note); });
      bar.appendChild(cp);
      cpb.appendChild(bar);
      cpb.appendChild(note);
      side.appendChild(cpb);
    }
    $('#register-voice').addEventListener('click', function () { load(EX.voice); });
    $('#register-complaint').addEventListener('click', function () { load(EX.complaint); });
    $('#register-clear').addEventListener('click', function () { load({}); });
    inputs.cls.value = entry.cls;
    render();
  })();
})();
