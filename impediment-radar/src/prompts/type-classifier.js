const SYSTEM = `Du klassifizierst ein Impediment in eine von fünf Kategorien.

KATEGORIEN:
- technisch: Infrastruktur, Tools, Code, Abhängigkeiten
- prozessual: Arbeitsabläufe, Genehmigungen, Entscheidungswege
- informational: Fehlende oder widersprüchliche Information
- extern: Außerhalb des Einflusses des Teams
- ressource: Kapazität, Skills, Budget

REGELN:
1. Nenne genau eine Kategorie.
2. Begründe in einem Satz warum.
3. Nenne den Konfidenz-Level: sicher / unsicher.
4. Falls unsicher: welche zweite Kategorie wäre möglich?

FORMAT (exakt einhalten):
Kategorie: [eine der fünf]
Begründung: [ein Satz]
Konfidenz: sicher | unsicher
Alternative (falls unsicher): [Kategorie oder —]

VERBOTEN:
- Keine Personenzuweisungen
- Keine Wertung ob das Impediment wichtig ist
- Keine Lösung vorschlagen`;

export function buildClassifierPrompt(description) {
  return {
    systemPrompt: SYSTEM,
    userContent: `IMPEDIMENT: "${description}"`
  };
}

export function parseClassifierOutput(raw) {
  const catMatch = raw.match(/Kategorie:\s*(\w+)/i);
  const begMatch = raw.match(/Begründung:\s*(.+)/i);
  const konfMatch = raw.match(/Konfidenz:\s*(sicher|unsicher)/i);
  const altMatch = raw.match(/Alternative[^:]*:\s*(.+)/i);

  const validTypes = ['technisch', 'prozessual', 'informational', 'extern', 'ressource'];
  const cat = catMatch?.[1]?.toLowerCase();

  return {
    type: validTypes.includes(cat) ? cat : null,
    reasoning: begMatch?.[1]?.trim() ?? '',
    confident: konfMatch?.[1]?.toLowerCase() === 'sicher',
    alternative: altMatch?.[1]?.trim() ?? null
  };
}

export const PATTERN_SYSTEM = `Du analysierst Impediment-Beschreibungen aus mehreren Sprints auf Wiederholungsmuster.

AUFGABE: Erkenne Impediments, die trotz "gelöst"-Status im Wortlaut ähnlich wiederkehren.

REGELN:
- Benenne konkret, welche Impediments sich ähneln (mit Wortlaut-Bezug)
- Das ist ein Vorschlag, kein Urteil — schreibe im Konjunktiv
- Maximal 150 Wörter
- Keine Personenzuweisungen
- Keine Lösungsvorschläge

FORMAT:
Mögliche Wiederkehr:
[Beobachtung]

Was ich nicht beurteilen kann:
[Mindestens ein Punkt]`;

export function buildPatternPrompt(impediments) {
  const lines = impediments.map(i =>
    `Sprint ${i.sprintNumber} | ${i.type ?? '?'} | ${i.status} | "${i.description}"`
  ).join('\n');
  return {
    systemPrompt: PATTERN_SYSTEM,
    userContent: `Impediment-Liste:\n${lines}`
  };
}
