import { useState } from 'react';
import { QUESTION_LIBRARY, CATEGORY_LABELS } from '../data/questionLibrary.js';

export function QuestionLibrary({ data, onChange, onNext }) {
  const [pickedQuestion, setPickedQuestion] = useState(data.question ?? null);

  function selectCategory(cat) {
    onChange({ category: cat, question: null, teamResponse: data.teamResponse ?? '' });
    setPickedQuestion(null);
  }

  function selectQuestion(q) {
    setPickedQuestion(q);
    onChange({ ...data, question: q });
  }

  function setResponse(val) {
    onChange({ ...data, teamResponse: val });
  }

  const canProceed = data.question && (data.teamResponse ?? '').trim().length > 0;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-1" style={{ color: 'var(--ink)' }}>
        Reflexionsfrage
      </h2>
      <p className="text-sm mb-6" style={{ color: 'var(--ink-soft)' }}>
        Wählt eine Kategorie, dann eine Frage. Die Antwort bleibt beim Team — kein KI-Kommentar danach.
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
          <button
            key={key}
            onClick={() => selectCategory(key)}
            className="py-1 px-4 rounded text-sm font-medium"
            style={{
              background: data.category === key ? 'var(--green-dark)' : '#fff',
              color: data.category === key ? '#fff' : 'var(--ink-soft)',
              border: `1px solid ${data.category === key ? 'var(--green-dark)' : 'var(--rule)'}`
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {data.category && (
        <div className="space-y-2 mb-6">
          {QUESTION_LIBRARY[data.category].map((q, idx) => (
            <button
              key={idx}
              onClick={() => selectQuestion(q)}
              className="w-full text-left p-3 rounded text-sm"
              style={{
                background: pickedQuestion === q ? 'var(--green-light)' : '#fff',
                border: `1px solid ${pickedQuestion === q ? 'var(--green-mid)' : 'var(--rule)'}`,
                color: 'var(--ink)'
              }}
            >
              {pickedQuestion === q ? '→ ' : ''}{q}
            </button>
          ))}
        </div>
      )}

      {data.question && (
        <div className="mb-6">
          <div className="p-3 mb-3 rounded" style={{ background: 'var(--green-light)', border: '1px solid var(--green-mid)' }}>
            <p className="text-sm font-medium" style={{ color: 'var(--green-dark)' }}>
              Gewählte Frage: „{data.question}"
            </p>
          </div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--ink)' }}>
            Antwort des Teams
          </label>
          <textarea
            value={data.teamResponse ?? ''}
            onChange={e => setResponse(e.target.value)}
            rows={4}
            placeholder="Eure Antwort als Gruppe — Freitext, bleibt beim Team"
            className="w-full rounded p-3 text-sm resize-none"
            style={{ border: '1px solid var(--rule)', background: '#fff', color: 'var(--ink)', outline: 'none' }}
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
