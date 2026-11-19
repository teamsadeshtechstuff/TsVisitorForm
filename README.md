# Team Sandesh — Visitor Registration Form

A step-by-step visitor form (HTML/CSS/JS) that saves each submission as a row in Google Sheets.

## Files
| File | Purpose |
|---|---|
| `index.html` | Page layout and the six form steps + review |
| `style.css` | Design (Team Sandesh brand colours) |
| `script.js` | Questions, step navigation, validation, submission |
| `logo.png` | Logo |
| `google-apps-script.gs` | Google Sheets backend (copy of the deployed Apps Script) |

## How it works
- One section per screen: Your details → Address → Course → How you found us → Your visit → Follow-up → Review.
- Single-answer steps move on automatically after a choice (except "Other", which asks for text).
- Keyboard: **Enter** continues; **A–I** picks an option; **Y / N** answers the follow-up question.
- After submitting, the thank-you screen resets for the next visitor after 10 seconds
  (change `RESET_SECONDS` in `script.js`).

## Google Sheets connection
`SCRIPT_URL` at the top of `script.js` must be the Web app URL from
**Apps Script → Deploy → Manage deployments** (starts with `https://script.google.com/macros/s/` and ends in `/exec`).
The deployment must use **Execute as: Me** and **Who has access: Anyone**.

After changing the Apps Script code, publish it with
**Deploy → Manage deployments → pencil → Version: New version → Deploy**.

## Updating the files (important)
`index.html` loads `style.css?v=3` and `script.js?v=3`. Whenever you change any file,
change `v=3` to a new number (v=4, v=5…) in **index.html** in all places.
Browsers then load the new files instead of old saved copies.

## Hosting
Fully static — upload the folder to Netlify, GitHub Pages, Vercel or any web host.
On a reception tablet, open the URL and use **Add to Home Screen**.
