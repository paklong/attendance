import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { getArtworksForStudent, getAllStudents } from "../utils/firebase";
import {
  selectStyles,
  loadingContainerStyles,
  spinnerStyles,
  errorTextStyles,
  artworkGridStyles,
  artworkCardStyles,
  artworkImageStyles,
  noArtworksTextStyles,
} from "../utils/styles"; // Assuming you have styles defined

export function AdminArtWorkView() {
  const { data, fetchStudents } = useOutletContext(); // Use context from AdminPage
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [artworks, setArtworks] = useState([]);
  const [loadingArtworks, setLoadingArtworks] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [imageErrors, setImageErrors] = useState({});

  // Initial fetch for students or refresh
  useEffect(() => {
    const loadStudents = async () => {
      if (!data?.students || data.students.length === 0) {
        try {
          const studentList = await getAllStudents(); // Fetch if not available in context
          setStudents(studentList || []);
        } catch (err) {
          setFetchError("Failed to load students list.");
          console.error("Error fetching students:", err);
        }
      } else {
        setStudents(data.students);
      }
    };
    loadStudents();
  }, [data?.students]); // Depend on context students data

  // Fetch artworks when a student is selected
  useEffect(() => {
    const fetchArtworksForSelectedStudent = async () => {
      if (!selectedStudentId) {
        setArtworks([]); // Clear artworks if no student is selected
        return;
      }

      setLoadingArtworks(true);
      setFetchError(null);
      setArtworks([]); // Clear previous artworks
      setImageErrors({}); // Clear previous image errors

      try {
        const results = await getArtworksForStudent(selectedStudentId);
        setArtworks(results || []);
      } catch (err) {
        console.error("Error fetching artworks:", err);
        setFetchError("Failed to load artworks for the selected student.");
      } finally {
        setLoadingArtworks(false);
      }
    };

    fetchArtworksForSelectedStudent();
  }, [selectedStudentId]); // Re-run when selectedStudentId changes

  const handleStudentChange = (e) => {
    setSelectedStudentId(e.target.value);
  };

  const handleImageError = (artworkId) => {
    setImageErrors((prev) => ({
      ...prev,
      [artworkId]: true,
    }));
  };

  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">View Student Artworks</h2>

      {/* Student Selection */}
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
          onChange={handleStudentChange}
          className={selectStyles} // Apply consistent styling
          disabled={students.length === 0}
        >
          <option value="">-- Select Student --</option>
          {students.map((student) => (
            <option key={student.id} value={student.id}>
              {student.studentName}
            </option>
          ))}
        </select>
        {fetchError &&
          !loadingArtworks && ( // Show student list fetch error here
            <p className={`${errorTextStyles} mt-2`}>{fetchError}</p>
          )}
      </div>

      {/* Loading State */}
      {loadingArtworks && (
        <div className={loadingContainerStyles}>
          <div className={spinnerStyles}></div>
          <p>Loading artworks...</p>
        </div>
      )}

      {/* Error State for Artworks */}
      {!loadingArtworks && fetchError && selectedStudentId && (
        <p className={`${errorTextStyles} mt-4`}>{fetchError}</p>
      )}

      {/* Artworks Display */}
      {!loadingArtworks && !fetchError && selectedStudentId && (
        <div>
          <h3 className="text-lg font-medium mb-3">
            Artworks for {selectedStudent?.studentName || "Selected Student"}
          </h3>
          {artworks.length > 0 ? (
            <div className={artworkGridStyles}>
              {artworks.map((artwork) => (
                <div key={artwork.id} className={artworkCardStyles}>
                  {imageErrors[artwork.id] ? (
                    <div className="w-full h-32 flex items-center justify-center bg-gray-200 text-gray-500 text-xs">
                      Failed to load image
                    </div>
                  ) : (
                    <img
                      src={artwork.imageUrl}
                      alt={`Artwork ${artwork.fileName || artwork.id}`}
                      className={artworkImageStyles}
                      loading="lazy"
                      onError={() => handleImageError(artwork.id)}
                    />
                  )}
                  <p className="text-xs text-gray-600 mt-1">
                    {artwork.createdAt
                      ? new Date(
                          artwork.createdAt.toDate(),
                        ).toLocaleDateString()
                      : "No date"}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className={noArtworksTextStyles}>
              No artworks found for this student.
            </p>
          )}
        </div>
      )}

      {/* Prompt to select student */}
      {!selectedStudentId && !loadingArtworks && students.length > 0 && (
        <p className="text-gray-500 text-center mt-6">
          Please select a student to view their artworks.
        </p>
      )}
    </div>
  );
}
