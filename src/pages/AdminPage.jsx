import { useEffect, useState } from "react";
import {
  auth,
  getAllStudents,
  getAllParents,
  getAllAttendances,
} from "../utils/firebase";
import { Link, Outlet } from "react-router-dom";
import {
  adminContainerStyles,
  headerStyles,
  titleStyles,
  signOutButtonStyles,
  navStyles,
  navButtonStyles,
  navButtonStylesEdit,
  loadingContainerStyles,
  loadingTextStyles,
  spinnerStyles,
  errorHeaderStyles,
  errorTextStyles,
} from "../utils/styles";

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

  const fetchStudents = () => {
    fetchData("students", getAllStudents);
  };

  const fetchParents = () => {
    fetchData("parents", getAllParents);
  };
  const fetchAttendances = () => {
    fetchData("attendances", getAllAttendances);
  };

  useEffect(() => {
    fetchData("students", getAllStudents);
    fetchData("parents", getAllParents);
    fetchData("attendances", getAllAttendances);
  }, []);

  const isLoading = Object.values(loading).some((status) => status);
  const hasErrors = Object.values(errors).some((error) => error !== null);

  return (
    <div className={adminContainerStyles}>
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
        <Outlet
          context={{
            data,
            fetchStudents,
            fetchParents,
            fetchAttendances,
          }}
        />
      )}
    </div>
  );
}
