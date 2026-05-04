export function ActionCommit({ data, onChange, onNext, onExport }) {
  function set(field, value) {
    onChange({ ...data, [field]: value });
  }

  const actionFilled = data.action.trim().length > 0;
  const criterionFilled = data.successCriterion.trim().length > 0;
  const canProceed = actionFilled && criterionFilled;

  function handleExport() {
    const card = `RetroMirror — Maßnahmen-Karte
Sprint: ${data._sprintNumber ?? '—'}
Datum: ${new Date().toLocaleDateString('de-DE')}

Maßnahme: ${data.action}
Erfolgskriterium: ${data.successCriterion}
Verantwortung: ${data.owner}
Review: Nächste Retrospektive`;
    navigator.clipboard.writeText(card).catch(() => {});
    if (onExport) onExport(card);
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-1" style={{ color: 'var(--ink)' }}>
        Maßnahmen-Commit
      </h2>
      <p className="text-sm mb-6" style={{ color: 'var(--ink-soft)' }}>
        Eine Maßnahme. Kein Backlog. Die Maßnahmen-Karte könnt ihr danach ins Kanban-Board oder in Jira übertragen.
      </p>

      <div className="space-y-5 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--ink)' }}>
            Maßnahme <span style={{ color: 'var(--red-dark)' }}>*</span>
          </label>
          <p className="text-xs mb-2" style={{ color: 'var(--ink-faint)' }}>
            Was genau tut ihr anders? Kein Wunsch — eine konkrete Handlung.
          </p>
          <textarea
            value={data.action}
            onChange={e => set('action', e.target.value)}
            rows={3}
            placeholder={'z.B. „Wir richten bis Mittwoch ein geteiltes Kanal-Log ein, in das alle Blocker sofort eingetragen werden.“'}
            className="w-full rounded p-3 text-sm resize-none"
            style={{ border: '1px solid var(--rule)', background: '#fff', color: 'var(--ink)', outline: 'none' }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--ink)' }}>
            Erfolgskriterium <span style={{ color: 'var(--red-dark)' }}>*</span>
          </label>
          <p className="text-xs mb-2" style={{ color: 'var(--ink-faint)' }}>
            Wie wissen wir in der nächsten Retro, ob es geklappt hat? Beobachtbar, nicht interpretierbar.
          </p>
          {actionFilled && !criterionFilled && (
            <p className="text-xs mb-2 px-3 py-2 rounded" style={{ background: 'var(--amber-light)', color: 'var(--amber)' }}>
              Wie würdet ihr in der nächsten Retro wissen, ob das geklappt hat?
            </p>
          )}
          <textarea
            value={data.successCriterion}
            onChange={e => set('successCriterion', e.target.value)}
            rows={2}
            placeholder={'z.B. „Das Log enthält mindestens 3 Einträge pro Sprint-Woche."'}
            className="w-full rounded p-3 text-sm resize-none"
            style={{ border: '1px solid var(--rule)', background: '#fff', color: 'var(--ink)', outline: 'none' }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--ink)' }}>
            Verantwortung
          </label>
          <div className="flex gap-3">
            {['Team', 'SM', 'PO'].map(role => (
              <button
                key={role}
                onClick={() => set('owner', role)}
                className="flex-1 py-2 rounded text-sm font-medium"
                style={{
                  background: data.owner === role ? 'var(--green-dark)' : '#fff',
                  color: data.owner === role ? '#fff' : 'var(--ink)',
                  border: `1px solid ${data.owner === role ? 'var(--green-dark)' : 'var(--rule)'}`
                }}
              >
                {role === 'SM' ? 'Scrum Master' : role === 'PO' ? 'Product Owner' : 'Team'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {canProceed && (
        <div className="mb-6 p-4 rounded-lg" style={{ background: 'var(--green-light)', border: '1px solid var(--green-mid)' }}>
          <p className="text-xs font-medium mb-2" style={{ color: 'var(--green-dark)' }}>Vorschau Maßnahmen-Karte</p>
          <p className="text-sm" style={{ color: 'var(--ink)' }}>{data.action}</p>
          <p className="text-xs mt-1" style={{ color: 'var(--ink-soft)' }}>Kriterium: {data.successCriterion}</p>
          <p className="text-xs" style={{ color: 'var(--ink-faint)' }}>Verantwortung: {data.owner} · Review: nächste Retro</p>
        </div>
      )}

      <div className="flex gap-3 justify-between">
        {canProceed && (
          <button
            onClick={handleExport}
            className="py-2 px-4 rounded text-sm"
            style={{ background: '#fff', color: 'var(--green-dark)', border: '1px solid var(--green-mid)' }}
          >
            In Zwischenablage kopieren
          </button>
        )}
        <button
          onClick={onNext}
          disabled={!canProceed}
          className="py-2 px-6 rounded text-sm font-medium text-white disabled:opacity-40 ml-auto"
          style={{ background: 'var(--green-dark)' }}
        >
          Commit abschließen →
        </button>
      </div>
    </div>
  );
}
