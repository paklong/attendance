import { useCallback, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import AttendanceTable from "../../components/admin/AttendanceTable";
import LoadingState from "../../components/ui/LoadingState";
import Pagination from "../../components/ui/Pagination";
import useAsync from "../../hooks/useAsync";
import useAttendancePages from "../../hooks/useAttendancePages";
import useDebouncedValue from "../../hooks/useDebouncedValue";
import {
  ATTENDANCE_PAGE_SIZE,
  countAttendance,
  getAttendanceForStudents,
  MAX_STUDENTS_PER_SEARCH,
} from "../../services/attendanceService";
import { dayRangeFromKey, toLocalDateKey } from "../../utils/dateRange";
import { matchesSearch } from "../../utils/search";
import { errorTextStyles, searchInputStyles } from "../../utils/styles";

const SEARCH_DEBOUNCE_MS = 300;

const toMillis = (record) => record.attendanceDate?.toMillis() ?? 0;

const byDateThenName = (studentNames) => (a, b) =>
  toMillis(b) - toMillis(a) ||
  (studentNames.get(a.studentId) ?? "").localeCompare(
    studentNames.get(b.studentId) ?? "",
  );

function Results({ records, loading, error, emptyMessage, ...tableProps }) {
  if (loading) return <LoadingState message="Loading attendance..." />;
  if (error) {
    return (
      <p className={`${errorTextStyles} text-center py-4`}>
        Failed to load attendance records.
      </p>
    );
  }
  if (records.length === 0) {
    return <p className="text-gray-600 text-center py-4">{emptyMessage}</p>;
  }
  return <AttendanceTable records={records} {...tableProps} />;
}

function TotalCount({ count }) {
  return (
    <p className="text-gray-600 mt-1 mb-2">Total Attendances Found: {count}</p>
  );
}

// Unfiltered or date-filtered: paged straight from Firestore.
function PagedAttendance({ selectedDate, removedIds, studentNames, ...rest }) {
  const dateRange = useMemo(
    () => (selectedDate ? dayRangeFromKey(selectedDate) : null),
    [selectedDate],
  );
  const pages = useAttendancePages(dateRange);
  const loadCount = useCallback(
    () => (dateRange ? countAttendance(dateRange) : Promise.resolve(null)),
    [dateRange],
  );
  const { data: total } = useAsync(loadCount);

  const records = useMemo(
    () =>
      pages.records
        .filter((record) => !removedIds.has(record.id))
        .sort(byDateThenName(studentNames)),
    [pages.records, removedIds, studentNames],
  );

  return (
    <>
      {total != null && <TotalCount count={total} />}
      <Results
        records={records}
        loading={pages.loading}
        error={pages.error}
        studentNames={studentNames}
        {...rest}
      />
      <Pagination
        pageIndex={pages.pageIndex}
        hasPrev={pages.hasPrev}
        hasNext={pages.hasNext}
        onPrev={pages.goPrev}
        onNext={pages.goNext}
        disabled={pages.loading}
      />
    </>
  );
}

// Name search: every record for the matching students, paged in memory.
function SearchAttendance({
  studentIds,
  selectedDate,
  removedIds,
  studentNames,
  ...rest
}) {
  const load = useCallback(
    () => getAttendanceForStudents(studentIds),
    [studentIds],
  );
  const { data, loading, error } = useAsync(load);
  const [page, setPage] = useState({ date: selectedDate, index: 0 });
  const pageIndex = page.date === selectedDate ? page.index : 0;

  const records = useMemo(
    () =>
      (data ?? [])
        .filter(
          (record) =>
            !removedIds.has(record.id) &&
            (!selectedDate ||
              toLocalDateKey(record.attendanceDate.toDate()) === selectedDate),
        )
        .sort(byDateThenName(studentNames)),
    [data, removedIds, selectedDate, studentNames],
  );

  const pageCount = Math.ceil(records.length / ATTENDANCE_PAGE_SIZE);
  const safeIndex = Math.min(pageIndex, Math.max(0, pageCount - 1));
  const goTo = (index) => setPage({ date: selectedDate, index });

  return (
    <>
      {!loading && !error && <TotalCount count={records.length} />}
      <Results
        records={records.slice(
          safeIndex * ATTENDANCE_PAGE_SIZE,
          (safeIndex + 1) * ATTENDANCE_PAGE_SIZE,
        )}
        loading={loading}
        error={error}
        studentNames={studentNames}
        {...rest}
      />
      <Pagination
        pageIndex={safeIndex}
        hasPrev={safeIndex > 0}
        hasNext={safeIndex < pageCount - 1}
        onPrev={() => goTo(safeIndex - 1)}
        onNext={() => goTo(safeIndex + 1)}
      />
    </>
  );
}

export default function AttendanceView() {
  const { data } = useOutletContext();
  const [searchInput, setSearchInput] = useState("");
  const searchTerm = useDebouncedValue(searchInput, SEARCH_DEBOUNCE_MS).trim();
  const [selectedDate, setSelectedDate] = useState("");
  const [removedIds, setRemovedIds] = useState(() => new Set());

  const studentNames = useMemo(
    () => new Map(data.students.map((s) => [s.id, s.studentName])),
    [data.students],
  );
  const matchedStudentIds = useMemo(
    () =>
      searchTerm
        ? data.students
            .filter((s) => matchesSearch(s.studentName, searchTerm))
            .map((s) => s.id)
        : [],
    [data.students, searchTerm],
  );

  const handleAttendanceRemove = useCallback((attendanceId) => {
    setRemovedIds((prev) => new Set(prev).add(attendanceId));
  }, []);

  const emptyMessage = selectedDate
    ? `No students attended on ${selectedDate}.`
    : searchTerm
      ? `No attendance records found for "${searchTerm}".`
      : "No attendance records found.";

  const sharedProps = {
    selectedDate,
    removedIds,
    studentNames,
    emptyMessage,
    onRemove: handleAttendanceRemove,
  };

  const renderResults = () => {
    if (!searchTerm) {
      return <PagedAttendance key={selectedDate} {...sharedProps} />;
    }
    if (matchedStudentIds.length === 0) {
      return (
        <p className="text-gray-600 text-center py-4">
          No students match &quot;{searchTerm}&quot;.
        </p>
      );
    }
    if (matchedStudentIds.length > MAX_STUDENTS_PER_SEARCH) {
      return (
        <p className="text-gray-600 text-center py-4">
          {matchedStudentIds.length} students match &quot;{searchTerm}&quot;.
          Keep typing to narrow it down to {MAX_STUDENTS_PER_SEARCH} or fewer.
        </p>
      );
    }
    return (
      <SearchAttendance
        key={matchedStudentIds.join(",")}
        studentIds={matchedStudentIds}
        {...sharedProps}
      />
    );
  };

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
            max={toLocalDateKey(new Date())}
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

      {renderResults()}
    </div>
  );
}
