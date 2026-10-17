# SurveyFlow — Online Survey System with Secure Admin Panel

A full-stack **MERN (MongoDB, Express, React, Node.js)** survey management platform featuring public respondent interfaces, dynamic survey creation, real-time analytics, and a **Secure Role-Based Admin Panel** for system governance and monitoring.

---

## 🌟 Key Features

### 1. User & Survey Creator Side
- **Survey Taking**: Responsive respondent interface supporting single-choice, multiple-choice, rating scale (1-10), and free-text question types.
- **Pre-Built Survey Categories**: Curated templates across Events, Products, Shopping, Restaurants, Education, Healthcare, and Transport.
- **Custom Survey Builder**: Intuitive builder to author custom questionnaires, define question types, options, and validation rules.
- **Results Dashboard**: Visualization of participation counts, completion rates, and answer breakdowns with interactive Recharts diagrams.

### 2. Secure Admin Panel (Restricted Access)
- **Role-Based Access Control (RBAC)**: Server-enforced roles (`admin`, `creator`, `respondent`) with account state tracking (`active`, `suspended`).
- **Overview Dashboard**: Real-time database metrics:
  - Total registered users, survey creators, and respondents
  - Total surveys, live/active vs inactive/archived ratios
  - Total survey responses across builder and category pipelines
  - Response participation trend chart over the last 7 days
  - Recent user registrations and survey activities
- **User Management**:
  - Searchable, paginated user directory
  - Filtering by role (`admin`, `creator`, `respondent`) and status (`active`, `suspended`)
  - Status toggle (Active / Suspended) with confirmation modal safeguards
  - Role assignment with protection preventing admin privilege escalation
  - Safeguards preventing administrators from accidentally suspending, demoting, or deleting their own active accounts
  - Strict secret filtering: passwords and password hashes are never exposed
- **Survey Governance**:
  - Audit all surveys in the system with response counts
  - Search by title or creator and filter by availability status
  - Inspect survey structure, questions, validation rules, and scale definitions
  - Toggle survey states (`active`, `inactive`, `archived`)
  - Safeguarded survey deletion protecting response data integrity
- **Response Analytics & Monitoring**:
  - Cross-survey participation volume charts and category distributions
  - Detailed response audit log with individual answer inspection
  - Complete Administrative CSV export (`/api/admin/export-csv`)

---

## 🛡️ Security Architecture

1. **Server-Side Token Authentication**:
   - Secure stateless JSON Web Tokens (JWT) signed with a server-side secret.
   - Tokens are validated via the `verifyToken` middleware on every protected API call.
2. **Strict Authorization Middleware (`requireRole`)**:
   - Administrative endpoints (`/api/admin/*`) strictly require `req.user.role === 'admin'`.
   - Regular users attempting to invoke admin APIs receive an explicit `403 Forbidden` response.
3. **Privilege Escalation Prevention**:
   - Public registration (`POST /api/auth/register`) strictly sets roles to standard levels (`creator` or `respondent`).
   - Any attempt to pass `role: 'admin'` in registration payloads is automatically stripped or rejected by the server.
4. **Bcrypt Password Security**:
   - Passwords hashed with 10 salt rounds before storage in MongoDB.
   - User serialization (`toJSON`) automatically strips the `password` field from all outgoing API responses.
5. **Account State Enforcement**:
   - Suspended accounts are immediately blocked on the backend upon token verification (`403 Forbidden`).
6. **Self-Preservation Safeguards**:
   - The server rejects any administrative attempt to modify or delete the logged-in administrator's own status or role.
7. **Frontend Route Guards (`AdminRoute`)**:
   - Client-side route guard verifies role authorization and displays an explicit 403 Access Denied screen for non-admin accounts.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or newer)
- **MongoDB** (Local MongoDB instance running on `mongodb://127.0.0.1:27017` OR a MongoDB Atlas cluster URI)

---

### Step 1: Backend Setup

1. Open a terminal and navigate to the `server` directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Copy `.env.example` to `.env`:
   ```bash
   # Windows PowerShell
   Copy-Item .env.example .env
   ```
   *Note: The server automatically falls back to `mongodb://127.0.0.1:27017/survey` if no cloud URI is provided.*

4. **Seed the initial Administrator account**:
   Run the secure admin seeding script:
   ```bash
   npm run seed:admin
   ```
   *Default provisioned credentials:*
   - **Email**: `admin@surveyflow.com`
   - **Password**: `Admin@123456`
   - **Role**: `admin`

   *To create a custom administrator account via CLI:*
   ```bash
   node scripts/seedAdmin.js <email> <password> [name]
   ```

5. (Optional) Seed demonstration data:
   ```bash
   node scripts/seedSampleData.js
   ```

6. Start the backend server:
   ```bash
   npm run dev
   # or
   npm start
   ```
   The backend will start on **`http://localhost:5000`**.

---

### Step 2: Frontend Setup

1. Open a new terminal and navigate to `survey-system`:
   ```bash
   cd survey-system
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Ensure `.env` is configured:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

4. Start the frontend development server:
   ```bash
   npm run dev
   ```
   The frontend will be available at **`http://localhost:5173`**.

---

## 🧪 Testing & Verification

The backend includes an automated suite verifying all 10 core security scenarios:

```bash
cd server
npm run test:api
```

### Verified Scenarios:
1. Public registration assigns standard role and rejects privilege escalation to `admin`.
2. Admin login succeeds with verified credentials and issues a valid JWT.
3. Non-admin users are rejected from `/api/auth/admin-login` with `403 Forbidden`.
4. Unauthenticated requests to `/api/admin/*` return `401 Unauthorized`.
5. Regular user tokens calling `/api/admin/*` return `403 Forbidden`.
6. Authorized admin tokens calling `/api/admin/overview` return `200 OK` with database statistics.
7. User listing excludes passwords and password hashes.
8. Admin self-suspension and self-demotion are blocked by server safeguards.
9. Admin status modification and account suspension take effect immediately.
10. Suspended user sessions are rejected on subsequent API calls.
11. Survey status toggling and question inspection work seamlessly.
12. Response monitoring and administrative CSV export work with data integrity.

