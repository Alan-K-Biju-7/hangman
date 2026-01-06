const $ = (id) => document.getElementById(id);

const WORDS = [
  { w: "PYTHON", h: "Popular programming language" },
  { w: "ALGORITHM", h: "Step-by-step procedure" },
  { w: "RECURSION", h: "Function calls itself" },
  { w: "HEURISTIC", h: "Helpful estimate to guide search" },
  { w: "THE DARK KNIGHT", h: "Batman vs Joker" }
];

const keys = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const kb = $("keyboard");
const wordBox = $("word");

let answer = "";
let hint = "";
let revealed = new Set();

function pickWord(){
  const item = WORDS[Math.floor(Math.random()*WORDS.length)];
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

function renderKeyboard(onClick){
  kb.innerHTML = "";
  keys.forEach((k) => {
    const b = document.createElement("button");
    b.className = "key";
    b.textContent = k;
    b.addEventListener("click", () => onClick(k, b));
    kb.appendChild(b);
  });
}

pickWord();
renderWord();
$("status").textContent = "Pick a letter.";
$("hintLine").textContent = "";
renderKeyboard((k, btn) => {
  if(answer.includes(k)){
    revealed.add(k);
    renderWord();
    $("status").textContent = `Correct: ${k}`;
  }else{
    $("status").textContent = `Wrong: ${k}`;
  }
  btn.disabled = true;
});
