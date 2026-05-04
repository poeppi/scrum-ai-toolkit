import { useState } from 'react';
import { useAnthropicStream } from '../hooks/useAnthropicStream.js';
import { buildMirrorPrompt } from '../prompts/mirror-analysis.js';

export function KIMirror({ sprint, previousSprints, safetyBelowThreshold, onChange }) {
  const { output, loading, error, stream } = useAnthropicStream();
  const [activated, setActivated] = useState(false);
  const [teamResponse, setTeamResponse] = useState(sprint.kiMirror?.teamResponse ?? '');

  if (safetyBelowThreshold) {
    return (
      <div className="p-4 rounded-lg" style={{ background: 'var(--amber-light)', border: '1px solid var(--amber)' }}>
        <p className="text-sm font-medium mb-1" style={{ color: 'var(--amber)' }}>
          KI-Spiegel für diese Retro deaktiviert
        </p>
        <p className="text-sm" style={{ color: 'var(--amber)' }}>
          Der Team-Score in Phase 0 lag unter 3.0. Ein erfahrener Facilitator wäre in dieser Situation hilfreicher.
        </p>
      </div>
    );
  }

  async function activate() {
    setActivated(true);
    onChange({ activated: true, patterns: '', teamResponse: '' });
    const { systemPrompt, userContent } = buildMirrorPrompt(sprint, previousSprints);
    await stream(systemPrompt, userContent);
  }

  function saveResponse(val) {
    setTeamResponse(val);
    onChange({ ...sprint.kiMirror, teamResponse: val, patterns: output });
  }

  return (
    <div>
      {!activated ? (
        <div className="text-center py-8">
          <p className="text-sm mb-2" style={{ color: 'var(--ink)' }}>
            Der Commit steht. Wollt ihr sehen, welche Muster die KI in euren Eingaben erkennt?
          </p>
          <p className="text-xs mb-3" style={{ color: 'var(--ink-faint)' }}>
            Optional · Kein Vorschlag für alternative Maßnahmen · Maximal 200 Wörter
          </p>
          <p className="text-xs mb-6 px-3 py-2 rounded" style={{ background: 'var(--amber-light)', color: 'var(--amber)' }}>
            Das ist kein Decision Support. Das Muster hier ist Lernmaterial für den nächsten Sprint, nicht für diese Maßnahme.
          </p>
          <button
            onClick={activate}
            className="py-2 px-6 rounded text-sm font-medium text-white"
            style={{ background: 'var(--green-dark)' }}
          >
            KI-Spiegel aktivieren
          </button>
        </div>
      ) : (
        <div>
          <div className="p-4 rounded-lg mb-4" style={{
            background: 'var(--green-light)',
            borderLeft: '3px solid var(--green-mid)'
          }}>
            <p className="text-xs font-medium mb-2" style={{ color: 'var(--ink-faint)' }}>
              KI-Muster — kein Teamkonsens, keine Bewertung
            </p>
            {loading ? (
              <p className="text-sm" style={{ color: 'var(--ink-soft)' }}>Analysiere...</p>
            ) : error ? (
              <p className="text-sm" style={{ color: 'var(--red-dark)' }}>{error}</p>
            ) : (
              <div className="text-sm whitespace-pre-wrap" style={{ color: 'var(--ink)' }}>
                {output || '—'}
              </div>
            )}
          </div>

          {!loading && output && (
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--ink)' }}>
                Einschätzung des Teams
              </label>
              <p className="text-xs mb-2" style={{ color: 'var(--ink-faint)' }}>
                Was davon trifft zu? Was nicht? Das Team entscheidet.
              </p>
              <textarea
                value={teamResponse}
                onChange={e => saveResponse(e.target.value)}
                rows={3}
                placeholder="Freitext — bleibt lokal gespeichert"
                className="w-full rounded p-3 text-sm resize-none"
                style={{ border: '1px solid var(--rule)', background: '#fff', color: 'var(--ink)', outline: 'none' }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
