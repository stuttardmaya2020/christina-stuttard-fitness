// Class times: classes run Monday to Thursday on US Eastern Time.
// Other zones use today's real offset, so the clocks changing is handled automatically.
(function () {
  var startsET = [[6, 30], [7, 15], [8, 0], [9, 30]];
  var zones = {
    us: { tz: "America/New_York", place: "the USA (Eastern)" },
    uk: { tz: "Europe/London", place: "the UK" },
    es: { tz: "Europe/Madrid", place: "Spain" }
  };
  // Abbreviation by UTC offset in minutes: winter and summer names for each zone.
  var names = {
    us: { "-300": "EST", "-240": "EDT" },
    uk: { "0": "GMT", "60": "BST" },
    es: { "60": "CET", "120": "CEST" }
  };
  var fallback = { us: -240, uk: 60, es: 120 };

  function offset(tz) {
    try {
      var d = new Date();
      var local = new Date(d.toLocaleString("en-US", { timeZone: tz }));
      var utc = new Date(d.toLocaleString("en-US", { timeZone: "UTC" }));
      return Math.round((local - utc) / 60000);
    } catch (e) { return null; }
  }
  function zoneOffset(z) {
    var o = offset(zones[z].tz);
    return o === null ? fallback[z] : o;
  }
  function fmt(mins) {
    var h = ((Math.floor(mins / 60) % 24) + 24) % 24, m = ((mins % 60) + 60) % 60;
    return (h % 12 || 12) + ":" + String(m).padStart(2, "0") + " " + (h < 12 ? "am" : "pm");
  }

  var list = document.getElementById("sched-body");
  var note = document.getElementById("sched-note");
  var buttons = document.querySelectorAll(".tz button");
  if (!list) return;

  buttons.forEach(function (b) {
    var z = b.dataset.tz;
    b.querySelector("small").textContent = names[z][String(zoneOffset(z))] || "";
  });

  function render(z) {
    var shift = zoneOffset(z) - zoneOffset("us");
    var abbr = names[z][String(zoneOffset(z))] || "";
    list.innerHTML = startsET.map(function (t) {
      var start = t[0] * 60 + t[1] + shift;
      return "<li><b>" + fmt(start) + "</b><span>to " + fmt(start + 30) + "</span></li>";
    }).join("");
    var day = new Date().getDay();
    document.getElementById("today-note").textContent = day >= 1 && day <= 4 ? "Classes on today" : "";
    note.textContent = "Times in " + zones[z].place + (abbr ? " (" + abbr + ")" : "") + ". Each class is 30 minutes.";
    buttons.forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.tz === z ? "true" : "false"); });
    try { localStorage.setItem("csf-tz", z); } catch (e) {}
  }
  buttons.forEach(function (b) { b.addEventListener("click", function () { render(b.dataset.tz); }); });
  var saved = null;
  try { saved = localStorage.getItem("csf-tz"); } catch (e) {}
  render(zones[saved] ? saved : "us");
})();

// Video: load the YouTube player only when someone presses play, so the page stays fast.
(function () {
  var box = document.getElementById("vid");
  if (!box) return;
  box.querySelector("button").addEventListener("click", function () {
    var f = document.createElement("iframe");
    f.src = "https://www.youtube-nocookie.com/embed/VK7JNPaCrjI?autoplay=1&rel=0";
    f.title = "Christina teaching a class";
    f.allow = "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture";
    f.allowFullscreen = true;
    box.innerHTML = "";
    box.appendChild(f);
    var link = document.createElement("p");
    link.className = "video-fallback";
    link.innerHTML = 'Video not playing? <a href="https://www.youtube.com/watch?v=VK7JNPaCrjI" target="_blank" rel="noopener">Watch it on YouTube</a>.';
    box.after(link);
  });
})();

// Kind words: one quote at a time with arrows and dots.
(function () {
  var quotes = Array.prototype.slice.call(document.querySelectorAll("#quotes .q"));
  var dots = document.getElementById("q-dots");
  if (!quotes.length || !dots) return;
  var i = 0;
  quotes.forEach(function (q, n) {
    var d = document.createElement("button");
    d.type = "button";
    d.setAttribute("aria-label", "Quote " + (n + 1) + " of " + quotes.length);
    d.addEventListener("click", function () { show(n); });
    dots.appendChild(d);
  });
  function show(n) {
    i = (n + quotes.length) % quotes.length;
    quotes.forEach(function (q, k) { q.classList.toggle("is-on", k === i); q.setAttribute("aria-hidden", k === i ? "false" : "true"); });
    Array.prototype.forEach.call(dots.children, function (d, k) { d.setAttribute("aria-current", k === i ? "true" : "false"); });
  }
  document.getElementById("q-prev").addEventListener("click", function () { show(i - 1); });
  document.getElementById("q-next").addEventListener("click", function () { show(i + 1); });
  show(0);
})();

// Copy the email address.
(function () {
  var btn = document.getElementById("copy-email");
  var email = document.getElementById("email");
  if (!btn || !email) return;
  btn.addEventListener("click", function () {
    var text = email.textContent.trim();
    function done() { btn.textContent = "Copied"; setTimeout(function () { btn.textContent = "Copy"; }, 1800); }
    function select() { var r = document.createRange(); r.selectNodeContents(email); var s = getSelection(); s.removeAllRanges(); s.addRange(r); }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, select);
    } else { select(); }
  });
})();
