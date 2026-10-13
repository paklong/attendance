import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from "firebase/firestore/lite";
import { db, QUERY_LIMIT } from "../lib/firebase";

export const getStudentProfile = async (studentId) => {
  const studentSnap = await getDoc(doc(db, "students", studentId));
  return studentSnap.exists() ? { ...studentSnap.data(), studentId } : null;
};

export const getAllStudents = async () => {
  const querySnap = await getDocs(
    query(collection(db, "students"), limit(QUERY_LIMIT)),
  );
  return querySnap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const generateStudentId = () => doc(collection(db, "students")).id;

export const createNewStudent = async (
  studentId,
  studentName,
  parentId = "",
  remainingClasses = 0,
) => {
  const studentData = {
    studentName,
    parentId,
    remainingClasses,
    totalAttendances: 0,
    lastAttendanceDate: null,
    lastModifiedTime: serverTimestamp(),
    isActive: true,
  };

  try {
    const batch = writeBatch(db);
    batch.set(doc(db, "students", studentId), studentData);
    if (parentId) {
      batch.update(doc(db, "users", parentId), {
        studentIDs: arrayUnion(studentId),
        lastModifiedTime: serverTimestamp(),
      });
    }
    await batch.commit();
    return { id: studentId, ...studentData };
  } catch (error) {
    throw new Error(`Failed to create student: ${error.message}`);
  }
};

export const updateStudent = async (studentId, updates) => {
  try {
    await updateDoc(doc(db, "students", studentId), {
      ...updates,
      lastModifiedTime: serverTimestamp(),
    });
  } catch (error) {
    throw new Error(`Failed to update student: ${error.message}`);
  }
};
