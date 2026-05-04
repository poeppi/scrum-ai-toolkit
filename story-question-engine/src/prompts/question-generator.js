import { formatCargoCultContext } from './cargo-cult-detector.js';

const PHASE_INSTRUCTIONS = {
  discovery: `Dies ist eine Discovery-Story. Das Team versteht noch nicht vollständig, was gebaut werden soll.
Fokussiere die Frage auf:
- Problemklarheit: Welches Nutzerproblem wird gelöst?
- Scope: Was ist explizit NICHT Teil dieser Story?
- Validierung: Welche Annahme muss zuerst validiert werden?
Keine Fragen zur technischen Umsetzbarkeit — zu früh.`,

  'planning-ready': `Diese Story soll ins nächste Planning. Das Team committet sich zur Umsetzung.
Fokussiere die Frage auf:
- Testbarkeit: Kann jedes AC als Pass/Fail bewertet werden?
- Estimierbarkeit: Gibt es offene technische oder fachliche Fragen?
- Abhängigkeiten: Gibt es externe Commitments, die noch nicht bestätigt sind?
Keine abstrakten Problemfragen — die Story muss jetzt umsetzbar sein.`
};

export function buildQuestionPrompt(story, cargoCultWarnings) {
  const systemPrompt = `Du bist ein Refinement-Assistent. Deine einzige Aufgabe: eine einzige Frage stellen.

PHASEN-KONTEXT:
${PHASE_INSTRUCTIONS[story.phase]}

QUALITÄTSKRITERIEN für die Frage:
✓ Konkret: bezieht sich auf spezifischen Text in der Story oder den ACs
✓ Offen: nicht mit Ja/Nein beantwortbar
✓ Konsequent: wenn das Team die Frage nicht beantworten kann, ist die Story nicht fertig
✗ Nicht generisch ("Sind die ACs testbar?")
✗ Nicht wertend
✗ Nicht mehrere Fragen versteckt in einer

CARGO-CULT-KONTEXT (bereits client-seitig erkannt):
${formatCargoCultContext(cargoCultWarnings)}

FORMAT (exakt einhalten — kein Text davor oder danach):
FRAGE:
[Die eine Frage]

WARUM DIESE FRAGE:
[Ein Satz]${cargoCultWarnings.length > 0 ? `

⚠ ACHTUNG AC [nummer]: "[zitat]" — [konkrete Erklärung warum nicht testbar]` : ''}

VERBOTEN:
- Kein Score, kein Rating, keine Bewertung
- Keine Liste von Problemen
- Kein Vorschlag wie die Story verbessert werden soll
- Keine zweite Frage`;

  const userContent = `Story:
${story.story.text}

Akzeptanzkriterien:
${story.story.acceptanceCriteria || '(keine angegeben)'}

${story.story.context ? `Team-Kontext: ${story.story.context}` : ''}

Team-Hypothese zur schwächsten Stelle: ${story.teamHypothesis.weakestPoint}
Team-Schätzbarkeits-Einschätzung: ${story.teamHypothesis.estimatable}`;

  return { systemPrompt, userContent };
}

export function parseQuestionOutput(raw) {
  const frageMatch = raw.match(/FRAGE:\s*\n([\s\S]*?)(?:\n\nWARUM|$)/);
  const warumMatch = raw.match(/WARUM DIESE FRAGE:\s*\n([\s\S]*?)(?:\n\n⚠|$)/);
  const warningMatch = raw.match(/⚠ ACHTUNG([\s\S]*?)$/);

  return {
    question: frageMatch?.[1]?.trim() ?? raw,
    reasoning: warumMatch?.[1]?.trim() ?? '',
    cargoCultWarning: warningMatch?.[1]?.trim() ?? null,
    rawOutput: raw
  };
}
