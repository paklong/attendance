import { useEffect, useState } from "react";
import {
  auth,
  getAllStudents,
  getAllParents,
  getAllAttendances,
} from "../utils/firebase";
import formatDate from "../utils/formatDate";
import AdminStudentView from "../components/AdminStudentsView";
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

  return (
    <div>
      <h1>Hi Admin</h1>
      <button onClick={() => auth.signOut()}>Sign out</button>
      <Link to="students" state={{ data }}>
        Student View
      </Link>
      <Outlet />
    </div>
  );
}
