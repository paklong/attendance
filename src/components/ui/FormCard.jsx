export default function FormCard({ title, children }) {
  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">{title}</h2>
      {children}
    </div>
  );
}
