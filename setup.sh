#!/bin/bash
set -e

echo ""
echo "Scrum AI Toolkit — Setup"
echo "========================"
echo ""

# Node.js prüfen
if ! command -v node &> /dev/null; then
  echo "FEHLER: Node.js ist nicht installiert."
  echo "Bitte zuerst Node.js installieren: https://nodejs.org (Version 18+)"
  exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo "FEHLER: Node.js Version 18 oder höher erforderlich (aktuell: $(node -v))"
  exit 1
fi

echo "Node.js $(node -v) gefunden."
echo ""

TOOLS=("retromirror" "story-question-engine" "impediment-radar" "velocity-lens")
TOOL_NAMES=("RetroMirror" "Story Question Engine" "ImpedimentRadar" "VelocityLens")

# Für jedes Tool: npm install + .env.local + npm run build
for i in "${!TOOLS[@]}"; do
  DIR="${TOOLS[$i]}"
  NAME="${TOOL_NAMES[$i]}"

  echo "──────────────────────────────"
  echo "  $NAME"
  echo "──────────────────────────────"

  if [ ! -d "$DIR" ]; then
    echo "FEHLER: Ordner '$DIR' nicht gefunden."
    exit 1
  fi

  cd "$DIR"

  echo "  npm install..."
  npm install --silent

  # .env.local anlegen wenn noch nicht vorhanden
  if [ ! -f ".env.local" ]; then
    if [ -f ".env.local.example" ]; then
      cp .env.local.example .env.local
      echo "  .env.local angelegt (API-Key noch eintragen)"
    fi
  else
    echo "  .env.local bereits vorhanden"
  fi

  echo "  npm run build..."
  npm run build --silent

  echo "  Fertig."
  echo ""

  cd ..
done

echo "══════════════════════════════"
echo "  Setup abgeschlossen."
echo "══════════════════════════════"
echo ""
echo "Nächster Schritt: API-Key eintragen"
echo ""
echo "In jeder dieser Dateien den Anthropic-API-Key eintragen:"
for DIR in "${TOOLS[@]}"; do
  echo "  $DIR/.env.local"
done
echo ""
echo "Format: VITE_ANTHROPIC_API_KEY=sk-ant-..."
echo ""
echo "Dann neu bauen:"
echo "  ./setup.sh"
echo ""
echo "WICHTIG: Die Tools nur lokal betreiben."
echo "Den dist/-Ordner niemals auf einen öffentlichen Server hochladen."
echo "Der API-Key ist im JavaScript-Bundle sichtbar."
echo ""
echo "Alternative ohne .env.local: API-Key direkt im Browser eingeben."
echo "Oben rechts in jedem Tool auf 'API-Key einrichten' klicken."
echo "Der Key wird nur für diese Browser-Session gespeichert."
echo ""
echo "Starten: python3 -m http.server 8080"
echo "Dann im Browser: http://localhost:8080"
echo ""
