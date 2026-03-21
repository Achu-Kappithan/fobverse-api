# Fobverse API 🚀

> **A Comprehensive Backend Platform for Next-Generation Applicant Tracking and Job Portals**

Fobverse API is a robust, scalable backend application built with **NestJS**. It serves as the core engine for an advanced Applicant Tracking System (ATS), connecting Candidates, Companies, and Administrators. Designed with scalability and performance in mind, it handles everything from secure authentication and real-time notifications to automated resume parsing and intelligent candidate sorting.

## 🌟 Key Features

The platform is modularized into distinct business domains to ensure clean architecture and scalability.

- **Role-Based Access Control (RBAC):** Secure Authentication via **JWT** and **Google OAuth 2.0** tailored for Admins, Companies, and Candidates.
- **Advanced ATS & Resume Sorting:** Integrated `pdf-parse`, `compromise`, and `stopword` to parse resumes, perform natural language processing (NLP), and intelligently rank applicants against job descriptions.
- **Real-Time Capabilities:** Leverages **Socket.io** (WebSockets) for instant notifications and real-time interview signaling.
- **Comprehensive Job & Application Management:** End-to-end workflows for companies to post jobs and for candidates to submit and track applications.
- **Interview Management:** Built-in scheduling and handling of candidate interviews.
- **Cloud Storage Integration:** Seamless media and document uploads utilizing **Cloudinary**.
- **Enterprise-Grade Logging:** Persistent and structured logging using **Winston** with daily log rotation for tracking application health and debug data.
- **Database Architecture:** Uses **MongoDB** and **Mongoose** for a flexible, schema-driven NoSQL database structure.

---

## 💻 Tech Stack & Tools

- **Framework:** [NestJS](https://nestjs.com/) (Node.js & TypeScript)
- **Database:** MongoDB & Mongoose
- **Authentication:** Passport.js (JWT strategies, Google OAuth20)
- **Real-Time:** Socket.io
- **Security:** Bcrypt, Class-Validator, Class-Transformer, CORS enabled
- **File Uploads:** Cloudinary
- **Emails:** Nodemailer
- **Testing:** Jest & SuperTest (E2E and Unit testing)
- **Deployment & CI/CD:** Ready for containerized or cloud deployment (e.g., Render)

---

## 🛠️ Project Structure

The project follows a domain-driven structure within the `src` directory:

```text
src/
├── admin/          # Administrator features and oversight
├── applications/   # Handling job applications from candidates
├── ats-sorting/    # Logic for resume parsing and NLP sorting
├── auth/           # Login, Registration, JWT generation, OAuth
├── candidate/      # Candidate profile management
├── cloudinary/     # Cloudinary media upload service integrations
├── company/        # Employer profile and management features
├── interview/      # Interview scheduling and state management
├── jobs/           # Job listing CRUD operations
├── notification/   # Real-time WebSockets and email notifications
└── shared/         # Common utilities, interceptors, filters, and configs
```

---

## 🚀 Getting Started

To get a local copy up and running, follow these steps.

### Prerequisites

- Node.js (v18+ recommended)
- MongoDB instance (Local or Atlas)
- Cloudinary Account
- Google Cloud Console Project (for OAuth)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd fobverse-api
   cd fobverse
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Create a `.env.development` (and `.env.production` for production deployments) in the root directory and add the necessary environment variables:
   ```env
   NODE_ENV=development
   PORT=3007
   MONGO_URI=your_mongodb_connection_string
   APP_BASE_URL=http://localhost:3007
   FRONTEND_URL=http://localhost:3000
   CLIENT_URL=http://localhost:3000

   # JWT Tokens
   JWT_ACCESS_SECRET=your_jwt_access_secret
   JWT_ACCESS_EXPIRES_IN=1d
   JWT_REFRESH_SECRET=your_jwt_refresh_secret
   JWT_REFRESH_EXPIRES_IN=7d
   JWT_VERIFICATION_SECRET=your_verification_secret

   # OAuth
   CLIENT_ID=your_google_client_id
   CLIENT_SECRET=your_google_client_secret
   CALLBACK_URL=http://localhost:3007/api/v1/auth/google/callback

   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret

   # Email
   EMAIL_USER=your_smtp_email
   EMAIL_PASSWORD=your_smtp_password
   ```

4. **Running the application:**

   ```bash
   # Development mode
   npm run start:dev

   # Production mode
   npm run build
   npm run start:prod
   ```

The server will start on `http://localhost:3007/api/v1`.

---

## 🧪 Testing

The platform comes with predefined testing scripts utilizing Jest.

```bash
# Unit tests
npm run test

# e2e tests
npm run test:e2e

# Test coverage
npm run test:cov
```

---

## 📈 Scalability and Performance

This project was built to demonstrate readiness for production-level traffic. Key design decisions include:
- **NestJS Modules:** Enhances maintainability by encapsulating domain logic.
- **Asynchronous Operations:** Used heavily across file uploads, email sending, and NLP parsing to avoid blocking the main event loop.
- **Global Exception Filters & Interceptors:** Centralized error handling providing consistent RESTful responses.

---

*This repository is continually maintained and acts as a demonstration of high-quality, architecturally sound backend engineering.*
