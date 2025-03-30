import { Link } from "react-router-dom";

export default function StudentProfilesCard({
  student,
  isDrawerOpen,
  onToggleDrawer,
}) {
  const { studentId, studentName, remainingClasses } = student;

  const handleClick = () => {
    console.log(`${studentName} is clicked`);
    onToggleDrawer();
  };

  return (
    <div className="flex flex-col p-4 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors duration-150 cursor-pointer">
      <div className="flex justify-between items-center" onClick={handleClick}>
        <p className="text-lg font-medium text-gray-700">
          {studentName || "Unknown"}
        </p>
        <p className="text-md text-gray-600">
          {remainingClasses ?? "N/A"}{" "}
          <span className="text-sm text-gray-400">classes left</span>
        </p>
      </div>
      {isDrawerOpen && (
        <div className="p-1 bg-gray-100 rounded-lg text-xs">
          <ul className="space-y-1">
            <li>
              <Link
                className="cursor-pointer hover:text-blue-500 hovers:underline"
                to={`student/${studentName}/attendance`}
                state={{ studentId }}
              >
                View Attendance
              </Link>
            </li>
            <li>
              <Link
                className="cursor-pointer hover:text-blue-500 hovers:underline"
                to={`student/${studentName}/portfolio`}
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
