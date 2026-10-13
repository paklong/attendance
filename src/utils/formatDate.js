const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
});

const shortDateFormatter = new Intl.DateTimeFormat();

// Accepts a Firestore Timestamp (or any { seconds, nanoseconds } object).
export const formatDateTime = (timestamp) => {
  if (!timestamp || !timestamp.seconds) return "N/A";
  return dateTimeFormatter.format(
    new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000),
  );
};

export const formatShortDate = (timestamp) =>
  timestamp ? shortDateFormatter.format(timestamp.toDate()) : "No date";
