import { useCallback, useEffect, useRef, useState } from "react";
import { getAllParents } from "../services/parentService";
import { getAllStudents } from "../services/studentService";

const FETCHERS = {
  students: getAllStudents,
  parents: getAllParents,
};
const KEYS = Object.keys(FETCHERS);

const forEachKey = (value) =>
  Object.fromEntries(KEYS.map((key) => [key, value]));

// Loads the collections the admin dashboard shares between its views.
// `refresh(...keys)` reloads only the given collections; a newer request for
// the same collection always wins over an older one.
export default function useAdminData() {
  const [data, setData] = useState(() => forEachKey([]));
  const [loading, setLoading] = useState(() => forEachKey(true));
  const [loaded, setLoaded] = useState(() => forEachKey(false));
  const [errors, setErrors] = useState(() => forEachKey(null));
  const latestRequest = useRef(forEachKey(0));

  const refreshKey = useCallback(async (key) => {
    const requestId = ++latestRequest.current[key];
    const isLatest = () => latestRequest.current[key] === requestId;

    setLoading((prev) => ({ ...prev, [key]: true }));
    setErrors((prev) => ({ ...prev, [key]: null }));
    try {
      const result = await FETCHERS[key]();
      if (isLatest()) setData((prev) => ({ ...prev, [key]: result }));
    } catch (error) {
      if (isLatest()) {
        setErrors((prev) => ({
          ...prev,
          [key]: error.message || `Failed to fetch ${key}`,
        }));
      }
    } finally {
      if (isLatest()) {
        setLoading((prev) => ({ ...prev, [key]: false }));
        setLoaded((prev) => ({ ...prev, [key]: true }));
      }
    }
  }, []);

  const refresh = useCallback(
    (...keys) => Promise.all(keys.map(refreshKey)),
    [refreshKey],
  );

  useEffect(() => {
    refresh(...KEYS);
  }, [refresh]);

  return {
    data,
    errors,
    isReady: KEYS.every((key) => loaded[key]),
    isRefreshing: KEYS.some((key) => loading[key]),
    refresh,
  };
}
