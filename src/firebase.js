import { initializeApp } from "firebase/app";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_apiKey,
  authDomain: import.meta.env.VITE_authDomain,
  projectId: import.meta.env.VITE_projectId,
  storageBucket: import.meta.env.VITE_storageBucket,
  messagingSenderId: import.meta.env.VITE_messagingSenderId,
  appId: import.meta.env.VITE_appId,
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);

export const firebaseSignIn = (auth, email, password) => {
  return signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      console.log(`User email: ${user.email}`);
      return user;
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log(`Error: ${errorCode}: ${errorMessage}`);

      let customMessage;
      switch (errorCode) {
        case "auth/invalid-email":
          customMessage =
            "The email address is not valid. Please check and try again.";
          break;
        case "auth/user-not-found":
          customMessage = "No account found with this email";
          break;
        case "auth/wrong-password":
          customMessage = "Incorrect password. Please try again.";
          break;
        case "auth/too-many-requests":
          customMessage = "Too many attempts. Please wait a bit and try again.";
          break;
        case "auth/user-disabled":
          customMessage = "This account has been disabled. Contact support.";
          break;
        default:
          customMessage = "An error occurred. Please try again later.";
      }
      throw { code: errorCode, message: customMessage };
    });
};

export const getUserProfile = async (userId) => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      console.log("User Profile from firebase.js " + userSnap.data());
      return userSnap.data();
    } else {
      console.log(`No user ${userId} found`);
      return null;
    }
  } catch (error) {
    console.log("Error fetching user proflie: ", error);
    throw error;
  }
};

export const getStudentProfile = async (studentId) => {
  try {
    const studentRef = doc(db, "students", studentId);
    const studentSnap = await getDoc(studentRef);
    if (studentSnap.exists()) {
      console.log(`Student ${studentSnap.data().studentName} found`);
      return { ...studentSnap.data(), studentId };
    } else {
      console.log(`No student ${studentId} found`);
      return null;
    }
  } catch (error) {
    console.log("Error fetching student profile", error);
    throw error;
  }
};

export const getAttendance = async (studentId) => {
  const limitResult = 10;

  try {
    if (!studentId) {
      throw new Error("studentId required");
    }

    const q = query(
      collection(db, "attendance"),
      where("studentId", "==", studentId),
      limit(limitResult),
    );
    const querySnap = await getDocs(q);
    const results = querySnap.docs.map((doc) => {
      return { id: doc.id, ...doc.data() };
    });
    return results;
  } catch (error) {
    console.log("Error fetching student attendance", error);
    throw error;
  }
};
