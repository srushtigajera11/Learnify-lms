# 📚 Learnify LMS

A full-stack Learning Management System (LMS) built with the MERN stack. Learnify allows tutors and admins to create and manage courses, while students can enroll, learn, track their progress, and earn certificates.

---

## 🚀 Live Demo

- **Frontend:** [https://learnify-lms-pi.vercel.app](https://learnify-lms-pi.vercel.app)
- **Backend API:** [https://your-render-url.onrender.com](https://your-render-url.onrender.com)

---

## ✨ Features

### 👩‍🎓 Student
- Register & login with JWT authentication
- Browse and enroll in courses
- Watch video lessons and view documents
- Track lesson-by-lesson progress
- Take quizzes and view results
- Earn certificates after passing the final quiz
- Wishlist courses
- View enrollment history
- Gamification & leaderboard

### 👨‍🏫 Tutor / Admin
- Create, edit, and delete courses
- Upload video and document lessons (via Cloudinary)
- Create quizzes for courses
- View student analytics and progress
- Manage users and roles
- Admin dashboard with full control

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React.js | UI framework |
| Tailwind CSS | Styling |
| Axios | HTTP requests |
| React Router | Client-side routing |
| React Toastify | Notifications |
| Lucide React | Icons |

### Backend
| Technology | Purpose |
|---|---|
| Node.js | Runtime |
| Express.js | Web framework |
| MongoDB | Database |
| Mongoose | ODM |
| JWT | Authentication |
| Bcrypt.js | Password hashing |
| Multer | File uploads |
| Cloudinary | Media storage |
| Cookie Parser | Cookie handling |
| Dotenv | Environment variables |

---

## 📁 Project Structure

```
Learnify-lms/
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   │   └── authContext.jsx
│   │   ├── Layout/
│   │   ├── pages/
│   │   └── utils/
│   │       └── axiosInstance.js
│   ├── public/
│   ├── .env
│   └── package.json
│
└── Backend/
    ├── config/
    │   └── db.js
    ├── controllers/
    ├── middleware/
    │   ├── authMiddleware.js
    │   └── errorHandler.js
    ├── models/
    ├── routes/
    ├── utils/
    ├── .env
    ├── server.js
    └── package.json
```

---

## ⚙️ Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- Cloudinary account

### 1. Clone the repository
```bash
git clone https://github.com/srushtigajera11/Learnify-lms.git
cd Learnify-lms
```

### 2. Setup Backend
```bash
cd Backend
npm install
```

Create a `.env` file in the `Backend` folder:
```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
NODE_ENV=development
```

Start the backend:
```bash
npm run dev       # development (nodemon)
npm start         # production (node)
```

### 3. Setup Frontend
```bash
cd Frontend
npm install
```

Create a `.env` file in the `Frontend` folder:
```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:
```bash
npm run dev
```

---

## 🔐 Authentication

Learnify uses **JWT-based authentication**:
- Token is returned in the login response and stored in `localStorage`
- Every request attaches the token via `Authorization: Bearer <token>` header
- Backend middleware validates the token on protected routes

### Roles
| Role | Access |
|---|---|
| `student` | Enroll, learn, track progress, earn certificates |
| `tutor` | Create and manage courses and lessons |
| `admin` | Full access including user management |

---

## 🌐 API Routes

### Users
| Method | Route | Description |
|---|---|---|
| POST | `/api/users/register` | Register a new user |
| POST | `/api/users/login` | Login user |
| POST | `/api/users/logout` | Logout user |
| GET | `/api/users/profile` | Get current user profile |
| PUT | `/api/users/profile` | Update profile |

### Courses
| Method | Route | Description |
|---|---|---|
| GET | `/api/courses` | Get all courses |
| POST | `/api/courses` | Create a course (Tutor/Admin) |
| GET | `/api/courses/:id` | Get course by ID |
| PUT | `/api/courses/:id` | Update course |
| DELETE | `/api/courses/:id` | Delete course |

### Lessons
| Method | Route | Description |
|---|---|---|
| POST | `/api/lessons` | Create lesson |
| GET | `/api/lessons/:courseId` | Get lessons for a course |
| PUT | `/api/lessons/:id` | Update lesson |
| DELETE | `/api/lessons/:id` | Delete lesson |

### Students
| Method | Route | Description |
|---|---|---|
| POST | `/api/students/enroll` | Enroll in a course |
| GET | `/api/students/enrolled` | Get enrolled courses |

### Progress
| Method | Route | Description |
|---|---|---|
| POST | `/api/progress` | Mark lesson complete |
| GET | `/api/progress/:courseId` | Get course progress |

### Quizzes
| Method | Route | Description |
|---|---|---|
| POST | `/api/quizzes` | Create quiz |
| GET | `/api/quizzes/:courseId` | Get quiz for course |
| POST | `/api/quiz-results` | Submit quiz result |

### Certificates
| Method | Route | Description |
|---|---|---|
| GET | `/api/certificates/:courseId` | Get certificate |

---

## 🚀 Deployment

### Backend → Render
1. Connect GitHub repo on [render.com](https://render.com)
2. Set **Root Directory** to `Backend`
3. Set **Build Command** to `npm install`
4. Set **Start Command** to `npm start`
5. Add all environment variables from `.env`

### Frontend → Vercel
1. Import GitHub repo on [vercel.com](https://vercel.com)
2. Set **Root Directory** to `Frontend`
3. Set **Framework** to `Vite`
4. Add environment variable: `VITE_API_URL=https://your-render-url.onrender.com/api`

---

## 📄 License

This project is for educational purposes.

---

## 👩‍💻 Author

**Srushti Gajera**  
[GitHub](https://github.com/srushtigajera11)
