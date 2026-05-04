import { useState } from 'react';
import { SprintReview } from './components/SprintReview.jsx';
import { ImpedimentInput } from './components/ImpedimentInput.jsx';
import { PatternView } from './components/PatternView.jsx';
import { SMView } from './components/SMView.jsx';
import { useImpedimentStorage } from './hooks/useImpedimentStorage.js';
import { STATUS_LABELS, IMPEDIMENT_TYPES } from './data/impedimentTypes.js';
import { ApiKeySetup } from './components/ApiKeySetup.jsx';

const SPRINT_KEY = 'radar_current_sprint';

function useCurrentSprint() {
  const [sprint, setSprint] = useState(() => {
    try { return parseInt(localStorage.getItem(SPRINT_KEY)) || 1; }
    catch { return 1; }
  });
  function set(n) {
    localStorage.setItem(SPRINT_KEY, String(n));
    setSprint(n);
  }
  return [sprint, set];
}

function usePrivacyAccepted() {
  const key = 'radar_privacy_accepted';
  const [ok, setOk] = useState(() => !!localStorage.getItem(key));
  function accept() { localStorage.setItem(key, '1'); setOk(true); }
  return [ok, accept];
}

const TABS = ['Einstieg', 'Erfassen', 'Muster'];

export default function App() {
  const [privacyOk, acceptPrivacy] = usePrivacyAccepted();
  const [currentSprint, setCurrentSprint] = useCurrentSprint();
  const { impediments, upsert, getAllSprints, getOpenFromSprint } = useImpedimentStorage();
  const [tab, setTab] = useState(1);
  const [smMode, setSMMode] = useState(false);
  const [reviewDone, setReviewDone] = useState(false);

  const openFromLast = getOpenFromSprint(currentSprint - 1);
  const allSprints = getAllSprints();

  function exportStats() {
    const typeCounts = Object.keys(IMPEDIMENT_TYPES).reduce((acc, t) => ({ ...acc, [t]: 0 }), {});
    impediments.forEach(i => { if (i.type && typeCounts[i.type] !== undefined) typeCounts[i.type]++; });
    const text = `ImpedimentRadar — Aggregierte Typ-Statistik
Stand: ${new Date().toLocaleDateString('de-DE')}
Sprints erfasst: ${allSprints.length}
Impediments gesamt: ${impediments.length}

${Object.entries(typeCounts).map(([t, c]) => `${IMPEDIMENT_TYPES[t].label}: ${c}`).join('\n')}

Hinweis: Nur erfasste Impediments sichtbar. Mündlich benannte fehlen strukturell.`;
    navigator.clipboard.writeText(text).catch(() => {});
  }

  if (!privacyOk) {
    return (
      <div className="fixed inset-0 flex items-center justify-center p-4"
           style={{ background: 'rgba(26,23,20,0.6)' }}>
        <div className="rounded-lg max-w-md w-full p-6 shadow-xl"
             style={{ background: '#fff', border: '1px solid var(--rule)' }}>
          <h2 className="font-semibold text-lg mb-3" style={{ color: 'var(--ink)' }}>Bevor ihr startet</h2>
          <ul className="text-sm space-y-2 mb-4" style={{ color: 'var(--ink-soft)' }}>
            <li>→ Daten bleiben auf diesem Gerät (localStorage)</li>
            <li>→ Kein Personenbezug wird gespeichert</li>
            <li>→ Kein automatischer Management-Export</li>
            <li>→ SM setzt Eskalations-Flag manuell — kein Automatismus</li>
          </ul>
          <p className="text-xs mb-4 p-3 rounded" style={{ background: 'var(--amber-light)', color: 'var(--amber)' }}>
            Bei Einsatz in einer Organisation: Betriebsrat sollte das Tool-Design vor Einführung prüfen (BetrVG §87 Abs. 1 Nr. 6).
          </p>
          <p className="text-xs mb-4" style={{ color: 'var(--ink-faint)' }}>DSGVO Art. 5 · BetrVG §87 Abs. 1 Nr. 6 · EU AI Act Anhang III</p>
          <button onClick={acceptPrivacy}
                  className="w-full py-2 rounded text-sm font-medium text-white"
                  style={{ background: 'var(--green-dark)' }}>
            Verstanden — weiter
          </button>
        </div>
      </div>
    );
  }

  if (smMode) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
        <Header currentSprint={currentSprint} onSM={() => setSMMode(false)} smMode />
        <main className="max-w-2xl mx-auto px-6 py-8">
          <SMView impediments={impediments} allSprints={allSprints} onBack={() => setSMMode(false)} />
        </main>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Header currentSprint={currentSprint} onSM={() => setSMMode(true)} smMode={false}
              onNextSprint={() => { setCurrentSprint(currentSprint + 1); setReviewDone(false); setTab(0); }}
              onExport={exportStats} />
      <main className="max-w-2xl mx-auto px-6 py-8">
        <TabNav tabs={TABS} current={tab} onChange={setTab} />
        <div className="mt-6">
          {tab === 0 && (
            reviewDone
              ? <DoneReview onAdd={() => setTab(1)} sprint={currentSprint} />
              : <SprintReview
                  openImpediments={openFromLast}
                  onUpdate={upsert}
                  onDone={() => setReviewDone(true)}
                />
          )}
          {tab === 1 && (
            <div className="space-y-6">
              <ImpedimentInput sprintNumber={currentSprint} onSave={upsert} />
              <ImpedimentList
                impediments={impediments.filter(i => i.sprintNumber === currentSprint)}
                onUpdate={upsert}
              />
            </div>
          )}
          {tab === 2 && (
            <PatternView impediments={impediments} allSprints={allSprints} />
          )}
        </div>
      </main>
      <footer style={{ borderTop: '1px solid var(--rule)', padding: '16px 24px', fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '.08em', color: 'var(--ink-faint)', lineHeight: '1.8' }}>
        Scrum AI Toolkit · Yvonne Pöppelbaum · Version 1.0 · Mai 2026<br />
        Lizenz: <a href="https://creativecommons.org/licenses/by/4.0/deed.de" style={{ color: 'var(--ink-faint)' }}>CC BY 4.0</a> · Nutzung und Weitergabe erlaubt mit Namensnennung.<br />
        Kontakt: Yvonne Pöppelbaum, Hamburg · <a href="https://github.com/poeppi" style={{ color: 'var(--ink-faint)' }}>github.com/poeppi</a> · <a href="../../impressum.html" style={{ color: 'var(--ink-faint)' }}>Impressum</a>
      </footer>
    </div>
  );
}

