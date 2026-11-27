/* The Agent Doctrine: adaptation guide. Nothing here stores or sends what the reader enters. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var el = function (tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  };
  var root = $('#adapt');
  if (!root) return;

  /* in-page navigation: mark the step being read */
  (function () {
    var links = Array.prototype.slice.call(document.querySelectorAll('.g-nav a'));
    if (!links.length || !('IntersectionObserver' in window)) return;
    var byId = {};
    links.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (l) { l.removeAttribute('aria-current'); });
        byId[en.target.id].setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '-30% 0px -65% 0px' });
    Object.keys(byId).forEach(function (id) { var s = document.getElementById(id); if (s) io.observe(s); });
  })();
  var T = '../tools/The-Agent-Doctrine-';

  /* Each answer selects passages from the book. [text, source] */
  var QUESTIONS = [
    { id: 'scale', head: 'Starting point', q: 'How many agents does the organisation run, as far as you know?', opts: [
      ['About five', [['An organisation with five agents does not need a programme. It needs one page per agent with owner, purpose, end date, access and size, and one person who looks at the pages every quarter. That is level 3, and for five agents it is an afternoon’s work. The Regime scales down as well as up.', 'Chapter 14']]],
      ['Dozens or more', [['In about three months an organisation can find what it has, give the agents that matter an owner, a purpose, an end date and a size, and put limits and a stop on the largest. That is not the full Regime. It is enough to answer the board’s ten questions honestly, including the ones where the answer is “not yet”.', 'Chapter 13']]],
      ['We cannot say', [['Many organisations will find themselves on level 1. That is not a criticism. It is where every organisation stood with every new technology before it decided to look.', 'Chapter 14'],
        ['Use several sources and reconcile them: platform consoles, licences, application registrations in the identity system, keys and invoices from model providers, network traffic to model services, the release notes and administrator settings of systems already in use, where agent features may have arrived in an update, and a request to every department.', 'Appendix A.2']]]
    ] },
    { id: 'acts', head: 'Target on the ladder', q: 'What is the most your agents do?', opts: [
      ['They draft and propose for people to review', [['An organisation whose agents only draft text for people to review may be well served at level 3.', 'Chapter 14']]],
      ['Some act on their own', [['The first round covers agents that have their own access or act on their own.', 'Appendix A.1'],
        ['Agents that act are accepted under three conditions that can each be checked: the action can be undone, its value is limited, and someone can stop it.', 'Chapter 4']]],
      ['Some act in critical functions', [['One with agents acting in critical functions needs level 4 for those agents, and soon.', 'Chapter 14'],
        ['For agents in critical processes, keep a manual procedure and people who can perform it.', 'Appendix A.9']]]
    ], always: [['Choosing the target is a decision about risk appetite. It belongs to the board and to the minutes.', 'Chapter 14']] },
    { id: 'forum', head: 'Who decides', q: 'Is there a forum that already approves changes or accepts risk?', opts: [
      ['Yes', [['A forum that already exists, the body that approves changes or accepts risk today, takes the decisions on large agents. A separate AI committee that meets beside the existing governance tends to become a discussion club.', 'Chapter 13']]],
      ['No', [['What is needed is a place where decisions about large agents are taken, and most organisations already have such a place for changes or for risk.', 'Chapter 13'],
        ['One separation is not negotiable at any size: the person who owns a large agent does not approve it alone.', 'Chapter 13']]]
    ] },
    { id: 'lines', head: 'Who checks', q: 'Does the organisation have a risk function and internal audit?', opts: [
      ['Yes, three lines', [['The first line reports the level, the risk function confirms it, and internal audit reviews the Regime periodically.', 'Appendix A.11'],
        ['The risk function drafts the floors, from the appetite the board has set, and the forum that decides on large agents approves them.', 'Chapter 8']]],
      ['No', [['In organisations without three lines, the separation matters more than the vocabulary. In a company of two hundred people there may be no risk function and no internal audit. There is still a difference between the person who wants the agent and the person who says it may run, and between the person who keeps it and the person who checks it.', 'Chapter 13'],
        ['A managing director who signs off the three largest agents personally, having been shown the limits and the test result by someone other than the builder, has the essential separation in place.', 'Chapter 13']]]
    ] },
    { id: 'record', head: 'Where the record lives', q: 'Is there a configuration database that people use?', opts: [
      ['Yes', [['Use the configuration database if the organisation has one that people use, and synchronise it from the platforms.', 'Appendix A.2']]],
      ['No', [['A shared table is acceptable as a first step. Do not start by buying a tool.', 'Appendix A.2']]]
    ] },
    { id: 'assistants', head: 'Personal assistants', q: 'Do employees build or use personal assistants?', opts: [
      ['Yes', [['Personal assistants are recorded as one class. The class has an owner. Platform policy sets what they may connect to and whether they may be shared. A shared assistant becomes an agent with its own entry.', 'Appendix A.2']]],
      ['No, or not yet', [['The first round covers agents that have their own access or act on their own. Everything else is handled as classes.', 'Appendix A.1']]]
    ] },
    { id: 'appetite', head: 'Appetite and floors', q: 'Has the board approved a risk appetite for operational and technology risk?', opts: [
      ['Yes', [['A board that has approved a risk appetite for operational and technology risk has most of what it needs. What is usually missing is a statement about delegation to software.', 'Chapter 4'],
        ['The floors are the organisation’s own and follow the risk appetite the board has set.', 'Chapter 8']]],
      ['No', [['What cannot be handed down is the decision on how much the organisation is willing to delegate to software. That is a decision about risk appetite, and the appetite is the board’s.', 'Chapter 4'],
        ['The wording will differ from one organisation to the next. What matters is that it exists and that it is the board’s.', 'Chapter 4']]]
    ] },
    { id: 'incidents', head: 'Incidents and stop', q: 'Is there an incident process with severities and deadlines?', opts: [
      ['Yes', [['Record the five incident types and near misses in the existing incident process, with its severities and deadlines.', 'Appendix A.9']]],
      ['No', [['Most organisations have never had an agent incident, because they have never defined one. That is not the same as being safe.', 'Chapter 11'],
        ['Existing incident duties apply from day one.', 'Appendix A.1']]]
    ] },
    { id: 'vendors', head: 'Suppliers', q: 'Do agents run on a vendor’s platform or arrive inside bought software?', opts: [
      ['Yes', [['Agent features inside bought software are recorded per product, owned by the product owner. The vendor’s release notes are read as part of change control.', 'Appendix A.2'],
        ['Record the current settings for region, retention and training. Require notice of changes to them.', 'Appendix A.10']]],
      ['We build our own', [['Almost no agent is free of suppliers. In most cases the organisation has negotiated with none of them about agents.', 'Chapter 12']]]
    ] },
    { id: 'sector', head: 'Sector rules', q: 'Is the organisation under sector rules with a supervisor, such as DORA or NIS2?', opts: [
      ['Yes', [['Classify each case against the reporting rules that apply to the organisation.', 'Appendix A.9'],
        ['The book refers to DORA because its rules are the most specific. A reader under NIS2 should check the national rules that implement the directive.', 'Appendix B.4']]],
      ['No', [['Legal requirements are a floor, and a regulated organisation cannot choose a level below what the law demands. The ladder measures what is true above that floor.', 'Chapter 14']]]
    ], always: [['The author is not a lawyer, and nothing here is legal advice.', 'Appendix B']] }
  ];

  var TOOLS = [
    { name: 'First 90 Days', file: T + 'First-90-Days-v1.0.xlsx', items: [
      'Three decisions from executive management before day 1: who coordinates, which existing forum takes agent decisions, and the terms of the amnesty.',
      'The coordinator: a role for someone who knows how the organisation works in practice.',
      'The amnesty: decided by executive management, for a stated period. It covers the failure to register, and nothing else.',
      'The scope of the first round: agents that have their own access or act on their own.',
      'Who is responsible for each line of the plan.'] },
    { name: 'Agent Register', file: T + 'Agent-Register-v1.0.xlsx', page: '../tools/agent-register/', items: [
      'Where the record lives: the configuration database, or a shared table as a first step.',
      'The floors: five to eight, each a fact that can be read from the record without discussion.',
      'One reference agent for each size.',
      'The classes: personal assistants as one class, agent features inside bought software per product.',
      'The legal position, recorded separately from the size, with the date of the assessment.',
      'The sources used to find what exists, and who reconciles them.'] },
    { name: 'Ladder Assessment', file: T + 'Ladder-Assessment-v1.0.xlsx', page: '../tools/ladder-assessment/', items: [
      'Who reports the level, and who confirms it.',
      'The areas that matter, so that the lowest level among them is the one reported.',
      'The target level, decided by the board, and by when.',
      'What counts as evidence: a Yes without evidence does not count.'] },
    { name: 'Cost Measurement', file: T + 'Cost-Measurement-v1.0.xlsx', items: [
      'The number of people in each role, and who collects their hours.',
      'The costs that are not hours: licences for agent tooling, storage for logs, and any tool bought for the record.',
      'The number of agents the figures cover, so that they can be compared later.',
      'That it is measured in the first ninety days and reported with the first board page.'] },
    { name: 'Incident and Stop Log', file: T + 'Incident-and-Stop-Log-v1.0.xlsx', items: [
      'The five incident types and near misses, defined in the existing incident process.',
      'Which layers of a stop are used, decided in advance.',
      'A stop holder and a deputy, named, for each large agent.',
      'For every log: what is recorded, how long it is kept, and who reads it.',
      'That employees are told when their requests to an agent are logged.'] },
    { name: 'Supplier Terms Checklist', file: T + 'Supplier-Terms-Checklist-v1.0.docx', items: [
      'Which suppliers each agent depends on, including the model provider.',
      'Who reads the terms that actually govern the agent features in use. One checklist per supplier.',
      'The current settings for region, retention and training, recorded.',
      'The organisation’s role under the AI Act for each agent, recorded.'] },
    { name: 'The Board’s Quarterly Page', file: T + 'Board-Quarterly-Page-v1.0.docx', items: [
      'Who writes the page, and where each figure comes from.',
      'When the first page goes to the board. In the plan it is day ninety.',
      'The board’s right to go behind the page: to ask for the evidence under any line.',
      'The three decisions asked of the board: the appetite for delegation, the level to reach, and the approval of agents in critical functions.'] }
  ];
  var LINES = {
    "scale": [
      [
        "It needs one page per agent with owner, purpose, end date, access and size, and one person who looks at the pages every quarter.",
        "Chapter 14"
      ],
      [
        "In about three months an organisation can find what it has, give the agents that matter an owner, a purpose, an end date and a size, and put limits and a stop on the largest.",
        "Chapter 13"
      ],
      [
        "Inventory from all sources.",
        "Appendix A.1"
      ]
    ],
    "acts": [
      [
        "An organisation whose agents only draft text for people to review may be well served at level 3.",
        "Chapter 14"
      ],
      [
        "The first round covers agents that have their own access or act on their own.",
        "Appendix A.1"
      ],
      [
        "One with agents acting in critical functions needs level 4 for those agents, and soon.",
        "Chapter 14"
      ]
    ],
    "forum": [
      [
        "A forum that already exists, the body that approves changes or accepts risk today, takes the decisions on large agents.",
        "Chapter 13"
      ],
      [
        "One separation is not negotiable at any size: the person who owns a large agent does not approve it alone.",
        "Chapter 13"
      ]
    ],
    "lines": [
      [
        "The first line reports the level, the risk function confirms it, and internal audit reviews the Regime periodically.",
        "Appendix A.11"
      ],
      [
        "A managing director who signs off the three largest agents personally, having been shown the limits and the test result by someone other than the builder, has the essential separation in place.",
        "Chapter 13"
      ]
    ],
    "record": [
      [
        "Use the configuration database if the organisation has one that people use, and synchronise it from the platforms.",
        "Appendix A.2"
      ],
      [
        "A shared table is acceptable as a first step.",
        "Appendix A.2"
      ]
    ],
    "assistants": [
      [
        "Personal assistants are recorded as one class.",
        "Appendix A.2"
      ],
      [
        "Everything else is handled as classes.",
        "Appendix A.1"
      ]
    ],
    "appetite": [
      [
        "What is usually missing is a statement about delegation to software.",
        "Chapter 4"
      ],
      [
        "What cannot be handed down is the decision on how much the organisation is willing to delegate to software.",
        "Chapter 4"
      ]
    ],
    "incidents": [
      [
        "Record the five incident types and near misses in the existing incident process, with its severities and deadlines.",
        "Appendix A.9"
      ],
      [
        "Existing incident duties apply from day one.",
        "Appendix A.1"
      ]
    ],
    "vendors": [
      [
        "Agent features inside bought software are recorded per product, owned by the product owner.",
        "Appendix A.2"
      ],
      [
        "Almost no agent is free of suppliers.",
        "Chapter 12"
      ]
    ],
    "sector": [
      [
        "Classify each case against the reporting rules that apply to the organisation.",
        "Appendix A.9"
      ],
      [
        "Legal requirements are a floor, and a regulated organisation cannot choose a level below what the law demands.",
        "Chapter 14"
      ]
    ]
  };
  var SHORT = [["the three decisions before day 1", "the coordinator", "the amnesty", "the scope of the first round", "who is responsible for each line"], ["where the record lives", "the floors", "a reference agent for each size", "the classes", "the legal position", "the sources for the inventory"], ["who reports and who confirms the level", "the areas that matter", "the target level", "what counts as evidence"], ["people and hours per role", "costs that are not hours", "the number of agents covered", "when it is measured and reported"], ["the five incident types", "the layers of a stop", "stop holders and deputies", "the log: content, retention and reader", "telling employees about logging"], ["the suppliers of each agent", "who reads the terms", "region, retention and training settings", "the role under the AI Act"], ["who writes the page", "when the first page goes to the board", "the right to go behind the page", "the board’s three decisions"]];
  var PLAN90 = [
    ['30', 'Days 1 to 30', 'Inventory from all sources. Amnesty for unregistered agents. Existing incident duties apply from day one.', 'a first list.'],
    ['60', 'Days 31 to 60', 'Owner, purpose, end date and size for every agent in scope. Floors agreed with the risk function.', 'level 3 for agents in scope.'],
    ['90', 'Days 61 to 90', 'Identity and limits for large agents. Stop holders named. First page to the board.', 'a basis for the board’s ten questions.']];

  var answers = {}, done = TOOLS.map(function (t) { return t.items.map(function () { return false; }); });
  var qNodes = {}, tNodes = [];
  var qBox = $('#adapt-questions'), tBox = $('#adapt-tools'), plan = $('#adapt-plan'), prog = $('#adapt-progress');

  QUESTIONS.forEach(function (q, qi) {
    var box = el('div', 'g-q');
    box.appendChild(el('span', 'd', (qi + 1) + ' ' + q.head));
    box.appendChild(el('p', '', q.q));
    var seg = el('div', 'g-seg');
    seg.setAttribute('role', 'group');
    seg.setAttribute('aria-label', q.head);
    var btns = q.opts.map(function (o, oi) {
      var b = el('button', '', o[0]);
      b.type = 'button';
      b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', function () { answers[q.id] = answers[q.id] === oi ? undefined : oi; render(); });
      seg.appendChild(b);
      return b;
    });
    box.appendChild(seg);
    var out = el('div', 't-pass');
    box.appendChild(out);
    qBox.appendChild(box);
    qNodes[q.id] = { btns: btns, out: out };
  });

  TOOLS.forEach(function (t, ti) {
    var d = el('details', 't-group');
    if (ti === 0) d.open = true;
    var sum = el('summary');
    sum.appendChild(el('span', '', t.name));
    var cnt = el('span', 'lvl');
    sum.appendChild(cnt);
    d.appendChild(sum);
    var inn = el('div', 'in');
    t.items.forEach(function (it, ii) {
      var lab = el('label', 'g-check');
      var cb = el('input');
      cb.type = 'checkbox';
      cb.addEventListener('change', function () { done[ti][ii] = cb.checked; render(); });
      lab.appendChild(cb);
      lab.appendChild(el('span', '', it));
      inn.appendChild(lab);
    });
    var p = el('p', 'g-note');
    var a = el('a', '', 'Download ' + t.name);
    a.href = t.file;
    a.setAttribute('download', '');
    p.appendChild(a);
    if (t.page) {
      p.appendChild(document.createTextNode(' or '));
      var a2 = el('a', '', 'try it in the browser');
      a2.href = t.page;
      p.appendChild(a2);
    }
    p.appendChild(document.createTextNode('.'));
    inn.appendChild(p);
    d.appendChild(inn);
    tBox.appendChild(d);
    tNodes.push(cnt);
  });

  function passages(q) {
    var o = answers[q.id];
    if (o === undefined) return null;
    return q.opts[o][1].concat(q.always || []);
  }
  function planData() {
    var org = QUESTIONS.map(function (q) {
      var o = answers[q.id];
      return o === undefined ? { head: q.head, answer: '', line: '' }
        : { head: q.head, answer: q.opts[o][0], text: LINES[q.id][o][0], source: LINES[q.id][o][1], line: LINES[q.id][o][0] + ' (' + LINES[q.id][o][1] + ')' };
    });
    var open = [], decided = 0, total = 0;
    TOOLS.forEach(function (t, ti) {
      var left = SHORT[ti].filter(function (it, ii) { total++; if (done[ti][ii]) decided++; return !done[ti][ii]; });
      if (left.length) open.push({ name: t.name, items: left });
    });
    return { org: org, open: open, decided: decided, total: total };
  }
  function planText(d) {
    var L = ['The Agent Regime: adaptation plan', '', '1 Your organisation'];
    d.org.forEach(function (s) { L.push('- ' + s.head + ': ' + (s.answer ? s.answer + '. ' + s.line : 'not answered.')); });
    L.push('', '2 Decisions still open (' + d.decided + ' of ' + d.total + ' taken)');
    if (!d.open.length) L.push('None.');
    d.open.forEach(function (o) { L.push('- ' + o.name + ': ' + o.items.join('; ') + '.'); });
    L.push('', '3 The first ninety days');
    PLAN90.forEach(function (x) { L.push('- ' + x[1] + ': ' + x[2] + ' Result: ' + x[3]); });
    L.push('', 'Source: elkaermeisner.com/doctrine. The Agent Doctrine by Michael Elkær Meisner, CC BY 4.0. Not legal advice.');
    return L.join('\n');
  }

  function render() {
    var answered = 0;
    QUESTIONS.forEach(function (q) {
      var nd = qNodes[q.id], p = passages(q);
      nd.btns.forEach(function (b, i) { b.setAttribute('aria-pressed', answers[q.id] === i ? 'true' : 'false'); });
      nd.out.textContent = '';
      if (!p) return;
      answered++;
      p.forEach(function (x) {
        var bq = el('blockquote', 't-quote');
        bq.appendChild(el('p', '', x[0]));
        bq.appendChild(el('cite', '', x[1]));
        nd.out.appendChild(bq);
      });
    });
    TOOLS.forEach(function (t, ti) {
      var n = done[ti].filter(Boolean).length;
      tNodes[ti].textContent = n + ' of ' + t.items.length + ' decided';
    });
    var d = planData();
    prog.textContent = answered + ' of ' + QUESTIONS.length + ' questions answered. ' + d.decided + ' of ' + d.total + ' decisions taken.';

    plan.textContent = '';
    plan.appendChild(sheetHead());
    var bodyEl = el('div', 'sheet-body');
    var h = function (n, text, cnt) {
      var h4 = el('h4');
      var sp = el('span');
      sp.appendChild(el('b', '', String(n)));
      sp.appendChild(document.createTextNode(text));
      h4.appendChild(sp);
      if (cnt) h4.appendChild(el('span', 'cnt', cnt));
      return h4;
    };
    bodyEl.appendChild(h(1, 'Your organisation'));
    var org = el('div', 'sheet-org');
    d.org.forEach(function (s) {
      var c = el('div', 'c');
      var hd = el('span', 'h');
      hd.appendChild(el('span', 'k', s.head));
      hd.appendChild(el('span', s.answer ? 'a' : 'a none', s.answer || 'Not answered'));
      c.appendChild(hd);
      if (!s.answer) { org.appendChild(c); return; }
      var l = el('span', 'l', s.text + ' ');
      l.appendChild(el('span', 's', s.source));
      c.appendChild(l);
      org.appendChild(c);
    });
    bodyEl.appendChild(org);
    bodyEl.appendChild(h(2, 'Decisions still open', d.decided + ' of ' + d.total + ' taken'));
    var open = el('div', 'sheet-open');
    if (!d.open.length) open.appendChild(el('div', 'none', 'None. Every decision on the list has been taken.'));
    d.open.forEach(function (o) {
      var r = el('div', 'r');
      r.appendChild(el('span', 't', o.name));
      r.appendChild(el('span', '', o.items.join('; ') + '.'));
      open.appendChild(r);
    });
    bodyEl.appendChild(open);
    bodyEl.appendChild(h(3, 'The first ninety days'));
    var nd = el('div', 'sheet-90');
    PLAN90.forEach(function (x) {
      var c = el('div');
      var hd = el('span', 'hd');
      hd.appendChild(el('span', 'n', x[0]));
      hd.appendChild(el('span', 'd', x[1]));
      c.appendChild(hd);
      c.appendChild(el('p', '', x[2]));
      c.appendChild(el('p', 'res', 'Result: ' + x[3]));
      nd.appendChild(c);
    });
    bodyEl.appendChild(nd);
    var src = el('p', 'src');
    src.appendChild(el('i'));
    src.appendChild(el('span', '', 'elkaermeisner.com/doctrine. The Agent Doctrine by Michael Elkær Meisner, CC BY 4.0. Not legal advice.'));
    bodyEl.appendChild(src);
    plan.appendChild(bodyEl);
  }

  function sheetHead() {
    var NS = 'http://www.w3.org/2000/svg';
    var mk = function (tag, attrs, text) {
      var e = document.createElementNS(NS, tag);
      Object.keys(attrs).forEach(function (k) { e.setAttribute(k, attrs[k]); });
      if (text != null) e.textContent = text;
      return e;
    };
    var svg = mk('svg', { viewBox: '0 0 1000 164', preserveAspectRatio: 'xMinYMid slice', 'class': 'sheet-head', role: 'img', 'aria-label': 'The Agent Doctrine: adaptation plan' });
    svg.appendChild(mk('rect', { x: 0, y: 0, width: 1000, height: 164, fill: '#0B1F33' }));
    svg.appendChild(mk('text', { x: 40, y: 50, fill: '#9DB7F5', 'font-family': 'Inter, system-ui, sans-serif', 'font-size': 13, 'font-weight': 600, 'letter-spacing': 1.6 }, 'THE AGENT DOCTRINE'));
    svg.appendChild(mk('text', { x: 38, y: 101, fill: '#ffffff', 'font-family': '"Space Grotesk", system-ui, sans-serif', 'font-size': 46, 'font-weight': 700, 'letter-spacing': -1 }, 'Adaptation plan'));
    var day = '';
    try { day = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }); } catch (e) { day = ''; }
    svg.appendChild(mk('text', { x: 40, y: 134, fill: '#D5DDE8', 'font-family': 'Inter, system-ui, sans-serif', 'font-size': 15 }, 'The Agent Regime in your organisation' + (day ? '  ·  ' + day : '')));
    for (var r = 0; r < 4; r++) for (var c = 0; c < 9; c++) {
      var on = r === 2 && c === 5;
      svg.appendChild(mk('rect', { x: 716 + c * 28, y: 28 + r * 28, width: 20, height: 20,
        fill: on ? '#FF5B2E' : 'none', stroke: on ? '#FF5B2E' : '#ffffff', 'stroke-opacity': on ? 1 : 0.22, 'stroke-width': 1 }));
    }
    return svg;
  }

  var note = $('#adapt-note');
  $('#adapt-copy').addEventListener('click', function () {
    var ok = function (v) { note.textContent = v ? 'Copied. Paste it into a mail or a document.' : 'Copying is not available here. Select the text of the plan instead.'; };
    try { navigator.clipboard.writeText(planText(planData())).then(function () { ok(true); }, function () { ok(false); }); } catch (e) { ok(false); }
  });
  /* Printing: the page itself is switched to show only the plan, so that it prints
     the same way in browsers that ignore print styles. */
  var body = document.body;
  function restore() { body.classList.remove('plan-printing'); }
  /* Pick the largest text size at which the sheet still fits one page. The sheet scales
     with its own width, so its height-to-width ratio is the same on screen and on paper. */
  function fitSheet() {
    var sizes = [1.8, 1.75, 1.7, 1.65, 1.6, 1.55, 1.5, 1.45, 1.4, 1.35, 1.3];
    for (var i = 0; i < sizes.length; i++) {
      plan.style.setProperty('--sheet-fs', sizes[i] + 'cqw');
      if (plan.offsetWidth && plan.offsetHeight / plan.offsetWidth <= 1.3) return;
    }
  }
  function printPlan() {
    body.classList.add('plan-only');
    body.classList.add('plan-printing');
    window.scrollTo(0, 0);
    fitSheet();
    var t0 = Date.now(), armed = false;
    var done = function () {
      if (armed) return;
      armed = true;
      restore();
      window.removeEventListener('afterprint', onAfter);
      document.removeEventListener('pointerdown', done, true);
      document.removeEventListener('touchstart', done, true);
      document.removeEventListener('keydown', done, true);
    };
    var onAfter = function () { if (Date.now() - t0 > 1000) done(); };
    window.addEventListener('afterprint', onAfter);
    setTimeout(function () {
      document.addEventListener('pointerdown', done, true);
      document.addEventListener('touchstart', done, true);
      document.addEventListener('keydown', done, true);
    }, 700);
    try { window.print(); } catch (e) { done(); note.textContent = 'Printing is not available here.'; }
  }
  $('#adapt-print').addEventListener('click', printPlan);
  $('#plan-print').addEventListener('click', printPlan);
  $('#plan-back').addEventListener('click', function () {
    body.classList.remove('plan-only');
    restore();
    var sec = $('#plan');
    if (sec && sec.scrollIntoView) sec.scrollIntoView();
  });
  window.agentDoctrineAdapt = { planText: function () { return planText(planData()); } };
  render();
})();
