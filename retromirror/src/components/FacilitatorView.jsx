import { CATEGORY_LABELS } from '../data/questionLibrary.js';

function ImplementedBadge({ value }) {
  if (value === true) return <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'var(--green-light)', color: 'var(--green-dark)' }}>Umgesetzt</span>;
  if (value === 'partial') return <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'var(--amber-light)', color: 'var(--amber)' }}>Teilweise</span>;
  if (value === false) return <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'var(--red-light)', color: 'var(--red-dark)' }}>Nicht umgesetzt</span>;
  return <span className="text-xs px-2 py-0.5 rounded" style={{ background: '#eee', color: 'var(--ink-faint)' }}>—</span>;
}

export function FacilitatorView({ sprints, onBack }) {
  const recent = [...sprints].sort((a, b) => b.sprintNumber - a.sprintNumber).slice(0, 5);

  const categoryCounts = sprints.reduce((acc, s) => {
    const cat = s.selectedQuestion?.category;
    if (cat) acc[cat] = (acc[cat] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold" style={{ color: 'var(--ink)' }}>
          Facilitator-Ansicht
        </h2>
        <button
          onClick={onBack}
          className="text-sm py-1 px-3 rounded"
          style={{ border: '1px solid var(--rule)', color: 'var(--ink-soft)', background: '#fff' }}
        >
          ← Zurück
        </button>
      </div>

      {sprints.length === 0 ? (
        <p className="text-sm" style={{ color: 'var(--ink-soft)' }}>Noch keine Retros abgeschlossen.</p>
      ) : (
        <>
          <section className="mb-8">
            <h3 className="text-sm font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--ink-faint)' }}>
              Maßnahmen-Verlauf (letzte {recent.length} Sprints)
            </h3>
            <div className="space-y-3">
              {recent.map(s => (
                <div key={s.id} className="p-4 rounded-lg" style={{ background: '#fff', border: '1px solid var(--rule)' }}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-xs mb-1" style={{ color: 'var(--ink-faint)' }}>Sprint {s.sprintNumber} · {s.date}</p>
                      <p className="text-sm" style={{ color: 'var(--ink)' }}>{s.actionCommit?.action || '—'}</p>
                      {s.actionCommit?.successCriterion && (
                        <p className="text-xs mt-1" style={{ color: 'var(--ink-soft)' }}>
                          Kriterium: {s.actionCommit.successCriterion}
                        </p>
                      )}
                    </div>
                    <ImplementedBadge value={s.actionReview?.implemented} />
                  </div>
                  {s.actionReview?.blockers && (
                    <p className="text-xs mt-2 pt-2" style={{ color: 'var(--amber)', borderTop: '1px solid var(--rule)' }}>
                      Hindernis: {s.actionReview.blockers}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section className="mb-8">
            <h3 className="text-sm font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--ink-faint)' }}>
              Gewählte Fragen-Kategorien
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]).map(([cat, count]) => (
                <div key={cat} className="p-3 rounded-lg" style={{ background: '#fff', border: '1px solid var(--rule)' }}>
                  <p className="text-sm font-medium" style={{ color: 'var(--ink)' }}>{CATEGORY_LABELS[cat]}</p>
                  <p className="text-xs" style={{ color: 'var(--ink-faint)' }}>{count}× gewählt</p>
                </div>
              ))}
            </div>
            {Object.keys(categoryCounts).length > 0 && (
              <p className="text-xs mt-2" style={{ color: 'var(--ink-faint)' }}>
                Häufig gewählte Kategorien zeigen, worüber das Team immer wieder nachdenkt — kein Urteil, ein Muster.
              </p>
            )}
          </section>

          <section>
            <h3 className="text-sm font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--ink-faint)' }}>
              Moderationshinweise
            </h3>
            <div className="space-y-2">
              {recent.filter(s => s.actionReview?.implemented === false).length >= 2 && (
                <div className="p-3 rounded" style={{ background: 'var(--amber-light)', border: '1px solid var(--amber)' }}>
                  <p className="text-sm" style={{ color: 'var(--amber)' }}>
                    Zwei oder mehr Maßnahmen wurden nicht umgesetzt. Thema für Phase 1: Sind die Maßnahmen realistisch formuliert?
                  </p>
                </div>
              )}
              {Object.keys(categoryCounts).length === 1 && sprints.length >= 3 && (
                <div className="p-3 rounded" style={{ background: 'var(--amber-light)', border: '1px solid var(--amber)' }}>
                  <p className="text-sm" style={{ color: 'var(--amber)' }}>
                    Das Team wählt bisher immer dieselbe Kategorie. Bewusste Einladung, eine andere zu erkunden?
                  </p>
                </div>
              )}
              {recent.length > 0 && recent[0].safetyCheck?.belowThreshold && (
                <div className="p-3 rounded" style={{ background: 'var(--red-light)', border: '1px solid var(--red-dark)' }}>
                  <p className="text-sm" style={{ color: 'var(--red-dark)' }}>
                    Letzter Safety-Score unter 3.0. Einstieg mit niedriger Risikobereitschaft empfohlen.
                  </p>
                </div>
              )}
              {recent.filter(s => s.actionReview?.implemented === false).length < 2 &&
               Object.keys(categoryCounts).length !== 1 &&
               !(recent.length > 0 && recent[0].safetyCheck?.belowThreshold) && (
                <p className="text-sm" style={{ color: 'var(--ink-faint)' }}>
                  Keine auffälligen Muster erkennbar.
                </p>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
