export function createEmptySprint(sprintNumber = 1) {
  return {
    id: crypto.randomUUID(),
    sprintNumber,
    teamName: "",
    date: new Date().toISOString().split("T")[0],
    format: "4L",

    safetyCheck: {
      scores: [null, null, null],
      score: null,
      belowThreshold: false,
      skipped: false
    },

    actionReview: {
      previousAction: "",
      previousSuccessCriterion: "",
      implemented: null,
      blockers: "",
      insight: ""
    },

    teamObservations: {
      wentWell: "",
      wentBadly: "",
      impediments: ""
    },

    selectedQuestion: {
      category: null,
      question: null,
      teamResponse: ""
    },

    actionCommit: {
      action: "",
      successCriterion: "",
      owner: "Team"
    },

    kiMirror: {
      activated: false,
      patterns: "",
      teamResponse: ""
    }
  };
}

export const FORMAT_LABELS = {
  "4L":       "4L (Liked / Learned / Lacked / Longed For)",
  "SSC":      "Start – Stop – Continue",
  "MSG":      "Mad – Sad – Glad",
  "Sailboat": "Sailboat"
};

export const FORMAT_FIELDS = {
  "4L":       ["Liked (was gut lief)", "Learned (was wir gelernt haben)", "Lacked (was fehlte)", "Longed For (was wir uns wünschen)"],
  "SSC":      ["Start (was wir anfangen sollten)", "Stop (was wir aufhören sollten)", "Continue (was wir beibehalten sollten)"],
  "MSG":      ["Mad (was uns geärgert hat)", "Sad (was uns betrübt hat)", "Glad (was uns gefreut hat)"],
  "Sailboat": ["Wind (was uns antreibt)", "Anker (was uns bremst)", "Riffe (Risiken)", "Insel (das Ziel)"]
};

export const FORMAT_KEYS = {
  "4L":       ["liked", "learned", "lacked", "longedFor"],
  "SSC":      ["start", "stop", "continue"],
  "MSG":      ["mad", "sad", "glad"],
  "Sailboat": ["wind", "anker", "riffe", "insel"]
};
