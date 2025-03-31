import { useLocation } from "react-router-dom";

export default function AdminStudentView() {
  const location = useLocation();
  const { students, parents, attendances } = location.state.data;
  return (
    <div>
      <p>Hi</p>
      <h1>{JSON.stringify(students)}</h1>
      <h1>{JSON.stringify(parents)}</h1>
      <h1>{JSON.stringify(attendances)}</h1>
    </div>
  );
}
