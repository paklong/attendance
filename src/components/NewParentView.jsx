import { useState } from "react";
import { createNewParent } from "../utils/firebase";
import {
  containerStyles,
  h2Styles,
  formStyles,
  labelStyles,
  inputStyles,
  submitButtonStyles,
  disabledButtonStyles,
  errorStyles,
  successStyles,
} from "../utils/styles";

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
    <div className={containerStyles}>
      <h2 className={h2Styles}>Create New Parent</h2>
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
            className={inputStyles(formDisabled)}
            required
            disabled={formDisabled}
            placeholder="paklong2556@gmail.com"
          />
        </div>

        {/* Phone Number Field */}
        <div>
          <label htmlFor="password" className={labelStyles}>
            Phone Number (Password)
          </label>
          <input
            type="tel"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={inputStyles(formDisabled)}
            required
            disabled={formDisabled}
            placeholder="5109352858"
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
            className={inputStyles(formDisabled)}
            required
            disabled={formDisabled}
            placeholder="Pak Long Wan"
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
