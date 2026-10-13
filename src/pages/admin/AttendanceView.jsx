import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import RemoveAttendance from "../../components/admin/RemoveAttendance";
import useDebouncedValue from "../../hooks/useDebouncedValue";
import { formatDateTime } from "../../utils/formatDate";
import { matchesSearch } from "../../utils/search";
import {
  searchInputStyles,
  TABLE_CLASSES,
  TD_CLASSES,
  TH_CLASSES,
} from "../../utils/styles";

const SEARCH_DEBOUNCE_MS = 300;

const toDateKey = (date) => date.toISOString().split("T")[0];

export default function AttendanceView() {
  const { data } = useOutletContext();
  const { students, attendances } = data;
  const [searchInput, setSearchInput] = useState("");
  const searchTerm = useDebouncedValue(searchInput, SEARCH_DEBOUNCE_MS);
  const [selectedDate, setSelectedDate] = useState("");
  const [removedIds, setRemovedIds] = useState(() => new Set());

  const records = useMemo(() => {
    const studentNames = new Map(students.map((s) => [s.id, s.studentName]));
    return attendances
      .map((att) => {
        const date = att.attendanceDate.toDate();
        return {
          id: att.id,
          studentId: att.studentId,
          studentName: studentNames.get(att.studentId) ?? "",
          className: att.className,
          attendance: att.attendance,
          dateLabel: formatDateTime(att.attendanceDate),
          dateKey: toDateKey(date),
          time: date.getTime(),
        };
      })
      .sort(
        (a, b) => b.time - a.time || a.studentName.localeCompare(b.studentName),
      );
  }, [students, attendances]);

  const visibleRecords = useMemo(
    () =>
      records.filter(
        (record) =>
          !removedIds.has(record.id) &&
          matchesSearch(record.studentName, searchTerm) &&
          (!selectedDate || record.dateKey === selectedDate),
      ),
    [records, removedIds, searchTerm, selectedDate],
  );

  const handleAttendanceRemove = (attendanceId) => {
    setRemovedIds((prev) => new Set(prev).add(attendanceId));
  };

  const today = toDateKey(new Date());

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Student Attendance</h2>
      </div>

      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            spellCheck="false"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search students by name..."
            className={searchInputStyles}
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
          Total Attendances Displayed: {visibleRecords.length}
        </p>
      )}

      {visibleRecords.length > 0 ? (
        <div className="overflow-x-auto rounded-lg">
          <table className={TABLE_CLASSES}>
            <thead className="bg-gray-50">
              <tr>
                <th className={TH_CLASSES}>Student Name</th>
                <th className={TH_CLASSES}>Attendance</th>
                <th className={TH_CLASSES}>Class Name</th>
                <th className={TH_CLASSES}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleRecords.map((record) => (
                <tr
                  key={record.id}
                  className="hover:bg-gray-50 transition duration-150"
                >
                  <td className={TD_CLASSES}>{record.studentName}</td>
                  <td className={TD_CLASSES}>{record.dateLabel}</td>
                  <td className={TD_CLASSES}>{record.className}</td>
                  <td className={TD_CLASSES}>
                    <RemoveAttendance
                      attendanceId={record.id}
                      studentId={record.studentId}
                      attendance={record.attendance}
                      onRemove={handleAttendanceRemove}
                    />
                  </td>
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
