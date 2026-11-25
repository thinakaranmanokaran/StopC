import { forwardRef } from "react";
import UseAnimations from "react-useanimations";
import arrowRight from "react-useanimations/lib/arrowRight";
import arrowUpRight from "react-useanimations/lib/arrowUpRight";
import arrowLeft from "react-useanimations/lib/arrowLeft";

/**
 * Animated Arrow from useanimations.com/#icons
 * Uses official arrowRight, arrowUpRight, arrowLeft animated Lottie icons.
 */
export const AnimatedArrow = forwardRef(function AnimatedArrow(
  {
    direction = "right", // "right" | "up-right" | "left"
    size = 18,
    strokeColor = "currentColor",
    className = "",
  },
  ref
) {
  const anim =
    direction === "up-right"
      ? arrowUpRight
      : direction === "left"
      ? arrowLeft
      : arrowRight;

  return (
    <span
      ref={ref}
      className={`inline-flex items-center justify-center shrink-0 pointer-events-none ${className}`}
      aria-hidden="true"
    >
      <UseAnimations
        animation={anim}
        size={size}
        strokeColor={strokeColor}
        autoplay={false}
        loop={false}
        interaction="hover-replay"
      />
    </span>
  );
});
