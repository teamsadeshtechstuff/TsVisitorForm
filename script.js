/* =========================================================
   Team Sandesh | Visitor Registration — step-by-step form
   ========================================================= */
const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbw38s28oZtHTHOuT2aTX-xPf3dCqlnkYf403uFWFcamO4heqZcyWwL_Ld09_TOZ1hp7Sw/exec";

const RESET_SECONDS = 10; // thank-you screen resets for the next visitor

/* ----- Choice questions: [English, Nepali] -----
   The English text is what gets saved in Google Sheets. */
const QUESTIONS = {
  course: {
    title: "Interested Course",
    required: true,
    other: true,
    choices: [
      ["NASU / Kharidar", "नासु / खरिदार"],
      ["Shakha Adhikrit (Officer)", "शाखा अधिकृत"],
      ["Banking (NRB / RBB / NBL / ADBL)", "बैंकिङ (राष्ट्र बैंक / RBB / NBL / ADBL)"],
      ["Teaching Service Commission (TSC)", "शिक्षक सेवा आयोग"],
      ["Teaching License", "शिक्षक अध्यापन अनुमतिपत्र"],
      ["Bini / Prasa", "बिनी / प्रसा"],
      ["NEA / NTC / EPF", "विद्युत प्राधिकरण / नेपाल टेलिकम / कर्मचारी सञ्चय कोष"],
      ["Police ASI / Inspector", "प्रहरी सहायक निरीक्षक / निरीक्षक"],
    ],
  },
  source: {
    title: "Where Did You Hear About Us?",
    required: true,
    other: true,
    choices: [
      ["Facebook", "फेसबुक"],
      ["TikTok", "टिकटक"],
      ["YouTube", "युट्युब"],
      ["Instagram", "इन्स्टाग्राम"],
      ["Google Search", "गुगल खोज"],
      ["Friends / Family", "साथीभाइ / परिवार"],
      ["Existing Student", "हाल अध्ययनरत विद्यार्थी"],
      ["Banner / Advertisement", "ब्यानर / विज्ञापन"],
    ],
  },
  purpose: {
    title: "Purpose of Visit",
    required: false,
    choices: [
      ["Course Inquiry", "कोर्सबारे जानकारी"],
      ["New Admission", "नयाँ भर्ना"],
      ["Fee / Discount Inquiry", "शुल्क / छुटबारे जानकारी"],
      ["Other Assistance", "अन्य सहयोग"],
    ],
  },
  timeline: {
    title: "When Are You Planning to Join?",
    required: false,
    choices: [
      ["Today", "आज"],
      ["Within 7 Days", "७ दिनभित्र"],
      ["Within 30 Days", "३० दिनभित्र"],
      ["Just Exploring", "जानकारी मात्र लिँदै"],
    ],
  },
  contact: {
    title: "May Team Sandesh contact you about your course inquiry?",
    required: true,
    yesNo: true,
    choices: [
      ["Yes", "हुन्छ"],
      ["No", "हुँदैन"],
    ],
  },
};

const OTHER = ["Other", "अन्य"];
const ICON_CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
const ICON_X = '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>';

const $ = (id) => document.getElementById(id);
const wizard = $("wizard");
const steps = [...wizard.querySelectorAll(".step")];
const LAST = steps.length - 1; // review step
const QUESTION_STEPS = LAST; // steps before review

/* =========================================================
   Build choice tiles
   ========================================================= */
document.querySelectorAll("[data-q]").forEach((box) => {
  const id = box.dataset.q;
  const q = QUESTIONS[id];
  const opts = q.other ? [...q.choices, OTHER] : q.choices;

  opts.forEach(([en, np], i) => {
    const key = String.fromCharCode(65 + i); // A, B, C…
    const wrap = document.createElement("div");
    wrap.className = "choice" + (q.yesNo ? " " + en.toLowerCase() : "");
    const icon = q.yesNo
      ? `<span class="icon">${en === "Yes" ? ICON_CHECK : ICON_X}</span>`
      : `<span class="key">${key}</span>`;
    wrap.innerHTML = `
      <input type="radio" name="${id}" id="${id}_${i}" value="${en}" data-key="${key}" />
      <label for="${id}_${i}">
        ${icon}
        <span class="c-text"><span class="c-en">${en}</span><span class="c-np">${np}</span></span>
        <span class="tick">${ICON_CHECK}</span>
      </label>`;
    box.appendChild(wrap);
  });

  if (q.other) {
    const other = document.createElement("input");
    other.type = "text";
    other.className = "other-input";
    other.id = `${id}_other`;
    other.placeholder = "Please specify · कृपया खुलाउनुहोस्";
    box.after(other);
  }
});

