import { initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  inMemoryPersistence,
  initializeAuth,
  signOut,
} from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore/lite";
import { db, firebaseConfig, QUERY_LIMIT } from "../lib/firebase";

const CREATE_PARENT_ERROR_MESSAGES = {
  "auth/email-already-in-use": "This email is already registered.",
  "auth/invalid-email": "The email address is not valid.",
  "auth/weak-password": "The password is too weak. Use at least 6 characters.",
};

// Accounts are created on a secondary app so the signed-in admin isn't
// replaced by the new parent.
let adminAuth;
const getAdminAuth = () => {
  adminAuth ??= initializeAuth(initializeApp(firebaseConfig, "adminApp"), {
    persistence: inMemoryPersistence,
  });
  return adminAuth;
};

export const getAllParents = async () => {
  const querySnap = await getDocs(
    query(collection(db, "users"), limit(QUERY_LIMIT)),
  );
  return querySnap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const createNewParent = async (email, password, parentName) => {
  const secondaryAuth = getAdminAuth();
  try {
    const { user } = await createUserWithEmailAndPassword(
      secondaryAuth,
      email,
      password,
    );
    const parentData = {
      email,
      parentName,
      studentIDs: [],
      lastModifiedTime: serverTimestamp(),
      isActive: true,
    };
    await setDoc(doc(db, "users", user.uid), parentData);
    return { id: user.uid, ...parentData };
  } catch (error) {
    throw new Error(
      CREATE_PARENT_ERROR_MESSAGES[error.code] ??
        `Failed to create parent: ${error.message}`,
    );
  } finally {
    signOut(secondaryAuth).catch(() => {});
  }
};

export const updateParent = async (userId, updates) => {
  try {
    await updateDoc(doc(db, "users", userId), {
      ...updates,
      lastModifiedTime: serverTimestamp(),
    });
  } catch (error) {
    throw new Error(`Failed to update parent: ${error.message}`);
  }
};
