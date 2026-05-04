# BAUPLAN: VelocityLens
## Für Claude Code – vollständige Implementierungsspezifikation
## Direkt nach Practitioner-Review konzipiert

---

## 1. Zweck & Design-Philosophie

**Name:** VelocityLens

**Kernidee:** Velocity ist ein Signal, kein Ziel. Dieses Tool hilft Teams, Velocity-Schwankungen zu verstehen — durch strukturierte Ereignis-Dokumentation pro Sprint und vorsichtige, konfidenzmarkierte KI-Hypothesen. Die Dokumentation ist der Kern. Die KI-Analyse ist eine Lesehilfe, keine Wahrheit.

**Das dringlichste Problem, das dieses Tool löst:**  
Teams und Management haben kein Gedächtnis für die Ereignisse, die Velocity beeinflussen. Schwankungen wirken zufällig, weil der Kontext fehlt. Dieses Tool baut dieses Gedächtnis auf — sprint-übergreifend, team-spezifisch, ohne Management-Reporting.

**Die zentrale Design-Entscheidung:**  
Velocity wird nie als Ziel dargestellt. Nie. Kein Zielwert, kein „ihr habt X% eurer Velocity erreicht", kein Vergleich mit anderen Teams. Wenn das Tool Anzeichen für Goodhart-Optimierung erkennt (Velocity steigt, aber Impediments steigen auch), zeigt es einen Hinweis.

**Was dieses Tool ausdrücklich NICHT ist:**
- Kein Management-Reporting-Tool
- Kein Team-Vergleichs-Tool
- Kein Velocity-Forecast-Tool (Story Points sind keine absoluten Einheiten)
- Kein Tool, das Kausalität behauptet wo nur Korrelation vorliegt

---

## 2. Tech-Stack-Empfehlung

```
Framework:     React 18 + Vite
Styling:       Tailwind CSS + custom CSS variables
KI:            Anthropic Claude API — für Hypothesen-Generierung mit Konfidenz-Level
Visualisierung: Recharts (bereits in React-Ökosystem, leichtgewichtig)
Persistenz:    localStorage + JSON-Export (nur team-interner Export)
Fonts:         Inter via jsDelivr CDN
```

---

## 3. Architektur-Überblick

```
velocity-lens/
├── src/
│   ├── App.jsx
│   ├── components/
│   │   ├── SprintLog.jsx             # KERN: Ereignis-Dokumentation pro Sprint
│   │   ├── VelocityChart.jsx         # Visualisierung mit Ereignis-Overlay
│   │   ├── HypothesisPanel.jsx       # KI-Hypothesen mit Konfidenz-Level
│   │   ├── GoodhartWarning.jsx       # Warnung bei Optimierungs-Mustern
│   │   ├── TeamBoundary.jsx          # Technische Sperre gegen Team-Vergleiche
│   │   └── ExportView.jsx            # Nur team-interner Export
│   ├── hooks/
│   │   ├── useAnthropicStream.js
│   │   └── useSprintStorage.js
│   ├── prompts/
│   │   └── hypothesis-generator.js
│   └── data/
│       ├── sprintSchema.js
│       └── eventTypes.js             # Ereignis-Taxonomie (fix)
```

---

## 4. Ereignis-Taxonomie

```javascript
// eventTypes.js — fix, kuratiert
export const EVENT_TYPES = {
  kapazitaet: {
    label: "Kapazität",
    examples: ["Krankheitsausfälle", "Urlaub", "Onboarding neues Mitglied", "Teilzeit-Sprint"]
  },
  scope: {
    label: "Scope-Änderung",
    examples: ["Nachträgliche Anforderungsänderung", "Emergency-Fix", "Sprint-Ziel geändert"]
  },
  technisch: {
    label: "Technische Störung",
    examples: ["Infrastruktur-Problem", "Dependency-Blocking", "Unerwartete Komplexität"]
  },
  schulden: {
    label: "Technische Schulden",
    examples: ["Refactoring nötig", "Legacy-Code-Problem", "Security-Patch erzwungen"]
  },
  extern: {
    label: "Externe Abhängigkeit",
    examples: ["Anderes Team geliefert / nicht geliefert", "Stakeholder nicht verfügbar"]
  },
  prozess: {
    label: "Prozess-Overhead",
    examples: ["Review-Verzögerung", "Ungeplante Meetings", "Administrations-Last"]
  }
};
```

