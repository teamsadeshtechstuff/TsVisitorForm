/* =========================================================
   Team Sandesh | Visitor Registration Form
   Paste your Google Apps Script Web App URL (ends in /exec)
   ========================================================= */
const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbw38s28oZtHTHOuT2aTX-xPf3dCqlnkYf403uFWFcamO4heqZcyWwL_Ld09_TOZ1hp7Sw/exec";

/* ----- Multiple-choice questions: [English, Nepali] -----
   The English text is what gets saved in Google Sheets. */
const QUESTIONS = [
  {
    id: "course",
    title: ["Interested Course", "रुचि भएको कोर्स"],
    required: true,
    other: true,
    choices: [
      ["NASU / Kharidar", "नासु / खरिदार"],
      ["Shakha Adhikrit (Officer)", "शाखा अधिकृत"],
      [
        "Banking (NRB / RBB / NBL / ADBL)",
        "बैंकिङ (राष्ट्र बैंक / RBB / NBL / ADBL)",
      ],
      ["Teaching Service Commission (TSC)", "शिक्षक सेवा आयोग"],
      ["Teaching License", "शिक्षक अध्यापन अनुमतिपत्र"],
      ["Bini / Prasa", "बिनी / प्रसा"],
      [
        "NEA / NTC / EPF",
        "विद्युत प्राधिकरण / नेपाल टेलिकम / कर्मचारी सञ्चय कोष",
      ],
      ["Police ASI / Inspector", "प्रहरी सहायक निरीक्षक / निरीक्षक"],
    ],
  },
  {
    id: "source",
    title: [
      "Where Did You Hear About Us?",
      "हाम्रोबारे कहाँबाट थाहा पाउनुभयो?",
    ],
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
  {
    id: "purpose",
    title: ["Purpose of Visit", "आउनुको उद्देश्य"],
    required: false,
    choices: [
      ["Course Inquiry", "कोर्सबारे जानकारी"],
      ["New Admission", "नयाँ भर्ना"],
      ["Fee / Discount Inquiry", "शुल्क / छुटबारे जानकारी"],
      ["Other Assistance", "अन्य सहयोग"],
    ],
  },
  {
    id: "timeline",
    title: ["When Are You Planning to Join?", "कहिले भर्ना हुने योजना छ?"],
    required: false,
    compact: true,
    choices: [
      ["Today", "आज"],
      ["Within 7 Days", "७ दिनभित्र"],
      ["Within 30 Days", "३० दिनभित्र"],
      ["Just Exploring", "जानकारी मात्र लिँदै"],
    ],
  },
  {
    id: "contact",
    title: [
      "May Team Sandesh contact you about your course inquiry?",
      "टिम सन्देशले तपाईंलाई कोर्सबारे सम्पर्क गर्न सक्छ?",
    ],
    required: true,
    compact: true,
    yesNo: true,
    choices: [
      ["Yes", "हुन्छ"],
      ["No", "हुँदैन"],
    ],
  },
];

const OTHER = ["Other", "अन्य"];

/* ----- Render choice questions ----- */
const container = document.getElementById("choiceQuestions");

QUESTIONS.forEach((q) => {
  const fs = document.createElement("fieldset");
  fs.className = "field";
  fs.dataset.field = q.id;

  const legend = document.createElement("legend");
  legend.innerHTML =
    q.title[0] +
    (q.required
      ? ' <span class="req">*</span>'
      : ' <span class="optional">(optional / ऐच्छिक)</span>') +
    `<span class="np">${q.title[1]}</span>`;
  fs.appendChild(legend);

  const grid = document.createElement("div");
  grid.className = "choices" + (q.compact ? " compact" : "");

  const options = q.other ? [...q.choices, OTHER] : q.choices;
  options.forEach(([en, np], i) => {
    const wrap = document.createElement("div");
    wrap.className = "choice";
    if (q.yesNo) wrap.classList.add(en.toLowerCase());

    const input = document.createElement("input");
    input.type = "radio";
    input.name = q.id;
    input.id = `${q.id}_${i}`;
    input.value = en;

    const label = document.createElement("label");
    label.htmlFor = input.id;
    label.innerHTML = `<span class="txt"><span>${en}</span><span class="np">${np}</span></span>`;

    wrap.append(input, label);
    grid.appendChild(wrap);
  });
  fs.appendChild(grid);

  if (q.other) {
    const other = document.createElement("input");
    other.type = "text";
    other.className = "other-input";
    other.id = `${q.id}_other`;
    other.placeholder = "Please specify / कृपया खुलाउनुहोस्";
    fs.appendChild(other);
  }

  const err = document.createElement("p");
  err.className = "error-msg";
  err.textContent = "This is a required question. / यो प्रश्न अनिवार्य छ।";
  fs.appendChild(err);

  container.appendChild(fs);
});

/* ----- Show/hide "Other" text boxes ----- */
container.addEventListener("change", (e) => {
  if (e.target.type !== "radio") return;
  const field = e.target.closest(".field");
  field.classList.remove("invalid");
  const other = field.querySelector(".other-input");
  if (other) {
    const isOther = e.target.value === "Other";
    other.classList.toggle("show", isOther);
    if (isOther) other.focus();
  }
});

/* ----- Inputs ----- */
const $ = (id) => document.getElementById(id);
const phone = $("phone");
const tempAddress = $("tempAddress");
const permAddress = $("permAddress");
const sameAddress = $("sameAddress");

phone.addEventListener("input", () => {
  phone.value = phone.value.replace(/\D/g, "").slice(0, 10);
});

/* "Same as temporary address" checkbox */
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
  if (!sameAddress.checked) permAddress.value = "";
  syncAddress();
});
tempAddress.addEventListener("input", syncAddress);

