import { STATUS_LABELS, IMPEDIMENT_TYPES } from '../data/impedimentTypes.js';

export function SprintReview({ openImpediments, onUpdate, onDone }) {
  if (openImpediments.length === 0) {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-1" style={{ color: 'var(--ink)' }}>
          Sprint-Einstieg
        </h2>
        <div className="mb-6 p-4 rounded-lg" style={{ background: 'var(--green-light)', border: '1px solid var(--green-mid)' }}>
          <p className="text-sm" style={{ color: 'var(--green-dark)' }}>
            Keine offenen Impediments aus dem letzten Sprint.
          </p>
        </div>
        <div className="flex justify-end">
          <button onClick={onDone} className="py-2 px-6 rounded text-sm font-medium text-white"
                  style={{ background: 'var(--green-dark)' }}>
            Weiter →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-1" style={{ color: 'var(--ink)' }}>
        Sprint-Einstieg — offene Impediments
      </h2>
      <p className="text-sm mb-6" style={{ color: 'var(--ink-soft)' }}>
        {openImpediments.length} Impediment{openImpediments.length > 1 ? 's' : ''} aus dem letzten Sprint. Was hat sich geändert?
      </p>

      <div className="space-y-4 mb-6">
        {openImpediments.map(imp => {
          const typeInfo = IMPEDIMENT_TYPES[imp.type];
          return (
            <div key={imp.id} className="p-4 rounded-lg" style={{ background: '#fff', border: '1px solid var(--rule)' }}>
              <div className="flex items-start gap-3 mb-3">
                {typeInfo && (
                  <span className="text-xs px-2 py-0.5 rounded shrink-0"
                        style={{ background: typeInfo.bg, color: typeInfo.color }}>
                    {typeInfo.label}
                  </span>
                )}
                <p className="text-sm" style={{ color: 'var(--ink)' }}>{imp.description}</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                {['in-arbeit', 'gelöst', 'akzeptiert'].map(s => {
                  const st = STATUS_LABELS[s];
                  return (
                    <button key={s}
                      onClick={() => onUpdate({ ...imp, status: s, resolvedDate: s !== 'offen' && s !== 'in-arbeit' ? new Date().toISOString().split('T')[0] : null })}
                      className="text-xs py-1 px-3 rounded"
                      style={{
                        background: imp.status === s ? st.color : '#fff',
                        color: imp.status === s ? '#fff' : 'var(--ink-soft)',
                        border: `1px solid ${imp.status === s ? st.color : 'var(--rule)'}`
                      }}>
                      {st.label}
                    </button>
                  );
                })}
              </div>
              {(imp.status === 'gelöst' || imp.status === 'akzeptiert') && (
                <textarea
                  value={imp.resolution}
                  onChange={e => onUpdate({ ...imp, resolution: e.target.value })}
                  rows={2}
                  placeholder={imp.status === 'gelöst' ? 'Wie wurde es gelöst?' : 'Warum akzeptiert?'}
                  className="mt-2 w-full rounded p-2 text-sm resize-none"
                  style={{ border: '1px solid var(--rule)', background: 'var(--bg)', color: 'var(--ink)', outline: 'none' }}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-end">
        <button onClick={onDone} className="py-2 px-6 rounded text-sm font-medium text-white"
                style={{ background: 'var(--green-dark)' }}>
          Weiter →
        </button>
      </div>
    </div>
  );
}
