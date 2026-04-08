import { getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC9GUg2oDku_OsZPzjN9Bvthe8gEjXYOWM",
  authDomain: "attendance-1b73a.firebaseapp.com",
  projectId: "attendance-1b73a",
  storageBucket: "attendance-1b73a.firebasestorage.app",
  messagingSenderId: "805615455386",
  appId: "1:805615455386:web:faa9025cbdbc7c215fe323",
  measurementId: "G-9B3DEMZWYC",
};

export const app =
  getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);

export const auth = getAuth(app);
