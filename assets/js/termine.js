/* =========================================================================
   Trachtenverein Hittenkirchen – TERMINE
   =========================================================================

   >>> HIER WERDEN DIE TERMINE GEPFLEGT – das ist die einzige Stelle. <<<

   Aus dieser Liste entstehen automatisch:
     • die Leiste „Nächster Termin" unter dem Header (auf allen Seiten)
     • die Terminliste im Abschnitt „Termine" auf der Startseite
   Vergangene Termine verschwinden von selbst, der nächste rückt automatisch nach.

   Es gibt drei Arten von Einträgen:

   1) EINMALIGER TERMIN – volles Datum angeben:
        { datum: "2026-11-07", zeit: "20:00 Uhr", titel: "Theater", ort: "Trachtenheim" }

   2) JEDES JAHR AM GLEICHEN TAG – nur Monat-Tag, dazu jaehrlich: true.
      Rollt von allein ins nächste Jahr weiter, muss also nie gepflegt werden:
        { datum: "08-24", jaehrlich: true, titel: "Patrozinium", ort: "Kirche" }

   3) NACH REGEL – z. B. „erster Sonntag im Mai". Ebenfalls wartungsfrei.
      wochentag: 0 = Sonntag, 1 = Montag … 6 = Samstag
      nter: 1 = erster, 2 = zweiter … (-1 = letzter)
        { regel: { monat: 5, wochentag: 0, nter: 1 }, titel: "Jahrtag" }

   Felder: titel (Pflicht), ort, zeit, hinweis (alle optional).
   Reihenfolge egal – es wird automatisch nach Datum sortiert.

   MEHRTÄGIGE TERMINE (z. B. Theaterwochen): zusätzlich `bis` angeben. Der
   Eintrag bleibt dann sichtbar, bis das Enddatum vorbei ist – nicht schon nach
   dem ersten Tag. Sortiert wird nach `datum` (dem Beginn):
        { datum: "2026-11-07", bis: "2026-12-28", titel: "Theater",
          hinweis: "Vorstellungen: 7.11., 8.11., …" }

   ------------------------------------------------------------------------
   STAND: Veranstaltungsprogramm 2026 (Programmheft des Vereins).
   WICHTIG: Die Einträge mit vollem Datum gelten nur für 2026. Sobald das
   Programm 2027 vorliegt, hier die neuen Daten eintragen – die alten können
   dann raus (sie werden ohnehin automatisch ausgeblendet, sobald sie vorbei
   sind). Jahrtag und Patrozinium laufen dauerhaft von selbst weiter.
   ========================================================================= */

