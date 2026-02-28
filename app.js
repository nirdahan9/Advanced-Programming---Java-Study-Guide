import { TOPICS, QUESTIONS } from "./questions.js";

const $ = (id) => document.getElementById(id);

const countInput = $("countInput");
const shuffleInput = $("shuffleInput");
const startBtn = $("startBtn");
const startAllBtn = $("startAllBtn");
const quizPanel = $("quizPanel");
const summaryPanel = $("summaryPanel");
const progressEl = $("progress");
const questionEl = $("question");
const optionsEl = $("options");
const submitBtn = $("submitBtn");
const nextBtn = $("nextBtn");
const feedbackEl = $("feedback");
const scoreEl = $("score");
const weakEl = $("weak");
const restartBtn = $("restartBtn");

let session = [];
let index = 0;
let score = 0;
const wrongByTopic = new Map();

function getDirection(text) {
  return /[\u0590-\u05FF]/.test(String(text || "")) ? "rtl" : "ltr";
}

function applyDirection(el, text) {
  if (!el) return;
  el.setAttribute("dir", getDirection(text));
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function getCurrent() {
  return session[index] || null;
}

function renderQuestion() {
  const q = getCurrent();
  if (!q) {
    showSummary();
    return;
  }

  progressEl.textContent = `שאלה ${index + 1} מתוך ${session.length}`;
  questionEl.textContent = q.q;
  applyDirection(questionEl, q.q);
  feedbackEl.textContent = "";
  feedbackEl.className = "feedback";
  nextBtn.disabled = true;

  optionsEl.innerHTML = q.o
    .map((text, i) => {
      const letter = String.fromCharCode(65 + i);
      return `
        <label class="option">
          <input type="radio" name="answer" value="${letter}" />
          <strong>${letter})</strong>
          <span>${text}</span>
        </label>
      `;
    })
    .join("");

  const optionTexts = optionsEl.querySelectorAll(".option span");
  optionTexts.forEach((el, i) => applyDirection(el, q.o[i]));
}

function getSelected() {
  const node = optionsEl.querySelector('input[name="answer"]:checked');
  return node ? node.value : null;
}

function submitAnswer() {
  const q = getCurrent();
  if (!q) return;

  const selected = getSelected();
  if (!selected) return;

  const correct = selected === q.a;
  if (correct) {
    score += 1;
    feedbackEl.classList.add("ok");
    feedbackEl.textContent = `נכון ✅ | ${q.e}`;
    applyDirection(feedbackEl, q.e);
  } else {
    feedbackEl.classList.add("bad");
    feedbackEl.textContent = `לא נכון ❌ | תשובה נכונה: ${q.a}. ${q.e}`;
    applyDirection(feedbackEl, q.e);
    const key = TOPICS[q.t];
    wrongByTopic.set(key, (wrongByTopic.get(key) || 0) + 1);
  }

  nextBtn.disabled = false;
}

function nextQuestion() {
  index += 1;
  renderQuestion();
}

function showSummary() {
  quizPanel.classList.add("hidden");
  summaryPanel.classList.remove("hidden");
  scoreEl.textContent = `ציון: ${score}/${session.length}`;

  if (!wrongByTopic.size) {
    weakEl.textContent = "מעולה. אין נושאים חלשים בסשן הזה.";
    return;
  }

  const rows = [...wrongByTopic.entries()].sort((a, b) => b[1] - a[1]);
  weakEl.innerHTML =
    "כדאי לחזור על הנושאים:<ul>" +
    rows
      .map(([topic, c]) => `<li dir="${getDirection(topic)}">${topic} (${c})</li>`)
      .join("") +
    "</ul>";
}

function startQuiz() {
  const requested = Number(countInput.value) || 20;
  const count = Math.max(1, Math.min(QUESTIONS.length, requested));

  session = [...QUESTIONS];
  if (shuffleInput.checked) shuffle(session);
  session = session.slice(0, count);

  index = 0;
  score = 0;
  wrongByTopic.clear();

  summaryPanel.classList.add("hidden");
  quizPanel.classList.remove("hidden");
  renderQuestion();
}

startBtn.addEventListener("click", startQuiz);
startAllBtn.addEventListener("click", () => {
  countInput.value = QUESTIONS.length;
  startQuiz();
});
submitBtn.addEventListener("click", submitAnswer);
nextBtn.addEventListener("click", nextQuestion);
restartBtn.addEventListener("click", startQuiz);

startBtn.textContent = `התחל תרגול (${QUESTIONS.length} שאלות)`;
