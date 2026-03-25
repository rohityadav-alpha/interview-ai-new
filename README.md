# 🤖 Interview AI 

Welcome to **Interview AI**, a cutting-edge next-generation web application designed to help candidates prepare for their dream jobs through AI-powered mock interviews. 

This platform leverages the latest web technologies to provide dynamic, intelligent, and highly realistic interview experiences complete with real-time feedback, analytics, and live camera monitoring.

## 🚀 Key Features

- **AI-Generated Mock Interviews**: Uses **Google Gemini 2.5 Flash** to dynamically generate customized interview questions based on your chosen skill (e.g., React, Python, Product Management) and difficulty level.
- **Intelligent Evaluation & Feedback**: Once an answer is provided, the AI acts as a hiring manager, scoring the answer (1-10) and offering granular feedback including **strengths**, **areas for improvement**, and **confidence tips**.
- **Live Interview Monitoring**: A built-in virtual camera tracker (`SimpleFaceTracker`) activates during the interview to simulate a real-world monitored interview environment, helping candidates practice screen presence.
- **Comprehensive Analytics Dashboard**: Visualizes interview performance over time using interactive charts (`Recharts`), tracking total scores, average scores, and interview duration.
- **Detailed PDF Reports**: Users can easily export their interview results and feedback as a beautifully formatted PDF report (using `jspdf` and `jspdf-autotable`).
- **Global Leaderboard**: Gamifies the interview learning process, allowing users to see how they rank against other candidates.
- **Email Notifications**: Seamless integration with **SendGrid** to send important updates and interview reports directly to candidates' inboxes.
- **Theme-Aware UI**: Fully supports both Dark and Light modes (`next-themes`), ensuring a high-quality visual experience.

## 🛠️ Technology Stack

This application is built with a highly modern and scalable stack:

**Frontend & Core Framework**
- [Next.js](https://nextjs.org/) (App Router) - The React framework for the web.
- [React 19](https://react.dev/) - For building user interfaces.
- [TypeScript](https://www.typescriptlang.org/) - For strict type safety throughout the codebase.

**Styling & UI Library**
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework for rapid UI development.
- [Radix UI](https://www.radix-ui.com/) - Unstyled, accessible UI primitives (Dialogs, Menus, Selects).
- [Framer Motion](https://www.framer.com/motion/) - For smooth and complex animations.
- [Lucide React](https://lucide.dev/) - Beautiful, consistent icon set.

**Backend & Database**
- [Prisma ORM](https://www.prisma.io/) - Next-generation Node.js and TypeScript ORM.
- [PostgreSQL (Neon Serverless)](https://neon.tech/) - A reliable, serverless database engine for handling all application data.

**Authentication & APIs**
- [Clerk](https://clerk.com/) - Secure and robust user authentication and identity management.
- [Google Generative AI](https://ai.google/dev/) - API for the Gemini 2.5 Flash model acting as the AI interviewer.
- [SendGrid](https://sendgrid.com/) - For handling outbound email communications.

## 🗄️ Database Schema Synopsis

The relational database is architected to track deep interview telemetry:
- **`User`**: Tracks Clerk identity (`clerkUserId`), email, and profile details.
- **`Interview`**: Represents an entire interview session. It records the subject `skill`, `difficulty`, `totalScore`, `avgScore`, `interviewDuration`, and `isCompleted` status.
- **`InterviewResponse`**: Represents a specific question within an interview. It stores the AI-generated `question`, the candidate's `userAnswer`, the `aiScore`, and multi-dimensional `aiFeedback` (strengths, improvements, confidence tips).

## 📂 Project Structure

```text
d:\interview-ai-new\
├── prisma/                 # Prisma schema definitions and database migrations
├── src/
│   ├── app/                # Next.js App Router (pages: dashboard, interview, leaderboard, reports)
│   │   ├── api/            # API endpoints (email, interviews, leaderboard, reports)
│   ├── components/         # Reusable UI components
│   │   ├── ui/             # Generic UI atoms (buttons, inputs, cards)
│   │   ├── charts/         # Recharts wrappers for the dashboard
│   │   └── SimpleFaceTracker.tsx # Camera monitoring component
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Core utilities
│   │   ├── ai.ts           # Gemini prompt engineering and evaluations
│   │   ├── pdf-generator.ts# Logic for PDF rendering and downloads
│   │   ├── prisma.ts       # Prisma Client singleton
│   │   └── utils.ts        # Helper utilities (e.g., tailwind merge)
│   └── middleware.ts       # Clerk authentication middleware for route protection
├── public/                 # Static assets
└── tailwind.config.ts      # Tailwind configuration and theming
```

## 🚀 Getting Started

To run this project locally, follow these steps:

### 1. Clone the repository
```bash
git clone <repository-url>
cd interview-ai-new
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Setup Environment Variables
Create a `.env.local` file in the root directory. You'll need credentials for the following services:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Google Gemini API
GOOGLE_GEMINI_API_KEY=your_gemini_api_key

# Database
DATABASE_URL=your_neon_postgresql_connection_string

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# SendGrid Configuration
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=your_verified_sender_email
SENDGRID_FROM_NAME="Interview AI"
```

### 4. Setup the Database
Generate the Prisma client and push the schema to your database:
```bash
npx prisma generate
npx prisma db push
```

### 5. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application in action. Start your first mock interview, answer the generated questions, and see your real-time AI feedback!
