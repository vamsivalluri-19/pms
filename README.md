# PlaceTrack 🎓 
### Smart Campus Placement Management Platform

PlaceTrack is a production-grade, highly secure, fully responsive monorepo application designed for colleges and universities to manage the complete campus recruitment drive lifecycle. Featuring real-time signaling, AI integrations, dynamic document verification, and in-platform Google-Meet-style video interview rooms.

---

## 🚀 Key Modules & System Features

### 1. 📹 In-Platform Video Interviews (Google Meet Clone)
No external redirects needed. PlaceTrack hosts real-time video interview rooms directly inside your browser:
* **WebRTC Peer Streaming**: High-fidelity, direct peer-to-peer audio and video transmission via custom Socket.io room-signaling.
* **Camera & Screen Share**: Toggle webcam feeds or share screens natively with active track swapping.
* **Collapsible Meeting Chat**: Real-time broadcast chat panel allowing participants to exchange text feedback during the call.
* **Interactive AI Simulator**: Toggles a mock recruiter feed with simulated webcam rendering and progressive chat messages—ideal for testing connection streams alone.

### 2. 📝 ATS-Friendly Resume Builder
A dedicated utility allowing students to compile resumes matching hiring formats:
* **Overleaf-style LaTeX Templates**: Select from Classic LaTeX (Academic Serif), Modern Tech (Sans-Serif), or Executive Two-Column layouts.
* **Smart Pre-fill**: Dynamically fetches details directly from student academic standing, skills, and personal information.
* **Interactive List Editor**: Create and manage customizable rows for education, projects (with repo links), experience, certifications, and achievements.
* **Live Print-to-PDF**: Renders a live preview frame on-screen and utilizes native browser print overrides to export a 100% text-selectable, ATS-compatible PDF.

### 3. 🤖 Google Gemini AI Core Services
Integrated via native endpoints (`backend/services/aiService.js`) to provide automated placement assistance:
* **ATS Resume Analyzer**: Scores formatting, analyzes ATS keywords, and suggests critical missing skills.
* **AI Coordinator Assistant**: A custom student/recruiter chatbot trained on profiles to answer eligibility questions, write job descriptions, and conduct interactive mock coding practices.
* **Technical mock Evaluator**: Scores student technical answers for job titles and suggests corrections based on the STAR methodology.

### 4. 🔑 Multi-Role Dashboards & Admin Controls
* **Admin Portal**: Restricted authorization block. Manage system logins, toggle user status (Active/Suspended), audit department listings, and review audit logs.
* **Placement Manager**: Approve corporate registrations, audit student marksheets, and schedule campus-wide drives.
* **Recruiter Dashboard**: Post job descriptions, schedule drives, shortlists applicants, grade scores, and enter live call rooms.
* **Student Dashboard**: Track active selection stages, Accept/Reject job offer letters, and calculate matching drive eligibility.

---

## 📁 Monorepo Folder Structure

```
pms/
├── package.json               # Root scripts registry
├── deployment_guide.md        # Step-by-step Render & Vercel deployment guide
├── backend/
│   ├── config/                # Database connection helper
│   ├── controllers/           # Auth, Profile, JobDrive, Recruitment, System controllers
│   ├── middleware/            # Security verification, file uploads, role checking
│   ├── models/                # User, Academic, JobDrive, Recruitment, System Mongoose schemas
│   ├── routes/                # Express API endpoint mappings
│   ├── services/              # Nodemailer transport, Socket.io, Gemini AI services
│   ├── utils/                 # seedData.js, clearDemoData.js scripts
│   ├── server.js              # Main Express server entrypoint
│   └── package.json
└── frontend/
    ├── vercel.json            # Vercel SPA routing rewrites
    ├── vite.config.js         # Vite dev configs and local proxy definitions
    ├── src/
    │   ├── assets/            # Mockup layout graphics
    │   ├── components/        # Sidebar, Header, ResumeTemplates components
    │   ├── context/           # AuthContext, NotificationContext mappings
    │   ├── layouts/           # DashboardLayout grid containers
    │   ├── pages/             # Auth pages, Admin, Company, Student, Manager dashboards
    │   ├── routes/            # Route guarding middleware
    │   ├── services/          # Axios interceptors API client
    │   ├── App.jsx            # Routing configurations
    │   └── main.jsx           # Vite startup script
    └── package.json
```

