import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import Alert from "../../components/ui/Alert";
import FormCard from "../../components/ui/FormCard";
import FormField from "../../components/ui/FormField";
import SubmitButton from "../../components/ui/SubmitButton";
import useFormSubmission from "../../hooks/useFormSubmission";
import { recordAttendance } from "../../services/attendanceService";
import { matchesSearch } from "../../utils/search";
import { sortByStudentName } from "../../utils/sort";
import { fieldStyles } from "../../utils/styles";

const CLASS_OPTIONS = ["Traditional Art Class", "Digital Art Class"];
const TIME_OPTIONS = [
  { value: "10:00", label: "10:00 AM" },
  { value: "11:30", label: "11:30 AM" },
  { value: "14:00", label: "02:00 PM" },
  { value: "15:30", label: "03:30 PM" },
];
const STUDIO_TIME_ZONE = "America/Los_Angeles";

const todayInStudioTimeZone = () =>
  new Date().toLocaleDateString("en-CA", { timeZone: STUDIO_TIME_ZONE });

export default function AddAttendanceView() {
  const { data } = useOutletContext();
  const [formData, setFormData] = useState(() => ({
    studentId: "",
    className: CLASS_OPTIONS[0],
    attendance: "true",
    attendanceDate: todayInStudioTimeZone(),
    attendanceTime: TIME_OPTIONS[0].value,
  }));
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const { loading, error, success, disabled, submit } = useFormSubmission({
    cooldownMs: 300,
  });

  const students = useMemo(
    () => sortByStudentName(data.students),
    [data.students],
  );
  const parentNames = useMemo(
    () => new Map(data.parents.map((p) => [p.id, p.parentName])),
    [data.parents],
  );

  const selectedStudent = students.find((s) => s.id === formData.studentId);
  const parentName = !formData.studentId
    ? ""
    : (parentNames.get(selectedStudent?.parentId) ?? "No parent assigned");

  // Once a student is picked the search box shows their name; reopening the
  // dropdown should list everyone again rather than just that one match.
  const showAllStudents =
    !searchQuery.trim() || searchQuery === selectedStudent?.studentName;
  const filteredStudents = useMemo(
    () =>
      showAllStudents
        ? students
        : students.filter((s) => matchesSearch(s.studentName, searchQuery)),
    [students, searchQuery, showAllStudents],
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStudentSelect = (student) => {
    setFormData((prev) => ({ ...prev, studentId: student.id }));
    setSearchQuery(student.studentName);
    setIsSearchFocused(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submit(async () => {
      if (!selectedStudent) throw new Error("Please select a student");
      await recordAttendance({
        studentId: selectedStudent.id,
        parentId: selectedStudent.parentId || "",
        className: formData.className,
        attendance: formData.attendance === "true",
        attendanceDate: new Date(
          `${formData.attendanceDate}T${formData.attendanceTime}`,
        ),
      });
      return `Attendance recorded for "${selectedStudent.studentName}" in "${formData.className}"`;
    });
  };

  return (
    <FormCard title="Add Attendance">
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormField
          label="Search Student"
          htmlFor="studentSearch"
          className="relative"
        >
          <input
            type="text"
            id="studentSearch"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
            className={fieldStyles(disabled)}
            disabled={disabled}
            placeholder="Type to search students..."
            spellCheck="false"
            autoComplete="off"
          />
          {isSearchFocused && (
            <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-sm max-h-64 overflow-y-auto p-2">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <div
                    key={student.id}
                    onMouseDown={() => handleStudentSelect(student)}
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
        </FormField>

        <FormField label="Parent Name" htmlFor="parentName">
          <input
            type="text"
            id="parentName"
            value={parentName}
            className="w-full p-2 border rounded-md text-sm bg-gray-100 cursor-not-allowed"
            disabled
            placeholder="Select a student to see parent"
          />
        </FormField>

        <FormField label="Class Name" htmlFor="className">
          <select
            id="className"
            name="className"
            value={formData.className}
            onChange={handleChange}
            className={fieldStyles(disabled)}
            disabled={disabled}
          >
            {CLASS_OPTIONS.map((className) => (
              <option key={className} value={className}>
                {className}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Attendance" htmlFor="attendance">
          <select
            id="attendance"
            name="attendance"
            value={formData.attendance}
            onChange={handleChange}
            className={fieldStyles(disabled)}
            disabled={disabled}
          >
            <option value="true">Present</option>
            <option value="false">Absent</option>
          </select>
        </FormField>

        <FormField label="Attendance Date" htmlFor="attendanceDate">
          <input
            id="attendanceDate"
            name="attendanceDate"
            type="date"
            value={formData.attendanceDate}
            onChange={handleChange}
            className={fieldStyles(disabled)}
            disabled={disabled}
          />
        </FormField>

        <FormField label="Attendance Time" htmlFor="attendanceTime">
          <select
            id="attendanceTime"
            name="attendanceTime"
            value={formData.attendanceTime}
            onChange={handleChange}
            className={fieldStyles(disabled)}
            disabled={disabled}
          >
            {TIME_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </FormField>

        <SubmitButton disabled={disabled}>
          {loading ? "Recording..." : "Record Attendance"}
        </SubmitButton>

        <Alert variant="error">{error}</Alert>
        <Alert variant="success">{success}</Alert>
      </form>
    </FormCard>
  );
}
