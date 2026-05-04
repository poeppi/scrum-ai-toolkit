export const IMPEDIMENT_TYPES = {
  technisch: {
    label: 'Technisch',
    description: 'Infrastruktur, Tools, Code, Abhängigkeiten',
    examples: ['CI-Pipeline down', 'API-Dokumentation fehlt', 'Lizenzen nicht verfügbar'],
    color: 'var(--blue-dark)',
    bg: 'var(--blue-light)'
  },
  prozessual: {
    label: 'Prozessual',
    description: 'Arbeitsabläufe, Genehmigungen, Entscheidungswege',
    examples: ['Review-Prozess zu lang', 'Entscheidung hängt seit 2 Sprints', 'Kein klarer Owner'],
    color: 'var(--amber)',
    bg: 'var(--amber-light)'
  },
  informational: {
    label: 'Information',
    description: 'Fehlende, widersprüchliche oder verspätete Information',
    examples: ['Anforderungen unklar', 'Stakeholder nicht erreichbar', 'Dokumentation veraltet'],
    color: '#7c3aed',
    bg: '#f5f3ff'
  },
  extern: {
    label: 'Extern',
    description: 'Außerhalb des Einflusses des Teams oder der Organisation',
    examples: ['Lieferant liefert nicht', 'Regulatorische Unsicherheit', 'Abhängigkeit von anderem Team'],
    color: 'var(--ink-soft)',
    bg: '#f0ece8'
  },
  ressource: {
    label: 'Ressource',
    description: 'Kapazität, Skills, Budget',
    examples: ['Schlüsselperson ausgefallen', 'Fehlende Fachkompetenz', 'Budget nicht freigegeben'],
    color: 'var(--red-dark)',
    bg: 'var(--red-light)'
  }
};

export const STATUS_LABELS = {
  offen:      { label: 'Offen',      color: 'var(--amber)',     bg: 'var(--amber-light)' },
  'in-arbeit':{ label: 'In Arbeit',  color: 'var(--blue-dark)', bg: 'var(--blue-light)'  },
  gelöst:     { label: 'Gelöst',     color: 'var(--green-mid)', bg: 'var(--green-light)' },
  akzeptiert: { label: 'Akzeptiert', color: 'var(--ink-faint)', bg: '#f0ece8'            }
};

export const OWNER_OPTIONS = ['Team', 'SM', 'PO', 'extern'];
