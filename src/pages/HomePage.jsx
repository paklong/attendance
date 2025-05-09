import { useContext, useEffect, useState } from "react";
import CurrentUserContext from "../context/CurrentUserContext";
import { auth, getStudentProfile } from "../utils/firebase";
import StudentProfilesCard from "../components/StudentProfilesCard";
import { Link, Outlet } from "react-router-dom";
import {
  titleStyles,
  noArtworksTextStyles as noProfilesTextStyles,
  signOutButtonStyles,
} from "../utils/styles";

export default function HomePage() {
  const { currentUser, userProfile } = useContext(CurrentUserContext);
  const [studentProfiles, setStudentProfiles] = useState(null);
  const [openDrawerId, setOpenDrawerId] = useState(null);
  const studentIds = userProfile?.studentIDs;
  const handleToggleDrawer = (student) => {
    setOpenDrawerId((prev) => (student === prev ? null : student));
  };
  const handleHomeLinkClick = () => {
    setOpenDrawerId(null);
  };

  useEffect(() => {
    if (!studentIds || studentIds.length === 0) {
      setStudentProfiles([]);
      return;
    }
    const fetchStudentProfiles = async () => {
      try {
        const promise = studentIds.map((studentId) => {
          return getStudentProfile(studentId);
        });
        const result = await Promise.all(promise);
        setStudentProfiles(result);
      } catch (error) {
        console.log("Error fetching student profiles:", error);
        setStudentProfiles([]);
      }
    };
    fetchStudentProfiles();
    return () => {};
  }, [studentIds]);

  return (
    <div className="min-h-screen flex flex-col items-center py-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">
        <Link
          to="/home"
          onClick={handleHomeLinkClick}
          className="hover:text-blue-500"
        >
          Hi, {userProfile?.parentName?.split(" ")[0] || "Parent"}
        </Link>
      </h1>
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-6">
        {studentProfiles === null ? (
          <p className="text-gray-500 text-center">Loading profiles...</p>
        ) : studentProfiles.length > 0 ? (
          studentProfiles.map((student) => {
            return (
              <StudentProfilesCard
                key={student.studentId}
                student={student}
                isDrawerOpen={openDrawerId === student.studentId}
                onToggleDrawer={() => {
                  handleToggleDrawer(student.studentId);
                }}
              />
            );
          })
        ) : (
          <p className={`${noProfilesTextStyles} text-center`}>
            No student profiles available.
          </p>
        )}
      </div>
      <Outlet />
      <button
        onClick={() => {
          auth.signOut();
        }}
        className={`${signOutButtonStyles} mt-3`}
      >
        Sign Out
      </button>
    </div>
  );
}
