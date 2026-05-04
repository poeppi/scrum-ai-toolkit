const PATTERNS = [
  { re: /\b(schnell|fast|quick)\b(?! als \d)/gi, hint: 'vage Geschwindigkeitsangabe ohne Messgröße' },
  { re: /\beinfach\b/gi, hint: 'vage Aussage ohne Definition' },
  { re: /\bintuitiv\b/gi, hint: 'vage Usability-Aussage ohne Testkriterium' },
  { re: /\bbenutzerfreundlich\b/gi, hint: 'vage Usability-Aussage ohne Testkriterium' },
  { re: /\bangemessen\b/gi, hint: 'vage Qualitätsaussage ohne Schwellenwert' },
  { re: /\bzuverlässig\b(?! zu \d{1,3}%)/gi, hint: 'vage Zuverlässigkeitsaussage ohne SLA' },
  { re: /\bkorrekt\b(?! gemäß)/gi, hint: 'vage Korrektheitsaussage ohne Referenz' },
  { re: /\boptimal\b/gi, hint: 'vage Optimierungsaussage ohne Messgröße' },
];

export function detectCargoCult(acceptanceCriteria) {
  const lines = acceptanceCriteria.split('\n').filter(l => l.trim());
  const warnings = [];

  lines.forEach((line, idx) => {
    const hits = PATTERNS.filter(p => p.re.test(line)).map(p => p.hint);
    if (hits.length > 0) {
      warnings.push({ acNumber: idx + 1, text: line.trim(), hints: hits });
    }
    PATTERNS.forEach(p => p.re.lastIndex = 0);
  });

  return warnings;
}

export function formatCargoCultContext(warnings) {
  if (warnings.length === 0) return 'Keine offensichtlichen Cargo-Cult-Muster erkannt.';
  return warnings.map(w =>
    `AC ${w.acNumber}: "${w.text}" → ${w.hints.join(', ')}`
  ).join('\n');
}