---

## 5. Datenmodell

```javascript
const SprintRecord = {
  id: "uuid",
  teamId: "uuid",              // Team-spezifisch; kein teamübergreifender Zugriff
  sprintNumber: 42,
  date: "2026-05-01",

  // Velocity-Daten
  velocity: {
    committed: 34,             // Story Points committed
    delivered: 28,             // Story Points delivered
    // Kein "Velocity-Ziel" — nur committed vs. delivered
  },

  // KERN: Ereignis-Dokumentation (Pflichtschritt, nicht optional)
  events: [
    {
      type: "kapazitaet" | "scope" | "technisch" | "schulden" | "extern" | "prozess",
      description: "...",
      estimatedImpact: "hoch" | "mittel" | "niedrig",  // Team-Einschätzung
      plannedOrUnplanned: "geplant" | "ungeplant"
    }
  ],

  // Team-Einschätzung (vor KI-Hypothesen — Pflichtfeld)
  teamAssessment: {
    primaryCause: "...",          // Team benennt selbst die Hauptursache
    controllable: true | false,   // War die Ursache beeinflussbar?
    learningNote: "..."           // Was nehmen wir mit? (optional)
  },

  // KI-Hypothesen (nach Team-Assessment)
  kiHypotheses: {
    generated: true | false,
    hypotheses: [
      {
        hypothesis: "...",
        confidence: "hoch" | "mittel" | "niedrig",
        basis: "...",            // Welche Daten stützen diese Hypothese?
        limitation: "..."        // Was kann diese Hypothese NICHT erklären?
      }
    ],
    goodhartWarning: true | false,
    goodhartNote: "..."
  }
}
```

---

## 6. Interaktionsfluss

**Gesamtdauer Sprint-Logging: 10–15 Minuten. Kein Meeting-Format nötig.**

---

### Phase 0: Sprint-Abschluss-Logging (Pflicht, kein KI-Schritt)

Am Ende jedes Sprints: Committed vs. Delivered eintragen, Ereignisse dokumentieren.

**Ereignisse sind Pflicht, nicht optional.** Das ist die wertvollste Funktion des Tools.  
Ohne Ereignis-Dokumentation erscheint kein KI-Button — nicht weil das Tool paternalistisch ist, sondern weil KI-Hypothesen ohne Ereignis-Kontext methodisch wertlos wären.

Formulierung im UI: „Bevor die KI-Analyse verfügbar ist: Was ist diesen Sprint passiert? Auch wenn es nichts Ungewöhnliches war — das ist für spätere Muster wichtig."

---

### Phase 1: Team-Assessment (Pflicht, vor KI)

Drei kurze Fragen, Freitext:

1. „Was war eurer Einschätzung nach der wichtigste Einflussfaktor auf die Velocity dieses Sprints?"
2. „War dieser Faktor beeinflussbar — oder lag er außerhalb des Team-Einflusses?"
3. „Was nehmt ihr mit für den nächsten Sprint?" (optional)

**KI-Button bleibt gesperrt bis Phase 1 ausgefüllt ist.** Das ist Anchoring-Schutz: das Team hat eine eigene Position, bevor die KI-Hypothesen erscheinen.

---

### Phase 2: Visualisierung

Velocity-Chart über Sprints: Linie committed, Linie delivered — keine Ziellinie.

Ereignis-Overlay: Für jeden Sprint mit dokumentierten Ereignissen erscheint ein Marker. Hover zeigt die Ereignisse dieses Sprints.

