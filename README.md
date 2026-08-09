# PlaceTrack 🎓
### Smart Campus Placement Management Platform

PlaceTrack is a production-grade, highly-secured, responsive MERN-stack web application designed for colleges and universities to manage the complete campus recruitment drive lifecycle. 

---

## 📁 Folder Structure

```
pod.ai/
├── package.json         # Root scripts registry
├── backend/
│   ├── config/          # db.js connection, jwt.js token helpers
│   ├── controllers/     # Business logic modules (auth, profile, jobDrive, recruitment, system)
│   ├── middleware/      # authMiddleware, roleMiddleware, uploadMiddleware, auditMiddleware
│   ├── models/          # Mongoose database schemas (User, Academic, JobDrive, Recruitment, System)
│   ├── routes/          # Express route bindings (auth, student, company, jobDrive, recruitment, system)
│   ├── services/        # Email (Nodemailer), Sockets (Socket.IO), and AI (Google Gemini integrations)
│   ├── utils/           # Database seed script (seedData.js)
│   ├── server.js        # Main server entrypoint
│   └── package.json
└── frontend/
    ├── src/
    │   ├── assets/      # Mockup dashboards graphics
    │   ├── components/  # Navbars, Sidebars, Topbars, StatCards, UI form inputs
    │   ├── context/     # AuthContext, NotificationContext with Socket hooks
    │   ├── layouts/     # DashboardLayout grid wrappers
    │   ├── pages/       # Home page, Auth screens, dashboards for 4 roles
    │   ├── routes/      # Protected Route gates
    │   ├── services/    # Axios client interceptors API client
    │   ├── index.css    # Tailwind CSS v4 styling tokens
    │   ├── App.jsx      
    │   └── main.jsx
    ├── index.html       Vite wrapper template
    ├── vite.config.js   Vite config mapping proxies
    └── package.json
```

---

## ⚡ Local Startup Guide

Follow these steps to spin up the local server:

### 1. Requirements
- Make sure a local instance of **MongoDB** is running on your machine (default `mongodb://localhost:27017/placetrack`), or replace the connection string in `backend/.env`.
- Make sure Node.js (v18+) is installed.

### 2. Seeding Database
Wipe and seed the database with mock records (20 Students, 5 Recruiters, 8 Jobs, 5 Drives, timelines and placement scores) to populate dashboards immediately:
```bash
cd backend
npm run seed
```

### 3. Spin Up Backend
Start the Express server on port 5050:
```bash
cd backend
npm start
```

### 4. Spin Up Frontend
Start the Vite dev server on port 3050:
```bash
cd ../frontend
npm run dev
```
Open [http://localhost:3050](http://localhost:3050) in your web browser.

---

## 🔑 Demo Login Credentials

You can sign in immediately using these seeded mock accounts (all passwords use matching standard format):

| Role | Account Email | Passcode | Description |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@placetrack.com` | `Admin@123` | Inspects system metrics and audit log lists. |
| **Placement Manager** | `manager@placetrack.com` | `Manager@123` | Verifies student documents, registers recruiters, and reviews report CSV sheets. |
| **Recruiter (Microsoft)** | `recruiter@microsoft.com` | `Recruiter@123` | Posts jobs/drives, adds rounds, shortlists, schedules interviews, and grades scores. |
| **Student** | `student1@placetrack.com` | `Student@123` | Updates profile, uploads resume, evaluates drive eligibility, reviews round progress. |

---

## 📡 REST API Documentation

All API requests contain header `Authorization: Bearer <accessToken>` once authenticated.

### Authentication Module
* `POST /api/auth/register` : Create accounts (maps student/recruiter structures).
* `POST /api/auth/login` : Credentials verification (returns tokens and user info).
* `POST /api/auth/refresh` : Generates new access token via refresh token caches.

### Academic Profiles & Document Audits
* `GET /api/students` : Returns student list (Manager/Admin only).
* `GET /api/students/:id` : Fetch candidate profile details.
* `PUT /api/students/:id` : Edit student academic standing.
* `POST /api/students/resume` : Uploads PDF resume (saves to local disk storage).
* `POST /api/students/documents` : Submits marks sheet certificate.
* `PUT /api/students/:id/documents/verify` : Verified or rejects uploaded files.

### Jobs & Drives Configurations
* `POST /api/jobs` : Recruiter posts a new Job.
* `GET /api/jobs` : List available job offerings.
* `POST /api/drives` : Schedule placement drive events.
* `GET /api/drives/:id` : Evaluates candidate CGPA eligibility engine on the fly.
* `POST /api/drives/:driveId/rounds` : Constructs dynamic round stages.

### Selections Workflow Progression
* `POST /api/applications` : Student applies to drive.
* `GET /api/applications/:id` : Compiles horizontal round status timelines.
* `POST /api/results` : Grades scores (Passed students promoted to next round).
* `POST /api/interviews` : Schedules Teams/Zoom interview meetings.
* `POST /api/placements` : Issues company selection placements and records CTC.
* `PUT /api/placements/:id` : Student accepts/rejects offer letters.

---

## 🤖 Smart AI Core Services

AI capabilities are configured in a standalone service file `backend/services/aiService.js`. If no API key is provided, high-fidelity mock results are generated to ensure a seamless dashboard experience:
1. **ATS Resume Scorecard**: Runs metrics audits, parses project details, and alerts on missing skills tags.
2. **AI Career Chatbot**: Conversation panel answering personal registration, interview calendar, or preparational questions.
3. **Mock Interviews Evaluator**: Evaluates student test inputs for specific job descriptions and grades scores out of 100 with STAR methodology hints.
