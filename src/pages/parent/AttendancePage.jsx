import { useCallback } from "react";
import { useLocation, useParams } from "react-router-dom";
import useAsync from "../../hooks/useAsync";
import { getAttendance } from "../../services/attendanceService";
import { formatDateTime } from "../../utils/formatDate";
import {
  emptyTextStyles,
  h2Styles,
  TABLE_CLASSES,
  TD_CLASSES,
  TH_CLASSES,
} from "../../utils/styles";

const newestFirst = (a, b) =>
  (b.attendanceDate?.toMillis() ?? 0) - (a.attendanceDate?.toMillis() ?? 0);

export default function AttendancePage() {
  const { studentName } = useParams();
  const studentId = useLocation().state?.studentId;

  const loadAttendance = useCallback(
    async () =>
      studentId ? (await getAttendance(studentId)).sort(newestFirst) : [],
    [studentId],
  );
  const { data, loading, error } = useAsync(loadAttendance);
  const attendances = error ? [] : (data ?? []);

  return (
    <div className="mt-4 p-6 bg-white rounded-lg shadow-md max-w-2xl mx-auto">
      <h2 className={`${h2Styles} text-center`}>
        Attendance for {studentName}
      </h2>
      {loading ? (
        <p className="text-gray-500 text-center">Loading attendance...</p>
      ) : attendances.length > 0 ? (
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
                  <td className={TD_CLASSES}>
                    {formatDateTime(record.attendanceDate)}
                  </td>
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
        <p className={emptyTextStyles}>
          No attendance records found for {studentName}.
        </p>
      )}
    </div>
  );
}
