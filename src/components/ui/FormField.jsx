export default function FormField({ label, htmlFor, className, children }) {
  return (
    <div className={className}>
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        {label}
      </label>
      {children}
    </div>
  );
}
