import { useState } from 'react';
import { EVENT_TYPES, IMPACT_LABELS, PLANNING_LABELS } from '../data/eventTypes.js';
import { createEmptyEvent } from '../data/sprintSchema.js';

const JIRA_HELP = [
  { label: 'Committed (SP)', hint: 'Jira: Sprint-Board öffnen → Sprint Report → "Story Points Committed". Linear: Cycle → Geplante Punkte. Azure DevOps: Sprint Burndown → Planned Work.' },
  { label: 'Delivered (SP)', hint: 'Jira: Sprint Report → "Story Points Completed". Linear: Cycle → Abgeschlossene Punkte. Azure DevOps: Sprint Burndown → Completed Work.' },
];

export function SprintLog({ sprint, onChange, onNext }) {
  const [newEvent, setNewEvent] = useState(createEmptyEvent());
  const [showJiraHelp, setShowJiraHelp] = useState(false);

  function setVelocity(field, val) {
    onChange({ ...sprint, velocity: { ...sprint.velocity, [field]: val } });
  }

  function addEvent() {
    if (!newEvent.type || !newEvent.description.trim()) return;
    onChange({ ...sprint, events: [...sprint.events, { ...newEvent, id: crypto.randomUUID() }] });
    setNewEvent(createEmptyEvent());
  }

  function removeEvent(id) {
    onChange({ ...sprint, events: sprint.events.filter(e => e.id !== id) });
  }

  const velocityFilled = sprint.velocity.committed !== '' && sprint.velocity.delivered !== '';
  const canProceed = velocityFilled && sprint.events.length > 0;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-1" style={{ color: 'var(--ink)' }}>
        Sprint {sprint.sprintNumber} — Abschluss-Log
      </h2>
      <p className="text-sm mb-6" style={{ color: 'var(--ink-soft)' }}>
        Bevor die KI-Analyse verfügbar ist: Was ist diesen Sprint passiert? Auch wenn es nichts Ungewöhnliches war — das ist für spätere Muster wichtig.
      </p>

      {/* Velocity */}
      <div className="p-4 rounded-lg mb-6" style={{ background: '#fff', border: '1px solid var(--rule)' }}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium" style={{ color: 'var(--ink)' }}>Velocity</p>
          <button
            onClick={() => setShowJiraHelp(h => !h)}
            className="text-xs py-0.5 px-2 rounded"
            style={{ border: '1px solid var(--rule)', color: 'var(--ink-faint)', background: 'transparent' }}
          >
            {showJiraHelp ? 'Hilfe ausblenden' : 'Wo finde ich das?'}
          </button>
        </div>
        {showJiraHelp && (
          <div className="mb-3 space-y-2">
            {JIRA_HELP.map(h => (
              <div key={h.label} className="p-2 rounded text-xs" style={{ background: 'var(--bg)', border: '1px solid var(--rule)' }}>
                <span className="font-medium" style={{ color: 'var(--ink)' }}>{h.label}: </span>
                <span style={{ color: 'var(--ink-soft)' }}>{h.hint}</span>
              </div>
            ))}
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Committed (SP)', field: 'committed' },
            { label: 'Delivered (SP)', field: 'delivered' }
          ].map(({ label, field }) => (
            <div key={field}>
              <label className="block text-xs mb-1" style={{ color: 'var(--ink-faint)' }}>{label}</label>
              <input
                type="number" min="0"
                value={sprint.velocity[field]}
                onChange={e => setVelocity(field, e.target.value)}
                className="w-full rounded p-2 text-sm"
                style={{ border: '1px solid var(--rule)', background: 'var(--bg)', color: 'var(--ink)', outline: 'none' }}
              />
            </div>
          ))}
        </div>
        {velocityFilled && (
          <p className="text-xs mt-2" style={{ color: 'var(--ink-faint)' }}>
            Differenz: {Number(sprint.velocity.committed) - Number(sprint.velocity.delivered)} SP
          </p>
        )}
        <p className="text-xs mt-1" style={{ color: 'var(--ink-faint)' }}>
          Kein Zielwert — nur committed vs. delivered.
        </p>
      </div>

      {/* Ereignisse */}
      <div className="mb-6">
        <p className="text-sm font-medium mb-3" style={{ color: 'var(--ink)' }}>
          Ereignisse <span style={{ color: 'var(--red-dark)' }}>*</span>
        </p>

        {/* Bestehende */}
        {sprint.events.length > 0 && (
          <div className="space-y-2 mb-4">
            {sprint.events.map(e => {
              const t = EVENT_TYPES[e.type];
              return (
                <div key={e.id} className="flex items-start gap-2 p-3 rounded"
                     style={{ background: '#fff', border: '1px solid var(--rule)' }}>
                  <div className="flex-1">
                    <div className="flex gap-2 mb-1 flex-wrap">
                      {t && <span className="text-xs px-2 py-0.5 rounded" style={{ background: t.bg, color: t.color }}>{t.label}</span>}
                      <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'var(--bg)', color: 'var(--ink-faint)', border: '1px solid var(--rule)' }}>
                        {PLANNING_LABELS[e.plannedOrUnplanned]} · {IMPACT_LABELS[e.estimatedImpact]}
                      </span>
                    </div>
                    <p className="text-sm" style={{ color: 'var(--ink)' }}>{e.description}</p>
                  </div>
                  <button onClick={() => removeEvent(e.id)} className="text-xs shrink-0"
                          style={{ color: 'var(--ink-faint)' }}>✕</button>
                </div>
              );
            })}
          </div>
        )}

        {/* Neues Ereignis */}
        <div className="p-4 rounded-lg" style={{ background: 'var(--green-light)', border: '1px solid var(--green-mid)' }}>
          <p className="text-xs font-medium mb-3" style={{ color: 'var(--green-dark)' }}>Ereignis hinzufügen</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {Object.entries(EVENT_TYPES).map(([key, t]) => (
              <button key={key} onClick={() => setNewEvent(e => ({ ...e, type: key }))}
                      className="text-xs py-1 px-2 rounded"
                      style={{
                        background: newEvent.type === key ? t.color : '#fff',
                        color: newEvent.type === key ? '#fff' : 'var(--ink-soft)',
                        border: `1px solid ${newEvent.type === key ? t.color : 'var(--rule)'}`
                      }}>
                {t.label}
              </button>
            ))}
          </div>
          <textarea
            value={newEvent.description}
            onChange={e => setNewEvent(ev => ({ ...ev, description: e.target.value }))}
            rows={2}
            placeholder="Was ist passiert?"
            className="w-full rounded p-2 text-sm resize-none mb-3"
            style={{ border: '1px solid var(--rule)', background: '#fff', color: 'var(--ink)', outline: 'none' }}
          />
          <div className="flex gap-3 mb-3">
            <div>
              <p className="text-xs mb-1" style={{ color: 'var(--ink-faint)' }}>Planung</p>
              <div className="flex gap-1">
                {Object.entries(PLANNING_LABELS).map(([k, l]) => (
                  <button key={k} onClick={() => setNewEvent(e => ({ ...e, plannedOrUnplanned: k }))}
                          className="text-xs py-1 px-2 rounded"
                          style={{
                            background: newEvent.plannedOrUnplanned === k ? 'var(--green-dark)' : '#fff',
                            color: newEvent.plannedOrUnplanned === k ? '#fff' : 'var(--ink-soft)',
                            border: `1px solid ${newEvent.plannedOrUnplanned === k ? 'var(--green-dark)' : 'var(--rule)'}`
                          }}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs mb-1" style={{ color: 'var(--ink-faint)' }}>Impact</p>
              <div className="flex gap-1">
                {Object.entries(IMPACT_LABELS).map(([k, l]) => (
                  <button key={k} onClick={() => setNewEvent(e => ({ ...e, estimatedImpact: k }))}
                          className="text-xs py-1 px-2 rounded"
                          style={{
                            background: newEvent.estimatedImpact === k ? 'var(--green-dark)' : '#fff',
                            color: newEvent.estimatedImpact === k ? '#fff' : 'var(--ink-soft)',
                            border: `1px solid ${newEvent.estimatedImpact === k ? 'var(--green-dark)' : 'var(--rule)'}`
                          }}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <button onClick={addEvent}
                  disabled={!newEvent.type || !newEvent.description.trim()}
                  className="text-xs py-1.5 px-4 rounded font-medium text-white disabled:opacity-40"
                  style={{ background: 'var(--green-dark)' }}>
            Hinzufügen
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={onNext} disabled={!canProceed}
                className="py-2 px-6 rounded text-sm font-medium text-white disabled:opacity-40"
                style={{ background: 'var(--green-dark)' }}>
          Weiter →
        </button>
      </div>
    </div>
  );
}
