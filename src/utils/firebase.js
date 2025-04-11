import { initializeApp } from "firebase/app";
import {
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_apiKey,
  authDomain: import.meta.env.VITE_authDomain,
  projectId: import.meta.env.VITE_projectId,
  storageBucket: import.meta.env.VITE_storageBucket,
  messagingSenderId: import.meta.env.VITE_messagingSenderId,
  appId: import.meta.env.VITE_appId,
};

const app = initializeApp(firebaseConfig);
const limitResult = 200;

export const db = getFirestore(app);
export const auth = getAuth(app);

const adminApp = initializeApp(firebaseConfig, "adminApp");
const adminAuth = getAuth(adminApp);

export const firebaseSignIn = (auth, email, password) => {
  return signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      // console.log(`User email: ${user.email}`);
      return user;
    })
    .catch((error) => {
      const errorCode = error.code;
      // const errorMessage = error.message;
      // console.log(`Error: ${errorCode}: ${errorMessage}`);

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
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    // console.log("User Profile from firebase.js " + userSnap.data());
    return userSnap.data();
  } else {
    // console.log(`No user ${userId} found`);
    return null;
  }
};

export const getStudentProfile = async (studentId) => {
  const studentRef = doc(db, "students", studentId);
  const studentSnap = await getDoc(studentRef);
  if (studentSnap.exists()) {
    // console.log(`Student ${studentSnap.data().studentName} found`);
    return { ...studentSnap.data(), studentId };
  } else {
    // console.log(`No student ${studentId} found`);
    return null;
  }
};

export const getAttendance = async (studentId) => {
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
};

export const getAllStudents = async () => {
  const q = query(collection(db, "students"), limit(limitResult));

  const querySnap = await getDocs(q);
  const results = querySnap.docs.map((doc) => {
    return { id: doc.id, ...doc.data() };
  });
  return results;
};

export const getAllParents = async () => {
  const q = query(collection(db, "users"), limit(limitResult));

  const querySnap = await getDocs(q);
  const results = querySnap.docs.map((doc) => {
    return { id: doc.id, ...doc.data() };
  });
  return results;
};

export const getAllAttendances = async () => {
  const q = query(
    collection(db, "attendance"),
    orderBy("attendanceDate", "desc"),
    limit(limitResult),
  );

  const querySnap = await getDocs(q);
  const results = querySnap.docs.map((doc) => {
    return { id: doc.id, ...doc.data() };
  });
  return results;
};

// 1. Create New Parent (with Firebase Auth)
export const createNewParent = async (email, password, parentName) => {
  try {
    // Create a new user in Firebase Auth using the secondary app
    const userCredential = await createUserWithEmailAndPassword(
      adminAuth,
      email,
      password,
    );
    const user = userCredential.user;
    const userId = user.uid; // Use the auth UID as the document ID

    // Create the corresponding parent document in Firestore (using primary app's db)
    const userRef = doc(db, "users", userId);
    const parentData = {
      email,
      parentName,
      studentIDs: [], // Initialize as empty array
      lastModifiedTime: serverTimestamp(),
      isActive: true,
    };

    await setDoc(userRef, parentData);
    return { id: userId, ...parentData };
  } catch (error) {
    const errorCode = error.code;
    let customMessage;
    switch (errorCode) {
      case "auth/email-already-in-use":
        customMessage = "This email is already registered.";
        break;
      case "auth/invalid-email":
        customMessage = "The email address is not valid.";
        break;
      case "auth/weak-password":
        customMessage = "The password is too weak. Use at least 6 characters.";
        break;
      default:
        customMessage = "Failed to create parent: " + error.message;
    }
    throw new Error(customMessage);
  }
};

// 2. Create New Student
// New function to generate student ID
export const generateStudentId = () => {
  const studentRef = doc(collection(db, "students"));
  return studentRef.id;
};

export const createNewStudent = async (
  studentId,
  studentName,
  parentId = "",
  remainingClasses = 0,
) => {
  const studentRef = doc(db, "students", studentId);
  const studentData = {
    studentName,
    parentId, // Single string, not an array
    remainingClasses,
    lastModifiedTime: serverTimestamp(),
    isActive: true,
  };

  try {
    await setDoc(studentRef, studentData);
    if (parentId) {
      // Only update parent if a parentId is provided
      const parentRef = doc(db, "users", parentId);
      await updateDoc(parentRef, {
        studentIDs: arrayUnion(studentId),
        lastModifiedTime: serverTimestamp(),
      });
    }
    return { id: studentId, ...studentData };
  } catch (error) {
    throw new Error(`Failed to create student: ${error.message}`);
  }
};

// 3. Create New Attendance
export const createNewAttendance = async (
  studentId,
  parentId,
  className,
  attendance,
  attendanceDate,
) => {
  const attendanceRef = doc(collection(db, "attendance"));
  const attendanceData = {
    studentId,
    parentId,
    className,
    attendance,
    attendanceDate,
  };

  try {
    await setDoc(attendanceRef, attendanceData);
    return { id: attendanceRef.id, ...attendanceData };
  } catch (error) {
    throw new Error(`Failed to create attendance: ${error.message}`);
  }
};

// 4. Update Parent
export const updateParent = async (userId, updates) => {
  const userRef = doc(db, "users", userId);
  const updatedData = {
    ...updates,
    lastModifiedTime: serverTimestamp(),
  };

  try {
    await updateDoc(userRef, updatedData);
    const updatedDoc = await getDoc(userRef);
    if (updatedDoc.exists()) {
      return { id: userId, ...updatedDoc.data() };
    }
    throw new Error("Parent not found after update");
  } catch (error) {
    throw new Error(`Failed to update parent: ${error.message}`);
  }
};

// 5. Update Student
export const updateStudent = async (studentId, updates) => {
  const studentRef = doc(db, "students", studentId);
  const updatedData = {
    ...updates,
    lastModifiedTime: serverTimestamp(),
  };

  try {
    await updateDoc(studentRef, updatedData);
    const updatedDoc = await getDoc(studentRef);
    if (updatedDoc.exists()) {
      return { id: studentId, ...updatedDoc.data() };
    }
    throw new Error("Student not found after update");
  } catch (error) {
    throw new Error(`Failed to update student: ${error.message}`);
  }
};

// 6. Update Attendance
export const updateAttendance = async (attendanceId, updates) => {
  const attendanceRef = doc(db, "attendance", attendanceId);

  try {
    await updateDoc(attendanceRef, updates);
    const updatedDoc = await getDoc(attendanceRef);
    if (updatedDoc.exists()) {
      return { id: attendanceId, ...updatedDoc.data() };
    }
    throw new Error("Attendance not found after update");
  } catch (error) {
    throw new Error(`Failed to update attendance: ${error.message}`);
  }
};

// 7. Delete Attendance
export const deleteAttendance = async (attendanceId) => {
  const attendanceRef = doc(db, "attendance", attendanceId);

  try {
    await deleteDoc(attendanceRef);
    return { id: attendanceId, success: true };
  } catch (error) {
    throw new Error(`Failed to delete attendance: ${error.message}`);
  }
};
