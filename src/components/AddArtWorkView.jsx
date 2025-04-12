import { useState, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import { uploadArtworkImage, createArtwork } from "../utils/firebase"; // Import new utilities

export default function AddArtWorkView() {
  const { data } = useOutletContext();
  const { students } = data || {};
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const fileInputRef = useRef(null);

  // Handle image selection and preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    setError("");
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  // Handle student selection
  const handleStudentToggle = (studentId) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId],
    );
  };

  // Upload image and save artwork
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image || selectedStudents.length === 0) {
      setError("Please select an image and at least one student.");
      return;
    }

    if (!window.confirm("Are you sure you want to upload this artwork?")) {
      return;
    }

    setIsUploading(true);
    setError("");

    try {
      // Upload image using utility function
      const { fileName, downloadURL } = await uploadArtworkImage(image);

      // Save artwork metadata using utility function
      await createArtwork(downloadURL, selectedStudents, fileName);

      // Reset form
      setImage(null);
      setPreview(null);
      setSelectedStudents([]);
      fileInputRef.current.value = "";
      alert("Artwork uploaded successfully!");
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.message || "Failed to upload artwork. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // Filter students based on search query and active status
  const filteredStudents = students
    ? students.filter((student) => {
        const matchesSearch = student.studentName
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase());
        const matchesActive = showActiveOnly ? student.isActive : true;
        return matchesSearch && matchesActive;
      })
    : [];

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Add Artwork</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Artwork
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            ref={fileInputRef}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
          {preview && (
            <img
              src={preview}
              alt="Preview"
              className="mt-4 max-w-xs rounded-md shadow-sm"
            />
          )}
        </div>

        {/* Student Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tag Students
          </label>
          {/* Search Bar */}
          <input
            type="text"
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 mb-4 border rounded-md text-sm
              focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {/* Active Students Toggle */}
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="active-only"
              checked={showActiveOnly}
              onChange={() => setShowActiveOnly(!showActiveOnly)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="active-only" className="ml-2 text-sm text-gray-700">
              Show only active students
            </label>
          </div>
          {/* Student List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto p-2 border rounded-md">
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded"
                >
                  <input
                    type="checkbox"
                    id={`student-${student.id}`}
                    checked={selectedStudents.includes(student.id)}
                    onChange={() => handleStudentToggle(student.id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor={`student-${student.id}`}
                    className="text-sm text-gray-700"
                  >
                    {student.studentName || "Unknown"}
                  </label>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">
                {searchQuery
                  ? "No students match your search."
                  : "No students available."}
              </p>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isUploading}
          className={`w-full py-2 px-4 rounded-md text-white font-medium
            ${isUploading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
        >
          {isUploading ? "Uploading..." : "Upload Artwork"}
        </button>
      </form>
    </div>
  );
}
