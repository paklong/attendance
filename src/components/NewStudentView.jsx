import { useState } from "react";
import { createNewStudent, generateStudentId } from "../utils/firebase";
import { useOutletContext } from "react-router-dom";

export default function NewStudentView() {
  const { data } = useOutletContext();
  const [formData, setFormData] = useState({
    studentName: "",
    parentId: "",
    remainingClasses: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formDisabled, setFormDisabled] = useState(false);

  const { parents = [] } = data || {};

  const sortedParents = parents.sort((a, b) => {
    const timeA = a.lastModifiedTime?.toDate() || new Date(0);
    const timeB = b.lastModifiedTime?.toDate() || new Date(0);
    return timeB - timeA;
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    setFormDisabled(true);

    try {
      const studentId = generateStudentId();
      const newStudent = await createNewStudent(
        studentId,
        formData.studentName,
        formData.parentId,
        parseInt(formData.remainingClasses) || 0,
      );
      setSuccess(
        `Student "${newStudent.studentName}" created successfully with ID: ${newStudent.id}`,
      );
    } catch (err) {
      setError(err.message);
      setFormDisabled(false);
    } finally {
      setLoading(false);
      setTimeout(() => setFormDisabled(false), 3000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Create New Student
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Student Name Field */}
        <div>
          <label
            htmlFor="studentName"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Student Name
          </label>
          <input
            type="text"
            id="studentName"
            name="studentName"
            value={formData.studentName}
            onChange={handleChange}
            className={`w-full p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              formDisabled ? "bg-gray-100 cursor-not-allowed" : ""
            }`}
            required
            disabled={formDisabled}
            placeholder="Winsey Kwan"
          />
        </div>

        {/* Parent Selection Field */}
        <div>
          <label
            htmlFor="parentId"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Select Parent
          </label>
          <select
            id="parentId"
            name="parentId"
            value={formData.parentId}
            onChange={handleChange}
            className={`w-full p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              formDisabled || parents.length === 0
                ? "bg-gray-100 cursor-not-allowed"
                : ""
            }`}
            disabled={formDisabled || parents.length === 0}
          >
            {sortedParents.length === 0 ? (
              <option value="">No parents available</option>
            ) : (
              <>
                <option value="">No parent selected</option>
                {sortedParents
                  .filter((parent) => parent.parentName)
                  .map((parent) => (
                    <option key={parent.id} value={parent.id}>
                      {parent.parentName} ({parent.email})
                    </option>
                  ))}
              </>
            )}
          </select>
        </div>

        {/* Remaining Classes Field */}
        <div>
          <label
            htmlFor="remainingClasses"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Remaining Classes
          </label>
          <input
            type="number"
            id="remainingClasses"
            name="remainingClasses"
            value={formData.remainingClasses}
            onChange={handleChange}
            className={`w-full p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              formDisabled ? "bg-gray-100 cursor-not-allowed" : ""
            }`}
            min="0"
            disabled={formDisabled}
            placeholder="e.g., 12"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className={`w-full py-2 px-4 rounded-md text-white font-medium ${
            loading || formDisabled
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          }`}
          disabled={loading || formDisabled}
        >
          {loading ? "Creating..." : "Create Student"}
        </button>

        {/* Error Message */}
        {error && (
          <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>
        )}

        {/* Success Message */}
        {success && (
          <p className="text-sm text-green-600 bg-green-50 p-2 rounded">
            {success}
          </p>
        )}
      </form>
    </div>
  );
}
