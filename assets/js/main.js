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
})();
