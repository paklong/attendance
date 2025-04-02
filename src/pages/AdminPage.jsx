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

  return (
    <div className="container mx-auto p-6">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <Link to="/admin">
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        </Link>
        <button
          onClick={() => auth.signOut()}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-150 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          Sign Out
        </button>
      </div>

      {/* Navigation */}
      <nav className="mb-6 space-x-4">
        <Link
          to="students"
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Student View
        </Link>
        <Link
          to="attendances"
          className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-150 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          Attendance View
        </Link>
      </nav>

      {/* Loading/Error States */}
      {isLoading ? (
        <div className="text-center py-4">
          <p className="text-gray-600">Loading data...</p>
          <div className="inline-block w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : hasErrors ? (
        <div className="text-center py-4">
          <p className="text-red-600 font-semibold">Error loading data:</p>
          <ul className="text-red-600">
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
