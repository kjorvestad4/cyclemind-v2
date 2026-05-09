import { Crown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function UpgradeBanner({ feature, onDismiss }) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  return (
    <div className="relative bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-2xl p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <Crown className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">
              {feature ? `${feature} is Premium-only` : "Unlock Premium Features"}
            </p>
            <p className="text-xs text-muted-foreground">
              {feature 
                ? `Upgrade to Premium to access ${feature}.`
                : "Upgrade to unlock all tracking modes, clinical scales, advanced insights, and more."}
            </p>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="flex gap-2">
        <Button
          onClick={() => window.location.href = '/billing'}
          className="flex-1 h-9 text-sm font-semibold rounded-lg gap-1.5"
        >
          <Crown className="w-4 h-4" />
          Upgrade Now
        </Button>
        <Button
          variant="outline"
          onClick={handleDismiss}
          className="flex-1 h-9 text-sm font-medium rounded-lg"
        >
          Dismiss
        </Button>
      </div>
    </div>
  );
}