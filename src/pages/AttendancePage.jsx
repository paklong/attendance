import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { getAttendance } from "../firebase";

export default function AttendancePage() {
  const { studentName } = useParams();
  const location = useLocation();
  const studentId = location.state?.studentId || "";
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

  // Format Firestore timestamp to readable date
  const formatDate = (timestamp) => {
    if (!timestamp || !timestamp.seconds) return "N/A";
    const date = new Date(
      timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000,
    );
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="mt-4 p-6 bg-white rounded-lg shadow-md max-w-2xl mx-auto">
      <h2 className="text-center text-2xl font-bold text-gray-800 mb-4">
        Attendance for {studentName}
      </h2>
      {attendances.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 text-sm font-semibold text-gray-600">
                  Date
                </th>
                <th className="p-3 text-sm font-semibold text-gray-600">
                  Class
                </th>
                <th className="p-3 text-sm font-semibold text-gray-600">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {attendances.map((record) => (
                <tr
                  key={record.id}
                  className="border-b border-gray-200 hover:bg-gray-50"
                >
                  <td className="p-3 text-gray-700">
                    {formatDate(record.attendanceDate)}
                  </td>
                  <td className="p-3 text-gray-700">{record.className}</td>
                  <td className="p-3">
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
        <p className="text-gray-500 text-center">
          No attendance records found for {studentName}.
        </p>
      )}
    </div>
  );
}
