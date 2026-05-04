# BAUPLAN: RetroMirror
## Für Claude Code – vollständige Implementierungsspezifikation
## Version 2.0 – nach Practitioner-Review grundlegend überarbeitet

---

## 1. Warum dieser Blueprint anders ist als Version 1

Version 1 war ein KI-Analyse-Tool mit Retro-Kontext.  
Die Practitioner-Kritik war strukturell: Das Tool löste das intellektuell interessante Problem, nicht das dringlichste.

**Vier zentrale Erkenntnisse aus dem Review:**

1. Schlechte Retros scheitern fast nie an mangelnder Analyse — sie scheitern am Maßnahmen-Commit. Dieselben Themen kommen Sprint für Sprint wieder, weil keine Maßnahme wirklich committed und überprüft wird. Das ist das dringlichste Problem.
2. Phase-Lock löst Anchoring, schafft aber Strategic Filling: kollektive Festlegung vor der KI-Analyse wird in Teams mit Machtgefällen von der lautesten Stimme dominiert. Pflicht-Phase-Lock ist paternalistisch und löst das falsche Problem.
3. KI-generierte Double-Loop-Fragen sind konzeptuell gebrochen. Double-Loop-Learning nach Argyris/Schön erfordert, dass das Team eigene Annahmen herausfordert — nicht, dass eine externe KI eine Frage stellt, auf die das Team antwortet. Das ist strukturell Single-Loop.
4. Das Kalibrierungs-Feature trainiert implizit: „die KI hatte recht." Das ist das Gegenteil des erklärten Ziels.

**Die Konsequenz:** Das Kernprodukt ist der Maßnahmen-Commit-Tracker.  
Der KI-Spiegel ist eine optionale Erweiterung — nicht der Kern.

---

## 2. Zweck & Design-Philosophie

**Name:** RetroMirror (unverändert)

**Kernidee, neu:** Ein leichtgewichtiges Tool, das das eine Problem löst, an dem Retros tatsächlich scheitern: Maßnahmen werden formuliert und vergessen. RetroMirror macht den Commit sichtbar, überprüfbar und transparent — Sprint für Sprint.

**Der optionale KI-Spiegel:** Für Teams, die zusätzlich zur Maßnahmen-Commit-Funktion Muster über Sprints hinweg sichtbar machen wollen, gibt es einen KI-Analyse-Layer. Er ist opt-in, kommt nach dem Commit — nicht davor — und ersetzt keine Facilitation.

**Das zentrale Designprinzip:**  
Kein Tool ersetzt psychologische Sicherheit. Deshalb wird sie zuerst gemessen — und bei niedrigem Wert erscheint nicht die KI-Analyse, sondern ein klarer Hinweis: dieses Team braucht jetzt einen Facilitator, kein Tool.

**Was dieses Tool ausdrücklich NICHT ist:**
- Kein Analyse-Tool, das schlechte Retros repariert
- Kein Ersatz für einen kompetenten Scrum Master
- Kein Surveillance-System (kein Personenbezug, kein Management-Export)
- Kein Tool, das Anonymität verspricht, die es in kleinen Teams nicht geben kann

---

## 3. Ehrlicher Umgang mit Anonymität

Version 1 versprach Anonymität durch Textfelder ohne Login. Die Practitioner-Kritik war korrekt: In einem Fünf-Personen-Team ist Texteingabe nicht anonym — Schreibstil, bekannte Themen, typische Formulierungen machen Eingaben zuordenbar.

**Die neue Haltung:** Das Tool verspricht keine Anonymität. Es verspricht Datensparsamkeit.

Konkret: Kein Personenbezug wird gespeichert oder exportiert. Kein Login. Kein Profiling. Keine Einzelaussagen im Export. Aber das Interface kommuniziert explizit beim ersten Start:

> „Dieses Tool speichert keine Namen und erstellt keine Profile. In kleinen Teams sind Texteingaben trotzdem oft erkennbar — das liegt in der Natur enger Zusammenarbeit, nicht am Tool. Wenn euer Team noch kein hohes gegenseitiges Vertrauen hat, ist ein erfahrener Facilitator der bessere Einstieg."

Das ist unbequem. Es ist trotzdem die richtigere Aussage als ein falsches Sicherheitsversprechen.

---

## 4. Tech-Stack-Empfehlung

