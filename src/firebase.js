import { initializeApp } from "firebase/app";
import { doc, getDoc, getFirestore } from "firebase/firestore";
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
      console.log(userSnap.data());
      return userSnap.data();
    } else {
      console.log("No user found");
      return null;
    }
  } catch (error) {
    console.log("Error fetching user proflie: ", error);
    throw error;
  }
};
