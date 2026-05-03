import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// TODO: Replace this with your actual Firebase configuration
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCS9KOT7OSSuurKdMtkiC8z7CkxlS9WxWY",
  authDomain: "skill-bridge-ced3f.firebaseapp.com",
  projectId: "skill-bridge-ced3f",
  storageBucket: "skill-bridge-ced3f.firebasestorage.app",
  messagingSenderId: "133012890870",
  appId: "1:133012890870:web:d6b7d6b9f640d05dae38d7",
  measurementId: "G-35MXXYCWTE"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
