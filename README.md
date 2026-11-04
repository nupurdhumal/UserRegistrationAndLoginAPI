# PulseAuth - Production-Grade Full-Stack User Authentication System

A secure, enterprise-grade User Registration & Login system built with a decoupled architecture: **React.js + Vite** frontend and **Node.js + Express.js + MongoDB (Mongoose)** backend.

Designed following strict production security principles:
- **HttpOnly, SameSite, Secure Cookie** + optional Bearer Token header authentication.
- **bcryptjs** 10-round salted password hashing with pre-save Mongoose hook.
- Strict schema-level validation & duplicate key conflict handling (HTTP 409).
- Centralized Express error handler.
- Modern, restrained enterprise UI (SaaS Deep Navy / Slate Blue / Muted Teal palette) with client & server validation, password visibility toggles, real-time strength checklist, and protected route wrappers.

---

## 1. Project Directory Structure

```text
Login Page/
├── backend/
│   ├── config/
│   │   └── db.js                 # Mongoose database connection setup
│   ├── controllers/
│   │   └── authController.js     # Business logic: register, login, getMe, logout
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT verification (Cookie & Bearer token extraction)
│   │   └── errorMiddleware.js    # Centralized Express error handling & 404 handler
│   ├── models/
│   │   └── User.js               # Mongoose schema, validation & bcrypt pre-save hook
│   ├── routes/
│   │   └── authRoutes.js         # API endpoint definitions
│   ├── .env                      # Local environment configuration
│   ├── .env.example              # Template environment variables
│   ├── package.json              # Backend dependencies & scripts
│   ├── server.js                 # Express application entry point & CORS configuration
│   └── test-auth.js              # Comprehensive 11-step backend automated verification
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Alert.jsx         # Accessible alert banner (error, success, warning)
│   │   │   ├── Button.jsx        # Enterprise button with loading spinner & variants
│   │   │   ├── Input.jsx         # Form input with show/hide password toggle & errors
│   │   │   └── Navbar.jsx        # Sticky top navigation with user badge & logout
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Global React authentication state provider
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx     # Protected dashboard with profile details & live API tester
│   │   │   ├── Login.jsx         # Sign-in page with validation & remember-me toggle
│   │   │   └── Register.jsx      # Sign-up page with real-time password criteria
│   │   ├── routes/
│   │   │   ├── ProtectedRoute.jsx# Guards private routes; redirects unauthenticated users
│   │   │   └── PublicRoute.jsx   # Redirects authenticated users to /dashboard
│   │   ├── services/
│   │   │   ├── api.js            # Configured Axios instance (withCredentials: true)
│   │   │   └── authService.js    # Auth API client calls
│   │   ├── styles/
│   │   │   └── index.css         # Enterprise CSS design system & typography
│   │   ├── App.jsx               # Application routing table
│   │   └── main.jsx              # Vite React entry point
│   ├── index.html                # HTML5 template with Inter typography
│   ├── package.json              # Frontend dependencies & Vite scripts
│   └── vite.config.js            # Vite configuration with API reverse proxy
│
├── .gitignore                    # Git ignore file
├── package.json                  # Root orchestration package.json
├── postman_collection.json       # Ready-to-import Postman test collection
└── README.md                     # Comprehensive project documentation
```

---

## 2. Technology Stack

### Backend
- **Node.js** (v18+)
- **Express.js** (v4.21+) - REST API framework
- **MongoDB** & **Mongoose** (v8+) - NoSQL Document store with schema validation
- **bcryptjs** (v3+) - Salted password hashing (10 salt rounds)
- **jsonwebtoken (JWT)** (v9+) - Stateless authentication token issuance & verification
- **cookie-parser** - Parses incoming cookies for HttpOnly JWT transmission
- **cors** - Configured for credentialed cross-origin requests
- **dotenv** - Environment variable management

### Frontend
- **React.js** (v18+) - Component-driven UI
- **Vite** (v6+) - High-speed bundling & HMR
- **React Router DOM** (v6+) - Client-side routing, protected & public route guards
- **Axios** (v1.7+) - HTTP client with request/response interceptors & cookie credentials
- **Lucide React** - High-quality, clean vector icon set
- **CSS3 Design System** - Professional enterprise SaaS palette:
  - Primary: Deep Navy (`#172B4D`)
  - Secondary: Slate Blue (`#344563`)
  - Accent: Muted Teal (`#2A9D8F`)
  - Background: Soft Off-White (`#F7F8FA`)
  - Surface: Pure White (`#FFFFFF`)

---

## 3. Getting Started & Installation

### Prerequisites
1. **Node.js**: `v18.0.0` or higher (`node -v`)
2. **MongoDB**: Local MongoDB instance running on `mongodb://127.0.0.1:27017` or a MongoDB Atlas URI.

### Step 1: Install Dependencies
Run the installation command from the project root:
```bash
# Option A: From root (installs both backend & frontend)
npm run install:all

# Option B: Individually
cd backend && npm install
cd ../frontend && npm install
```

