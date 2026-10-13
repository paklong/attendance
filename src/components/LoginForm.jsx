import { useState } from "react";
import { signIn } from "../services/authService";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 5;
const NO_ERRORS = { email: "", password: "", form: "" };

const validate = (email, password) => {
  const errors = { ...NO_ERRORS };
  if (!email) {
    errors.email = "Email is required";
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = "Please enter a valid email address";
  }
  if (!password) {
    errors.password = "Password is required";
  } else if (password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
  }
  return errors;
};

const fieldForErrorCode = (code) => {
  switch (code) {
    case "auth/invalid-email":
    case "auth/user-not-found":
      return "email";
    case "auth/wrong-password":
      return "password";
    default:
      return "form";
  }
};

// On success the auth listener in AuthProvider picks up the new user and the
// router redirects away from /login.
export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState(NO_ERRORS);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate(email, password);
    setErrors(validationErrors);
    if (validationErrors.email || validationErrors.password) return;

    setSubmitting(true);
    try {
      await signIn(email, password);
    } catch (error) {
      setErrors({ ...NO_ERRORS, [fieldForErrorCode(error.code)]: error.message });
    } finally {
      setSubmitting(false);
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
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
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {errors.password && (
            <span className="text-red-500 text-xs">{errors.password}</span>
          )}
        </div>
        {errors.form && (
          <span className="text-red-500 text-xs text-center w-3xs">
            {errors.form}
          </span>
        )}
        <div className="flex justify-center flex-wrap">
          <button
            className="border-1 border-gray-400 rounded-lg text-sm w-1/2 self-center mt-1"
            type="submit"
            disabled={submitting}
          >
            {submitting ? "Logging in..." : "Login"}
          </button>
        </div>
      </div>
    </form>
  );
}
