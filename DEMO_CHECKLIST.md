# CampusFlow — Live Competition Demonstration Checklist

Follow this checklist before and during the 10-minute competition presentation.

---

## 1. Pre-Event Laptop Setup (30 Minutes Before Presentation)

- [ ] **Node.js Environment Verified:** Ensure Node.js v20+ is active (`node -v`).
- [ ] **Dependencies Installed:** Run `npm install` to confirm all packages are resolved.
- [ ] **Database Re-Seeded:** Run `npm run seed` to ensure fresh, clean sample data.
- [ ] **Automated Tests Passed:** Run `npm test` and verify all 12 tests pass.
- [ ] **Production Build Created:** Run `npm run build` to compile the Vite frontend into `/dist`.
- [ ] **Application Started:** Run `npm start` (or `npm run dev`) and verify `http://localhost:5000` loads.
- [ ] **Browser Prepared:** Open `http://localhost:5000` in Google Chrome / Edge at 100% zoom (1920x1080 resolution).
- [ ] **Close Background Windows:** Close Slack, Discord, email notifications, and personal messaging apps.
- [ ] **Keep DevTools Closed:** Keep the browser clean and full-screen for a professional presentation.

---

## 2. Sequence of Actions During the 10-Minute Presentation

### Min 0:00 – 2:00: Problem Statement
- [ ] Presenter speaks to the audience; Demo Operator displays the landing hero section showing real database metric cards.

### Min 2:00 – 5:00: Platform Solution Demo
- [ ] Scroll down to the **Activity Discovery** section.
- [ ] Type `"Robotics"` in the search bar & demonstrate real-time card filtering.
- [ ] Clear search bar; select `"Literature & Debate"` from Department dropdown.
- [ ] Click **"Clear All Filters"**.
- [ ] Click on the **Robotics Showcase** activity card to open the **Activity Details Modal**.
- [ ] Point out date, duration, venue, organizer, capacity, and participation instructions.
- [ ] Click **"Add to Calendar (.ics)"** to show automated iCalendar export.
- [ ] Click **"Share Event"** to show link copy feedback; close modal.
- [ ] Click **"Schedule"** in the top navigation bar to showcase the chronological agenda grouped by date.
- [ ] Click **"Departments"** in top navbar to showcase the 6 campus department cards.

### Min 5:00 – 8:00: Administrator & Technical Deep-Dive
- [ ] Click **"Staff Admin Login"** in the top navigation bar.
- [ ] Click **"Auto-Fill"** to demonstrate instant credentials loading (`admin` / `CampusFlow2026!`).
- [ ] Click **"Sign In as Administrator"**.
- [ ] Highlight administrator metrics: Total, Published, Upcoming, Drafts, Completed, Cancelled.
- [ ] Click **"Add New Activity"** button.
- [ ] Fill in date, start time (`10:00`), end time (`12:00`), and venue (`Fieldhouse Court 1`).
- [ ] **Showcase Innovation 1 (Conflict Engine):** Show the live amber warning banner alerting that `Fieldhouse Court 1` is already booked for Varsity Basketball trials!
- [ ] Change venue to `"Innovation Hub - Room 204"` (warning disappears). Fill title `"AI Python Coding Camp"` and save.
- [ ] Show that the new record is now saved in the management table.
- [ ] **Showcase Innovation 2 (Database Inspector):** Click the **"Database Inspector (SQLite Engine)"** tab.
- [ ] Inspect raw tables: `activities`, `departments`, `administrators` (point out password hashes are masked to `[PROTECTED_SCRYPT_HASH]`), and `audit_logs`.
- [ ] Click the **"Audit Log Trail"** tab to show that creating `"AI Python Coding Camp"` was permanently logged.

### Min 8:00 – 10:00: Persistence Verification & Closing
- [ ] Refresh the browser (`F5` or `Ctrl+R`) to prove that data persists across browser reloads.
- [ ] Navigate back to **"Activities"** tab to show `"AI Python Coding Camp"` visible in the public feed.
- [ ] Summarize test coverage (12/12 passing) and future roadmap (QR check-in, SSO).
- [ ] Conclude and invite judges' questions.

---

## 3. Emergency Troubleshooting Cheat Sheet

| Symptom | Cause | Immediate Resolution |
|---|---|---|
| Port 5000 in use | Prior Node process still bound to port | Run `npx kill-port 5000` or `taskkill /F /IM node.exe` |
| Database corrupted / altered | Manual testing created bad test records | In Admin Panel, click **"Reset Demo Data"** or run `npm run seed` in terminal |
| Admin session logged out | 24-hour cookie expired | Click **"Staff Admin Login"** -> Click **"Auto-Fill"** -> Click **"Sign In"** (takes 3 seconds) |
| Offline / No Wi-Fi at competition venue | Venue network disconnect | **No impact!** CampusFlow runs 100% locally with zero external cloud or CDN dependencies |