/* =========================================================
   Stepper (left panel)
   ========================================================= */
const stepper = $("stepper");
steps.forEach((s, i) => {
  const li = document.createElement("li");
  li.dataset.index = i;
  li.innerHTML = `<span class="dot">${i + 1}</span><span>${s.dataset.title}<span class="s-np">${s.dataset.np}</span></span>`;
  li.addEventListener("click", () => {
    if (!li.classList.contains("done") || $("done").hidden === false) return;
    if (maxReached === LAST && i !== LAST) returnToReview = true;
    goTo(i);
  });
  stepper.appendChild(li);
});

/* Progress segments (one per section, incl. review) */
const segments = $("segments");
steps.forEach(() => segments.appendChild(document.createElement("span")));

const toNp = (n) => String(n).replace(/[0-9]/g, (d) => "०१२३४५६७८९"[d]);

/* =========================================================
   Navigation
   ========================================================= */
let current = 0;
let maxReached = 0;
let returnToReview = false;
let autoTimer = null;

const backBtn = $("backBtn");
const nextBtn = $("nextBtn");
const nextLabel = nextBtn.querySelector(".btn-label");

function render(direction = "forward") {
  wizard.classList.toggle("back", direction === "back");
  steps.forEach((s, i) => s.classList.toggle("active", i === current));

  // Section number + top bar
  steps.forEach((s, i) => {
    const n = s.querySelector(".step-num");
    if (n) n.textContent = String(i + 1).padStart(2, "0");
  });
  $("topStep").textContent =
    current < QUESTION_STEPS ? `Step ${current + 1} of ${QUESTION_STEPS} · चरण ${toNp(current + 1)}/${toNp(QUESTION_STEPS)}` : "Final step · अन्तिम चरण";
  $("topTitle").textContent = steps[current].dataset.title;
  [...segments.children].forEach((seg, i) => {
    seg.classList.toggle("filled", i < current);
    seg.classList.toggle("current", i === current);
  });

  // Stepper
  [...stepper.children].forEach((li, i) => {
    li.classList.toggle("active", i === current);
    li.classList.toggle("done", i < current || (i <= maxReached && i !== current));
    li.querySelector(".dot").innerHTML = li.classList.contains("done") ? ICON_CHECK : i + 1;
  });

  // Buttons
  backBtn.classList.toggle("hidden", current === 0);
  nextBtn.classList.toggle("submit", current === LAST);
  if (current === LAST) nextLabel.textContent = "Submit · पेश गर्नुहोस्";
  else if (returnToReview) nextLabel.textContent = "Save & review";
  else if (current === LAST - 1) nextLabel.textContent = "Review · पुनरावलोकन";
  else nextLabel.textContent = "Next · अर्को";

  if (current === LAST) buildReview();

  wizard.scrollTop = 0;

  // Focus the first text box on text steps (desktop only, avoids popping keyboards on tablets)
  const firstText = steps[current].querySelector('input[type="text"]:not(.other-input), input[type="tel"]');
  if (firstText && window.matchMedia("(pointer: fine)").matches) {
    setTimeout(() => firstText.focus({ preventScroll: true }), 120);
  }
}

function goTo(i, direction) {
  clearTimeout(autoTimer);
  const dir = direction || (i < current ? "back" : "forward");
  if (i === LAST) returnToReview = false;
  current = i;
  maxReached = Math.max(maxReached, i);
  render(dir);
}

function next() {
  if (current === LAST) return submit();
  if (!validateStep(current)) return;
  goTo(returnToReview ? LAST : current + 1, "forward");
}

function back() {
  if (current > 0) goTo(current - 1, "back");
}

nextBtn.addEventListener("click", next);
backBtn.addEventListener("click", back);

