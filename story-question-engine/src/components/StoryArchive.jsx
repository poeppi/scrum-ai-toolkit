import { PHASE_LABELS } from '../data/storySchema.js';

export function StoryArchive({ stories, onBack }) {
  const sorted = [...stories].reverse();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold" style={{ color: 'var(--ink)' }}>Verlauf</h2>
        <button
          onClick={onBack}
          className="text-sm py-1 px-3 rounded"
          style={{ border: '1px solid var(--rule)', color: 'var(--ink-soft)', background: '#fff' }}
        >
          ← Zurück
        </button>
      </div>

      {sorted.length === 0 ? (
        <p className="text-sm" style={{ color: 'var(--ink-soft)' }}>Noch keine Stories analysiert.</p>
      ) : (
        <div className="space-y-4">
          {sorted.map(s => (
            <div key={s.id} className="p-4 rounded-lg" style={{ background: '#fff', border: '1px solid var(--rule)' }}>
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex-1">
                  <p className="text-xs mb-1" style={{ color: 'var(--ink-faint)' }}>
                    {s.date} · {PHASE_LABELS[s.phase] ?? s.phase}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--ink)' }}>
                    {s.story.text.slice(0, 100)}{s.story.text.length > 100 ? '…' : ''}
                  </p>
                </div>
                <span className="text-xs px-2 py-0.5 rounded shrink-0"
                      style={{
                        background: s.verdict.readiness === 'planning-ready' ? 'var(--green-light)' : 'var(--red-light)',
                        color: s.verdict.readiness === 'planning-ready' ? 'var(--green-dark)' : 'var(--red-dark)'
                      }}>
                  {s.verdict.readiness === 'planning-ready' ? 'Planning-ready' : s.verdict.readiness ? 'Needs work' : '—'}
                </span>
              </div>
              {s.kiQuestion.question && (
                <p className="text-xs pt-2" style={{ color: 'var(--ink-soft)', borderTop: '1px solid var(--rule)' }}>
                  Frage: {s.kiQuestion.question.slice(0, 120)}{s.kiQuestion.question.length > 120 ? '…' : ''}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
