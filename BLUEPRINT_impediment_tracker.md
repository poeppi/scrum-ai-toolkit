# BAUPLAN: ImpedimentRadar
## Für Claude Code – vollständige Implementierungsspezifikation
## Direkt nach Practitioner-Review konzipiert — keine verworfene V1

---

## 1. Zweck & Design-Philosophie

**Name:** ImpedimentRadar

**Kernidee:** Impediments systematisch erfassen, über Sprints hinweg sichtbar halten und nach Typ clustern — ohne Personenbezug, ohne automatische Eskalation, mit expliziter SM-Moderationsunterstützung.

**Das dringlichste Problem, das dieses Tool löst:**  
Impediments werden im Daily benannt und vergessen. Niemand überprüft sprint-übergreifend, welche Blocker-Typen strukturell wiederkehren. Das Tool macht Muster sichtbar — die Entscheidung, was damit zu tun ist, bleibt beim Scrum Master und Team.

**Die scharfe Grenze:**  
Impediments haben fast immer menschlichen Kontext. Das Tool clustert ausschließlich nach Impediment-Typ — nie nach Verursacher, Abteilung oder Person. Diese Grenze ist nicht nur eine Design-Entscheidung, sie ist eine rechtliche Pflicht (EU AI Act Anhang III Nr. 4, BetrVG §87 Abs. 1 Nr. 6).

**Was dieses Tool ausdrücklich NICHT ist:**
- Kein automatisches Eskalations-System
- Kein Überwachungstool für Personen oder Abteilungen
- Kein Ersatz für die SM-Rolle bei Impediment-Moderation
- Kein Reporting-Tool für Management

---

## 2. Tech-Stack-Empfehlung

```
Framework:     React 18 + Vite
Styling:       Tailwind CSS (Core-Utilities) + custom CSS variables
KI:            Anthropic Claude API — nur für Typ-Klassifikation neuer Impediments
Persistenz:    localStorage + JSON-Export (nur aggregierte Typ-Statistik)
State:         React useState/useReducer
Fonts:         Inter via jsDelivr CDN
```

---

## 3. Architektur-Überblick

```
impediment-radar/
├── src/
│   ├── App.jsx
│   ├── components/
│   │   ├── SprintReview.jsx          # KERN: Offene Impediments aus letztem Sprint
│   │   ├── ImpedimentInput.jsx       # Neue Impediments erfassen
│   │   ├── TypeClassifier.jsx        # KI-gestützte Typ-Zuordnung (vorschlagend)
│   │   ├── PatternView.jsx           # Muster über Sprints (aggregiert, kein Personenbezug)
│   │   ├── SMView.jsx                # Scrum Master Moderationsansicht
│   │   └── ExportCard.jsx            # Nur aggregierte Typ-Statistik
│   ├── hooks/
│   │   ├── useAnthropicStream.js
│   │   └── useImpedimentStorage.js
│   ├── prompts/
│   │   └── type-classifier.js
│   └── data/
│       ├── impedimentSchema.js
│       └── impedimentTypes.js        # Typ-Taxonomie (fix, nicht KI-generiert)
```

---

## 4. Impediment-Typ-Taxonomie

```javascript
// impedimentTypes.js — fix, kuratiert, nicht KI-generiert
export const IMPEDIMENT_TYPES = {
  technisch: {
    label: "Technisch",
    description: "Infrastruktur, Tools, Code, Abhängigkeiten",
    examples: ["CI-Pipeline down", "API-Dokumentation fehlt", "Lizenzen nicht verfügbar"]
  },
  prozessual: {
    label: "Prozessual",
    description: "Arbeitsabläufe, Genehmigungen, Entscheidungswege",
    examples: ["Review-Prozess zu lang", "Entscheidung hängt seit 2 Sprints", "Kein klarer Owner"]
  },
  informational: {
    label: "Information",
    description: "Fehlende, widersprüchliche oder verspätete Information",
    examples: ["Anforderungen unklar", "Stakeholder nicht erreichbar", "Dokumentation veraltet"]
  },
  extern: {
    label: "Extern",
    description: "Außerhalb des Einflusses des Teams oder der Organisation",
    examples: ["Lieferant liefert nicht", "Regulatorische Unsicherheit", "Abhängigkeit von anderem Team"]
  },
  ressource: {
    label: "Ressource",
    description: "Kapazität, Skills, Budget",
    examples: ["Schlüsselperson ausgefallen", "Fehlende Fachkompetenz", "Budget nicht freigegeben"]
  }
};
```

