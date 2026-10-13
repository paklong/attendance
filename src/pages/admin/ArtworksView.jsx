import { useCallback, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import ArtworkGrid from "../../components/ui/ArtworkGrid";
import LoadingState from "../../components/ui/LoadingState";
import useAsync from "../../hooks/useAsync";
import { getArtworksForStudent } from "../../services/artworkService";
import { sortByStudentName } from "../../utils/sort";
import { errorTextStyles, selectStyles } from "../../utils/styles";

export default function ArtworksView() {
  const { data } = useOutletContext();
  const students = useMemo(
    () => sortByStudentName(data.students),
    [data.students],
  );
  const [selectedStudentId, setSelectedStudentId] = useState("");

  const loadArtworks = useCallback(
    () =>
      selectedStudentId
        ? getArtworksForStudent(selectedStudentId)
        : Promise.resolve([]),
    [selectedStudentId],
  );
  const { data: artworks = [], loading, error } = useAsync(loadArtworks);

  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">View Student Artworks</h2>

      <div className="mb-6">
        <label
          htmlFor="studentSelect"
          className="block mb-2 text-sm font-medium text-gray-700"
        >
          Select a Student:
        </label>
        <select
          id="studentSelect"
          value={selectedStudentId}
          onChange={(e) => setSelectedStudentId(e.target.value)}
          className={selectStyles}
          disabled={students.length === 0}
        >
          <option value="">-- Select Student --</option>
          {students.map((student) => (
            <option key={student.id} value={student.id}>
              {student.studentName}
            </option>
          ))}
        </select>
      </div>

      {!selectedStudentId ? (
        students.length > 0 && (
          <p className="text-gray-500 text-center mt-6">
            Please select a student to view their artworks.
          </p>
        )
      ) : loading ? (
        <LoadingState message="Loading artworks..." />
      ) : error ? (
        <p className={`${errorTextStyles} mt-4`}>
          Failed to load artworks for the selected student.
        </p>
      ) : (
        <div>
          <h3 className="text-lg font-medium mb-3">
            Artworks for {selectedStudent?.studentName || "Selected Student"}
          </h3>
          <ArtworkGrid
            artworks={artworks}
            emptyMessage="No artworks found for this student."
          />
        </div>
      )}
    </div>
  );
}
