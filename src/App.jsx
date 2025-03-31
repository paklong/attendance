import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage.jsx";
import AttendancePage from "./pages/AttendancePage.jsx";
import PortfolioPage from "./pages/PortfolioPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import useAuth from "./components/useAuth.jsx"; // Assuming this is the correct path
import CurrentUserContext from "./context/CurrentUserContext.jsx";
import AdminPage from "./pages/AdminPage.jsx";
import AdminStudentView from "./components/AdminStudentsView.jsx";

function App() {
  const { currentUser, setCurrentUser, userProfile, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <CurrentUserContext.Provider
      value={{ currentUser, setCurrentUser, userProfile }}
    >
      <BrowserRouter>
        <Routes>
          {/* Root redirects to /login */}
          <Route path="/" element={<Navigate to="/login" />} />

          {/* /login: Only show LoginPage if not authenticated */}
          <Route
            path="/login"
            element={
              !currentUser ? (
                <LoginPage />
              ) : (
                <Navigate to={currentUser.isAdmin ? "/admin" : "/home"} />
              )
            }
          />

          {/* /admin: Only for authenticated admins */}
          <Route
            path="/admin"
            element={
              currentUser && currentUser.isAdmin ? (
                <AdminPage />
              ) : (
                <Navigate to="/login" />
              )
            }
          >
            <Route path="students" element={<AdminStudentView />} />
          </Route>

          {/* /home: Only for authenticated non-admins (or all authenticated users if nested routes apply) */}
          <Route
            path="/home"
            element={
              currentUser && !currentUser.isAdmin ? (
                <HomePage />
              ) : (
                <Navigate to="/login" />
              )
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

          {/* Catch-all for undefined routes */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </CurrentUserContext.Provider>
  );
}

export default App;
