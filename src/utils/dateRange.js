// "YYYY-MM-DD" in the browser's time zone, matching <input type="date">.
export const toLocalDateKey = (date) => date.toLocaleDateString("en-CA");

export const dayRangeFromKey = (dateKey) => {
  const [year, month, day] = dateKey.split("-").map(Number);
  return {
    start: new Date(year, month - 1, day),
    end: new Date(year, month - 1, day + 1),
  };
};
