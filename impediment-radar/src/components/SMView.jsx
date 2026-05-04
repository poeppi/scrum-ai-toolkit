import { IMPEDIMENT_TYPES, STATUS_LABELS } from '../data/impedimentTypes.js';

const MODERATION_HINTS = {
  technisch:     'Oft lösbar durch SM-Eskalation an Engineering Lead oder DevOps. Konkret: Was genau blockiert wen seit wann?',
  prozessual:    'Häufig ein Entscheidungs-Problem, kein Prozess-Problem. Frage: Wer kann diese Entscheidung treffen — und warum ist sie noch nicht gefallen?',
  informational: 'Prüfen: Ist die Information nicht vorhanden, oder nicht zugänglich? Unterschied für Lösung erheblich.',
  extern:        'SM kann oft nur eskalieren oder Erwartungen managen. Frage an PO: Was können wir tun, das unabhängig von der externen Abhängigkeit Wert liefert?',
  ressource:     'Kurzfristige Symptom-Behandlung vs. strukturelle Lösung trennen. Wer außerhalb des Teams kann hier entscheiden?'
};

function downloadJSON(impediments) {
  const blob = new Blob([JSON.stringify(impediments, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `impediment-radar-export-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function SMView({ impediments, allSprints, onBack }) {
  const escalated = impediments.filter(i => i.escalationNeeded);
  const openByType = Object.keys(IMPEDIMENT_TYPES).reduce((acc, t) => {
    acc[t] = impediments.filter(i => i.type === t && (i.status === 'offen' || i.status === 'in-arbeit')).length;
    return acc;
  }, {});

  const dominantType = Object.entries(openByType).sort((a, b) => b[1] - a[1]).find(([, c]) => c > 0)?.[0];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold" style={{ color: 'var(--ink)' }}>SM-Ansicht</h2>
        <button onClick={onBack} className="text-sm py-1 px-3 rounded"
                style={{ border: '1px solid var(--rule)', color: 'var(--ink-soft)', background: '#fff' }}>
          ← Zurück
        </button>
      </div>

      {/* Eskalations-Flaggen */}
      <section className="mb-8">
        <h3 className="text-sm font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--ink-faint)' }}>
          Eskalations-Bedarf
        </h3>
        {escalated.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--ink-soft)' }}>Keine Impediments mit Eskalations-Flag.</p>
        ) : (
          <div className="space-y-3">
            {escalated.map(imp => {
              const t = IMPEDIMENT_TYPES[imp.type];
              const s = STATUS_LABELS[imp.status];
              return (
                <div key={imp.id} className="p-4 rounded-lg" style={{ background: '#fff', border: '1px solid var(--rule)' }}>
                  <div className="flex gap-2 mb-1">
                    {t && <span className="text-xs px-2 py-0.5 rounded" style={{ background: t.bg, color: t.color }}>{t.label}</span>}
                    <span className="text-xs px-2 py-0.5 rounded" style={{ background: s.bg, color: s.color }}>{s.label}</span>
                    <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'var(--red-light)', color: 'var(--red-dark)' }}>Eskalation</span>
                  </div>
                  <p className="text-sm" style={{ color: 'var(--ink)' }}>{imp.description}</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--ink-faint)' }}>Sprint {imp.sprintNumber} · {imp.createdDate}</p>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Moderationshinweis */}
      {dominantType && (
        <section className="mb-8">
          <h3 className="text-sm font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--ink-faint)' }}>
            Moderationshinweis
          </h3>
          <div className="p-4 rounded-lg" style={{ background: 'var(--amber-light)', border: '1px solid var(--amber)' }}>
            <p className="text-xs font-medium mb-1" style={{ color: 'var(--amber)' }}>
              Häufigster offener Typ: {IMPEDIMENT_TYPES[dominantType].label}
            </p>
            <p className="text-sm" style={{ color: 'var(--ink)' }}>{MODERATION_HINTS[dominantType]}</p>
          </div>
        </section>
      )}

      {/* Lösungs-Texte */}
      <section className="mb-8">
        <h3 className="text-sm font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--ink-faint)' }}>
          Lösungs-Dokumentation (letzte Sprints)
        </h3>
        {impediments.filter(i => i.resolution).length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--ink-soft)' }}>Noch keine Lösungstexte erfasst.</p>
        ) : (
          <div className="space-y-2">
            {impediments.filter(i => i.resolution).slice(-6).reverse().map(imp => (
              <div key={imp.id} className="p-3 rounded" style={{ background: '#fff', border: '1px solid var(--rule)' }}>
                <p className="text-xs mb-1" style={{ color: 'var(--ink-faint)' }}>
                  Sprint {imp.sprintNumber} · {IMPEDIMENT_TYPES[imp.type]?.label ?? imp.type} · {STATUS_LABELS[imp.status]?.label}
                </p>
                <p className="text-xs mb-1" style={{ color: 'var(--ink-soft)' }}>Impediment: {imp.description}</p>
                <p className="text-sm" style={{ color: 'var(--ink)' }}>→ {imp.resolution}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid var(--rule)' }}>
        <p className="text-xs" style={{ color: 'var(--ink-faint)' }}>
          Kein Management-Export. Impediment-Daten gehören dem Team.
        </p>
        <button
          onClick={() => downloadJSON(impediments)}
          className="text-xs py-1.5 px-3 rounded"
          style={{ border: '1px solid var(--rule)', color: 'var(--ink-soft)', background: '#fff' }}
        >
          Daten exportieren (JSON)
        </button>
      </div>
    </div>
  );
}
