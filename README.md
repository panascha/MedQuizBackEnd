# MedQuizBackEnd

MedQuizBackEnd is the backend API for the MedQuiz application, built with Node.js, Express, and MongoDB. It provides RESTful endpoints for user authentication, quiz management, scoring, reporting, and administrative features.

---

## Table of Contents
- [Features](#features)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Docker Usage](#docker-usage)
- [API Endpoints](#api-endpoints)
- [Data Models](#data-models)

---

## Features
- User registration, login, and role-based authentication (user, admin, S-admin)
- Quiz creation, filtering, updating, and deletion
- Category and subject management
- Keyword and report submission and approval
- Scoring and statistics tracking
- File upload for quiz and subject images
- Security: JWT, XSS/mongo sanitization, Helmet, CORS

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB database (local or Atlas)

### Installation
1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd MedQuiz/BackEnd
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file at `config/config.env` (see [Environment Variables](#environment-variables)).
4. Start the server:
   ```bash
   npm run dev
   ```
   The server will run on `http://localhost:5000` by default.

---

## Environment Variables
Create `config/config.env` with the following:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=<your-mongodb-uri>
JWT_SECRET=<your-jwt-secret>
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30
```

---

## Available Scripts
- `npm run dev` — Start server with nodemon (development)
- `npm start` — Start server (production)

---

## Docker Usage
Build and run the backend in a Docker container:
```bash
docker build -t medquiz-backend .
docker run -p 5000:5000 --env-file ./config/config.env medquiz-backend
```

---

## API Endpoints
All endpoints are prefixed with `/api/v1/`

### Auth
- `POST   /auth/register` — Register a new user
- `POST   /auth/login` — Login and receive JWT
- `GET    /auth/logout` — Logout (protected)
- `GET    /auth/me` — Get current user info (protected)
- `PUT    /auth/updateUser/:id` — Update user info (protected)
- `GET    /auth/users` — List all users (admin only)
- `GET    /auth/user-exists` — Check if user exists by email

### Quiz
- `GET    /quiz` — List all quizzes (protected)
- `POST   /quiz` — Create a new quiz (protected, with images)
- `GET    /quiz/filter/:subjectID?/:categoryID?` — Filter quizzes
- `GET    /quiz/:id` — Get quiz by ID
- `PUT    /quiz/:id` — Update quiz (with images)
- `DELETE /quiz/:id` — Delete quiz (admin only)

### Score
- `GET    /score` — List all scores
- `POST   /score` — Submit a new score
- `GET    /score/user/:UserID` — Get scores by user
- `GET    /score/:id` — Get score by ID
- `PUT    /score/:id` — Update score
- `DELETE /score/:id` — Delete score

### Category
- `GET    /category` — List all categories
- `POST   /category` — Create a new category (admin only)
- `GET    /category/:id` — Get category by ID
- `PUT    /category/:id` — Update category (admin only)
- `DELETE /category/:id` — Delete category (admin only)
- `GET    /category/subject/:subjectID` — Get categories by subject

### Subject
- `GET    /subject` — List all subjects
- `POST   /subject` — Create a new subject (S-admin only, with image)
- `GET    /subject/:id` — Get subject by ID
- `PUT    /subject/:id` — Update subject (S-admin only, with image)
- `DELETE /subject/:id` — Delete subject (S-admin only)

### Keyword
- `GET    /keyword` — List all keywords
- `POST   /keyword` — Create a new keyword
- `GET    /keyword/approved` — List only approved keywords
- `GET    /keyword/:id` — Get keyword by ID
- `PUT    /keyword/:id` — Update keyword
- `DELETE /keyword/:id` — Delete keyword (S-admin only)
- `GET    /keyword/cate/:cateId` — Get keywords by category

### Report
- `GET    /report` — List all reports
- `POST   /report` — Create a new report
- `GET    /report/type/:type` — Get reports by type
- `GET    /report/user/:UserID` — Get reports by user
- `GET    /report/:id` — Get report by ID
- `PUT    /report/:id` — Update report (S-admin only)
- `DELETE /report/:id` — Delete report (S-admin only)

### Approved
- `GET    /approved` — List all approvals
- `POST   /approved` — Create a new approval (admin only)
- `GET    /approved/:id` — Get approval by ID
- `PUT    /approved/:id` — Update approval (admin only)
- `DELETE /approved/:id` — Delete approval (admin only)
- `POST   /approved/quiz/:quizID` — Approve quiz
- `POST   /approved/report/:reportID` — Approve report
- `POST   /approved/keyword/:keywordID` — Approve keyword

### Stat
- `GET    /stat/overall` — Get overall statistics (admin only)
- `POST   /stat/daily-activity` — Get daily activity stats (admin only)
- `GET    /stat/user-stats` — Get user statistics
- `GET    /stat/user-stats/:userId/:subjectId` — Get user stats by subject

### Upload
- `POST   /upload/subject` — Upload subject image (S-admin only)
- `POST   /upload/quiz` — Upload quiz images (user, admin, S-admin)

---

## Data Models

### User
- `email`, `password`, `name`, `year`, `role` (user/admin/S-admin), timestamps

### Quiz
- `user`, `question`, `subject`, `category`, `type` (choice/written/both), `status`, `choice`, `correctAnswer`, `img`, timestamps

### Score
- `user`, `Subject`, `Category`, `Score`, `FullScore`, `Question` (subdoc: Quiz, Answer, isCorrect), `timeTaken`, timestamps

### Subject
- `name`, `description`, `img`, `year`, timestamps

### Category
- `subject`, `category`, `description`, timestamps

### Keyword
- `user`, `name`, `subject`, `category`, `keywords` (array), `status`, timestamps

### Report
- `User`, `originalQuiz`, `suggestedChanges`, `originalKeyword`, `suggestedChangesKeyword`, `type`, `status`, `reason`, timestamps

### Approved
- `admin`, `quiz`, `report`, `keyword`, `type`, `Approved`, timestamps

### Blacklist
- `token`, timestamps

---

## License
ISC
