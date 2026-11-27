/* Notes from the bridge: shows an article from its release time. No cookies, no tracking. */
(function () {
  function text(b64) {
    var bin = atob(b64), bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder('utf-8').decode(bytes);
  }
  function later(at, fn) {
    var wait = at - Date.now();
    if (wait <= 0) { fn(); return; }
    if (wait < 2147483647) setTimeout(fn, wait + 500);
  }
  var note = document.getElementById('note'), data = document.getElementById('note-data');
  if (note && data) {
    later(Date.parse(note.getAttribute('data-at')), function () {
      var d = JSON.parse(data.textContent);
      note.innerHTML = text(d.h);
      document.title = text(d.t);
      var m = document.querySelector('meta[name="description"]'); if (m) m.setAttribute('content', text(d.d));
      var r = document.getElementById('note-robots'); if (r) r.parentNode.removeChild(r);
    });
  }
  /* front page: the three newest notes, read from the notes page so they follow it without edits here */
  var home = document.getElementById('home-notes');
  if (home && window.fetch && window.DOMParser) {
    fetch('notes/').then(function (r) { return r.ok ? r.text() : Promise.reject(); }).then(function (page) {
      var doc = new DOMParser().parseFromString(page, 'text/html');
      var cards = Array.prototype.map.call(doc.querySelectorAll('#note-list a.card'), function (a) { return a.outerHTML; });
      var later = doc.getElementById('notes-upcoming');
      if (later) JSON.parse(later.textContent).forEach(function (e) { if (Date.parse(e.at) <= Date.now()) cards.unshift(text(e.c)); });
      if (cards.length < 3) return;
      var box = document.createElement('div');
      box.innerHTML = cards.slice(0, 3).join('');
      Array.prototype.forEach.call(box.querySelectorAll('a.card'), function (a) { a.setAttribute('href', 'notes/' + a.getAttribute('href')); });
      home.innerHTML = box.innerHTML;
    }).catch(function () {});
  }
  var list = document.getElementById('note-list'), up = document.getElementById('notes-upcoming');
  if (list && up) {
    JSON.parse(up.textContent).forEach(function (e) {
      later(Date.parse(e.at), function () { list.insertAdjacentHTML('afterbegin', text(e.c)); });
    });
  }
})();
