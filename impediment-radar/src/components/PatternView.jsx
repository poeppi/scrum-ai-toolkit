import { useState } from 'react';
import { IMPEDIMENT_TYPES, STATUS_LABELS } from '../data/impedimentTypes.js';
import { useAnthropicStream } from '../hooks/useAnthropicStream.js';
import { buildPatternPrompt } from '../prompts/type-classifier.js';

function TypeBar({ type, count, max }) {
  const info = IMPEDIMENT_TYPES[type];
  if (!info) return null;
  const pct = max > 0 ? Math.round((count / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3 mb-3">
      <span className="text-xs w-28 shrink-0" style={{ color: 'var(--ink-soft)' }}>{info.label}</span>
      <div className="flex-1 rounded-full h-3" style={{ background: 'var(--rule)' }}>
        <div className="h-3 rounded-full" style={{ width: `${pct}%`, background: info.color, transition: 'width 0.4s' }} />
      </div>
      <span className="text-xs w-6 text-right shrink-0" style={{ color: 'var(--ink-faint)' }}>{count}</span>
    </div>
  );
}

export function PatternView({ impediments, allSprints }) {
  const { output, loading, error, stream } = useAnthropicStream();
  const [patternAnalysed, setPatternAnalysed] = useState(false);

  // Aggregation by type
  const typeCounts = Object.keys(IMPEDIMENT_TYPES).reduce((acc, t) => ({ ...acc, [t]: 0 }), {});
  impediments.forEach(i => { if (i.type && typeCounts[i.type] !== undefined) typeCounts[i.type]++; });
  const maxCount = Math.max(...Object.values(typeCounts), 1);

  // Resolved vs open
  const total = impediments.length;
  const resolved = impediments.filter(i => i.status === 'gelöst' || i.status === 'akzeptiert').length;

  async function analysePatterns() {
    setPatternAnalysed(true);
    const { systemPrompt, userContent } = buildPatternPrompt(impediments);
    await stream(systemPrompt, userContent);
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-1" style={{ color: 'var(--ink)' }}>Muster-Ansicht</h2>
      <p className="text-sm mb-6" style={{ color: 'var(--ink-soft)' }}>
        Nur erfasste Impediments sind sichtbar — strukturell unvollständig, weil viele mündlich benannt werden.
      </p>

      {impediments.length === 0 ? (
        <p className="text-sm" style={{ color: 'var(--ink-soft)' }}>Noch keine Impediments erfasst.</p>
      ) : (
        <>
          <div className="mb-6 p-4 rounded-lg" style={{ background: '#fff', border: '1px solid var(--rule)' }}>
            <div className="flex gap-6 mb-4">
              <div>
                <p className="text-2xl font-bold" style={{ color: 'var(--ink)' }}>{total}</p>
                <p className="text-xs" style={{ color: 'var(--ink-faint)' }}>gesamt</p>
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: 'var(--green-dark)' }}>{resolved}</p>
                <p className="text-xs" style={{ color: 'var(--ink-faint)' }}>gelöst/akzeptiert</p>
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: 'var(--amber)' }}>{total - resolved}</p>
                <p className="text-xs" style={{ color: 'var(--ink-faint)' }}>offen</p>
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: 'var(--ink-soft)' }}>{allSprints.length}</p>
                <p className="text-xs" style={{ color: 'var(--ink-faint)' }}>Sprints</p>
              </div>
            </div>

            <p className="text-xs font-medium mb-3" style={{ color: 'var(--ink-faint)' }}>Impediment-Typen</p>
            {Object.entries(typeCounts).map(([type, count]) => (
              <TypeBar key={type} type={type} count={count} max={maxCount} />
            ))}
          </div>

          {allSprints.length >= 3 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>
                  Wiederkehrende Muster (KI-Analyse)
                </h3>
                {!patternAnalysed && (
                  <button onClick={analysePatterns}
                          className="text-xs py-1 px-3 rounded"
                          style={{ background: 'var(--green-light)', color: 'var(--green-dark)', border: '1px solid var(--green-mid)' }}>
                    Analysieren
                  </button>
                )}
              </div>
              {loading && <p className="text-sm" style={{ color: 'var(--ink-soft)' }}>Analysiere…</p>}
              {error && <p className="text-sm p-3 rounded" style={{ background: 'var(--red-light)', color: 'var(--red-dark)' }}>{error}</p>}
              {output && !loading && (
                <div className="p-4 rounded-lg" style={{ background: 'var(--green-light)', borderLeft: '3px solid var(--green-mid)' }}>
                  <p className="text-xs font-medium mb-1" style={{ color: 'var(--ink-faint)' }}>
                    KI-Muster — Vorschlag, kein Urteil
                  </p>
                  <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--ink)' }}>{output}</p>
                </div>
              )}
              {!patternAnalysed && (
                <p className="text-xs" style={{ color: 'var(--ink-faint)' }}>
                  Verfügbar ab 3 Sprints Datenbasis.
                </p>
              )}
            </div>
          )}

          {allSprints.length < 3 && (
            <div className="p-3 rounded" style={{ background: 'var(--amber-light)', border: '1px solid var(--amber)' }}>
              <p className="text-sm" style={{ color: 'var(--amber)' }}>
                Muster-Analyse ab Sprint 3 verfügbar — noch {3 - allSprints.length} Sprint{3 - allSprints.length !== 1 ? 's' : ''} bis dahin.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
