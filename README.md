# StudyNotion - Online Education Platform 🎓

A full-stack **EdTech platform** built with the MERN stack, enabling students to discover and purchase courses, instructors to create and manage content, and admins to oversee the entire platform with advanced analytics.

---

## 🚀 Key Features

### **For Students**

- 📚 **Course Catalog** - Browse courses by categories with search and filtering
- 🛒 **Shopping Cart** - Add multiple courses and checkout seamlessly
- 💳 **Razorpay Integration** - Secure payment processing
- 📖 **Course Player** - Interactive video lectures with progress tracking
- 🤖 **AI-Powered Learning Tools** - AI-generated notes, timestamps, summaries, and key points for each lecture
- ⭐ **Ratings & Reviews** - Rate and review purchased courses
- 📊 **Progress Dashboard** - Track learning progress and enrolled courses
- 🔐 **Secure Authentication** - OTP-based signup with JWT authentication

### **For Instructors**

- ✏️ **Course Creation** - Create courses with sections, subsections, and video lectures
- 📹 **Media Management** - Upload videos and thumbnails via Cloudinary
- 🤖 **AI Video Summaries** - Generate AI-powered lecture summaries using Google Gemini
- 📈 **Instructor Dashboard** - View course performance and revenue analytics
- 👥 **Student Insights** - Monitor enrollments and course ratings
- ✅ **Approval System** - Submit courses for admin approval before publishing
- 💰 **Revenue Tracking** - Track earnings from course sales

### **For Admins**

- 🎯 **Platform Analytics** - Comprehensive dashboard with revenue, user, and course metrics
- 📊 **Advanced Charts** - Revenue trends, user growth, category performance (Chart.js)
- 👮 **User Management** - Suspend, reactivate, or delete users with automated email notifications
- 📋 **Course Moderation** - Approve or reject instructor course submissions
- 🏷️ **Category Management** - Create, update, and delete course categories
- 🌟 **Featured Courses** - Toggle courses as featured on homepage
- 📧 **System Monitoring** - Oversee platform health and user activity

### **Advanced Features**

- 🤖 **AI-Powered Assistance** - Google Gemini AI integration for video summaries and content generation
- 🔄 **Refresh Token System** - Secure session management with token rotation
- 📱 **Responsive Design** - Mobile-first UI built with TailwindCSS
- 🔒 **Security Middleware** - Helmet.js for HTTP headers security
- 🛡️ **Rate Limiting** - DDoS protection (100 requests per 15 minutes per IP)
- 📝 **Input Validation** - Express-validator for robust data validation
- 📨 **Email Notifications** - Automated emails for OTP, enrollment confirmations, and updates
- 🪵 **Logging System** - Winston logger for production-grade error tracking
- 🔐 **CORS Protection** - Configured allowed origins for API security

---

## 🛠️ Tech Stack

### **Frontend**

- **React 18** - Modern UI library with hooks
- **Redux Toolkit** - State management with thunks for async operations
- **React Router v6** - Client-side routing
- **Axios** - HTTP client with interceptors for token refresh
- **TailwindCSS** - Utility-first CSS framework
- **React Hot Toast** - Beautiful notifications
- **Chart.js & Recharts** - Data visualization for analytics
- **React Markdown** - Render course content
- **Swiper.js** - Carousel for featured courses
- **Video React** - Custom video player

### **Backend**

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB & Mongoose** - NoSQL database with ODM
- **JWT** - Secure authentication with access and refresh tokens
- **bcrypt** - Password hashing
- **Cloudinary** - Media file storage and CDN
- **Razorpay** - Payment gateway integration
- **Nodemailer** - Email service
- **Google Gemini AI** - AI-powered content generation
- **Winston** - Logging framework
- **Helmet** - Security headers
- **Express Rate Limit** - DDoS protection

---

## 📁 Project Structure

