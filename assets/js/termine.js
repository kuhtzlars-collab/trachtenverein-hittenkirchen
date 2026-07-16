/* =========================================================================
   Trachtenverein Hittenkirchen – TERMINE
   =========================================================================

   >>> HIER WERDEN DIE TERMINE GEPFLEGT – das ist die einzige Stelle. <<<

   Aus dieser Liste entstehen automatisch:
     • die Hinweisbox „Nächster Termin" auf der Startseite
     • die Terminliste im Abschnitt „Termine"
   Vergangene Termine verschwinden von selbst, der nächste rückt automatisch nach.

   Es gibt drei Arten von Einträgen:

   1) EINMALIGER TERMIN – volles Datum angeben:
        { datum: "2026-11-07", titel: "Theater-Premiere", ort: "Trachtenheim", zeit: "20:00 Uhr" }

   2) JEDES JAHR AM GLEICHEN TAG – nur Monat-Tag, dazu jaehrlich: true.
      Rollt von allein ins nächste Jahr weiter, muss also nie gepflegt werden:
        { datum: "08-24", jaehrlich: true, titel: "Patrozinium", ort: "Kirche" }

   3) NACH REGEL – z. B. „erster Sonntag im Mai". Ebenfalls wartungsfrei.
      wochentag: 0 = Sonntag, 1 = Montag … 6 = Samstag
      nter: 1 = erster, 2 = zweiter … (-1 = letzter)
        { regel: { monat: 5, wochentag: 0, nter: 1 }, titel: "Jahrtag", ort: "Kirche" }

   Felder: titel (Pflicht), ort, zeit, hinweis (alle optional).
   Reihenfolge in der Liste egal – es wird automatisch nach Datum sortiert.
   ========================================================================= */

window.HIKI_TERMINE = [

  // Jahrtag – traditionell am ersten Maisonntag, mit Kirchenzug,
  // Gottesdienst und anschließender Versammlung im Trachtenheim.
  {
    regel: { monat: 5, wochentag: 0, nter: 1 },
    titel: "Jahrtag mit Kirchenzug und Versammlung",
    ort: "Kirche St. Bartholomäus · Trachtenheim",
    zeit: "vormittags"
  },

  // Patrozinium – wird immer am 24. August gefeiert, egal welcher Wochentag.
  {
    datum: "08-24",
    jaehrlich: true,
    titel: "Patrozinium St. Bartholomäus",
    ort: "Kirche St. Bartholomäus, Hittenkirchen",
    zeit: "Festgottesdienst mit Prozession"
  }

  // ---------------------------------------------------------------------
  // Weitere Termine hier ergänzen, z. B.:
  //
  // { datum: "2026-10-17", titel: "Musikantenhoagascht & Weinfest",
  //   ort: "Trachtenheim Hittenkirchen", zeit: "20:00 Uhr" },
  //
  // { datum: "2026-05-22", titel: "Maiandacht",
  //   ort: "Aussichtskapelle", zeit: "19:00 Uhr" },
  //
  // Komma nicht vergessen: zwischen den Einträgen steht jeweils ein Komma,
  // nach dem letzten Eintrag keins.
  // ---------------------------------------------------------------------

];
