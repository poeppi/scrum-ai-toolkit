export function createImpediment(sprintNumber) {
  return {
    id: crypto.randomUUID(),
    sprintNumber,
    createdDate: new Date().toISOString().split('T')[0],
    description: '',
    type: null,
    typeConfidence: null,
    status: 'offen',
    resolvedDate: null,
    resolution: '',
    escalationNeeded: false,
    escalationNote: '',
    owner: 'Team'
  };
}
