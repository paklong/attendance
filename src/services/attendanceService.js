import {
  collection,
  doc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore/lite";
import { db, QUERY_LIMIT } from "../lib/firebase";

const attendanceCollection = collection(db, "attendance");

const toRecords = (querySnap) =>
  querySnap.docs.map((d) => ({ id: d.id, ...d.data() }));

export const getAttendance = async (studentId) => {
  if (!studentId) {
    throw new Error("studentId required");
  }
  const querySnap = await getDocs(
    query(
      attendanceCollection,
      where("studentId", "==", studentId),
      limit(QUERY_LIMIT),
    ),
  );
  return toRecords(querySnap);
};

export const getAllAttendances = async () => {
  const querySnap = await getDocs(
    query(
      attendanceCollection,
      orderBy("attendanceDate", "desc"),
      limit(QUERY_LIMIT),
    ),
  );
  return toRecords(querySnap);
};

// Writes the attendance record and, when present, uses up one of the
// student's remaining classes in the same atomic batch.
export const recordAttendance = async ({
  studentId,
  parentId,
  className,
  attendance,
  attendanceDate,
}) => {
  const attendanceRef = doc(attendanceCollection);
  const attendanceData = {
    studentId,
    parentId,
    className,
    attendance,
    attendanceDate: Timestamp.fromDate(attendanceDate),
  };

  try {
    const batch = writeBatch(db);
    batch.set(attendanceRef, attendanceData);
    if (attendance) {
      batch.update(doc(db, "students", studentId), {
        remainingClasses: increment(-1),
        lastModifiedTime: serverTimestamp(),
      });
    }
    await batch.commit();
    return { id: attendanceRef.id, ...attendanceData };
  } catch (error) {
    throw new Error(`Failed to create attendance: ${error.message}`);
  }
};

// Deletes the record and refunds the class if the student was marked present.
export const removeAttendance = async ({
  attendanceId,
  studentId,
  attendance,
}) => {
  try {
    const batch = writeBatch(db);
    batch.delete(doc(attendanceCollection, attendanceId));
    if (attendance === true) {
      batch.update(doc(db, "students", studentId), {
        remainingClasses: increment(1),
        lastModifiedTime: serverTimestamp(),
      });
    }
    await batch.commit();
  } catch (error) {
    throw new Error(`Failed to delete attendance: ${error.message}`);
  }
};

export const updateAttendance = async (attendanceId, updates) => {
  try {
    await updateDoc(doc(attendanceCollection, attendanceId), updates);
  } catch (error) {
    throw new Error(`Failed to update attendance: ${error.message}`);
  }
};
