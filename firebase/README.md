# Firebase Service Account Key

Place your Firebase service account key file here.

## Instructions

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** → **Service Accounts**
4. Click **Generate new private key**
5. Save the downloaded JSON file as `firebase-service-account.json` in this directory

## Security

⚠️ **IMPORTANT**: This file contains sensitive credentials and is automatically excluded from git via `.gitignore`. Never commit this file to version control.

## Alternative Setup

You can also set the service account key via environment variables:

- `FIREBASE_SERVICE_ACCOUNT_KEY`: JSON string of the service account
- `FIREBASE_SERVICE_ACCOUNT_PATH`: Path to the service account JSON file

