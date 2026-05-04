export function TeamAssessment({ data, onChange, onGenerate, loading, error }) {
  function set(field, val) { onChange({ ...data, [field]: val }); }

  const canGenerate = data.primaryCause.trim().length > 0 && data.controllable !== null;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-1" style={{ color: 'var(--ink)' }}>
        Team-Einschätzung
      </h2>
      <p className="text-sm mb-6" style={{ color: 'var(--ink-soft)' }}>
        Eure Position, bevor die KI-Hypothesen erscheinen. Der Analyse-Button bleibt gesperrt bis hier etwas steht.
      </p>

      <div className="space-y-5 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--ink)' }}>
            Was war eurer Einschätzung nach der wichtigste Einflussfaktor? <span style={{ color: 'var(--red-dark)' }}>*</span>
          </label>
          <textarea
            value={data.primaryCause}
            onChange={e => set('primaryCause', e.target.value)}
            rows={3}
            placeholder="Was hat die Velocity diesen Sprint am stärksten beeinflusst?"
            className="w-full rounded p-3 text-sm resize-none"
            style={{ border: '1px solid var(--rule)', background: '#f0ece8', color: 'var(--ink)', outline: 'none' }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--ink)' }}>
            War dieser Faktor beeinflussbar? <span style={{ color: 'var(--red-dark)' }}>*</span>
          </label>
          <div className="flex gap-3">
            {[
              { val: true, label: 'Ja — lag im Team-Einfluss' },
              { val: false, label: 'Nein — außerhalb des Teams' }
            ].map(({ val, label }) => (
              <button key={String(val)}
                onClick={() => set('controllable', val)}
                className="flex-1 py-2 rounded text-sm"
                style={{
                  background: data.controllable === val ? 'var(--green-dark)' : '#f0ece8',
                  color: data.controllable === val ? '#fff' : 'var(--ink)',
                  border: `1px solid ${data.controllable === val ? 'var(--green-dark)' : 'var(--rule)'}`
                }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--ink)' }}>
            Was nehmt ihr mit für den nächsten Sprint? (optional)
          </label>
          <textarea
            value={data.learningNote}
            onChange={e => set('learningNote', e.target.value)}
            rows={2}
            placeholder="Lernnotiz — bleibt beim Team"
            className="w-full rounded p-3 text-sm resize-none"
            style={{ border: '1px solid var(--rule)', background: '#f0ece8', color: 'var(--ink)', outline: 'none' }}
          />
        </div>
      </div>

      {error && (
        <p className="text-sm mb-4 p-3 rounded" style={{ background: 'var(--red-light)', color: 'var(--red-dark)' }}>{error}</p>
      )}

      <div className="flex justify-end">
        <button onClick={onGenerate} disabled={!canGenerate || loading}
                className="py-2 px-6 rounded text-sm font-medium text-white disabled:opacity-40"
                style={{ background: 'var(--green-dark)' }}>
          {loading ? 'Analysiere…' : 'Hypothesen generieren →'}
        </button>
      </div>
    </div>
  );
}