```
StudyNotion/
├── server/                          # Backend application
│   ├── features/                    # Feature-based modules
│   │   ├── auth/                   # Authentication & user profiles
│   │   │   ├── controllers/        # HTTP request handlers
│   │   │   ├── services/           # Business logic
│   │   │   ├── routes/             # Route definitions
│   │   │   └── validators/         # Input validation
│   │   ├── student/                # Student features (payment, reviews)
│   │   ├── instructor/             # Instructor features (courses, sections)
│   │   └── admin/                  # Admin features (analytics, users)
│   │
│   ├── shared/                     # Shared resources
│   │   ├── models/                 # Mongoose schemas
│   │   ├── middlewares/            # Auth, error handling, security
│   │   ├── utils/                  # Helpers (email, upload, tokens)
│   │   └── errors/                 # Custom error classes
│   │
│   ├── config/                     # Configuration files
│   │   ├── database.js            # MongoDB connection
│   │   ├── cloudinary.js          # Cloudinary setup
│   │   └── razorpay.js            # Payment gateway
│   │
│   ├── routes/                     # Route aggregation
│   ├── scripts/                    # Utility scripts (admin creation)
│   ├── .env                        # Environment variables
│   ├── index.js                    # Server entry point
│   └── package.json
│
├── src/                            # Frontend application
│   ├── features/                   # Feature modules
│   │   ├── admin/                  # Admin components (Analytics, User Mgmt)
│   │   ├── instructor/             # Instructor components (Create Course)
│   │   └── student/                # Student components (Cart, Enrolled)
│   │
│   ├── components/                 # Reusable UI components
│   │   ├── core/                   # Feature-specific components
│   │   │   ├── Dashboard/         # Dashboard layouts
│   │   │   ├── Auth/              # Login, Signup forms
│   │   │   └── HomePage/          # Landing page sections
│   │   ├── common/                 # Shared components (Navbar, Footer)
│   │   └── course/                 # Course-related components
│   │
│   ├── pages/                      # Page components
│   │   ├── catalog/               # Course catalog pages
│   │   ├── Dashboard.jsx          # Main dashboard
│   │   ├── Home.jsx               # Landing page
│   │   └── ...
│   │
│   ├── services/                   # API integration
│   │   ├── api/                   # Axios configuration
│   │   │   ├── client.js         # Axios instance with interceptors
│   │   │   └── endpoints.js      # API endpoint constants
│   │   └── operations/            # API service functions
│   │       ├── authAPI.js
│   │       ├── adminAPI.js
│   │       ├── courseDetailsAPI.js
│   │       └── ...
│   │
│   ├── store/                      # Redux store
│   │   └── slices/                # Redux slices (auth, admin, category)
│   │
│   ├── reducer/                    # Root reducer
│   ├── shared/                     # Shared utilities
│   ├── assets/                     # Images and static files
│   ├── App.js                      # Main app component
│   └── index.js                    # React entry point
│
├── public/                         # Public assets
├── package.json                    # Frontend dependencies
└── tailwind.config.js             # TailwindCSS configuration
```

---

## ⚙️ Installation & Setup

### **Prerequisites**

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Cloudinary account
- Razorpay account
- Google Gemini API key (optional, for AI features)

### **1. Clone the Repository**

```bash
git clone <repository-url>
cd StudyNotion-An-Online-Education-Platform-master
```

### **2. Backend Setup**

```bash
cd server
npm install
```

Create a `.env` file in the `server` directory:

```env
# Server Configuration
PORT=4000
NODE_ENV=development

# Database
MONGODB_URL=mongodb://localhost:27017/studynotion

# JWT Secrets
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters
REFRESH_TOKEN_SECRET=your_refresh_token_secret_key
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=30d

# Email Configuration (Gmail)
MAIL_HOST=smtp.gmail.com
MAIL_USER=your-email@gmail.com
MAIL_PASS=your-app-specific-password

# Cloudinary Configuration
CLOUD_NAME=your_cloudinary_cloud_name
API_KEY=your_cloudinary_api_key
API_SECRET=your_cloudinary_api_secret
FOLDER_NAME=StudyNotion

# Razorpay Configuration
RAZORPAY_KEY=your_razorpay_key_id
RAZORPAY_SECRET=your_razorpay_secret

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Google Gemini AI (Optional)
GOOGLE_GEMINI_API_KEY=your_gemini_api_key
```

Start the backend server:

```bash
npm start        # Production
npm run dev      # Development (with nodemon)
```

Server will run on `http://localhost:4000`

### **3. Frontend Setup**

```bash
# From root directory
npm install
```

Create a `.env` file in the **root** directory:

```env
REACT_APP_BASE_URL=http://localhost:4000/api/v1
```

Start the frontend:

```bash
npm start
```

Frontend will run on `http://localhost:3000`

### **4. Run Both Concurrently**

From the root directory:

```bash
npm run dev
```

This command starts both frontend and backend simultaneously.

---

## 🎯 API Endpoints

### **Authentication (`/api/v1/auth`)**

- `POST /signup` - Register new user
- `POST /login` - User login
- `POST /sendotp` - Send OTP for email verification
- `POST /changepassword` - Change password
- `POST /refresh` - Refresh access token
- `POST /logout` - Logout user

### **Student (`/api/v1/student`)**

- `POST /capturePayment` - Initiate course payment
- `POST /verifyPayment` - Verify Razorpay payment
- `POST /createRating` - Rate a course
- `POST /updateCourseProgress` - Mark lecture as complete
- `GET /getEnrolledCourses` - Get user's enrolled courses

### **Instructor (`/api/v1/instructor`)**

- `POST /createCourse` - Create new course
- `PUT /course/:courseId` - Edit course
- `DELETE /course/:courseId` - Delete course
- `POST /createSection` - Add section to course
- `POST /createSubSection` - Add lecture to section
- `GET /getInstructorCourses` - Get instructor's courses
- `GET /instructorDashboard` - Get revenue analytics

