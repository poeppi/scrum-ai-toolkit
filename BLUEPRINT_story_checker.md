# BAUPLAN: Story Question Engine
## Für Claude Code – vollständige Implementierungsspezifikation
## Version 2.0 – nach Practitioner-Review überarbeitet

---

## 1. Warum dieser Blueprint anders ist als der erste Entwurf

Der erste Entwurf war ein INVEST-Checker: Story rein, Bewertung raus.  
Die Practitioner-Kritik war eindeutig: Das ist das falsche Produkt.

**Drei zentrale Erkenntnisse aus dem Review:**

1. GWT-Konformität ist kein Qualitätsmerkmal. Ein LLM, das GWT-Format prüft, gibt False Positives für Cargo-Cult-Akzeptanzkriterien — korrekte Syntax, null Aussage.
2. Solo-Nutzung durch den Product Owner unter Zeitdruck führt zu Checkbox-Verhalten, nicht zu Reflexion.
3. Der einzige Teil mit echtem Lernwert war eine Halbsatz-Idee: eine präzise Folgefrage statt einer Bewertungsliste.

**Die Konsequenz:** Kein INVEST-Score. Keine Checkliste. Keine grünen Häkchen.  
Das Tool stellt **eine einzige Frage** — und diese Frage ist der Output.

---

## 2. Zweck & Design-Philosophie

**Name:** Story Question Engine (SQE)

**Kernidee:** Das Tool liest eine User Story und ihre Akzeptanzkriterien und stellt genau eine Frage — die Frage, die das Team im Refinement-Meeting beantworten muss, bevor die Story planning-ready ist. Wenn das Team die Frage beantworten kann, ist die Story fertig. Wenn nicht, braucht sie mehr Arbeit.

**Das zentrale Designprinzip:**  
Kein Score. Kein Grün/Rot. Keine Bewertung.  
Nur eine Frage — präzise auf die schwächste Stelle der Story zugeschnitten.

**Primärer Nutzungskontext:**  
Refinement-Meeting. Team und Product Owner gemeinsam. Tool läuft auf dem Beamer.  
Nicht: Product Owner allein, unter Zeitdruck, vor dem Planning.

**Was dieses Tool ausdrücklich NICHT ist:**
- Kein INVEST-Vollständigkeits-Checker
- Kein Ersatz für das Refinement-Gespräch — es ist der Einstieg ins Gespräch
- Kein Tool, das Stories „repariert" oder Akzeptanzkriterien vorschlägt
- Kein Qualitäts-Gate (keine Story wird blockiert oder freigegeben)

**Goodhart-Resistenz durch Design:**  
Ein Score ist vorhersehbar — Teams optimieren für ihn.  
Eine offene Frage ist nicht vorhersehbar — sie zwingt zur inhaltlichen Auseinandersetzung.  
Das ist der einzige Goodhart-resistente Mechanismus ohne menschliches Urteil im Loop.

---

## 3. Tech-Stack-Empfehlung

```
Framework:     React 18 + Vite
Styling:       Tailwind CSS (Core-Utilities) + custom CSS variables
KI:            Anthropic Claude API (claude-sonnet-4-20250514), Streaming
Persistenz:    localStorage (Session-Daten) + JSON-Export für Jira/Confluence
State:         React useState/useReducer
Fonts:         Inter via jsDelivr CDN (konsistent mit Portfolio-Standard)
Deploy:        Lokal via `npm run dev`, optional Netlify/Vercel
```

---

## 4. Architektur-Überblick