---

## ⚡ Local Setup & Development

Follow these steps to configure your local development environment:

### 1. Requirements
* Node.js (v18+) and npm installed.
* Local MongoDB running (`mongodb://localhost:27017/placetrack`) or MongoDB Atlas string configured in `backend/.env`.

### 2. Setup Environment Variables
Create a `.env` file in the `backend/` folder:
```env
PORT=5050
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=supersecurejwtaccesssecret
JWT_REFRESH_SECRET=supersecurejwtrefreshsecret
GEMINI_API_KEY=your_gemini_api_key
FRONTEND_URL=http://localhost:3050
GOOGLE_CLIENT_ID=your_google_oauth_web_client_id.apps.googleusercontent.com
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
```

Create `frontend/.env` from `frontend/.env.example`. Google Sign-In is optional: when both matching Google client IDs are present, the Google button is enabled. If either value is absent, the secure email/password sign-in stays available without an error.

### 3. Install Dependencies
From the root directory, run:
```bash
npm run install-all
```

### 4. Database Seeding & Mock Data
Clear and populate the database with mock records (20 Students, 5 Recruiters, 8 Jobs, 5 Drives, timelines, and placement scores):
```bash
cd backend
npm run seed
```

### 5. Running the Application
From the root directory, open two terminals and run:
* **Terminal 1 (Backend)**: `npm run dev-backend` (Starts server on port `5050`)
* **Terminal 2 (Frontend)**: `npm run dev-frontend` (Starts Vite server on port `3050`)

Open [http://localhost:3050](http://localhost:3050) in your web browser.

---

## 🔑 Demo Access Credentials

You can sign in immediately using these seeded mock accounts:

| Role | Account Email | Passcode | Description |
| :--- | :--- | :--- | :--- |
| **Admin** | `vamsivalluri52@gmail.com` | `Vamsi@1912` | Restricted admin profile (Vamsi Valluri). Manage accounts, configure departments, audit logs. |
| **Placement Manager** | `manager@placetrack.com` | `Manager@123` | Verifies marksheet credentials and company approvals. |
| **Recruiter (Microsoft)** | `recruiter@microsoft.com` | `Recruiter@123` | Posts jobs, schedules drives, grades candidate scores, enters interview rooms. |
| **Student** | `student1@placetrack.com` | `Student@123` | Uses resume analyzer, builds ATS resumes, reviews eligibility, launches video interviews. |

---

## 📡 REST API Map

All API requests contain header `Authorization: Bearer <accessToken>` once authenticated.

### Authentication & Recovery
* `POST /api/auth/register` : Registrations (checks admin email locks).
* `POST /api/auth/login` : Login credentials mapping.
* `POST /api/auth/forgot-password` : Sends security token reset email.
* `POST /api/auth/reset-password/:token` : Resets user password.

### Student Profiles & Documents
* `GET /api/students` : Returns student directory.
* `PUT /api/students/:id` : Edits student profiles.
* `POST /api/students/resume` : Uploads candidate PDF resume.
* `POST /api/students/documents` : Submits marksheet for verification.
* `PUT /api/students/:id/documents/verify` : Approved/Reject document uploads (Managers only).

### Recruitment & Drives Workflow
* `POST /api/jobs` : Creates a new job posting.
* `POST /api/drives` : Schedules a campus recruitment drive.
* `POST /api/applications` : Applies student to drive (CGPA checker triggers).
* `POST /api/results` : Grades student round performance.
* `POST /api/interviews` : Auto-generates local interview room link.
* `POST /api/placements` : Issues placement selection offers.

---

## 🌐 Production Deployment Summary

For full deployment steps, configurations, and environment checklists, please refer to the detailed [deployment_guide.md](file:///c:/Users/VAMSI%20VALLURI/Downloads/pod.ai/deployment_guide.md) in the project directory.

* **Backend**: Hosted on **Render** (Root directory: `backend`).
* **Frontend**: Hosted on **Vercel** (Root directory: `frontend`).