```
Framework:     React 18 + Vite
Styling:       Tailwind CSS (Core-Utilities) + custom CSS variables
KI:            Anthropic Claude API (claude-sonnet-4-20250514), Streaming
               — nur für optionalen KI-Spiegel, Kern-Funktionen brauchen keine KI
Persistenz:    localStorage (Sprint-Daten) + JSON-Export (Maßnahmen-Karte)
State:         React useState/useReducer
Fonts:         Inter via jsDelivr CDN
Deploy:        Lokal via `npm run dev`, optional Netlify/Vercel
```

**Wichtig:** Das Tool funktioniert vollständig ohne API-Key — der KI-Spiegel ist der einzige Teil, der die Anthropic API nutzt. Das reduziert die Abhängigkeit und macht das Tool auch ohne API deploybar.

---

## 5. Architektur-Überblick

```
retromirror/
├── src/
│   ├── App.jsx
│   ├── components/
│   │   ├── SafetyCheck.jsx           # Edmondson-Kurzskala (3 Items) — Gate
│   │   ├── ActionReview.jsx          # KERN: Was wurde letzten Sprint committed?
│   │   ├── TeamInput.jsx             # Retro-Eingaben (Format wählbar)
│   │   ├── ActionCommit.jsx          # KERN: Eine Maßnahme, klar formuliert
│   │   ├── FacilitatorView.jsx       # Separate Ansicht für Scrum Master
│   │   ├── QuestionLibrary.jsx       # Kuratierte Fragen (kein KI-Generator)
│   │   └── KIMirror.jsx              # OPTIONAL: KI-Muster-Analyse (opt-in)
│   ├── hooks/
│   │   ├── useAnthropicStream.js     # Nur für KIMirror
│   │   └── useSprintStorage.js
│   ├── prompts/
│   │   └── mirror-analysis.js        # System-Prompt für optionalen KI-Spiegel
│   ├── data/
│   │   ├── sprintSchema.js
│   │   └── questionLibrary.js        # Kuratierte Fragen nach Kategorie
```

---

## 6. Datenmodell

```javascript
const SprintRecord = {
  id: "uuid",
  sprintNumber: 42,
  teamName: "Team Nordsee",           // optional, nur lokal
  date: "2026-05-01",
  format: "4L" | "SSC" | "MSG" | "Sailboat",

  // Gate: Psychologische Sicherheit
  safetyCheck: {
    score: 1-5,                        // Durchschnitt 3 Items (Edmondson-Kurzskala)
    belowThreshold: true | false,      // < 3.0 → kein KI-Spiegel empfohlen
    skipped: true | false              // Team kann überspringen, mit Hinweis
  },

  // KERN 1: Maßnahmen-Review (Beginn jeder Retro)
  actionReview: {
    previousAction: "...",             // Was wurde letzten Sprint committed?
    implemented: true | false | "partial",
    blockers: ["..."],                 // Falls nicht umgesetzt: was hat es verhindert?
    insight: "..."                     // Was lernen wir daraus?
  },

  // Team-Eingaben
  teamObservations: {
    wentWell: ["..."],
    wentBadly: ["..."],
    impediments: ["..."]
    // Kein teamMood-Score — zu einfach spielbar, suggeriert Präzision die nicht da ist
  },

  // Kuratierte Frage (vom Team gewählt, nicht KI-generiert)
  selectedQuestion: {
    category: "prozess" | "kommunikation" | "technisch" | "extern",
    question: "...",
    teamResponse: "..."                // Freitext, bleibt beim Team
  },

  // KERN 2: Maßnahmen-Commit
  actionCommit: {
    action: "...",                     // Eine Maßnahme, präzise formuliert
    successCriterion: "...",           // Wie wissen wir nächste Retro, ob es geklappt hat?
    owner: "Team" | "SM" | "PO",      // Nie eine Einzelperson
    reviewDate: "next-retro"
  },

  // OPTIONAL: KI-Spiegel (nur wenn Team opt-in gegeben hat)
  kiMirror: {
    activated: true | false,
    patterns: "...",
    uncertainties: "...",
    teamResponse: "..."                // Team-Einschätzung der KI-Analyse
  }
}
```

---

## 7. Interaktionsfluss

**Gesamtdauer: 60–75 Minuten. Nicht mehr.**  
Version 1 hätte realistisch 2+ Stunden gedauert. Das ist kein Retro-Tool, das ist ein Workshop.

---

### Phase 0: Psychologische Sicherheit (3 Min)

