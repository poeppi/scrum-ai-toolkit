export function createEmptySprint(number) {
  return {
    id: crypto.randomUUID(),
    sprintNumber: number,
    date: new Date().toISOString().split('T')[0],
    velocity: { committed: '', delivered: '' },
    events: [],
    teamAssessment: { primaryCause: '', controllable: null, learningNote: '' },
    kiHypotheses: { generated: false, hypotheses: [], goodhartWarning: false, goodhartNote: '' }
  };
}

export function createEmptyEvent() {
  return {
    id: crypto.randomUUID(),
    type: null,
    description: '',
    estimatedImpact: 'mittel',
    plannedOrUnplanned: 'ungeplant'
  };
}

export function detectGoodhart(sprints) {
  if (sprints.length < 3) return { detected: false };
  const recent = sprints.slice(-4);

  // Pattern 1: Velocity steigt über ≥3 Sprints, Ereignisse stagnieren/sinken
  const velocities = recent.map(s => Number(s.velocity.delivered) || 0);
  const rising = velocities.every((v, i) => i === 0 || v >= velocities[i - 1]);
  const eventCounts = recent.map(s => s.events.length);
  const eventsNotRising = eventCounts[eventCounts.length - 1] <= eventCounts[0];

  if (rising && eventsNotRising && recent.length >= 3) {
    return {
      detected: true,
      note: 'Eure Velocity steigt, aber die dokumentierten Ereignisse nehmen nicht zu. Das kann viele Ursachen haben — manchmal deutet es darauf hin, dass Story Points angepasst werden, um die Velocity stabil zu halten. Das wäre kein Fehler, aber es lohnt sich, es explizit zu besprechen.'
    };
  }

  // Pattern 2: Committed = Delivered für 4+ Sprints
  const perfectSprints = recent.filter(s =>
    s.velocity.committed && s.velocity.delivered &&
    String(s.velocity.committed) === String(s.velocity.delivered)
  ).length;

  if (perfectSprints >= 4) {
    return {
      detected: true,
      note: '4 Sprints in Folge: Committed = Delivered. Das kann echte Planungsqualität sein — es kann aber auch bedeuten, dass Scope angepasst wird, um das Ziel zu erreichen. Eine ehrliche Retrospektive dazu lohnt sich.'
    };
  }

  return { detected: false };
}