### Step 2: Environment Configuration
Check `backend/.env` (created by default, or copy from `backend/.env.example`):
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/auth_db
JWT_SECRET=super_secret_jwt_key_for_development_32chars_min_enterprise_auth_2026
CLIENT_URL=http://localhost:5173
```

---

## 4. Running the Application

### 1. Start the Backend Server
```bash
cd backend
npm run dev
```
*The server will start on `http://localhost:5000` and automatically connect to MongoDB.*

### 2. Start the Frontend Application
In a separate terminal:
```bash
cd frontend
npm run dev
```
*Vite will start the client on `http://localhost:5173`.*

### 3. Open in Browser
Visit `http://localhost:5173`. You will be directed to the Login screen or Register screen.

---

## 5. Automated Verification Tests

A comprehensive 11-step backend verification test is included:
```bash
cd backend
node test-auth.js
```
This tests:
1. Valid registration (HTTP 201).
2. Duplicate email rejection (HTTP 409).
3. Weak password rejection (<8 chars, HTTP 400).
4. Invalid email rejection (HTTP 400).
5. Wrong password login rejection (HTTP 401).
6. Valid login with JWT token & HttpOnly cookie generation (HTTP 200).
7. MongoDB password hash verification (confirms `$2a$` salted hash, no plain-text).
8. Protected route rejection without token (HTTP 401).
9. Protected route access with `Bearer <token>` in header (HTTP 200).
10. Protected route access with `Cookie: token=...` (HTTP 200).
11. Logout & cookie clearance (HTTP 200).

---

## 6. API Endpoint Documentation

### Base URL: `http://localhost:5000/api`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/health` | Public | Server health status |
| `POST` | `/auth/register` | Public | Register new user account |
| `POST` | `/auth/login` | Public | Authenticate user & issue JWT cookie/token |
| `GET` | `/auth/me` | Protected | Retrieve authenticated user profile |
| `POST` | `/auth/logout` | Public/Private | Clear authentication cookie |

---

### A. Register New User
**`POST /api/auth/register`**

#### Request Headers
```http
Content-Type: application/json
```

#### Request Body
```json
{
  "name": "Sarah Jenkins",
  "email": "sarah.jenkins@company.com",
  "password": "SecurePassword123!"
}
```

#### Successful Response (`201 Created`)
```json
{
  "success": true,
  "message": "User registered successfully"
}
```

#### Error Responses
- **Duplicate Email (`409 Conflict`)**:
  ```json
  {
    "success": false,
    "message": "Email already registered"
  }
  ```
- **Validation Error (`400 Bad Request`)**:
  ```json
  {
    "success": false,
    "message": "Password must be at least 8 characters long."
  }
  ```

---

### B. User Login
**`POST /api/auth/login`**

#### Request Body
```json
{
  "email": "sarah.jenkins@company.com",
  "password": "SecurePassword123!",
  "rememberMe": true
}
```

