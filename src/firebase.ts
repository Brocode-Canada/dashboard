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
  
  // Show error on page for both development and production
  const errorMessage = `
    <div style="padding: 20px; font-family: Arial, sans-serif; text-align: center; background: #fef2f2; border: 2px solid #dc2626; border-radius: 8px; margin: 20px;">
      <h1 style="color: #dc2626;">🔥 Firebase Configuration Error</h1>
      <p><strong>Missing environment variables:</strong> ${missingVars.join(', ')}</p>
      <p>To fix this:</p>
      <ol style="text-align: left; max-width: 500px; margin: 0 auto;">
        <li>Copy <code>env.example</code> to <code>.env.local</code></li>
        <li>Fill in your Firebase project configuration values</li>
        <li>Restart the development server</li>
      </ol>
      <p style="margin-top: 20px; font-size: 14px; color: #666;">
        You can find these values in your Firebase Console > Project Settings > General > Your apps > Web app
      </p>
    </div>
  `;
  
  // Insert error message into the page
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = errorMessage;
  } else {
    document.body.innerHTML = errorMessage;
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