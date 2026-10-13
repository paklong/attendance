import { Suspense, useCallback, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import StudentProfilesCard from "../../components/parent/StudentProfilesCard";
import { useAuth } from "../../context/AuthContext";
import useAsync from "../../hooks/useAsync";
import { signOut } from "../../services/authService";
import { getStudentProfile } from "../../services/studentService";
import { emptyTextStyles, signOutButtonStyles } from "../../utils/styles";

export default function HomePage() {
  const { userProfile } = useAuth();
  const [openDrawerId, setOpenDrawerId] = useState(null);
  const studentIds = userProfile?.studentIDs;

  const loadProfiles = useCallback(
    () =>
      studentIds?.length
        ? Promise.all(studentIds.map(getStudentProfile))
        : Promise.resolve([]),
    [studentIds],
  );
  const { data, loading, error } = useAsync(loadProfiles);
  const studentProfiles = error ? [] : (data ?? []).filter(Boolean);

  const handleToggleDrawer = (studentId) => {
    setOpenDrawerId((prev) => (prev === studentId ? null : studentId));
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">
        <Link
          to="/home"
          onClick={() => setOpenDrawerId(null)}
          className="hover:text-blue-500"
        >
          Hi, {userProfile?.parentName?.split(" ")[0] || "Parent"}
        </Link>
      </h1>
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-6">
        {loading ? (
          <p className="text-gray-500 text-center">Loading profiles...</p>
        ) : studentProfiles.length > 0 ? (
          studentProfiles.map((student) => (
            <StudentProfilesCard
              key={student.studentId}
              student={student}
              isDrawerOpen={openDrawerId === student.studentId}
              onToggleDrawer={() => handleToggleDrawer(student.studentId)}
            />
          ))
        ) : (
          <p className={emptyTextStyles}>No student profiles available.</p>
        )}
      </div>
      <Suspense
        fallback={<p className="text-gray-500 text-center mt-4">Loading...</p>}
      >
        <Outlet />
      </Suspense>
      <button onClick={signOut} className={`${signOutButtonStyles} mt-3`}>
        Sign Out
      </button>
    </div>
  );
}
