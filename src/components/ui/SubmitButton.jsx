export default function SubmitButton({ disabled, children }) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className={`w-full py-2 px-4 rounded-md text-white font-medium ${
        disabled
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      }`}
    >
      {children}
    </button>
  );
}
