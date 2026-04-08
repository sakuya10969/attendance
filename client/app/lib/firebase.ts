// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC9GUg2oDku_OsZPzjN9Bvthe8gEjXYOWM",
  authDomain: "attendance-1b73a.firebaseapp.com",
  projectId: "attendance-1b73a",
  storageBucket: "attendance-1b73a.firebasestorage.app",
  messagingSenderId: "805615455386",
  appId: "1:805615455386:web:faa9025cbdbc7c215fe323",
  measurementId: "G-9B3DEMZWYC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
