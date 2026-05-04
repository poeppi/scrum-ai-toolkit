import { useState } from 'react';
import { PhaseSelector } from './components/PhaseSelector.jsx';
import { StoryInput } from './components/StoryInput.jsx';
import { TeamHypothesis } from './components/TeamHypothesis.jsx';
import { QuestionDisplay } from './components/QuestionDisplay.jsx';
import { TeamAnswer } from './components/TeamAnswer.jsx';
import { ReadinessVerdict } from './components/ReadinessVerdict.jsx';
import { StoryArchive } from './components/StoryArchive.jsx';
import { useStoryStorage } from './hooks/useStoryStorage.js';
import { useAnthropicStream } from './hooks/useAnthropicStream.js';
import { createEmptyStory } from './data/storySchema.js';
import { detectCargoCult } from './prompts/cargo-cult-detector.js';
import { buildQuestionPrompt, parseQuestionOutput } from './prompts/question-generator.js';
import { ApiKeySetup } from './components/ApiKeySetup.jsx';

const PHASES = ['Phase', 'Story', 'Team', 'Frage', 'Antwort', 'Ergebnis'];

export default function App() {
  const { stories, saveStory } = useStoryStorage();
  const { output, loading, error, stream } = useAnthropicStream();
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [story, setStory] = useState(() => createEmptyStory());
  const [copied, setCopied] = useState(false);
  const [questionReady, setQuestionReady] = useState(false);

  function updateStory(patch) {
    setStory(prev => ({ ...prev, ...patch }));
  }

  function goNext() {
    setStep(s => s + 1);
  }

  async function handleGenerate() {
    const warnings = detectCargoCult(story.story.acceptanceCriteria);
    const { systemPrompt, userContent } = buildQuestionPrompt(story, warnings);
    setQuestionReady(false);
    goNext();
    await stream(systemPrompt, userContent);
    setQuestionReady(true);
  }

  function handleQuestionNext() {
    const parsed = parseQuestionOutput(output);
    updateStory({ kiQuestion: parsed });
    goNext();
  }

  function handleVerdictNext() {
    const readiness = story.teamAnswer.canAnswer ? 'planning-ready' : 'needs-work';
    const finalStory = { ...story, verdict: { readiness, decidedBy: 'team', exportedTo: null } };
    setStory(finalStory);
    saveStory(finalStory);
    goNext();
  }

  function handleExport() {
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  function handleNew() {
    setStory(createEmptyStory());
    setStep(0);
    setCopied(false);
    setQuestionReady(false);
  }

  if (archiveOpen) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
        <Header onArchive={() => setArchiveOpen(false)} archiveOpen />
        <main className="max-w-2xl mx-auto px-6 py-8">
          <StoryArchive stories={stories} onBack={() => setArchiveOpen(false)} />
        </main>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Header onArchive={() => setArchiveOpen(true)} archiveOpen={false} count={stories.length} />
      <main className="max-w-2xl mx-auto px-6 py-8">
        {step > 0 && step < 5 && <StepNav steps={PHASES} current={step} />}

        <div className={step > 0 ? 'mt-6' : ''}>
          {step === 0 && (
            <PhaseSelector
              value={story.phase}
              onChange={phase => updateStory({ phase })}
              onNext={goNext}
            />
          )}
          {step === 1 && (
            <StoryInput
              data={story.story}
              phase={story.phase}
              onChange={d => updateStory({ story: d })}
              onNext={goNext}
            />
          )}
          {step === 2 && (
            <TeamHypothesis
              data={story.teamHypothesis}
              onChange={d => updateStory({ teamHypothesis: d })}
              onGenerate={handleGenerate}
              loading={loading}
              error={error}
            />
          )}
          {step === 3 && (
            <QuestionDisplay
              kiQuestion={loading ? { question: '' } : parseQuestionOutput(output)}
              loading={loading}
              onNext={handleQuestionNext}
            />
          )}
          {step === 4 && (
            <TeamAnswer
              data={story.teamAnswer}
              onChange={d => updateStory({ teamAnswer: d })}
              kiQuestion={story.kiQuestion.question ? story.kiQuestion : parseQuestionOutput(output)}
              onNext={handleVerdictNext}
            />
          )}
          {step === 5 && (
            <ReadinessVerdict
              story={story}
              onExport={handleExport}
              onNew={handleNew}
              copied={copied}
            />
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

function Header({ onArchive, archiveOpen, count }) {
  return (
    <header className="flex items-center justify-between px-6 py-3"
            style={{ borderBottom: '1px solid var(--rule)', background: '#fff' }}>
      <div className="flex items-center gap-3">
        <a href="../../index.html" style={{ fontFamily: 'var(--mono)', fontSize: '11px', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-faint)', textDecoration: 'none' }}>← Startseite</a>
        <span className="font-semibold text-base" style={{ color: 'var(--ink)' }}>
          Story Question Engine
        </span>
      </div>
      <ApiKeySetup />
      <button
        onClick={onArchive}
        className="text-xs py-1 px-3 rounded"
        style={{ border: '1px solid var(--rule)', color: 'var(--ink-faint)', background: 'transparent' }}
      >
        {archiveOpen ? '← Zurück' : `Verlauf${count ? ` (${count})` : ''}`}
      </button>
    </header>
  );
}

function StepNav({ steps, current }) {
  const visible = steps.slice(1);
  const visibleCurrent = current - 1;
  return (
    <div className="flex items-center">
      {visible.map((name, idx) => (
        <div key={idx} className="flex items-center">
          <div className="flex flex-col items-center">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium"
                 style={{
                   background: idx < visibleCurrent ? 'var(--green-dark)' : idx === visibleCurrent ? 'var(--green-mid)' : 'var(--rule)',
                   color: idx <= visibleCurrent ? '#fff' : 'var(--ink-faint)'
                 }}>
              {idx < visibleCurrent ? '✓' : idx + 1}
            </div>
            <span className="text-xs mt-1 hidden sm:block"
                  style={{ color: idx === visibleCurrent ? 'var(--ink)' : 'var(--ink-faint)' }}>
              {name}
            </span>
          </div>
          {idx < visible.length - 1 && (
            <div className="h-px flex-1 mx-1 mb-4"
                 style={{ background: idx < visibleCurrent ? 'var(--green-mid)' : 'var(--rule)', minWidth: '16px' }} />
          )}
        </div>
      ))}
    </div>
  );
}
