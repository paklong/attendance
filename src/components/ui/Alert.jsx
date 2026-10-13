const VARIANT_STYLES = {
  error: "text-red-600 bg-red-50",
  success: "text-green-600 bg-green-50",
};

export default function Alert({ variant = "error", className = "", children }) {
  if (!children) return null;
  return (
    <p className={`text-sm p-2 rounded ${VARIANT_STYLES[variant]} ${className}`}>
      {children}
    </p>
  );
}
