# Classic Music Institute (`classicinstitute.com`)

Official website and fee management administrative portal for **Classic Music Institute**, Chandigarh's premier conservatory-aligned academy for musical education and international certifications.

---

## 🏛️ Institute Information

- **Institute Name:** Classic Music Institute
- **Domain:** `classicinstitute.com`
- **Campus Address:** SCO 64-65, 2nd Floor, Sector 34-A, Chandigarh - 160022, India
- **Admissions Hotline:** +91 98052 60021 / 9805260021
- **Studio Operating Hours:** Monday – Friday: 9:00 AM – 8:30 PM | Saturday: 9:30 AM – 7:00 PM (Masterclasses & Trials)
- **Color Theme:** Obsidian Navy (`#0A0F1D`, `#111A30`), Champagne Gold (`#D4AF37`, `#C9A050`), and Ivory (`#FBF9F5`)
- **Exam Board Affiliations:** Trinity College London, ABRSM (Royal Schools of Music), Rockschool (RSL Awards), Akhil Bharatiya Gandharva Mahavidyalaya

---

## 📂 Website Structure & Pages

### 1. Main Pages
- `index.html` — Homepage with Hero Audition Booking, 4 Pillars of Excellence, Instrument Showcase, Master Faculty Profiles, Testimonials, and Student FAQs.
- `about.html` — Conservatory heritage, pedagogy methodology, and Chandigarh sound-treated studio facilities.
- `services.html` — Master curriculum directory and 4-tier student progression roadmap.
- `classes.html` — Classes overview, interactive Monthly/Quarterly/Annual billing toggle, dynamic tuition packages, per-instrument fee matrix table, and value promise.
- `contact.html` — Chandigarh campus location, admissions inquiry form, direct WhatsApp integration, and interactive Google Map.

### 2. Dedicated Discipline Pages
- `piano-classes.html` — Classical Piano & Contemporary Keyboards
- `guitar-classes.html` — Acoustic, Classical Fingerstyle, and Electric Guitar
- `vocal-classes.html` — Hindustani Classical, Western Vocal, and Contemporary
- `violin-classes.html` — Western Classical & Carnatic Violin
- `tabla-percussion-classes.html` — Classical Tabla & Acoustic Drums
- `flute-wind-classes.html` — Indian Bamboo Bansuri & Western Concert Flute
- `music-theory-production.html` — ABRSM/Trinity Music Theory & Logic Pro Studio Production

### 3. Legal & Compliance Pages
- `privacy-policy.html` — Student privacy and data protection policy
- `disclaimer.html` — Accreditation and exam board disclaimers
- `terms-and-conditions.html` — Studio attendance, rescheduling, and tuition policy

---

## 🔐 Administrative Panel (`admin.html`)

A full-featured administrative console for managing tuition plans and fee packages on the public site.

- **URL / Path:** `admin.html`
- **Demo Staff Credentials:**
  - **Username:** `admin`
  - **Password:** `classic2026`
  - *(Or click the "1-Click Sign-In" button on the login screen)*

### Admin Panel Capabilities:
- **Add New Package:** Create custom fee packages with title, badge, monthly/quarterly/annual pricing, session taglines, and dynamic feature bullet lists.
- **1-Click Auto-Calculate:** Automatically computes 10% Quarterly and 20% Annual discounted fee structures from base monthly fees.
- **Edit Package:** Update existing fees, titles, and inclusions.
- **Delete Package:** Confirmation dialog to safely retire packages.
- **Duplicate Package (Copy):** Clone an existing plan with 1 click.
- **Active / Draft Status:** Toggle package visibility on `classes.html`.
- **Table & Card Views:** Switch between tabular admin layout and public preview cards.
- **Live Search & Sort:** Filter packages by name, status, or fee.
- **Export & Import JSON:** Backup and restore all package configurations.
- **Local Storage Engine:** Synchronizes changes across open browser tabs in real-time via `PackagesManager` (`js/packages-manager.js`).

---

## 🚀 Running the Project

No server-side installation or database required. The site is built with modern, semantic HTML5, CSS3, and vanilla JavaScript.

### Option 1: Direct Browser
Open `index.html` or `classes.html` directly in any web browser.

### Option 2: Local HTTP Server (VS Code Live Server / Python / Node)
```bash
# If Python is installed:
python -m http.server 8000

# Or using npx serve:
npx serve .
```

### Option 3: GitHub Pages
1. Go to repository **Settings** → **Pages**.
2. Under **Build and deployment**, select `Deploy from a branch`.
3. Choose branch `main` and folder `/ (root)`.
4. Click **Save**. Your site will be published at `https://rishika271006.github.io/classicmusicinstitute/`.

---

© 2026 Classic Music Institute (`classicinstitute.com`). All Rights Reserved.
