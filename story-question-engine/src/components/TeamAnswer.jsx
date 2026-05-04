export function TeamAnswer({ data, onChange, kiQuestion, onNext }) {
  function set(field, value) {
    onChange({ ...data, [field]: value });
  }

  const canProceed = data.canAnswer !== null &&
    (data.canAnswer ? data.answerText.trim().length > 0 : data.blockers.trim().length > 0);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-1" style={{ color: 'var(--ink)' }}>
        Team-Antwort
      </h2>

      <div className="mb-6 p-4 rounded-lg" style={{ background: 'var(--green-dark)', color: '#fff' }}>
        <p className="text-xs mb-2" style={{ opacity: 0.6 }}>Die Frage</p>
        <p className="text-base font-medium">{kiQuestion.question}</p>
      </div>

      <p className="text-sm font-medium mb-3" style={{ color: 'var(--ink)' }}>
        Kann euer Team die Frage jetzt beantworten?
      </p>

      <div className="flex gap-3 mb-6">
        <button
          onClick={() => set('canAnswer', true)}
          className="flex-1 py-2 rounded text-sm font-medium"
          style={{
            background: data.canAnswer === true ? 'var(--green-dark)' : 'var(--team-bg)',
            color: data.canAnswer === true ? '#fff' : 'var(--ink)',
            border: `1px solid ${data.canAnswer === true ? 'var(--green-dark)' : 'var(--rule)'}`
          }}
        >
          Ja — wir können sie beantworten
        </button>
        <button
          onClick={() => set('canAnswer', false)}
          className="flex-1 py-2 rounded text-sm font-medium"
          style={{
            background: data.canAnswer === false ? 'var(--red-dark)' : 'var(--team-bg)',
            color: data.canAnswer === false ? '#fff' : 'var(--ink)',
            border: `1px solid ${data.canAnswer === false ? 'var(--red-dark)' : 'var(--rule)'}`
          }}
        >
          Nein — noch unklar
        </button>
      </div>

      {data.canAnswer === true && (
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--ink)' }}>
            Eure Antwort
          </label>
          <textarea
            value={data.answerText}
            onChange={e => set('answerText', e.target.value)}
            rows={4}
            placeholder="Was habt ihr gemeinsam geklärt?"
            className="w-full rounded p-3 text-sm resize-none"
            style={{ border: '1px solid var(--rule)', background: 'var(--team-bg)', color: 'var(--ink)', outline: 'none' }}
          />
        </div>
      )}

      {data.canAnswer === false && (
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--ink)' }}>
            Was fehlt noch?
          </label>
          <p className="text-xs mb-2" style={{ color: 'var(--ink-faint)' }}>
            Wer muss was klären, entscheiden oder liefern?
          </p>
          <textarea
            value={data.blockers}
            onChange={e => set('blockers', e.target.value)}
            rows={4}
            placeholder="z.B. PO muss Performance-Grenze mit Stakeholder klären. Auth-Service-Team muss Verfügbarkeit bis Freitag bestätigen."
            className="w-full rounded p-3 text-sm resize-none"
            style={{ border: '1px solid var(--rule)', background: 'var(--team-bg)', color: 'var(--ink)', outline: 'none' }}
          />
        </div>
      )}

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
