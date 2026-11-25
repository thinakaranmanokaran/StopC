/**
 * Utility to trigger react-useanimations when hovering a parent container
 * (such as a CTA button, interactive list item, or card).
 *
 * It invokes the icon's `onMouseEnter` / `onMouseLeave` directly via React's internal
 * props without dispatching bubbling DOM events, preventing event recursion and main thread lockup.
 */

let isDispatching = false;

export function triggerChildAnimations(container) {
  if (!container || isDispatching || typeof window === "undefined") return;
  isDispatching = true;
  try {
    const icons = container.querySelectorAll("[data-useanimations]");
    icons.forEach((el) => {
      const reactKey = Object.keys(el).find((k) => k.startsWith("__reactProps$"));
      if (reactKey && typeof el[reactKey]?.onMouseEnter === "function") {
        el[reactKey].onMouseEnter({ defaultPrevented: false });
      }
    });
  } catch {
    // ignore
  } finally {
    isDispatching = false;
  }
}

export function stopChildAnimations(container) {
  if (!container || isDispatching || typeof window === "undefined") return;
  isDispatching = true;
  try {
    const icons = container.querySelectorAll("[data-useanimations]");
    icons.forEach((el) => {
      const reactKey = Object.keys(el).find((k) => k.startsWith("__reactProps$"));
      if (reactKey && typeof el[reactKey]?.onMouseLeave === "function") {
        el[reactKey].onMouseLeave({ defaultPrevented: false });
      }
    });
  } catch {
    // ignore
  } finally {
    isDispatching = false;
  }
}
