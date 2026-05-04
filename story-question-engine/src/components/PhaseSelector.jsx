import { PHASE_LABELS } from '../data/storySchema.js';

export function PhaseSelector({ value, onChange, onNext }) {
  return (
    <div className="max-w-lg mx-auto text-center py-12">
      <h1 className="text-2xl font-semibold mb-2" style={{ color: 'var(--ink)' }}>
        Story Question Engine
      </h1>
      <p className="text-sm mb-2" style={{ color: 'var(--ink-soft)' }}>
        Öffne das im Refinement-Meeting — nicht allein unter Zeitdruck.
      </p>
      <p className="text-sm mb-8" style={{ color: 'var(--ink-soft)' }}>
        Das Tool stellt eine einzige Frage. Diese Frage ist der Output.
      </p>

      <p className="text-sm font-medium mb-4" style={{ color: 'var(--ink)' }}>
        Wo steht diese Story gerade?
      </p>

      <div className="flex flex-col gap-3 mb-8">
        {Object.entries(PHASE_LABELS).map(([key, label]) => (
          <button
            key={key}
            onClick={() => onChange(key)}
            className="w-full p-4 rounded-lg text-left text-sm"
            style={{
              background: value === key ? 'var(--green-dark)' : '#fff',
              color: value === key ? '#fff' : 'var(--ink)',
              border: `1.5px solid ${value === key ? 'var(--green-dark)' : 'var(--rule)'}`,
            }}
          >
            <span className="font-medium">{label}</span>
            <span className="block text-xs mt-0.5" style={{ opacity: 0.7 }}>
              {key === 'discovery'
                ? 'Wir verstehen noch nicht genau, was gebaut werden soll'
                : 'Wir committen uns, diese Story in diesem Sprint zu bauen'}
            </span>
          </button>
        ))}
      </div>

      <button
        onClick={onNext}
        disabled={!value}
        className="py-2 px-8 rounded text-sm font-medium text-white disabled:opacity-40"
        style={{ background: 'var(--green-dark)' }}
      >
        Weiter →
      </button>
    </div>
  );
}
