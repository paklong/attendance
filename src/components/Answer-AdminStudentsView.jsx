import { useState } from "react";
import formatDate from "../utils/formatDate";

export default function AdminStudentView({ data }) {
  const { students, parents, attendances } = data;
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
        .slice(0, 5); // Limit to 5 suggestions
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

  // Prepare student data with related information
  const getStudentData = () => {
    // Sort students by name
    const sortedStudents = [...students].sort((a, b) =>
      a.studentName.localeCompare(b.studentName),
    );

    return sortedStudents
      .map((student) => {
        // Find parent
        const parent = parents.find((p) => p.id === student.parentId);

        // Find last attendance
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
  };

  const studentData = getStudentData();

  return (
    <div className="admin-student-view m-5">
      <h2>Students</h2>

      {/* Search Bar */}
      <div className="search-container  relative mb-5">
        <input
          className="border-2 border-gray-300 p-1 rounded-lg w-1/2"
          type="text"
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Search students by name..."
        />
        {suggestions.length > 0 && (
          <ul
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              background: "white",
              border: "1px solid #ccc",
              listStyle: "none",
              padding: 0,
              margin: 0,
              width: "300px",
            }}
          >
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                style={{
                  padding: "8px",
                  cursor: "pointer",
                  ":hover": { backgroundColor: "#f0f0f0" },
                }}
              >
                {suggestion}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Student Table */}
      {studentData.length > 0 ? (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                Student Name
              </th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                Parent Name
              </th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                Remaining Classes
              </th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                Last Attendance
              </th>
            </tr>
          </thead>
          <tbody>
            {studentData.map((student) => (
              <tr key={student.id}>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  {student.studentName}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  {student.parentName}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  {student.remainingClasses}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  {student.lastAttendance}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No students found matching the search criteria.</p>
      )}
    </div>
  );
}
