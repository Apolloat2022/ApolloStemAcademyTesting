# Apollo STEM Academy

A private, AI-powered STEM learning platform built for Grades 1–12.

## 🚀 Architecture
- **Web App (`apps/web`)**: React + Vite + Tailwind CSS. Hosted on Vercel/Cloudflare Pages.
- **API (`apps/api`)**: Hono + Cloudflare Workers. Powered by D1 Database and Gemini AI.
- **Packages**: Shared types and database schemas.

## 🛠️ Getting Started
```bash
# Install dependencies
npm install

# Run Web App
npm run dev:web

# Run API (Local Wrangler)
npm run dev:api
```

## 🌍 Deployment
### 1. API (Cloudflare)
- Create a D1 Database: `wrangler d1 create apollo-db`
- Apply schema: `wrangler d1 execute apollo-db --file=packages/db/schema.sql`
- Set `GEMINI_API_KEY` secret.
- Deploy: `npm run deploy:api`

### 2. Web (Vercel)
- Push to GitHub.
- Import to Vercel.
- Set Root Directory to `apps/web`.
- Build Command: `npm run build` (In root, or `tsc -b && vite build` in dir).
- Framework: Vite.

## 🔐 Security
- Auth: Google OAuth (Firebase/Cloudflare friendly).
- Data: D1 SQL for transactional integrity.
- Privacy: Role-based access (Student, Teacher, Volunteer, Parent).

## 🚀 Features

-   **AI Learning Hub**: 5 specialized tools for Math, Science, Language Arts, and Study Coaching.
-   **Multi-Role Dashboards**:
    -   **Students**: Interactive assignments, progress analytics, and gamified growth.
    -   **Teachers**: Class management, AI assignment suite, and deep performance analytics.
    -   **Volunteers**: Mentorship tracking, alerts for struggling students, and messaging.
-   **Intelligent Reporting**: Automated narrative reports synthesized from student activity.
-   **Role-Based Access**: Secure JWT authentication with Google OAuth integration.

## 🛠️ Setup & Development

### Prerequisites
- Node.js (v18+)
- Wrangler (for Cloudflare Workers/D1)

### Installation
```bash
npm install
```

### Local Development
```bash
# Start the web frontend
npm run dev:web

# Start the API backend
npm run dev:api
```

### Database Management
```bash
# Initialize local D1 database
npx wrangler d1 execute apollo-db --file=packages/db/schema.sql --local
```

## 📜 License
This project is private and intended for the Apollo STEM Academy educational platform.
