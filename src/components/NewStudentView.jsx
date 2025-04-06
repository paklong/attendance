import { useState, useEffect } from "react";
import {
  createNewStudent,
  generateStudentId,
  getAllParents,
} from "../utils/firebase";
import {
  containerStyles,
  h2Styles,
  formStyles,
  labelStyles,
  inputStyles,
  selectStyles,
  submitButtonStyles,
  disabledButtonStyles,
  errorStyles,
  successStyles,
  loadingTextStyles,
} from "../utils/styles";

export default function NewStudentView() {
  const [formData, setFormData] = useState({
    studentName: "",
    parentId: "",
    remainingClasses: "",
  });
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [parentsLoading, setParentsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formDisabled, setFormDisabled] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch parents when refreshTrigger changes
  useEffect(() => {
    const fetchParents = async () => {
      setParentsLoading(true);
      try {
        const parentList = await getAllParents();
        const sortedParents = parentList.sort((a, b) => {
          const timeA = a.lastModifiedTime?.toDate() || new Date(0);
          const timeB = b.lastModifiedTime?.toDate() || new Date(0);
          return timeB - timeA;
        });
        setParents(sortedParents);
      } catch (err) {
        setError("Failed to load parents: " + err.message);
      } finally {
        setParentsLoading(false);
      }
    };
    fetchParents();
  }, [refreshTrigger]);

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

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1); // Increment to trigger useEffect
  };

  return (
    <div className={containerStyles}>
      <div className="flex justify-between items-center mb-4">
        <h2 className={h2Styles}>Create New Student</h2>
        <button
          onClick={handleRefresh}
          className={`${submitButtonStyles} flex items-center gap-2 text-xs px-3 py-1`}
          disabled={parentsLoading}
          title="Refresh parent list"
        >
          Refresh Parents
        </button>
      </div>

      {parentsLoading ? (
        <p className={loadingTextStyles}>Loading parents...</p>
      ) : (
        <form onSubmit={handleSubmit} className={formStyles}>
          <div>
            <label htmlFor="studentName" className={labelStyles}>
              Student Name
            </label>
            <input
              type="text"
              id="studentName"
              name="studentName"
              value={formData.studentName}
              onChange={handleChange}
              className={inputStyles(formDisabled)}
              required
              disabled={formDisabled}
              placeholder="Winsey Kwan"
            />
          </div>

          <div>
            <label htmlFor="parentId" className={labelStyles}>
              Select Parent
            </label>
            <select
              id="parentId"
              name="parentId"
              value={formData.parentId}
              onChange={handleChange}
              className={selectStyles}
              disabled={formDisabled || parents.length === 0}
            >
              {parents.length === 0 ? (
                <option value="">No parents available</option>
              ) : (
                <>
                  <option value="">No parent selected</option>
                  {parents
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

          <div>
            <label htmlFor="remainingClasses" className={labelStyles}>
              Remaining Classes
            </label>
            <input
              type="number"
              id="remainingClasses"
              name="remainingClasses"
              value={formData.remainingClasses}
              onChange={handleChange}
              className={inputStyles(formDisabled)}
              min="0"
              disabled={formDisabled}
              placeholder="e.g., 12"
            />
          </div>

          <button
            type="submit"
            className={
              loading || formDisabled
                ? disabledButtonStyles
                : submitButtonStyles
            }
            disabled={loading || formDisabled}
          >
            {loading ? "Creating..." : "Create Student"}
          </button>

          {error && <p className={errorStyles}>{error}</p>}
        </form>
      )}

      {success && <p className={successStyles}>{success}</p>}
    </div>
  );
}
