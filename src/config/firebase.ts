import { initializeApp, getApps } from 'firebase/app';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyBPXxPDYXtXJ_KNE4S_8GWRjG-cOECVY8k",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "sthub2-da44f.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "sthub2-da44f",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "sthub2-da44f.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "1098333936575",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:1098333936575:web:9b9b9b9b9b9b9b9b9b9b9b"
};

// Initialize Firebase only if it hasn't been initialized already
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
export const storage = getStorage(app);

export { app }; 