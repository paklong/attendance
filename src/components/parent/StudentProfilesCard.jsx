import { Link } from "react-router-dom";

const linkStyles = "cursor-pointer hover:text-blue-500 hover:underline";

export default function StudentProfilesCard({
  student,
  isDrawerOpen,
  onToggleDrawer,
}) {
  const { studentId, studentName, remainingClasses } = student;
  const studentPath = `student/${encodeURIComponent(studentName)}`;

  return (
    <div className="flex flex-col p-4 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors duration-150 cursor-pointer">
      <button
        type="button"
        className="flex justify-between items-center w-full text-left cursor-pointer"
        onClick={onToggleDrawer}
        aria-expanded={isDrawerOpen}
      >
        <span className="text-lg font-medium text-gray-700">
          {studentName || "Unknown"}
        </span>
        <span className="text-md text-gray-600">
          {remainingClasses ?? "N/A"}{" "}
          <span className="text-sm text-gray-400">classes left</span>
        </span>
      </button>
      {isDrawerOpen && (
        <div className="p-1 bg-gray-100 rounded-lg text-xs">
          <ul className="space-y-1">
            <li>
              <Link
                className={linkStyles}
                to={`${studentPath}/attendance`}
                state={{ studentId }}
              >
                View Attendance
              </Link>
            </li>
            <li>
              <Link
                className={linkStyles}
                to={`${studentPath}/portfolio`}
                state={{ studentId }}
              >
                View Portfolio
              </Link>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