**Was bewusst fehlt:**
- Kein Forecast / keine Velocity-Projektion
- Kein Team-Vergleich (technisch gesperrt — kein API-Endpoint für andere Teams)
- Kein Zielwert-Feld
- Keine „Trend"-Wertung (steigende Velocity ist nicht automatisch gut)

---

### Phase 3: KI-Hypothesen (optional, nach Phase 0 und 1)

KI analysiert Velocity-Daten + Ereignisse + Team-Assessment und generiert Hypothesen — mit explizitem Konfidenz-Level für jede.

**Wichtig: Das Tool nennt es „Hypothesen", nicht „Erklärungen" oder „Ursachen".**  
Kausalität kann aus Korrelation nicht abgeleitet werden. Das Interface macht das sichtbar.

Jede Hypothese hat drei Pflichtfelder:
1. Die Hypothese selbst
2. Datenbasis: Welche Ereignisse stützen sie?
3. Limitation: Was kann diese Hypothese nicht erklären?

Team kann jede Hypothese bewerten: passt / passt nicht / unklar.  
Team-Bewertungen werden gespeichert — als Kalibrierungsdaten für die eigene KI-Einschätzung, nicht als Feedback ans Modell.

---

### Goodhart-Warnung (automatisch, wenn Muster erkannt)

Das Tool erkennt zwei Muster, die auf Goodhart-Optimierung hindeuten:

1. Velocity steigt über mehrere Sprints, während gleichzeitig Impediments zunehmen oder unverändert bleiben
2. Committed = Delivered für mehr als 4 Sprints in Folge bei sinkender Impediment-Dokumentation

Wenn eines dieser Muster vorliegt, erscheint ein ruhiger, nicht alarmistischer Hinweis:

> „Muster-Hinweis: Eure Velocity steigt, aber die dokumentierten Impediments nehmen nicht ab. Das kann viele Ursachen haben — manchmal deutet es darauf hin, dass Story Points angepasst werden, um die Velocity stabil zu halten. Das wäre kein Fehler, aber es lohnt sich, es explizit zu besprechen."

Kein Alarm. Kein Vorwurf. Eine Frage, die das Team stellen kann.

---

### SM-Ansicht

Scrum Master sieht zusätzlich:
- Verhältnis geplanter zu ungeplanten Ereignissen über Sprints
- Häufigste Ereignis-Typen (als einfaches Ranking)
- Sprints mit höchster Abweichung committed vs. delivered + zugehörige Ereignisse
- Moderationshinweis: „Diese Ereignis-Kombination ist in den letzten 3 Sprints aufgetreten — könnte es ein strukturelles Problem sein?"

Kein Management-Export aus dieser Ansicht.

---

## 7. System-Prompt

```javascript
export const HYPOTHESIS_GENERATOR_PROMPT = `
Du generierst Hypothesen zu Velocity-Schwankungen. Keine Kausalitätsbehauptungen.

WICHTIGE EINSCHRÄNKUNG:
Du siehst nur die Daten, die das Team eingetragen hat. Diese sind unvollständig.
Formuliere keine Erklärungen — formuliere Hypothesen mit explizitem Konfidenz-Level.

KONTEXT:
Sprint {sprintNumber}:
- Committed: {committed} SP, Delivered: {delivered} SP
- Ereignisse: {events}
- Team-Assessment: {teamAssessment}
- Vorherige Sprints (falls vorhanden): {previousSprints}

AUFGABE:
Generiere 2-3 Hypothesen, die die Velocity-Abweichung erklären könnten.

FÜR JEDE HYPOTHESE:
1. Hypothese: [Was könnte die Schwankung erklären?]
2. Datenbasis: [Welche eingetragenen Ereignisse stützen das?]
3. Limitation: [Was erklärt diese Hypothese NICHT?]
4. Konfidenz: hoch | mittel | niedrig
   - hoch: Ereignis-Daten stützen direkt
   - mittel: plausibel aber nicht direkt gestützt
   - niedrig: spekulativ, Daten fehlen

