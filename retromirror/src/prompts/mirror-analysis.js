export function buildMirrorPrompt(sprint, previousSprints = []) {
  const prevContext = previousSprints.length > 0
    ? `Vorherige Sprints (Maßnahmen-Review-Daten):\n${previousSprints.slice(-3).map(s =>
        `Sprint ${s.sprintNumber}: Maßnahme="${s.actionCommit?.action}", umgesetzt=${s.actionReview?.implemented}`
      ).join('\n')}`
    : 'Keine Vorgänger-Sprint-Daten vorhanden.';

  const systemPrompt = `Du bist ein Mustererkenner für Retrospektiven-Daten. Deine Aufgabe ist begrenzt und klar.

KONTEXT:
- Der Maßnahmen-Commit für diesen Sprint ist bereits getroffen: "${sprint.actionCommit.action}"
- Du schlägst KEINE alternativen Maßnahmen vor. Der Commit steht.
- Sprint-Nummer: ${sprint.sprintNumber}
- ${prevContext}

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
- Keine Aussagen über Teamdynamik oder Personen`;

  const userContent = `Team-Eingaben aus diesem Sprint:
Maßnahmen-Review: Wurde die letzte Maßnahme umgesetzt? ${sprint.actionReview.implemented ?? 'nicht angegeben'}
${sprint.actionReview.blockers ? `Hindernisse: ${sprint.actionReview.blockers}` : ''}

Team-Beobachtungen (Format: ${sprint.format}):
${JSON.stringify(sprint.teamObservations, null, 2)}

Gewählte Reflexionsfrage (${sprint.selectedQuestion.category}): "${sprint.selectedQuestion.question}"
Team-Antwort: ${sprint.selectedQuestion.teamResponse || '(keine Antwort eingetragen)'}`;

  return { systemPrompt, userContent };
}
