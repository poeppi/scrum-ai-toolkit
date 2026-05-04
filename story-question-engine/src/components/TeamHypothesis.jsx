import { ESTIMATABLE_LABELS } from '../data/storySchema.js';

export function TeamHypothesis({ data, onChange, onGenerate, loading, error }) {
  function set(field, value) {
    onChange({ ...data, [field]: value });
  }

  const canGenerate = data.weakestPoint.trim().length > 0 && data.estimatable !== null;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-1" style={{ color: 'var(--ink)' }}>
        Team-Einschätzung
      </h2>
      <p className="text-sm mb-6" style={{ color: 'var(--ink-soft)' }}>
        Bevor die KI fragt: Was denkt ihr selbst? Der Frage-Button bleibt gesperrt bis hier etwas steht.
      </p>

      <div className="space-y-5 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--ink)' }}>
            Was ist eurer Meinung nach die unklarste Stelle dieser Story?
          </label>
          <textarea
            value={data.weakestPoint}
            onChange={e => set('weakestPoint', e.target.value)}
            rows={3}
            placeholder="Was glaubt ihr ist die schwächste Stelle?"
            className="w-full rounded p-3 text-sm resize-none"
            style={{ border: '1px solid var(--rule)', background: 'var(--team-bg)', color: 'var(--ink)', outline: 'none' }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-3" style={{ color: 'var(--ink)' }}>
            Könntet ihr diese Story jetzt schätzen?
          </label>
          <div className="flex gap-3">
            {Object.entries(ESTIMATABLE_LABELS).map(([key, label]) => (
              <button
                key={key}
                onClick={() => set('estimatable', key === 'true' ? true : key === 'false' ? false : 'unsure')}
                className="flex-1 py-2 rounded text-sm"
                style={{
                  background: String(data.estimatable) === key ? 'var(--green-dark)' : 'var(--team-bg)',
                  color: String(data.estimatable) === key ? '#fff' : 'var(--ink)',
                  border: `1px solid ${String(data.estimatable) === key ? 'var(--green-dark)' : 'var(--rule)'}`
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <p className="text-sm mb-4 p-3 rounded" style={{ background: 'var(--red-light)', color: 'var(--red-dark)' }}>
          {error}
        </p>
      )}

      <div className="flex justify-end">
        <button
          onClick={onGenerate}
          disabled={!canGenerate || loading}
          className="py-2 px-6 rounded text-sm font-medium text-white disabled:opacity-40"
          style={{ background: 'var(--green-dark)' }}
        >
          {loading ? 'Analysiere…' : 'Frage generieren →'}
        </button>
      </div>
    </div>
  );
}
