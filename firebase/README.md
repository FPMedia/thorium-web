# Firebase

This app uses **Firebase Authentication** (email/password) only. Firestore purchase records and a service-account key are not required.

Client config lives in `.env.local` as `NEXT_PUBLIC_FIREBASE_*` variables. See [FIREBASE_SETUP.md](../FIREBASE_SETUP.md) and [`.env.example`](../.env.example).

If a `firebase-service-account.json` file is present in this folder, it is gitignored. It is unused by the current codebase.
