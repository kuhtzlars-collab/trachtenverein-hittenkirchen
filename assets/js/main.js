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

  /* ---- Kalender-Export (.ics) --------------------------------------
     Erzeugt iCalendar-Dateien komplett im Browser (kein Server, keine
     externen Dienste). Beginnt die Zeitangabe mit "HH:MM", wird eine
     Uhrzeit (schwebende Ortszeit, +2 h) eingetragen, sonst ein ganztägiger
     Termin. Mehrtägig gebündelte Termine (Theater, Feld `bis`) werden
     bewusst NICHT als Wochenblock ausgegeben, sondern ganztägig am Beginn –
     alle Spieltermine stehen in der Beschreibung (hinweis). */
  var SEITEN_URL = "https://www.trachtenverein-hittenkirchen.de/#termine";

  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function icsDate(d) { return "" + d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()); }
  function icsEscape(s) {
    return String(s || "").replace(/\\/g, "\\\\").replace(/;/g, "\\;")
      .replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
  }
  function icsStempel() {
    var n = new Date();
    return "" + n.getUTCFullYear() + pad(n.getUTCMonth() + 1) + pad(n.getUTCDate()) + "T" +
           pad(n.getUTCHours()) + pad(n.getUTCMinutes()) + pad(n.getUTCSeconds()) + "Z";
  }
  function falteZeile(line) {            // RFC 5545: lange Zeilen falten
    if (line.length <= 74) return line;
    var out = line.slice(0, 74), rest = line.slice(74);
    while (rest.length > 73) { out += "\r\n " + rest.slice(0, 73); rest = rest.slice(73); }
    return out + "\r\n " + rest;
  }
  function vevent(t) {
    var d = t.datum, e = t.eintrag;
    var uid = icsDate(d) + "-" + (e.titel || "termin").toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40) +
              "@trachtenverein-hittenkirchen.de";
    var beschr = [e.zeit, e.hinweis, "Trachtenverein Hittenkirchen"].filter(Boolean).join("\n");
    var m = (e.zeit || "").match(/^\s*(\d{1,2}):(\d{2})/);
    var lines = ["BEGIN:VEVENT", "UID:" + uid, "DTSTAMP:" + icsStempel()];
    if (m) {
      var endeD = new Date(d.getFullYear(), d.getMonth(), d.getDate(), +m[1] + 2, +m[2]);
      lines.push("DTSTART:" + icsDate(d) + "T" + pad(+m[1]) + m[2] + "00",
                 "DTEND:" + icsDate(endeD) + "T" + pad(endeD.getHours()) + pad(endeD.getMinutes()) + "00");
    } else {
      var naechster = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
      lines.push("DTSTART;VALUE=DATE:" + icsDate(d), "DTEND;VALUE=DATE:" + icsDate(naechster));
    }
    lines.push("SUMMARY:" + icsEscape(e.titel));
    if (e.ort) { lines.push("LOCATION:" + icsEscape(e.ort)); }
    lines.push("DESCRIPTION:" + icsEscape(beschr), "URL:" + SEITEN_URL, "END:VEVENT");
    return lines.map(falteZeile).join("\r\n");
  }
  function baueICS(liste) {
    return ["BEGIN:VCALENDAR", "VERSION:2.0",
            "PRODID:-//Trachtenverein Hittenkirchen//Termine//DE", "CALSCALE:GREGORIAN"]
      .concat(liste.map(vevent)).concat(["END:VCALENDAR"]).join("\r\n");
  }
  function ladeICS(text, dateiname) {
    try {
      var blob = new Blob([text], { type: "text/calendar;charset=utf-8" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url; a.download = dateiname;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
    } catch (err) {
      window.location.href = "data:text/calendar;charset=utf-8," + encodeURIComponent(text);
    }
  }

  /* Termine-Sektion füllen */
  var listeEl = document.querySelector("[data-termine-liste]");
  if (listeEl && termine.length) {
    listeEl.innerHTML = termine.map(function (t, i) {
      var d = t.datum, e = t.eintrag;
      return '<div class="termin">' +
        '<div class="termin__date"><b>' + d.getDate() + '</b><span>' +
          MONATE_KURZ[d.getMonth()] + " " + d.getFullYear() + '</span></div>' +
        '<div class="termin__info"><strong>' + e.titel + "</strong>" +
          (e.ort ? "<span>" + e.ort + "</span>" : "") +
          (e.hinweis ? '<span class="termin__hinweis">' + e.hinweis + "</span>" : "") + "</div>" +
        '<div class="termin__meta">' +
          (e.zeit ? '<span class="termin__time">' + e.zeit + "</span>" : "") +
          '<button type="button" class="termin__cal" data-i="' + i +
            '" aria-label="Diesen Termin in den Kalender eintragen">🗓 Kalender</button>' +
        "</div>" +
        "</div>";
    }).join("");

    // Einzelner Termin -> .ics
    listeEl.addEventListener("click", function (ev) {
      var btn = ev.target.closest(".termin__cal");
      if (!btn) { return; }
      var t = termine[+btn.getAttribute("data-i")];
      if (t) { ladeICS(baueICS([t]), "termin-" + icsDate(t.datum) + ".ics"); }
    });

    /* SEO: kommende Termine zusätzlich als schema.org/Event (JSON-LD) in den
       <head> einfügen – Chance auf Rich-Results (Veranstaltungen in der Suche).
       Datenquelle bleibt HIKI_TERMINE, also wartungsfrei. Nur hier (Startseite,
       wo die Termin-Liste steht). */
    try {
      var events = termine.slice(0, 25).map(function (t) {
        var d = t.datum, e = t.eintrag;
        var m = (e.zeit || "").match(/^\s*(\d{1,2}):(\d{2})/);
        var start = d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
        if (m) { start += "T" + pad(+m[1]) + ":" + m[2] + ":00"; }
        var ev = {
          "@context": "https://schema.org",
          "@type": "Event",
          "name": e.titel,
          "startDate": start,
          "eventStatus": "https://schema.org/EventScheduled",
          "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
          "location": {
            "@type": "Place",
            "name": e.ort || "Trachtenheim Hittenkirchen",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Bernau am Chiemsee",
              "postalCode": "83233",
              "addressCountry": "DE"
            }
          },
          "organizer": {
            "@type": "Organization",
            "name": "Trachtenverein Hittenkirchen",
            "url": "https://www.trachtenverein-hittenkirchen.de/"
          },
          "url": SEITEN_URL
        };
        if (e.hinweis) { ev.description = e.hinweis; }
        if (e.bis) {
          var b = e.bis.split("-").map(Number);
          ev.endDate = b[0] + "-" + pad(b[1]) + "-" + pad(b[2]);
        }
        return ev;
      });
      if (events.length) {
        var ld = document.createElement("script");
        ld.type = "application/ld+json";
        ld.textContent = JSON.stringify(events);
        document.head.appendChild(ld);
      }
    } catch (err) { /* JSON-LD ist optional – niemals die Seite blockieren */ }
  }

  // "Alle Termine" -> kombinierte .ics
  var alleBtn = document.getElementById("termine-alle");
  if (alleBtn) {
    if (termine.length) {
      alleBtn.addEventListener("click", function () {
        ladeICS(baueICS(termine), "trachtenverein-hittenkirchen-termine.ics");
      });
    } else {
      alleBtn.style.display = "none";
    }
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
