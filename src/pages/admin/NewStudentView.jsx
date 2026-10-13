import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import Alert from "../../components/ui/Alert";
import FormCard from "../../components/ui/FormCard";
import FormField from "../../components/ui/FormField";
import SubmitButton from "../../components/ui/SubmitButton";
import useFormSubmission from "../../hooks/useFormSubmission";
import {
  createNewStudent,
  generateStudentId,
} from "../../services/studentService";
import { fieldStyles } from "../../utils/styles";

const INITIAL_FORM = { studentName: "", parentId: "", remainingClasses: "" };

const lastModifiedMillis = (parent) =>
  parent.lastModifiedTime?.toMillis() ?? 0;

export default function NewStudentView() {
  const { data } = useOutletContext();
  const { parents } = data;
  const [formData, setFormData] = useState(INITIAL_FORM);
  const { loading, error, success, disabled, submit } = useFormSubmission({
    cooldownMs: 3000,
  });

  // Most recently modified parents first, so newly created ones are on top.
  const parentOptions = useMemo(
    () =>
      parents
        .filter((parent) => parent.parentName)
        .sort((a, b) => lastModifiedMillis(b) - lastModifiedMillis(a)),
    [parents],
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submit(async () => {
      const newStudent = await createNewStudent(
        generateStudentId(),
        formData.studentName,
        formData.parentId,
        parseInt(formData.remainingClasses) || 0,
      );
      return `Student "${newStudent.studentName}" created successfully with ID: ${newStudent.id}`;
    });
  };

  const parentSelectDisabled = disabled || parents.length === 0;

  return (
    <FormCard title="Create New Student">
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormField label="Student Name" htmlFor="studentName">
          <input
            type="text"
            id="studentName"
            name="studentName"
            value={formData.studentName}
            onChange={handleChange}
            className={fieldStyles(disabled)}
            required
            disabled={disabled}
            placeholder="Winsey Kwan"
          />
        </FormField>

        <FormField label="Select Parent" htmlFor="parentId">
          <select
            id="parentId"
            name="parentId"
            value={formData.parentId}
            onChange={handleChange}
            className={fieldStyles(parentSelectDisabled)}
            disabled={parentSelectDisabled}
          >
            {parents.length === 0 ? (
              <option value="">No parents available</option>
            ) : (
              <>
                <option value="">No parent selected</option>
                {parentOptions.map((parent) => (
                  <option key={parent.id} value={parent.id}>
                    {parent.parentName} ({parent.email})
                  </option>
                ))}
              </>
            )}
          </select>
        </FormField>

        <FormField label="Remaining Classes" htmlFor="remainingClasses">
          <input
            type="number"
            id="remainingClasses"
            name="remainingClasses"
            value={formData.remainingClasses}
            onChange={handleChange}
            className={fieldStyles(disabled)}
            min="0"
            disabled={disabled}
            placeholder="e.g., 12"
          />
        </FormField>

        <SubmitButton disabled={disabled}>
          {loading ? "Creating..." : "Create Student"}
        </SubmitButton>

        <Alert variant="error">{error}</Alert>
        <Alert variant="success">{success}</Alert>
      </form>
    </FormCard>
  );
}