/* Enter = continue; letter keys pick options */
document.addEventListener("keydown", (e) => {
  if (!$("done").hidden) {
    if (e.key === "Enter") restart();
    return;
  }
  if (e.key === "Enter") {
    if (e.target.matches("button")) return;
    e.preventDefault();
    next();
    return;
  }
  const typing = e.target.matches('input[type="text"], input[type="tel"]');
  if (typing || e.ctrlKey || e.metaKey || e.altKey || e.key.length !== 1) return;

  const groups = steps[current].querySelectorAll("[data-q]");
  if (groups.length !== 1) return;
  const id = groups[0].dataset.q;
  let radio = null;
  if (QUESTIONS[id].yesNo) {
    const k = e.key.toLowerCase();
    if (k === "y") radio = $(`${id}_0`);
    if (k === "n") radio = $(`${id}_1`);
  } else {
    radio = steps[current].querySelector(`input[data-key="${e.key.toUpperCase()}"]`);
  }
  if (radio) {
    radio.checked = true;
    radio.dispatchEvent(new Event("change", { bubbles: true }));
  }
});

/* =========================================================
   Choice behaviour: "Other" box + auto-advance
   ========================================================= */
wizard.addEventListener("change", (e) => {
  if (e.target.type !== "radio") return;
  const field = e.target.closest(".field");
  field.classList.remove("invalid");

  const other = field.querySelector(".other-input");
  const isOther = e.target.value === "Other";
  if (other) {
    other.classList.toggle("show", isOther);
    if (isOther) setTimeout(() => other.focus(), 50);
  }

  // Auto-advance on single-question steps
  const step = e.target.closest(".step");
  if (step.dataset.auto && !isOther) {
    clearTimeout(autoTimer);
    autoTimer = setTimeout(next, 380);
  }
});

/* =========================================================
   Text inputs
   ========================================================= */
const phone = $("phone");
const tempAddress = $("tempAddress");
const permAddress = $("permAddress");
const sameAddress = $("sameAddress");

phone.addEventListener("input", () => {
  phone.value = phone.value.replace(/\D/g, "").slice(0, 10);
});

function syncAddress() {
  if (sameAddress.checked) {
    permAddress.value = tempAddress.value;
    permAddress.readOnly = true;
    permAddress.closest(".field").classList.remove("invalid");
  } else {
    permAddress.readOnly = false;
  }
}
sameAddress.addEventListener("change", () => {
  if (!sameAddress.checked) {
    permAddress.value = "";
    permAddress.focus();
  }
  syncAddress();
});
tempAddress.addEventListener("input", syncAddress);

wizard.addEventListener("input", (e) => {
  const f = e.target.closest(".field");
  if (f) f.classList.remove("invalid");
});

/* =========================================================
   Validation (per step)
   ========================================================= */
const PHONE_RE = /^9[0-9]{9}$/;

function getChoiceValue(id) {
  const checked = document.querySelector(`input[name="${id}"]:checked`);
  if (!checked) return "";
  if (checked.value === "Other") {
    const txt = $(`${id}_other`).value.trim();
    return txt ? `Other: ${txt}` : "";
  }
  return checked.value;
}

function validateStep(i) {
  const step = steps[i];
  let firstBad = null;
  const mark = (field, bad) => {
    field.classList.toggle("invalid", bad);
    if (bad && !firstBad) firstBad = field;
  };

  step.querySelectorAll(".field").forEach((field) => {
    const key = field.dataset.field;
    if (key === "fullName") mark(field, !$("fullName").value.trim());
    else if (key === "phone") mark(field, !PHONE_RE.test(phone.value.trim()));
    else if (key === "tempAddress") mark(field, !tempAddress.value.trim());
    else if (key === "permAddress") mark(field, !permAddress.value.trim());
    else if (QUESTIONS[key]) {
      const q = QUESTIONS[key];
      const checked = document.querySelector(`input[name="${key}"]:checked`);
      let bad = q.required && !checked;
      if (checked && checked.value === "Other" && !$(`${key}_other`).value.trim()) bad = true;
      mark(field, bad);
    }
  });

  if (firstBad) {
    // restart shake animation
    firstBad.classList.remove("invalid");
    void firstBad.offsetWidth;
    firstBad.classList.add("invalid");
    const input = firstBad.querySelector('input[type="text"]:not([readonly]), input[type="tel"], .other-input.show');
    if (input) input.focus();
    firstBad.scrollIntoView({ behavior: "smooth", block: "center" });
  }
  return !firstBad;
}

/* =========================================================
   Review
   ========================================================= */
function collect() {
  return {
    "Full Name": $("fullName").value.trim(),
    "Phone Number": phone.value.trim(),
    "Temporary Address": tempAddress.value.trim(),
    "Permanent Address": permAddress.value.trim(),
    [QUESTIONS.course.title]: getChoiceValue("course"),
    [QUESTIONS.source.title]: getChoiceValue("source"),
    [QUESTIONS.purpose.title]: getChoiceValue("purpose"),
    [QUESTIONS.timeline.title]: getChoiceValue("timeline"),
    [QUESTIONS.contact.title]: getChoiceValue("contact"),
  };
}

