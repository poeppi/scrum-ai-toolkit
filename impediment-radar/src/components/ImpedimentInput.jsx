import { useState } from 'react';
import { IMPEDIMENT_TYPES, OWNER_OPTIONS } from '../data/impedimentTypes.js';
import { createImpediment } from '../data/impedimentSchema.js';
import { buildClassifierPrompt, parseClassifierOutput } from '../prompts/type-classifier.js';
import { useAnthropicStream } from '../hooks/useAnthropicStream.js';

export function ImpedimentInput({ sprintNumber, onSave }) {
  const [imp, setImp] = useState(() => createImpediment(sprintNumber));
  const [kiSuggestion, setKiSuggestion] = useState(null);
  const [saved, setSaved] = useState(false);
  const { output, loading, error, stream, reset } = useAnthropicStream();

  function set(field, value) {
    setImp(prev => ({ ...prev, [field]: value }));
  }

  async function handleClassify() {
    reset();
    setKiSuggestion(null);
    const { systemPrompt, userContent } = buildClassifierPrompt(imp.description);
    await stream(systemPrompt, userContent);
  }

  // parse when output is ready
  function applyKiSuggestion() {
    const parsed = parseClassifierOutput(output);
    setKiSuggestion(parsed);
    if (parsed.type) {
      setImp(prev => ({ ...prev, type: parsed.type, typeConfidence: 'ki-vorschlag' }));
    }
  }

  function handleSave() {
    if (!imp.description.trim() || !imp.type) return;
    onSave(imp);
    setImp(createImpediment(sprintNumber));
    setKiSuggestion(null);
    reset();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const canSave = imp.description.trim().length > 0 && imp.type !== null;
  const canClassify = imp.description.trim().length > 10 && !loading;

  return (
    <div className="p-5 rounded-lg" style={{ background: '#fff', border: '1px solid var(--rule)' }}>
      <h3 className="text-base font-semibold mb-4" style={{ color: 'var(--ink)' }}>
        Neues Impediment erfassen
      </h3>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--ink)' }}>
          Beschreibung <span style={{ color: 'var(--red-dark)' }}>*</span>
        </label>
        <p className="text-xs mb-2" style={{ color: 'var(--ink-faint)' }}>
          Was passiert? Kein Verursacher-Feld — nur das Impediment.
        </p>
        <textarea
          value={imp.description}
          onChange={e => set('description', e.target.value)}
          rows={3}
          placeholder="z.B. CI-Pipeline schlägt seit 3 Tagen fehl, Build-Zeiten 4× länger als normal."
          className="w-full rounded p-3 text-sm resize-none"
          style={{ border: '1px solid var(--rule)', background: 'var(--bg)', color: 'var(--ink)', outline: 'none' }}
        />
      </div>

      {/* Typ-Auswahl */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium" style={{ color: 'var(--ink)' }}>
            Typ <span style={{ color: 'var(--red-dark)' }}>*</span>
          </label>
          <button
            onClick={handleClassify}
            disabled={!canClassify}
            className="text-xs py-1 px-3 rounded disabled:opacity-40"
            style={{ border: '1px solid var(--green-mid)', color: 'var(--green-dark)', background: 'var(--green-light)' }}
          >
            {loading ? 'Klassifiziere…' : 'KI-Vorschlag'}
          </button>
        </div>

        {!loading && output && !kiSuggestion && (
          <div className="mb-2 p-3 rounded text-sm" style={{ background: 'var(--green-light)', borderLeft: '3px solid var(--green-mid)' }}>
            <p className="text-xs font-medium mb-1" style={{ color: 'var(--ink-faint)' }}>KI-Vorschlag</p>
            <p className="text-sm mb-2" style={{ color: 'var(--ink)', whiteSpace: 'pre-wrap' }}>{output}</p>
            <button onClick={applyKiSuggestion}
                    className="text-xs py-1 px-3 rounded"
                    style={{ background: 'var(--green-dark)', color: '#fff' }}>
              Vorschlag übernehmen
            </button>
          </div>
        )}

        {error && (
          <p className="text-xs mb-2 p-2 rounded" style={{ background: 'var(--red-light)', color: 'var(--red-dark)' }}>{error}</p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {Object.entries(IMPEDIMENT_TYPES).map(([key, t]) => (
            <button key={key}
              onClick={() => { setImp(prev => ({ ...prev, type: key, typeConfidence: 'team' })); setKiSuggestion(null); }}
              className="p-2 rounded text-left text-xs"
              style={{
                background: imp.type === key ? t.bg : '#fff',
                border: `1.5px solid ${imp.type === key ? t.color : 'var(--rule)'}`,
                color: imp.type === key ? t.color : 'var(--ink-soft)'
              }}>
              <span className="font-medium block">{t.label}</span>
              <span style={{ opacity: 0.7 }}>{t.description}</span>
            </button>
          ))}
        </div>
        {imp.typeConfidence === 'ki-vorschlag' && (
          <p className="text-xs mt-1" style={{ color: 'var(--ink-faint)' }}>
            KI-Vorschlag — Team kann jederzeit ändern
          </p>
        )}
      </div>

      {/* Owner + Eskalation */}
      <div className="flex gap-4 mb-4 flex-wrap">
        <div className="flex-1 min-w-32">
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--ink)' }}>Verantwortung</label>
          <div className="flex gap-1 flex-wrap">
            {OWNER_OPTIONS.map(o => (
              <button key={o} onClick={() => set('owner', o)}
                      className="text-xs py-1 px-2 rounded"
                      style={{
                        background: imp.owner === o ? 'var(--green-dark)' : '#fff',
                        color: imp.owner === o ? '#fff' : 'var(--ink-soft)',
                        border: `1px solid ${imp.owner === o ? 'var(--green-dark)' : 'var(--rule)'}`
                      }}>
                {o}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: 'var(--ink-soft)' }}>
            <input type="checkbox" checked={imp.escalationNeeded}
                   onChange={e => set('escalationNeeded', e.target.checked)} />
            SM-Eskalation nötig
          </label>
        </div>
      </div>

      <button onClick={handleSave} disabled={!canSave}
              className="w-full py-2 rounded text-sm font-medium text-white disabled:opacity-40"
              style={{ background: 'var(--green-dark)' }}>
        {saved ? 'Gespeichert ✓' : 'Impediment erfassen'}
      </button>
    </div>
  );
}
