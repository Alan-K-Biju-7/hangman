
let demoOn=false;
let demoQueue=[];
const dom={
  status:$("status"),
  pillLives:$("pillLives"),
  pillScore:$("pillScore"),
  pillStreak:$("pillStreak")
};
let audioReady=false;
function ensureAudio(){
  if(audioReady) return;
  [audioCorrect,audioWrong,audioWin].forEach(a=>a.load());
  audioReady=true;
}

let learningOn = false;


function runDemo(){
  if(!demoOn || demoQueue.length===0) return;
  const k=demoQueue.shift();
  const btn=[...kb.querySelectorAll("button")].find(b=>b.textContent===k);
  if(btn && !btn.disabled) btn.click();
  setTimeout(runDemo,700);
}

function buildDemo(){
  demoQueue=[];
  const uniq=[...new Set(answer.replace(/ /g,"").split(""))];
  uniq.slice(0,4).forEach(c=>demoQueue.push(c));
  "ZXQ".split("").forEach(c=>demoQueue.push(c));
}

function addLearnStep(text){
  if(!learningOn) return;
  const li=document.createElement("li");
  li.className="learnStep";
  li.textContent=text;
  $("learnSteps").appendChild(li);
}

let perfectWins = Number(localStorage.getItem("hm_perfect") || 0);

let bestScore = Number(localStorage.getItem("hm_best_score") || 0);

let bestTime = Number(localStorage.getItem("hm_best_time") || 0);

let gamesPlayed = Number(localStorage.getItem("hm_games") || 0);
let gamesWon = Number(localStorage.getItem("hm_wins") || 0);

let soundOn = JSON.parse(localStorage.getItem("hm_sound") || "true");

const audioCorrect = new Audio("https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg");
const audioWrong = new Audio("https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg");
const audioWin = new Audio("https://actions.google.com/sounds/v1/cartoon/ta_da.ogg");

function playSound(a){ ensureAudio();
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




const qwertyRows = ["QWERTYUIOP","ASDFGHJKL","ZXCVBNM"];
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


let t0 = 0;
let timerId = null;

function tickTimer(){
  const sec = Math.floor((Date.now() - t0) / 1000);
  $("pillTime").textContent = `Time: ${sec}s`;
}

function startTimer(){
  t0 = Date.now();
  clearInterval(timerId);
  timerId = setInterval(tickTimer, 250);
  tickTimer();
}

function stopTimer(){
  clearInterval(timerId);
  timerId = null;
}


const confettiCanvas = $("confetti");
const ctxConf = confettiCanvas.getContext("2d");
let confettiRAF = null;

function resizeConfetti(){
  confettiCanvas.width = Math.floor(window.innerWidth * devicePixelRatio);
  confettiCanvas.height = Math.floor(window.innerHeight * devicePixelRatio);
  ctxConf.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);
}
let resizeTimeout=null;
window.addEventListener("resize",()=>{
 clearTimeout(resizeTimeout);
 resizeTimeout=setTimeout(resizeConfetti,150);
});

function launchConfetti(){
  resizeConfetti();
  confettiCanvas.classList.add("show");
  const W = window.innerWidth, H = window.innerHeight;
  const pieces = Array.from({length: 140}, () => ({
    x: Math.random()*W,
    y: -20 - Math.random()*H*0.3,
    r: 3 + Math.random()*5,
    vx: -1.5 + Math.random()*3,
    vy: 2 + Math.random()*4,
    a: Math.random()*Math.PI*2,
    va: -0.15 + Math.random()*0.3
  }));
  let t = 0;

  function frame(){
    ctxConf.clearRect(0,0,W,H);
    for(const p of pieces){
      p.x += p.vx;
      p.y += p.vy;
      p.a += p.va;
      p.vy += 0.02;
      ctxConf.save();
      ctxConf.translate(p.x, p.y);
      ctxConf.rotate(p.a);
      ctxConf.globalAlpha = Math.max(0, 1 - t/160);
      ctxConf.fillRect(-p.r, -p.r, p.r*2.4, p.r*1.2);
      ctxConf.restore();
    }
    t++;
    if(t < 160) confettiRAF = requestAnimationFrame(frame);
    else{
      confettiCanvas.classList.remove("show");
      ctxConf.clearRect(0,0,W,H);
      confettiRAF = null;
    }
  }
  if(confettiRAF) cancelAnimationFrame(confettiRAF);
  confettiRAF = requestAnimationFrame(frame);
}

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
  addLearnStep("Selected a random word from the chosen category.");
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
  dom.pillLives.textContent = `Lives: ${lives}`;
  $("pillWrong").textContent = wrong.size ? `Wrong: ${[...wrong].join(", ")}` : "Wrong: —";
  dom.pillScore.textContent = `Score: ${score}`;
  if(score > bestScore){ bestScore = score; localStorage.setItem("hm_best_score", String(bestScore)); }
  dom.pillStreak.textContent = `Streak: ${streak}`;
  drawHangman();
}

