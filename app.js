
let soundOn = JSON.parse(localStorage.getItem("hm_sound") || "true");

const audioCorrect = new Audio("https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg");
const audioWrong = new Audio("https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg");
const audioWin = new Audio("https://actions.google.com/sounds/v1/cartoon/ta_da.ogg");

function playSound(a){
  if(soundOn) a.play().catch(()=>{});
}

const $ = (id) => document.getElementById(id);

const WORD_BANKS = {
  mixed: [
    { w: "PYTHON", h: "Popular programming language" },
    { w: "ALGORITHM", h: "Step-by-step procedure" },
    { w: "RECURSION", h: "Function calls itself" },
    { w: "HEURISTIC", h: "Helpful estimate to guide search" },
    { w: "THE DARK KNIGHT", h: "Batman vs Joker" }
  ],
  cs: [
    { w: "BINARY SEARCH", h: "Divide and conquer lookup" },
    { w: "HASH TABLE", h: "Key-value structure" },
    { w: "GRAPH THEORY", h: "Nodes and edges" },
    { w: "DYNAMIC PROGRAMMING", h: "Overlapping subproblems" }
  ],
  movies: [
    { w: "INTERSTELLAR", h: "Space + time" },
    { w: "INCEPTION", h: "Dream within a dream" },
    { w: "AVATAR", h: "Pandora" },
    { w: "JURASSIC PARK", h: "Dinosaurs return" }
  ]
};




const keys = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const kb = $("keyboard");
const wordBox = $("word");

const parts = [
  $("h-head"),
  $("h-body"),
  $("h-larm"),
  $("h-rarm"),
  $("h-lleg"),
  $("h-rleg"),
];

const toastEl = $("toast");
const toastTagEl = $("toastTag");
const toastTextEl = $("toastText");
let toastTimer = null;

function showToast(tag, text){
  toastTagEl.textContent = tag;
  toastTextEl.textContent = text;
  toastEl.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("show"), 1600);
}

let answer = "";
let hint = "";
let revealed = new Set();
let wrong = new Set();

let livesMax = 6;
let lives = 6;

let roundLocked = false;

let score = Number(localStorage.getItem("hm_score") || 0);
let streak = Number(localStorage.getItem("hm_streak") || 0);

function setDifficulty(){
  const v = $("difficulty")?.value || "normal";
  livesMax = (v === "easy") ? 8 : (v === "hard") ? 5 : 6;
}


function getCategoryWords(){
  const c = $("category")?.value || "mixed";
  return WORD_BANKS[c] || WORD_BANKS.mixed;
}

function pickWord(){
  setDifficulty();
  roundLocked = false;
  wrong = new Set();
  lives = livesMax;
  parts.forEach(p => p.style.opacity = "0");

  const custom = (window.__HM_CUSTOM__ || "").trim();
  if(custom){
    answer = custom;
    hint = "Custom word";
    window.__HM_CUSTOM__ = "";
    return;
  }
  const pool = getCategoryWords();
  const item = pool[Math.floor(Math.random()*pool.length)];
  answer = item.w;
  hint = item.h;
  revealed = new Set();
}

function renderWord(){
  wordBox.innerHTML = "";
  for(const ch of answer){
    const slot = document.createElement("div");
    slot.className = "slot" + (ch === " " ? " space" : "");
    slot.textContent = (ch === " ") ? "" : (revealed.has(ch) ? ch : "");
    wordBox.appendChild(slot);
  }
}

function drawHangman(){
  const shown = livesMax - lives;
  parts.forEach((p,i) => p.style.opacity = (i < shown ? "1" : "0"));
  const frac = livesMax ? (lives / livesMax) : 0;
  $("lifeBar").style.transform = `scaleX(${Math.max(0, Math.min(1, frac))})`;
}

function isWin(){
  for(const ch of answer){
    if(ch === " ") continue;
    if(!revealed.has(ch)) return false;
  }
  return true;
}

function lockKeyboard(){
  roundLocked = true;
  $("hangmanSvg").classList.add("shake");
  kb.querySelectorAll("button").forEach(b => b.disabled = true);
}

function updateHud(){
  $("pillLives").textContent = `Lives: ${lives}`;
  $("pillWrong").textContent = wrong.size ? `Wrong: ${[...wrong].join(", ")}` : "Wrong: —";
  $("pillScore").textContent = `Score: ${score}`;
  $("pillStreak").textContent = `Streak: ${streak}`;
  drawHangman();
}

function handler(k, btn){
  if(roundLocked) return;

  if(answer.includes(k)){
    revealed.add(k);
    score += 10;
    $("status").textContent = `Correct: ${k}`;
    showToast("Correct", `${k} is in the word`);
  }else{
    wrong.add(k);
    lives -= 1;
    score = Math.max(0, score - 2);
    $("status").textContent = `Wrong: ${k}`;
    showToast("Wrong", `${k} is not in the word`);
  }

  btn.disabled = true;
  if(answer.includes(k)) btn.classList.add("good");
  else btn.classList.add("bad");

  renderWord();
  updateHud();

  if(isWin()){
    streak += 1;
    score += 25;
    localStorage.setItem("hm_score", String(score));
    localStorage.setItem("hm_streak", String(streak));
    $("status").textContent = `You Win 🎉 Answer: ${answer}`;
    showToast("Win", "Nice! +25 bonus");
    lockKeyboard();
  }

  if(lives <= 0){
    parts.forEach(p => p.style.opacity = "1");
    streak = 0;
    localStorage.setItem("hm_score", String(score));
    localStorage.setItem("hm_streak", String(streak));
    $("status").textContent = `Game Over 💀 Answer: ${answer}`;
    showToast("Lose", "Streak reset");
    lockKeyboard();
  }
}

