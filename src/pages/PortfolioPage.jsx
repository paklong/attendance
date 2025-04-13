import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { getArtworksForStudent } from "../utils/firebase";
import {
  artworkGridStyles,
  artworkCardStyles,
  artworkImageStyles,
  noArtworksTextStyles,
  errorTextStyles,
  h2Styles,
  loadingTextStyles,
} from "../utils/styles";

export default function PortfolioPage() {
  const { studentName } = useParams();
  const { state } = useLocation();
  const studentId = state?.studentId;
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imageErrors, setImageErrors] = useState({});

  useEffect(() => {
    if (!studentId) {
      setError("No student ID provided.");
      setLoading(false);
      return;
    }

    const fetchArtworks = async () => {
      try {
        const results = await getArtworksForStudent(studentId);
        setArtworks(results);
        setError("");
      } catch (err) {
        console.error("Error fetching artworks:", err);
        setError("Failed to load artworks. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchArtworks();
  }, [studentId]);

  const handleImageError = (artworkId) => {
    setImageErrors((prev) => ({
      ...prev,
      [artworkId]: true,
    }));
  };

  return (
    <div className="mt-4 p-4 bg-white rounded-lg shadow-md max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        Portfolio for {studentName || "Student"}
      </h2>
      {loading ? (
        <div className="text-center py-4">
          <p className={`${loadingTextStyles} text-center`}>Loading artworks...</p>
        </div>
      ) : error ? (
        <p className={`${errorTextStyles} bg-red-50 p-2 rounded text-center`}>
          {error}
        </p>
      ) : artworks.length > 0 ? (
        <div className={artworkGridStyles}>
          {artworks.map((artwork) => (
            <div
              key={artwork.id}
              className={artworkCardStyles}
            >
              {imageErrors[artwork.id] ? (
                <div className="w-full h-32 flex items-center justify-center bg-gray-200 text-gray-500 text-xs">
                  Failed to load image
                </div>
              ) : (
                <>
                  <img
                    src={artwork.imageUrl}
                    alt={`Artwork ${artwork.fileName || artwork.id}`}
                    className={artworkImageStyles}
                    loading="lazy"
                    onError={() => handleImageError(artwork.id)}
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    {artwork.createdAt
                      ? new Date(
                          artwork.createdAt.toDate(),
                        ).toLocaleDateString()
                      : "No date"}
                  </p>
                </>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className={noArtworksTextStyles}>
          No artworks found for {studentName || "this student"}.
        </p>
      )}
    </div>
  );
}
