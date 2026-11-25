import { TailChase } from 'ldrs/react';
import 'ldrs/react/TailChase.css';

/**
 * StopC Loader using TailChase from uiball ldrs:
 * https://uiball.com/ldrs/?ref=toools
 */
export function Loader({
  size = "40",
  speed = "1.75",
  color = "black",
  className = "",
  label = "Loading",
}) {
  return (
    <div
      className={`inline-flex items-center justify-center ${className}`}
      role="status"
      aria-label={label}
    >
      <TailChase size={size} speed={speed} color={color} />
      <span className="sr-only">{label}</span>
    </div>
  );
}
