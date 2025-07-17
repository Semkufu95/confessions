# 🕵️ Anonymous Confession Platform (Confessify MVP)

A full-stack web application where users can **anonymously post confessions** (threads) and **others can comment** publicly. Each user must register to comment, while confessions remain anonymous. Admin users can moderate the content.

---

## ⚙️ Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React + Tailwind CSS                |
| Backend   | Golang + Fiber Framework            |
| Database  | PostgreSQL                          |
| ORM       | GORM                                |
| Auth      | JWT + Middleware                    |
| API Comm. | Axios                               |

---

## 🚀 Features

### 👤 Users
- Register/Login with email and password
- Can post public (non-anonymous) comments on confessions
- Cannot edit/delete others’ comments or confessions

### 😶 Confessions
- Posted **anonymously**
- Visible to all users
- Viewable as a threaded conversation

### 🧑‍⚖️ Admin
- Can delete inappropriate confessions/comments
- Has a special admin account

---

## 🗂️ Project Structure

```
📁 backend/
├── cmd/main.go
├── config/config.go
├── controllers/
├── middlewares/
├── models/
├── routes/
└── utils/

📁 frontend/
├── public/
├── src/
│   ├── api/
│   ├── auth/
│   ├── components/
│   ├── pages/
│   └── App.js
└── tailwind.config.js
```

---

## 🔧 Backend Setup (Golang)

### 1. Clone + Install
```bash
cd backend
go mod tidy
```

### 2. Set Environment Variables

Create a `.env` file:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=confessions_db
JWT_SECRET=your_jwt_secret
```

### 3. Run the API

```bash
go run cmd/main.go
```

API runs at: `http://localhost:5000`

---

## 💻 Frontend Setup (React)

### 1. Install & Run

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## 🔐 Auth Flow (JWT)

- On login/register, a token is returned:
```json
{ "token": "eyJhbG..." }
```

- This token must be stored in `localStorage` and sent with each request:
```http
Authorization: Bearer <token>
```

- Protected routes:
  - `POST /api/confessions`
  - `POST /api/confessions/:id/comments`
  - `DELETE /api/admin/*`

---

## 📦 API Overview

### Auth
| Method | Route          | Description     |
|--------|----------------|-----------------|
| POST   | `/api/register`| Register account|
| POST   | `/api/login`   | Login and get JWT|

### Confessions
| Method | Route                     | Description                  |
|--------|---------------------------|------------------------------|
| GET    | `/api/confessions`        | List all confessions         |
| POST   | `/api/confessions`        | Create anonymous confession  |
| GET    | `/api/confessions/:id`    | Get confession + comments    |

### Comments
| Method | Route                             | Description        |
|--------|-----------------------------------|--------------------|
| POST   | `/api/confessions/:id/comments`   | Post a comment     |

---

## 🧪 Dev Tools

### Health Check Route (optional):
```http
GET /ping
→ { "message": "pong 🎯" }
```

---

## 🐳 Docker (Optional)

**Docker setup available soon...**
---

## 👨‍💻 Author

Built by [Athuman SEmkufu], powered by Fiber + PostgreSQL + React.  
PRs and feedback welcome!

---

## 📜 License

MIT — feel free to use, adapt, and ship fast 🚀