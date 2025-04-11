import React, { useState, useEffect } from "react";
import { updateStudent } from "../utils/firebase";

export default function EditStudent({
  studentId,
  studentName,
  remainingClasses,
  isActive,
  onUpdate,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    studentName: "",
    remainingClasses: 0,
    isActive: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Update formData when props change or modal opens
  useEffect(() => {
    setFormData({
      studentName: studentName || "",
      remainingClasses: remainingClasses || 0,
      isActive: isActive ?? true,
    });
  }, [studentName, remainingClasses, isActive, isModalOpen]);

  // Function to open modal
  const openModal = () => {
    setIsModalOpen(true);
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : name === "remainingClasses"
            ? Number(value)
            : value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const updatedStudent = await updateStudent(studentId, formData);
      setIsModalOpen(false);
      if (onUpdate) {
        onUpdate(updatedStudent);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button onClick={openModal} className="text-blue-500 hover:text-blue-700">
        Edit
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center">
          <div
            className="fixed inset-0 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)} // Optional: Close on background click
          />
          <div className="relative bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
            <h2 className="text-xl font-bold mb-4">Edit Student</h2>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block mb-1">Student Name</label>
                <input
                  type="text"
                  name="studentName"
                  value={formData.studentName}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block mb-1">Remaining Classes</label>
                <input
                  type="number"
                  name="remainingClasses"
                  value={formData.remainingClasses}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Active Status
                </label>
              </div>

              {error && <div className="text-red-500 mb-4">{error}</div>}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