```
story-question-engine/
├── src/
│   ├── App.jsx                        # Router + globales State Management
│   ├── components/
│   │   ├── PhaseSelector.jsx          # Discovery vs. Planning-ready (Zeitpunkt-Kontext)
│   │   ├── StoryInput.jsx             # Story + ACs eingeben
│   │   ├── TeamHypothesis.jsx         # Team-Einschätzung VOR der KI-Frage
│   │   ├── QuestionDisplay.jsx        # Die eine KI-Frage (Kern des Tools)
│   │   ├── TeamAnswer.jsx             # Team beantwortet die Frage
│   │   ├── ReadinessVerdict.jsx       # Team entscheidet: planning-ready ja/nein
│   │   ├── StoryArchive.jsx           # Verlauf der Stories + Fragen
│   │   └── ExportCard.jsx             # Export für Jira/Confluence (Maßnahmen-Karte)
│   ├── hooks/
│   │   ├── useAnthropicStream.js      # Streaming API-Calls
│   │   └── useStoryStorage.js         # localStorage Persistenz
│   ├── prompts/
│   │   ├── question-generator.js      # Kern-Prompt: eine Frage generieren
│   │   ├── cargo-cult-detector.js     # GWT-Cargo-Cult erkennen
│   │   └── phase-adapter.js           # Discovery vs. Planning-ready Anpassung
│   └── data/
│       └── storySchema.js             # Datenmodell
```

---

## 5. Datenmodell

```javascript
const StoryRecord = {
  id: "uuid",
  date: "2026-04-30",
  phase: "discovery" | "planning-ready",   // Zeitpunkt-Kontext (Pflichtfeld)

  // Eingabe
  story: {
    text: "Als [Rolle] möchte ich [Ziel], damit [Nutzen].",
    acceptanceCriteria: ["...", "..."],
    context: "..."                          // optional: Team-Stack, bekannte Abhängigkeiten
  },

  // Team-Einschätzung VOR der KI-Frage (Pflichtfeld)
  teamHypothesis: {
    weakestPoint: "...",                    // Was glaubt das Team ist unklar?
    estimatable: true | false | "unsure"
  },

  // KI-Output: genau eine Frage + Begründung warum diese Frage
  kiQuestion: {
    question: "...",
    focusArea: "testability" | "estimability" | "scope" | "dependency",
    reasoning: "...",                       // Warum diese Frage? (kurz, transparent)
    cargoCultWarning: "..." | null          // Falls AC-Formulierung Cargo-Cult-Muster zeigt
  },

  // Team-Antwort
  teamAnswer: {
    canAnswer: true | false,
    answerText: "...",
    blockers: ["..."]                       // Was fehlt noch?
  },

  // Ergebnis
  verdict: {
    readiness: "planning-ready" | "needs-work",
    decidedBy: "team",                      // Immer das Team, nie die KI
    exportedTo: "jira" | "confluence" | "clipboard" | null
  }
}
```

---

## 6. Interaktionsfluss

### Phase 0: Zeitpunkt-Kontext (30 Sekunden)

Das Tool fragt zuerst:

> „Ist diese Story in der Discovery-Phase (wir verstehen noch nicht genau was gebaut wird) oder soll sie ins nächste Planning (wir committen uns, sie in diesem Sprint zu bauen)?"

**Warum das wichtig ist:**  
Eine Discovery-Story braucht andere Fragen als eine Planning-ready Story.  
Discovery → Fragen zur Problemschärfe und Nutzervalidierung.  
Planning-ready → Fragen zur Testbarkeit und technischen Estimierbarkeit.

Ein Tool ohne diesen Kontext produziert kontextfreie Urteile — zu streng für Discovery, zu nachsichtig für Planning.

---

### Phase 1: Story-Eingabe

- Freitextfeld für Story
- Freitextfeld für Akzeptanzkriterien (eine pro Zeile)
- Optionales Kontextfeld: „Was weiß die KI nicht, das relevant ist?" (Team-Stack, bekannte Abhängigkeiten, Entscheidungen die noch ausstehen)

**UX-Prinzip:** Kein Pflichtformat. Story muss nicht im „Als X möchte ich Y"-Format sein. Das Tool bewertet keine Syntax — es analysiert Inhalt.

---

### Phase 2: Team-Hypothese (vor der KI-Frage, Pflicht)

Das Team beantwortet zwei kurze Fragen selbst, bevor die KI-Frage erscheint:

1. „Was ist eurer Meinung nach die unklarste Stelle dieser Story?"
2. „Könntet ihr diese Story jetzt schätzen — ja, nein, unsicher?"

**Der KI-Frage-Button ist gesperrt bis diese zwei Felder ausgefüllt sind.**

Begründung: Ohne diese Pflichtphase dominiert die KI-Frage das Gespräch. Mit ihr hat das Team eine eigene Position, gegen die es die KI-Frage abwägen kann. Das ist der Anchoring-Schutz.