function Header({ currentSprint, onSM, smMode, onNextSprint, onExport }) {
  return (
    <header className="flex items-center justify-between px-6 py-3"
            style={{ borderBottom: '1px solid var(--rule)', background: '#fff' }}>
      <div className="flex items-center gap-3">
        <a href="../../index.html" style={{ fontFamily: 'var(--mono)', fontSize: '11px', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-faint)', textDecoration: 'none' }}>← Startseite</a>
        <span className="font-semibold text-base" style={{ color: 'var(--ink)' }}>ImpedimentRadar</span>
        <span className="text-xs px-2 py-0.5 rounded"
              style={{ background: 'var(--green-light)', color: 'var(--green-dark)' }}>
          Sprint {currentSprint}
        </span>
      </div>
      <div className="flex gap-2">
        <ApiKeySetup />
        {onExport && (
          <button onClick={onExport} className="text-xs py-1 px-3 rounded"
                  style={{ border: '1px solid var(--rule)', color: 'var(--ink-faint)', background: 'transparent' }}>
            Statistik kopieren
          </button>
        )}
        {onNextSprint && (
          <button onClick={onNextSprint} className="text-xs py-1 px-3 rounded"
                  style={{ border: '1px solid var(--green-mid)', color: 'var(--green-dark)', background: 'var(--green-light)' }}>
            Sprint {currentSprint + 1} →
          </button>
        )}
        <button onClick={onSM} className="text-xs py-1 px-3 rounded"
                style={{ border: '1px solid var(--rule)', color: 'var(--ink-faint)', background: 'transparent' }}>
          {smMode ? '← Zurück' : 'SM-Ansicht'}
        </button>
      </div>
    </header>
  );
}

function TabNav({ tabs, current, onChange }) {
  return (
    <div className="flex gap-0 border-b" style={{ borderColor: 'var(--rule)' }}>
      {tabs.map((t, i) => (
        <button key={i} onClick={() => onChange(i)}
                className="py-2 px-4 text-sm font-medium"
                style={{
                  color: current === i ? 'var(--ink)' : 'var(--ink-faint)',
                  borderBottom: current === i ? '2px solid var(--green-dark)' : '2px solid transparent',
                  background: 'transparent',
                  marginBottom: '-1px'
                }}>
          {t}
        </button>
      ))}
    </div>
  );
}

function DoneReview({ onAdd, sprint }) {
  return (
    <div className="py-8 text-center">
      <div className="inline-block px-6 py-4 rounded-xl mb-4"
           style={{ background: 'var(--green-light)', border: '1px solid var(--green-mid)' }}>
        <p className="text-sm font-medium" style={{ color: 'var(--green-dark)' }}>
          Einstiegs-Review für Sprint {sprint} abgeschlossen.
        </p>
      </div>
      <div className="flex justify-center">
        <button onClick={onAdd} className="py-2 px-6 rounded text-sm font-medium text-white"
                style={{ background: 'var(--green-dark)' }}>
          Neue Impediments erfassen →
        </button>
      </div>
    </div>
  );
}

function ImpedimentList({ impediments, onUpdate }) {
  if (impediments.length === 0) return null;

  return (
    <div>
      <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--ink)' }}>
        Diesen Sprint ({impediments.length})
      </h3>
      <div className="space-y-2">
        {impediments.map(imp => {
          const t = IMPEDIMENT_TYPES[imp.type];
          const s = STATUS_LABELS[imp.status];
          return (
            <div key={imp.id} className="p-3 rounded-lg" style={{ background: '#fff', border: '1px solid var(--rule)' }}>
              <div className="flex items-start gap-2 mb-2">
                {t && <span className="text-xs px-2 py-0.5 rounded shrink-0"
                             style={{ background: t.bg, color: t.color }}>{t.label}</span>}
                <p className="text-sm flex-1" style={{ color: 'var(--ink)' }}>{imp.description}</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                {Object.entries(STATUS_LABELS).map(([key, st]) => (
                  <button key={key}
                    onClick={() => onUpdate({ ...imp, status: key })}
                    className="text-xs py-0.5 px-2 rounded"
                    style={{
                      background: imp.status === key ? st.color : '#fff',
                      color: imp.status === key ? '#fff' : 'var(--ink-soft)',
                      border: `1px solid ${imp.status === key ? st.color : 'var(--rule)'}`
                    }}>
                    {st.label}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
