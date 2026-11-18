(function () {
  var NS = "http://www.w3.org/2000/svg";
  var svg = document.getElementById("graph");
  if (!svg) return;
  var tracks = [
    { id: "track-security", name: "Security", topics: ["Anomaly detection", "Encrypted traffic", "Graph-based IDS", "Security automation"] },
    { id: "track-iot", name: "IoT & Edge", topics: ["Lightweight inference", "Constrained scheduling", "Energy-efficient pipelines", "Edge anomaly detection"] },
    { id: "track-crypto", name: "Cryptography", topics: ["Cryptographic primitives", "Zero-knowledge proofs", "Scalable consensus", "Secure multiparty computation"] },
    { id: "track-learning", name: "Learning", topics: ["Routing and forecasting", "Reinforcement learning", "Failure prediction", "Traffic classification"] },
    { id: "track-hpc", name: "HPC & Scale", topics: ["Parallel simulation", "Routing optimization", "Massive datasets", "Reliability modeling"] },
    { id: "track-wireless", name: "Wireless", topics: ["Spectrum allocation", "Interference prediction", "Channel estimation", "Mobile scheduling"] }
  ];
  var cx = 410, cy = 300, ringR = 150, satR = 62, labelGap = 24;
  var offsets = [-54, -18, 18, 54];

  function el(tag, attrs, parent) {
    var n = document.createElementNS(NS, tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function pt(r, deg, ox, oy) {
    var a = deg * Math.PI / 180;
    return { x: ox + r * Math.cos(a), y: oy + r * Math.sin(a) };
  }

  var edges = el("g", {}, svg);
  var links = el("g", {}, svg);
  var hubs = [];

  tracks.forEach(function (t, i) {
    var ang = -90 + i * 60;
    var h = pt(ringR, ang, cx, cy);
    hubs.push(h);
    el("line", { "class": "edge spoke", x1: cx, y1: cy, x2: h.x, y2: h.y }, edges);
    t.topics.forEach(function (topic, j) {
      var s = pt(satR, ang + offsets[j], h.x, h.y);
      el("line", { "class": "edge", x1: h.x, y1: h.y, x2: s.x, y2: s.y }, edges);
    });

    var a = el("a", { "class": "node-link", href: "#" + t.id, "aria-label": t.name + ": go to topics" }, links);
    el("circle", { "class": "hit", cx: h.x, cy: h.y, r: satR + 8 }, a);
    t.topics.forEach(function (topic, j) {
      var s = pt(satR, ang + offsets[j], h.x, h.y);
      var c = el("circle", { "class": "sat", cx: s.x, cy: s.y, r: 7 }, a);
      el("title", {}, c).textContent = topic;
    });
    var hc = el("circle", { "class": "hub", cx: h.x, cy: h.y, r: 13 }, a);
    el("title", {}, hc).textContent = t.name;

    var cosA = Math.cos(ang * Math.PI / 180);
    var sinA = Math.sin(ang * Math.PI / 180);
    var l = pt(satR + labelGap, ang, h.x, h.y);
    var anchor = cosA > 0.3 ? "start" : (cosA < -0.3 ? "end" : "middle");
    var dy = Math.abs(cosA) <= 0.3 ? (sinA > 0 ? 16 : -4) : 6;
    var lt = el("text", { "class": "hub-t", x: l.x, y: l.y + dy, "text-anchor": anchor }, a);
    lt.textContent = t.name;
  });

  hubs.forEach(function (h, i) {
    var n = hubs[(i + 1) % hubs.length];
    el("line", { "class": "edge", x1: h.x, y1: h.y, x2: n.x, y2: n.y }, edges);
  });

  var core = el("g", {}, svg);
  el("circle", { "class": "core", cx: cx, cy: cy, r: 44 }, core);
  el("text", { "class": "core-t", x: cx, y: cy + 7 }, core).textContent = "CoMANT";
})();

/* While the page scrolls to an anchor, ignore pointer hover so cards passing under a still cursor do not turn blue. */
(function () {
  var root = document.documentElement, timer = null;
  function done() { root.classList.remove("scrolling"); }
  document.addEventListener("click", function (e) {
    var a = e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if (!a) return;
    root.classList.add("scrolling");
    clearTimeout(timer);
    timer = setTimeout(done, 1200);
  });
  window.addEventListener("scroll", function () {
    if (!root.classList.contains("scrolling")) return;
    clearTimeout(timer);
    timer = setTimeout(done, 180);
  }, { passive: true });
})();

/* Email links: try the mail client, and also copy the address, since some embedded or sandboxed views block mailto links. */
(function () {
  var note = document.querySelector(".copied");
  var links = document.querySelectorAll('footer a[href^="mailto:"]');
  function say(t) { if (note) note.textContent = t; }
  function legacyCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text; ta.setAttribute("readonly", "");
    ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (e) {}
    document.body.removeChild(ta);
    return ok;
  }
  for (var i = 0; i < links.length; i++) {
    links[i].addEventListener("click", function () {
      var addr = this.getAttribute("href").replace("mailto:", "");
      function ok() { say("Address copied: " + addr); }
      function fail() { say("Write to " + addr); }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(addr).then(ok, function () { legacyCopy(addr) ? ok() : fail(); });
      } else {
        legacyCopy(addr) ? ok() : fail();
      }
    });
  }
})();