**Warum eine fixe Taxonomie statt KI-generierter Typen:**  
KI-generierte Cluster sind nicht reproduzierbar und schwer verständlich. Eine fixe Taxonomie ist erklärt, diskutierbar und vom Team anfechtbar — das ist Voraussetzung für Vertrauen.

---

## 5. Datenmodell

```javascript
const ImpedimentRecord = {
  id: "uuid",
  sprintNumber: 42,
  createdDate: "2026-05-01",

  // Impediment-Beschreibung (kein Personenbezug)
  description: "...",
  type: "technisch" | "prozessual" | "informational" | "extern" | "ressource",
  typeConfidence: "team" | "ki-vorschlag",  // Wer hat klassifiziert?

  // Status-Tracking
  status: "offen" | "in-arbeit" | "gelöst" | "akzeptiert",
  // "akzeptiert" = Team hat entschieden, damit zu leben — bewusste Option
  resolvedDate: "..." | null,
  resolution: "...",       // Wie wurde es gelöst? (Freitext)

  // Eskalations-Bedarf (kein Automatismus — SM entscheidet)
  escalationNeeded: true | false,
  escalationNote: "...",   // Nur sichtbar in SM-Ansicht

  // KEIN Personenbezug: kein "reportedBy", kein "blockedBy", kein "owner-name"
  owner: "Team" | "SM" | "PO" | "extern"   // Nur Rolle, nie Person
}
```

---

## 6. Interaktionsfluss

### Phase 0: Sprint-Einstieg — Offene Impediments (5 Min)

Das Tool zeigt beim Start jedes Sprints alle Impediments mit Status "offen" oder "in-arbeit" aus dem letzten Sprint.

Für jedes offene Impediment: Team markiert — gelöst / noch offen / akzeptiert.

**"Akzeptiert" ist eine explizite Option** — nicht versteckt, nicht negativ geframed. Manchmal ist die richtige Entscheidung: wir leben damit, weil der Lösungsaufwand den Wert übersteigt. Das soll das Tool dokumentieren, nicht verhindern.

---

### Phase 1: Impediment erfassen

Freitextfeld: Was ist das Impediment?  
Kein Personenfeld. Kein „Verursacher"-Feld. Kein „Wer ist schuld"-Feld.

KI schlägt einen Typ vor (aus der fixen Taxonomie). Das Team bestätigt oder korrigiert.  
**Die Typ-Zuordnung durch das Team überschreibt immer die KI — ohne Begründungspflicht.**

---

### Phase 2: Muster-Ansicht (nach Sprint 3+)

Aggregierte Anzeige: Welche Typen dominieren? Welche Impediments kehren sprint-übergreifend wieder?

Anzeige als einfaches Balkendiagramm: Typ × Häufigkeit. Kein Scoring, keine Ampeln.

**Was die KI hier tut:**  
Sie benennt, welche Impediments trotz "gelöst"-Markierung im Wortlaut ähnlich wiederkehren — möglicher Hinweis auf Symptom-Behandlung statt Ursachen-Lösung. Das ist ein Vorschlag, kein Urteil. Das Team entscheidet, ob der Hinweis zutrifft.

---

### SM-Ansicht (separater Modus)

