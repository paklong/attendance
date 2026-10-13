import {
  collection,
  doc,
  documentId,
  getCount,
  getDoc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  startAfter,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore/lite";
import { db, QUERY_LIMIT } from "../lib/firebase";

export const ATTENDANCE_PAGE_SIZE = 50;
// Firestore caps `in` filters at 30 values.
export const MAX_STUDENTS_PER_SEARCH = 30;
const MAX_BATCH_WRITES = 500;
const STATS_SCAN_PAGE_SIZE = 1000;

const attendanceCollection = collection(db, "attendance");

const toRecord = (d) => ({ id: d.id, ...d.data() });

const toMillis = (timestamp) => timestamp?.toMillis() ?? 0;

const latestDate = (records) =>
  records.reduce(
    (latest, record) =>
      toMillis(record.attendanceDate) > toMillis(latest)
        ? record.attendanceDate
        : latest,
    null,
  );

const dateRangeConstraints = (dateRange) =>
  dateRange
    ? [
        where("attendanceDate", ">=", Timestamp.fromDate(dateRange.start)),
        where("attendanceDate", "<", Timestamp.fromDate(dateRange.end)),
      ]
    : [];

// Students created before attendance stats existed have no
// `totalAttendances` field until rebuildAttendanceStats() runs; their stats
// are left alone so the rebuild starts from a clean slate.
const hasAttendanceStats = (student) => student?.totalAttendances !== undefined;

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
  return querySnap.docs.map(toRecord);
};

// Newest-first page of attendance records. Pass the previous page's
// `nextCursor` to continue.
export const getAttendancePage = async ({ cursor, dateRange } = {}) => {
  const querySnap = await getDocs(
    query(
      attendanceCollection,
      ...dateRangeConstraints(dateRange),
      orderBy("attendanceDate", "desc"),
      ...(cursor ? [startAfter(cursor)] : []),
      limit(ATTENDANCE_PAGE_SIZE + 1),
    ),
  );
  const docs = querySnap.docs.slice(0, ATTENDANCE_PAGE_SIZE);
  return {
    records: docs.map(toRecord),
    nextCursor: docs.at(-1) ?? null,
    hasMore: querySnap.docs.length > ATTENDANCE_PAGE_SIZE,
  };
};

export const countAttendance = async (dateRange) => {
  const snapshot = await getCount(
    query(attendanceCollection, ...dateRangeConstraints(dateRange)),
  );
  return snapshot.data().count;
};

// All records for up to MAX_STUDENTS_PER_SEARCH students, unsorted.
export const getAttendanceForStudents = async (studentIds) => {
  if (studentIds.length === 0) return [];
  if (studentIds.length > MAX_STUDENTS_PER_SEARCH) {
    throw new Error(
      `Search is limited to ${MAX_STUDENTS_PER_SEARCH} students at a time.`,
    );
  }
  const querySnap = await getDocs(
    query(
      attendanceCollection,
      where("studentId", "in", studentIds),
      limit(QUERY_LIMIT),
    ),
  );
  return querySnap.docs.map(toRecord);
};

// Writes the attendance record and updates the student's remaining classes
// and attendance stats in one transaction.
export const recordAttendance = async ({
  studentId,
  parentId,
  className,
  attendance,
  attendanceDate,
}) => {
  const attendanceRef = doc(attendanceCollection);
  const studentRef = doc(db, "students", studentId);
  const attendanceData = {
    studentId,
    parentId,
    className,
    attendance,
    attendanceDate: Timestamp.fromDate(attendanceDate),
  };

  try {
    await runTransaction(db, async (transaction) => {
      const studentSnap = await transaction.get(studentRef);
      const student = studentSnap.data();
      const updates = {};

      if (attendance) {
        updates.remainingClasses = increment(-1);
        updates.lastModifiedTime = serverTimestamp();
      }
      if (hasAttendanceStats(student)) {
        updates.totalAttendances = increment(1);
        if (
          toMillis(attendanceData.attendanceDate) >
          toMillis(student.lastAttendanceDate)
        ) {
          updates.lastAttendanceDate = attendanceData.attendanceDate;
        }
      }

      transaction.set(attendanceRef, attendanceData);
      if (studentSnap.exists() && Object.keys(updates).length > 0) {
        transaction.update(studentRef, updates);
      }
    });
    return { id: attendanceRef.id, ...attendanceData };
  } catch (error) {
    throw new Error(`Failed to create attendance: ${error.message}`);
  }
};

// Deletes the record, refunds the class if the student was marked present,
// and keeps the student's attendance stats in sync.
export const removeAttendance = async ({
  attendanceId,
  studentId,
  attendance,
  attendanceDate,
}) => {
  const studentRef = doc(db, "students", studentId);

  try {
    const studentSnap = await getDoc(studentRef);
    const student = studentSnap.data();
    const updates = {};

    if (attendance === true) {
      updates.remainingClasses = increment(1);
      updates.lastModifiedTime = serverTimestamp();
    }
    if (hasAttendanceStats(student)) {
      updates.totalAttendances = increment(-1);
      if (toMillis(attendanceDate) >= toMillis(student.lastAttendanceDate)) {
        const remaining = (await getAttendance(studentId)).filter(
          (record) => record.id !== attendanceId,
        );
        updates.lastAttendanceDate = latestDate(remaining);
      }
    }

    const batch = writeBatch(db);
    batch.delete(doc(attendanceCollection, attendanceId));
    if (studentSnap.exists() && Object.keys(updates).length > 0) {
      batch.update(studentRef, updates);
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

const scanAllAttendance = async () => {
  const records = [];
  let cursor = null;
  for (;;) {
    const querySnap = await getDocs(
      query(
        attendanceCollection,
        orderBy(documentId()),
        ...(cursor ? [startAfter(cursor)] : []),
        limit(STATS_SCAN_PAGE_SIZE),
      ),
    );
    records.push(...querySnap.docs.map(toRecord));
    if (querySnap.docs.length < STATS_SCAN_PAGE_SIZE) return records;
    cursor = querySnap.docs.at(-1);
  }
};

// Recomputes `totalAttendances` and `lastAttendanceDate` for every student
// from the full attendance history. Reads every attendance record once, so
// it's meant as a one-time backfill or a repair tool.
export const rebuildAttendanceStats = async () => {
  const [studentsSnap, records] = await Promise.all([
    getDocs(collection(db, "students")),
    scanAllAttendance(),
  ]);

  const recordsByStudent = new Map();
  for (const record of records) {
    const list = recordsByStudent.get(record.studentId) ?? [];
    list.push(record);
    recordsByStudent.set(record.studentId, list);
  }

  const studentDocs = studentsSnap.docs;
  for (let i = 0; i < studentDocs.length; i += MAX_BATCH_WRITES) {
    const batch = writeBatch(db);
    for (const studentDoc of studentDocs.slice(i, i + MAX_BATCH_WRITES)) {
      const studentRecords = recordsByStudent.get(studentDoc.id) ?? [];
      batch.update(studentDoc.ref, {
        totalAttendances: studentRecords.length,
        lastAttendanceDate: latestDate(studentRecords),
      });
    }
    await batch.commit();
  }
  return { students: studentDocs.length, records: records.length };
};
