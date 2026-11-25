import { useRouter } from "../router.jsx";
import { AnimatedArrow } from "./AnimatedArrow.jsx";
import { triggerChildAnimations, stopChildAnimations } from "../utils/useAnimationsHover.js";

const VARIANTS = {
  primary:
    "bg-[#161616] text-[#fafafa] border border-[#161616] hover:bg-neutral-800 hover:border-neutral-800 active:scale-[0.98] shadow-xs",
  secondary:
    "bg-white text-[#161616] border border-neutral-300 hover:border-[#161616] hover:bg-neutral-50 active:scale-[0.98] shadow-xs",
  accent:
    "bg-[#0b57d0] text-white border border-[#0b57d0] hover:bg-[#0947a8] hover:border-[#0947a8] active:scale-[0.98] shadow-xs",
  outline:
    "bg-transparent text-[#161616] border border-neutral-300 hover:border-neutral-900 hover:bg-white active:scale-[0.98]",
};

const SIZES = {
  sm: "px-3.5 py-1.5 text-xs font-medium rounded-md",
  md: "px-4 py-2 text-sm font-medium rounded-md",
  lg: "px-5 py-3 text-[15px] sm:text-[16px] font-medium rounded-md",
};

export function ActionButton({
  children,
  href,
  onClick,
  download = false,
  variant = "secondary",
  size = "md",
  icon = null,
  arrow = null, // "right" | "up-right" | "left"
  className = "",
  disabled = false,
  target,
  rel,
  ariaLabel,
  type = "button",
}) {
  const { navigate } = useRouter();

  const baseStyles =
    "group inline-flex items-center justify-center gap-2 transition-all duration-150 cursor-pointer no-underline focus-visible:outline-2 focus-visible:outline-[#0b57d0] focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none select-none text-center";
  const variantStyles = VARIANTS[variant] || VARIANTS.secondary;
  const sizeStyles = SIZES[size] || SIZES.md;
  const combinedClasses = `${baseStyles} ${variantStyles} ${sizeStyles} ${className}`.trim();

  const arrowColor = variant === "primary" ? "#fafafa" : "#161616";
  const arrowSize = size === "sm" ? 14 : size === "lg" ? 18 : 16;

  const handleMouseEnter = (e) => {
    triggerChildAnimations(e.currentTarget);
  };

  const handleMouseLeave = (e) => {
    stopChildAnimations(e.currentTarget);
  };

  const renderContent = () => (
    <>
      {arrow === "left" && (
        <AnimatedArrow
          direction="left"
          size={arrowSize}
          strokeColor={arrowColor}
        />
      )}
      {icon && (
        <span className="inline-flex items-center justify-center pointer-events-none shrink-0">
          {icon}
        </span>
      )}
      <span>{children}</span>
      {arrow === "right" && (
        <AnimatedArrow
          direction="right"
          size={arrowSize}
          strokeColor={arrowColor}
        />
      )}
      {arrow === "up-right" && (
        <AnimatedArrow
          direction="up-right"
          size={arrowSize}
          strokeColor={arrowColor}
        />
      )}
    </>
  );

  if (href && !disabled) {
    const isFileDownload = Boolean(download) || /\.(exe|msi|zip|tar\.gz)$/i.test(href);
    const isInternal = href.startsWith("/") && !href.startsWith("//") && !isFileDownload;
    const isExternal = href.startsWith("http") || href.startsWith("mailto:");

    const handleClick = (e) => {
      if (onClick) onClick(e);
      if (
        isInternal &&
        !e.defaultPrevented &&
        e.button === 0 &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.shiftKey &&
        !e.altKey
      ) {
        navigate(href, e);
      }
    };

    return (
      <a
        href={href}
        download={download ? (typeof download === "string" ? download : true) : undefined}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        target={target || (isExternal ? "_blank" : undefined)}
        rel={rel || (isExternal ? "noopener noreferrer" : undefined)}
        aria-label={ariaLabel}
        className={combinedClasses}
        role="button"
      >
        {renderContent()}
      </a>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      disabled={disabled}
      aria-label={ariaLabel}
      className={combinedClasses}
    >
      {renderContent()}
    </button>
  );
}
