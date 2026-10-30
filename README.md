# ACTIVIA | School Activity Universe
> **Next-Generation 3D Interactive School Activity Management & Student Engagement Platform**

[![Vite](https://img.shields.io/badge/Vite-6.4-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Three.js](https://img.shields.io/badge/Three.js-3D%20Galaxy%20%26%20Campus-000000?logo=three.js&logoColor=white)](https://threejs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Build](https://img.shields.io/badge/Build-Passing%20(Zero%20Errors)-success)](#)

---

## 🌟 1. Platform Overview

**ACTIVIA | School Activity Universe** is an all-in-one, modern, enterprise-grade co-curricular activity and student engagement platform designed specifically for primary, secondary, and senior school ecosystems.

It bridges the divide between students, faculty mentors, activity coordinators, and school administrators through an interactive spatial 3D experience, seamless registration and team management, real-time feedback loops, and verified achievement credentials.

---

## 🚀 2. Signature Highlights & Modules

### 🪐 Interactive 3D Spatial Environments
- **3D Activity Galaxy Hub:** A dynamic planetary cosmos built with Three.js featuring 8 orbiting planetary sectors (STEM, Science, Athletics, Performing Arts, Debate, Leadership, Community Service, Clubs) with real-time star particle fields and sector filtering.
- **3D Miniature Campus Map:** An isometric digital twin of the school grounds featuring interactive buildings (STEM Center, Main Hall, Athletics Arena, Library, Arts Pavilion) displaying resident clubs, facility capacity, and scheduled events.

### 🎓 Student Experience & Discovery
- **Personalized Student Dashboard:** Activity streaks, extracurricular point tallies, urgent notifications, and quick-action launcher.
- **Activity Discovery Hub:** Real-time seat tracking, category tags, prerequisite alerts, search, and instant modal registration.
- **Competitions & Team Workspace:** 12-stage milestone roadmap, team formation with 6-character secret invite codes, and a drag-and-drop interactive Kanban task board (To-Do, In Progress, Review, Done).
- **Clubs Directory & House Standings:** Live House Cup points leaderboard (Phoenix, Solaris, Titan, Aquila) with dynamic rankings and 1-click club membership toggling.
- **Academic & Event Calendar:** Chronological month grid, clash-prevention indicators, agenda feed, and standardized `.ics` calendar file export.
- **Verified Achievement Portfolio:** Interactive 3D Star Constellation displaying student milestones, tamper-proof verification IDs, and printable certificate records.
- **Student Voice & Feedback:** Transparent school community ticketing portal for proposals, complaints, and inquiries with status progression badges.

### 👩‍🏫 Staff & Faculty Cockpit
- **Pending Approvals Queue:** 1-click review, approve, or reject student registration requests with capacity checks.
- **Activity Creation Wizard:** Design new school events with custom dates, venues, capacities, prerequisites, and house eligibility.
- **Mentoring & Team Oversight:** Track student competition milestones and task completion progress.

### 🏛️ Administrator Command Centre
- **School-Wide Analytics:** Real-time metrics for student participation, active events, facility utilization, and verified hours.
- **Emergency Broadcast System:** Post school-wide alert banners with priority visual styling across all student dashboards.
- **Audit Log Trail:** Immutable chronological log of administrative operations, setting changes, and user role updates.
- **Report Export:** 1-click CSV data export for academic boards and extracurricular accreditation.

### ⚡ Power Tools & Navigation
- **Multi-Role Persona Switcher:** Instant demo mode toggle between 5 distinct personas (Student Leaders, Student Athletes, Senior Teachers, Activity Coordinators, Principals).
- **Command Palette (`Ctrl+K`):** Universal keyboard-first search index across all activities, clubs, venues, and platform sections.

---

## 🛠️ 3. Technology Architecture

| Layer | Technologies | Key Features |
|---|---|---|
| **Core Framework** | React 18, TypeScript 5.6 | Strict type-safety, reusable component hierarchy, zero TS errors |
| **Styling & Theme** | Tailwind CSS, Lucide Icons | Responsive modern design, dark/light modes, smooth animations |
| **3D Rendering** | Three.js | Planetary galaxy shaders, particle systems, interactive campus models |
| **Build & Tooling** | Vite 6 | Sub-second HMR, tree-shaking, high-efficiency production bundles |
| **Local Persistence** | TypeScript In-Memory & LocalStore | Instant role switching, state persistence, pre-seeded sample data |

---

## 💻 4. Getting Started

### Prerequisites
- Node.js v18+ (Node.js v20+ recommended)
- npm v9+

### Setup & Run

1. **Clone & Install Dependencies:**
   ```bash
   npm install
   ```

2. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:5173/`.

3. **Check TypeScript Type Integrity:**
   ```bash
   npx tsc --noEmit
   ```

4. **Build for Production:**
   ```bash
   npm run build
   ```

---

## 🎭 5. Pre-Seeded Demo Personas

Switch personas instantly using the user profile menu in the top-right header:

| Name | Role | Grade / Department | Speciality |
|---|---|---|---|
| **Maya Chen** | Student | Grade 11-A | Robotics Lead & Science Club Member |
| **Alex Rivera** | Student | Grade 10-C | Track & Field Athlete & Debate Enthusiast |
| **Dr. Robert Vance** | Teacher | Science & Innovation | Head of Robotics & Physics Faculty |
| **Sarah Jenkins** | Coordinator | Student Affairs | Inter-House Events & Community Service Lead |
| **Eleanor Sterling** | Administrator | Principal's Office | School-wide Governance & Compliance |

---

## 📋 6. Competition & Presentation Guide
A structured 10-minute presentation walkthrough and demonstration script is available in [PRESENTATION_SCRIPT.md](./PRESENTATION_SCRIPT.md).
