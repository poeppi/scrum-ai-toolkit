const ITEMS = [
  { text: "Wenn ich in diesem Team einen Fehler mache, wird mir das oft vorgehalten.", reversed: true },
  { text: "In diesem Team kann ich Probleme und schwierige Themen ansprechen.", reversed: false },
  { text: "In diesem Team fühle ich mich sicher, Risiken einzugehen.", reversed: false }
];

function computeScore(scores) {
  const adjusted = scores.map((v, i) => {
    if (v === null) return null;
    return ITEMS[i].reversed ? 6 - v : v;
  });
  const valid = adjusted.filter(v => v !== null);
  if (valid.length === 0) return null;
  return valid.reduce((a, b) => a + b, 0) / valid.length;
}

export function SafetyCheck({ data, onChange, onSkip, onNext }) {
  const scores = data.scores ?? [null, null, null];
  const score = computeScore(scores);
  const allAnswered = scores.every(v => v !== null);
  const belowThreshold = score !== null && score < 3.0;

  function setScore(idx, val) {
    const updated = [...scores];
    updated[idx] = val;
    const newScore = computeScore(updated);
    onChange({
      scores: updated,
      score: newScore,
      belowThreshold: newScore !== null && newScore < 3.0,
      skipped: false
    });
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-1" style={{ color: 'var(--ink)' }}>
        Psychologische Sicherheit
      </h2>
      <p className="text-sm mb-2" style={{ color: 'var(--ink-soft)' }}>
        Drei kurze Fragen, Durchschnitt wird angezeigt. Dauer: ~2 Minuten.
      </p>
      <p className="text-xs mb-6 px-3 py-2 rounded" style={{ background: 'var(--green-light)', color: 'var(--ink-soft)' }}>
        Gerät reihum weitergeben: Jede Person tippt selbst, Screen zum Raum abwenden. Erst danach gemeinsam anschauen.
      </p>

      <div className="space-y-6 mb-8">
        {ITEMS.map((item, idx) => (
          <div key={idx} className="p-4 rounded-lg" style={{ background: '#fff', border: '1px solid var(--rule)' }}>
            <p className="text-sm mb-3" style={{ color: 'var(--ink)' }}>{item.text}</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(val => (
                <button
                  key={val}
                  onClick={() => setScore(idx, val)}
                  className="flex-1 py-2 rounded text-sm font-medium transition-colors"
                  style={{
                    background: scores[idx] === val ? 'var(--green-dark)' : 'var(--bg)',
                    color: scores[idx] === val ? '#fff' : 'var(--ink-soft)',
                    border: `1px solid ${scores[idx] === val ? 'var(--green-dark)' : 'var(--rule)'}`
                  }}
                >
                  {val}
                </button>
              ))}
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-xs" style={{ color: 'var(--ink-faint)' }}>stimme nicht zu</span>
              <span className="text-xs" style={{ color: 'var(--ink-faint)' }}>stimme voll zu</span>
            </div>
          </div>
        ))}
      </div>

      {allAnswered && score !== null && (
        <div className="mb-6 p-4 rounded-lg" style={{
          background: belowThreshold ? 'var(--amber-light)' : 'var(--green-light)',
          border: `1px solid ${belowThreshold ? 'var(--amber)' : 'var(--green-mid)'}`
        }}>
          <p className="text-sm font-medium mb-1" style={{ color: belowThreshold ? 'var(--amber)' : 'var(--green-dark)' }}>
            Team-Score: {score.toFixed(1)} / 5.0
          </p>
          {belowThreshold ? (
            <p className="text-sm" style={{ color: 'var(--amber)' }}>
              Euer Team-Score deutet darauf hin, dass offene Diskussion gerade schwierig sein könnte. Das ist häufig und kein Versagen. Ein erfahrener Facilitator wäre jetzt hilfreicher als ein KI-Tool. Ihr könnt trotzdem weitermachen — aber der KI-Spiegel wird für diese Retro deaktiviert.
            </p>
          ) : (
            <p className="text-sm" style={{ color: 'var(--green-dark)' }}>
              Gute Ausgangslage. Der optionale KI-Spiegel ist verfügbar.
            </p>
          )}
        </div>
      )}

      <div className="flex gap-3 justify-between">
        <button
          onClick={() => {
            onSkip();
          }}
          className="text-sm py-2 px-4 rounded"
          style={{ color: 'var(--ink-faint)', background: 'transparent', border: '1px solid var(--rule)' }}
        >
          Überspringen
        </button>
        <button
          onClick={onNext}
          disabled={!allAnswered}
          className="py-2 px-6 rounded text-sm font-medium text-white disabled:opacity-40"
          style={{ background: 'var(--green-dark)' }}
        >
          Weiter →
        </button>
      </div>
    </div>
  );
}
