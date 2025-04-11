import { useState } from "react";
import { deleteAttendance, updateStudent } from "../utils/firebase";
import { increment } from "firebase/firestore";

export default function RemoveAttendance({
  attendanceId,
  studentId,
  attendance,
  onRemove,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Delete the attendance record
      await deleteAttendance(attendanceId);

      // If the attendance was "Present", increment the student's remainingClasses
      if (attendance === true) {
        await updateStudent(studentId, {
          remainingClasses: increment(1), // Use Firestore increment to safely update
        });
      }

      // Notify the parent component of the successful deletion
      onRemove(attendanceId);

      setIsDeleted(true);
      setShowConfirm(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // If successfully deleted, show success message
  if (isDeleted) {
    return (
      <div className="p-4 bg-green-100 text-green-700 rounded-lg text-center">
        Attendance record deleted successfully!
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Delete Button */}
      <button
        onClick={() => setShowConfirm(true)}
        disabled={isLoading}
        className={`text-red-400 rounded-md hover:bg-red-700 
          focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
          ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {isLoading ? "Deleting..." : "Delete"}
      </button>

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Confirm Deletion
            </h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete this attendance record? This
              action cannot be undone.
            </p>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={isLoading}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md 
                  hover:bg-gray-300 focus:outline-none focus:ring-2 
                  focus:ring-gray-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isLoading}
                className={`px-4 py-2 bg-red-600 text-white rounded-md 
                  hover:bg-red-700 focus:outline-none focus:ring-2 
                  focus:ring-red-500 focus:ring-offset-2
                  ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {isLoading ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
