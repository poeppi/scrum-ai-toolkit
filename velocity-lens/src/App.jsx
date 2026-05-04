import { useState, useEffect } from 'react';
import { useSprintStorage } from './hooks/useSprintStorage.js';
import { useAnthropicStream } from './hooks/useAnthropicStream.js';
import { createEmptySprint, detectGoodhart } from './data/sprintSchema.js';
import { buildHypothesisPrompt, parseHypotheses } from './prompts/hypothesis-generator.js';
import { SprintLog } from './components/SprintLog.jsx';
import { TeamAssessment } from './components/TeamAssessment.jsx';
import { HypothesisPanel } from './components/HypothesisPanel.jsx';
import { VelocityChart } from './components/VelocityChart.jsx';
import { SMView } from './components/SMView.jsx';
import { ApiKeySetup } from './components/ApiKeySetup.jsx';

const PRIVACY_KEY = 'vlens_privacy_ok';

function PrivacyModal({ onAccept }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4"
         style={{ background: 'rgba(0,0,0,0.4)' }}>
      <div className="rounded-xl p-6 max-w-md w-full" style={{ background: '#fff', border: '1px solid var(--rule)' }}>
        <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--ink)' }}>Datenschutz-Hinweis</h2>
        <div className="space-y-3 mb-5">
          <p className="text-sm" style={{ color: 'var(--ink)' }}>
            Velocity Lens speichert Sprint-Daten ausschließlich lokal im Browser (localStorage). Keine Daten werden an Server übertragen — außer wenn ihr die KI-Analyse startet.
          </p>
          <div className="p-3 rounded" style={{ background: 'var(--amber-light)', border: '1px solid var(--amber)' }}>
            <p className="text-xs font-medium mb-1" style={{ color: 'var(--amber)' }}>KI-Analyse (optional)</p>
            <p className="text-xs" style={{ color: 'var(--ink)' }}>
              Wenn ihr Hypothesen generieren lasst, werden Sprint-Ereignisse und Velocity-Daten an die Anthropic-API gesendet. Keine Klarnamen, keine Personen-Daten eintragen.
            </p>
          </div>
          <div className="p-3 rounded" style={{ background: 'var(--green-light)', border: '1px solid var(--green-mid)' }}>
            <p className="text-xs font-medium mb-1" style={{ color: 'var(--green-dark)' }}>Team-Werkzeug</p>
            <p className="text-xs" style={{ color: 'var(--ink)' }}>
              Velocity-Daten gehören dem Team. Kein Management-Export. Betriebsrat informieren, wenn unklar ob Mitbestimmung nach BetrVG §87 greift.
            </p>
          </div>
        </div>
        <button onClick={onAccept} className="w-full py-2 rounded text-sm font-medium text-white"
                style={{ background: 'var(--green-dark)' }}>
          Verstanden — weiter
        </button>
      </div>
    </div>
  );
}

function GoodhartBanner({ note }) {
  return (
    <div className="mb-5 p-4 rounded-lg" style={{ background: 'var(--amber-light)', border: '1px solid var(--amber)' }}>
      <p className="text-xs font-medium mb-1" style={{ color: 'var(--amber)' }}>Muster-Hinweis (Goodhart)</p>
      <p className="text-sm" style={{ color: 'var(--ink)' }}>{note}</p>
    </div>
  );
}

function SavedScreen({ sprintNumber, onNext }) {
  return (
    <div className="p-8 rounded-xl text-center" style={{ background: '#fff', border: '1px solid var(--rule)' }}>
      <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center"
           style={{ background: 'var(--green-light)' }}>
        <span className="text-xl">✓</span>
      </div>
      <p className="text-base font-semibold mb-1" style={{ color: 'var(--ink)' }}>
        Sprint {sprintNumber} gespeichert
      </p>
      <p className="text-sm mb-6" style={{ color: 'var(--ink-soft)' }}>
        Die Daten sind lokal gespeichert.
      </p>
      <button onClick={onNext} className="py-2 px-6 rounded text-sm font-medium text-white"
              style={{ background: 'var(--green-dark)' }}>
        Nächsten Sprint starten →
      </button>
    </div>
  );
}

const TABS = [
  { key: 'log', label: 'Sprint-Log' },
  { key: 'chart', label: 'Verlauf' },
  { key: 'sm', label: 'SM-Ansicht' }
];

