# Scrum AI Toolkit — Einordnung

*Ein nüchterner Überblick für Praktiker, Entscheider und Skeptiker*

---

## Was das Toolkit ist

Der Scrum AI Toolkit besteht aus vier browserbassierten Werkzeugen und einem Onboarding-Modul, die agile Teams bei wiederkehrenden Alltagsproblemen unterstützen sollen: vergessene Retro-Maßnahmen, unklare User Stories, unstrukturiertes Impediment-Tracking und unerklärliche Velocity-Schwankungen. Die Tools laufen lokal im Browser, speichern keine personenbezogenen Daten auf Servern und sind ohne Backend deploybar. KI wird eingesetzt, um Muster sichtbar zu machen, Fragen zu generieren und Hypothesen zu formulieren — nicht, um Entscheidungen zu treffen.

---

## Was die einzelnen Tools können

**RetroMirror** strukturiert Retrospektiven in vier Pflichtphasen: Maßnahmen-Review des letzten Sprints, Team-Input, Auswahl einer Reflexionsfrage aus einer kuratierten Bibliothek, Maßnahmen-Commit mit Erfolgskriterium. Ein optionaler KI-Spiegel analysiert Muster in den Team-Eingaben — erst nach dem Commit, nicht davor. Eine Kurzskala zur psychologischen Sicherheit am Anfang jeder Sitzung deaktiviert den KI-Spiegel, wenn der Wert unter einen definierten Schwellenwert fällt.

**Story Question Engine** liest eine User Story und ihre Akzeptanzkriterien und generiert genau eine Frage — die Frage mit dem höchsten Klärungswert für das Refinement-Gespräch. Gibt keine Bewertung, keinen Score, keine Verbesserungsvorschläge. Unterscheidet zwischen Discovery-Phase und Planning-ready und passt die Frage entsprechend an. Erkennt automatisch vage Formulierungen in Akzeptanzkriterien, die korrekte Syntax aber keine testbare Aussage haben.

**ImpedimentRadar** erfasst Impediments, ordnet sie einer fixen Fünf-Kategorien-Taxonomie zu und macht Muster über Sprints hinweg sichtbar. Kein Personenbezug, keine automatische Eskalation. Erkennt nach drei oder mehr Sprints Impediments, die trotz „gelöst"-Markierung im Wortlaut ähnlich wiederkehren.

**VelocityLens** verknüpft Velocity-Daten mit dokumentierten Sprint-Ereignissen und generiert Hypothesen — explizit als Hypothesen, nicht als Erklärungen. Erkennt automatisch Muster, die auf Goodhart-Optimierung hindeuten: steigende Velocity bei gleichbleibenden oder zunehmenden Impediments.

---

## Wie der Ablauf funktioniert

Alle vier Tools folgen derselben Grundstruktur: Zunächst gibt das Team eine eigene Einschätzung ab — das ist technisch erzwungen, der KI-Button bleibt bis dahin gesperrt. Dann erscheint die KI-Analyse oder -Frage. Das Team entscheidet, was davon zutrifft. Die Entscheidung liegt immer beim Team, nie beim Tool.

Das Pre-Start-Modul stellt vor dem ersten Einsatz die Frage nach dem aktuellen Schmerz des Teams und leitet daraus eine priorisierte Empfehlung ab, welches Tool zuerst eingesetzt werden sollte. Es enthält außerdem eine Checkliste der Stellen, die vor dem Einsatz informiert werden müssen, sowie zwei kopierbare Vorlagen für die Kommunikation mit Team und Betriebsrat.

---

## Wo die Grenzen liegen

Die Tools sind auf Teams ausgelegt, die bereits ein Grundmaß an Vertrauen und funktionierende Grundstrukturen haben. Sie strukturieren bestehende Prozesse — sie reparieren keine kaputten.

Impediments werden häufig mündlich benannt, nicht schriftlich erfasst. Die Datenbasis des ImpedimentRadar ist deshalb strukturell unvollständig. Muster, die das Tool erkennt, basieren auf dem, was eingetragen wurde — nicht auf dem, was tatsächlich passiert ist. Das Tool kommuniziert das nicht aktiv.

Story Points sind teamspezifische Relativmaße. VelocityLens erzwingt technisch, dass keine teamübergreifenden Vergleiche möglich sind. Aber Kausalität zwischen Ereignissen und Velocity-Schwankungen kann auch das Tool nicht herstellen — es produziert Korrelationshypothesen, keine Ursachenanalysen.

Die KI-generierte Frage der Story Question Engine ist eine Sprachanalyse, keine Produktstrategie-Einschätzung. Ob eine Story tatsächlich wertvoll ist, kann das Tool nicht beurteilen.

---

## Risiken und Herausforderungen in der Anwendung

Das größte Risiko liegt nicht im technischen Design, sondern im Einführungskontext. Werden die Tools top-down eingeführt oder mit Management-Zugriff auf Ergebnisse verbunden, kehren sich die Schutzmaßnahmen um: Phase-Lock wird als Kontrollmechanismus wahrgenommen, Impediment-Tracking als Surveillance, Velocity-Analyse als Leistungsüberwachung. Technische Schutzmaßnahmen schützen nicht vor falscher Wahrnehmung.

Strategic Filling ist ein weiteres strukturelles Risiko: Teams, die wissen, welche Pflichtfelder ausgefüllt sein müssen, bevor die KI-Analyse erscheint, lernen, diese Felder strategisch zu befüllen. Phase-Lock verhindert Anchoring, aber nicht Konformitätsdruck — in Teams mit Machtgefällen werden Pflicht-Einschätzungen von der lautesten Stimme dominiert.