function handler(k, btn){
  if(demoOn) demoOn=false;
  if(roundLocked) return;

  if(answer.includes(k)){
    revealed.add(k);
    addLearnStep("Correct guess reveals all matching letters.");
    score += 10;
    $("status").textContent = `Correct: ${k}`;
    playSound(audioCorrect);
    showToast("Correct", `${k} is in the word`);
  }else{
    wrong.add(k);
    lives -= 1;
    addLearnStep("Wrong guess reduces lives, draws hangman, and triggers haptic feedback.");
    score = Math.max(0, score - 2);
    $("status").textContent = `Wrong: ${k}`;
    if(navigator.vibrate) navigator.vibrate(40);
    playSound(audioWrong);
    showToast("Wrong", `${k} is not in the word`);
  }

  btn.disabled = true;
  if(answer.includes(k)) btn.classList.add("good");
  else btn.classList.add("bad");

  renderWord();
  updateHud();

  if(isWin()){
    addLearnStep("All letters revealed. Win condition met.");
    streak += 1;
    if(wrong.size === 0){
      perfectWins += 1;
      localStorage.setItem("hm_perfect", String(perfectWins));
      $("pillAch").textContent = `Ach: Perfect x${perfectWins}`;
      showToast("Ach", "Perfect round!");
    }
    gamesWon += 1;
    localStorage.setItem("hm_wins", gamesWon);
    score += 25;
    localStorage.setItem("hm_score", String(score));
    localStorage.setItem("hm_streak", String(streak));
    $("status").textContent = `You Win 🎉 Answer: ${answer}`;
    playSound(audioWin);
    $("srStatus").textContent="You win";
    showToast("Win", "Nice! +25 bonus");
    launchConfetti();
    stopTimer();
    const winSec = Math.floor((Date.now() - t0) / 1000);
    if(bestTime === 0 || winSec < bestTime){
      bestTime = winSec;
      localStorage.setItem("hm_best_time", String(bestTime));
      showToast("Record", `Best time: ${bestTime}s`);
    }
    lockKeyboard();
  }

  if(lives <= 0){
    addLearnStep("Lives reached zero. Game over.");
    parts.forEach(p => p.style.opacity = "1");
    streak = 0;
    localStorage.setItem("hm_score", String(score));
    localStorage.setItem("hm_streak", String(streak));
    $("status").textContent = `Game Over 💀 Answer: ${answer}`;
    $("srStatus").textContent="Game over";
    showToast("Lose", "Streak reset");
    stopTimer();
    lockKeyboard();
  }
}

function renderKeyboard(){
  kb.innerHTML = "";
  qwertyRows.forEach(row => {
    row.split("").forEach((k) => {
      const b = document.createElement("button");
      b.className = "key";
      b.textContent = k;
      b.addEventListener("click", () => handler(k, b));
      kb.appendChild(b);
    });
  });
}

