import { useCallback, useEffect, useRef, useState } from "react";

// Tracks loading/error/success for a form. After a successful submit the form
// stays disabled for `cooldownMs` to prevent accidental double submissions.
export default function useFormSubmission({ cooldownMs }) {
  const [status, setStatus] = useState({
    loading: false,
    error: null,
    success: null,
  });
  const [disabled, setDisabled] = useState(false);
  const cooldownTimer = useRef();

  useEffect(() => () => clearTimeout(cooldownTimer.current), []);

  const submit = useCallback(
    async (action) => {
      clearTimeout(cooldownTimer.current);
      setStatus({ loading: true, error: null, success: null });
      setDisabled(true);
      try {
        const successMessage = await action();
        setStatus({ loading: false, error: null, success: successMessage });
        cooldownTimer.current = setTimeout(() => setDisabled(false), cooldownMs);
      } catch (error) {
        setStatus({ loading: false, error: error.message, success: null });
        setDisabled(false);
      }
    },
    [cooldownMs],
  );

  return { ...status, disabled, submit };
}
