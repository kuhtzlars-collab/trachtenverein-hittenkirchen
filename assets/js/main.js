/* =========================================================================
   Trachtenverein Hittenkirchen – Interaktionen
   Mobile-Navigation, Reveal beim Scrollen, Foto-Lightbox
   ========================================================================= */
(function () {
  "use strict";

  /* ---- Mobile-Navigation ------------------------------------------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    // Menü schließen, wenn ein Link angeklickt wird
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---- Reveal-Animation beim Scrollen ------------------------------ */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---- Aktuelles Jahr im Footer ------------------------------------ */
  var y = document.querySelectorAll("[data-year]");
  y.forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---- Foto-Lightbox ----------------------------------------------- */
  var gallery = document.querySelector("[data-lightbox]");
  if (gallery) {
    var imgs = Array.prototype.slice.call(gallery.querySelectorAll("img"));
    var current = 0;

    var box = document.createElement("div");
    box.className = "lightbox";
    box.innerHTML =
      '<button class="lightbox__close" aria-label="Schließen">&times;</button>' +
      '<button class="lightbox__nav prev" aria-label="Vorheriges Bild">&#8249;</button>' +
      '<img alt="">' +
      '<button class="lightbox__nav next" aria-label="Nächstes Bild">&#8250;</button>';
    document.body.appendChild(box);

    var lbImg = box.querySelector("img");

    function show(i) {
      current = (i + imgs.length) % imgs.length;
      var src = imgs[current].getAttribute("data-full") || imgs[current].src;
      lbImg.src = src;
      lbImg.alt = imgs[current].alt || "";
    }
    function open(i) { show(i); box.classList.add("open"); document.body.style.overflow = "hidden"; }
    function close() { box.classList.remove("open"); document.body.style.overflow = ""; }

    imgs.forEach(function (img, i) {
      img.addEventListener("click", function () { open(i); });
    });
    box.querySelector(".lightbox__close").addEventListener("click", close);
    box.querySelector(".next").addEventListener("click", function () { show(current + 1); });
    box.querySelector(".prev").addEventListener("click", function () { show(current - 1); });
    box.addEventListener("click", function (e) { if (e.target === box) close(); });
    document.addEventListener("keydown", function (e) {
      if (!box.classList.contains("open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") show(current + 1);
      if (e.key === "ArrowLeft") show(current - 1);
    });
  }

  /* ---- Kontaktformular --------------------------------------------
     Zwei Betriebsarten – über data-Attribute am <form> steuerbar:
       data-formspree="https://formspree.io/f/XXXX"  -> echter Versand (AJAX)
       data-contact-email="info@..."                 -> Fallback per E-Mail (mailto)
     Ist keine Formspree-URL gesetzt, wird der mailto-Fallback verwendet.  */
  var form = document.querySelector("[data-contact-form]");
  if (form) {
    var hint = form.querySelector("[data-form-hint]");
    var submitBtn = form.querySelector('[type="submit"]');

    function setHint(msg, ok) {
      if (!hint) return;
      hint.textContent = msg;
      hint.style.color = ok ? "var(--tanne)" : "var(--alpenrose)";
    }
    function val(name) {
      var el = form.elements[name];
      return el ? el.value.trim() : "";
    }
    function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      // Honeypot gegen Spam-Bots
      if (val("website")) { return; }

      var vorname = val("vorname"), nachname = val("nachname");
      var email = val("email"), nachricht = val("nachricht");

      if (!vorname || !nachname || !email || !nachricht) {
        setHint("Bitte fülle alle Felder aus.", false); return;
      }
      if (!validEmail(email)) {
        setHint("Bitte gib eine gültige E-Mail-Adresse an.", false); return;
      }

      var formspree = form.getAttribute("data-formspree");
      var contactEmail = form.getAttribute("data-contact-email") || "";

      if (formspree && /^https?:\/\//.test(formspree)) {
        // Echter Versand über Formspree
        if (submitBtn) { submitBtn.disabled = true; }
        setHint("Nachricht wird gesendet …", true);
        fetch(formspree, {
          method: "POST",
          headers: { "Accept": "application/json" },
          body: new FormData(form)
        }).then(function (res) {
          if (res.ok) {
            form.reset();
            setHint("Vergelt's Gott! Deine Nachricht wurde gesendet – wir melden uns.", true);
          } else {
            setHint("Das hat leider nicht geklappt. Bitte schreib uns direkt per E-Mail.", false);
          }
        }).catch(function () {
          setHint("Verbindung fehlgeschlagen. Bitte schreib uns direkt per E-Mail.", false);
        }).finally(function () {
          if (submitBtn) { submitBtn.disabled = false; }
        });
      } else {
        // Fallback: E-Mail-Programm mit vorausgefüllter Nachricht öffnen
        var subject = "Anfrage über die Website – " + vorname + " " + nachname;
        var body = "Name: " + vorname + " " + nachname + "\nE-Mail: " + email +
                   "\n\n" + nachricht + "\n";
        var to = contactEmail || "";
        window.location.href = "mailto:" + to +
          "?subject=" + encodeURIComponent(subject) +
          "&body=" + encodeURIComponent(body);
        setHint("Dein E-Mail-Programm öffnet sich mit der vorausgefüllten Nachricht.", true);
      }
    });
  }

  /* ---- Termine: Liste rendern + Hinweisbox „Nächster Termin" --------
     Datenquelle ist assets/js/termine.js (window.HIKI_TERMINE).
     Vergangene Termine fallen automatisch raus, jährliche und
     regelbasierte Termine rollen von selbst ins nächste Jahr.        */
  var MONATE = ["Januar","Februar","März","April","Mai","Juni",
                "Juli","August","September","Oktober","November","Dezember"];
  var MONATE_KURZ = ["Jan","Feb","Mär","Apr","Mai","Jun",
                     "Jul","Aug","Sep","Okt","Nov","Dez"];
  var WOCHENTAGE = ["Sonntag","Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag"];
  var WOCHENTAGE_KURZ = ["So","Mo","Di","Mi","Do","Fr","Sa"];

  function heuteMitternacht() {
    var n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), n.getDate());
  }

  // n-ter Wochentag eines Monats, z. B. 1. Sonntag im Mai. nter = -1 -> letzter.
  function nterWochentag(jahr, monat, wochentag, nter) {
    if (nter < 0) {
      var letzter = new Date(jahr, monat, 0); // letzter Tag des Monats
      var diff = (letzter.getDay() - wochentag + 7) % 7;
      return new Date(jahr, monat - 1, letzter.getDate() - diff);
    }
    var erster = new Date(jahr, monat - 1, 1);
    var versatz = (wochentag - erster.getDay() + 7) % 7;
    return new Date(jahr, monat - 1, 1 + versatz + (nter - 1) * 7);
  }

  // Nächstes Vorkommen eines Eintrags ab heute; null = liegt in der Vergangenheit
  function naechstesVorkommen(e, heute) {
    var jahr = heute.getFullYear();
    if (e.regel) {
      var d = nterWochentag(jahr, e.regel.monat, e.regel.wochentag, e.regel.nter);
      if (d < heute) { d = nterWochentag(jahr + 1, e.regel.monat, e.regel.wochentag, e.regel.nter); }
      return d;
    }
    if (!e.datum) { return null; }
    var t = e.datum.split("-").map(Number);
    if (e.jaehrlich) {
      // Format "MM-TT"
      var m = t[0], tag = t[1];
      var k = new Date(jahr, m - 1, tag);
      if (k < heute) { k = new Date(jahr + 1, m - 1, tag); }
      return k;
    }
    // Format "JJJJ-MM-TT". Optional `bis` (Enddatum) für mehrtägige Termine:
    // Der Eintrag bleibt sichtbar, bis das Enddatum vorbei ist – sortiert/angezeigt
    // wird aber nach dem Beginn (datum).
    var voll = new Date(t[0], t[1] - 1, t[2]);
    var ende = voll;
    if (e.bis) {
      var b = e.bis.split("-").map(Number);
      ende = new Date(b[0], b[1] - 1, b[2]);
    }
    return ende < heute ? null : voll;
  }

  function kommendeTermine() {
    var liste = window.HIKI_TERMINE;
    if (!liste || !liste.length) { return []; }
    var heute = heuteMitternacht();
    return liste.map(function (e) {
      var d = naechstesVorkommen(e, heute);
      return d ? { eintrag: e, datum: d } : null;
    }).filter(Boolean).sort(function (a, b) { return a.datum - b.datum; });
  }

  var termine = kommendeTermine();

  /* Termine-Sektion füllen */
  var listeEl = document.querySelector("[data-termine-liste]");
  if (listeEl && termine.length) {
    listeEl.innerHTML = termine.map(function (t) {
      var d = t.datum, e = t.eintrag;
      return '<div class="termin">' +
        '<div class="termin__date"><b>' + d.getDate() + '</b><span>' +
          MONATE_KURZ[d.getMonth()] + " " + d.getFullYear() + '</span></div>' +
        '<div class="termin__info"><strong>' + e.titel + "</strong>" +
          (e.ort ? "<span>" + e.ort + "</span>" : "") +
          (e.hinweis ? '<span class="termin__hinweis">' + e.hinweis + "</span>" : "") + "</div>" +
        (e.zeit ? '<div class="termin__time">' + e.zeit + "</div>" : "") +
        "</div>";
    }).join("");
  }

  /* Termin-Leiste direkt unter dem Header – auf jeder Seite, dauerhaft sichtbar.
     Kein Wegklicken, kein Merken, keine Speicherung auf dem Gerät der Besucher. */
  var kopf = document.querySelector(".site-header");
  if (termine.length && kopf) {
    var n = termine[0];

    // Auf der Startseite direkt zum Abschnitt springen, sonst dorthin verlinken.
    var zielTermine = document.getElementById("termine") ? "#termine" : "index.html#termine";

    var leiste = document.createElement("div");
    leiste.className = "termin-banner";
    leiste.setAttribute("role", "complementary");
    leiste.setAttribute("aria-label", "Nächster Termin");
    leiste.innerHTML =
      '<div class="container">' +
        '<span class="termin-banner__label">📅 Nächster Termin</span>' +
        '<span class="termin-banner__text"></span>' +
        '<a class="termin-banner__link" href="' + zielTermine + '">Alle Termine</a>' +
      '</div>';

    var text = leiste.querySelector(".termin-banner__text");
    var titelEl = document.createElement("strong");
    titelEl.textContent = n.eintrag.titel;
    text.appendChild(titelEl);

    text.appendChild(Object.assign(document.createElement("span"), { className: "sep", textContent: "·" }));

    // Zwei Datumsvarianten: lang für Desktop, kurz fürs Handy (per CSS umgeschaltet),
    // damit die Leiste auf schmalen Bildschirmen nicht über mehrere Zeilen läuft.
    text.appendChild(Object.assign(document.createElement("span"), {
      className: "termin-banner__datum termin-banner__datum--lang",
      textContent: WOCHENTAGE[n.datum.getDay()] + ", " + n.datum.getDate() + ". " +
                   MONATE[n.datum.getMonth()] + " " + n.datum.getFullYear()
    }));
    text.appendChild(Object.assign(document.createElement("span"), {
      className: "termin-banner__datum termin-banner__datum--kurz",
      textContent: WOCHENTAGE_KURZ[n.datum.getDay()] + ", " + n.datum.getDate() + ". " +
                   MONATE_KURZ[n.datum.getMonth()]
    }));

    if (n.eintrag.zeit) {
      text.appendChild(Object.assign(document.createElement("span"), { className: "sep sep--klein", textContent: "·" }));
      text.appendChild(Object.assign(document.createElement("span"), { className: "termin-banner__zeit", textContent: n.eintrag.zeit }));
    }
    if (n.eintrag.ort) {
      text.appendChild(Object.assign(document.createElement("span"), { className: "sep sep--klein", textContent: "·" }));
      text.appendChild(Object.assign(document.createElement("span"), { className: "termin-banner__ort", textContent: n.eintrag.ort }));
    }

    kopf.insertAdjacentElement("afterend", leiste);
    // Anker-Sprünge müssen die zusätzliche Leistenhöhe berücksichtigen
    document.documentElement.classList.add("hat-termin-banner");
  }
})();
