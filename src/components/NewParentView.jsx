import { useState } from "react";
import { createNewParent } from "../utils/firebase";

export default function NewParentView() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    parentName: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formDisabled, setFormDisabled] = useState(false);

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
      const newParent = await createNewParent(
        formData.email,
        formData.password,
        formData.parentName,
      );
      setSuccess(
        `Parent "${newParent.parentName}" created successfully with ID: ${newParent.id}`,
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
        Create New Parent
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Field */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              formDisabled ? "bg-gray-100 cursor-not-allowed" : ""
            }`}
            required
            disabled={formDisabled}
            placeholder="paklong2556@gamil.com"
          />
        </div>

        {/* Password Field */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={`w-full p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              formDisabled ? "bg-gray-100 cursor-not-allowed" : ""
            }`}
            required
            disabled={formDisabled}
            placeholder="5109352857"
          />
        </div>

        {/* Parent Name Field */}
        <div>
          <label
            htmlFor="parentName"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Parent Name
          </label>
          <input
            type="text"
            id="parentName"
            name="parentName"
            value={formData.parentName}
            onChange={handleChange}
            className={`w-full p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              formDisabled ? "bg-gray-100 cursor-not-allowed" : ""
            }`}
            required
            disabled={formDisabled}
            placeholder="Pak Wan :)"
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
          {loading ? "Creating..." : "Create Parent"}
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
