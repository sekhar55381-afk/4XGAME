* {
  box-sizing: border-box;
}

:root {
  --bg: #08111f;
  --panel: #101b2d;
  --panel-alt: #16253d;
  --border: #243751;
  --text: #edf5ff;
  --muted: #8ca3bf;
  --primary: #3b82f6;
  --primary-2: #2563eb;
  --success: #22c55e;
  --warning: #f59e0b;
  --danger: #ef4444;
  --shadow: 0 18px 40px rgba(9, 16, 30, 0.35);
}

body {
  margin: 0;
  font-family: Inter, Arial, sans-serif;
  background: linear-gradient(180deg, #050d18 0%, #111827 100%);
  color: var(--text);
}

button, input {
  font: inherit;
}

button {
  border: 0;
  border-radius: 12px;
  padding: 12px 14px;
  cursor: pointer;
  background: var(--primary);
  color: white;
  font-weight: 700;
  transition: transform 0.16s ease;
}

button:hover {
  transform: translateY(-1px);
}

button.secondary {
  background: #1f2937;
}

button.accent {
  background: #9333ea;
}

button.success {
  background: var(--success);
}

button.primary {
  background: var(--primary-2);
}

button.small-btn {
  padding: 8px 12px;
  font-size: 0.82rem;
}

input {
  width: 100%;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: #dfeaf8;
  color: #0f172a;
  padding: 12px 14px;
  margin-bottom: 10px;
}

.app-shell {
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px 18px 48px;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
}

.topbar h1 {
  font-size: clamp(2rem, 3vw, 2.9rem);
  margin: 4px 0 0;
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 0.74rem;
  color: #a5b4cf;
  margin: 0;
}

.wallet-box {
  min-width: 160px;
  background: rgba(59, 130, 246, 0.12);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 12px 18px;
  text-align: right;
  box-shadow: var(--shadow);
}

.wallet-box span {
  display: block;
  color: var(--muted);
  font-size: 0.7rem;
  text-transform: uppercase;
}

.layout {
  display: grid;
  grid-template-columns: 320px 1.3fr 1fr;
  gap: 18px;
}

.panel {
  background: rgba(16, 27, 45, 0.92);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 18px;
  box-shadow: var(--shadow);
}

.panel h2 {
  margin-top: 0;
}

.button-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.status-text,
.muted {
  color: var(--muted);
}

.room-create {
  display: grid;
  gap: 8px;
  margin-bottom: 12px;
}

.rooms-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 15px;
}

.room-card {
  background: var(--panel-alt);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 14px;
}

.room-card strong {
  font-size: 1.02rem;
}

.room-card .meta {
  color: var(--muted);
  font-size: 0.9rem;
  margin: 6px 0 10px;
}

.game-panel {
  min-height: 500px;
}

.room-meta {
  margin-bottom: 12px;
}

.game-message {
  background: rgba(148, 163, 184, 0.08);
  border: 1px solid var(--border);
  color: #dbeafe;
  border-radius: 12px;
  padding: 12px 14px;
  min-height: 52px;
  margin-bottom: 16px;
}

.players-board {
  display: grid;
  grid-template-columns: repeat(2, minmax(120px, 1fr));
  gap: 10px;
  margin-bottom: 18px;
}

.player-card {
  border: 1px solid var(--border);
  background: #0f1d31;
  border-radius: 14px;
  padding: 12px;
}

.player-card.active {
  border-color: var(--warning);
  box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.25);
}

.player-card .label {
  color: var(--muted);
  display: block;
  font-size: 0.75rem;
  margin-bottom: 4px;
}

.player-card .score {
  font-size: 2rem;
  font-weight: 800;
}

.controls {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 16px;
}

.dice-wrap {
  display: flex;
  justify-content: center;
  margin-top: 12px;
}

.dice-face {
  width: 120px;
  height: 120px;
  border-radius: 24px;
  background: linear-gradient(180deg, #f8fafc, #cbd5e1);
  color: #0f172a;
  display: grid;
  place-items: center;
  font-size: 3rem;
  font-weight: 800;
  box-shadow: inset 0 0 25px rgba(15, 23, 42, 0.15);
}

@media (max-width: 980px) {
  .layout {
    grid-template-columns: 1fr;
  }

  .topbar {
    flex-direction: column;
    align-items: flex-start;
  }
}
