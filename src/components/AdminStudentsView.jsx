import { useState, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import formatDate from "../utils/formatDate";
import { TABLE_CLASSES, TH_CLASSES, TD_CLASSES } from "../utils/styles";
import EditStudent from "./EditStudent";

// Reusable style constants
const INPUT_CLASSES =
  "w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200";

export default function AdminStudentView() {
  const { data, fetchStudents } = useOutletContext(); // Assume context provides loading/error
  const { students = [], parents = [], attendances = [] } = data || {};
  const [searchTerm, setSearchTerm] = useState("");
  const [filterIsActive, setFilterIsActive] = useState(true);

  // Handle search input
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
  };

  const handleStudentUpdate = () => {
    fetchStudents();
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
        const totalAttendances = studentAttendances.length;
        return {
          id: student.id,
          studentName: student.studentName,
          parentName: parent?.parentName || "N/A",
          remainingClasses: student.remainingClasses,
          lastAttendance: lastAttendance
            ? formatDate(lastAttendance.attendanceDate)
            : "No attendance recorded",
          totalAttendances: totalAttendances,
          isActive: student.isActive ?? true, // Keep as boolean
          lastModifiedTime: formatDate(student.lastModifiedTime),
        };
      })
      .filter((student) =>
        student.studentName.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      .filter((student) => (filterIsActive ? student.isActive : true));
  }, [students, parents, attendances, searchTerm, filterIsActive]);

  return (
    <div className="container mx-auto p-1">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Students</h2>

      {/* Search Bar */}
      <div className="relative mb-3 w-full max-w-md">
        <input
          type="text"
          spellCheck="false"
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Search students by name..."
          className={INPUT_CLASSES}
        />
      </div>

      {/* IsActive Toggle */}
      <div className="text-xs py-1">
        <label>
          <input
            type="checkbox"
            onChange={() => setFilterIsActive((prev) => !prev)}
            checked={filterIsActive}
          />
          <span className="ml-1">Show Active Only</span>
        </label>
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
                <th className={TH_CLASSES}>Total Attendances</th>
                <th className={TH_CLASSES}>Active Status</th>
                <th className={TH_CLASSES}>Last Modified Time</th>
                <th className={TH_CLASSES}>Actions</th>
                {/* Added header for Edit */}
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
                  <td className={TD_CLASSES}>{student.totalAttendances}</td>
                  <td className={TD_CLASSES}>
                    {student.isActive ? "Yes" : "No"}
                  </td>
                  <td className={TD_CLASSES}>{student.lastModifiedTime}</td>
                  <td className={TD_CLASSES}>
                    <EditStudent
                      studentId={student.id}
                      studentName={student.studentName}
                      remainingClasses={student.remainingClasses}
                      isActive={student.isActive}
                      onUpdate={handleStudentUpdate}
                    />
                  </td>
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
