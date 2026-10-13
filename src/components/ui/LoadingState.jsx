import {
  loadingContainerStyles,
  loadingTextStyles,
  spinnerStyles,
} from "../../utils/styles";

export default function LoadingState({ message = "Loading..." }) {
  return (
    <div className={loadingContainerStyles} role="status">
      <p className={loadingTextStyles}>{message}</p>
      <div className={spinnerStyles} />
    </div>
  );
}
