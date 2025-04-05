import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import formatDate from "../utils/formatDate";
import { TABLE_CLASSES, TH_CLASSES, TD_CLASSES } from "../utils/styles";

// Reusable style constants
const INPUT_CLASSES =
  "w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200";

const useDebouncer = (func, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
};

export default function AttendanceView() {
  const { data } = useOutletContext();
  const { students = [], attendances = [] } = data || {};
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [attendanceData, setAttendanceData] = useState([]);

  useEffect(() => {
    const studentsMap = Object.fromEntries(
      students.map((student) => [student.id, student.studentName]),
    );

    const _attendanceData = attendances.map((att) => {
      const attDate = att.attendanceDate.toDate();
      window.attDate = attDate.toISOString().split("T")[0];
      return {
        ...att,
        attendanceDateTimeFormatted: formatDate(att.attendanceDate),
        attendanceDateFormatted: attDate.toISOString().split("T")[0],
        attendanceDate: attDate,
        studentName: studentsMap[att.studentId],
      };
    });

    const _sortedAttendanceData = _attendanceData.sort((a, b) => {
      const aDate = a.attendanceDate;
      const bDate = b.attendanceDate;

      const dateCompare = bDate - aDate;
      if (dateCompare !== 0) {
        return dateCompare;
      }

      return a.studentName.localeCompare(b.studentName);
    });
    setAttendanceData(_sortedAttendanceData);
  }, [students, attendances]);

  const searchDebouncer = useDebouncer((value) => setSearchTerm(value), 300);
  // Handle search input
  const handleSearch = (e) => {
    const value = e.target.value;
    searchDebouncer(value);
  };

  let filteredData = attendanceData.map((att) => {
    const attendedOnSelectedDate = selectedDate
      ? att.attendanceDateFormatted === selectedDate
      : true; // If no date selected, include all attendances

    return {
      id: att.id,
      studentName: att.studentName,
      attendanceDateTime: att.attendanceDate,
      attendanceDate: att.attendanceDateTimeFormatted,
      attendedOnSelectedDate,
      className: att.className,
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

  // Set default date to today
  const today = new Date().toISOString().split("T")[0];

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
          Total Attendances Displayed: {filteredData.length}
        </p>
      )}
      {/* Attendance Table or Empty State */}
      {filteredData.length > 0 ? (
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
              {filteredData.map((record) => (
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
