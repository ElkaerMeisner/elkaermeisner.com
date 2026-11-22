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
  var list = document.getElementById('note-list'), up = document.getElementById('notes-upcoming');
  if (list && up) {
    JSON.parse(up.textContent).forEach(function (e) {
      later(Date.parse(e.at), function () { list.insertAdjacentHTML('afterbegin', text(e.c)); });
    });
  }
})();
