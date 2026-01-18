# StudyNotion Server API

The backend server for the StudyNotion EdTech platform. Built with **Node.js, Express, and MongoDB**, featuring a modern **Service-Layer Architecture**.

## 🚀 Features

- **Authentication:** JWT-based auth, OTP verification, password reset.
- **Role-Based Access:** Student, Instructor, and Admin roles.
- **Course Management:** Create, publish, and manage courses/sections.
- **Payments:** Razorpay integration for course enrollment.
- **Media:** Cloudinary integration for handling file uploads.
- **Validation:** Robust input validation using `express-validator`.
- **Architecture:** Clean Feature-Based Folder Structure.

---

## 🏗️ Architecture Structure

The project follows a modular, feature-based architecture pattern:

```
server/
├── features/               # Feature-specific modules
│   ├── auth/               # Authentication & User Profiles
│   ├── student/            # Student actions (Payment, Reviews)
│   ├── instructor/         # Instructor actions (Course creation)
│   └── admin/              # Admin actions (Categories, Analytics)
│       ├── controllers/    # HTTP Handlers (Req/Res only)
│       ├── services/       # Business Logic (Database calls)
│       ├── routes/         # Route definitions
│       └── validators/     # Input validation rules
│
├── shared/                 # Shared resources
│   ├── models/             # Mongoose Models
│   ├── middlewares/        # Auth, Error, Validation middlewares
│   ├── utils/              # Helper functions (Mail, Upload)
│   └── errors/             # Custom Error Classes
│
├── config/                 # Configuration (DB, Cloudinary)
└── index.js                # App Entry Point
```

---

## 🛠️ Setup & Installation

1.  **Install Dependencies**

    ```bash
    cd server
    npm install
    ```

2.  **Environment Variables**
    Create a `.env` file in the `server` directory:

    ```env
    PORT=4000
    MONGODB_URL=mongodb://localhost:27017/studynotion

    # JWT
    JWT_SECRET=your_jwt_secret

    # Mail
    MAIL_HOST=smtp.gmail.com
    MAIL_USER=your_email
    MAIL_PASS=your_password

    # Cloudinary
    CLOUD_NAME=your_cloud_name
    API_KEY=your_api_key
    API_SECRET=your_api_secret
    FOLDER_NAME=StudyNotion

    # Razorpay
    RAZORPAY_KEY=your_key
    RAZORPAY_SECRET=your_secret
    ```

3.  **Run Server**
    ```bash
    npm start
    ```

---

## 📚 API Overview

### **Auth (`/api/v1/auth`)**

- `POST /login` - User login
- `POST /signup` - Register user
- `POST /sendotp` - Send verification OTP
- `POST /changepassword` - Change password

### **Instructor (`/api/v1/instructor`)**

- `POST /createCourse` - Create new course
- `POST /addSection` - Add section to course
- `GET /getInstructorCourses` - List my courses

### **Student (`/api/v1/student`)**

- `POST /capturePayment` - Buy course
- `POST /createRating` - Rate a course
- `POST /updateCourseProgress` - Mark lecture complete

### **Admin (`/api/v1/admin`)**

- `POST /category` - Create category
- `GET /users` - List all users
- `PUT /courses/:id/approval` - Approve/Reject course

---

## 🛡️ Response Format

All API responses follow a standardized format:

**Success:**

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

**Error:**

```json
{
  "success": false,
  "message": "Error description"
}
```

---

## 🤝 Contribution

1.  Follow the **Service Layer** pattern.
2.  Controllers should strictly handle HTTP requests/responses.
3.  Business logic must reside in `services/`.
4.  Add validation rules in `validators/`.

---

**Developed for StudyNotion Platform** 🎓
