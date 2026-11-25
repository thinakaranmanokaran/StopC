import { useEffect, useRef, useState } from "react";
import UseAnimations from "react-useanimations";
import copy from "react-useanimations/lib/copy";
import check from "react-useanimations/lib/check";
import { Loader } from "./Loader.jsx";
import { triggerChildAnimations, stopChildAnimations } from "../utils/useAnimationsHover.js";

const SAMPLE_TEXT = "Copy once. Trust forever.";

export function CopySimulator() {
  const [status, setStatus] = useState("idle"); // idle | loading | copied
  const [repeatCount, setRepeatCount] = useState(0);
  const [toastMessage, setToastMessage] = useState(null);
  const lastCopyTimeRef = useRef(0);
  const timerRef = useRef(null);

  const handleSimulateCopy = async () => {
    const now = Date.now();
    const isRepeat = now - lastCopyTimeRef.current < 6000;
    const nextCount = isRepeat ? repeatCount + 1 : 1;
    lastCopyTimeRef.current = now;
    setRepeatCount(nextCount);

    setStatus("loading");

    // Attempt actual clipboard write if available in browser context
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(SAMPLE_TEXT);
      }
    } catch {
      // Graceful fallback for non-secure contexts
    }

    // Brief processing pause to display the TailChase loader
    setTimeout(() => {
      setStatus("copied");

      let message = "";
      if (nextCount === 1) {
        message = `✓ Copied: "${SAMPLE_TEXT}" (26 chars) · StopC confirmed`;
      } else if (nextCount === 2) {
        message = `Duplicate Ctrl+C detected (2x)! StopC Funny Mode: Why copy twice? 😉`;
      } else {
        message = `Repeat #${nextCount}! Relax, StopC already confirmed the clipboard. 🚀`;
      }
      setToastMessage(message);

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setStatus("idle");
        setToastMessage(null);
      }, 3500);
    }, 450);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className="mt-6 p-4 sm:p-5 border border-neutral-200 rounded-md bg-[#f7f7f7]/60">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-0.5">
          <p className="font-mono text-xs uppercase tracking-wider text-neutral-600">
            Interactive Test
          </p>
          <p className="text-[15px] font-medium text-[#161616]">
            Test StopC copy confirmation in your browser
          </p>
        </div>

        <button
          type="button"
          onClick={handleSimulateCopy}
          onMouseEnter={(e) => triggerChildAnimations(e.currentTarget)}
          onMouseLeave={(e) => stopChildAnimations(e.currentTarget)}
          disabled={status === "loading"}
          aria-label="Test copy confirmation"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#161616] bg-white border border-neutral-300 rounded-md shadow-xs hover:border-[#161616] hover:bg-neutral-50 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-60"
        >
          {status === "loading" ? (
            <Loader size="20" speed="1.75" color="#0b57d0" label="Verifying clipboard..." />
          ) : status === "copied" ? (
            <span className="pointer-events-none inline-flex items-center">
              <UseAnimations
                animation={check}
                size={20}
                strokeColor="#0b57d0"
                autoplay={true}
                loop={false}
              />
            </span>
          ) : (
            <span className="pointer-events-none inline-flex items-center">
              <UseAnimations
                animation={copy}
                size={20}
                strokeColor="#161616"
                autoplay={false}
                loop={false}
                interaction="hover-replay"
              />
            </span>
          )}
          <span className="pointer-events-none">{status === "loading" ? "Checking..." : status === "copied" ? "Copied!" : "Try Copy"}</span>
        </button>
      </div>

      <div className="mt-3 flex items-center justify-between bg-white px-3.5 py-2 border border-neutral-200 rounded font-mono text-xs text-neutral-700">
        <code>{SAMPLE_TEXT}</code>
        <span className="text-neutral-500 text-[11px]">Click "Try Copy" to test</span>
      </div>

      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="mt-3.5 flex items-center justify-between gap-3 p-3 bg-[#161616] text-[#fafafa] text-xs font-mono rounded shadow-md border border-neutral-700"
        >
          <span className="truncate">{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-neutral-400 hover:text-white px-1 font-sans text-sm cursor-pointer"
            aria-label="Dismiss notification"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