Drei Items aus Edmondsons validierter Skala, auf 1–5 bewertet (anonym, Durchschnitt wird angezeigt):

1. „Wenn ich in diesem Team einen Fehler mache, wird mir das oft vorgehalten."
2. „In diesem Team kann ich Probleme und schwierige Themen ansprechen."
3. „In diesem Team fühle ich mich sicher, Risiken einzugehen."

*(Item 1 ist reverse-scored)*

**Wenn Durchschnitt < 3.0:**  
Kein Fehler-Bildschirm. Stattdessen ruhiger Hinweis:

> „Euer Team-Score deutet darauf hin, dass offene Diskussion gerade schwierig sein könnte. Das ist häufig und kein Versagen. Ein erfahrener Facilitator wäre jetzt hilfreicher als ein KI-Tool. Ihr könnt trotzdem weitermachen — aber der KI-Spiegel wird für diese Retro deaktiviert."

**Team kann Phase 0 überspringen** — mit sichtbarem Hinweis, nicht mit verstecktem Konsequenz-Flag.

---

### Phase 1: Maßnahmen-Review (10 Min) — das Herzstück

Das ist der Teil, der in den meisten Retros fehlt und am meisten kostet.

Das Tool zeigt den Commit aus der letzten Retro:

> „Letzten Sprint habt ihr committed: *[Maßnahme aus Sprint N-1]*  
> Erfolgskriterium war: *[successCriterion]*  
> Wurde es umgesetzt?"

Drei Optionen: Ja / Nein / Teilweise.

Bei Nein oder Teilweise: Pflichtfeld — was hat es verhindert?  
Nicht als Vorwurf, sondern als Systemfrage: War es ein Ressourcenproblem, eine externe Abhängigkeit, eine Priorisierungsentscheidung?

**Warum das wichtig ist:** Teams, die lernen müssen *warum* ihre Maßnahmen scheitern, hören auf, unrealistische Maßnahmen zu committen. Das ist organisches Lernen — kein KI-Feature nötig.

---

### Phase 2: Team-Input (15 Min)

Format wählbar: 4L, Start-Stop-Continue, Mad-Sad-Glad, Sailboat.  
Freitexteingaben. Aggregierte Anzeige.

**Kein Phase-Lock für KI-Analyse hier.** Stattdessen: Die KI-Option erscheint erst nach Phase 3 (Commit) — nicht als Vorstufe zum Commit, sondern als Reflexion danach. Das ist die strukturelle Umkehrung gegenüber Version 1.

---

### Phase 3: Kuratierte Frage (10 Min)

Statt einer KI-generierten Double-Loop-Frage wählt das Team eine Frage aus einer kuratierten Bibliothek — nach Kategorie sortiert.

**Warum keine KI-generierte Frage:**  
Double-Loop-Learning nach Argyris/Schön erfordert, dass das Team eigene Annahmen herausfordert. Eine extern generierte Frage ist strukturell Single-Loop — das Team antwortet auf eine Frage, es stellt keine eigene Annahme in Frage. Die kuratierte Bibliothek ist ehrlicher: das Team wählt, welche Kategorie relevant ist, und damit welche Annahme es herausfordern will.

**Bibliothek-Struktur (im Code als `questionLibrary.js`):**

```javascript
export const QUESTION_LIBRARY = {
  prozess: [
    "Welche unserer Prozessregeln haben wir diesen Sprint gebrochen — und war das richtig?",
    "Wenn wir diesen Sprint von vorne beginnen könnten: was würden wir in der ersten Stunde anders entscheiden?",
    "Welche Meeting-Routine kostet uns mehr als sie bringt?"
  ],
  kommunikation: [
    "Welche wichtige Information hat diesen Sprint zu spät die richtige Person erreicht?",
    "Wann haben wir etwas assumed, statt es zu klären — und was hat das gekostet?",
    "Welches Thema wird im Team besprochen, aber nicht im Planning oder Retro?"
  ],
  technisch: [
    "Welche technische Entscheidung aus den letzten drei Sprints würden wir heute anders treffen?",
    "Was haben wir diesen Sprint gebaut, das wir wahrscheinlich bald wieder umbauen müssen?",
    "Wo hat uns technische Schuld diesen Sprint konkret Zeit gekostet?"
  ],
  extern: [
    "Welche externe Abhängigkeit hat uns diesen Sprint am meisten gebremst — und ist das strukturell oder einmalig?",
    "Welche Entscheidung, die außerhalb des Teams getroffen wurde, hat uns am stärksten beeinflusst?",
    "Was könnte das Team selbst entscheiden, das gerade noch außerhalb liegt?"
  ]
};
```

