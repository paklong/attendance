export const containerStyles = "p-4 max-w-md mx-auto"; // Used in views
export const adminContainerStyles = "container mx-auto p-4"; // Used in AdminPage
export const headerStyles = "flex items-center justify-between mb-4";
export const titleStyles = "text-xl font-bold text-gray-800";
export const h2Styles = "text-lg font-semibold text-gray-800 mb-4";
export const formStyles = "space-y-4";
export const labelStyles = "block text-sm font-medium text-gray-700";
export const inputStylesBase =
  "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
export const inputStyles = (disabled) =>
  `${inputStylesBase} ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}`;
export const selectStyles = inputStylesBase; // Single-select doesn’t need extra height
export const buttonBaseStyles =
  "px-4 py-2 text-sm text-white rounded-md transition duration-150 focus:outline-none focus:ring-2";
export const submitButtonStyles = `${buttonBaseStyles} bg-blue-600 hover:bg-blue-700 focus:ring-blue-500`;
export const disabledButtonStyles = `${buttonBaseStyles} bg-gray-400 cursor-not-allowed`;
export const navButtonStyles = `${buttonBaseStyles.replace(
  "px-4 py-2",
  "px-3 py-1",
)} bg-gray-600 hover:bg-gray-700 focus:ring-gray-500 text-xs flex justify-center items-center`;
export const navButtonStylesEdit = `${buttonBaseStyles.replace(
  "px-4 py-2",
  "px-3 py-1",
)} bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-xs flex justify-center items-center`;
export const signOutButtonStyles = `${buttonBaseStyles.replace(
  "px-4 py-2",
  "px-3 py-1",
)} bg-red-600 hover:bg-red-700 focus:ring-red-500 text-xs flex justify-center items-center`;
export const navStyles = "mb-4 flex space-x-2";
export const loadingContainerStyles = "text-center py-4";
export const loadingTextStyles = "text-gray-600 text-sm";
export const spinnerStyles =
  "inline-block w-5 h-5 border-4 border-blue-500 border-t-transparent rounded-full animate-spin";
export const errorStyles = "text-red-600 text-sm mt-2";
export const successStyles =
  "text-green-600 text-base font-semibold mt-4 bg-green-100 p-3 rounded-md";
export const errorHeaderStyles = "text-red-600 font-semibold text-sm";
export const errorTextStyles = "text-red-600 text-sm";

export const TABLE_CLASSES =
  "min-w-full bg-white border border-gray-200 rounded-lg shadow-sm";
export const TH_CLASSES =
  "px-2 py-3 text-left text-xs font-semibold text-gray-700 border-b border-gray-400";
export const TD_CLASSES =
  "px-2 py-1 text-xs text-gray-800 border-b border-gray-200";
("px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer transition duration-150");
