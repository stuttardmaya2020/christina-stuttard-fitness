// Class times: classes run Monday to Thursday on US Eastern Time.
// The Eastern start times are read from the list in index.html, which is also what shows if JavaScript is off.
// Other zones use today's real offset, so the clocks changing is handled automatically.
(function () {
  var zones = {
    us: { tz: "America/New_York", place: "the USA", detail: "Eastern" },
    uk: { tz: "Europe/London", place: "the UK" },
    es: { tz: "Europe/Madrid", place: "Spain" },
    local: { tz: null, place: "your time zone" }
  };
  // Browser time zones that count as each of the three named zones. Anyone else is offered "Your time".
  var home = {
    us: /^(America\/(New_York|Detroit|Kentucky\/|Indiana\/(Indianapolis|Vincennes|Winamac|Marengo|Petersburg|Vevay))|US\/Eastern)/,
    uk: /^(Europe\/(London|Belfast|Jersey|Guernsey|Isle_of_Man)|GB)/,
    es: /^(Europe\/Madrid|Africa\/Ceuta)$/
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
    if (z === "local") return -new Date().getTimezoneOffset();
    var o = offset(zones[z].tz);
    return o === null ? fallback[z] : o;
  }
  function abbrOf(z) {
    if (z !== "local") return names[z][String(zoneOffset(z))] || "";
    try {
      var parts = new Intl.DateTimeFormat([], { timeZoneName: "short" }).formatToParts(new Date());
      for (var k = 0; k < parts.length; k++) if (parts[k].type === "timeZoneName") return parts[k].value;
    } catch (e) {}
    return "";
  }
  function fmt(mins) {
    var h = ((Math.floor(mins / 60) % 24) + 24) % 24, m = ((mins % 60) + 60) % 60;
    return (h % 12 || 12) + ":" + String(m).padStart(2, "0") + " " + (h < 12 ? "am" : "pm");
  }

  var list = document.getElementById("sched-body");
  var note = document.getElementById("sched-note");
  var group = document.querySelector(".tz");
  var buttons = document.querySelectorAll(".tz button");
  if (!list || !note || !group) return;

  // Read the Eastern start times from the page. If they can't be read, leave the plain Eastern list as it is.
  var startsET = [];
  list.querySelectorAll("b").forEach(function (b) {
    var m = /^(\d{1,2}):(\d{2})\s*(am|pm)$/i.exec(b.textContent.trim());
    if (m) startsET.push([(+m[1] % 12) + (/pm/i.test(m[3]) ? 12 : 0), +m[2]]);
  });
  if (!startsET.length || startsET.length !== list.children.length) return;

  // Start on the visitor's own zone. Outside the three named zones, offer "Your time".
  var localTz = "";
  try { localTz = Intl.DateTimeFormat().resolvedOptions().timeZone || ""; } catch (e) {}
  var mine = Object.keys(home).filter(function (z) { return home[z].test(localTz); })[0] || null;
  var localBtn = document.getElementById("tz-local");
  if (!mine && localTz && localBtn) {
    localBtn.hidden = false;
    group.classList.add("has-local");
    mine = "local";
  }
  function offered(z) { return !!zones[z] && (z !== "local" || group.classList.contains("has-local")); }

  buttons.forEach(function (b) { b.querySelector("small").textContent = abbrOf(b.dataset.tz); });

  function render(z) {
    var shift = zoneOffset(z) - zoneOffset("us");
    var label = [zones[z].detail, abbrOf(z)].filter(Boolean).join(", ");
    list.innerHTML = startsET.map(function (t) {
      var start = t[0] * 60 + t[1] + shift;
      var day = start >= 1440 ? ", the next day" : start < 0 ? ", the day before" : "";
      return "<li><b>" + fmt(start) + "</b><span>to " + fmt(start + 30) + day + "</span></li>";
    }).join("");
    var day = new Date().getDay();
    document.getElementById("today-note").textContent = day >= 1 && day <= 4 ? "Classes on today" : "";
    note.textContent = "Times in " + zones[z].place + (label ? " (" + label + ")" : "") + ". Each class is 30 minutes.";
    buttons.forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.tz === z ? "true" : "false"); });
  }
  buttons.forEach(function (b) {
    b.addEventListener("click", function () {
      render(b.dataset.tz);
      try { localStorage.setItem("csf-tz", b.dataset.tz); } catch (e) {}
    });
  });
  var saved = null;
  try { saved = localStorage.getItem("csf-tz"); } catch (e) {}
  group.hidden = false;
  render(offered(saved) ? saved : mine || "us");
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
    f.focus();
    var link = document.createElement("p");
    link.className = "video-fallback";
    link.innerHTML = 'Video not playing? <a href="https://www.youtube.com/watch?v=VK7JNPaCrjI" target="_blank" rel="noopener">Watch it on YouTube</a>.';
    box.after(link);
  });
})();

// Copy the email address.
(function () {
  var btn = document.getElementById("copy-email");
  var email = document.getElementById("email");
  var status = document.getElementById("copy-status");
  if (!btn || !email || !status) return;
  var timer;
  btn.addEventListener("click", function () {
    var text = email.textContent.trim();
    function say(msg, stay) {
      clearTimeout(timer);
      status.textContent = msg;
      if (!stay) timer = setTimeout(function () { status.textContent = ""; }, 2500);
    }
    function done() { say("Copied"); }
    // If the browser won't copy, select the address so it can be copied by hand, and say so.
    function select() {
      var r = document.createRange(); r.selectNodeContents(email); var s = getSelection(); s.removeAllRanges(); s.addRange(r);
      say("Couldn't copy. The address is selected, so you can copy it yourself.", true);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, select);
    } else { select(); }
  });
})();
