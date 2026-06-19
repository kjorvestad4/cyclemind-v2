import { useState, useRef, useEffect } from "react";
import { HelpCircle } from "lucide-react";

/**
 * Small info tooltip with friendly educational text.
 * Renders an icon that toggles a popover.
 */
export default function InfoTooltip({ text, label }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative inline-flex">
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="text-muted-foreground hover:text-primary transition-colors"
        aria-label={label || "More info"}
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>
      {open && (
        <div className="absolute z-50 top-full left-1/2 -translate-x-1/2 mt-1 w-56 p-3 rounded-xl bg-popover border border-border shadow-xl text-xs text-popover-foreground leading-relaxed">
          {text}
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-popover border-l border-t border-border" />
        </div>
      )}
    </div>
  );
}