#### Successful Response (`200 OK`)
Sets `Set-Cookie: token=<jwt>; HttpOnly; SameSite=Lax; Path=/; Max-Age=...`
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "67cb1a48c4601dfa25e2193b",
    "name": "Sarah Jenkins",
    "email": "sarah.jenkins@company.com"
  }
}
```

#### Error Responses
- **Invalid Credentials (`401 Unauthorized`)**:
  ```json
  {
    "success": false,
    "message": "Invalid email or password"
  }
  ```

---

### C. Get Authenticated Profile (Protected)
**`GET /api/auth/me`**

#### Request Authentication
Either automatically via **HttpOnly Cookie** (`Cookie: token=...`) OR via Header:
```http
Authorization: Bearer <jwt_token>
```

#### Successful Response (`200 OK`)
```json
{
  "success": true,
  "user": {
    "id": "67cb1a48c4601dfa25e2193b",
    "name": "Sarah Jenkins",
    "email": "sarah.jenkins@company.com",
    "createdAt": "2026-11-04T11:50:59.382Z"
  }
}
```

#### Error Response (`401 Unauthorized`)
```json
{
  "success": false,
  "message": "Access denied. No authentication token provided."
}
```

---

### D. Logout
**`POST /api/auth/logout`**

#### Successful Response (`200 OK`)
Clears `token` cookie.
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 7. Testing with Postman

1. Open Postman.
2. Click **Import** (top left).
3. Select the file `postman_collection.json` located in the root project folder.
4. The imported collection contains all 8 requests:
   - `1. Health Check`
   - `2. Register New User`
   - `3. Register Duplicate Email (Expect 409)`
   - `4. Login User (Obtain JWT Token)`: The Postman test script automatically stores the returned JWT token into the variable `{{jwt_token}}`.
   - `5. Login With Invalid Password (Expect 401)`
   - `6. Get Current User Profile (Protected - Bearer Token)`: Automatically uses `{{jwt_token}}`.
   - `7. Get Profile Without Token (Expect 401)`
   - `8. Logout User`
5. Execute requests sequentially to verify full lifecycle functionality.

---

## 8. Architectural & Security Deep Dive

### 1. Registration Flow
1. User enters Full Name, Email, Password, and Confirm Password on the React frontend.
2. Frontend runs instant client-side validation (regex email check, 8+ characters, matching passwords).
3. On submit, `POST /api/auth/register` is called via Axios.
4. Express validates required fields, trims names, normalizes email (`toLowerCase().trim()`), and checks for existing accounts.
5. If the email exists, a `409 Conflict` is returned immediately.
6. The user document is passed to Mongoose. The Mongoose `pre('save')` hook intercepts the plain password, generates a cryptographically random salt (10 rounds), hashes the password, and replaces the plain-text value.
7. User record is persisted in MongoDB. A `201 Created` response is returned with no sensitive data.
8. The frontend receives success and navigates the user to `/login` with an informational banner.

### 2. Login Flow
1. User submits email and password with an optional "Remember me" checkbox.
2. `POST /api/auth/login` checks whether the user exists in MongoDB.
3. `user.comparePassword(password)` invokes `bcrypt.compare(candidate, hash)`. This timing-safe comparison verifies the password against the stored bcrypt hash.
4. If invalid, a generic `401 Unauthorized` ("Invalid email or password") is returned to prevent email enumeration attacks.
5. If valid, a signed JWT token containing `{ id, email }` is created with a configurable expiration (1 day by default, 7 days if "Remember me" is checked).
6. The token is attached to an `HttpOnly`, `SameSite=Lax` cookie and returned in the JSON body.
7. Frontend updates `AuthContext` state, navigates to `/dashboard`, and accesses protected routes.

### 3. Password Hashing with bcrypt
- Passwords are **never** stored or logged in plain text.
- bcrypt uses an adaptive hash function with a work factor (salt rounds = 10).
- Even if two users share the same password, each receives a completely unique salt, neutralizing rainbow table attacks.
- The pre-save hook only re-hashes when `this.isModified('password')` is true, avoiding accidental double-hashing on profile updates.

### 4. JWT Authentication & Protected Middleware
- JSON Web Tokens (JWT) allow stateless authorization. The server verifies tokens using the HMAC SHA-256 algorithm and `JWT_SECRET`.
- The `protect` middleware supports **dual extraction**:
  1. Primary: `req.cookies.token` (HttpOnly cookie immune to JavaScript XSS access).
  2. Fallback: `req.headers.authorization` (`Bearer <token>` for Postman, mobile clients, and automated testing).
- If the token has expired, `TokenExpiredError` is caught and returns an explicit `401` ("Your session has expired. Please log in again.").
- If valid, the user record is fetched using `.select('-password')` and attached to `req.user`.

### 5. MongoDB Schema Design
- `name`: String, required, trimmed, minlength 2, maxlength 60.
- `email`: String, required, unique, lowercase, trimmed, regex validated.
- `password`: String, required, minlength 8.
- Schema options include `timestamps: true` (creating `createdAt` and `updatedAt`).
- Custom `toJSON` transform automatically deletes `password`, `__v`, and maps `_id` to `id`.

---

## 9. Important Technical Interview Questions & Answers

### Q1: Why use an HttpOnly cookie instead of localStorage for storing JWTs?
**Answer:**
Storing JWTs in `localStorage` or `sessionStorage` exposes the token to any JavaScript code executing on the page. If an attacker injects malicious code through a Cross-Site Scripting (XSS) vulnerability, they can read `localStorage.getItem('token')` and exfiltrate it.
An `HttpOnly` cookie cannot be accessed by client-side JavaScript (`document.cookie` cannot read it), shielding the token from XSS exfiltration. When paired with `SameSite: 'lax'` or `'strict'`, it also mitigates Cross-Site Request Forgery (CSRF).

### Q2: Why return a 409 Conflict status code on duplicate registration rather than 400 or 500?
**Answer:**
`409 Conflict` is the semantically correct HTTP status code specified in RFC 7231 indicating that the request cannot be completed due to a conflict with the current state of the target resource (in this case, an existing record with the same unique email constraint). `400` implies malformed syntax, while `500` implies an unexpected server bug.

### Q3: How does bcrypt prevent rainbow table and brute-force attacks?
**Answer:**
1. **Salt**: bcrypt generates a random 128-bit salt for each password. The salt is incorporated into the hash. Precomputed rainbow tables rely on fixed hashes for common passwords; salting ensures identical passwords have completely different hashes, rendering rainbow tables useless.
2. **Key Stretching (Work Factor)**: bcrypt uses the Eksblowfish algorithm with adjustable cost rounds ($2^{10} = 1024$ iterations for round 10). It is deliberately computationally expensive, slowing down offline brute-force attacks from billions of guesses per second to a few hundred per second per GPU core.

### Q4: Why shouldn't you reveal whether the email exists during login?
**Answer:**
Returning specific errors like "Email not registered" vs. "Incorrect password" allows malicious actors to conduct **User Enumeration Attacks**, building lists of valid registered users. Returning a uniform message like "Invalid email or password" prevents attackers from determining if an account exists.

### Q5: What is the purpose of React Router's `ProtectedRoute` wrapper?
**Answer:**
`ProtectedRoute` acts as a client-side gatekeeper. It reads the authentication state from `AuthContext`. If the user is unauthenticated, it immediately redirects them to `/login`, storing the attempted location in `location.state.from` so that after logging in, the user can be routed directly back to the intended page.

