export function ReadinessVerdict({ story, onExport, onNew, copied }) {
  const isReady = story.teamAnswer.canAnswer === true;

  function buildExportText() {
    if (isReady) {
      return `Story Question Engine — Refinement-Notiz
Datum: ${story.date}
Phase: ${story.phase}

Story: ${story.story.text}

Klärungsfrage im Refinement:
${story.kiQuestion.question}

Team-Antwort:
${story.teamAnswer.answerText}

→ Story ist planning-ready (Team-Entscheidung)`;
    } else {
      return `Story Question Engine — Offene Punkte
Datum: ${story.date}

Story: ${story.story.text}

Klärungsfrage:
${story.kiQuestion.question}

Was noch fehlt:
${story.teamAnswer.blockers}

→ Story braucht weitere Klärung (Team-Entscheidung)`;
    }
  }

  function handleExport() {
    navigator.clipboard.writeText(buildExportText()).catch(() => {});
    onExport();
  }

  return (
    <div className="text-center py-8">
      <div className="inline-block px-6 py-4 rounded-xl mb-6"
           style={{
             background: isReady ? 'var(--green-dark)' : 'var(--red-light)',
             color: isReady ? '#fff' : 'var(--red-dark)'
           }}>
        <p className="text-lg font-semibold">
          {isReady ? 'Planning-ready' : 'Braucht weitere Klärung'}
        </p>
        <p className="text-sm mt-1" style={{ opacity: 0.8 }}>
          Entschieden vom Team — nicht von der KI
        </p>
      </div>

      <div className="text-left max-w-md mx-auto mb-8 p-4 rounded-lg"
           style={{ background: '#fff', border: '1px solid var(--rule)' }}>
        <p className="text-xs font-medium mb-2" style={{ color: 'var(--ink-faint)' }}>
          {isReady ? 'Antwort des Teams' : 'Noch zu klären'}
        </p>
        <p className="text-sm" style={{ color: 'var(--ink)' }}>
          {isReady ? story.teamAnswer.answerText : story.teamAnswer.blockers}
        </p>
      </div>

      <div className="flex flex-col gap-3 items-center">
        <button
          onClick={handleExport}
          className="py-2 px-6 rounded text-sm font-medium"
          style={{ background: '#fff', color: 'var(--green-dark)', border: '1.5px solid var(--green-mid)' }}
        >
          {copied ? 'Kopiert ✓' : isReady ? 'Als Jira-Kommentar kopieren' : 'Offene Punkte als Ticket-Text kopieren'}
        </button>
        <button
          onClick={onNew}
          className="py-2 px-6 rounded text-sm font-medium text-white"
          style={{ background: 'var(--green-dark)' }}
        >
          Neue Story analysieren
        </button>
      </div>
    </div>
  );
}
