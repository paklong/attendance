import { useCallback, useEffect, useState } from "react";
import { getAttendancePage } from "../services/attendanceService";

// Cursor-based Previous/Next paging over attendance records, newest first.
// Pages already fetched are kept, so going back costs no extra reads.
// Remount (e.g. via `key`) to start over when `dateRange` changes.
export default function useAttendancePages(dateRange) {
  const [pages, setPages] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadPage = useCallback(
    async (index, cursor) => {
      setLoading(true);
      setError(null);
      try {
        const page = await getAttendancePage({ cursor, dateRange });
        setPages((prev) => [...prev.slice(0, index), page]);
        setPageIndex(index);
      } catch (err) {
        console.error(err);
        setError(err);
      } finally {
        setLoading(false);
      }
    },
    [dateRange],
  );

  useEffect(() => {
    loadPage(0, null);
  }, [loadPage]);

  const currentPage = pages[pageIndex];

  const goNext = () => {
    if (!currentPage?.hasMore || loading) return;
    if (pages[pageIndex + 1]) setPageIndex(pageIndex + 1);
    else loadPage(pageIndex + 1, currentPage.nextCursor);
  };

  const goPrev = () => setPageIndex((index) => Math.max(0, index - 1));

  return {
    records: currentPage?.records ?? [],
    pageIndex,
    hasPrev: pageIndex > 0,
    hasNext: Boolean(currentPage?.hasMore),
    loading,
    error,
    goNext,
    goPrev,
  };
}