---

### Phase 3: Die eine KI-Frage (Kern des Tools)

Das Tool analysiert Story, ACs, Zeitpunkt-Kontext und Team-Hypothese.  
Es gibt genau **eine** Frage aus — die Frage mit dem höchsten Klärungswert.

**Struktur des Outputs:**

```
FRAGE:
[Die Frage. Konkret. Auf diese Story zugeschnitten. Nicht generisch.]

WARUM DIESE FRAGE:
[Ein Satz: welches Muster in der Story hat diese Frage ausgelöst]

⚠ ACHTUNG [nur wenn relevant]:
[Cargo-Cult-Warnung: Falls ein AC gut aussieht aber nichts testet]
```

**Was die Frage nicht ist:**
- Kein Vorwurf
- Kein impliziter Score
- Kein Hinweis, wie die Antwort aussehen soll

**Beispiele für gute Fragen (diese Qualität muss der Prompt erzeugen):**

Schlecht: *„Sind die Akzeptanzkriterien testbar?"* — zu generisch, beantwortet sich mit Ja/Nein.

Gut: *„AC 2 sagt 'die Seite lädt schnell' — was ist die Grenze in Millisekunden, ab der ihr diesen Test als bestanden wertet, und wer definiert diese Grenze?"*

Gut: *„Die Story setzt voraus, dass der Authentifizierungs-Service der anderen Abteilung bis Sprint-Start fertig ist — habt ihr dieses Commitment schriftlich?"*

Gut: *„Diese Story enthält zwei unabhängige Nutzeraktionen (hochladen und freigeben) — welche davon bringt zuerst Wert, wenn ihr nur eine bauen könnt?"*

---

### Phase 4: Team-Antwort

Das Team diskutiert die Frage. Zwei mögliche Ausgänge:

**Kann beantwortet werden:** Team schreibt die Antwort ins Freitextfeld. Story ist planning-ready — das Team entscheidet das, nicht das Tool.

**Kann nicht beantwortet werden:** Team identifiziert konkret, was fehlt (Entscheidung, Information, Klärung mit wem). Diese Blocker werden als Maßnahmen-Karte exportiert.

---

### Phase 5: Export

Nicht das Retro-Protokoll — nur das, was weitergeht:

- **Planning-ready:** Story + Antwort auf die Frage als Kommentar-Text für Jira (Copy-Button)
- **Needs work:** Liste der offenen Blocker als Ticket-Beschreibung für Jira/Confluence

**Kein Vollexport der KI-Analyse.** Das ist eine Designentscheidung: Die KI-Frage ist ein Werkzeug des Refinement-Gesprächs, kein Dokument das archiviert wird.

---

## 7. System-Prompts

### question-generator.js

```javascript
export const QUESTION_GENERATOR_PROMPT = `
Du bist ein Refinement-Assistent. Deine einzige Aufgabe: eine einzige Frage stellen.

KONTEXT:
- Phase: {phase} (discovery | planning-ready)
- Story: {storyText}
- Akzeptanzkriterien: {acceptanceCriteria}
- Team-Kontext: {teamContext}
- Team-Hypothese zur schwächsten Stelle: {teamWeakestPoint}
- Team-Schätzbarkeits-Einschätzung: {teamEstimatable}

DEINE AUFGABE:
Analysiere die Story und identifiziere die EINE Stelle mit dem höchsten Klärungswert.
Stelle dazu eine einzige, konkrete, offene Frage.

PRIORISIERUNG nach Phase:
- discovery: Fragen zur Problemschärfe, Nutzervalidierung, Scope-Abgrenzung
- planning-ready: Fragen zur Testbarkeit (beobachtbare Systemänderung), 
  technischen Estimierbarkeit, offenen Abhängigkeiten

QUALITÄTSKRITERIEN für die Frage:
✓ Konkret: bezieht sich auf spezifischen Text in der Story oder den ACs
✓ Offen: nicht mit Ja/Nein beantwortbar
✓ Konsequent: wenn das Team die Frage nicht beantworten kann, ist die Story nicht fertig
✗ Nicht generisch ("Sind die ACs testbar?")
✗ Nicht wertend ("Warum habt ihr das nicht spezifiziert?")
✗ Nicht mehrere Fragen versteckt in einer

