import { useState } from "react";
import Alert from "../../components/ui/Alert";
import FormCard from "../../components/ui/FormCard";
import FormField from "../../components/ui/FormField";
import SubmitButton from "../../components/ui/SubmitButton";
import useFormSubmission from "../../hooks/useFormSubmission";
import { createNewParent } from "../../services/parentService";
import { fieldStyles } from "../../utils/styles";

const INITIAL_FORM = { email: "", password: "", parentName: "" };

export default function NewParentView() {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const { loading, error, success, disabled, submit } = useFormSubmission({
    cooldownMs: 3000,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submit(async () => {
      const newParent = await createNewParent(
        formData.email,
        formData.password,
        formData.parentName,
      );
      return `Parent "${newParent.parentName}" created successfully with ID: ${newParent.id}`;
    });
  };

  return (
    <FormCard title="Create New Parent">
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormField label="Email" htmlFor="email">
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={fieldStyles(disabled)}
            required
            disabled={disabled}
            placeholder="paklong2556@gamil.com"
          />
        </FormField>

        <FormField label="Password" htmlFor="password">
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={fieldStyles(disabled)}
            required
            disabled={disabled}
            placeholder="5109352857"
          />
        </FormField>

        <FormField label="Parent Name" htmlFor="parentName">
          <input
            type="text"
            id="parentName"
            name="parentName"
            value={formData.parentName}
            onChange={handleChange}
            className={fieldStyles(disabled)}
            required
            disabled={disabled}
            placeholder="Pak Wan :)"
          />
        </FormField>

        <SubmitButton disabled={disabled}>
          {loading ? "Creating..." : "Create Parent"}
        </SubmitButton>

        <Alert variant="error">{error}</Alert>
        <Alert variant="success">{success}</Alert>
      </form>
    </FormCard>
  );
}
