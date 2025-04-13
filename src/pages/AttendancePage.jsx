import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { getAttendance } from "../utils/firebase";
import formatDate from "../utils/formatDate";
import {
  h2Styles,
  TABLE_CLASSES,
  TH_CLASSES,
  TD_CLASSES,
  noArtworksTextStyles,
} from "../utils/styles"; // Import shared styles

export default function AttendancePage() {
  const { studentName } = useParams();
  const location = useLocation();
  const studentId = location.state?.studentId || ""; // Passed something that is not paras (url)
  const [attendances, setAttendances] = useState([]);

  useEffect(() => {
    if (!studentId) {
      setAttendances([]);
      return;
    }
    const fetchAttendance = async () => {
      try {
        const results = await getAttendance(studentId, { includeIds: true });
        setAttendances(results);
      } catch (error) {
        console.log("Error fetching student attendance:", error);
        setAttendances([]);
      }
    };
    fetchAttendance();
    return () => {};
  }, [studentId]);

  return (
    <div className="mt-4 p-6 bg-white rounded-lg shadow-md max-w-2xl mx-auto">
      <h2 className={`${h2Styles} text-center`}>
        Attendance for {studentName}
      </h2>
      {attendances.length > 0 ? (
        <div className="overflow-x-auto">
          <table className={TABLE_CLASSES}>
            <thead>
              <tr className="bg-gray-100">
                <th className={TH_CLASSES}>Date</th>
                <th className={TH_CLASSES}>Class</th>
                <th className={TH_CLASSES}>Status</th>
              </tr>
            </thead>
            <tbody>
              {attendances.map((record) => (
                <tr
                  key={record.id}
                  className="border-b border-gray-200 hover:bg-gray-50"
                >
                  <td className={TD_CLASSES}>{formatDate(record.attendanceDate)}</td>
                  <td className={TD_CLASSES}>{record.className}</td>
                  <td className={TD_CLASSES}>
                    <span
                      className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                        record.attendance
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {record.attendance ? "Present" : "Absent"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className={`${noArtworksTextStyles} text-center`}>
          No attendance records found for {studentName}.
        </p>
      )}
    </div>
  );
}