function renderKeyboard(){
  kb.innerHTML = "";
  keys.forEach((k) => {
    const b = document.createElement("button");
    b.className = "key";
    b.textContent = k;
    b.addEventListener("click", () => handler(k, b));
    kb.appendChild(b);
  });
}

function startRound(message){
  pickWord();
  renderWord();
  renderKeyboard();
  $("hangmanSvg").classList.remove("shake");
  $("status").textContent = message || "Pick a letter.";
  $("hintLine").textContent = "";
  updateHud();
}

$("btnNew").addEventListener("click", () => {
  localStorage.setItem("hm_score", String(score));
  localStorage.setItem("hm_streak", String(streak));
  startRound("New game started.");
  showToast("New", "New game started");
});

$("btnHint").addEventListener("click", () => {
  if(roundLocked) return;
  if(lives <= 1){ showToast("Hint", "Need at least 2 lives"); return; }
  lives -= 1;
  $("hintLine").textContent = `Hint: ${hint}`;
  updateHud();
  showToast("Hint", "Hint shown (-1 life)");
  if(lives <= 0){
    parts.forEach(p => p.style.opacity = "1");
    streak = 0;
    localStorage.setItem("hm_score", String(score));
    localStorage.setItem("hm_streak", String(streak));
    $("status").textContent = `Game Over 💀 Answer: ${answer}`;
    lockKeyboard();
  }
});

$("btnReveal").addEventListener("click", () => {
  for(const ch of answer){ if(ch !== " ") revealed.add(ch); }
  renderWord();
  $("status").textContent = `Revealed! Answer: ${answer}`;
  showToast("Reveal", "Answer revealed");
  lockKeyboard();
});

$("category").addEventListener("change", () => {
  startRound("Category changed. New word loaded.");
  showToast("Mode", "Category updated");
});

$("difficulty").addEventListener("change", () => {
  startRound("Difficulty changed. New word loaded.");
  showToast("Mode", "Difficulty updated");
});

window.addEventListener("keydown", (e) => {
  const key = (e.key || "");
  if(key === "Enter"){ $("btnNew").click(); return; }
  if(key === "Backspace"){ $("btnReveal").click(); return; }
  if(key.toLowerCase() === "h"){ $("btnHint").click(); return; }

  const k = key.toUpperCase();
  if(!/^[A-Z]$/.test(k)) return;

  const btn = [...kb.querySelectorAll("button")].find(b => b.textContent === k);
  if(btn && !btn.disabled) btn.click();
});



function openCustom(){
  const m = $("customModal");
  $("customMsg").textContent = "";
  $("customInput").value = "";
  m.classList.add("show");
  m.setAttribute("aria-hidden", "false");
  setTimeout(() => $("customInput").focus(), 50);
}
function closeCustom(){
  const m = $("customModal");
  m.classList.remove("show");
  m.setAttribute("aria-hidden", "true");
}
function normalizeCustomWord(raw){
  const w = (raw || "").toUpperCase().trim();
  if(!w) return { ok:false, msg:"Please type a word." };
  if(!/^[A-Z ]+$/.test(w)) return { ok:false, msg:"Use letters A–Z and spaces only." };
  if(w.replace(/ /g,"").length < 3) return { ok:false, msg:"Word too short (min 3 letters)." };
  return { ok:true, word:w };
}

function openHelp(){
  const m = $("helpModal");
  m.classList.add("show");
  m.setAttribute("aria-hidden", "false");
}
function closeHelp(){
  const m = $("helpModal");
  m.classList.remove("show");
  m.setAttribute("aria-hidden", "true");
}

$("btnHelp").addEventListener("click", openHelp);

$("btnCustom").addEventListener("click", openCustom);
$("btnCustomClose").addEventListener("click", closeCustom);
$("customModal").addEventListener("click", (e) => {
  if(e.target && e.target.id === "customModal") closeCustom();
});
$("btnCustomStart").addEventListener("click", () => {
  const res = normalizeCustomWord($("customInput").value);
  if(!res.ok){ $("customMsg").textContent = res.msg; return; }
  window.__HM_CUSTOM__ = res.word;
  closeCustom();
  startRound("Custom word loaded.");
  showToast("Custom", "Custom word started");
});

$("btnHelpClose").addEventListener("click", closeHelp);
$("btnHelpOk").addEventListener("click", closeHelp);
$("btnResetStats").addEventListener("click", () => {
  score = 0;
  streak = 0;
  localStorage.setItem("hm_score", "0");
  localStorage.setItem("hm_streak", "0");
  $("pillScore").textContent = "Score: 0";
  $("pillStreak").textContent = "Streak: 0";
  showToast("Reset", "Score & streak cleared");
});

$("helpModal").addEventListener("click", (e) => {
  if(e.target && e.target.id === "helpModal") closeHelp();
});

startRound("Pick a letter.");
