/**
 * Firebase Cloud Configuration
 * 
 * To enable real-time cloud sync across your phones:
 * 1. Go to https://console.firebase.google.com/ and create a free project.
 * 2. Click "Firestore Database" -> "Create database" (start in test mode).
 * 3. In Project Settings -> General -> "Your apps", click Web (</>) and copy your config.
 * 4. Paste the object below (or paste it directly in the website's Cloud Sync modal).
 */

window.FIREBASE_CONFIG = {
  apiKey: "AIzaSyDF6oGfuhR8eqm0Vv-irZLckwQ93FFTMsw",
  authDomain: "couplelist-71b7a.firebaseapp.com",
  projectId: "couplelist-71b7a",
  storageBucket: "couplelist-71b7a.firebasestorage.app",
  messagingSenderId: "1011849036667",
  appId: "1:1011849036667:web:0a3054ab487382abf9f3de"
};

// Immediately initialize Firebase default app so Auth and Firestore are active on startup
if (typeof firebase !== 'undefined' && (!firebase.apps || !firebase.apps.length)) {
  try {
    firebase.initializeApp(window.FIREBASE_CONFIG);
  } catch (e) {
    console.warn('Firebase initialization in firebaseConfig.js deferred:', e);
  }
}

