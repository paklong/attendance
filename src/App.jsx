import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage.jsx";
import AttendancePage from "./pages/AttendancePage.jsx";
import PortfolioPage from "./pages/PortfolioPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import useAuth from "./components/useAuth.jsx";
import CurrentUserContext from "./context/CurrentUserContext.jsx";

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
          <Route path="/" element={<Navigate to="/login" />} />
          <Route
            path="/login"
            element={currentUser ? <Navigate to="/home" /> : <LoginPage />}
          />
          <Route
            path="/home"
            element={currentUser ? <HomePage /> : <Navigate to="/login" />}
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

export default App;
