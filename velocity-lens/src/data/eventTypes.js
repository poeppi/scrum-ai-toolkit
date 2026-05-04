export const EVENT_TYPES = {
  kapazitaet: {
    label: 'Kapazität',
    examples: ['Krankheitsausfälle', 'Urlaub', 'Onboarding neues Mitglied', 'Teilzeit-Sprint'],
    color: 'var(--amber)',
    bg: 'var(--amber-light)'
  },
  scope: {
    label: 'Scope-Änderung',
    examples: ['Nachträgliche Anforderungsänderung', 'Emergency-Fix', 'Sprint-Ziel geändert'],
    color: 'var(--red-dark)',
    bg: 'var(--red-light)'
  },
  technisch: {
    label: 'Technische Störung',
    examples: ['Infrastruktur-Problem', 'Dependency-Blocking', 'Unerwartete Komplexität'],
    color: 'var(--blue-dark)',
    bg: 'var(--blue-light)'
  },
  schulden: {
    label: 'Technische Schulden',
    examples: ['Refactoring nötig', 'Legacy-Code-Problem', 'Security-Patch erzwungen'],
    color: '#7c3aed',
    bg: '#f5f3ff'
  },
  extern: {
    label: 'Externe Abhängigkeit',
    examples: ['Anderes Team geliefert / nicht geliefert', 'Stakeholder nicht verfügbar'],
    color: 'var(--ink-soft)',
    bg: '#f0ece8'
  },
  prozess: {
    label: 'Prozess-Overhead',
    examples: ['Review-Verzögerung', 'Ungeplante Meetings', 'Administrations-Last'],
    color: 'var(--green-mid)',
    bg: 'var(--green-light)'
  }
};

export const IMPACT_LABELS = { hoch: 'Hoch', mittel: 'Mittel', niedrig: 'Niedrig' };
export const PLANNING_LABELS = { geplant: 'Geplant', ungeplant: 'Ungeplant' };
export const CONFIDENCE_LABELS = { hoch: 'Hoch', mittel: 'Mittel', niedrig: 'Niedrig' };