["fullName", "phone", "tempAddress", "permAddress"].forEach((id) =>
  $(id).addEventListener("input", () =>
    $(id).closest(".field").classList.remove("invalid"),
  ),
);

/* ----- Validation ----- */
const PHONE_RE = /^9[0-9]{9}$/;

function getChoiceValue(q) {
  const checked = document.querySelector(`input[name="${q.id}"]:checked`);
  if (!checked) return "";
  if (checked.value === "Other") {
    const txt = $(`${q.id}_other`).value.trim();
    return txt ? `Other: ${txt}` : "";
  }
  return checked.value;
}

function validate() {
  let firstInvalid = null;
  const mark = (key, bad) => {
    const field = document.querySelector(`[data-field="${key}"]`);
    field.classList.toggle("invalid", bad);
    if (bad && !firstInvalid) firstInvalid = field;
  };

  mark("fullName", !$("fullName").value.trim());
  mark("phone", !PHONE_RE.test(phone.value.trim()));
  mark("tempAddress", !tempAddress.value.trim());
  mark("permAddress", !permAddress.value.trim());

  QUESTIONS.forEach((q) => {
    const checked = document.querySelector(`input[name="${q.id}"]:checked`);
    let bad = q.required && !checked;
    if (
      checked &&
      checked.value === "Other" &&
      !$(`${q.id}_other`).value.trim()
    )
      bad = true;
    mark(q.id, bad);
  });

  if (firstInvalid) {
    firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
    const focusable = firstInvalid.querySelector("input");
    if (focusable)
      setTimeout(() => focusable.focus({ preventScroll: true }), 300);
  }
  return !firstInvalid;
}

/* ----- Submit ----- */
const form = $("visitorForm");
const btn = $("submitBtn");
const statusBox = $("formStatus");
const thankYou = $("thankYou");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  statusBox.hidden = true;
  if (!validate()) return;

  // Keys must match the column headers in google-apps-script.gs
  const data = new URLSearchParams({
    "Full Name": $("fullName").value.trim(),
    "Phone Number": phone.value.trim(),
    "Temporary Address": tempAddress.value.trim(),
    "Permanent Address": permAddress.value.trim(),
  });
  QUESTIONS.forEach((q) => data.append(q.title[0], getChoiceValue(q)));

  if (!SCRIPT_URL || SCRIPT_URL.startsWith("PASTE_")) {
    showError(
      "Form is not connected yet. Add your Google Apps Script URL in script.js.",
    );
    return;
  }

  btn.disabled = true;
  btn.classList.add("loading");
  btn.querySelector(".btn-label").textContent = "Submitting… / पठाउँदै…";

  try {
    // Google Apps Script redirects its reply to another domain, which browsers
    // block from being read (CORS). "no-cors" sends the data reliably;
    // the row is still saved, we just can't read the reply.
    await fetch(SCRIPT_URL, { method: "POST", mode: "no-cors", body: data });

    form.hidden = true;
    thankYou.hidden = false;
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (err) {
    console.error(err);
    showError(
      "Could not submit. Please check your internet connection and try again. / पठाउन सकिएन, कृपया इन्टरनेट जाँच गरी फेरि प्रयास गर्नुहोस्।",
    );
  } finally {
    btn.disabled = false;
    btn.classList.remove("loading");
    btn.querySelector(".btn-label").textContent = "Submit / पेश गर्नुहोस्";
  }
});

function showError(msg) {
  statusBox.textContent = msg;
  statusBox.hidden = false;
}

/* ----- New response ----- */
$("newResponseBtn").addEventListener("click", () => {
  form.reset();
  permAddress.readOnly = false;
  document
    .querySelectorAll(".other-input")
    .forEach((o) => o.classList.remove("show"));
  document
    .querySelectorAll(".field.invalid")
    .forEach((f) => f.classList.remove("invalid"));
  thankYou.hidden = true;
  form.hidden = false;
  $("fullName").focus();
});

btn.querySelector(".btn-label").textContent = "Submit / पेश गर्नुहोस्";
$("year").textContent = new Date().getFullYear();
