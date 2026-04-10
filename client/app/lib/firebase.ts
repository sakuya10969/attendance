import { getApps, initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";

function requiredEnv(name: string, value: string | undefined) {
  if (!value) {
    throw new Error(`Missing Firebase env: ${name}`);
  }

  return value;
}

const useAuthEmulator =
  import.meta.env.DEV &&
  import.meta.env.VITE_FIREBASE_USE_AUTH_EMULATOR === "true";
const authEmulatorUrl = import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_URL?.trim();

if (import.meta.env.PROD && import.meta.env.VITE_FIREBASE_USE_AUTH_EMULATOR === "true") {
  throw new Error("Auth Emulator must not be enabled in production.");
}

if (useAuthEmulator && !authEmulatorUrl) {
  throw new Error(
    "VITE_FIREBASE_AUTH_EMULATOR_URL is required when VITE_FIREBASE_USE_AUTH_EMULATOR=true.",
  );
}

const firebaseConfig = {
  apiKey: requiredEnv("VITE_FIREBASE_API_KEY", import.meta.env.VITE_FIREBASE_API_KEY),
  authDomain: requiredEnv(
    "VITE_FIREBASE_AUTH_DOMAIN",
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  ),
  projectId: requiredEnv(
    "VITE_FIREBASE_PROJECT_ID",
    import.meta.env.VITE_FIREBASE_PROJECT_ID,
  ),
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: requiredEnv("VITE_FIREBASE_APP_ID", import.meta.env.VITE_FIREBASE_APP_ID),
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

export const app =
  getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const isAuthEmulatorEnabled = useAuthEmulator;
const authEmulatorConnectedKey = "__attendance_auth_emulator_connected__";
const authEmulatorState = globalThis as typeof globalThis & {
  [authEmulatorConnectedKey]?: boolean;
};

if (
  useAuthEmulator &&
  typeof window !== "undefined" &&
  !authEmulatorState[authEmulatorConnectedKey]
) {
  connectAuthEmulator(auth, authEmulatorUrl!, {
    disableWarnings: true,
  });
  authEmulatorState[authEmulatorConnectedKey] = true;
}
