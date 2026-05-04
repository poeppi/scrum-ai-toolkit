import { FORMAT_LABELS, FORMAT_FIELDS, FORMAT_KEYS } from '../data/sprintSchema.js';

export function TeamInput({ data, format, onChangeFormat, onChange, onNext }) {
  const fields = FORMAT_FIELDS[format];
  const keys = FORMAT_KEYS[format];

  function setField(key, value) {
    onChange({ ...data, [key]: value });
  }

  const hasAnyInput = keys.some(k => (data[k] ?? '').trim().length > 0);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-1" style={{ color: 'var(--ink)' }}>
        Team-Input
      </h2>
      <p className="text-sm mb-2" style={{ color: 'var(--ink-soft)' }}>
        Wählt ein Format und tragt eure Beobachtungen ein.
      </p>
      <p className="text-xs mb-4" style={{ color: 'var(--ink-faint)' }}>
        Stille Eingabe-Phase empfohlen: 2 Minuten, jede Person notiert selbst, dann gemeinsam eintragen.
      </p>

      <div className="flex flex-wrap gap-2 mb-6">
        {Object.entries(FORMAT_LABELS).map(([key, label]) => (
          <button
            key={key}
            onClick={() => onChangeFormat(key)}
            className="py-1 px-3 rounded text-sm"
            style={{
              background: format === key ? 'var(--green-dark)' : '#fff',
              color: format === key ? '#fff' : 'var(--ink-soft)',
              border: `1px solid ${format === key ? 'var(--green-dark)' : 'var(--rule)'}`
            }}
          >
            {key}
          </button>
        ))}
      </div>

      <div className="space-y-4 mb-8">
        {fields.map((label, idx) => (
          <div key={keys[idx]}>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--ink)' }}>
              {label}
            </label>
            <textarea
              value={data[keys[idx]] ?? ''}
              onChange={e => setField(keys[idx], e.target.value)}
              rows={3}
              placeholder="Stichpunkte oder Freitext..."
              className="w-full rounded p-3 text-sm resize-none"
              style={{ border: '1px solid var(--rule)', background: '#fff', color: 'var(--ink)', outline: 'none' }}
            />
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          onClick={onNext}
          disabled={!hasAnyInput}
          className="py-2 px-6 rounded text-sm font-medium text-white disabled:opacity-40"
          style={{ background: 'var(--green-dark)' }}
        >
          Weiter →
        </button>
      </div>
    </div>
  );
}
