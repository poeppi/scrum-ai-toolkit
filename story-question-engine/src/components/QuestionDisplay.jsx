export function QuestionDisplay({ kiQuestion, loading, onNext }) {
  if (loading) {
    return (
      <div className="py-16 text-center">
        <div className="inline-block w-8 h-8 rounded-full mb-4"
             style={{ border: '3px solid var(--green-light)', borderTopColor: 'var(--green-dark)', animation: 'spin 1s linear infinite' }} />
        <p className="text-sm" style={{ color: 'var(--ink-soft)' }}>Analysiere Story…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!kiQuestion.question) return null;

  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide mb-6" style={{ color: 'var(--ink-faint)' }}>
        Die Frage für euer Refinement
      </p>

      {/* Die Frage — visuell dominant */}
      <div className="rounded-xl p-8 mb-6"
           style={{ background: 'var(--green-dark)', color: '#fff' }}>
        <p className="text-xs mb-4" style={{ opacity: 0.6 }}>KI-Frage — kein Teamkonsens, kein Urteil</p>
        <p className="text-xl leading-relaxed font-medium">
          {kiQuestion.question}
        </p>
      </div>

      {kiQuestion.reasoning && (
        <div className="mb-4 px-4 py-3 rounded" style={{ background: 'var(--green-light)', borderLeft: '3px solid var(--green-mid)' }}>
          <p className="text-xs font-medium mb-1" style={{ color: 'var(--ink-faint)' }}>Warum diese Frage</p>
          <p className="text-sm" style={{ color: 'var(--ink)' }}>{kiQuestion.reasoning}</p>
        </div>
      )}

      {kiQuestion.cargoCultWarning && (
        <div className="mb-6 px-4 py-3 rounded" style={{ background: 'var(--amber-light)', border: '1px solid var(--amber-dark)' }}>
          <p className="text-xs font-medium mb-1" style={{ color: 'var(--amber-dark)' }}>⚠ Achtung</p>
          <p className="text-sm" style={{ color: 'var(--amber-dark)' }}>{kiQuestion.cargoCultWarning}</p>
        </div>
      )}

      <p className="text-sm mb-6 text-center" style={{ color: 'var(--ink-soft)' }}>
        Diskutiert die Frage jetzt im Team. Danach weiter.
      </p>

      <div className="flex justify-end">
        <button
          onClick={onNext}
          className="py-2 px-6 rounded text-sm font-medium text-white"
          style={{ background: 'var(--green-dark)' }}
        >
          Wir haben diskutiert →
        </button>
      </div>
    </div>
  );
}
