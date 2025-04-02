import { useState, useMemo } from "react";
import { useOutletContext, Link } from "react-router-dom";
import formatDate from "../utils/formatDate";

// Reusable style constants
const INPUT_CLASSES =
  "w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200";
const TABLE_CLASSES =
  "min-w-full bg-white border border-gray-200 rounded-lg shadow-sm";
const TH_CLASSES =
  "px-6 py-3 text-left text-xs font-semibold text-gray-700 border-b border-gray-400";
const TD_CLASSES = "px-6 py-4 text-gray-800 border-b border-gray-200 text-xs";
const SUGGESTION_CLASSES =
  "px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer transition duration-150";

export default function AttendanceView() {
  const data = useOutletContext();
  const { students = [], attendances = [] } = data || {};
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedDate, setSelectedDate] = useState(""); // Date filter (e.g., "2025-03-31")

  // Handle search input and suggestions
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.length > 0) {
      const filteredSuggestions = students
        .filter((student) =>
          student.studentName.toLowerCase().includes(value.toLowerCase()),
        )
        .map((student) => student.studentName)
        .slice(0, 5);
      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion);
    setSuggestions([]);
  };

  // Memoized attendance summary for all students
  const attendanceData = useMemo(() => {
    let filteredData = students.map((student) => {
      const studentAttendances = attendances
        .filter((att) => att.studentId === student.id)
        .sort(
          (a, b) => new Date(b.attendanceDate) - new Date(a.attendanceDate),
        );
      const lastAttendance = studentAttendances[0];
      const totalAttendances = studentAttendances.length;

      // Check if student attended on the selected date (ignoring time)
      const attendedOnSelectedDate = selectedDate
        ? studentAttendances.some((att) => {
            const attDate = att.attendanceDate.toDate();
            const selDate = new Date(selectedDate + "T00:00:00Z");
            return (
              attDate.getUTCFullYear() === selDate.getUTCFullYear() &&
              attDate.getUTCMonth() === selDate.getUTCMonth() &&
              attDate.getUTCDate() === selDate.getUTCDate()
            );
          })
        : true; // If no date selected, include all students

      return {
        id: student.id,
        studentName: student.studentName,
        lastAttendance: lastAttendance
          ? formatDate(lastAttendance.attendanceDate)
          : "No attendance recorded",
        totalAttendances,
        attendedOnSelectedDate,
      };
    });

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

    return filteredData.sort((a, b) =>
      a.studentName.localeCompare(b.studentName),
    );
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
          {suggestions.length > 0 && (
            <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={SUGGESTION_CLASSES}
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
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
                <th className={TH_CLASSES}>Last Attendance</th>
                <th className={TH_CLASSES}>Total Attendances</th>
              </tr>
            </thead>
            <tbody>
              {attendanceData.map((record) => (
                <tr
                  key={record.id}
                  className="hover:bg-gray-50 transition duration-150"
                >
                  <td className={TD_CLASSES}>{record.studentName}</td>
                  <td className={TD_CLASSES}>{record.lastAttendance}</td>
                  <td className={TD_CLASSES}>{record.totalAttendances}</td>
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
