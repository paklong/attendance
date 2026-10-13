import { initializeApp } from "firebase/app";
import {
  browserLocalPersistence,
  browserSessionPersistence,
  indexedDBLocalPersistence,
  initializeAuth,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore/lite";

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_apiKey,
  authDomain: import.meta.env.VITE_authDomain,
  projectId: import.meta.env.VITE_projectId,
  storageBucket: import.meta.env.VITE_storageBucket,
  messagingSenderId: import.meta.env.VITE_messagingSenderId,
  appId: import.meta.env.VITE_appId,
};

const missingConfigKeys = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => `VITE_${key}`);

if (missingConfigKeys.length > 0) {
  console.error(
    `Missing Firebase environment variables: ${missingConfigKeys.join(", ")}. ` +
      "Add them to .env (see .env.example) and restart the dev server.",
  );
}

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
// Same persistence as getAuth(), minus the popup/redirect sign-in code this
// email/password-only app never uses.
export const auth = initializeAuth(app, {
  persistence: [
    indexedDBLocalPersistence,
    browserLocalPersistence,
    browserSessionPersistence,
  ],
});

export const QUERY_LIMIT = 10000;
