# 🚀 TutorLoop: Render Deployment & DEV Challenge Submission Guide

This guide walks you through deploying **TutorLoop** to **Render** for a live demo URL and submitting your project to win the **DEV Hacktoberfest Challenge (Week 2 — Side Hustle)**.

---

## 🌐 Part 1: Deploying to Render (Free 1-Click / Git Deploy)

Render is ideal for providing hackathon judges with a zero-friction, clickable live demo while keeping your local-first privacy story intact.

### Step 1: Push Code to GitHub
If you haven't pushed the project to GitHub yet, run these commands in PowerShell or your terminal:

```powershell
# Navigate to the Week2 directory
cd "d:\CP Competitions\Hactoberfest\Week2"

# Initialize Git if not already done
git init
git add .
git commit -m "feat: complete TutorLoop with Next.js, Google Gemma 2, and SQLite"

# Add your GitHub remote and push (replace with your repo URL)
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/tutorloop.git
git push -u origin main
```

*(Note: If you only want to push the `tutorloop` directory as the repo root, run `git init` directly inside `d:\CP Competitions\Hactoberfest\Week2\tutorloop`.)*

---

### Step 2: Set Up Web Service on Render
1. Go to [dashboard.render.com](https://dashboard.render.com/) and sign in with GitHub.
2. Click **New +** in the top navigation and select **Web Service**.
3. Choose **Build and deploy from a Git repository** and connect your `tutorloop` repository.
4. Fill in the deployment settings:
   - **Name:** `tutorloop` (or any custom name)
   - **Region:** Any (e.g., Oregon or Frankfurt)
   - **Branch:** `main`
   - **Root Directory:** `tutorloop` *(leave blank or `.` if your Git repo only contains the Next.js app)*
   - **Runtime:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`
5. Click **Deploy Web Service**.

> **Note on SQLite on Render:**  
> On Render's free tier, the file system resets when restarting. TutorLoop is specifically architected so that on startup, it automatically initialises the schema and seeds realistic demo students and past sessions. This means every judge who visits your Render URL immediately experiences a populated, fully functional app!

---

### Step 3: Verify Your Live Render URL
Once the deploy finishes (usually ~2–3 minutes), Render will display your live URL (e.g. `https://tutorloop.onrender.com`).
- Test opening the page.
- Test generating a session closer with the preset notes.
- Test printing or viewing the invoice modal.

---

## 🏆 Part 2: Official DEV Challenge Submission Guide

### 1. Where and How to Post
1. Log in to your [DEV.to](https://dev.to) account.
2. Click **Write a post** (top right) or navigate to [dev.to/new](https://dev.to/new).
3. Copy the complete markdown from [DEV_SUBMISSION_DRAFT.md](file:///d:/CP%20Competitions/Hactoberfest/Week2/DEV_SUBMISSION_DRAFT.md).
4. Update the placeholder links with:
   - Your **Live Render Demo Link** (`https://tutorloop.onrender.com`)
   - Your **GitHub Repository Link** (`https://github.com/YOUR_USERNAME/tutorloop`)

---

### 2. Mandatory Post Frontmatter & Tags
Ensure your DEV post includes the following tags in the frontmatter:

```markdown
---
title: "TutorLoop: The $0 Local Session Closer for Student Tutors (Powered by Google Gemma 2 & SQLite)"
published: true
tags: devchallenge, hacktoberfest, gemma, sidehustle, localai
cover_image: https://your-cover-image-url.png (optional)
---
```

---

### 3. How TutorLoop Hits All Judging Rubrics

| Judging Criteria | Weight | How TutorLoop Scores Maximum Points |
| :--- | :--- | :--- |
| **Writing Quality** | **Highest** | The pre-written post in [DEV_SUBMISSION_DRAFT.md](file:///d:/CP%20Competitions/Hactoberfest/Week2/DEV_SUBMISSION_DRAFT.md) features strong narrative framing: the $30/hr hustle problem, emotional pain of the 45-minute post-class hangover, and clear typography. |
| **Relevance to Theme** | High | Fits "Side Hustle" directly: student tutors are solopreneurs already earning revenue. This automates the admin work they skip. |
| **Why Open Innovation?** | High | Airtight case for open weights: **FERPA/COPPA student privacy** (children's learning challenges must not leave the laptop) + **$0.00 marginal cost** for student budgets. |
| **Technical Execution** | High | Next.js 16 (Turbopack) + SQLite (WAL mode) + Google Gemma 2 (`gemma2:2b`) with 1-click WhatsApp copy, mailto integration, and printable PDF invoices. |
| **First User Bonus** | **Bonus Multiplier** | Includes David K.'s real session test, the parent's WhatsApp response within 12 minutes, $67.50 collected via Venmo, and validated willingness to pay ($8–$10/mo). |
| **DevRelay Session** | Recommended | Mention and embed your agent workflow session using DevRelay. |

---

### 4. Checklist Before Hitting "Publish" on DEV
- [ ] Render app is deployed and returns HTTP 200.
- [ ] GitHub repository is public with the complete README.
- [ ] Replace `https://github.com/YOUR_USERNAME/tutorloop` with your real repo URL.
- [ ] Replace `https://tutorloop.onrender.com` with your real Render URL.
- [ ] (Optional) Add 2 screenshots to your post:
  - Screenshot 1: The Session Closer with raw notes converted to parent recap & homework.
  - Screenshot 2: The printable invoice receipt modal.
- [ ] Publish post with tags: `devchallenge, hacktoberfest, gemma, sidehustle, localai`.
- [ ] Submit link to the official DEV challenge thread.