### **Admin (`/api/v1/admin`)**

- `GET /dashboard/stats` - Platform statistics
- `GET /dashboard/analytics` - Revenue and user charts
- `GET /users` - List all users
- `PUT /users/:userId/suspend` - Suspend user
- `PUT /users/:userId/unsuspend` - Unsuspend user
- `DELETE /users/:userId` - Delete user
- `GET /courses/pending` - Get pending course approvals
- `PUT /courses/:courseId/approval` - Approve/reject course
- `PUT /courses/:courseId/featured` - Toggle featured status
- `POST /category` - Create category
- `PUT /category/:categoryId` - Update category
- `DELETE /category/:categoryId` - Delete category

---

## 📊 Database Models

### **Core Models**

- **User** - Stores user data (students, instructors, admins)
- **Profile** - Additional user details (linked to User)
- **Course** - Course information with sections and pricing
- **Section** - Course sections/modules
- **SubSection** - Individual lectures/videos
- **Category** - Course categories
- **CourseProgress** - Track student progress
- **RatingAndReview** - Course ratings
- **RefreshToken** - Secure refresh token storage
- **OTP** - One-time passwords for verification

---

## 🔒 Security Features

- **JWT Authentication** - Access tokens (15 min) + Refresh tokens (30 days)
- **Token Rotation** - Optional automatic refresh token rotation
- **Password Hashing** - bcrypt with salt rounds
- **HTTP-Only Cookies** - Secure token storage
- **CORS Protection** - Configured allowed origins
- **Rate Limiting** - Prevent brute-force attacks
- **Helmet Security** - HTTP headers protection
- **Input Validation** - Express-validator middleware
- **Role-Based Access** - Student, Instructor, Admin permissions
- **Course Approval System** - Admin moderation before publishing

---

## 🎨 UI Features

- **Responsive Design** - Mobile, tablet, and desktop optimized
- **Loading States** - Skeleton screens and spinners
- **Toast Notifications** - User feedback for actions
- **Modal Dialogs** - Confirmations and forms
- **Data Visualization** - Charts for analytics (Chart.js, Recharts)
- **Video Player** - Custom video controls with progress tracking
- **Search & Filter** - Course discovery tools
- **Pagination** - Efficient data loading
- **Dark Mode Ready** - TailwindCSS design system

---

## 🧪 Testing & Development

### **Backend Scripts**

```bash
cd server

# Create admin user
node scripts/createAdmin.js

# Make existing user admin
node scripts/makeAdmin.js

# Validate environment configuration
node scripts/validateConfig.js
```

### **Development Tools**

- **Nodemon** - Auto-restart server on changes
- **Concurrently** - Run frontend and backend together
- **Redux DevTools** - Debug state management
- **MongoDB Compass** - Database GUI

---

## 📦 Deployment

### **Backend (Node.js)**

1. Set `NODE_ENV=production` in environment
2. Configure production MongoDB URL
3. Set secure `JWT_SECRET` (minimum 32 characters)
4. Enable `ENABLE_TOKEN_ROTATION=true` for enhanced security
5. Deploy to services like Render, Railway, or AWS
6. Ensure environment variables are set

### **Frontend (React)**

1. Update `REACT_APP_BASE_URL` to production API URL
2. Build production bundle: `npm run build`
3. Deploy `build` folder to Vercel, Netlify, or similar
4. Configure CORS on backend to allow frontend domain

---

## 🤝 Contributing

### **Code Guidelines**

1. Follow **Service Layer Pattern** - Keep controllers thin
2. Use **custom error classes** for error handling
3. Write **descriptive commit messages**
4. Follow **feature-based organization**
5. Add **JSDoc comments** for functions
6. Test endpoints before committing

### **Adding Features**

1. Create feature folder in `server/features/` or `src/features/`
2. Implement service layer first (business logic)
3. Create controller (HTTP handling)
4. Define routes
5. Update API endpoints in `src/services/api/endpoints.js`
6. Add Redux slice if needed
7. Create UI components

---

## 📄 License

This project is open-source and available for educational purposes.

---

## 👨‍💻 Architecture Highlights

- **Feature-Based Architecture** - Domain-driven design for scalability
- **Service Layer Pattern** - Separation of HTTP and business logic
- **Redux Toolkit** - Modern state management with thunks
- **Axios Interceptors** - Automatic token refresh and error handling
- **Cloudinary Integration** - Scalable media storage
- **Razorpay Integration** - Secure payment processing
- **Winston Logging** - Production-grade error tracking
- **Custom Error Handling** - Consistent error responses
- **Refresh Token Rotation** - Enhanced security

---

## 📞 Support

For detailed backend architecture documentation, see [`server/ARCHITECTURE.md`](server/ARCHITECTURE.md)

For backend-specific setup, see [`server/README.md`](server/README.md)

---

**Built with ❤️ for Modern EdTech**

**Last Updated:** January 2026
