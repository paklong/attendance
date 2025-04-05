// Format Firestore timestamp to readable date
const formatDate = (timestamp) => {
  if (!timestamp || !timestamp.seconds) return "N/A";
  const date = new Date(
    timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000,
  );
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export default formatDate;
