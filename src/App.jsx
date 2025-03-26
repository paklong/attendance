import { useState } from "react";
import "./App.css";
import { db, auth, firebaseSignIn } from "./firebase.js";

function App() {
  return (
    <div className="">
      <Logo />
      <div className="flex justify-center">
        <LoginForm />
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const validation = validateForm();
    if (validation) {
      const currentEmail = firebaseSignIn(auth, email, password);
      console.log(currentEmail);
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
            className="border-1 border-gray-400 w-3xs rounded-lg pl-1"
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
            className="border-1 border-gray-400 w-3xs rounded-lg pl-1"
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
