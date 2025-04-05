import { useState, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import formatDate from "../utils/formatDate";
import { TABLE_CLASSES, TH_CLASSES, TD_CLASSES } from "../utils/styles";

// Reusable style constants
const INPUT_CLASSES =
  "w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200";

export default function AttendanceView() {
  const { data } = useOutletContext();
  const { students = [], attendances = [] } = data || {};
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState(""); // Date filter (e.g., "2025-03-31")

  // Handle search input
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
  };

  // Memoized attendance summary for all students
  const attendanceData = useMemo(() => {
    // Get all attendances for this student, sorted by date (most recent first)
    let filteredData = students.map((student) => {
      const studentAttendances = attendances.filter(
        (att) => att.studentId === student.id,
      );

      if (studentAttendances.length === 0) {
        return [
          {
            id: student.id,
            studentName: student.studentName,
            attendanceDate: "No attendance recorded",
            atendanceDateTime: "No attendance recorded",
            attendedOnSelectedDate: selectedDate ? false : true,
            className: "No attendance recorded",
          },
        ];
      }

      return studentAttendances.map((att) => {
        const attDate = att.attendanceDate.toDate();
        const selDate = selectedDate
          ? new Date(selectedDate + "T00:00:00Z")
          : null;

        const attendedOnSelectedDate = selectedDate
          ? attDate.getUTCFullYear() === selDate.getUTCFullYear() &&
            attDate.getUTCMonth() === selDate.getUTCMonth() &&
            attDate.getUTCDate() === selDate.getUTCDate()
          : true; // If no date selected, include all attendances

        return {
          id: att.id,
          studentName: student.studentName,
          attendanceDateTime: att.attendanceDate,
          attendanceDate: formatDate(att.attendanceDate),
          attendedOnSelectedDate,
          className: att.className,
        };
      });

      // Check if student attended on the selected date (ignoring time)
    });

    filteredData = filteredData.flat();

    // Apply search filter
    filteredData = filteredData.filter((record) =>
      record.studentName.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    // Apply date filter
    if (selectedDate) {
      filteredData = filteredData.filter(
        (record) => record.attendedOnSelectedDate,
      );
    }

    return filteredData.sort((a, b) => {
      const aDate =
        a.attendanceDate === "No attendance recorded"
          ? null
          : a.attendanceDateTime;
      const bDate =
        b.attendanceDate === "No attendance recorded"
          ? null
          : b.attendanceDateTime;

      // If both are "No attendance recorded", sort by studentName
      if (aDate === null && bDate === null) {
        return a.studentName.localeCompare(b.studentName);
      }

      // If only a has no attendance, push it to the bottom
      if (aDate === null) {
        return 1; // b comes first
      }

      // If only b has no attendance, push it to the bottom
      if (bDate === null) {
        return -1; // a comes first
      }

      // If both have valid dates, compare them (most recent first)
      const dateCompare = bDate - aDate;
      if (dateCompare !== 0) {
        return dateCompare;
      }

      // If dates are the same, sort by studentName
      return a.studentName.localeCompare(b.studentName);
    });
  }, [students, attendances, searchTerm, selectedDate]);

  // Set default date to today
  const today = new Date().toISOString().split("T")[0]; // e.g., "2025-03-31"
  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Student Attendance
          </h2>
        </div>
      </div>

      {/* Search Bar and Date Filter */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            spellCheck="false"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search students by name..."
            className={INPUT_CLASSES}
          />
        </div>
        <div className="flex items-center space-x-2">
          <label htmlFor="dateFilter" className="text-gray-700">
            Filter by Date:
          </label>
          <input
            id="dateFilter"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            max={today}
            className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
          />
          <button
            onClick={() => setSelectedDate("")}
            className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition duration-150"
          >
            Clear
          </button>
        </div>
      </div>

      {(searchTerm || selectedDate) && (
        <p className="text-gray-600 mt-1">
          Total Students Displayed: {attendanceData.length}
        </p>
      )}
      {/* Attendance Table or Empty State */}
      {attendanceData.length > 0 ? (
        <div className="overflow-x-auto rounded-lg">
          <table className={TABLE_CLASSES}>
            <thead className="bg-gray-50">
              <tr>
                <th className={TH_CLASSES}>Student Name</th>
                <th className={TH_CLASSES}>Attendance</th>
                <th className={TH_CLASSES}>Class Name</th>
              </tr>
            </thead>
            <tbody>
              {attendanceData.map((record) => (
                <tr
                  key={record.id}
                  className="hover:bg-gray-50 transition duration-150"
                >
                  <td className={TD_CLASSES}>{record.studentName}</td>
                  <td className={TD_CLASSES}>{record.attendanceDate}</td>
                  <td className={TD_CLASSES}>{record.className}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-600 text-center py-4">
          {selectedDate
            ? `No students attended on ${selectedDate}.`
            : searchTerm
              ? `No attendance records found for "${searchTerm}".`
              : "No attendance records found."}
        </p>
      )}
    </div>
  );
}
