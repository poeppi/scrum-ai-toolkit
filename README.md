# Scrum AI Toolkit

Vier browserbasierte Werkzeuge für Scrum-Teams. KI unterstützt Reflexion; Entscheidungen trifft das Team.

**RetroMirror** — Retrospektiven strukturieren  
**Story Question Engine** — Refinements schärfen  
**ImpedimentRadar** — Impediments tracken  
**VelocityLens** — Velocity verstehen

Vollständige Einordnung, Grenzen und Risiken: [`einordnung.html`](einordnung.html)

---

## Schnellstart — kein Node.js nötig

Die Tools sind fertig gebaut (`dist/`-Ordner im Repo). Ihr braucht nur Python, das auf jedem Mac und den meisten Linux-Systemen vorinstalliert ist.

```bash
# 1. Repository klonen
git clone https://github.com/poeppi/scrum-ai-toolkit.git
cd scrum-ai-toolkit

# 2. Lokalen Server starten
python3 -m http.server 8080
```

Dann im Browser: `http://localhost:8080`

**API-Key einrichten:** Oben rechts in jedem Tool auf „API-Key einrichten" klicken. Der Key wird nur für diese Browser-Session gespeichert und beim Tab-Schließen automatisch gelöscht.

Anthropic-API-Key: [console.anthropic.com](https://console.anthropic.com) — vor der ersten Nutzung ein **Spending Limit** setzen (empfohlen: 10 USD/Monat).

---

## Setup mit Node.js (optional)

Wer den API-Key fest in den Build einbetten will (z. B. für Offline-Einsatz ohne Browser-Eingabe):

```bash
chmod +x setup.sh
./setup.sh
```

Das Skript installiert Abhängigkeiten und baut alle vier Tools. Danach in jeder `.env.local`-Datei den Key eintragen und `./setup.sh` erneut ausführen.

> **Achtung:** Ein in den Build eingebetteter Key ist im JavaScript-Bundle im Klartext lesbar. `dist/`-Ordner niemals auf öffentliche Server hochladen.

---

## Vor dem ersten Einsatz

Das **Pre-Start-Modul** (`scrum_ai_prestart.html`) enthält:

- Schmerz-Check: welches Tool zuerst
- Checkliste: Betriebsrat, Datenschutz, Team-Zustimmung
- Guardrails und Stopp-Regeln
- Vorlagen für Betriebsrat und Team

Bitte vor dem ersten Sprint-Einsatz durchlesen.

---

## Lizenz

[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) — Nutzung und Weitergabe erlaubt mit Namensnennung.

**Autorin:** Yvonne Pöppelbaum, Hamburg  
Learning Architect, Journalistin, Facilitatorin