CARGO-CULT-ERKENNUNG:
Prüfe ob Akzeptanzkriterien Wörter enthalten wie: schnell, einfach, intuitiv, benutzerfreundlich,
korrekt, gut, angemessen, zuverlässig — ohne messbare Definition.
Falls ja: markiere das spezifische AC und erkläre warum es nicht testbar ist.

FORMAT (exakt einhalten):
FRAGE:
[Die eine Frage]

WARUM DIESE FRAGE:
[Ein Satz]

[Optional, nur wenn Cargo-Cult erkannt:]
⚠ ACHTUNG AC {nummer}: "{zitat}" — [konkrete Erklärung warum nicht testbar]

VERBOTEN:
- Kein Score, kein Rating, keine Bewertung
- Keine Liste von Problemen
- Kein Vorschlag wie die Story verbessert werden soll
- Keine zweite Frage
`;
```

### cargo-cult-detector.js

```javascript
export const CARGO_CULT_PATTERNS = [
  // Vage Qualitätsattribute ohne Messung
  /\b(schnell|fast|quick)\b(?! als \d)/gi,
  /\beinfach\b(?! zu \w+ ist)/gi,
  /\bintuitiv\b/gi,
  /\bbenutzerfreundlich\b/gi,
  /\bangemessen\b/gi,
  /\bzuverlässig\b(?! zu \d{1,3}%)/gi,
  /\bkorrekt\b(?! gemäß)/gi,
  /\bgut\b/gi,
  // GWT ohne beobachtbare Systemänderung in Then-Klausel
  /then (?:the )?(?:form|page|request) is (?:submitted|processed|sent)\.?$/gi,
];
// Diese Patterns werden client-seitig vorgeprüft und als Kontext an den Prompt übergeben
// um API-Calls zu reduzieren und Transparenz zu erhöhen
```

### phase-adapter.js

```javascript
export const PHASE_INSTRUCTIONS = {
  discovery: `
    Dies ist eine Discovery-Story. Das Team versteht noch nicht vollständig,
    was gebaut werden soll. Fokussiere die Frage auf:
    - Problemklarheit: Welches Nutzerproblem wird gelöst?
    - Scope: Was ist explizit NICHT Teil dieser Story?
    - Validierung: Welche Annahme muss zuerst validiert werden?
    Keine Fragen zur technischen Umsetzbarkeit — zu früh.
  `,
  'planning-ready': `
    Diese Story soll ins nächste Planning. Das Team committet sich zur Umsetzung.
    Fokussiere die Frage auf:
    - Testbarkeit: Kann jedes AC als Pass/Fail bewertet werden?
    - Estimierbarkeit: Gibt es offene technische oder fachliche Fragen?
    - Abhängigkeiten: Gibt es externe Commitments, die noch nicht bestätigt sind?
    Keine abstrakten Problemfragen — die Story muss jetzt umsetzbar sein.
  `
};
```

---

## 8. Anti-Pattern-Schutzmaßnahmen

| Anti-Pattern | Schutzmechanismus |
|---|---|
| Goodhart's Law (Optimieren für den Checker) | Kein Score — offene Frage ist nicht vorhersehbar optimierbar |
| Cargo-Cult-GWT (Syntax ohne Semantik) | Explizite Then-Klausel-Analyse: beobachtbare Systemänderung erforderlich |
| Solo-Nutzung unter Zeitdruck | UI-Framing: Tool startet mit „Öffne das für dein Refinement-Meeting" |
| KI als Autorität | Team entscheidet planning-ready — keine KI-Freigabe |
| Kontextfreie Urteile | Zeitpunkt-Kontext (Phase) ist Pflichtfeld vor jeder Analyse |
| Reflexions-Kurzschluss | Team-Hypothese Pflichtphase vor KI-Frage |
| Vollprotokoll-Export | Nur Maßnahmen-Karte exportierbar, kein KI-Analyse-Export |

---

## 9. UI/UX-Direktiven