Team-Antwort auf die gewählte Frage: Freitext. Kein KI-Kommentar danach. Die Antwort bleibt beim Team.

---

### Phase 4: Maßnahmen-Commit (10 Min)

Eine Maßnahme. Kein Backlog von fünf Punkten.

**Pflichtfelder:**
1. **Maßnahme:** Was genau tun wir anders? (kein Wunsch, eine Handlung)
2. **Erfolgskriterium:** Woran erkennen wir nächste Retro, dass es gewirkt hat? (beobachtbar, nicht interpretierbar)
3. **Verantwortung:** Team / Scrum Master / Product Owner

**UX-Detail:** Das Tool blockiert Formulierungen, die kein Erfolgskriterium haben. Nicht mit Fehlermeldung — sondern mit Prompt: „Wie würdet ihr in der nächsten Retro wissen, ob das geklappt hat?"

**Export:** Nur die Maßnahmen-Karte. Drei Zeilen. Für das Kanban-Board oder Jira.

---

### Phase 5 (optional): KI-Spiegel

Erst hier, nach dem Commit. Nicht als Vorstufe.

Das Team entscheidet aktiv: „Wollt ihr sehen, welche Muster die KI in euren Eingaben erkennt?"  
Nicht als Default. Nicht mit Fortschrittsbalken, der suggeriert, das gehöre dazu.

**Wenn aktiviert:**  
KI analysiert Team-Eingaben aus Phase 2 und Maßnahmen-Review aus Phase 1.  
Output: Muster + explizite Unsicherheiten.  
Kein Vorschlag für alternative Maßnahmen — der Commit ist bereits getroffen.

**Automation-Bias-Problem aus Version 1 adressiert:**  
Visuelles Gleichgewicht reicht nicht. Der KI-Spiegel erscheint strukturell nach dem Commit — das Team hat bereits entschieden, bevor die KI-Analyse erscheint. Das ist kein visuelles Framing, das ist eine Prozessreihenfolge. Anchoring kann nicht entstehen, weil es nichts mehr zu anchoren gibt.

---

### Facilitator-Ansicht (separater Modus)

Der Scrum Master hat eine eigene Ansicht — nicht Einzelaussagen, aber:
- Aggregierte Muster aus Phase 2
- Offene Maßnahmen der letzten drei Sprints (implementiert / nicht implementiert)
- Gewählte Fragen-Kategorien der letzten Sprints (zeigt, worüber das Team immer wieder nachdenkt)
- Moderationshinweise für die aktuelle Phase

Das entspricht der tatsächlichen Rolle: Scrum Master facilitiert, sieht Muster, greift nicht in Inhalte ein.

---

## 8. System-Prompt (nur für optionalen KI-Spiegel)

```javascript
export const MIRROR_ANALYSIS_PROMPT = `
Du bist ein Mustererkenner für Retrospektiven-Daten. Deine Aufgabe ist begrenzt und klar.

KONTEXT:
- Der Maßnahmen-Commit für diesen Sprint ist bereits getroffen: {actionCommit}
- Du schlägst KEINE alternativen Maßnahmen vor. Der Commit steht.
- Sprint-Nummer: {sprintNumber}
- Team-Eingaben: {teamObservations}
- Maßnahmen-Review (letzter Sprint): {actionReview}
- Vorherige Sprints (falls vorhanden): {previousSprints}

DEINE AUFGABE:
Benenne Muster in den Eingaben. Nicht mehr.

PFLICHT-REGELN:
1. Beginne mit: was sich wiederholt (über Sprints, falls Daten vorhanden)
2. Markiere explizit, was du NICHT beurteilen kannst
3. Keine Maßnahmen-Vorschläge — der Commit steht bereits
4. Keine Personalzuweisungen
5. Maximal 200 Wörter

FORMAT:
## Muster (was ich in den Eingaben sehe)
[2-3 Sätze, beobachtend]

## Was ich nicht beurteilen kann
[mindestens 1 Punkt, ehrlich]

VERBOTEN:
- Kein Score, keine Bewertung
- Keine Maßnahmen-Empfehlung
- Kein Kommentar zur gewählten Maßnahme
- Keine Aussagen über Teamdynamik oder Personen
`;
```

---

## 9. Was bewusst weggelassen wurde (und warum)

