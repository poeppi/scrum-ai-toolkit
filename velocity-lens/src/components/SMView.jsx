import { EVENT_TYPES } from '../data/eventTypes.js';

export function SMView({ sprints, onBack }) {
  if (sprints.length === 0) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold" style={{ color: 'var(--ink)' }}>SM-Ansicht</h2>
          <button onClick={onBack} className="text-sm py-1 px-3 rounded"
                  style={{ border: '1px solid var(--rule)', color: 'var(--ink-soft)', background: '#fff' }}>← Zurück</button>
        </div>
        <p className="text-sm" style={{ color: 'var(--ink-soft)' }}>Noch keine Sprints gespeichert.</p>
      </div>
    );
  }

  // Ereignis-Typ-Häufigkeiten
  const typeCounts = {};
  let totalPlanned = 0, totalUnplanned = 0;
  sprints.forEach(s => s.events.forEach(e => {
    typeCounts[e.type] = (typeCounts[e.type] ?? 0) + 1;
    if (e.plannedOrUnplanned === 'geplant') totalPlanned++;
    else totalUnplanned++;
  }));

  // Sprints mit größter Abweichung
  const withDeviation = sprints
    .filter(s => s.velocity.committed && s.velocity.delivered)
    .map(s => ({ ...s, deviation: Math.abs(Number(s.velocity.committed) - Number(s.velocity.delivered)) }))
    .sort((a, b) => b.deviation - a.deviation)
    .slice(0, 3);

  // Wiederkehrende Ereignis-Kombination in letzten 3 Sprints
  const recent = sprints.slice(-3);
  const recentTypes = recent.map(s => s.events.map(e => e.type));
  const commonTypes = recentTypes[0]?.filter(t => recentTypes.slice(1).every(rt => rt.includes(t))) ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold" style={{ color: 'var(--ink)' }}>SM-Ansicht</h2>
        <button onClick={onBack} className="text-sm py-1 px-3 rounded"
                style={{ border: '1px solid var(--rule)', color: 'var(--ink-soft)', background: '#fff' }}>← Zurück</button>
      </div>

      <section className="mb-8">
        <h3 className="text-sm font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--ink-faint)' }}>
          Ereignis-Verteilung
        </h3>
        <div className="flex gap-6 mb-4">
          <div className="p-3 rounded-lg" style={{ background: '#fff', border: '1px solid var(--rule)' }}>
            <p className="text-2xl font-bold" style={{ color: 'var(--green-dark)' }}>{totalPlanned}</p>
            <p className="text-xs" style={{ color: 'var(--ink-faint)' }}>geplant</p>
          </div>
          <div className="p-3 rounded-lg" style={{ background: '#fff', border: '1px solid var(--rule)' }}>
            <p className="text-2xl font-bold" style={{ color: 'var(--amber)' }}>{totalUnplanned}</p>
            <p className="text-xs" style={{ color: 'var(--ink-faint)' }}>ungeplant</p>
          </div>
        </div>
        <div className="space-y-2">
          {Object.entries(typeCounts).sort((a, b) => b[1] - a[1]).map(([type, count]) => {
            const t = EVENT_TYPES[type];
            return (
              <div key={type} className="flex items-center gap-3">
                <span className="text-xs px-2 py-0.5 rounded w-36 shrink-0"
                      style={{ background: t.bg, color: t.color }}>{t.label}</span>
                <div className="flex-1 rounded-full h-2" style={{ background: 'var(--rule)' }}>
                  <div className="h-2 rounded-full" style={{ width: `${(count / Math.max(...Object.values(typeCounts))) * 100}%`, background: t.color }} />
                </div>
                <span className="text-xs w-6 text-right" style={{ color: 'var(--ink-faint)' }}>{count}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mb-8">
        <h3 className="text-sm font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--ink-faint)' }}>
          Sprints mit größter Abweichung
        </h3>
        <div className="space-y-3">
          {withDeviation.map(s => (
            <div key={s.id} className="p-4 rounded-lg" style={{ background: '#fff', border: '1px solid var(--rule)' }}>
              <div className="flex justify-between mb-2">
                <p className="text-sm font-medium" style={{ color: 'var(--ink)' }}>Sprint {s.sprintNumber}</p>
                <span className="text-sm" style={{ color: s.deviation > 5 ? 'var(--red-dark)' : 'var(--amber)' }}>
                  Δ {s.deviation} SP
                </span>
              </div>
              <p className="text-xs mb-2" style={{ color: 'var(--ink-faint)' }}>
                {s.velocity.committed} committed → {s.velocity.delivered} delivered
              </p>
              {s.events.slice(0, 3).map((e, i) => (
                <p key={i} className="text-xs" style={{ color: 'var(--ink-soft)' }}>
                  [{EVENT_TYPES[e.type]?.label ?? e.type}] {e.description}
                </p>
              ))}
            </div>
          ))}
        </div>
      </section>

      {commonTypes.length > 0 && (
        <section className="mb-8">
          <h3 className="text-sm font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--ink-faint)' }}>
            Wiederkehrender Ereignis-Typ (letzte 3 Sprints)
          </h3>
          <div className="p-4 rounded-lg" style={{ background: 'var(--amber-light)', border: '1px solid var(--amber)' }}>
            <p className="text-xs font-medium mb-1" style={{ color: 'var(--amber)' }}>Moderationshinweis</p>
            <p className="text-sm mb-2" style={{ color: 'var(--ink)' }}>
              {commonTypes.map(t => EVENT_TYPES[t]?.label ?? t).join(', ')} taucht in den letzten 3 Sprints auf — könnte es ein strukturelles Problem sein?
            </p>
          </div>
        </section>
      )}

      <p className="text-xs" style={{ color: 'var(--ink-faint)' }}>
        Kein Management-Export aus dieser Ansicht. Velocity-Daten gehören dem Team.
      </p>
    </div>
  );
}
