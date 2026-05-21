// ── TEMPORIZADOR DE ESCRITA ─────────────────────────
const POMODORO_MINS = 25;
const POMODORO_ROUNDS_KEY = "vereda:timer-rounds";

let pomodoroSecs   = POMODORO_MINS * 60;
let pomodoroActive = false;
let pomodoroTimer  = null;

function getPomodoroRounds() {
  try { return JSON.parse(localStorage.getItem(POMODORO_ROUNDS_KEY) || "[]"); }
  catch { return []; }
}

function savePomodoroRound() {
  const rounds = getPomodoroRounds();
  rounds.push({ completedAt: new Date().toISOString(), mins: POMODORO_MINS });
  // Guarda só os últimos 200 para não crescer sem limite
  if (rounds.length > 200) rounds.splice(0, rounds.length - 200);
  localStorage.setItem(POMODORO_ROUNDS_KEY, JSON.stringify(rounds));
}

function showPomodoroDone() {
  const total = getPomodoroRounds().length;
  const msg = total === 1
    ? "Primeira rodada concluída. Boa escrita."
    : `${total}ª rodada concluída. Continue assim.`;

  const el = document.createElement("div");
  el.className = "pomodoro-done-toast";
  el.textContent = msg;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add("is-visible"));
  setTimeout(() => {
    el.classList.remove("is-visible");
    setTimeout(() => el.remove(), 400);
  }, 4000);
}

function updatePomodoroDisplay() {
  const display = document.querySelector("[data-pomodoro-display]");
  const icon    = document.querySelector("[data-pomodoro-icon]");
  if (!display) return;
  const m = String(Math.floor(pomodoroSecs / 60)).padStart(2, "0");
  const s = String(pomodoroSecs % 60).padStart(2, "0");
  display.textContent = `${m}:${s}`;
  if (icon) icon.textContent = pomodoroActive ? "pause" : "timer";
  const container = document.querySelector("[data-pomodoro]");
  if (container) container.dataset.pomodoroActive = String(pomodoroActive);
}

function togglePomodoro() {
  pomodoroActive = !pomodoroActive;
  if (pomodoroActive) {
    pomodoroTimer = setInterval(() => {
      if (pomodoroSecs <= 0) {
        clearInterval(pomodoroTimer);
        pomodoroActive = false;
        pomodoroSecs = POMODORO_MINS * 60;
        savePomodoroRound();
        updatePomodoroDisplay();
        showPomodoroDone();
        shootConfetti();
        return;
      }
      pomodoroSecs--;
      updatePomodoroDisplay();
    }, 1000);
  } else {
    clearInterval(pomodoroTimer);
  }
  updatePomodoroDisplay();
}

function resetPomodoro() {
  clearInterval(pomodoroTimer);
  pomodoroActive = false;
  pomodoroSecs   = POMODORO_MINS * 60;
  updatePomodoroDisplay();
}
