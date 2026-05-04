export function ActionReview({ data, onChange, onNext, lastSprint }) {
  const hasLastAction = lastSprint?.actionCommit?.action;

  function set(field, value) {
    onChange({ ...data, [field]: value });
  }

  const canProceed = !hasLastAction || data.implemented !== null;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-1" style={{ color: 'var(--ink)' }}>
        Maßnahmen-Review
      </h2>
      <p className="text-sm mb-6" style={{ color: 'var(--ink-soft)' }}>
        Was wurde letzten Sprint committed — und ist es umgesetzt worden?
      </p>

      {hasLastAction ? (
        <>
          <div className="mb-6 p-4 rounded-lg" style={{ background: '#fff', border: '1px solid var(--rule)' }}>
            <p className="text-xs font-medium mb-1" style={{ color: 'var(--ink-faint)' }}>
              Sprint {lastSprint.sprintNumber} — Commit
            </p>
            <p className="text-sm mb-2" style={{ color: 'var(--ink)' }}>
              {lastSprint.actionCommit.action}
            </p>
            {lastSprint.actionCommit.successCriterion && (
              <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>
                Erfolgskriterium: {lastSprint.actionCommit.successCriterion}
              </p>
            )}
          </div>

          <p className="text-sm font-medium mb-3" style={{ color: 'var(--ink)' }}>Wurde es umgesetzt?</p>
          <div className="flex gap-3 mb-5">
            {[
              { value: true, label: "Ja" },
              { value: "partial", label: "Teilweise" },
              { value: false, label: "Nein" }
            ].map(opt => (
              <button
                key={String(opt.value)}
                onClick={() => set('implemented', opt.value)}
                className="flex-1 py-2 rounded text-sm font-medium"
                style={{
                  background: data.implemented === opt.value ? 'var(--green-dark)' : '#fff',
                  color: data.implemented === opt.value ? '#fff' : 'var(--ink)',
                  border: `1px solid ${data.implemented === opt.value ? 'var(--green-dark)' : 'var(--rule)'}`
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {(data.implemented === false || data.implemented === 'partial') && (
            <div className="mb-5">
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--ink)' }}>
                Was hat die Umsetzung verhindert?
              </label>
              <textarea
                value={data.blockers}
                onChange={e => set('blockers', e.target.value)}
                rows={3}
                placeholder="War es ein Ressourcenproblem, eine externe Abhängigkeit, eine Priorisierungsentscheidung?"
                className="w-full rounded p-3 text-sm resize-none"
                style={{ border: '1px solid var(--rule)', background: '#fff', color: 'var(--ink)', outline: 'none' }}
              />
            </div>
          )}

          {data.implemented !== null && (
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--ink)' }}>
                Was lernen wir daraus?
              </label>
              <textarea
                value={data.insight}
                onChange={e => set('insight', e.target.value)}
                rows={2}
                placeholder="Optional — aber oft die wichtigste Frage dieser Phase"
                className="w-full rounded p-3 text-sm resize-none"
                style={{ border: '1px solid var(--rule)', background: '#fff', color: 'var(--ink)', outline: 'none' }}
              />
            </div>
          )}
        </>
      ) : (
        <div className="mb-6 p-4 rounded-lg" style={{ background: 'var(--green-light)', border: '1px solid var(--green-mid)' }}>
          <p className="text-sm" style={{ color: 'var(--green-dark)' }}>
            Das ist die erste Retro mit diesem Tool — noch kein Commit zu reviewen. Ab dem nächsten Sprint erscheint hier der Commit aus dem vorherigen Sprint.
          </p>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={onNext}
          disabled={!canProceed}
          className="py-2 px-6 rounded text-sm font-medium text-white disabled:opacity-40"
          style={{ background: 'var(--green-dark)' }}
        >
          Weiter →
        </button>
      </div>
    </div>
  );
}
