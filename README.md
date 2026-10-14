# 🚀 Hacktoberfest 2026 — Week 2 Challenge: Side Hustle

## Project: **TutorLoop**
> **A 100% Local-First Session Closer for Student Tutors**  
> *Powered by Google Gemma 2 (via Ollama) + Next.js 16 + SQLite*

### 📁 Directory Structure
- [`tutorloop/`](file:///d:/CP%20Competitions/Hactoberfest/Week2/tutorloop): Full Next.js application codebase
  - [`src/app/page.tsx`](file:///d:/CP%20Competitions/Hactoberfest/Week2/tutorloop/src/app/page.tsx): Main application tab router (Session Closer, Dashboard, Students, Settings)
  - [`src/lib/gemma.ts`](file:///d:/CP%20Competitions/Hactoberfest/Week2/tutorloop/src/lib/gemma.ts): Google Gemma 2 Ollama connector & zero-setup local simulation engine
  - [`src/lib/db.ts`](file:///d:/CP%20Competitions/Hactoberfest/Week2/tutorloop/src/lib/db.ts): SQLite schema & initial seed data
  - [`src/components/SessionCloser.tsx`](file:///d:/CP%20Competitions/Hactoberfest/Week2/tutorloop/src/components/SessionCloser.tsx): Core AI closer workflow
  - [`src/components/InvoiceModal.tsx`](file:///d:/CP%20Competitions/Hactoberfest/Week2/tutorloop/src/components/InvoiceModal.tsx): Printable receipt / PDF view
  - [`src/components/DashboardView.tsx`](file:///d:/CP%20Competitions/Hactoberfest/Week2/tutorloop/src/components/DashboardView.tsx): Financial ledger and past session records
  - [`src/components/StudentsView.tsx`](file:///d:/CP%20Competitions/Hactoberfest/Week2/tutorloop/src/components/StudentsView.tsx): Student roster, rates, and parent contact management
  - [`src/components/SettingsView.tsx`](file:///d:/CP%20Competitions/Hactoberfest/Week2/tutorloop/src/components/SettingsView.tsx): Payment handles, currency, and Ollama configuration
- [`DEV_SUBMISSION_DRAFT.md`](file:///d:/CP%20Competitions/Hactoberfest/Week2/DEV_SUBMISSION_DRAFT.md): Complete, ready-to-post Dev.to challenge submission article with judging criteria, "Why Open Innovation" story, and first-user results.

### 🏃‍♂️ Running the Project
\`\`\`bash
cd tutorloop
npm install
npm run dev
\`\`\`
Open [http://localhost:3000](http://localhost:3000) in your browser.

