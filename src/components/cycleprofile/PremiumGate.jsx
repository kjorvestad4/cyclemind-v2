import { useNavigate } from "react-router-dom";
import { Lock, Crown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Locked state for the Advanced PMDD tab.
 * Shows a clear upgrade CTA.
 */
export default function PremiumGate({ feature }) {
  const navigate = useNavigate();

  return (
    <div className="rounded-2xl border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5 p-6 text-center space-y-3">
      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
        <Lock className="w-7 h-7 text-primary" />
      </div>
      <div>
        <p className="text-sm font-bold text-foreground flex items-center justify-center gap-1.5">
          <Crown className="w-4 h-4 text-amber-500" />
          Premium / Premium+ Only
        </p>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed max-w-xs mx-auto">
          {feature || "Unlock luteal phase customization, the full visual editor, PMDD window tracking, and per-cycle overrides."}
        </p>
      </div>
      <Button
        onClick={() => navigate("/billing")}
        className="gap-2 rounded-xl"
        size="sm"
      >
        Upgrade to Unlock
        <ArrowRight className="w-4 h-4" />
      </Button>
    </div>
  );
}