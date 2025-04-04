import { useState, useEffect } from "react";
import {
  createNewAttendance,
  getAllStudents,
  getAllParents,
} from "../utils/firebase";
import {
  containerStyles,
  h2Styles,
  formStyles,
  labelStyles,
  inputStyles,
  selectStyles,
  submitButtonStyles,
  disabledButtonStyles,
  errorStyles,
  successStyles,
  loadingTextStyles,
} from "../utils/styles";

export default function AddAttendanceView() {
  const [formData, setFormData] = useState({
    studentId: "",
    className: "Traditional Art Class",
    attendance: "true",
  });
  const [students, setStudents] = useState([]);
  const [parents, setParents] = useState([]);
  const [parentName, setParentName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false); // Track focus
  const [loading, setLoading] = useState(false);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formDisabled, setFormDisabled] = useState(false);

  // Fetch students and parents on mount
  useEffect(() => {
    const fetchData = async () => {
      setStudentsLoading(true);
      try {
        const studentList = await getAllStudents();
        const sortedStudents = studentList.sort((a, b) =>
          a.studentName.localeCompare(b.studentName),
        );
        setStudents(sortedStudents);
        setFilteredStudents(sortedStudents);

        const parentList = await getAllParents();
        setParents(parentList);
      } catch (err) {
        setError("Failed to load data: " + err.message);
      } finally {
        setStudentsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Update parentName when studentId changes
  useEffect(() => {
    if (formData.studentId) {
      const selectedStudent = students.find((s) => s.id === formData.studentId);
      if (selectedStudent && selectedStudent.parentId) {
        const parent = parents.find((p) => p.id === selectedStudent.parentId);
        setParentName(parent ? parent.parentName : "No parent assigned");
      } else {
        setParentName("No parent assigned");
      }
    } else {
      setParentName("");
    }
  }, [formData.studentId, students, parents]);

  // Filter students based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredStudents(students); // Full list when empty
    } else {
      const filtered = students.filter((student) =>
        student.studentName.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      setFilteredStudents(filtered);
    }
  }, [searchQuery, students]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleStudentSelect = (studentId) => {
    setFormData((prev) => ({ ...prev, studentId }));
    setSearchQuery("");
    setFilteredStudents(students);
    setIsSearchFocused(false); // Hide suggestions after selection
  };

  const handleFocus = () => {
    setIsSearchFocused(true);
  };

  const handleBlur = () => {
    // Delay blur to allow click on suggestion
    setTimeout(() => setIsSearchFocused(false), 200);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    setFormDisabled(true);

    try {
      const selectedStudent = students.find((s) => s.id === formData.studentId);
      if (!selectedStudent) throw new Error("Please select a student");

      const attendanceData = await createNewAttendance(
        formData.studentId,
        selectedStudent.parentId || "",
        formData.className,
        formData.attendance === "true",
      );
      setSuccess(
        `Attendance recorded for "${selectedStudent.studentName}" in "${formData.className}"`,
      );
    } catch (err) {
      setError(err.message);
      setFormDisabled(false);
    } finally {
      setLoading(false);
      setTimeout(() => setFormDisabled(false), 3000);
    }
  };

  return (
    <div className={containerStyles}>
      <h2 className={h2Styles}>Add Attendance</h2>

      {studentsLoading ? (
        <p className={loadingTextStyles}>Loading students...</p>
      ) : (
        <form onSubmit={handleSubmit} className={formStyles}>
          {/* Student Search Bar */}
          <div className="relative">
            <label htmlFor="studentSearch" className={labelStyles}>
              Search Student
            </label>
            <input
              type="text"
              id="studentSearch"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              className={inputStyles(formDisabled)}
              disabled={formDisabled}
              placeholder="Type to search students..."
            />
            {isSearchFocused && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <div
                      key={student.id}
                      onMouseDown={() => handleStudentSelect(student.id)}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                    >
                      {student.studentName}
                    </div>
                  ))
                ) : (
                  <div className="px-3 py-2 text-gray-500">
                    No students found
                  </div>
                )}
              </div>
            )}
            {formData.studentId && (
              <p className="text-sm text-gray-600 mt-1">
                Selected:{" "}
                {students.find((s) => s.id === formData.studentId)?.studentName}
              </p>
            )}
          </div>

          {/* Parent Name (Read-Only) */}
          <div>
            <label htmlFor="parentName" className={labelStyles}>
              Parent Name
            </label>
            <input
              type="text"
              id="parentName"
              value={parentName}
              className={inputStyles(true)}
              disabled
              placeholder="Select a student to see parent"
            />
          </div>

          {/* Class Name Dropdown */}
          <div>
            <label htmlFor="className" className={labelStyles}>
              Class Name
            </label>
            <select
              id="className"
              name="className"
              value={formData.className}
              onChange={handleChange}
              className={selectStyles}
              disabled={formDisabled}
            >
              <option value="Traditional Art Class">
                Traditional Art Class
              </option>
              <option value="Digital Art Class">Digital Art Class</option>
            </select>
          </div>

          {/* Attendance Dropdown */}
          <div>
            <label htmlFor="attendance" className={labelStyles}>
              Attendance
            </label>
            <select
              id="attendance"
              name="attendance"
              value={formData.attendance}
              onChange={handleChange}
              className={selectStyles}
              disabled={formDisabled}
            >
              <option value="true">Present</option>
              <option value="false">Absent</option>
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={
              loading || formDisabled
                ? disabledButtonStyles
                : submitButtonStyles
            }
            disabled={loading || formDisabled}
          >
            {loading ? "Recording..." : "Record Attendance"}
          </button>

          {error && <p className={errorStyles}>{error}</p>}
        </form>
      )}

      {success && <p className={successStyles}>{success}</p>}
    </div>
  );
}
