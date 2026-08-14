# Student Result Analytics Dashboard

Full-stack app (React + Node/Express + MySQL) to visualize student performance trends across semesters with role-based login (admin/student).

## Setup

### 1. Database
```bash
mysql -u root -p < server/schema.sql
```

### 2. Backend
```bash
cd server
npm install
# set DB_HOST, DB_USER, DB_PASSWORD, JWT_SECRET as needed
npm start
```

Runs on http://localhost:5000

### 3. Frontend
```bash
cd client
npm install
npm run dev
```

Runs on http://localhost:5173 (Vite default).

## Features
- JWT-based authentication with bcrypt password hashing
- Role-based views for admin and student users
- Normalized MySQL schema for users, students, semesters, subjects, and results
- REST APIs for registration, login, analytics, and student results
- React dashboard with Recharts visualizations and tabular breakdown
