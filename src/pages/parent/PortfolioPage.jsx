import { useCallback } from "react";
import { useLocation, useParams } from "react-router-dom";
import ArtworkGrid from "../../components/ui/ArtworkGrid";
import Alert from "../../components/ui/Alert";
import useAsync from "../../hooks/useAsync";
import { getArtworksForStudent } from "../../services/artworkService";
import { loadingTextStyles } from "../../utils/styles";

export default function PortfolioPage() {
  const { studentName } = useParams();
  const studentId = useLocation().state?.studentId;

  const loadArtworks = useCallback(
    () => (studentId ? getArtworksForStudent(studentId) : Promise.resolve([])),
    [studentId],
  );
  const { data: artworks = [], loading, error } = useAsync(loadArtworks);

  const errorMessage = !studentId
    ? "No student ID provided."
    : error
      ? "Failed to load artworks. Please try again."
      : null;

  return (
    <div className="mt-4 p-4 bg-white rounded-lg shadow-md max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        Portfolio for {studentName || "Student"}
      </h2>
      {errorMessage ? (
        <Alert className="text-center">{errorMessage}</Alert>
      ) : loading ? (
        <div className="text-center py-4">
          <p className={`${loadingTextStyles} text-center`}>
            Loading artworks...
          </p>
        </div>
      ) : (
        <ArtworkGrid
          artworks={artworks}
          emptyMessage={`No artworks found for ${studentName || "this student"}.`}
        />
      )}
    </div>
  );
}
