// portfolio.js
// Creates several small interactive example programs and injects them into the page.
// Usage: include this script on a page. It will create a container with demo cards.

(function () {
  // Builds a DOM element with optional attributes, styles, and children.
  const createEl = (tag, attrs = {}, ...children) => {
    const el = document.createElement(tag);
    for (const k in attrs) {
      if (k === "style") Object.assign(el.style, attrs[k]);
      else if (k.startsWith("on") && typeof attrs[k] === "function") el.addEventListener(k.slice(2), attrs[k]);
      else el.setAttribute(k, attrs[k]);
    }
    children.forEach(child => {
      if (child == null) return;
      el.append(typeof child === "string" ? document.createTextNode(child) : child);
    });
    return el;
  };

  let container = document.getElementById("examples");

  // Ensures the demo container exists and sits at the top of the page.
  function ensureExamplesAtTop() {
    if (!document.body) return;
    if (!container) container = createEl("div", { id: "examples" });
    document.body.insertBefore(container, document.body.firstElementChild);
    container.classList.add("examples");
  }

  ensureExamplesAtTop();

  // Appends a card with the given title and content builder into the container.
  function addCard(title, buildFn) {
    const card = createEl("div", { class: "card" }, createEl("h3", {}, title), buildFn());
    container.appendChild(card);
  }
  // 7) Typing Effect (demo)
  // Simulates a typewriter effect to introduce the demos.
  addCard("JavaScripts", () => {
    const msg = "Welcome to my interactive demos powered by JavaScript.";
    const el = createEl("div", { class: "small" }, "");
    let i = 0;
    function step() {
      el.textContent = msg.slice(0, i++);
      if (i <= msg.length) setTimeout(step, 45);
    }
    step();
    return createEl("div", {}, el);
  });
  // 1) Counter
  // 1) Counter
  // Tracks a number and lets the user adjust it up, down, or reset.
  addCard("Counter", () => {
    let count = 0;
    const display = createEl("div", { class: "row small" }, `Count: `, createEl("strong", {}, String(count)));
    const inc = createEl("button", { class: "btn", onclick: () => (display.querySelector("strong").textContent = ++count) }, "＋");
    const dec = createEl("button", { class: "btn", onclick: () => (display.querySelector("strong").textContent = --count) }, "－");
    const reset = createEl("button", { class: "btn", onclick: () => (count = 0, display.querySelector("strong").textContent = "0") }, "reset");
    return createEl("div", {}, display, createEl("div", { class: "row" }, inc, dec, reset));
  });
  // 2) Random Quote
  // 2) Random Quote
  // Picks a random programming quote on demand.
  addCard("Random Quote", () => {
    const quotes = [
      "Simplicity is the soul of efficiency.",
      "Make it work, make it right, make it fast.",
      "Readability counts.",
      "Small teams, rapid iteration.",
      "Design for humans.",
      "Code is poetry.",
      "Premature optimization is the root of all evil.",
      "Keep it simple, stupid.",
      "First, solve the problem. Then, write the code.",
      "Talk is cheap. Show me the code.",
      "In the face of ambiguity, refuse the temptation to guess.",
      "There are only two hard things in computer science: cache invalidation and naming things.",
      "The only way to go fast is to go well.",
      "If you don't like the road you're walking, start paving another one."
    ];
    const q = createEl("div", { class: "small" }, quotes[0]);
    const btn = createEl("button", { class: "btn", onclick: () => (q.textContent = quotes[Math.floor(Math.random() * quotes.length)]) }, "New quote");
    return createEl("div", {}, q, btn);
  });
  // 3) RGB Color Mixer
  // 3) RGB Color Mixer
  // Combines slider values into a live preview swatch.
  addCard("RGB Color Mixer", () => {
    const preview = createEl("div", { style: { height: "60px", border: "1px solid #ccc", borderRadius: "4px", marginBottom: "8px" } });
    const makeSlider = (label, init = 128) => {
      const val = createEl("span", { class: "small" }, String(init));
      const s = createEl("input", { type: "range", min: 0, max: 255, value: init, oninput: (e) => { val.textContent = e.target.value; update(); } });
      return createEl("div", {}, createEl("div", { class: "small" }, label, " ", val), s);
    };
    const r = makeSlider("R", 120);
    const g = makeSlider("G", 160);
    const b = makeSlider("B", 200);
    function getVal(s) { return Number(s.querySelector("input").value); }
    function update() {
      const color = `rgb(${getVal(r)}, ${getVal(g)}, ${getVal(b)})`;
      preview.style.background = color;
      preview.textContent = color;
    }
    update();
    return createEl("div", {}, preview, r, g, b);
  });
  // 4) BMI Calculator
  // 4) BMI Calculator
  // Estimates BMI with simple validation on the provided inputs.
  addCard("BMI Calculator", () => {
    function bmiCalc(kg, m) {
      var bmi = kg / Math.pow(m, 2);
      return Math.round(bmi);
    }
    const weightInput = createEl("input", { type: "number", placeholder: "Weight (kg)", style: { width: "90px" }, min: 1, value: 75 });
    const heightInput = createEl("input", { type: "number", placeholder: "Height (m)", style: { width: "90px" }, min: 0.5, step: "0.01", value: 1.81 });
    const result = createEl("div", { class: "small" }, "Your BMI is " + bmiCalc(75, 1.81) + ".");
    const calcBtn = createEl("button", { class: "btn", onclick: () => {
      const kg = parseFloat(weightInput.value);
      const m = parseFloat(heightInput.value);
      if (isNaN(kg) || isNaN(m) || kg <= 0 || m <= 0) {
        result.textContent = "Please enter valid values.";
      } else {
        result.textContent = "Your BMI is " + bmiCalc(kg, m) + ".";
      }
    } }, "Calculate");
    return createEl("div", {},
      createEl("div", { class: "row" }, weightInput, heightInput, calcBtn),
      result
    );
  });
  // 5) Rock Paper Scissors
  // 5) Rock Paper Scissors
  // Lets the user play a short round against a random AI choice.
  addCard("Rock · Paper · Scissors", () => {
    const status = createEl("div", { class: "small" }, "Choose:");
    const score = { you: 0, ai: 0 };
    const scoreEl = createEl("div", { class: "small" }, `You: 0 • AI: 0`);
    const choices = ["Rock", "Paper", "Scissors"];
    function play(choice) {
      const ai = choices[Math.floor(Math.random() * 3)];
      let res = "Tie";
      if ((choice === "Rock" && ai === "Scissors") || (choice === "Paper" && ai === "Rock") || (choice === "Scissors" && ai === "Paper")) {
        res = "You win";
        score.you++;
      } else if (choice !== ai) {
        res = "AI wins";
        score.ai++;
      }
      status.textContent = `${choice} vs ${ai} → ${res}`;
      scoreEl.textContent = `You: ${score.you} • AI: ${score.ai}`;
    }
    const btns = createEl("div", { class: "row" }, ...choices.map(c => createEl("button", { class: "btn", onclick: () => play(c) }, c)));
    return createEl("div", {}, status, btns, scoreEl);
  });
  // 6) Live klocka
  // 6) Live klocka
  // Shows the current time and stops ticking when removed from the DOM.
  addCard("Live klocka", () => {
    const d = createEl("div", { class: "small", style: { fontSize: "18px" } }, "--:--:--");
    function tick() {
      const now = new Date();
      d.textContent = now.toLocaleTimeString();
    }
    tick();
    const ti = setInterval(tick, 500);
    // Stop updating when the widget is removed to avoid stray timers.
    const observer = new MutationObserver(() => {
      if (!document.body.contains(d)) {
        clearInterval(ti);
        observer.disconnect();
      }
    });
    observer.observe(document, { childList: true, subtree: true });
    return createEl("div", {}, d);
  });

  // 8) Simple To‑Do
  // Captures quick todos with inline delete controls.
  addCard("Simple To‑Do", () => {
    const list = createEl("ul");
    const input = createEl("input", { placeholder: "New task", style: { width: "160px" } });
    const add = createEl("button", { class: "btn", onclick: () => {
      const v = (input.value || "").trim();
      if (!v) return;
      const li = createEl("li", {}, v, " ", createEl("button", { class: "btn", onclick: () => li.remove() }, "x"));
      list.appendChild(li);
      input.value = "";
    } }, "Add");
    return createEl("div", {}, createEl("div", { class: "row" }, input, add), list);
  });

})();