---

## 📡 API Reference

### Authentication Endpoints (`/api/auth`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register regular respondent or creator | Public |
| `POST` | `/api/auth/login` | Authenticate user & receive JWT token | Public |
| `POST` | `/api/auth/admin-login` | Authenticate administrator specifically | Admin Only |
| `GET` | `/api/auth/me` | Fetch fresh verified profile & role | Authenticated |

### Administrator Endpoints (`/api/admin`)
*All require `Authorization: Bearer <token>` with `role: "admin"`*

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/overview` | Real-time database metrics & 7-day trend |
| `GET` | `/api/admin/users` | Paginated user list with search & filters |
| `GET` | `/api/admin/users/:id` | Detailed user record and authored surveys |
| `PATCH` | `/api/admin/users/:id/status` | Toggle user status (`active` / `suspended`) |
| `PATCH` | `/api/admin/users/:id/role` | Update role (`admin`, `creator`, `respondent`) |
| `DELETE` | `/api/admin/users/:id` | Delete user account (guarded against self-deletion) |
| `GET` | `/api/admin/surveys` | Paginated survey list with live response counts |
| `GET` | `/api/admin/surveys/:id` | Inspect survey questions and associated responses |
| `PATCH` | `/api/admin/surveys/:id/status` | Toggle survey status (`active`, `inactive`, `archived`) |
| `DELETE` | `/api/admin/surveys/:id` | Delete survey with response integrity safeguard |
| `GET` | `/api/admin/analytics` | Participation metrics across survey types |
| `GET` | `/api/admin/responses` | Paginated log of individual submissions |
| `GET` | `/api/admin/export-csv` | Administrative CSV export of all responses |

### Survey & Response Endpoints
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/surveys` | Fetch all active surveys |
| `GET` | `/api/surveys/:id` | Fetch survey by ID |
| `POST` | `/api/surveys` | Create a new custom survey |
| `POST` | `/api/responses` | Submit custom survey response |
| `POST` | `/api/responses/category` | Submit pre-built category response |
| `GET` | `/api/responses/category/all` | Fetch category responses for results dashboard |

---

## 🗺️ Frontend Routes

| Route | Guard | Description |
|---|---|---|
| `/login` | Public | Standard User sign in & account registration |
| `/surveys` | `ProtectedRoute` | Browse and respond to surveys |
| `/survey/:id` | `ProtectedRoute` | Live survey questionnaire interface |
| `/builder` | `ProtectedRoute` | Interactive questionnaire builder |
| `/dashboard` | `ProtectedRoute` | Survey results & charts dashboard |
| `/admin/login` | Public | Dedicated Administrator Login interface |
| `/admin/dashboard` | `AdminRoute` | Real-time overview metrics & participation trends |
| `/admin/users` | `AdminRoute` | User directory, status control & role assignment |
| `/admin/surveys` | `AdminRoute` | Survey catalog, status toggling & question inspector |
| `/admin/analytics` | `AdminRoute` | Cross-survey response analytics & CSV export |
| `/admin/profile` | `AdminRoute` | Admin account parameters & security status |

---

## 📁 Repository Structure

```
survey/
├── server/
│   ├── middleware/
│   │   └── auth.js             # Token verification & RBAC authorization middleware
│   ├── models/
│   │   ├── User.js             # User schema with RBAC roles & statuses
│   │   ├── Survey.js           # Survey schema with status & questions
│   │   ├── Response.js         # Custom survey response schema
│   │   └── CategoryResponse.js # Pre-built survey response schema
│   ├── routes/
│   │   ├── auth.js             # Register, login, admin-login, me
│   │   ├── admin.js            # Overview, users, surveys, analytics, CSV
│   │   ├── surveys.js          # CRUD for surveys
│   │   └── responses.js        # Responses submission & category retrieval
│   ├── scripts/
│   │   ├── seedAdmin.js        # Secure administrator account provisioner
│   │   └── seedSampleData.js   # Demonstration data seed script
│   ├── .env.example            # Backend environment template
│   ├── index.js                # Express app entry & graceful MongoDB connection
│   ├── package.json            # Node scripts & dependencies
│   └── test_routes.js          # Automated security & API test runner
│
├── survey-system/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js        # Axios instance with dynamic URL & JWT interceptors
│   │   ├── components/
│   │   │   ├── AdminRoute.jsx  # Route guard checking role === 'admin' with 403 fallback
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── Navbar.jsx      # Header with Admin Console link for admins
│   │   │   └── AppLayout.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx # JWT state, real login, adminLogin, register, logout
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   ├── AdminLogin.jsx & .css
│   │   │   │   ├── AdminLayout.jsx & .css
│   │   │   │   ├── AdminDashboard.jsx & .css
│   │   │   │   ├── UserManagement.jsx & .css
│   │   │   │   ├── SurveyManagement.jsx & .css
│   │   │   │   ├── ResponseAnalytics.jsx & .css
│   │   │   │   └── AdminProfile.jsx & .css
│   │   │   ├── LoginPage.jsx   # User login with Admin Portal link
│   │   │   ├── SurveyCategories.jsx
│   │   │   ├── SurveyBuilder.jsx
│   │   │   ├── SurveyPage.jsx
│   │   │   └── Dashboard.jsx
│   │   └── App.jsx             # Router configuration with /admin portal routes
│   ├── .env.example            # Frontend environment template
│   └── package.json
```