function buildReview() {
  const d = collect();
  const rows = [
    ["Full name", d["Full Name"], 0],
    ["Mobile number", d["Phone Number"] ? "+977 " + d["Phone Number"] : "", 0],
    ["Temporary address", d["Temporary Address"], 1],
    ["Permanent address", d["Permanent Address"], 1],
    ["Interested course", d[QUESTIONS.course.title], 2],
    ["Heard about us via", d[QUESTIONS.source.title], 3],
    ["Purpose of visit", d[QUESTIONS.purpose.title], 4],
    ["Planning to join", d[QUESTIONS.timeline.title], 4],
    ["May we contact you?", d[QUESTIONS.contact.title], 5],
  ];
  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  $("reviewList").innerHTML = rows
    .map(
      ([label, val, step]) => `
      <div class="review-row">
        <dt>${label}</dt>
        <dd class="${val ? "" : "empty"}">${val ? esc(val) : "Not answered"}</dd>
        <button type="button" class="edit" data-goto="${step}">Edit</button>
      </div>`
    )
    .join("");
}

$("reviewList").addEventListener("click", (e) => {
  const btn = e.target.closest(".edit");
  if (!btn) return;
  returnToReview = true;
  goTo(Number(btn.dataset.goto), "back");
});

/* =========================================================
   Submit
   ========================================================= */
const statusBox = $("formStatus");

async function submit() {
  statusBox.hidden = true;

  // Final safety check on every step
  for (let i = 0; i < QUESTION_STEPS; i++) {
    if (!validateStep(i)) {
      goTo(i, "back");
      validateStep(i);
      return;
    }
  }

  if (!SCRIPT_URL || SCRIPT_URL.startsWith("PASTE_")) {
    showError("Form is not connected yet. Add your Google Apps Script URL in script.js.");
    return;
  }

  nextBtn.disabled = true;
  backBtn.disabled = true;
  nextBtn.classList.add("loading");
  nextLabel.textContent = "Submitting…";

  try {
    // Apps Script replies from another domain that browsers won't let us read (CORS),
    // so the data is sent with "no-cors". The row is still saved.
    await fetch(SCRIPT_URL, { method: "POST", mode: "no-cors", body: new URLSearchParams(collect()) });
    showDone();
  } catch (err) {
    console.error(err);
    showError("Could not submit. Please check your internet connection and try again. · पठाउन सकिएन, कृपया इन्टरनेट जाँच गरी फेरि प्रयास गर्नुहोस्।");
  } finally {
    nextBtn.disabled = false;
    backBtn.disabled = false;
    nextBtn.classList.remove("loading");
    if (current === LAST) nextLabel.textContent = "Submit · पेश गर्नुहोस्";
  }
}

function showError(msg) {
  statusBox.textContent = msg;
  statusBox.hidden = false;
}

/* =========================================================
   Success + auto reset
   ========================================================= */
let countdownTimer = null;

function showDone() {
  wizard.hidden = true;
  $("actions").hidden = true;
  $("done").hidden = false;
  [...segments.children].forEach((seg) => { seg.classList.add("filled"); seg.classList.remove("current"); });
  $("topStep").textContent = "Completed · सम्पन्न";
  $("topTitle").textContent = "Thank you";
  [...stepper.children].forEach((li) => {
    li.classList.remove("active");
    li.classList.add("done");
    li.querySelector(".dot").innerHTML = ICON_CHECK;
  });

  let left = RESET_SECONDS;
  $("countdown").textContent = left;
  clearInterval(countdownTimer);
  countdownTimer = setInterval(() => {
    left -= 1;
    $("countdown").textContent = left;
    if (left <= 0) restart();
  }, 1000);
}

function restart() {
  clearInterval(countdownTimer);
  wizard.reset();
  permAddress.readOnly = false;
  document.querySelectorAll(".other-input").forEach((o) => o.classList.remove("show"));
  document.querySelectorAll(".field.invalid").forEach((f) => f.classList.remove("invalid"));
  statusBox.hidden = true;

  $("done").hidden = true;
  wizard.hidden = false;
  $("actions").hidden = false;

  current = 0;
  maxReached = 0;
  returnToReview = false;
  render("back");
}

$("restartBtn").addEventListener("click", restart);

/* Start */
render();