Scrum Master sieht zusätzlich:
- Alle Impediments mit Eskalations-Flag (die das Team gesetzt hat — kein Automatismus)
- Lösungs-Texte der letzten Sprints (für Moderationsvorbereitung)
- Typ-Verteilung der letzten 5 Sprints (Trendlinie)
- Moderationshinweise aus kuratierter Bibliothek nach Typ

Kein Management-Export aus dieser Ansicht. Kein Vollprotokoll.

---

## 7. System-Prompt

```javascript
export const TYPE_CLASSIFIER_PROMPT = `
Du klassifizierst ein Impediment in eine von fünf Kategorien.

KATEGORIEN:
- technisch: Infrastruktur, Tools, Code, Abhängigkeiten
- prozessual: Arbeitsabläufe, Genehmigungen, Entscheidungswege
- informational: Fehlende oder widersprüchliche Information
- extern: Außerhalb des Einflusses des Teams
- ressource: Kapazität, Skills, Budget

IMPEDIMENT: "{description}"

REGELN:
1. Nenne genau eine Kategorie.
2. Begründe in einem Satz warum.
3. Nenne den Konfidenz-Level: sicher / unsicher.
4. Falls unsicher: welche zweite Kategorie wäre möglich?

FORMAT:
Kategorie: [eine der fünf]
Begründung: [ein Satz]
Konfidenz: sicher | unsicher
Alternative (falls unsicher): [Kategorie]

VERBOTEN:
- Keine Personenzuweisungen
- Keine Wertung ob das Impediment wichtig ist
- Keine Lösung vorschlagen
`;
```

---

## 8. Anti-Pattern-Schutzmaßnahmen

| Anti-Pattern | Schutzmechanismus |
|---|---|
| Automatische Eskalation | Kein Automatismus — SM setzt Eskalations-Flag manuell |
| Personenbezug / Surveillance | Kein Personenfeld im Datenmodell; nur Rollen |
| Scheinpräzision durch lückenhafte Daten | Expliziter Hinweis: „Nur erfasste Impediments sind sichtbar" |
| „Gelöst"-Inflation | „Akzeptiert"-Option als gleichwertige Alternative |
| KI als Klassifikations-Autorität | Team-Korrektur überschreibt KI ohne Begründungspflicht |
| Management-Reporting | Kein vollständiger Export; nur aggregierte Typ-Statistik |
| Symptom-Behandlung unsichtbar | Wiederkehrende Muster werden benannt — als Vorschlag, nicht Urteil |

---

## 9. Datenschutz (DSGVO / BetrVG)

Systeme zur systematischen Erfassung von Arbeitshindernissen können unter BetrVG §87 Abs. 1 Nr. 6 fallen — insbesondere wenn Eskalations-Logik oder Personenbezug vorhanden ist.

Dieses Tool vermeidet beides durch Design:
- Kein Personenbezug im Datenmodell (technisch erzwungen, nicht nur Policy)
- Kein Automatismus für Eskalation
- Kein Management-Export
- Datenschutz-Hinweis beim ersten Start mit Verweis auf BetrVG §87

Bei Einsatz in einer Organisation: Betriebsrat sollte das Tool-Design vor Einführung prüfen.

---

## 10. Implementierungsreihenfolge für Claude Code

1. Projekt-Setup + Tailwind + Inter
2. Datenmodell + localStorage-Hook
3. Impediment-Typ-Taxonomie (statische Datei)
4. Impediment-Erfassung (Input + manueller Typ)
5. Sprint-Einstieg: Offene Impediments Review
6. Anthropic API: Typ-Klassifikations-Vorschlag
7. Muster-Ansicht (Balkendiagramm, Typ × Sprint)
8. Wiederkehrende-Muster-Erkennung (KI, Sprint 3+)
9. SM-Ansicht (separater Modus)
10. Export aggregierte Typ-Statistik

---

*Bauplan erstellt: 01. Mai 2026*  
*Rechtliche Grundlagen: EU AI Act Anhang III Nr. 4, BetrVG §87 Abs. 1 Nr. 6, DSGVO Art. 5*