export default function App() {
  const { sprints, upsert } = useSprintStorage();
  const { output, loading, error, stream } = useAnthropicStream();

  const [showPrivacy, setShowPrivacy] = useState(false);
  const [tab, setTab] = useState('log');
  const [phase, setPhase] = useState(0);
  const [currentSprint, setCurrentSprint] = useState(null);
  const [assessment, setAssessment] = useState({ primaryCause: '', controllable: null, learningNote: '' });
  const [hypotheses, setHypotheses] = useState([]);
  const [goodhartNote, setGoodhartNote] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(PRIVACY_KEY)) setShowPrivacy(true);
  }, []);

  useEffect(() => {
    if (currentSprint !== null) return;
    const nextNumber = sprints.length > 0 ? Math.max(...sprints.map(s => s.sprintNumber)) + 1 : 1;
    setCurrentSprint(createEmptySprint(nextNumber));
  }, [sprints, currentSprint]);

  useEffect(() => {
    if (!output) return;
    const parsed = parseHypotheses(output);
    if (parsed.hypotheses.length > 0) {
      setHypotheses(parsed.hypotheses);
      setGoodhartNote(parsed.goodhartNote);
    }
  }, [output]);

  const goodhart = detectGoodhart(sprints);

  function handlePrivacyAccept() {
    localStorage.setItem(PRIVACY_KEY, '1');
    setShowPrivacy(false);
  }

  function handleGenerate() {
    if (!currentSprint) return;
    const sprintWithAssessment = { ...currentSprint, teamAssessment: assessment };
    setCurrentSprint(sprintWithAssessment);
    setHypotheses([]);
    setGoodhartNote('');
    setPhase(2);
    const previous = sprints.filter(s => s.sprintNumber < sprintWithAssessment.sprintNumber);
    const { systemPrompt, userContent } = buildHypothesisPrompt(sprintWithAssessment, previous);
    stream(systemPrompt, userContent);
  }

  function handleVerdictChange(idx, verdict) {
    setHypotheses(prev => prev.map((h, i) => i === idx ? { ...h, teamVerdict: verdict } : h));
  }

  function handleSaveSprint() {
    if (!currentSprint) return;
    upsert({
      ...currentSprint,
      teamAssessment: assessment,
      kiHypotheses: {
        generated: hypotheses.length > 0,
        hypotheses,
        goodhartWarning: !!goodhartNote,
        goodhartNote
      }
    });
    setSaved(true);
  }

  function handleNewSprint() {
    const nextNumber = sprints.length > 0 ? Math.max(...sprints.map(s => s.sprintNumber)) + 1 : 1;
    setCurrentSprint(createEmptySprint(nextNumber));
    setAssessment({ primaryCause: '', controllable: null, learningNote: '' });
    setHypotheses([]);
    setGoodhartNote('');
    setPhase(0);
    setSaved(false);
    setTab('log');
  }

  return (
    <>
      {showPrivacy && <PrivacyModal onAccept={handlePrivacyAccept} />}

      <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
        <header className="px-4 pt-5 pb-1 max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div>
              <a href="../../index.html" style={{ fontFamily: 'var(--mono)', fontSize: '11px', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-faint)', textDecoration: 'none', display: 'block', marginBottom: '2px' }}>← Startseite</a>
              <h1 className="text-lg font-bold leading-tight" style={{ color: 'var(--ink)' }}>
                Velocity Lens
              </h1>
              <p className="text-xs" style={{ color: 'var(--ink-faint)' }}>
                Velocity-Reflexion für Scrum-Teams
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ApiKeySetup />
              {currentSprint && !saved && (
                <span className="text-xs px-3 py-1 rounded-full font-medium"
                      style={{ background: 'var(--green-light)', color: 'var(--green-dark)', border: '1px solid var(--green-mid)' }}>
                  Sprint {currentSprint.sprintNumber}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-1">
            {TABS.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                      className="text-xs py-1.5 px-3 rounded font-medium"
                      style={{
                        background: tab === t.key ? 'var(--green-dark)' : '#fff',
                        color: tab === t.key ? '#fff' : 'var(--ink-soft)',
                        border: `1px solid ${tab === t.key ? 'var(--green-dark)' : 'var(--rule)'}`
                      }}>
                {t.label}
              </button>
            ))}
          </div>
        </header>

        <main className="px-4 pt-5 pb-12 max-w-2xl mx-auto">

          {tab === 'log' && (
            <div>
              {goodhart.detected && <GoodhartBanner note={goodhart.note} />}

              {saved ? (
                <SavedScreen sprintNumber={currentSprint?.sprintNumber} onNext={handleNewSprint} />
              ) : (
                <>
                  {phase === 0 && currentSprint && (
                    <SprintLog
                      sprint={currentSprint}
                      onChange={setCurrentSprint}
                      onNext={() => setPhase(1)}
                    />
                  )}

                  {phase === 1 && (
                    <div>
                      <button onClick={() => setPhase(0)}
                              className="text-xs mb-4 inline-block"
                              style={{ color: 'var(--ink-faint)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                        ← Zurück zum Log
                      </button>
                      <TeamAssessment
                        data={assessment}
                        onChange={setAssessment}
                        onGenerate={handleGenerate}
                        loading={loading}
                        error={error}
                      />
                    </div>
                  )}

                  {phase === 2 && (
                    <div>
                      <HypothesisPanel
                        output={output}
                        loading={loading}
                        hypotheses={hypotheses}
                        goodhartNote={goodhartNote}
                        onVerdictChange={handleVerdictChange}
                      />
                      {!loading && (hypotheses.length > 0 || output) && (
                        <div className="mt-6 flex justify-end">
                          <button onClick={handleSaveSprint}
                                  className="py-2 px-6 rounded text-sm font-medium text-white"
                                  style={{ background: 'var(--green-dark)' }}>
                            Sprint speichern →
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {tab === 'chart' && (
            <div>
              <div className="mb-5">
                <h2 className="text-xl font-semibold mb-1" style={{ color: 'var(--ink)' }}>Velocity-Verlauf</h2>
                <p className="text-sm" style={{ color: 'var(--ink-soft)' }}>Committed vs. Delivered — gespeicherte Sprints</p>
              </div>
              <VelocityChart sprints={sprints} />
              {sprints.length > 0 && (
                <div className="mt-6 space-y-3">
                  {[...sprints].reverse().map(s => (
                    <div key={s.id} className="p-4 rounded-lg" style={{ background: '#fff', border: '1px solid var(--rule)' }}>
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-sm font-medium" style={{ color: 'var(--ink)' }}>Sprint {s.sprintNumber}</p>
                        <p className="text-xs" style={{ color: 'var(--ink-faint)' }}>{s.date}</p>
                      </div>
                      <p className="text-xs mb-1" style={{ color: 'var(--ink-soft)' }}>
                        {s.velocity.committed} committed → {s.velocity.delivered} delivered
                        {s.velocity.committed && s.velocity.delivered && (
                          <span style={{
                            color: Number(s.velocity.committed) - Number(s.velocity.delivered) > 0
                              ? 'var(--amber)' : 'var(--green-dark)'
                          }}>
                            {' '}(Δ {Math.abs(Number(s.velocity.committed) - Number(s.velocity.delivered))} SP)
                          </span>
                        )}
                      </p>
                      {s.teamAssessment?.primaryCause && (
                        <p className="text-xs" style={{ color: 'var(--ink-faint)' }}>
                          Team: {s.teamAssessment.primaryCause}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'sm' && (
            <SMView sprints={sprints} onBack={() => setTab('log')} />
          )}
        </main>
        <footer style={{ borderTop: '1px solid var(--rule)', padding: '16px 24px', fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '.08em', color: 'var(--ink-faint)', lineHeight: '1.8' }}>
          Scrum AI Toolkit · Yvonne Pöppelbaum · Version 1.0 · Mai 2026<br />
          Lizenz: <a href="https://creativecommons.org/licenses/by/4.0/deed.de" style={{ color: 'var(--ink-faint)' }}>CC BY 4.0</a> · Nutzung und Weitergabe erlaubt mit Namensnennung.<br />
          Kontakt: Yvonne Pöppelbaum, Hamburg · <a href="https://github.com/poeppi" style={{ color: 'var(--ink-faint)' }}>github.com/poeppi</a> · <a href="../../impressum.html" style={{ color: 'var(--ink-faint)' }}>Impressum</a>
        </footer>
      </div>
    </>
  );
}
