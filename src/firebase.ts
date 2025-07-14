// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Your web app's Firebase configuration using Vite environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Check if all required environment variables are present
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN', 
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
];

const missingVars = requiredEnvVars.filter(varName => !import.meta.env[varName]);

if (missingVars.length > 0) {
  console.error('Missing Firebase environment variables:', missingVars);
  console.error('Please create a .env.local file with your Firebase configuration.');
  console.error('You can copy from env.example and fill in your values.');
  
  // Show error on page for production builds
  if (import.meta.env.PROD) {
    document.body.innerHTML = `
      <div style="padding: 20px; font-family: Arial, sans-serif; text-align: center;">
        <h1 style="color: #dc2626;">Configuration Error</h1>
        <p>Firebase configuration is missing. Please check the deployment logs.</p>
        <p>Missing variables: ${missingVars.join(', ')}</p>
      </div>
    `;
  }
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Debug: Log Firebase initialization
console.log('Firebase initialized with config:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  hasApiKey: !!firebaseConfig.apiKey
});

// Initialize Analytics only if supported and measurementId is available
let analytics = null;
if (import.meta.env.VITE_FIREBASE_MEASUREMENT_ID) {
  isSupported().then(yes => yes ? getAnalytics(app) : null).then(analyticsInstance => {
    analytics = analyticsInstance;
  }).catch(err => {
    console.warn('Analytics not supported:', err);
  });
}

const db = getFirestore(app);
const auth = getAuth(app);

// Debug: Test Firebase connection
auth.onAuthStateChanged((user) => {
  console.log('Firebase auth state changed:', user ? 'User logged in' : 'No user');
});

export { app, analytics, db, auth }; 