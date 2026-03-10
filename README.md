# MediCore — Digitised Medical Record System

A digitised medical record management system built for clinics.
Manage patients, doctors, and admins — all from a single browser tab.

---

## 🏥 System Overview

MediCore is a fully client-side web application that digitises clinic record-keeping.
It supports three user roles, each with their own dashboard and permissions.

| Role | Access |
|------|--------|
| **Admin** | Register patients, view all records, manage the clinic |
| **Doctor** | Search patients by ID or name, add visit notes |
| **Patient** | View personal medical history using Patient ID |

---

## 🚀 Getting Started

No installation required. No server needed. No npm. No build step.

**Just open the file in your browser:**
```
1. Download or clone this repository
2. Open medicore-full.html in any modern browser
3. That's it — the system is fully functional
```

---

## 🔑 Demo Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `admin123` |
| Doctor | `doctor` | `doc123` |
| Patient | *(use any generated Patient ID)* | — |

To get a Patient ID: log in as Admin → Register a new patient → copy the generated ID.

---

## 📁 Folder Structure
```
medicore/
│
├── medicore-full.html      # Complete application (single file)
├── medicalhistory.html     # Original MVP version (Week 3)
└── README.md               # This file
```

---

## 🛠️ Tech Stack

| Technology | Usage |
|------------|-------|
| HTML5 | Structure and layout |
| CSS3 | Styling, animations, responsive design |
| Vanilla JavaScript | All logic and interactivity |
| localStorage API | Data persistence (no backend needed) |

---

## ✨ Key Features

- **Role-based access** — Admin, Doctor, and Patient each see different dashboards
- **Patient registration** — Auto-generates unique Patient IDs
- **Medical records** — Add and view visit history with diagnosis and doctor notes
- **Persistent data** — All data saved in localStorage, survives page refresh
- **Works offline** — No internet connection required after first load
- **Responsive design** — Works on desktop and mobile

---

## 📊 Quality Highlights (Week 4)

| Attribute | Metric | Target |
|-----------|--------|--------|
| Reliability | Login success rate | 100% |
| Reliability | Data persistence rate | 100% |
| Performance | Page load time | < 1 second |
| Performance | Login response time | < 200ms |
| Performance | Search response time | < 100ms |
| Maintainability | Bug fix time (new dev) | < 30 minutes |

---

## 🔧 Refactoring Applied (Week 4)

Three code smells were identified and fixed:

1. **Duplicate Code** — `adminLogin()` and `doctorLogin()` were identical copy-paste functions. Fixed by merging into one `doLogin()` using a `STAFF` credentials object.

2. **God Function** — `loadDashboard()` did everything in 60+ lines. Fixed by splitting into 6 focused functions: `loadApp()`, `renderDashboard()`, `renderSearch()`, `renderMyRecords()`, `renderProfileInto()`, `saveRecord()`.

3. **Unclear Variable Names** — `x`, `y`, `z`, `d`, `r` used throughout. Fixed by renaming to `currentRole`, `currentUser`, `selectedPatientId`, `patients`, `medicalRecords`.

---

## 🌐 Deployment

This project can be deployed to any static hosting platform with zero configuration:

- **GitHub Pages** — push to repo, enable Pages in settings
- **Netlify** — drag and drop the HTML file
- **Vercel** — connect repo and deploy instantly

No environment variables. No build commands. No dependencies.

---

## 📝 Notes

- All data is stored in the browser's `localStorage` — clearing browser data will reset the system
- This is an academic project built under **IDEAL Labs — Software Engineering Week 4**
- The system is intentionally client-side only to demonstrate frontend fundamentals

---

*MediCore — IDEAL Labs | Software Engineering | Week 4 Evaluation*