/* Underline the nav item of the section currently in view, and show the back-to-top button. */
(function () {
  var top = document.querySelector(".totop");
  var navLinks = document.querySelectorAll('.bar nav a[href^="#"]');
  var secs = [];
  for (var i = 0; i < navLinks.length; i++) {
    var s = document.getElementById(navLinks[i].getAttribute("href").slice(1));
    if (s) secs.push({ el: s, link: navLinks[i] });
  }
  var ticking = false;
  var locked = null;
  function update() {
    ticking = false;
    var de = document.documentElement;
    var y = window.pageYOffset || de.scrollTop || 0;
    var atEnd = y + window.innerHeight >= Math.max(de.scrollHeight, document.body.scrollHeight) - 4;
    var current = null;
    for (var j = 0; j < secs.length; j++) {
      if (secs[j].el.getBoundingClientRect().top <= 140) current = secs[j];
    }
    if (atEnd && secs.length) current = secs[secs.length - 1];
    if (locked) current = locked;
    for (var k = 0; k < secs.length; k++) {
      secs[k].link.classList.toggle("active", secs[k] === current);
      if (secs[k] === current) secs[k].link.setAttribute("aria-current", "true"); else secs[k].link.removeAttribute("aria-current");
    }
    if (top) top.classList.toggle("show", y > 600);
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  window.addEventListener("resize", update);
  /* A clicked nav item keeps the underline until the visitor scrolls by hand. */
  for (var m = 0; m < secs.length; m++) {
    (function (item) {
      item.link.addEventListener("click", function () { locked = item; update(); });
    })(secs[m]);
  }
  function release() { if (locked) { locked = null; update(); } }
  window.addEventListener("wheel", release, { passive: true });
  window.addEventListener("touchmove", release, { passive: true });
  window.addEventListener("keydown", function (e) {
    if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].indexOf(e.key) !== -1) release();
  });
  update();
})();

/* Choosing an area in the diagram marks that card; while it is marked, no other card reacts to hover. Any other click clears the mark. */
(function () {
  var root = document.documentElement;
  function clear() {
    var old = document.querySelectorAll(".track.picked");
    for (var i = 0; i < old.length; i++) old[i].classList.remove("picked");
    root.classList.remove("has-pick");
  }
  document.addEventListener("click", function (e) {
    var a = e.target.closest ? e.target.closest('a[href^="#track-"]') : null;
    clear();
    if (!a) return;
    var card = document.getElementById(a.getAttribute("href").slice(1));
    if (!card) return;
    card.classList.add("picked");
    root.classList.add("has-pick");
  });
})();
