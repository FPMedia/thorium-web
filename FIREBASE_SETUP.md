# Firebase Authentication Setup

This project uses Firebase Authentication to protect the `/read/*` routes. Any registered, signed-in user can read every book. There is no purchase step.

## Setup Instructions

### 1. Get Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create a new one)
3. Click the gear icon next to "Project Overview" → "Project settings"
4. Scroll down to "Your apps" section
5. If you don't have a web app, click "Add app" → Web (</> icon)
6. Copy the configuration values from the `firebaseConfig` object

### 2. Enable Email/Password Authentication

1. In Firebase Console, go to "Authentication" (left sidebar)
2. Click "Get started" if you haven't enabled it yet
3. Go to "Sign-in method" tab
4. Click on "Email/Password"
5. Enable "Email/Password" and click "Save"

### 3. Set Environment Variables

Create a `.env.local` file in the project root (see [`.env.example`](.env.example)) with the following variables:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key-here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

Replace the placeholder values with your actual Firebase configuration values.

### 4. Restart Development Server

After setting up the environment variables, restart your development server:

```bash
pnpm dev
```

## How It Works

- **Public Routes**: The home page (`/`) and authentication pages (`/login`, `/signup`) are publicly accessible
- **Protected Routes**: All routes under `/read/*` require authentication
- **Session cookie**: After sign-in, the Firebase ID token is stored in a `__session` cookie (HttpOnly via `POST /api/auth/session`, with a client cookie fallback). Middleware checks this cookie before serving `/read/*`. The cookie is written **before** the UI treats the user as logged in, so opening a book does not bounce back to login.
- **Authentication Flow**:
  1. Unauthenticated users trying to access `/read/*` are redirected to `/login?redirect=...`
  2. Sign-in waits until the session cookie is saved, then continues to the requested route
  3. Already-signed-in users who hit `/login` or `/signup` are sent onward instead of seeing the form again
  4. Prefetches of `/read/*` without a session return `204` so Next.js does not cache a login redirect
  5. Authentication state is persisted across page refreshes; token refresh keeps the session cookie in sync

## Usage

Users can:
- Sign up for a new account at `/signup`
- Sign in to an existing account at `/login`
- Access protected reading routes after authentication (one sign-in per session)

