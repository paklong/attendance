export const matchesSearch = (value, searchTerm) =>
  (value ?? "").toLowerCase().includes(searchTerm.trim().toLowerCase());
