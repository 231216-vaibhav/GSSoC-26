# Firebase Authentication & Session Tracking App

This is a complete full-stack web application built with React, Vite, and Firebase. It implements Google Authentication along with comprehensive logging and session tracking.

## Features Implemented

1. **Google Authentication**: Uses `signInWithPopup` to provide a seamless login experience.
2. **User Database**: Stores user details (uid, name, email, profile picture) on first login and updates `lastLogin` timestamp on subsequent logins.
3. **Auth Activity Logging**: Records every login, logout, and browser close action securely in the `auth_logs` collection.
4. **Session Tracking**: Tracks active sessions in the `sessions` collection. Updates `isActive` to false on explicit logout or when the browser window is closed.
5. **Modern Frontend**: Built with React and Vanilla CSS (custom design system, dark mode aesthetic, micro-animations).
6. **Firestore Security Rules**: Ensures users can only access their own data, and logs/sessions remain immutable or append-only.

## Setup Instructions

1. **Configure Firebase**:
   Open `src/firebase.js` and replace the `firebaseConfig` object with your actual project credentials from the Firebase Console.

2. **Deploy Security Rules**:
   Copy the contents of `firestore.rules` and paste them into the Rules tab of your Firestore Database in the Firebase Console.

3. **Install Dependencies**:
   ```bash
   npm install
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```
