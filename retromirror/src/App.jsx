import { useState } from 'react';
import { PrivacyModal } from './components/PrivacyModal.jsx';
import { SafetyCheck } from './components/SafetyCheck.jsx';
import { ActionReview } from './components/ActionReview.jsx';
import { TeamInput } from './components/TeamInput.jsx';
import { QuestionLibrary } from './components/QuestionLibrary.jsx';
import { ActionCommit } from './components/ActionCommit.jsx';
import { KIMirror } from './components/KIMirror.jsx';
import { FacilitatorView } from './components/FacilitatorView.jsx';
import { useSprintStorage } from './hooks/useSprintStorage.js';
import { createEmptySprint } from './data/sprintSchema.js';
import { ApiKeySetup } from './components/ApiKeySetup.jsx';

const PHASES = ['Sicherheit', 'Maßnahmen-Review', 'Team-Input', 'Frage', 'Commit'];

function usePrivacyAccepted() {
  const key = 'retromirror_privacy_accepted';
  const [accepted, setAccepted] = useState(() => !!localStorage.getItem(key));
  function accept() {
    localStorage.setItem(key, '1');
    setAccepted(true);
  }
  return [accepted, accept];
}

export default function App() {
  const [privacyAccepted, acceptPrivacy] = usePrivacyAccepted();
  const [facilitatorMode, setFacilitatorMode] = useState(false);
  const { sprints, saveSprint, getLastSprint } = useSprintStorage();
  const lastSprint = getLastSprint();

  const nextSprintNumber = lastSprint ? lastSprint.sprintNumber + 1 : 1;
  const [sprint, setSprint] = useState(() => createEmptySprint(nextSprintNumber));
  const [phase, setPhase] = useState(0);
  const [done, setDone] = useState(false);
  const [exportCopied, setExportCopied] = useState(false);

  function updateSprint(patch) {
    setSprint(prev => ({ ...prev, ...patch }));
  }

  function goNext() {
    const saved = { ...sprint };
    saveSprint(saved);
    if (phase < PHASES.length - 1) {
      setPhase(p => p + 1);
    } else {
      setDone(true);
    }
  }

  function handleSkipSafety() {
    const updated = { ...sprint, safetyCheck: { scores: [null, null, null], score: null, belowThreshold: false, skipped: true } };
    setSprint(updated);
    saveSprint(updated);
    setPhase(1);
  }

  function handleExportCopied() {
    setExportCopied(true);
    setTimeout(() => setExportCopied(false), 2500);
  }

  function startNewSprint() {
    const newSprint = createEmptySprint(sprint.sprintNumber + 1);
    setSprint(newSprint);
    setPhase(0);
    setDone(false);
    setExportCopied(false);
  }

  if (!privacyAccepted) return <PrivacyModal onAccept={acceptPrivacy} />;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <header className="flex items-center justify-between px-6 py-3"
              style={{ borderBottom: '1px solid var(--rule)', background: '#fff' }}>
        <div className="flex items-center gap-3">
          <a href="../../index.html" style={{ fontFamily: 'var(--mono)', fontSize: '11px', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-faint)', textDecoration: 'none' }}>← Startseite</a>
          <span className="font-semibold text-base" style={{ color: 'var(--ink)' }}>
            RetroMirror
          </span>
          <span className="text-xs px-2 py-0.5 rounded"
                style={{ background: 'var(--green-light)', color: 'var(--green-dark)' }}>
            Sprint {sprint.sprintNumber}
          </span>
        </div>
        <ApiKeySetup />
        <button
          onClick={() => setFacilitatorMode(f => !f)}
          className="text-xs py-1 px-3 rounded"
          style={{ border: '1px solid var(--rule)', color: 'var(--ink-faint)', background: 'transparent' }}
        >
          {facilitatorMode ? '← Retro' : 'Facilitator-Ansicht'}
        </button>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        {facilitatorMode ? (
          <FacilitatorView sprints={sprints} onBack={() => setFacilitatorMode(false)} />
        ) : done ? (
          <DoneScreen
            sprint={sprint}
            previousSprints={sprints.filter(s => s.id !== sprint.id)}
            exportCopied={exportCopied}
            onExport={handleExportCopied}
            onNewSprint={startNewSprint}
            onChange={patch => updateSprint({ kiMirror: { ...sprint.kiMirror, ...patch } })}
          />
        ) : (
          <>
            <PhaseNav phases={PHASES} current={phase} />
            <div className="mt-6">
              {phase === 0 && (
                <SafetyCheck
                  data={sprint.safetyCheck}
                  onChange={d => updateSprint({ safetyCheck: d })}
                  onSkip={handleSkipSafety}
                  onNext={goNext}
                />
              )}
              {phase === 1 && (
                <ActionReview
                  data={sprint.actionReview}
                  onChange={d => updateSprint({ actionReview: d })}
                  onNext={goNext}
                  lastSprint={lastSprint}
                />
              )}
              {phase === 2 && (
                <TeamInput
                  data={sprint.teamObservations}
                  format={sprint.format}
                  onChangeFormat={fmt => updateSprint({ format: fmt, teamObservations: {} })}
                  onChange={d => updateSprint({ teamObservations: d })}
                  onNext={goNext}
                />
              )}
              {phase === 3 && (
                <QuestionLibrary
                  data={sprint.selectedQuestion}
                  onChange={d => updateSprint({ selectedQuestion: d })}
                  onNext={goNext}
                />
              )}
              {phase === 4 && (
                <ActionCommit
                  data={{ ...sprint.actionCommit, _sprintNumber: sprint.sprintNumber }}
                  onChange={d => {
                    const { _sprintNumber, ...rest } = d;
                    updateSprint({ actionCommit: rest });
                  }}
                  onNext={goNext}
                  onExport={handleExportCopied}
                />
              )}
            </div>
          </>
        )}
      </main>
      <footer style={{ borderTop: '1px solid var(--rule)', padding: '16px 24px', fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '.08em', color: 'var(--ink-faint)', lineHeight: '1.8' }}>
        Scrum AI Toolkit · Yvonne Pöppelbaum · Version 1.0 · Mai 2026<br />
        Lizenz: <a href="https://creativecommons.org/licenses/by/4.0/deed.de" style={{ color: 'var(--ink-faint)' }}>CC BY 4.0</a> · Nutzung und Weitergabe erlaubt mit Namensnennung.<br />
        Kontakt: Yvonne Pöppelbaum, Hamburg · <a href="https://github.com/poeppi" style={{ color: 'var(--ink-faint)' }}>github.com/poeppi</a> · <a href="../../impressum.html" style={{ color: 'var(--ink-faint)' }}>Impressum</a>
      </footer>
    </div>
  );
}

