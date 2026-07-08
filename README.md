# Trachtenverein Hittenkirchen – GTEV „Almarausch"

Moderner, statischer Website-Entwurf für den Gebirgstrachten-Erhaltungsverein
„Almarausch" Hittenkirchen (Bernau am Chiemsee, Chiemgau).

Der Entwurf ist ein Relaunch der bestehenden Wix-Seite
<https://www.trachtenverein-hittenkirchen.de/> – aufgebaut als schlanke, responsive
Website ohne Build-Tools (reines HTML/CSS/Vanilla-JS) im Stil **modern-alpin**.

## Struktur

| Datei | Inhalt |
|-------|--------|
| `index.html` | Startseite (Hero, Verein, Tracht, Trachtenheim, Vereinsleben, Aktuelles-Teaser, Impressionen, Termine, Kontakt) |
| `aktuelles.html` | Berichte aus dem Vereinsleben |
| `fotos.html` | Fotogalerie mit Lightbox |
| `impressum.html` | Kontakt / Impressum |
| `datenschutz.html` | Datenschutzerklärung |
| `assets/css/style.css` | Designsystem (Enzianblau / Tannengrün) |
| `assets/js/main.js` | Navigation, Smooth-Scroll, Lightbox, Kontaktformular |

## Bilder

Die Fotos werden derzeit vom Wix-CDN (`static.wixstatic.com`) eingebunden. Für einen
späteren, von Wix unabhängigen Betrieb können sie lokal gespeichert werden.

## Lokale Vorschau

Da auf dem Entwicklungsrechner weder Node noch Python vorhanden ist, dient ein kleiner
PowerShell-Server (`.claude/launch.json`) zur Vorschau. Alternativ genügt es, `index.html`
direkt im Browser zu öffnen (CSS/JS laden lokal, Bilder vom CDN).

## Offene Punkte

- Kontaktformular: Empfänger-Adresse bzw. Formspree-Endpoint eintragen
- Impressum & Datenschutz: rechtlich prüfen und vervollständigen
- Termine: aktuelle Daten einpflegen
- Social-Media-Links ergänzen

---

*Entwurf – Inhalte und Bilder stammen aus der bestehenden Vereins-Website.*
