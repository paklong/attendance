import { createContext, useContext, useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Link,
  Outlet,
  useParams,
  useLocation,
} from "react-router-dom";
import "./App.css";
import {
  getUserProfile,
  auth,
  firebaseSignIn,
  getStudentProfile,
  getAttendance,
} from "./firebase.js";

const CurrentUserContext = createContext();

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setCurrentUser(user);
        const profile = await getUserProfile(user.uid);
        setUserProfile(profile);
      } else {
        setCurrentUser("");
        setUserProfile(null);
      }
    });
    return () => unsubscribe();
  }, []);

  if (currentUser === null) {
    return <div>Loading...</div>;
  }

  return (
    <CurrentUserContext.Provider
      value={{ currentUser, setCurrentUser, userProfile }}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route
            path="/login"
            element={
              currentUser === "" ? <LoginPage /> : <Navigate to="/home" />
            }
          />
          <Route
            path="/home"
            element={
              currentUser !== "" ? <HomePage /> : <Navigate to="/login" />
            }
          >
            <Route
              path="student/:studentName/attendance"
              element={<AttendancePage />}
            />
            <Route
              path="student/:studentName/portfolio"
              element={<PortfolioPage />}
            />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </CurrentUserContext.Provider>
  );
}

function LoginPage() {
  return (
    <div className="">
      <Logo />
      <div className="flex justify-center">
        <LoginForm />
      </div>
    </div>
  );
}

function HomePage() {
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
        {studentProfiles && studentProfiles.length > 0 ? (
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
          <p className="text-gray-500 text-center">
            No student profiles available.
          </p>
        )}
      </div>
      <Outlet />
      <button
        onClick={() => {
          auth.signOut();
        }}
        className="mt-6 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200"
      >
        Sign Out
      </button>
    </div>
  );
}

function StudentProfilesCard({ student, isDrawerOpen, onToggleDrawer }) {
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
function AttendancePage() {
  const { studentName } = useParams();
  const location = useLocation();
  const studentId = location.state?.studentId || "";
  const [attendances, setAttendances] = useState([]);

  useEffect(() => {
    if (!studentId) {
      setAttendances([]);
      return;
    }
    const fetchAttendance = async () => {
      try {
        const results = await getAttendance(studentId, { includeIds: true });
        setAttendances(results);
      } catch (error) {
        console.log("Error fetching student attendance:", error);
        setAttendances([]);
      }
    };
    fetchAttendance();
    return () => {};
  }, [studentId]);

  // Format Firestore timestamp to readable date
  const formatDate = (timestamp) => {
    if (!timestamp || !timestamp.seconds) return "N/A";
    const date = new Date(
      timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000,
    );
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="mt-4 p-6 bg-white rounded-lg shadow-md max-w-2xl mx-auto">
      <h2 className="text-center text-2xl font-bold text-gray-800 mb-4">
        Attendance for {studentName}
      </h2>
      {attendances.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 text-sm font-semibold text-gray-600">
                  Date
                </th>
                <th className="p-3 text-sm font-semibold text-gray-600">
                  Class
                </th>
                <th className="p-3 text-sm font-semibold text-gray-600">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {attendances.map((record) => (
                <tr
                  key={record.id}
                  className="border-b border-gray-200 hover:bg-gray-50"
                >
                  <td className="p-3 text-gray-700">
                    {formatDate(record.attendanceDate)}
                  </td>
                  <td className="p-3 text-gray-700">{record.className}</td>
                  <td className="p-3">
                    <span
                      className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                        record.attendance
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {record.attendance ? "Present" : "Absent"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500 text-center">
          No attendance records found for {studentName}.
        </p>
      )}
    </div>
  );
}
function PortfolioPage() {
  const { studentName } = useParams();
  return (
    <div className="mt-4 p-4 bg-white rounded-lg shadow-md max-w-2xl">
      <h2 className="text-2xl font-bold">Portfolio for {studentName}</h2>
    </div>
  );
}
function NotFoundPage() {
  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <div className="border-2 border-gray-500 rounded-lg flex flex-col items-center gap-5 p-5">
        <h1 className="text-4xl font-bold text-gray-700">
          404 - Page Not Found
        </h1>
        <p className="text-lg text-gray-700">
          Sorry, the page you’re looking for doesn’t exist.
        </p>
        <Link
          className="text-blue-500 cursor-pointer hover:underline"
          to="/login"
        >
          Go to Login
        </Link>
      </div>
    </div>
  );
}

function Logo() {
  return (
    <div className="flex justify-center mt-80">
      <img src="/Icon-192.png" alt="ArtWink Studio Logo"></img>
    </div>
  );
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "" });
  const { setCurrentUser } = useContext(CurrentUserContext);

  const validateForm = () => {
    let tempErrors = { email: "", password: "" };
    let isValid = true;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      tempErrors.email = "Email is required";
      isValid = false;
    } else if (!emailRegex.test(email)) {
      tempErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    if (!password) {
      tempErrors.password = "Password is required";
      isValid = false;
    } else if (password.length < 5) {
      tempErrors.password = "Password mush be at least 10 characters";
      isValid = false;
    }
    setErrors(tempErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validation = validateForm();
    if (validation) {
      try {
        const user = await firebaseSignIn(auth, email, password);
        setCurrentUser(user || "");
      } catch (error) {
        switch (error.code) {
          case "auth/invalid-email":
          case "auth/user-not-found":
            setErrors({ ...errors, email: error.message });
            break;
          case "auth/wrong-password":
            setErrors({ ...errors, password: error.message });
            break;
          default:
            setErrors({ ...errors });
        }
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col gap-3">
        <div className="flex justify-between flex-col">
          <label className="color-gray-500 text-xs" htmlFor="username">
            Username:
          </label>
          <input
            className="border-1 border-gray-400 w-3xs rounded-lg pl-1 text-sm"
            id="username"
            type="text"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {errors.email && (
            <span className="text-red-500 text-xs">{errors.email}</span>
          )}
        </div>
        <div className="flex justify-between flex-col">
          <label className="color-gray-500 text-xs" htmlFor="password">
            Password:
          </label>
          <input
            className="border-1 border-gray-400 w-3xs rounded-lg pl-1 text-sm"
            id="password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {errors.password && (
            <span className="text-red-500 text-xs">{errors.password}</span>
          )}
        </div>
        <div className="flex justify-center flex-wrap">
          <button
            className="border-1 border-gray-400 rounded-lg text-sm w-1/2 self-center mt-1"
            type="submit"
          >
            Login
          </button>
        </div>
      </div>
    </form>
  );
}

export default App;
