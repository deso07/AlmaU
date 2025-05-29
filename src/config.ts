// API Configuration
export const API_CONFIG = {
  // Use environment variable or fallback to local development URL
  BASE_URL: process.env.REACT_APP_API_URL || 'https://your-firebase-project-id.firebaseio.com',
  ENDPOINTS: {
    USERS: '/users',
    AUTH: '/auth',
  }
};

// Firebase Configuration
export const FIREBASE_CONFIG = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
}; 