GOODHART-CHECK:
Prüfe: Steigt Velocity während Impediments stagnieren oder steigen?
Falls ja, füge hinzu:
GOODHART-HINWEIS: [ruhig formuliert, kein Vorwurf]

VERBOTEN:
- Keine Kausalitätsbehauptungen ("X hat Y verursacht")
- Kein Velocity-Zielwert
- Kein Team-Vergleich
- Keine Prognose für nächsten Sprint
- Keine Kritik an Team-Entscheidungen
`;
```

---

## 8. Anti-Pattern-Schutzmaßnahmen

| Anti-Pattern | Schutzmechanismus |
|---|---|
| Velocity als Ziel | Kein Zielwert-Feld; Linie committed vs. delivered, keine Ziellinie |
| Goodhart's Law | Automatische Muster-Erkennung mit ruhigem Hinweis |
| Kausalität aus Korrelation | Interface nennt es "Hypothesen", nie "Erklärungen"; Limitation-Pflichtfeld |
| Team-Vergleiche | Technische Sperre: kein teamübergreifender API-Endpoint |
| Management-Misuse | Kein Management-Export; nur team-interner JSON-Export |
| KI-Analyse ohne Datenbasis | KI-Button gesperrt bis Ereignisse + Team-Assessment eingetragen |
| Anchoring durch KI | Team-Assessment Pflichtphase vor KI-Hypothesen |
| Selbstbewusste Fehler | Konfidenz-Level + Limitation für jede Hypothese |
| Velocity-Prognose | Kein Forecast-Feature — methodisch unzulässig ohne konstante Randbedingungen |

---

## 9. Was bewusst weggelassen wurde

| Feature | Warum weggelassen |
|---|---|
| Velocity-Forecast | Story Points sind relative Einheiten; Prognosen suggerieren Präzision die nicht existiert |
| Team-Vergleich | Methodisch unzulässig; teamspezifische Relativmaße |
| Velocity-Ziel | Goodhart-Falle; das Tool setzt keinen Zielwert |
| Automatische Ursachen-Benennung | Kausalität aus Korrelation nicht ableitbar; nur Hypothesen |
| Management-Dashboard | Velocity-Daten gehören dem Team; kein Reporting-Export |
| Trend-Wertung (steigend = gut) | Steigende Velocity kann Goodhart-Optimierung sein |

---

## 10. Implementierungsreihenfolge für Claude Code

1. Projekt-Setup + Tailwind + Inter
2. Datenmodell + localStorage-Hook
3. Ereignis-Taxonomie (statische Datei)
4. Sprint-Logging: Committed/Delivered + Ereignis-Dokumentation
5. Velocity-Chart mit Ereignis-Overlay (Recharts)
6. Team-Assessment-Komponente (Phase-Lock)
7. Anthropic API: Hypothesen-Generierung mit Konfidenz
8. Goodhart-Muster-Erkennung (client-seitig, kein API-Call)
9. SM-Ansicht
10. Export-Mechanismus (team-interner JSON)

---

## 11. Verhältnis zu den anderen Tools

| Tool | Zeitpunkt | Kernfunktion |
|---|---|---|
| Story Question Engine | Vor Sprint | Refinement-Qualität |
| RetroMirror | Nach Sprint | Maßnahmen-Commit |
| ImpedimentRadar | Laufend | Blocker-Muster |
| VelocityLens | Nach Sprint | Kontext für Schwankungen |

ImpedimentRadar und VelocityLens sind komplementär: Impediments erklären oft Velocity-Schwankungen. Ein Team, das beide nutzt, kann Korrelationen selbst herstellen — ohne dass das Tool sie behauptet.

---

*Bauplan erstellt: 01. Mai 2026*  
*Methodische Grundlagen: Goodhart's Law (Goodhart 1975/Strathern 1997), Story Points als Relativmaße (Mike Cohn, Mountain Goat Software), Kausalitäts-Korrelations-Unterscheidung (wissenschaftlicher Standard), Bainbridge Ironies of Automation (1983)*
