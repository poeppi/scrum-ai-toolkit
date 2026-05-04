export function StoryInput({ data, onChange, onNext, phase }) {
  function set(field, value) {
    onChange({ ...data, [field]: value });
  }

  const canProceed = data.text.trim().length > 0;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-1" style={{ color: 'var(--ink)' }}>
        Story eingeben
      </h2>
      <p className="text-sm mb-6" style={{ color: 'var(--ink-soft)' }}>
        Kein Pflichtformat. Das Tool bewertet Inhalt, nicht Syntax.
      </p>

      <div className="space-y-5 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--ink)' }}>
            User Story <span style={{ color: 'var(--red-dark)' }}>*</span>
          </label>
          <textarea
            value={data.text}
            onChange={e => set('text', e.target.value)}
            rows={4}
            placeholder="Als … möchte ich …, damit … — oder Freitext"
            className="w-full rounded p-3 text-sm resize-none"
            style={{ border: '1px solid var(--rule)', background: '#fff', color: 'var(--ink)', outline: 'none' }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--ink)' }}>
            Akzeptanzkriterien
          </label>
          <p className="text-xs mb-2" style={{ color: 'var(--ink-faint)' }}>
            Ein Kriterium pro Zeile. Das Tool prüft sie auf Testbarkeit.
          </p>
          <textarea
            value={data.acceptanceCriteria}
            onChange={e => set('acceptanceCriteria', e.target.value)}
            rows={5}
            placeholder={'Gegeben … wenn … dann …\nGegeben … wenn … dann …'}
            className="w-full rounded p-3 text-sm resize-none font-mono"
            style={{ border: '1px solid var(--rule)', background: '#fff', color: 'var(--ink)', outline: 'none', fontSize: '13px' }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--ink)' }}>
            Kontext für die KI (optional)
          </label>
          <p className="text-xs mb-2" style={{ color: 'var(--ink-faint)' }}>
            Was weiß die KI nicht, das relevant ist? (Tech-Stack, bekannte Abhängigkeiten, offene Entscheidungen)
          </p>
          <textarea
            value={data.context}
            onChange={e => set('context', e.target.value)}
            rows={2}
            placeholder="z.B. Wir nutzen PostgreSQL. Auth-Service der anderen Abteilung ist noch nicht fertig."
            className="w-full rounded p-3 text-sm resize-none"
            style={{ border: '1px solid var(--rule)', background: '#fff', color: 'var(--ink)', outline: 'none' }}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={onNext}
          disabled={!canProceed}
          className="py-2 px-6 rounded text-sm font-medium text-white disabled:opacity-40"
          style={{ background: 'var(--green-dark)' }}
        >
          Weiter →
        </button>
      </div>
    </div>
  );
}
