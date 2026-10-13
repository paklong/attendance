import { useEffect, useMemo, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import Alert from "../../components/ui/Alert";
import FormCard from "../../components/ui/FormCard";
import SubmitButton from "../../components/ui/SubmitButton";
import { createArtwork } from "../../services/artworkService";
import { uploadArtworkImage } from "../../services/artworkUploadService";
import { addWatermark } from "../../utils/image";
import { matchesSearch } from "../../utils/search";
import { sortByStudentName } from "../../utils/sort";
import { checkboxStyles } from "../../utils/styles";

let nextImageId = 0;

const revokePreviews = (images) =>
  images.forEach((image) => URL.revokeObjectURL(image.previewUrl));

const processFile = async (file) => {
  if (!file.type.startsWith("image/")) {
    throw new Error(`File "${file.name}" is not a valid image.`);
  }
  const watermarked = await addWatermark(file);
  return {
    id: nextImageId++,
    file: watermarked,
    previewUrl: URL.createObjectURL(watermarked),
  };
};

const uploadImage = async (file, studentIds) => {
  const { fileName, downloadURL } = await uploadArtworkImage(file);
  await createArtwork(downloadURL, studentIds, fileName);
};

export default function AddArtworksView() {
  const { data } = useOutletContext();
  const [images, setImages] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState(() => new Set());
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const fileInputRef = useRef(null);
  const imagesRef = useRef(images);

  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  useEffect(() => () => revokePreviews(imagesRef.current), []);

  const students = useMemo(
    () => sortByStudentName(data.students),
    [data.students],
  );
  const filteredStudents = useMemo(
    () =>
      students.filter(
        (student) =>
          matchesSearch(student.studentName, searchQuery) &&
          (!showActiveOnly || student.isActive),
      ),
    [students, searchQuery, showActiveOnly],
  );

  const isBusy = isProcessing || isUploading;

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setError("");
    setIsProcessing(true);

    const results = await Promise.allSettled(files.map(processFile));
    const processed = [];
    const processingErrors = [];
    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        processed.push(result.value);
      } else {
        console.error(
          `Processing failed for ${files[index].name}:`,
          result.reason,
        );
        processingErrors.push(
          result.reason.message ||
            `Failed to process file ${files[index].name}`,
        );
      }
    });

    if (processed.length > 0) {
      setImages((prev) => [...prev, ...processed]);
    }
    if (processingErrors.length > 0) {
      setError(
        `Some files could not be processed: ${processingErrors.join("; ")}`,
      );
    }
    setIsProcessing(false);

    // Reset so selecting the same file(s) again still fires onChange.
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveImage = (imageId) => {
    setImages((prev) => {
      const removed = prev.find((image) => image.id === imageId);
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      return prev.filter((image) => image.id !== imageId);
    });
  };

  const handleStudentToggle = (studentId) => {
    setSelectedStudents((prev) => {
      const next = new Set(prev);
      if (next.has(studentId)) next.delete(studentId);
      else next.add(studentId);
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (images.length === 0 || selectedStudents.size === 0) {
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

    const studentIds = [...selectedStudents];
    const results = await Promise.allSettled(
      images.map(({ file }) => uploadImage(file, studentIds)),
    );
    const uploadErrors = results.flatMap((result, index) => {
      if (result.status === "fulfilled") return [];
      const { name } = images[index].file;
      console.error(`Upload error for ${name}:`, result.reason);
      return [
        `Failed to upload ${name}: ${result.reason.message || "Unknown error"}`,
      ];
    });
    const successCount = images.length - uploadErrors.length;

    setIsUploading(false);

    if (uploadErrors.length > 0) {
      setError(
        `Completed with errors. ${successCount} of ${images.length} uploaded. Errors: ${uploadErrors.join("; ")}`,
      );
    } else {
      alert(
        `${successCount} artwork${successCount > 1 ? "s" : ""} uploaded successfully!`,
      );
    }

    revokePreviews(images);
    setImages([]);
    setSelectedStudents(new Set());
  };

  return (
    <FormCard title="Add Artwork">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="artworkFiles"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Upload Artwork{" "}
            {isProcessing && (
              <span className="text-blue-600 animate-pulse">
                (Processing...)
              </span>
            )}
          </label>
          <input
            id="artworkFiles"
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            ref={fileInputRef}
            disabled={isBusy}
            className={`block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100
              ${isBusy ? "opacity-50 cursor-not-allowed" : ""}`}
          />
          {images.length > 0 && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {images.map((image, index) => (
                <div key={image.id} className="relative group">
                  <img
                    src={image.previewUrl}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded-md shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(image.id)}
                    disabled={isUploading}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs opacity-75 group-hover:opacity-100 transition-opacity"
                    aria-label={`Remove image ${index + 1}`}
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label
            htmlFor="studentSearch"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Tag Students
          </label>
          <input
            id="studentSearch"
            type="text"
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 mb-4 border rounded-md text-sm
              focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="active-only"
              checked={showActiveOnly}
              onChange={() => setShowActiveOnly((prev) => !prev)}
              className={checkboxStyles}
            />
            <label htmlFor="active-only" className="ml-2 text-sm text-gray-700">
              Show only active students
            </label>
          </div>
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
                    checked={selectedStudents.has(student.id)}
                    onChange={() => handleStudentToggle(student.id)}
                    className={checkboxStyles}
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

        <Alert variant="error">{error}</Alert>

        <SubmitButton
          disabled={
            isBusy || images.length === 0 || selectedStudents.size === 0
          }
        >
          {isUploading
            ? "Uploading..."
            : isProcessing
              ? "Processing..."
              : "Upload Artwork"}
        </SubmitButton>
      </form>
    </FormCard>
  );
}
