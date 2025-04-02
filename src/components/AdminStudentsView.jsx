import { useState, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import formatDate from "../utils/formatDate";

// Reusable style constants
const INPUT_CLASSES =
  "w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200";
const TABLE_CLASSES =
  "min-w-full bg-white border border-gray-200 rounded-lg shadow-sm";
const TH_CLASSES =
  "px-6 py-3 text-left text-xs font-semibold text-gray-700 border-b border-gray-400";
const TD_CLASSES = "px-6 py-4 text-xs text-gray-800 border-b border-gray-200";
const SUGGESTION_CLASSES =
  "px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer transition duration-150";

export default function AdminStudentView() {
  const data = useOutletContext();
  const { students = [], parents = [], attendances = [] } = data || {};
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);

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

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion);
    setSuggestions([]);
  };

  // Memoized student data computation
  const studentData = useMemo(() => {
    const sortedStudents = [...students].sort((a, b) =>
      a.studentName.localeCompare(b.studentName),
    );

    return sortedStudents
      .map((student) => {
        const parent = parents.find((p) => p.id === student.parentId);
        const studentAttendances = attendances
          .filter((att) => att.studentId === student.id)
          .sort(
            (a, b) => new Date(b.attendanceDate) - new Date(a.attendanceDate),
          );
        const lastAttendance = studentAttendances[0];

        return {
          id: student.id,
          studentName: student.studentName,
          parentName: parent?.parentName || "N/A",
          remainingClasses: student.remainingClasses,
          lastAttendance: lastAttendance
            ? formatDate(lastAttendance.attendanceDate)
            : "No attendance recorded",
        };
      })
      .filter((student) =>
        student.studentName.toLowerCase().includes(searchTerm.toLowerCase()),
      );
  }, [students, parents, attendances, searchTerm]);

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Students</h2>

      {/* Search Bar */}
      <div className="relative mb-6 w-full max-w-md">
        <input
          type="text"
          spellCheck="false"
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Search students by name..."
          className={INPUT_CLASSES}
        />
        {suggestions.length > 0 && (
          <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto text-xs">
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

      {/* Student Table or Empty State */}
      {studentData.length > 0 ? (
        <div className="overflow-x-auto rounded-lg">
          <table className={TABLE_CLASSES}>
            <thead className="bg-gray-50">
              <tr>
                <th className={TH_CLASSES}>Student Name</th>
                <th className={TH_CLASSES}>Parent Name</th>
                <th className={TH_CLASSES}>Remaining Classes</th>
                <th className={TH_CLASSES}>Last Attendance</th>
              </tr>
            </thead>
            <tbody>
              {studentData.map((student) => (
                <tr
                  key={student.id}
                  className="hover:bg-gray-50 transition duration-150"
                >
                  <td className={TD_CLASSES}>{student.studentName}</td>
                  <td className={TD_CLASSES}>{student.parentName}</td>
                  <td
                    className={`${TD_CLASSES} ${
                      student.remainingClasses <= 2 ? "text-red-600" : ""
                    }`}
                  >
                    {student.remainingClasses}
                  </td>
                  <td className={TD_CLASSES}>{student.lastAttendance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-600 text-center py-4">
          No students found matching the search criteria.
        </p>
      )}
    </div>
  );
}