| Feature aus V1 | Warum entfernt |
|---|---|
| KI-generierte Double-Loop-Frage | Konzeptuell Single-Loop; durch kuratierte Fragenbibliothek ersetzt |
| Phase-Lock als Pflicht | Schafft Strategic Filling; jetzt optional mit transparenter Konsequenz |
| Kalibrierungs-Feature (KI hatte recht?) | Trainiert implizit Vertrauen in KI statt kritische Kompetenz |
| teamMood-Score | Zu einfach spielbar; suggeriert Präzision die nicht existiert |
| KI-Analyse vor dem Commit | Reihenfolge umgekehrt: Commit zuerst, Spiegel danach |
| Anonymitäts-Versprechen | Ersetzt durch ehrlichen Datensparsamkeits-Hinweis |
| 7 Phasen | Reduziert auf 4 Pflicht-Phasen + 1 optionale; max 75 Minuten |

---

## 10. Anti-Pattern-Schutzmaßnahmen

| Anti-Pattern | Schutzmechanismus |
|---|---|
| Retros ohne Konsequenz | Maßnahmen-Review als Pflicht-Einstieg jeder Retro |
| KI-Output dominiert Commit | Commit vor KI-Spiegel — strukturell, nicht visuell |
| Automation Bias | KI-Spiegel opt-in, nach Commit, explizit als Zusatz geframed |
| Strategic Filling | Phase-Lock optional; Transparenz statt Zwang |
| Falsches Anonymitäts-Versprechen | Expliziter Hinweis; kein Versprechen das nicht haltbar ist |
| Management-Surveillance | Kein Vollexport; nur Maßnahmen-Karte (3 Zeilen) |
| Zu viele Maßnahmen | UI erzwingt eine Maßnahme mit Erfolgskriterium |
| Retro dauert zu lang | 4 Pflichtphasen, Gesamtzeit ~60-75 Minuten |

---

## 11. Datenschutz (DSGVO / BetrVG)

- Kein Backend — API-Calls direkt vom Browser
- API-Key nur in `.env.local`, nie im Build
- Kein Login, kein Personenbezug, kein Profiling
- localStorage-Schlüssel: `retromirror_sprint_{id}` — leicht löschbar
- Safety-Check-Daten werden nur als Durchschnitt gespeichert, nie als Einzelwerte
- Datenschutz-Modal beim ersten Start (muss bestätigt werden) — mit ehrlichem Anonymitäts-Hinweis
- Export nur Maßnahmen-Karte; Vollexport nur nach explizitem Team-Beschluss mit BetrVG-§87-Hinweis

---

## 12. Implementierungsreihenfolge für Claude Code

1. `npm create vite@latest retromirror -- --template react`
2. Tailwind + Inter-Font (jsDelivr CDN) einrichten
3. Datenmodell + localStorage-Hook
4. Phasen-Navigation ohne KI (Phase 0–4) als Grundgerüst
5. Edmondson-Kurzskala mit Schwellenwert-Logik
6. Maßnahmen-Review-Komponente (Kern — hier anfangen)
7. Kuratierte Fragenbibliothek
8. Maßnahmen-Commit mit Erfolgskriterium-Pflichtfeld
9. Facilitator-Ansicht (separater Modus)
10. Anthropic API-Integration für optionalen KI-Spiegel
11. System-Prompt + Opt-in-UX für KI-Spiegel
12. Export-Mechanismus (Clipboard + JSON)
13. Datenschutz-Modal

---

## 13. Verhältnis zur Story Question Engine

Beide Tools teilen dasselbe Grundprinzip: KI als optionaler Gesprächsstarter, Entscheidung beim Team, kein Surveillance-Export.

Komplementär:
- SQE wirkt vor dem Sprint (Refinement, Planning)
- RetroMirror wirkt nach dem Sprint (Retrospektive)

Geteilte Designentscheidung: KI-Output erscheint strukturell nach der menschlichen Entscheidung — nie davor.

---

*Bauplan Version 2.0 — 01. Mai 2026*  
*Version 1.0 (KI-Analyse-zentriert) verworfen nach Practitioner-Review*  
*Designprinzipien: Argyris/Schön Double-Loop Learning (1996), Amy Edmondson Psychological Safety Scale (1999), Goodhart's Law (1975/Strathern 1997), Ironies of Automation (Bainbridge 1983), Automation Bias (Dhami et al.), Self-Determination Theory (Deci/Ryan)*
