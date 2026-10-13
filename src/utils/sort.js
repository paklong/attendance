export const compareStudentNames = (a, b) =>
  (a.studentName ?? "").localeCompare(b.studentName ?? "");

export const sortByStudentName = (students) =>
  [...students].sort(compareStudentNames);
