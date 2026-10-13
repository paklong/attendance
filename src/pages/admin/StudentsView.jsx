import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import EditStudent from "../../components/admin/EditStudent";
import Alert from "../../components/ui/Alert";
import { rebuildAttendanceStats } from "../../services/attendanceService";
import { formatDateTime } from "../../utils/formatDate";
import { matchesSearch } from "../../utils/search";
import { sortByStudentName } from "../../utils/sort";
import {
  searchInputStyles,
  TABLE_CLASSES,
  TD_CLASSES,
  TH_CLASSES,
} from "../../utils/styles";

const LOW_CLASSES_THRESHOLD = 2;
const STATS_PENDING = "—";

const lastAttendanceLabel = (student) => {
  if (student.totalAttendances === undefined) return STATS_PENDING;
  return student.lastAttendanceDate
    ? formatDateTime(student.lastAttendanceDate)
    : "No attendance recorded";
};

export default function StudentsView() {
  const { data, refresh } = useOutletContext();
  const { students, parents } = data;
  const [searchTerm, setSearchTerm] = useState("");
  const [filterIsActive, setFilterIsActive] = useState(true);
  const [rebuild, setRebuild] = useState({ running: false, error: null });

  const studentsMissingStats = students.filter(
    (student) => student.totalAttendances === undefined,
  ).length;

  const rows = useMemo(() => {
    const parentNames = new Map(parents.map((p) => [p.id, p.parentName]));
    return sortByStudentName(students).map((student) => ({
      id: student.id,
      studentName: student.studentName,
      parentName: parentNames.get(student.parentId) || "N/A",
      remainingClasses: student.remainingClasses,
      lastAttendance: lastAttendanceLabel(student),
      totalAttendances: student.totalAttendances ?? STATS_PENDING,
      isActive: student.isActive ?? true,
      lastModifiedTime: formatDateTime(student.lastModifiedTime),
    }));
  }, [students, parents]);

  const handleRebuildStats = async () => {
    if (
      !window.confirm(
        "Recalculate attendance stats for every student? This reads every attendance record once.",
      )
    ) {
      return;
    }
    setRebuild({ running: true, error: null });
    try {
      await rebuildAttendanceStats();
      await refresh("students");
      setRebuild({ running: false, error: null });
    } catch (error) {
      setRebuild({ running: false, error: error.message });
    }
  };

  const visibleRows = useMemo(
    () =>
      rows.filter(
        (row) =>
          matchesSearch(row.studentName, searchTerm) &&
          (!filterIsActive || row.isActive),
      ),
    [rows, searchTerm, filterIsActive],
  );

  return (
    <div className="container mx-auto p-1">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Students</h2>

      {studentsMissingStats > 0 && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800 flex flex-wrap items-center justify-between gap-2">
          <span>
            {studentsMissingStats} student
            {studentsMissingStats === 1 ? " is" : "s are"} missing attendance
            stats, so their Last/Total Attendance columns show{" "}
            {STATS_PENDING}. Run this once to fill them in.
          </span>
          <button
            type="button"
            onClick={handleRebuildStats}
            disabled={rebuild.running}
            className="px-3 py-1 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50"
          >
            {rebuild.running ? "Calculating..." : "Calculate attendance stats"}
          </button>
        </div>
      )}
      <Alert className="mb-4">{rebuild.error}</Alert>

      <div className="relative mb-3 w-full max-w-md">
        <input
          type="text"
          spellCheck="false"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search students by name..."
          className={searchInputStyles}
        />
      </div>

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

      {visibleRows.length > 0 ? (
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
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((student) => (
                <tr
                  key={student.id}
                  className="hover:bg-gray-50 transition duration-150"
                >
                  <td className={TD_CLASSES}>{student.studentName}</td>
                  <td className={TD_CLASSES}>{student.parentName}</td>
                  <td
                    className={`${TD_CLASSES} ${
                      student.remainingClasses <= LOW_CLASSES_THRESHOLD
                        ? "text-red-600"
                        : ""
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
                      onUpdate={() => refresh("students")}
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
