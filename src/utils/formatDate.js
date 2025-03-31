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
  });
};

export default formatDate;
