import { Link } from "react-router-dom";

export default function NotFoundPage() {
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