window.HIKI_TERMINE = [

  /* ---------- Dauerhaft, wartungsfrei ---------------------------------- */

  // Jahrtag – traditionell am ersten Maisonntag (2026 war das der 03.05.).
  {
    regel: { monat: 5, wochentag: 0, nter: 1 },
    titel: "Jahrtag",
    ort: "Kirche St. Bartholomäus · Trachtenheim",
    zeit: "8:15 Kirchenzug & Gottesdienst, 10:30 Versammlung"
  },

  // Patrozinium – wird immer am 24. August gefeiert, egal welcher Wochentag.
  {
    datum: "08-24",
    jaehrlich: true,
    titel: "Patrozinium St. Bartholomäus",
    ort: "Kirche St. Bartholomäus, Hittenkirchen",
    zeit: "Festgottesdienst mit Prozession"
  },

  /* ---------- Programm 2026 – Winter / Fasching ------------------------ */

  { datum: "2026-01-07", zeit: "19:30 Uhr", titel: "Tanzkurs für Jugendliche", ort: "Trachtenheim Hittenkirchen" },
  { datum: "2026-01-14", zeit: "19:30 Uhr", titel: "Tanzkurs für Jugendliche", ort: "Trachtenheim Hittenkirchen" },
  { datum: "2026-01-21", zeit: "19:30 Uhr", titel: "Tanzkurs für Jugendliche", ort: "Trachtenheim Hittenkirchen" },
  { datum: "2026-01-28", zeit: "19:30 Uhr", titel: "Tanzkurs für Jugendliche", ort: "Trachtenheim Hittenkirchen" },
  { datum: "2026-02-06", zeit: "20:00 Uhr", titel: "Maskiertes Weiber- und Dirndlkranzl mit der Band Söör", ort: "Trachtenheim Hittenkirchen" },
  { datum: "2026-02-08", zeit: "13:00 Uhr", titel: "Kinderfasching", ort: "Trachtenheim Hittenkirchen" },
  { datum: "2026-02-11", zeit: "20:00 Uhr", titel: "Abschlussabend Tanzkurs mit der Rottauer Tanzlmusi", ort: "Trachtenheim Hittenkirchen" },
  { datum: "2026-02-18", zeit: "20:00 Uhr", titel: "Politischer Aschermittwoch mit Landwirtschaftsministerin Michaela Kaniber", ort: "Trachtenheim Hittenkirchen" },

  /* ---------- Programm 2026 – Frühjahr / Sommer ------------------------ */

  { datum: "2026-03-21", zeit: "19:30 Uhr", titel: "Pfarrabend", ort: "Trachtenheim Hittenkirchen" },
  { datum: "2026-05-14", titel: "Bitt- und Dank-Wallfahrt nach Raiten", ort: "Raiten" },
  { datum: "2026-06-14", zeit: "10:30 Uhr", titel: "Frühschoppen mit der Bundesmusikkapelle Unterlangkampfen aus Tirol", ort: "Trachtenheim Hittenkirchen" },
  { datum: "2026-07-04", titel: "6-Vereine-Preisplatteln mit Dirndldrahn", ort: "Festzelt Sachrang" },
  { datum: "2026-07-11", zeit: "17:00 Uhr", titel: "Dorffest der Ortsvereine mit Oachablech aus Unterwössen", ort: "Trachtenheim Hittenkirchen" },

  /* ---------- Gaufest-Woche in Marquartstein 2026 ---------------------- */

  { datum: "2026-07-24", zeit: "18:00 Uhr", titel: "Gaudirndldrahn", ort: "Festzelt Marquartstein" },
  { datum: "2026-07-25", zeit: "20:00 Uhr", titel: "Gauheimatabend", ort: "Festzelt Marquartstein" },
  { datum: "2026-07-26", zeit: "8:00 Uhr", titel: "88. Gaufest des Chiemgau-Alpenverbandes", ort: "Marquartstein" },
  { datum: "2026-08-02", zeit: "9:30 Uhr", titel: "Gaupreisplatteln", ort: "Festzelt Marquartstein" },

  /* ---------- Programm 2026 – Spätsommer / Herbst ---------------------- */

  { datum: "2026-08-07", zeit: "19:30 Uhr", titel: "Vereinspreisplatteln mit Dirndldrahn", ort: "Trachtenheim Hittenkirchen" },
  { datum: "2026-10-18", zeit: "10:00 Uhr", titel: "Kirtafrühschoppen", ort: "im oder am Trachtenheim" },
  { datum: "2026-10-31", zeit: "19:30 Uhr", titel: "Herbstversammlung", ort: "Trachtenheim Hittenkirchen" },

  /* ---------- Theater in Hittenkirchen 2026 ---------------------------- */

  // Theaterwochen als EIN Eintrag: bleibt dank `bis` bis zur letzten Vorstellung
  // (28.12.) sichtbar, angezeigt/sortiert wird nach dem Beginn (07.11.).
  {
    datum: "2026-11-07",
    bis: "2026-12-28",
    titel: "Theater im Trachtenheim",
    ort: "Trachtenheim Hittenkirchen",
    zeit: "Beginn 20:00 Uhr (So. 18:00 Uhr)",
    hinweis: "Vorstellungen: 7., 8., 13., 14., 15., 20., 21. & 22. November sowie 27. & 28. Dezember"
  },

  /* ---------- Programm 2026 – Advent / Weihnachten --------------------- */

  { datum: "2026-12-12", zeit: "19:00 Uhr", titel: "Weihnachtsfeier, gestaltet von den Trachtenkindern", ort: "Trachtenheim Hittenkirchen" },
  { datum: "2026-12-26", zeit: "19:30 Uhr", titel: "Christbaumversteigerung", ort: "Fischerwirt in Weisham" }

];
