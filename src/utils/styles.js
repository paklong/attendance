// Layout
export const adminContainerStyles = "container mx-auto p-4";
export const headerStyles = "flex items-center justify-between mb-4";
export const titleStyles = "text-xl font-bold text-gray-800";
export const h2Styles = "text-lg font-semibold text-gray-800 mb-4";

// Form controls
const inputStylesBase =
  "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
export const selectStyles = inputStylesBase;
export const fieldStyles = (disabled) =>
  `w-full p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
    disabled ? "bg-gray-100 cursor-not-allowed" : ""
  }`;
export const searchInputStyles =
  "w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200";
export const checkboxStyles =
  "h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded";

// Buttons
const smallButtonBase =
  "px-3 py-1 text-sm text-white rounded-md transition duration-150 focus:outline-none focus:ring-2 text-xs flex justify-center items-center";
export const navButtonStyles = `${smallButtonBase} bg-gray-600 hover:bg-gray-700 focus:ring-gray-500`;
export const navButtonStylesEdit = `${smallButtonBase} bg-blue-600 hover:bg-blue-700 focus:ring-blue-500`;
export const signOutButtonStyles = `${smallButtonBase} bg-red-600 hover:bg-red-700 focus:ring-red-500`;
export const navStyles = "mb-4 flex space-x-2";

// Feedback
export const loadingContainerStyles = "text-center py-4";
export const loadingTextStyles = "text-gray-600 text-sm";
export const spinnerStyles =
  "inline-block w-5 h-5 border-4 border-blue-500 border-t-transparent rounded-full animate-spin";
export const smallSpinnerStyles =
  "inline-block w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin";
export const errorHeaderStyles = "text-red-600 font-semibold text-sm";
export const errorTextStyles = "text-red-600 text-sm";
export const emptyTextStyles = "text-gray-500 text-center mt-6";

// Tables
export const TABLE_CLASSES =
  "min-w-full bg-white border border-gray-200 rounded-lg shadow-sm";
export const TH_CLASSES =
  "px-2 py-3 text-left text-xs font-semibold text-gray-700 border-b border-gray-400";
export const TD_CLASSES =
  "px-2 py-1 text-xs text-gray-800 border-b border-gray-200";

// Artworks
export const artworkGridStyles =
  "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4";
export const artworkCardStyles =
  "bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden relative p-2 flex flex-col items-center";
export const artworkImageStyles = "w-full h-32 object-contain mb-1 bg-gray-100";
