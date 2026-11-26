/* The Agent Doctrine: visual guide. Nothing here stores or sends what the reader enters. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var el = function (tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  };
  var press = function (btns, on) {
    btns.forEach(function (b) { b.setAttribute('aria-pressed', b === on ? 'true' : 'false'); });
  };
  var pad = function (n) { return (n < 10 ? '0' : '') + n; };

  $$('[data-js]').forEach(function (n) { n.hidden = false; });

  /* in-page navigation */
  (function () {
    var links = $$('.g-nav a');
    var bar = $('.g-nav .wrap');
    if (!links.length || !('IntersectionObserver' in window)) return;
    var byId = {};
    links.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var a = byId[en.target.id];
        links.forEach(function (l) { l.removeAttribute('aria-current'); });
        a.setAttribute('aria-current', 'true');
        var left = a.offsetLeft - bar.offsetLeft - 20;
        if (bar.scrollTo) bar.scrollTo({ left: left, behavior: 'smooth' }); else bar.scrollLeft = left;
      });
    }, { rootMargin: '-30% 0px -65% 0px' });
    Object.keys(byId).forEach(function (id) { var s = document.getElementById(id); if (s) io.observe(s); });
  })();

  /* 01 comparison */
  (function () {
    var table = $('.g-compare');
    var btns = $$('.g-compare-pick button');
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        table.setAttribute('data-compare', b.getAttribute('data-compare'));
        press(btns, b);
      });
    });
  })();

  /* 03 rules */
  var RULE_NAMES = ['', 'Owner and purpose', 'End date', 'Least access', 'Human up the stack', 'Control by size',
    'The record', 'Proof before trust', 'Change decided', 'Stop and account', 'The vendor'];
  var ruleBtns = $$('.g-rulebtn');
  var ruleArticles = $$('#rule-panel .g-rule');
  function selectRule(n, scroll) {
    ruleArticles.forEach(function (a) { a.hidden = a.getAttribute('data-rule') !== String(n); });
    ruleBtns.forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-rule') === String(n) ? 'true' : 'false'); });
    if (scroll) $('#rule-panel').scrollIntoView({ block: 'start' });
  }
  ruleBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      selectRule(b.getAttribute('data-rule'), window.matchMedia('(max-width:900px)').matches);
    });
  });
  if (ruleBtns.length) selectRule(1, false);

  /* 02 contract test */
  (function () {
    var form = $('#test-form');
    var out = $('#test-result');
    if (!form || !out) return;
    var boxes = $$('input[type=checkbox]', form);
    var touched = false;
    function render() {
      var n = boxes.filter(function (b) { return b.checked; }).length;
      out.textContent = '';
      out.className = 'g-result' + (touched && n === 6 ? ' is-ok' : '');
      if (!touched) {
        var p0 = el('p', '', 'Each question that can be answered at once, with something to show, is a point.');
        p0.style.marginTop = '0';
        out.appendChild(p0);
        return;
      }
      out.appendChild(el('div', 'big', n + ' of 6'));
      if (n === 6) out.appendChild(el('p', '', 'Six points mean that someone has already done for this agent what Part II describes.'));
      else if (n <= 2) out.appendChild(el('p', '', 'I would expect most agents to score one or two. The usual discovery is not that the answers are bad. It is that nobody is the person to ask.'));
      var open = boxes.filter(function (b) { return !b.checked; });
      if (!open.length) return;
      out.appendChild(el('p', 'g-label', 'What the Doctrine asks of an agent'));
      var ul = el('ul', 'g-ctrl');
      open.forEach(function (b) {
        var li = el('li');
        li.style.flexWrap = 'wrap';
        var t = el('span', '', b.getAttribute('data-asks'));
        t.style.flex = '1 1 180px';
        t.style.fontWeight = '600';
        li.appendChild(t);
        var row = el('span', 'g-jump');
        row.style.marginTop = '0';
        b.getAttribute('data-rules').split(' ').map(Number).forEach(function (r) {
          var c = el('button', 'g-chip', 'Rule ' + pad(r));
          c.type = 'button';
          c.setAttribute('aria-label', 'Rule ' + pad(r) + ', ' + RULE_NAMES[r]);
          c.addEventListener('click', function () { selectRule(r, true); });
          row.appendChild(c);
        });
        li.appendChild(row);
        ul.appendChild(li);
      });
      out.appendChild(ul);
    }
    form.addEventListener('change', function () { touched = true; render(); });
    render();
  })();

  /* 04 access */
  (function () {
    var box = $('#access-widget');
    if (!box) return;
    var toggles = $$('.g-toggle', box);
    var presets = $$('[data-preset]', box);
    var venn = $('#access-venn');
    var out = $('#access-result');
    var note = $('#access-preset-text');
    var P = {
      meeting: { on: ['private'], text: 'Reads a team’s own notes and writes a summary back to the same team. It has private data, no outside content and nowhere to send anything.' },
      research: { on: ['outside'], text: 'Reads public web pages and writes a briefing. It meets outside content all day, but it holds nothing private and can only return text to the person who asked.' },
      invoice: { on: ['private', 'outside', 'act'], text: 'Reads documents sent in by outsiders, sees supplier and payment data, and can propose payments. All three, until the ability to act is removed.' }
    };
    function render() {
      var n = 0;
      toggles.forEach(function (t) {
        var on = t.getAttribute('aria-pressed') === 'true';
        if (on) n++;
        $('circle[data-part="' + t.getAttribute('data-part') + '"]', venn).setAttribute('class', on ? 'on' : '');
      });
      venn.setAttribute('class', 'g-venn' + (n === 3 ? ' all' : ''));
      var words = ['None', 'One', 'Two', 'All three'];
      var has = function (k) { return $('.g-toggle[data-part="' + k + '"]', box).getAttribute('aria-pressed') === 'true'; };
      var unchecked = n === 2 && has('outside') && has('act');
      var msg = [
        'Tick what the agent has.',
        'Each alone is manageable.',
        unchecked
          ? 'An agent that reads untrusted content does not also hold the means to send data out or to act without a check that sits outside the model.'
          : 'The design task is to keep an agent out of the centre.',
        'An agent with all three can be told by an outsider to fetch something confidential and deliver it. The remedy is always to remove a corner: which of the three does this agent not need?'
      ];
      out.textContent = '';
      out.className = 'g-result' + (n === 3 || unchecked ? ' is-alert' : '');
      out.appendChild(el('div', 'big', n === 3 ? words[3] : words[n] + ' of three'));
      out.appendChild(el('p', '', msg[n]));
    }
    toggles.forEach(function (t) {
      t.addEventListener('click', function () {
        t.setAttribute('aria-pressed', t.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
        press(presets, null);
        note.textContent = 'Or tick what your own agent has.';
        render();
      });
    });
    presets.forEach(function (b) {
      b.addEventListener('click', function () {
        var p = P[b.getAttribute('data-preset')];
        toggles.forEach(function (t) { t.setAttribute('aria-pressed', p.on.indexOf(t.getAttribute('data-part')) > -1 ? 'true' : 'false'); });
        press(presets, b);
        note.textContent = p.text;
        render();
      });
    });
    render();
  })();

  /* 05 limits: in the loop, up the stack */
  (function () {
    var box = $('#stack-widget');
    if (!box) return;
    var btns = $$('.g-seg button', box);
    var view = $('#stack-view');
    var V = {
      loop: [
        ['', 'The agent', 'Produces an output.'],
        ['human', 'A person', 'Approves each one.'],
        ['verdict', '', 'Fifty a day become a rubber stamp.']
      ],
      stack: [
        ['human', 'A person', 'Sets the limits and decides the exceptions.'],
        ['check', 'Checks outside the model', 'Hold the limits.'],
        ['', 'The agent', 'Works within them.'],
        ['verdict', '', 'One party works within limits, and the other is told when they are reached.']
      ]
    };
    function render(mode) {
      view.textContent = '';
      V[mode].forEach(function (r) {
        var d = el('div', r[0]);
        if (r[1]) d.appendChild(el('span', 'who', r[1]));
        d.appendChild(document.createTextNode(r[2]));
        view.appendChild(d);
      });
    }
    btns.forEach(function (b) {
      b.addEventListener('click', function () { press(btns, b); render(b.getAttribute('data-mode')); });
    });
    render('loop');
  })();

  /* 05 limits: where is it held */
  (function () {
    var form = $('#held-form');
    var out = $('#held-result');
    if (!form || !out) return;
    form.addEventListener('change', function () {
      var v = (form.querySelector('input:checked') || {}).value;
      if (!v) return;
      var held = v !== 'instructions';
      out.hidden = false;
      out.textContent = '';
      out.className = 'g-result ' + (held ? 'is-ok' : 'is-alert');
      out.appendChild(el('div', 'big', held ? 'Held' : 'Not held'));
      out.appendChild(el('p', '', held
        ? 'A limit holds when it sits outside the agent. The agent can propose whatever it likes. What happens next does not depend on the agent.'
        : 'A limit that exists only in an agent’s instructions is a request. It is the one kind of limit an outsider can talk the agent out of. On the limits card, a limit that exists only in the instructions is entered as not held.'));
    });
  })();

  /* 06 size */
  (function () {
    var box = $('#size-widget');
    if (!box) return;
    var floors = $$('#size-floors input', box);
    var bars = $$('.g-bar', box);
    var agents = $$('[data-agent]', box);
    var out = $('#size-result');
    var note = $('#size-agent-text');
    var NAMES = ['', 'Small', 'Medium', 'Large', 'Extra large'];
    var CONTROLS = [
      [1, 'Owner and purpose'], [1, 'End date'], [1, 'In the record'],
      [2, 'Written limits'], [2, 'A log'],
      [3, 'Changes approved'], [3, 'Work tested'], [3, 'Log read'], [3, 'Named sponsor'], [3, 'Stop tried'],
      [4, 'Outside review'], [4, 'Shorter renewal']
    ];
    var A = {
      A: { size: 1, floors: [], text: 'Drafts meeting summaries for a project team. Clearly the smallest.' },
      B: { size: 2, floors: [], text: 'Answers staff questions about personnel policies. It sits above A.' },
      C: { size: 3, floors: [], text: 'Sorts customer complaints and proposes replies for review. Its replies go to customers and contain their personal data. Placed as large by comparison.' },
      D: { size: 3, floors: [], text: 'Matches supplier invoices and proposes them for payment. Placed as large by comparison, slightly above C.' },
      E: { size: 4, floors: [4], text: 'Monitors production systems and restarts failed services. It can change production on its own, so the floor makes it extra large before the discussion starts.' }
    };
    var chosen = 0, size = 0;
    function floor() {
      var f = 0;
      floors.forEach(function (c) { if (c.checked) f = Math.max(f, Number(c.getAttribute('data-floor'))); });
      return f;
    }
    function render() {
      var f = floor();
      size = Math.max(chosen, f);
      bars.forEach(function (b) {
        var s = Number(b.getAttribute('data-size'));
        b.disabled = s < f;
        b.setAttribute('aria-pressed', s === size ? 'true' : 'false');
      });
      out.textContent = '';
      if (!size) {
        out.appendChild(el('p', '', 'Tick the floors that apply, then choose a size.'));
        out.firstChild.style.marginTop = '0';
        return;
      }
      out.appendChild(el('div', 'big', NAMES[size]));
      out.appendChild(el('p', '', f && size === f
        ? 'Set by a floor: a fact about the agent that sets its minimum size, whatever a group thinks of it.'
        : 'Set by comparison. Once one agent of each size has been agreed, a new agent is sized by a single question: is it bigger or smaller than the reference?'));
      var ul = el('ul', 'g-ctrl');
      CONTROLS.forEach(function (c) {
        if (c[0] > size) return;
        var li = el('li', c[0] === size ? 'new' : '');
        li.appendChild(el('span', 'from', c[0] === size ? 'Added here' : 'From ' + NAMES[c[0]]));
        li.appendChild(el('span', '', c[1]));
        ul.appendChild(li);
      });
      out.appendChild(ul);
    }
    function manual() { press(agents, null); note.textContent = 'Or size an agent of your own: floors first, then compare.'; }
    floors.forEach(function (c) { c.addEventListener('change', function () { manual(); render(); }); });
    bars.forEach(function (b) {
      b.addEventListener('click', function () { chosen = Number(b.getAttribute('data-size')); manual(); render(); });
    });
    agents.forEach(function (b) {
      b.addEventListener('click', function () {
        var a = A[b.getAttribute('data-agent')];
        floors.forEach(function (c, i) { c.checked = a.floors.indexOf(i) > -1; });
        chosen = a.floors.length ? 0 : a.size;
        press(agents, b);
        note.textContent = a.text;
        render();
      });
    });
    render();
  })();

  /* 07 incidents */
  (function () {
    var box = $('#incident-widget');
    if (!box) return;
    var TYPES = ['Out of purpose', 'Out of bounds', 'Wrong and relied upon', 'Silent failure', 'Manipulated'];
    var DEF = [
      'The agent did something its purpose sentence does not cover.',
      'It reached data or used a permission it should not have.',
      'Its output was incorrect and someone acted on it.',
      'It stopped or degraded, and nobody noticed.',
      'Someone steered it through its input.'
    ];
    var CASES = [
      ['An agent that sorts incoming mail stops on a Thursday, and the mail piles up unread until a customer telephones on Monday.', 3, ''],
      ['A meeting assistant is asked to draft a contract clause, and does.', 0, ''],
      ['An agent summarises a policy incorrectly, and a caseworker rejects an application on the strength of the summary.', 2,
        ' This is the one traditional incident handling misses. Nothing failed technically. Only a person who checks, or a process that samples, will catch it.'],
      ['An invoice arrives with a line of small print that no person would read: a sentence addressed to the agent, telling it to update the supplier’s bank details.', 4, ''],
      ['An agent built to read one team’s folder returns a document from another team’s.', 1, '']
    ];
    var count = $('#incident-count'), text = $('#incident-case'), opts = $('#incident-options');
    var out = $('#incident-result'), next = $('#incident-next');
    var i = 0, score = 0;
    function show() {
      var c = CASES[i];
      count.textContent = 'Case ' + (i + 1) + ' of ' + CASES.length;
      text.textContent = c[0];
      opts.textContent = '';
      out.hidden = true;
      next.hidden = true;
      TYPES.forEach(function (t, k) {
        var b = el('button', 'g-opt', t);
        b.type = 'button';
        b.addEventListener('click', function () { answer(k); });
        opts.appendChild(b);
      });
    }
    function answer(k) {
      var c = CASES[i], right = k === c[1];
      if (right) score++;
      $$('.g-opt', opts).forEach(function (b, n) {
        b.disabled = true;
        if (n === c[1]) b.className = 'g-opt right';
        else if (n === k) b.className = 'g-opt wrong';
      });
      out.hidden = false;
      out.textContent = '';
      out.className = 'g-result ' + (right ? 'is-ok' : 'is-alert');
      var p = el('p', '', (right ? 'Right. ' : 'Not this one. ') + TYPES[c[1]] + ': ' + DEF[c[1]].charAt(0).toLowerCase() + DEF[c[1]].slice(1) + c[2]);
      p.style.marginTop = '0';
      out.appendChild(p);
      if (i === CASES.length - 1) out.appendChild(el('p', '', score + ' of ' + CASES.length + ' placed at the first try.'));
      next.hidden = false;
      next.textContent = i === CASES.length - 1 ? 'Start again' : 'Next case';
    }
    next.addEventListener('click', function () {
      if (i === CASES.length - 1) { i = 0; score = 0; } else i++;
      show();
    });
    show();
  })();

  /* 08 ladder: levels */
  (function () {
    var btns = $$('#level-picker .g-bar');
    var arts = $$('#level-panel .g-level');
    if (!btns.length) return;
    function pick(n) {
      arts.forEach(function (a) { a.hidden = a.getAttribute('data-level') !== String(n); });
      btns.forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-level') === String(n) ? 'true' : 'false'); });
    }
    btns.forEach(function (b) { b.addEventListener('click', function () { pick(b.getAttribute('data-level')); }); });
    pick(1);
  })();

  /* 08 ladder: place your own organisation */
  (function () {
    var box = $('#place-widget');
    if (!box) return;
    var qs = $$('.g-q', box);
    var out = $('#place-result');
    var ans = {};
    qs.forEach(function (q) {
      var dim = q.getAttribute('data-dim');
      var seg = el('div', 'g-seg');
      seg.setAttribute('role', 'group');
      seg.setAttribute('aria-label', dim);
      var pair = ['Yes', 'No'].map(function (t) {
        var b = el('button', '', t);
        b.type = 'button';
        b.setAttribute('aria-pressed', 'false');
        seg.appendChild(b);
        return b;
      });
      pair.forEach(function (b) {
        b.addEventListener('click', function () { ans[dim] = b.textContent; press(pair, b); render(); });
      });
      q.appendChild(seg);
    });
    function render() {
      var dims = qs.map(function (q) { return q.getAttribute('data-dim'); });
      var done = dims.filter(function (d) { return ans[d]; }).length;
      var nos = dims.filter(function (d) { return ans[d] === 'No'; });
      out.textContent = '';
      out.className = 'g-result';
      if (!done) {
        var p0 = el('p', '', 'Answer the six questions to see the level.');
        p0.style.marginTop = '0';
        out.appendChild(p0);
        return;
      }
      if (nos.length) {
        out.appendChild(el('div', 'big', 'Level 1, Unknown'));
        out.appendChild(el('p', '', 'A no to any of the six puts that dimension on level 1, and the organisation with it. Lowest: ' + nos.join(', ') + '.'));
      } else if (done === 6) {
        out.className = 'g-result is-ok';
        out.appendChild(el('div', 'big', 'Level 2, Listed'));
        out.appendChild(el('p', '', 'Six answers of yes, with something to show for each, put the organisation on level 2. Appendix C and the Ladder Assessment continue from there, with three further questions for each dimension.'));
      } else {
        out.appendChild(el('div', 'big', done + ' of 6 answered'));
        out.appendChild(el('p', '', 'No dimension is on level 1 so far.'));
      }
      var ul = el('ul', 'g-profile');
      dims.forEach(function (d) {
        var li = el('li');
        li.appendChild(el('span', '', d));
        var tr = el('span', 'track');
        var lvl = ans[d] === 'Yes' ? 2 : ans[d] === 'No' ? 1 : 0;
        for (var k = 1; k <= 5; k++) tr.appendChild(el('span', k <= lvl ? (lvl === 1 ? 'low' : 'f') : ''));
        tr.setAttribute('role', 'img');
        tr.setAttribute('aria-label', lvl ? 'Level ' + lvl : 'Not answered');
        li.appendChild(tr);
        ul.appendChild(li);
      });
      out.appendChild(ul);
      if (done === 6) out.appendChild(el('p', 'g-note', 'The lowest dimension sets the level.'));
    }
    render();
  })();

  /* 09 board: zones */
  (function () {
    var box = $('#zone-widget');
    if (!box) return;
    var does = $$('#zone-does button'), where = $$('#zone-where button');
    var whereWrap = $('#zone-where-wrap'), condsWrap = $('#zone-conds');
    var conds = $$('input', condsWrap), zones = $$('#zones > div'), out = $('#zone-result');
    var st = { does: '', where: '' };
    function render() {
      whereWrap.hidden = st.does !== 'acts';
      condsWrap.hidden = !(st.does === 'acts' && st.where === 'other');
      var zone = 0, outside = false, head = '', msg = '';
      if (st.does === 'proposes') {
        zone = 1; head = 'Accepted';
        msg = 'Agents that draft and propose are accepted everywhere, because a person stands between the agent and the consequence.';
      } else if (st.does === 'acts' && st.where === 'critical') {
        zone = 3; head = 'The board decides';
        msg = 'Agents that act in critical functions come to the board one by one.';
      } else if (st.does === 'acts' && st.where === 'other') {
        zone = 2;
        outside = conds.some(function (c) { return !c.checked; });
        head = outside ? 'Not accepted' : 'Accepted';
        msg = outside
          ? 'We accept agents that act on their own only where the action can be reversed, the value is below a limit we have set, and a named person can stop the agent.'
          : 'Agents that act are accepted under three conditions that can each be checked: the action can be undone, its value is limited, and someone can stop it.';
      }
      zones.forEach(function (z) {
        var on = Number(z.getAttribute('data-zone')) === zone;
        z.className = on ? (outside ? 'out' : 'on') : '';
      });
      out.textContent = '';
      out.className = 'g-result' + (outside ? ' is-alert' : '');
      if (!zone) {
        var p0 = el('p', '', st.does === 'acts' ? 'Choose where it acts.' : 'Choose what the agent does.');
        p0.style.marginTop = '0';
        out.appendChild(p0);
        return;
      }
      out.appendChild(el('div', 'big', head));
      out.appendChild(el('p', '', msg));
    }
    does.forEach(function (b) { b.addEventListener('click', function () { st.does = b.getAttribute('data-v'); press(does, b); render(); }); });
    where.forEach(function (b) { b.addEventListener('click', function () { st.where = b.getAttribute('data-v'); press(where, b); render(); }); });
    conds.forEach(function (c) { c.addEventListener('change', render); });
    render();
  })();

  /* 09 board: ten questions */
  (function () {
    var form = $('#ten-form'), out = $('#ten-result');
    if (!form || !out) return;
    var boxes = $$('input', form), touched = false;
    function render() {
      var n = boxes.filter(function (b) { return b.checked; }).length;
      out.textContent = '';
      out.className = 'g-result' + (n === 10 ? ' is-ok' : '');
      if (!touched) {
        var p0 = el('p', '', 'A good answer has a name, a date and something that can be shown.');
        p0.style.marginTop = '0';
        out.appendChild(p0);
        return;
      }
      out.appendChild(el('div', 'big', n + ' of 10'));
      out.appendChild(el('p', '', n === 10
        ? 'A board that has asked the ten questions and received ten good answers can return to them once a year and rely on the quarterly page in between.'
        : '“Too early to tell” is an answer, and a board can work with it, provided it comes with a date. What a board should not accept is the version without a date, or the version in which too early becomes the standing reply.'));
    }
    form.addEventListener('change', function () { touched = true; render(); });
    render();
  })();

  /* 09 board: hear the difference */
  (function () {
    var box = $('#answer-widget');
    if (!box) return;
    var btns = $$('.g-seg button', box), views = $$('.g-answer', box);
    function pick(q) {
      views.forEach(function (v) { v.hidden = v.getAttribute('data-q') !== q; });
      btns.forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-q') === q ? 'true' : 'false'); });
    }
    btns.forEach(function (b) { b.addEventListener('click', function () { pick(b.getAttribute('data-q')); }); });
    pick('1');
  })();

  /* 10 ninety days at the insurer */
  (function () {
    var box = $('#story-widget');
    if (!box) return;
    var grid = $('#story-grid'), legend = $('#story-legend'), text = $('#story-text');
    var prev = $('#story-prev'), next = $('#story-next');
    var rep = function (cls, n) { var a = []; for (var k = 0; k < n; k++) a.push(cls); return a; };
    var sized = rep('sq-xl', 2).concat(rep('sq-l', 9), rep('sq-m', 14), rep('sq-s', 26), rep('sq-off', 9), rep('sq-back', 3));
    var STEPS = [
      {
        when: 'Before day 1',
        cells: rep('', 63),
        legend: [['', 'Nobody can say how many there are']],
        plan: 'Three decisions from executive management: who coordinates, which existing forum takes agent decisions, and the terms of the amnesty.',
        story: 'The head of IT operations would coordinate. The existing change board would take the decisions about agents. And an amnesty would run for six weeks.',
        res: ''
      },
      {
        when: 'Day 30',
        cells: rep('sq-found', 31).concat(rep('sq-told', 15), rep('', 17)),
        legend: [['sq-found', '31 shown by the platforms'], ['sq-told', '15 reported by departments and system administrators'], ['', '17 that surfaced later']],
        plan: 'Inventory from all sources. Amnesty for unregistered agents. Existing incident duties apply from day one. Result: a first list.',
        story: 'The platforms showed thirty-one agents. The departments and the system administrators reported fifteen more, three of them built by a supplier and never handed over. By day thirty the list had forty-six entries, and everyone involved knew that it was incomplete.',
        res: ''
      },
      {
        when: 'Day 60',
        cells: sized,
        legend: [['sq-xl', '2 extra large'], ['sq-l', '9 large'], ['sq-m', '14 medium'], ['sq-s', '26 small'], ['sq-off', '9 switched off'], ['sq-back', '3 back to the supplier']],
        plan: 'Owner, purpose, end date and size for every agent in scope. Floors agreed with the risk function. Result: level 3 for agents in scope.',
        story: 'Each agent was put in front of a manager with one question: is this yours? Seventeen more surfaced, which brought the list to sixty-three. Fifty-one got an owner, a purpose sentence and an end date. Nine were switched off, because nobody would answer for them. Three went back to the supplier with a request for a proper hand-over. A group of six people sized the fifty-one in two sittings.',
        res: ''
      },
      {
        when: 'Day 90',
        cells: rep('sq-focus', 11).concat(sized.slice(11).map(function (c) { return c + ' sq-dim'; })),
        legend: [['sq-focus', '11 large and extra large agents']],
        plan: 'Identity and limits for large agents. Stop holders named. First page to the board. Result: a basis for the board’s ten questions.',
        story: 'Each of the eleven got an identity of its own where it had been running on its builder’s, a card with its limits, and a named stop holder with a deputy. Two stops were tried. One took nine minutes. The other took most of a morning. On day ninety the board received its first page.',
        res: 'The page did not flatter. Finance and customer service had done everything asked of them. Claims had stopped maintaining its list after the first month, and marketing could not yet say what it had. The insurer reported level 1, with the spread shown beside it.'
      }
    ];
    var i = 0;
    function render() {
      var s = STEPS[i];
      grid.textContent = '';
      s.cells.forEach(function (c) { grid.appendChild(el('span', c)); });
      legend.textContent = '';
      s.legend.forEach(function (l) {
        var li = el('li');
        li.appendChild(el('i', l[0]));
        li.appendChild(document.createTextNode(l[1]));
        legend.appendChild(li);
      });
      text.textContent = '';
      text.appendChild(el('div', 'when', s.when));
      text.appendChild(el('p', 'g-label', 'The plan'));
      var p1 = el('p', '', s.plan); p1.style.marginTop = '4px'; text.appendChild(p1);
      text.appendChild(el('p', 'g-label', 'At the insurer'));
      var p2 = el('p', '', s.story); p2.style.marginTop = '4px'; text.appendChild(p2);
      if (s.res) text.appendChild(el('p', 'res', s.res));
      prev.disabled = i === 0;
      next.textContent = i === STEPS.length - 1 ? 'Start again' : 'Next';
    }
    prev.addEventListener('click', function () { if (i > 0) { i--; render(); } });
    next.addEventListener('click', function () { i = i === STEPS.length - 1 ? 0 : i + 1; render(); });
    render();
  })();
})();
