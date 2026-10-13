import { useState } from "react";
import { updateStudent } from "../../services/studentService";

export default function EditStudent({
  studentId,
  studentName,
  remainingClasses,
  isActive,
  onUpdate,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const openModal = () => {
    setFormData({
      studentName: studentName || "",
      remainingClasses: remainingClasses || 0,
      isActive: isActive ?? true,
    });
    setError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await updateStudent(studentId, formData);
      setIsModalOpen(false);
      onUpdate?.();
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
          <div className="fixed inset-0 backdrop-blur-sm" onClick={closeModal} />
          <div
            className="relative bg-white p-6 rounded-lg w-full max-w-md shadow-lg"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`edit-student-${studentId}`}
          >
            <h2
              id={`edit-student-${studentId}`}
              className="text-xl font-bold mb-4"
            >
              Edit Student
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor={`${studentId}-name`} className="block mb-1">
                  Student Name
                </label>
                <input
                  id={`${studentId}-name`}
                  type="text"
                  name="studentName"
                  value={formData.studentName}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor={`${studentId}-remaining`}
                  className="block mb-1"
                >
                  Remaining Classes
                </label>
                <input
                  id={`${studentId}-remaining`}
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
                  onClick={closeModal}
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
