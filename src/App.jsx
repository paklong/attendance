import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import RequireRole from "./components/RequireRole";
import LoadingState from "./components/ui/LoadingState";
import AuthProvider from "./context/AuthProvider";
import { useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";

const AdminPage = lazy(() => import("./pages/admin/AdminPage"));
const StudentsView = lazy(() => import("./pages/admin/StudentsView"));
const AttendanceView = lazy(() => import("./pages/admin/AttendanceView"));
const NewParentView = lazy(() => import("./pages/admin/NewParentView"));
const NewStudentView = lazy(() => import("./pages/admin/NewStudentView"));
const AddAttendanceView = lazy(() => import("./pages/admin/AddAttendanceView"));
const AddArtworksView = lazy(() => import("./pages/admin/AddArtworksView"));
const ArtworksView = lazy(() => import("./pages/admin/ArtworksView"));
const HomePage = lazy(() => import("./pages/parent/HomePage"));
const AttendancePage = lazy(() => import("./pages/parent/AttendancePage"));
const PortfolioPage = lazy(() => import("./pages/parent/PortfolioPage"));

function AppRoutes() {
  const { currentUser, isAdmin, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Suspense fallback={<LoadingState />}>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route
          path="/login"
          element={
            currentUser ? (
              <Navigate to={isAdmin ? "/admin" : "/home"} replace />
            ) : (
              <LoginPage />
            )
          }
        />

        <Route
          path="/admin"
          element={
            <RequireRole role="admin">
              <AdminPage />
            </RequireRole>
          }
        >
          <Route path="students" element={<StudentsView />} />
          <Route path="attendances" element={<AttendanceView />} />
          <Route path="new-parent" element={<NewParentView />} />
          <Route path="new-student" element={<NewStudentView />} />
          <Route path="add-attendance" element={<AddAttendanceView />} />
          <Route path="add-artworks" element={<AddArtworksView />} />
          <Route path="view-artworks" element={<ArtworksView />} />
        </Route>

        <Route
          path="/home"
          element={
            <RequireRole role="parent">
              <HomePage />
            </RequireRole>
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
    </Suspense>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