function PhaseNav({ phases, current }) {
  return (
    <div className="flex items-center">
      {phases.map((name, idx) => (
        <div key={idx} className="flex items-center">
          <div className="flex flex-col items-center">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium"
                 style={{
                   background: idx < current ? 'var(--green-dark)' : idx === current ? 'var(--green-mid)' : 'var(--rule)',
                   color: idx <= current ? '#fff' : 'var(--ink-faint)'
                 }}>
              {idx < current ? '✓' : idx + 1}
            </div>
            <span className="text-xs mt-1" style={{ color: idx === current ? 'var(--ink)' : 'var(--ink-faint)', whiteSpace: 'nowrap' }}>
              {name}
            </span>
          </div>
          {idx < phases.length - 1 && (
            <div className="h-px flex-1 mx-2 mb-4"
                 style={{ background: idx < current ? 'var(--green-mid)' : 'var(--rule)', minWidth: '20px' }} />
          )}
        </div>
      ))}
    </div>
  );
}

function DoneScreen({ sprint, previousSprints, exportCopied, onExport, onNewSprint, onChange }) {
  function copyCard() {
    const card = `RetroMirror — Maßnahmen-Karte
Sprint: ${sprint.sprintNumber}
Datum: ${sprint.date}

Maßnahme: ${sprint.actionCommit.action}
Erfolgskriterium: ${sprint.actionCommit.successCriterion}
Verantwortung: ${sprint.actionCommit.owner}
Review: Nächste Retrospektive`;
    navigator.clipboard.writeText(card).catch(() => {});
    onExport();
  }

  return (
    <div>
      <div className="mb-6 p-5 rounded-lg" style={{ background: 'var(--green-light)', border: '1px solid var(--green-mid)' }}>
        <p className="text-sm font-medium mb-1" style={{ color: 'var(--green-dark)' }}>
          Retro abgeschlossen · Sprint {sprint.sprintNumber}
        </p>
        <p className="text-base mb-3" style={{ color: 'var(--ink)' }}>{sprint.actionCommit.action}</p>
        <p className="text-xs mb-1" style={{ color: 'var(--ink-soft)' }}>
          Kriterium: {sprint.actionCommit.successCriterion}
        </p>
        <p className="text-xs" style={{ color: 'var(--ink-faint)' }}>
          Verantwortung: {sprint.actionCommit.owner} · Review: nächste Retro
        </p>
        <button
          onClick={copyCard}
          className="mt-3 text-xs py-1.5 px-3 rounded"
          style={{ background: '#fff', color: 'var(--green-dark)', border: '1px solid var(--green-mid)' }}
        >
          {exportCopied ? 'Kopiert ✓' : 'Maßnahmen-Karte kopieren'}
        </button>
      </div>

      <div className="mb-8">
        <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--ink)' }}>
          KI-Spiegel (optional)
        </h3>
        <KIMirror
          sprint={sprint}
          previousSprints={previousSprints}
          safetyBelowThreshold={sprint.safetyCheck?.belowThreshold ?? false}
          onChange={onChange}
        />
      </div>

      <button
        onClick={onNewSprint}
        className="w-full py-2 rounded text-sm font-medium text-white"
        style={{ background: 'var(--green-dark)' }}
      >
        Neue Retro starten (Sprint {sprint.sprintNumber + 1})
      </button>
    </div>
  );
}
