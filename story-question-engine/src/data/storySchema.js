export function createEmptyStory() {
  return {
    id: crypto.randomUUID(),
    date: new Date().toISOString().split('T')[0],
    phase: null,

    story: {
      text: '',
      acceptanceCriteria: '',
      context: ''
    },

    teamHypothesis: {
      weakestPoint: '',
      estimatable: null
    },

    kiQuestion: {
      question: '',
      focusArea: null,
      reasoning: '',
      cargoCultWarning: null,
      rawOutput: ''
    },

    teamAnswer: {
      canAnswer: null,
      answerText: '',
      blockers: ''
    },

    verdict: {
      readiness: null,
      decidedBy: 'team',
      exportedTo: null
    }
  };
}

export const PHASE_LABELS = {
  discovery:       'Discovery (wir klären noch)',
  'planning-ready': 'Planning-ready (wir committen uns)'
};

export const ESTIMATABLE_LABELS = {
  true:    'Ja, wir könnten jetzt schätzen',
  false:   'Nein, noch zu unklar',
  unsure:  'Unsicher'
};
