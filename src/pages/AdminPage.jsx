import { useEffect, useState } from "react";
import {
  auth,
  getAllStudents,
  getAllParents,
  getAllAttendances,
} from "../utils/firebase";
import { Link, Outlet } from "react-router-dom";

export default function AdminPage() {
  const [data, setData] = useState({
    students: [],
    parents: [],
    attendances: [],
  });
  const [loading, setLoading] = useState({
    students: true,
    parents: true,
    attendances: true,
  });
  const [errors, setErrors] = useState({
    students: null,
    parents: null,
    attendances: null,
  });

  const fetchData = async (key, fetchFn) => {
    setLoading((prev) => ({ ...prev, [key]: true }));
    setErrors((prev) => ({ ...prev, [key]: null }));
    try {
      const result = await fetchFn();
      setData((prev) => ({
        ...prev,
        [key]: result.length > 0 ? result : [],
      }));
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        [key]: error.message || `Failed to fetch ${key}`,
      }));
    } finally {
      setLoading((prev) => ({ ...prev, [key]: false }));
    }
  };

  useEffect(() => {
    fetchData("students", getAllStudents);
    fetchData("parents", getAllParents);
    fetchData("attendances", getAllAttendances);
  }, []);

  const isLoading = Object.values(loading).some((status) => status);
  const hasErrors = Object.values(errors).some((error) => error !== null);

  // Reusable Tailwind className constants
  const containerStyles = "container mx-auto p-4";
  const headerStyles = "flex items-center justify-between mb-4";
  const titleStyles = "text-xl font-bold text-gray-800";
  const buttonBaseStyles =
    "px-3 py-1 text-xs text-white rounded-md transition duration-150 focus:outline-none focus:ring-2 flex justify-center items-center";
  const signOutButtonStyles = `${buttonBaseStyles} bg-red-600 hover:bg-red-700 focus:ring-red-500`;
  const navButtonStyles = `${buttonBaseStyles} bg-gray-600 hover:bg-gray-700 focus:ring-gray-500`;
  const navButtonStylesEdit = `${buttonBaseStyles} bg-blue-600 hover:bg-blue-700 focus:ring-blue-500`;
  const navStyles = "mb-4 flex space-x-2";
  const loadingContainerStyles = "text-center py-4";
  const loadingTextStyles = "text-gray-600 text-sm";
  const spinnerStyles =
    "inline-block w-5 h-5 border-4 border-blue-500 border-t-transparent rounded-full animate-spin";
  const errorTextStyles = "text-red-600 text-sm";
  const errorHeaderStyles = "text-red-600 font-semibold text-sm";

  return (
    <div className={containerStyles}>
      {/* Header Section */}
      <div className={headerStyles}>
        <Link to="/admin">
          <h1 className={titleStyles}>Admin Dashboard</h1>
        </Link>
        <button onClick={() => auth.signOut()} className={signOutButtonStyles}>
          Sign Out
        </button>
      </div>

      {/* Navigation */}
      <nav className={navStyles}>
        <Link to="students" className={navButtonStyles}>
          Students
        </Link>
        <Link to="attendances" className={navButtonStyles}>
          Attendance
        </Link>
      </nav>
      <nav className={navStyles}>
        <Link to="new-parent" className={navButtonStylesEdit}>
          New Parent
        </Link>
        <Link to="new-student" className={navButtonStylesEdit}>
          New Student
        </Link>
        <Link to="add-attendance" className={navButtonStylesEdit}>
          Add Attendance
        </Link>
      </nav>

      {/* Loading/Error States */}
      {isLoading ? (
        <div className={loadingContainerStyles}>
          <p className={loadingTextStyles}>Loading data...</p>
          <div className={spinnerStyles}></div>
        </div>
      ) : hasErrors ? (
        <div className={loadingContainerStyles}>
          <p className={errorHeaderStyles}>Error loading data:</p>
          <ul className={errorTextStyles}>
            {Object.entries(errors)
              .filter(([, error]) => error)
              .map(([key, error]) => (
                <li key={key}>{error}</li>
              ))}
          </ul>
        </div>
      ) : (
        <Outlet context={data} />
      )}
    </div>
  );
}
