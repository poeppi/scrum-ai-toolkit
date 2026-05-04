import { CONFIDENCE_LABELS } from '../data/eventTypes.js';

const CONFIDENCE_STYLE = {
  hoch:    { bg: 'var(--green-light)', color: 'var(--green-dark)', border: 'var(--green-mid)' },
  mittel:  { bg: 'var(--amber-light)', color: 'var(--amber)',      border: 'var(--amber)'     },
  niedrig: { bg: '#f0ece8',            color: 'var(--ink-faint)',   border: 'var(--rule)'      }
};

export function HypothesisPanel({ output, loading, hypotheses, goodhartNote, onVerdictChange }) {
  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="inline-block w-8 h-8 rounded-full mb-3"
             style={{ border: '3px solid var(--green-light)', borderTopColor: 'var(--green-dark)', animation: 'spin 1s linear infinite' }} />
        <p className="text-sm" style={{ color: 'var(--ink-soft)' }}>Analysiere Velocity-Daten…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (output && hypotheses.length === 0) {
    return (
      <div className="p-4 rounded-lg" style={{ background: 'var(--green-light)', borderLeft: '3px solid var(--green-mid)' }}>
        <p className="text-xs font-medium mb-2" style={{ color: 'var(--ink-faint)' }}>KI-Hypothesen (werden geparst…)</p>
        <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--ink)' }}>{output}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-base font-semibold" style={{ color: 'var(--ink)' }}>KI-Hypothesen</h3>
        <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'var(--green-light)', color: 'var(--green-dark)' }}>
          Korrelationen, keine Ursachen
        </span>
      </div>

      {goodhartNote && (
        <div className="mb-4 p-4 rounded-lg" style={{ background: 'var(--amber-light)', border: '1px solid var(--amber)' }}>
          <p className="text-xs font-medium mb-1" style={{ color: 'var(--amber)' }}>Muster-Hinweis</p>
          <p className="text-sm" style={{ color: 'var(--ink)' }}>{goodhartNote}</p>
        </div>
      )}

      <div className="space-y-4">
        {hypotheses.map((h, idx) => {
          const style = CONFIDENCE_STYLE[h.confidence] ?? CONFIDENCE_STYLE.niedrig;
          return (
            <div key={idx} className="p-4 rounded-lg" style={{ background: '#fff', border: '1px solid var(--rule)' }}>
              <div className="flex items-start gap-3 mb-3">
                <span className="text-xs px-2 py-0.5 rounded shrink-0"
                      style={{ background: style.bg, color: style.color, border: `1px solid ${style.border}` }}>
                  Konfidenz: {CONFIDENCE_LABELS[h.confidence] ?? h.confidence}
                </span>
              </div>
              <p className="text-sm font-medium mb-2" style={{ color: 'var(--ink)' }}>{h.hypothesis}</p>
              <div className="space-y-1 mb-3">
                <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>
                  <span className="font-medium">Datenbasis:</span> {h.basis}
                </p>
                <p className="text-xs" style={{ color: 'var(--ink-faint)' }}>
                  <span className="font-medium">Limitation:</span> {h.limitation}
                </p>
              </div>
              <div className="flex gap-2">
                {['passt', 'passt nicht', 'unklar'].map(verdict => (
                  <button key={verdict}
                    onClick={() => onVerdictChange(idx, verdict)}
                    className="text-xs py-1 px-3 rounded"
                    style={{
                      background: h.teamVerdict === verdict ? 'var(--green-dark)' : '#fff',
                      color: h.teamVerdict === verdict ? '#fff' : 'var(--ink-soft)',
                      border: `1px solid ${h.teamVerdict === verdict ? 'var(--green-dark)' : 'var(--rule)'}`
                    }}>
                    {verdict}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
