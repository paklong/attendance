import { useParams } from "react-router-dom";

export default function PortfolioPage() {
  const { studentName } = useParams();
  return (
    <div className="mt-4 p-4 bg-white rounded-lg shadow-md max-w-2xl">
      <h2 className="text-2xl font-bold">Portfolio for {studentName}</h2>
    </div>
  );
}
