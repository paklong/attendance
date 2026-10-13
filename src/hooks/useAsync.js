import { useEffect, useState } from "react";

// Runs `asyncFn` whenever its identity changes (wrap it in useCallback) and
// ignores results from stale runs.
export default function useAsync(asyncFn) {
  const [state, setState] = useState({
    data: undefined,
    error: null,
    loading: true,
  });

  useEffect(() => {
    let active = true;
    setState((prev) => ({ ...prev, error: null, loading: true }));
    asyncFn().then(
      (data) => active && setState({ data, error: null, loading: false }),
      (error) => {
        console.error(error);
        if (active) setState({ data: undefined, error, loading: false });
      },
    );
    return () => {
      active = false;
    };
  }, [asyncFn]);

  return state;
}
