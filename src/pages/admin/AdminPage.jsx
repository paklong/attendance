import { Suspense } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import LoadingState from "../../components/ui/LoadingState";
import useAdminData from "../../hooks/useAdminData";
import { signOut } from "../../services/authService";
import {
  adminContainerStyles,
  errorHeaderStyles,
  errorTextStyles,
  headerStyles,
  loadingContainerStyles,
  navButtonStyles,
  navButtonStylesEdit,
  navStyles,
  signOutButtonStyles,
  smallSpinnerStyles,
  titleStyles,
} from "../../utils/styles";

// Each button reloads the collections its view depends on before navigating.
const NAV_ROWS = [
  {
    className: navButtonStyles,
    items: [
      { label: "Students", path: "students", refresh: ["students"] },
      { label: "Attendance", path: "attendances", refresh: ["attendances"] },
      { label: "View Artworks", path: "view-artworks", refresh: ["students"] },
    ],
  },
  {
    className: navButtonStylesEdit,
    items: [
      { label: "New Parent", path: "new-parent", refresh: [] },
      { label: "New Student", path: "new-student", refresh: ["parents"] },
      {
        label: "Add Attendance",
        path: "add-attendance",
        refresh: ["students", "parents"],
      },
      { label: "Add Artworks", path: "add-artworks", refresh: ["students"] },
    ],
  },
];

export default function AdminPage() {
  const { data, errors, isReady, isRefreshing, refresh } = useAdminData();
  const navigate = useNavigate();
  const errorMessages = Object.entries(errors).filter(([, error]) => error);

  const handleNavigate = ({ path, refresh: keys }) => {
    if (keys.length > 0) refresh(...keys);
    navigate(path);
  };

  const renderContent = () => {
    if (errorMessages.length > 0) {
      return (
        <div className={loadingContainerStyles}>
          <p className={errorHeaderStyles}>Error loading data:</p>
          <ul className={errorTextStyles}>
            {errorMessages.map(([key, error]) => (
              <li key={key}>{error}</li>
            ))}
          </ul>
        </div>
      );
    }
    if (!isReady) {
      return <LoadingState message="Loading data..." />;
    }
    return (
      <Suspense fallback={<LoadingState />}>
        <Outlet context={{ data, refresh }} />
      </Suspense>
    );
  };

  return (
    <div className={adminContainerStyles}>
      <div className={headerStyles}>
        <div className="flex items-center gap-2">
          <Link to="/admin">
            <h1 className={titleStyles}>Admin Dashboard</h1>
          </Link>
          {isReady && isRefreshing && (
            <span
              className={smallSpinnerStyles}
              aria-label="Refreshing data"
            />
          )}
        </div>
        <button onClick={signOut} className={signOutButtonStyles}>
          Sign Out
        </button>
      </div>

      {NAV_ROWS.map((row) => (
        <nav key={row.items[0].path} className={navStyles}>
          {row.items.map((item) => (
            <button
              key={item.path}
              className={row.className}
              onClick={() => handleNavigate(item)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      ))}

      {renderContent()}
    </div>
  );
}
