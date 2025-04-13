import { useState, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import { uploadArtworkImage, createArtwork } from "../utils/firebase"; // Import new utilities

// Helper function to add watermark
const addWatermark = (imageFile) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = img.width;
        canvas.height = img.height;

        // Draw the original image
        ctx.drawImage(img, 0, 0);

        // Load the watermark icon
        const watermark = new Image();
        watermark.onload = () => {
          // Scale watermark width to ~10% of the image width (Area ~ 1/100)
          const scaleFactor = 0.1;
          let watermarkWidth = img.width * scaleFactor;
          let watermarkHeight = watermark.height * (watermarkWidth / watermark.width); // Maintain aspect ratio

          // Optional: Add max size constraint if needed
          // watermarkWidth = Math.min(watermarkWidth, img.width * 0.5); // e.g. max 50% width
          // watermarkHeight = watermark.height * (watermarkWidth / watermark.width);

          // Ensure watermark fits within the image bounds
           watermarkWidth = Math.min(watermarkWidth, img.width);
           watermarkHeight = Math.min(watermarkHeight, img.height);


          // Calculate position (bottom left with small padding)
          const padding = img.width * 0.02; // 2% padding based on image width
          const x = padding; // Position from the left edge
          const y = img.height - watermarkHeight - padding; // Position from the bottom edge

          // Apply transparency (REMOVED for 100% opacity)
          // ctx.globalAlpha = 0.5;

          // Draw the watermark
          ctx.drawImage(watermark, x, y, watermarkWidth, watermarkHeight);

          // Reset alpha (REMOVED as it was never changed)
          // ctx.globalAlpha = 1.0;

          // Convert canvas to Blob
          canvas.toBlob((blob) => {
            if (blob) {
              // Create a new File object to retain the original filename
              const processedFile = new File([blob], imageFile.name, { type: blob.type });
              resolve(processedFile);
            } else {
              reject(new Error('Canvas to Blob conversion failed'));
            }
          }, imageFile.type || 'image/png'); // Use original file type or default
        };
        watermark.onerror = (err) => {
          console.error("Error loading watermark icon:", err);
          reject(new Error('Failed to load watermark icon. Check path/availability.'));
        };
        // Make sure 'Icon-192.png' is in your public folder or adjust path
        watermark.src = '/Icon-192.png';
      };
      img.onerror = (err) => {
         console.error("Error loading image for watermarking:", err);
         reject(new Error('Failed to load image for watermarking.'));
      }
      img.src = event.target.result;
    };
    reader.onerror = (err) => {
        console.error("FileReader error:", err);
        reject(new Error('Failed to read image file.'));
    }
    reader.readAsDataURL(imageFile);
  });
};

export default function AddArtWorkView() {
  const { data } = useOutletContext();
  const { students } = data || {};
  // State for multiple images and previews
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); // New state for watermarking
  const [error, setError] = useState("");
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const fileInputRef = useRef(null);

  // Handle multiple image selection, watermarking, and previews
  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files); // Convert FileList to array
    if (!files.length) return;

    setError(""); // Clear previous errors
    setIsProcessing(true); // Start processing indicator

    // Create promises for processing each file
    const processingPromises = files.map(async (file) => {
      if (!file.type.startsWith("image/")) {
        // Use file.name in the error for clarity
        throw new Error(`File "${file.name}" is not a valid image.`);
      }
      // Try adding the watermark
      return addWatermark(file); // Returns promise resolving with processed File
    });

    // Wait for all processing attempts to settle
    const results = await Promise.allSettled(processingPromises);

    const newImages = [];
    const newPreviews = [];
    const processingErrors = [];

    // Process results
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const processedFile = result.value; // This is the watermarked File object
        newImages.push(processedFile);
        newPreviews.push(URL.createObjectURL(processedFile)); // Create preview URL from processed file
      } else {
        // Handle rejection (non-image file or watermarking error)
        processingErrors.push(result.reason.message || `Failed to process file ${files[index].name}`);
        console.error(`Processing failed for ${files[index].name}:`, result.reason);
      }
    });

    // Update state only with successfully processed images
    if (newImages.length > 0) {
      setImages((prev) => [...prev, ...newImages]);
      setPreviews((prev) => [...prev, ...newPreviews]);
    }

    // Report any errors
    if (processingErrors.length > 0) {
      setError(`Some files could not be processed: ${processingErrors.join("; ")}`);
    }

    setIsProcessing(false); // End processing indicator

    // Important: Reset file input value to allow re-selecting the same file(s)
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle removing a selected image
  const handleRemoveImage = (indexToRemove) => {
    // Revoke the object URL to free memory
    URL.revokeObjectURL(previews[indexToRemove]);

    setImages((prev) => prev.filter((_, index) => index !== indexToRemove));
    setPreviews((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  // Handle student selection
  const handleStudentToggle = (studentId) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId],
    );
  };

  // Upload images and save artwork records
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if images and students are selected
    if (images.length === 0 || selectedStudents.length === 0) {
      setError("Please select at least one image and one student.");
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to upload ${images.length} artwork(s)?`,
      )
    ) {
      return;
    }

    setIsUploading(true);
    setError("");
    let uploadErrors = [];
    let successCount = 0;

    // Process each image sequentially (or use Promise.all for parallel)
    for (const image of images) {
      try {
        // Upload image using utility function
        const { fileName, downloadURL } = await uploadArtworkImage(image);

        // Save artwork metadata using utility function
        await createArtwork(downloadURL, selectedStudents, fileName);
        successCount++;
      } catch (err) {
        console.error(`Upload error for ${image.name}:`, err);
        uploadErrors.push(
          `Failed to upload ${image.name}: ${err.message || "Unknown error"}`,
        );
      }
    }

    setIsUploading(false);

    // Handle results
    if (uploadErrors.length > 0) {
      setError(
        `Completed with errors. ${successCount} of ${images.length} uploaded. Errors: ${uploadErrors.join("; ")}`,
      );
    } else {
      alert(
        `${successCount} artwork${successCount > 1 ? "s" : ""} uploaded successfully!`,
      );
    }

    // Reset form only if all uploads were successful or if needed regardless
    // Revoke remaining object URLs before resetting
    previews.forEach(URL.revokeObjectURL);
    setImages([]);
    setPreviews([]);
    setSelectedStudents([]);
    // fileInputRef.current.value = ""; // Already reset in handleImageChange
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
            Upload Artwork {isProcessing && <span className="text-blue-600 animate-pulse">(Processing...)</span>}
          </label>
          <input
            type="file"
            accept="image/*"
            multiple // Allow multiple file selection
            onChange={handleImageChange}
            ref={fileInputRef}
            disabled={isProcessing || isUploading} // Disable while processing or uploading
            className={`block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100
              ${isProcessing || isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          />
          {/* Display multiple previews */}
          {previews.length > 0 && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {previews.map((previewUrl, index) => (
                <div key={index} className="relative group">
                  <img
                    src={previewUrl}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded-md shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs opacity-75 group-hover:opacity-100 transition-opacity"
                    aria-label={`Remove image ${index + 1}`}
                  >
                    &times; {/* Simple X character for remove */}
                  </button>
                </div>
              ))}
            </div>
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
          disabled={isUploading || isProcessing || images.length === 0 || selectedStudents.length === 0} // Also disable if processing
          className={`w-full py-2 px-4 rounded-md text-white font-medium
            ${isUploading || isProcessing ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors`}
        >
          {isUploading ? "Uploading..." : isProcessing ? "Processing..." : "Upload Artwork"}
        </button>
      </form>
    </div>
  );
}
