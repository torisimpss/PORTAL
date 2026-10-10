/* PORTAL QR prototype — renders content/portal.json with hash routes.
   Routes: #/  (landing) · #/index · #/p/<pathway>/<page> · #/credits
   Explored state is stored on the visitor's device only (localStorage). */
(function () {
  'use strict';

  var main = document.getElementById('main');
  var side = document.getElementById('side');
  var DATA = null;

  var TICK = '<svg class="tick" viewBox="0 0 12 12" aria-hidden="true"><path d="M1 6.6 4.6 10 11 1.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var ARROW = '<span aria-hidden="true">→</span>';

  // ---------- explored state (device only) ----------
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem('portal.' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem('portal.' + k, JSON.stringify(v)); } catch (e) { /* private mode */ } }
  };
  function seenSet() { return store.get('seen', []); }
  function markSeen(key) { var s = seenSet(); if (s.indexOf(key) < 0) { s.push(key); store.set('seen', s); } store.set('last', key); }
  function isSeen(key) { return seenSet().indexOf(key) >= 0; }
  function pathwayDone(p) { return p.pages.every(function (pg) { return isSeen(p.slug + '/' + pg.slug); }); }

  // ---------- helpers ----------
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function chip(colour) { return '<span class="chip c-' + colour + '" aria-hidden="true"></span>'; }
  function href(p, pg) { return '#/p/' + p.slug + '/' + (pg || p.pages[0]).slug; }
  function findPath(slug) { return DATA.pathways.filter(function (p) { return p.slug === slug; })[0]; }

  function block(b) {
    switch (b.type) {
      case 'text': return '<p>' + esc(b.text) + '</p>';
      case 'note': return '<p class="note">' + esc(b.text) + '</p>';
      case 'link': return '<a class="textlink" href="' + esc(b.url) + '" target="_blank" rel="noopener">' + esc(b.label) + ' ' + ARROW + '<span class="sr"> (opens in a new tab)</span></a>';
      case 'image': return '<div class="ph img" role="img" aria-label="Image placeholder: ' + esc(b.placeholder) + '">' + esc(b.placeholder) + '</div>';
      case 'placeholder': return '<div class="ph content"><div><strong>Placeholder</strong>' + esc(b.text) + '</div></div>';
      case 'table':
        return '<div class="tablewrap"><table><thead><tr>' + b.columns.map(function (c) { return '<th scope="col">' + esc(c) + '</th>'; }).join('') +
          '</tr></thead><tbody>' + b.rows.map(function (r) { return '<tr>' + r.map(function (c, i) { return '<td data-label="' + esc(b.columns[i]) + '">' + esc(c) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>';
      default: return '';
    }
  }

  // ---------- side index (desktop) ----------
  function renderSide(activeSlug) {
    side.innerHTML =
      '<a class="kerry" href="' + esc(DATA.project.homeUrl) + '" aria-label="Kerry Lemon website"><img src="assets/tori/kerry-lemon.svg" alt="Kerry Lemon"></a>' +
      '<a href="#/" style="text-decoration:none"><div class="ttl">' + esc(DATA.project.title) + '</div></a>' +
      '<p class="sub">Pick any pathway</p><ul>' +
      DATA.pathways.map(function (p) {
        return '<li><a class="row" href="' + href(p) + '"' + (p.slug === activeSlug ? ' aria-current="page"' : '') + '>' + chip(p.colour) +
          '<span class="name">' + esc(p.title) + '</span>' + (pathwayDone(p) ? '<span class="sr">seen</span>' + TICK : '') + '</a></li>';
      }).join('') + '</ul><a class="foot" href="#/credits">Credits</a>';
  }

  // ---------- views ----------
  function landing() {
    var L = DATA.landing, P = DATA.project;
    return '<div class="landing"><div class="landing-grid"><div>' +
      '<p class="eyebrow">' + esc(P.kind) + ' · ' + esc(P.year) + '</p>' +
      '<div class="display">' + esc(P.title) + '</div>' +
      '<img class="tori" src="assets/tori/a-new-sculpture-by.svg" alt="a new sculpture by">' +
      '<p style="font-weight:500;font-size:14px">' + esc(P.artist) + '</p>' +
      '<div class="ph hero mobile-only" role="img" aria-label="Image placeholder: ' + esc(L.illustration) + '">' + esc(L.illustration) + '</div>' +
      '<div class="label"><h2>About the sculpture</h2><p class="lead">' + esc(L.about) + '</p></div>' +
      '<p class="lead">' + esc(L.intro) + '</p>' +
      '<a class="btn" href="#/index">Explore ' + esc(P.title) + ' ' + ARROW + '</a>' +
      '<p class="hint">' + DATA.pathways.length + ' pathways · explore in any order</p>' +
      '</div><div class="desk-only"><div class="ph hero" role="img" aria-label="Image placeholder: ' + esc(L.illustration) + '">' + esc(L.illustration) + '</div><p class="caption" style="margin-top:0">' + esc(L.caption) + '</p></div></div></div>';
  }

  function index() {
    var last = store.get('last', null), resume = '';
    if (last) {
      var parts = last.split('/'), p = findPath(parts[0]);
      if (p && !pathwayDone(p)) {
        var pg = p.pages.filter(function (x) { return x.slug === parts[1]; })[0] || p.pages[0];
        resume = '<a class="resume" href="' + href(p, pg) + '"><span class="bar c-' + p.colour + '" aria-hidden="true"></span><span class="txt">' +
          '<img class="tori small" src="assets/tori/pick-up-where-you-left-off.svg" alt="Pick up where you left off"><span class="where">' + esc(p.title) + ' · ' + esc(pg.title) + '</span></span>' + ARROW + '</a>';
      }
    }
    return '<div class="idx-head"><span>Your</span><img src="assets/tori/index.svg" alt="index"></div>' +
      '<p class="hint">Pick any pathway. A tick means you have seen it all.</p>' +
      '<ul class="rows anim">' + DATA.pathways.map(function (p, i) {
        var done = pathwayDone(p);
        return '<li style="animation-delay:' + (0.08 + i * 0.06) + 's"><a href="' + href(p) + '">' + chip(p.colour) + '<span class="name">' + esc(p.title) + '</span>' +
          (done ? '<span class="status">Seen ' + TICK + '</span>' : '<span class="arrow" aria-hidden="true">→</span>') + '</a></li>';
      }).join('') + '</ul>' +
      '<a class="credits-link" href="#/credits">Credits</a>' + resume;
  }

  function pathwayPage(p, pgSlug) {
    var idx = Math.max(0, p.pages.findIndex(function (x) { return x.slug === pgSlug; }));
    var pg = p.pages[idx];
    markSeen(p.slug + '/' + pg.slug);
    var tabs = p.pages.length > 1 ? '<nav class="tabs" aria-label="Pages in ' + esc(p.title) + '">' + p.pages.map(function (x) {
      var cur = x.slug === pg.slug;
      return '<a href="' + href(p, x) + '"' + (cur ? ' aria-current="page"' : '') + '>' + esc(x.title) + (isSeen(p.slug + '/' + x.slug) && !cur ? '<span class="sr">seen</span>' + TICK : '') + '</a>';
    }).join('') + '</nav>' : '';
    var media = pg.blocks.filter(function (b) { return b.type === 'image'; });
    var rest = pg.blocks.filter(function (b) { return b.type !== 'image'; });
    var next = p.pages[idx + 1];
    var primary = next ? '<a class="btn" href="' + href(p, next) + '">Next: ' + esc(next.title) + ' ' + ARROW + '</a>'
                       : '<a class="btn" href="#/index">Back to the index ' + ARROW + '</a>';
    var others = DATA.pathways.filter(function (o) { return o !== p; });
    others.sort(function (a, b) { return (pathwayDone(a) ? 1 : 0) - (pathwayDone(b) ? 1 : 0); });
    var more = '<section class="more" aria-labelledby="more-h"><h2 id="more-h" class="eyebrow" style="margin:0">More to explore</h2><ul>' +
      others.slice(0, 3).map(function (o) { return '<li><a href="' + href(o) + '">' + chip(o.colour) + '<span class="nm">' + esc(o.title) + '</span></a></li>'; }).join('') + '</ul></section>';
    var text = rest.map(block).join('');
    var body = media.length
      ? '<div class="page-grid"><div class="media">' + media.map(block).join('') + '</div><div class="copy">' + text + primary + more + '</div></div>'
      : text + primary + more;
    return '<p class="eyebrow">' + chip(p.colour) + esc(p.title) + '</p>' + tabs + '<h1>' + esc(pg.title) + '</h1>' + body;
  }

  function credits() {
    return '<p class="eyebrow">' + esc(DATA.project.title) + '</p><h1>Credits</h1><dl class="credits">' +
      DATA.credits.map(function (c) {
        return '<dt>' + esc(c.role) + '</dt><dd>' + (c.url ? '<a href="' + esc(c.url) + '" target="_blank" rel="noopener">' + esc(c.name) + '</a>' : esc(c.name)) + '</dd>';
      }).join('') + '</dl><a class="btn" href="#/index" style="margin-top:32px">Back to the index ' + ARROW + '</a>';
  }

  // ---------- app-style navigation ----------
  // `trail` is the list of screens visited in this session, so Back retraces
  // the visitor's own path. If they arrived directly (e.g. a QR or shared link),
  // Back goes up a level instead: page -> index -> landing.
  var backBtn = document.getElementById('back');
  var trail = [];
  var first = true;

  function current() { var h = location.hash.replace(/^#\/?/, ''); return h ? '#/' + h : '#/'; }
  function parentOf(hash) {
    var h = hash.replace(/^#\/?/, '').split('/').filter(Boolean);
    if (!h.length) return null;
    if (h[0] === 'index') return '#/';
    return '#/index'; // pathway pages and credits
  }
  backBtn.addEventListener('click', function () {
    if (trail.length > 1) { history.back(); return; }
    var up = parentOf(current());
    if (up) { trail = []; goingBack = true; location.replace(up); }
  });
  var goingBack = false;

  // ---------- router ----------
  function route() {
    var here = current(), dir;
    if (goingBack) { dir = 'bwd'; goingBack = false; trail.push(here); }
    else if (trail.length > 1 && trail[trail.length - 2] === here) { dir = 'bwd'; trail.pop(); }
    else if (trail[trail.length - 1] !== here) { dir = 'fwd'; trail.push(here); }
    else { dir = 'fwd'; }

    var h = here.replace(/^#\/?/, '').split('/').filter(Boolean), html, active = null, title = DATA.project.title;
    if (h[0] === 'index') { html = index(); title = 'Index · ' + title; }
    else if (h[0] === 'credits') { html = credits(); title = 'Credits · ' + title; }
    else if (h[0] === 'p' && findPath(h[1])) { var p = findPath(h[1]); active = p.slug; html = pathwayPage(p, h[2]); title = p.title + ' · ' + title; }
    else { html = landing(); }

    main.classList.remove('fwd', 'bwd', 'first'); void main.offsetWidth;
    main.innerHTML = html; main.classList.add(first ? 'first' : dir);
    first = false;
    backBtn.hidden = !h.length; // no Back on the landing screen
    document.title = title + ' · Kerry Lemon';
    renderSide(active);
    window.scrollTo(0, 0);
    if (h.length) main.focus({ preventScroll: true });
  }

  fetch('content/portal.json', { cache: 'no-cache' })
    .then(function (r) { return r.json(); })
    .then(function (d) { DATA = d; window.addEventListener('hashchange', route); route(); })
    .catch(function () { main.innerHTML = '<p>Sorry, the content could not be loaded.</p>'; });
})();
