const SYSTEM = `Du generierst Hypothesen zu Velocity-Schwankungen. Keine Kausalitätsbehauptungen.

WICHTIGE EINSCHRÄNKUNG:
Du siehst nur die Daten, die das Team eingetragen hat. Diese sind unvollständig.
Formuliere keine Erklärungen — formuliere Hypothesen mit explizitem Konfidenz-Level.

AUFGABE:
Generiere 2-3 Hypothesen. Für jede:
1. Hypothese: [Was könnte die Schwankung erklären?]
2. Datenbasis: [Welche eingetragenen Ereignisse stützen das?]
3. Limitation: [Was erklärt diese Hypothese NICHT?]
4. Konfidenz: hoch | mittel | niedrig
   - hoch: Ereignis-Daten stützen direkt
   - mittel: plausibel aber nicht direkt gestützt
   - niedrig: spekulativ, Daten fehlen

GOODHART-CHECK:
Prüfe: Steigt Velocity während Impediments/Ereignisse stagnieren oder sinken?
Falls ja, füge am Ende hinzu:
GOODHART-HINWEIS: [ruhig formuliert, kein Vorwurf]

FORMAT (exakt einhalten):
HYPOTHESE 1:
Hypothese: [Text]
Datenbasis: [Text]
Limitation: [Text]
Konfidenz: hoch | mittel | niedrig

HYPOTHESE 2:
[...]

[Optional: GOODHART-HINWEIS: [Text]]

VERBOTEN:
- Keine Kausalitätsbehauptungen ("X hat Y verursacht")
- Kein Velocity-Zielwert
- Kein Team-Vergleich
- Keine Prognose für nächsten Sprint
- Keine Kritik an Team-Entscheidungen`;

export function buildHypothesisPrompt(sprint, previousSprints) {
  const prevContext = previousSprints.length > 0
    ? previousSprints.slice(-3).map(s =>
        `Sprint ${s.sprintNumber}: committed=${s.velocity.committed} SP, delivered=${s.velocity.delivered} SP, Ereignisse=${s.events.length}`
      ).join('\n')
    : 'Keine Vorgänger-Sprints.';

  const eventList = sprint.events.map((e, i) =>
    `${i + 1}. [${e.type}/${e.plannedOrUnplanned}/${e.estimatedImpact}] ${e.description}`
  ).join('\n') || '(keine Ereignisse dokumentiert)';

  const userContent = `Sprint ${sprint.sprintNumber}:
Committed: ${sprint.velocity.committed} SP
Delivered: ${sprint.velocity.delivered} SP
Differenz: ${Number(sprint.velocity.committed) - Number(sprint.velocity.delivered)} SP

Ereignisse:
${eventList}

Team-Assessment:
Hauptursache: ${sprint.teamAssessment.primaryCause}
Beeinflussbar: ${sprint.teamAssessment.controllable === true ? 'Ja' : sprint.teamAssessment.controllable === false ? 'Nein' : 'unklar'}
${sprint.teamAssessment.learningNote ? `Lernnotiz: ${sprint.teamAssessment.learningNote}` : ''}

Vorherige Sprints:
${prevContext}`;

  return { systemPrompt: SYSTEM, userContent };
}

export function parseHypotheses(raw) {
  const blocks = raw.split(/HYPOTHESE \d+:/i).filter(b => b.trim());
  const hypotheses = blocks.map(block => {
    const hMatch = block.match(/Hypothese:\s*(.+?)(?=\nDateibasis|\nDatenbasis|\n|$)/is);
    const dMatch = block.match(/Datenbasis:\s*(.+?)(?=\nLimitation|\n|$)/is);
    const lMatch = block.match(/Limitation:\s*(.+?)(?=\nKonfidenz|\n|$)/is);
    const cMatch = block.match(/Konfidenz:\s*(hoch|mittel|niedrig)/i);
    return {
      hypothesis: hMatch?.[1]?.trim() ?? '',
      basis: dMatch?.[1]?.trim() ?? '',
      limitation: lMatch?.[1]?.trim() ?? '',
      confidence: cMatch?.[1]?.toLowerCase() ?? 'niedrig',
      teamVerdict: null
    };
  }).filter(h => h.hypothesis);

  const goodhartMatch = raw.match(/GOODHART-HINWEIS:\s*(.+?)(?=$)/is);
  return {
    hypotheses,
    goodhartWarning: !!goodhartMatch,
    goodhartNote: goodhartMatch?.[1]?.trim() ?? ''
  };
}
