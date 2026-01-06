const $ = (id) => document.getElementById(id);

const keys = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const kb = $("keyboard");

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

$("status").textContent = "Keyboard ready. Next: add game logic.";
renderKeyboard((k, btn) => {
  $("status").textContent = `Pressed: ${k}`;
  btn.disabled = true;
});
