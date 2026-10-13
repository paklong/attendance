import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore/lite";
import { auth, db } from "../lib/firebase";

const SIGN_IN_ERROR_MESSAGES = {
  "auth/invalid-email":
    "The email address is not valid. Please check and try again.",
  "auth/user-not-found": "No account found with this email",
  "auth/wrong-password": "Incorrect password. Please try again.",
  "auth/invalid-credential": "Incorrect email or password. Please try again.",
  "auth/too-many-requests":
    "Too many attempts. Please wait a bit and try again.",
  "auth/user-disabled": "This account has been disabled. Contact support.",
};

export const isAdminEmail = (email) =>
  Boolean(email) && email === import.meta.env.VITE_admin_email;

export const signIn = async (email, password) => {
  try {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    return user;
  } catch (error) {
    throw {
      code: error.code,
      message:
        SIGN_IN_ERROR_MESSAGES[error.code] ??
        "An error occurred. Please try again later.",
    };
  }
};

export const signOut = () => firebaseSignOut(auth);

export const subscribeToAuthChanges = (callback) =>
  onAuthStateChanged(auth, callback);

export const getUserProfile = async (userId) => {
  const userSnap = await getDoc(doc(db, "users", userId));
  return userSnap.exists() ? userSnap.data() : null;
};