Automation Bias lässt sich durch Interface-Design mildern, aber nicht eliminieren. Teams nehmen KI-Output typischerweise als objektiver wahr als gleichwertig dargestellte menschliche Einschätzungen — unabhängig davon, ob beide gleich groß auf dem Bildschirm sind.

In Organisationen mit Betriebsrat ist die Frage der Mitbestimmungspflicht nach BetrVG §87 Abs. 1 Nr. 6 zu klären, bevor der erste Einsatz stattfindet. Die Tools sind so konzipiert, dass sie die Schwelle zur Leistungsüberwachung technisch nicht überschreiten. Ob das so wahrgenommen wird, entscheidet nicht das Design, sondern der Betriebsrat.

---

## Was man beachten sollte

Drei Fragen sollten beantwortet sein, bevor ein Team beginnt: Wer hat Zugriff auf die Ergebnisse — und ist das schriftlich festgehalten? Hat der Betriebsrat die Möglichkeit gehabt, die Tools zu prüfen? Hat das Team explizit zugestimmt, nicht nur zugehört?

Der Einstieg über ein freiwilliges Einzelteam für drei Sprints ist risikoärmer als ein organisationsweiter Rollout. Drei Sprints, dann Teamentscheidung: weiter, anpassen oder stoppen. Dieser Evaluationszeitpunkt sollte vor dem Start vereinbart werden, nicht danach.

---

## Mögliche Weiterentwicklungen

Aggregierte, anonymisierte Muster über mehrere Teams hinweg — mit explizitem opt-in und Betriebsvereinbarung — könnten organisationale Lernprozesse unterstützen, die heute unsichtbar bleiben. Das wäre eine substanzielle Erweiterung, die neue rechtliche und soziale Voraussetzungen erfordert.

Eine Facilitator-Modus-Erweiterung für RetroMirror, die dem Scrum Master aggregierte Muster und Moderationshinweise gibt — ohne Einzelaussagen zu zeigen — ist als V2-Feature beschrieben, fehlt aber noch in der Implementierung.

Verbindungen zwischen den Tools — etwa ImpedimentRadar-Einträge, die automatisch als Kontext in VelocityLens erscheinen — würden den Werkzeugkasten als System erfahrbar machen, nicht nur als Sammlung separater Anwendungen.

---

## Was stattdessen zu tun ist, wenn psychologische Sicherheit das Problem ist

Amy Edmondson, deren Forschung zu psychologischer Sicherheit in Teams als Grundlage für die Edmondson-Kurzskala im Tool dient, ist eindeutig: Psychologische Sicherheit entsteht durch Führungsverhalten, nicht durch Prozesse oder Tools. Konkret: durch Führungspersonen, die eigene Fehler benennen, Beiträge anderer aktiv einfordern und Sanktionen für Risikobereitschaft öffentlich ablehnen.

In Teams, in denen das Grundvertrauen fehlt, ist ein erfahrener Agile Coach oder externer Facilitator der richtige Einstieg. Nicht, weil die Tools schlecht sind — sondern weil sie bestehende Dynamiken strukturieren, nicht verändern. Ein Tool, das in ein Umfeld mit niedrigem Vertrauen eingeführt wird, kann das Misstrauen verstärken, weil es als weiterer Kontrollmechanismus gelesen wird.

Die Retro-Literatur benennt als häufigsten Einzel-Hebel für Vertrauensaufbau in Scrum-Teams die Praxis, dass der Scrum Master in der ersten Retrospektive eigene Fehler aus dem letzten Sprint benennt — bevor das Team dazu eingeladen wird. Das ist kein Tool-Feature. Es ist Führung.

---

## Was ein kritischer Beobachter zur Einordnung sagen würde

Der Toolkit adressiert reale Probleme und tut das methodisch sorgfältiger als die meisten vergleichbaren Angebote. Die explizite Benennung von Grenzen — Goodhart-Warnung in VelocityLens, Anonymitäts-Hinweis in RetroMirror, Stopp-Regeln im Pre-Start-Modul — ist ungewöhnlich für ein Tool, das sich auch verkaufen möchte.

Gleichzeitig gilt: Kein Tool verändert Organisationskultur. Die Forschungslage ist klar — 70 Prozent der Probleme bei KI-Adoption liegen bei Menschen und Prozessen, nicht bei der Technologie. Dasselbe gilt für agile Adoption. Ein weiteres Tool, das Teams zu strukturierterer Reflexion zwingt, löst das strukturelle Problem nicht, wenn die Reflexionsergebnisse in einem System verschwinden, das keine Konsequenzen zieht.

Der stärkste Einwand gegen den gesamten Ansatz ist nicht technischer, sondern strategischer Natur: Die vier Tools lösen Symptome — zu wenig Accountability bei Maßnahmen, unklare Stories, unstrukturiertes Impediment-Tracking. Die Ursachen dieser Symptome liegen in Entscheidungsstrukturen, Führungsverhalten und Organisationsdesign. Wer an den Ursachen arbeiten will, braucht andere Werkzeuge als diese.

Das macht den Toolkit nicht wertlos. Es schränkt seinen Wirkungsradius ein — und das sollte jede:r wissen, der ihn einsetzt.

---

*Einordnung erstellt: 01. Mai 2026*