function startRound(message){
  gamesPlayed += 1;
  localStorage.setItem("hm_games", gamesPlayed);
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
  stopTimer();
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


function renderStats(){
  const gp = localStorage.getItem("hm_games") || 0;
  const gw = localStorage.getItem("hm_wins") || 0;
  $("helpTitle").textContent = `Help & Stats (Games: ${gp}, Wins: ${gw}, Best: ${localStorage.getItem("hm_best_time")||0}s, BestScore: ${localStorage.getItem("hm_best_score")||0})`;
}

function openHelp(){
  renderStats();
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

$("btnSound").addEventListener("click", () => {
  soundOn = !soundOn;
  localStorage.setItem("hm_sound", JSON.stringify(soundOn));
  $("btnSound").textContent = soundOn ? "🔊 Sound" : "🔇 Muted";
  showToast("Sound", soundOn ? "Sound ON" : "Sound OFF");
});


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
$("btnExport").addEventListener("click", () => {
  const data = {
    score: Number(localStorage.getItem("hm_score")||0),
    streak: Number(localStorage.getItem("hm_streak")||0),
    games: Number(localStorage.getItem("hm_games")||0),
    wins: Number(localStorage.getItem("hm_wins")||0),
    bestTime: Number(localStorage.getItem("hm_best_time")||0),
    bestScore: Number(localStorage.getItem("hm_best_score")||0),
    perfect: Number(localStorage.getItem("hm_perfect")||0),
    theme: localStorage.getItem("hm_theme")||"dark",
    sound: localStorage.getItem("hm_sound")||"true",
    exportedAt: new Date().toISOString()
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], {type:"application/json"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "hangman-stats.json";
  a.click();
  URL.revokeObjectURL(a.href);
  showToast("Export", "Stats downloaded");
});


$("btnImport").addEventListener("click", () => $("importFile").click());

$("importFile").addEventListener("change", async (e) => {
  const f = e.target.files && e.target.files[0];
  if(!f) return;
  try{
    const txt = await f.text();
    const data = JSON.parse(txt);
    const set = (k,v) => localStorage.setItem(k, String(v));
    if("score" in data) set("hm_score", data.score);
    if("streak" in data) set("hm_streak", data.streak);
    if("games" in data) set("hm_games", data.games);
    if("wins" in data) set("hm_wins", data.wins);
    if("bestTime" in data) set("hm_best_time", data.bestTime);
    if("bestScore" in data) set("hm_best_score", data.bestScore);
    if("perfect" in data) set("hm_perfect", data.perfect);
    if("theme" in data) set("hm_theme", data.theme);
    if("sound" in data) set("hm_sound", data.sound);
    showToast("Import", "Stats imported");
    location.reload();
  }catch{
    showToast("Import", "Invalid JSON file");
  }
});

$("btnResetStats").addEventListener("click", () => {
  score = 0;
  streak = 0;
  localStorage.setItem("hm_score", "0");
  localStorage.setItem("hm_streak", "0");
  dom.pillScore.textContent = "Score: 0";
  dom.pillStreak.textContent = "Streak: 0";
  showToast("Reset", "Score & streak cleared");
});

$("btnResetAll").addEventListener("click", () => {
  localStorage.removeItem("hm_score");
  localStorage.removeItem("hm_streak");
  localStorage.removeItem("hm_games");
  localStorage.removeItem("hm_wins");
  localStorage.removeItem("hm_best_time");
  localStorage.removeItem("hm_best_score");
  localStorage.removeItem("hm_sound");
  localStorage.removeItem("hm_theme");
  score = 0; streak = 0;
  showToast("Reset", "All local data cleared");
  location.reload();
});


$("helpModal").addEventListener("click", (e) => {
  if(e.target && e.target.id === "helpModal") closeHelp();
});


let theme = localStorage.getItem("hm_theme") || "dark";
document.body.classList.toggle("light", theme==="light");

function toggleTheme(){
  theme = theme==="dark" ? "light" : "dark";
  localStorage.setItem("hm_theme", theme);
  document.body.classList.toggle("light", theme==="light");
  showToast("Theme", theme==="light" ? "Light mode" : "Dark mode");
}

$("btnTheme").addEventListener("click", toggleTheme);

$("btnShare").addEventListener("click", async () => {

$("btnLearn").addEventListener("click", () => {

$("btnDemo").addEventListener("click",()=>{
  demoOn=true;
  pickWord();
  renderWord();
  buildDemo();
  showToast("Demo","Auto-playing example round");
  setTimeout(runDemo,600);
});

  learningOn = !learningOn;
  $("learnPanel").style.display = learningOn ? "block" : "none";
  $("learnSteps").innerHTML = "";
  showToast("Learn", learningOn ? "Learning mode ON" : "Learning mode OFF");
});

  const url = location.href;
  try{
    await navigator.clipboard.writeText(url);
    showToast("Share", "Link copied");
  }catch{
    showToast("Share", "Copy failed (browser blocked)");
  }
});


if("serviceWorker" in navigator){
  navigator.serviceWorker.register("./sw.js").catch(()=>{});
}

startTimer();
startRound("Pick a letter.");
