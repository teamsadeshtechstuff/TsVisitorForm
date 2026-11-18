# Team Sandesh — Visitor Registration Form

A static visitor form (HTML/CSS/JS) that saves each submission as a row in Google Sheets.

## Files
| File | Purpose |
|---|---|
| `index.html` | The form page |
| `style.css` | Styling in Team Sandesh brand colours |
| `script.js` | Questions, validation and submission |
| `logo.png` | Logo |
| `google-apps-script.gs` | Backend that writes to Google Sheets |

## Connect to Google Sheets (about 5 minutes)

1. Create a new Google Sheet, e.g. **Team Sandesh - Visitor Registration Responses**.
2. In the sheet, open **Extensions → Apps Script**.
3. Delete the sample code, paste in all of `google-apps-script.gs`, and save.
4. Select **setupSheet** in the function dropdown and click **Run**. Approve the permissions.
   This creates a "Visitor Responses" tab with the column headers.
5. Click **Deploy → New deployment** → gear icon → **Web app**:
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Click **Deploy** and copy the **Web app URL** (it ends in `/exec`).
6. Open `script.js` and paste the URL into the line:
   ```js
   const SCRIPT_URL = "https://script.google.com/macros/s/XXXX/exec";
   ```
7. Open `index.html`, submit a test entry and check that it appears in the sheet.

> If you change the Apps Script later, go to **Deploy → Manage deployments → Edit → Version: New version**
> so the same URL serves the updated code.

## Hosting
The site is fully static. Upload the folder to any of these:
- **GitHub Pages**, **Netlify** (drag and drop the folder) or **Vercel**
- Your own web hosting (cPanel `public_html`)

On a reception tablet, open the URL in a browser and use **Add to Home Screen** so it works like an app.
