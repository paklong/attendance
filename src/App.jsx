import { createContext, useContext, useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import "./App.css";
import { db, auth, firebaseSignIn } from "./firebase.js";

const CurrentUserContext = createContext();

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUser(user.email);
      } else {
        setCurrentUser("");
      }
    });
    return () => unsubscribe();
  }, []);

  if (currentUser === null) {
    return <div>Loading...</div>;
  }

  return (
    <CurrentUserContext.Provider value={{ currentUser, setCurrentUser }}>
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
          />
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
  const { currentUser } = useContext(CurrentUserContext);
  return (
    <div>
      <h1>Hi {currentUser}</h1>
      <button
        onClick={() => {
          auth.signOut();
        }}
      >
        Sign Out
      </button>
    </div>
  );
}

function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <div className="border-2 border-gray-500 rounded-lg flex flex-col items-center gap-5 p-5">
        <h1 className="text-4xl font-bold text-gray-700">
          404 - Page Not Found
        </h1>
        <p className="text-lg text-gray-700">
          Sorry, the page you’re looking for doesn’t exist.
        </p>
        <button
          className="text-blue-500 cursor-pointer hover:underline"
          onClick={() => navigate("/login")}
        >
          Go to Login
        </button>
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
        const currentEmail = await firebaseSignIn(auth, email, password);
        setCurrentUser(currentEmail || "");
      } catch (errorMessage) {
        setErrors({ ...errors, email: errorMessage });
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
