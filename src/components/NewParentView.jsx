import { useState, useEffect } from "react";
import { createNewParent } from "../utils/firebase";

export default function NewParentView() {
  const [formData, setFormData] = useState({
    email: "",
    password: "", // This will now be the phone number
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
    setFormDisabled(true); // Disable form immediately on submit

    try {
      const newParent = await createNewParent(
        formData.email,
        formData.password, // Phone number as password
        formData.parentName,
      );
      setSuccess(
        `Parent "${newParent.parentName}" created successfully with ID: ${newParent.id}`,
      );
      // Optionally reset form (uncomment if desired)
      // setFormData({ email: "", password: "", parentName: "" });
    } catch (err) {
      setError(err.message);
      setFormDisabled(false); // Re-enable form on error
    } finally {
      setLoading(false);
      // Re-enable form after 3 seconds if successful
      setTimeout(() => setFormDisabled(false), 3000);
    }
  };

  // Reusable Tailwind styles
  const containerStyles = "p-4 max-w-md mx-auto";
  const formStyles = "space-y-4";
  const labelStyles = "block text-sm font-medium text-gray-700";
  const inputStyles = `w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
    formDisabled ? "bg-gray-100 cursor-not-allowed" : ""
  }`;
  const buttonBaseStyles =
    "px-4 py-2 text-sm text-white rounded-md transition duration-150 focus:outline-none focus:ring-2";
  const submitButtonStyles = `${buttonBaseStyles} bg-blue-600 hover:bg-blue-700 focus:ring-blue-500`;
  const disabledButtonStyles = `${buttonBaseStyles} bg-gray-400 cursor-not-allowed`;
  const errorStyles = "text-red-600 text-sm mt-2";
  const successStyles =
    "text-green-600 text-base font-semibold mt-4 bg-green-100 p-3 rounded-md";

  return (
    <div className={containerStyles}>
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Create New Parent
      </h2>
      <form onSubmit={handleSubmit} className={formStyles}>
        {/* Email Field */}
        <div>
          <label htmlFor="email" className={labelStyles}>
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={inputStyles}
            required
            disabled={formDisabled}
            placeholder="parent@example.com"
          />
        </div>

        {/* Phone Number Field (replacing Password) */}
        <div>
          <label htmlFor="password" className={labelStyles}>
            Phone Number
          </label>
          <input
            type="tel"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={inputStyles}
            required
            disabled={formDisabled}
            placeholder="123-456-7890"
          />
        </div>

        {/* Parent Name Field */}
        <div>
          <label htmlFor="parentName" className={labelStyles}>
            Parent Name
          </label>
          <input
            type="text"
            id="parentName"
            name="parentName"
            value={formData.parentName}
            onChange={handleChange}
            className={inputStyles}
            required
            disabled={formDisabled}
            placeholder="John Doe"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className={
            loading || formDisabled ? disabledButtonStyles : submitButtonStyles
          }
          disabled={loading || formDisabled}
        >
          {loading ? "Creating..." : "Create Parent"}
        </button>

        {/* Error Message */}
        {error && <p className={errorStyles}>{error}</p>}
      </form>

      {/* Success Message */}
      {success && <p className={successStyles}>{success}</p>}
    </div>
  );
}
