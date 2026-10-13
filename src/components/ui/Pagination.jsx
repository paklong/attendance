const buttonStyles =
  "px-3 py-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-200";

export default function Pagination({
  pageIndex,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  disabled = false,
}) {
  if (!hasPrev && !hasNext) return null;

  return (
    <nav
      className="flex items-center justify-center gap-3 mt-4 text-sm"
      aria-label="Pagination"
    >
      <button
        type="button"
        onClick={onPrev}
        disabled={disabled || !hasPrev}
        className={buttonStyles}
      >
        Previous
      </button>
      <span className="text-gray-600">Page {pageIndex + 1}</span>
      <button
        type="button"
        onClick={onNext}
        disabled={disabled || !hasNext}
        className={buttonStyles}
      >
        Next
      </button>
    </nav>
  );
}
