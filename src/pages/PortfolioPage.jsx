import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { getArtworksForStudent } from "../utils/firebase";

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
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Portfolio for {studentName || "Student"}
      </h2>
      {loading ? (
        <p className="text-gray-500 text-center">Loading artworks...</p>
      ) : error ? (
        <p className="text-red-600 bg-red-50 p-2 rounded text-center">
          {error}
        </p>
      ) : artworks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {artworks.map((artwork) => (
            <div
              key={artwork.id}
              className="relative overflow-hidden rounded-md shadow-sm bg-gray-100"
            >
              {imageErrors[artwork.id] ? (
                <div className="w-full h-48 flex items-center justify-center bg-gray-200 text-gray-500 text-sm">
                  Failed to load image
                </div>
              ) : (
                <>
                  <img
                    src={artwork.imageUrl}
                    alt={`Artwork ${artwork.fileName}`}
                    className="w-full h-48 object-contain z-10 relative"
                    loading="lazy"
                    onError={() => handleImageError(artwork.id)}
                    onLoad={() => console.log(`Loaded: ${artwork.imageUrl}`)}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-300 flex items-center justify-center z-0">
                    <p className="text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {artwork.createdAt
                        ? new Date(
                            artwork.createdAt.toDate(),
                          ).toLocaleDateString()
                        : "No date"}
                    </p>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center">
          No artworks found for {studentName || "this student"}.
        </p>
      )}
    </div>
  );
}