**Ästhetik:** Werkzeug, kein Dashboard. Reduziert, fokussiert.  
Vorbild: ein gut gestaltetes Formular, nicht ein Analytics-Tool.

**Das wichtigste UI-Prinzip:**  
Die KI-Frage muss visuell dominant sein — groß, ruhig, viel Whitespace drumherum.  
Sie ist nicht eine von vielen Informationen. Sie ist die einzige Information dieser Phase.

**Farbschema:**
- Hintergrund: `#F7F5F2` (warmes Off-White)
- Text: `#1A1A1A`
- KI-Frage-Block: `#1C3A2E` (dunkles Grün) mit weißem Text — visuell klar als KI markiert
- Cargo-Cult-Warnung: `#92400E` (warmes Amber-Dunkel) — auffällig aber nicht alarmistisch
- Team-Elemente: `#E8E4DF` — heller als KI-Elemente, klar unterscheidbar

**Typografie:**
- Interface-Text: Inter (jsDelivr CDN)
- KI-Frage selbst: leicht größer, mehr Zeilenabstand — sie verdient Raum

**Sprache im Interface:**
- Phasen-Selector: „Discovery (wir klären noch)" / „Planning-ready (wir committen uns)"
- KI-Frage-Button: „Frage generieren" — nicht „Analysieren", nicht „Bewerten"
- Readiness-Button: „Wir können die Frage beantworten — Story ist planning-ready" — das Team spricht, nicht die KI
- Team-Hypothese-Feld Placeholder: „Was glaubt ihr ist die schwächste Stelle?"

---

## 10. Was bewusst weggelassen wurde (und warum)

| Feature | Warum weggelassen |
|---|---|
| INVEST-Vollbewertung | Valuable und Independent nicht kontextfrei beurteilbar; führt zu False Confidence |
| Story-Score / Ampel | Goodhart-Falle; lädt zu Checkbox-Verhalten ein |
| Akzeptanzkriterien-Vorschläge | Nimmt dem Team die inhaltliche Arbeit ab; erzeugt Abhängigkeit |
| Mehrere Fragen | Eine gute Frage > drei mittelmäßige; Team übersieht Fragen in einer Liste |
| Velocity-basierte Story-Points | Teamspezifisch, nicht generalisierbar; wäre kontextfreies Urteil |
| Management-Export / Dashboard | Kein Reporting-Tool; Refinement-Daten gehören dem Team |

---

## 11. Implementierungsreihenfolge für Claude Code

1. Projekt-Setup: `npm create vite@latest story-question-engine -- --template react`
2. Tailwind + Fonts (Inter via CDN) einrichten
3. Datenmodell + localStorage-Hook
4. Phasen-Navigation (Phase 0–5) ohne KI als Grundgerüst
5. Phase-Lock-Logik (KI-Button erst nach Team-Hypothese aktiv)
6. Cargo-Cult-Pattern-Erkennung client-seitig (kein API-Call)
7. Anthropic API-Integration mit Streaming
8. System-Prompts + Phase-Adapter einbinden
9. Export-Mechanismus (Clipboard + JSON)
10. UI-Polish: KI-Frage-Block visuell dominant setzen

---

## 12. Verhältnis zum Retro-Assistent (RetroMirror)

Beide Tools teilen dasselbe Grundprinzip: Team-Einschätzung vor KI-Output, KI als Gesprächsstarter nicht als Autorität, Entscheidung beim Team.

Sie sind komplementär, nicht konkurrierend:
- SQE wirkt **vor** dem Sprint (Refinement, Planning)
- RetroMirror wirkt **nach** dem Sprint (Retrospektive)

Ein Team, das beide nutzt, schließt den Lernzyklus: bessere Stories rein, strukturierte Reflexion raus.

---

*Bauplan erstellt: 01. Mai 2026*  
*Version 2.0 nach Practitioner-Review — erste Version (INVEST-Checker) verworfen*  
*Designprinzipien basieren auf: Goodhart's Law (Goodhart 1975/Strathern 1997), Cognitive Load Theory (Sweller), Bill Wake INVEST (XP Magazine 2003), Cargo-Cult-Kritik an GWT (Liz Keogh, Dan North — BDD-Community), Self-Determination Theory (Deci/Ryan)*
