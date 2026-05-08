import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function OnboardingNudge() {
  return (
    <div className="bg-accent/30 border border-accent rounded-xl p-4 flex items-start gap-3">
      <AlertCircle className="w-5 h-5 text-accent-foreground shrink-0 mt-0.5" />
      <div className="flex-1 space-y-2">
        <p className="text-sm font-medium text-accent-foreground">
          Complete your profile for better insights
        </p>
        <p className="text-xs text-accent-foreground/70">
          Add your LMP, name, and birth date to unlock personalized cycle tracking and symptom analysis.
        </p>
        <Link to="/start">
          <Button variant="outline" size="sm" className="mt-2">
            Complete Profile
          </Button>
        </Link>
      </div>
    </div>
  );
}