import { useState, useEffect } from "react";
import {
  createNewAttendance,
  getAllStudents,
  getAllParents,
  updateStudent,
} from "../utils/firebase";
import { Timestamp } from "firebase/firestore";

export default function AddAttendanceView() {
  const [formData, setFormData] = useState({
    studentId: "",
    studentName: "",
    className: "Traditional Art Class",
    attendance: "true",
    attendanceDate: new Date().toLocaleDateString("en-CA", {
      timeZone: "America/Los_Angeles",
    }),
    attendanceTime: "10:00",
  });
  const [students, setStudents] = useState([]);
  const [parents, setParents] = useState([]);
  const [parentName, setParentName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
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
      setFilteredStudents(students);
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

  const handleStudentSelect = (studentId) => {
    setFormData((prev) => ({ ...prev, studentId }));
    const studentName = students.find((s) => s.id === studentId)?.studentName;
    setSearchQuery(studentName);
    setFilteredStudents(students);
    setIsSearchFocused(false);
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

      const attendaceDateTime = new Date(
        `${formData.attendanceDate}T${formData.attendanceTime}`,
      );
      const attendanceData = await createNewAttendance(
        formData.studentId,
        selectedStudent.parentId || "",
        formData.className,
        formData.attendance === "true",
        Timestamp.fromDate(attendaceDateTime),
      );

      // Update remainingClasses if attendance is "Present"
      if (formData.attendance === "true") {
        const currentRemainingClasses = selectedStudent.remainingClasses || 0;
        const newRemainingClasses = currentRemainingClasses - 1;
        await updateStudent(formData.studentId, {
          remainingClasses: newRemainingClasses,
        });

        // Update local students state
        setStudents((prevStudents) =>
          prevStudents.map((student) =>
            student.id === formData.studentId
              ? { ...student, remainingClasses: newRemainingClasses }
              : student,
          ),
        );
      }

      setSuccess(
        `Attendance recorded for "${selectedStudent.studentName}" in "${formData.className}"`,
      );
    } catch (err) {
      setError(err.message);
      setFormDisabled(false);
    } finally {
      setLoading(false);
      setTimeout(() => setFormDisabled(false), 300);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Add Attendance</h2>

      {studentsLoading ? (
        <p className="text-gray-500 text-center">Loading students...</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Student Search Bar */}
          <div className="relative">
            <label
              htmlFor="studentSearch"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Search Student
            </label>
            <input
              type="text"
              id="studentSearch"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => {
                setTimeout(() => setIsSearchFocused(false), 200);
              }}
              className={`w-full p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formDisabled ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
              disabled={formDisabled}
              placeholder="Type to search students..."
              spellCheck="false"
            />
            {isSearchFocused && (
              <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-sm max-h-64 overflow-y-auto p-2">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <div
                      key={student.id}
                      onMouseDown={() => handleStudentSelect(student.id)}
                      className="px-2 py-1 text-sm text-gray-700 hover:bg-gray-50 rounded cursor-pointer"
                    >
                      {student.studentName}
                    </div>
                  ))
                ) : (
                  <div className="px-2 py-1 text-sm text-gray-500">
                    No students found
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Parent Name (Read-Only) */}
          <div>
            <label
              htmlFor="parentName"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Parent Name
            </label>
            <input
              type="text"
              id="parentName"
              value={parentName}
              className="w-full p-2 border rounded-md text-sm bg-gray-100 cursor-not-allowed"
              disabled
              placeholder="Select a student to see parent"
            />
          </div>

          {/* Class Name Dropdown */}
          <div>
            <label
              htmlFor="className"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Class Name
            </label>
            <select
              id="className"
              name="className"
              value={formData.className}
              onChange={handleChange}
              className={`w-full p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formDisabled ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
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
            <label
              htmlFor="attendance"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Attendance
            </label>
            <select
              id="attendance"
              name="attendance"
              value={formData.attendance}
              onChange={handleChange}
              className={`w-full p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formDisabled ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
              disabled={formDisabled}
            >
              <option value="true">Present</option>
              <option value="false">Absent</option>
            </select>
          </div>

          {/* Attendance Date */}
          <div>
            <label
              htmlFor="attendanceDate"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Attendance Date
            </label>
            <input
              id="attendanceDate"
              name="attendanceDate"
              type="date"
              value={formData.attendanceDate}
              onChange={handleChange}
              className={`w-full p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formDisabled ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
              disabled={formDisabled}
            />
          </div>

          {/* Attendance Time */}
          <div>
            <label
              htmlFor="attendanceTime"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Attendance Time
            </label>
            <select
              id="attendanceTime"
              name="attendanceTime"
              value={formData.attendanceTime}
              onChange={handleChange}
              className={`w-full p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formDisabled ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
              disabled={formDisabled}
            >
              <option value="10:00">10:00 AM</option>
              <option value="11:30">11:30 AM</option>
              <option value="14:00">02:00 PM</option>
              <option value="15:30">03:30 PM</option>
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={`w-full py-2 px-4 rounded-md text-white font-medium ${
              loading || formDisabled
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            }`}
            disabled={loading || formDisabled}
          >
            {loading ? "Recording..." : "Record Attendance"}
          </button>

          {/* Error Message */}
          {error && (
            <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {error}
            </p>
          )}

          {/* Success Message */}
          {success && (
            <p className="text-sm text-green-600 bg-green-50 p-2 rounded">
              {success}
            </p>
          )}
        </form>
      )}
    </div>
  );
}
