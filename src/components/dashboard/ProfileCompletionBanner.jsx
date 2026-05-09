import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, Sparkles } from "lucide-react";

export default function ProfileCompletionBanner({ user, latestCycle }) {
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const missingName = !user?.display_name && !user?.full_name;
  const missingLmp = !latestCycle?.last_menstrual_period && !latestCycle?.start_date;
  const missingDob = !user?.date_of_birth;

  if (!missingName && !missingLmp && !missingDob) return null;

  const missing = [];
  if (missingLmp) missing.push("LMP");
  if (missingName) missing.push("name");
  if (missingDob) missing.push("birth date");

  return (
    <div className="relative rounded-2xl border border-teal-200 bg-teal-50 dark:border-teal-800 dark:bg-teal-950/30 p-4">
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-3 right-3 text-teal-400 hover:text-teal-600 dark:hover:text-teal-300 transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-start gap-3 pr-6">
        <div className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-900 flex items-center justify-center shrink-0 mt-0.5">
          <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-teal-800 dark:text-teal-200">
            Complete your profile for better insights
          </p>
          <p className="text-xs text-teal-600 dark:text-teal-400 mt-0.5 leading-relaxed">
            Add your {missing.join(", ")} to unlock personalized cycle tracking and symptom analysis.
          </p>
          <button
            onClick={() => navigate("/profile")}
            className="mt-2.5 text-xs font-semibold text-teal-700 dark:text-teal-300 underline underline-offset-2 hover:text-teal-900 dark:hover:text-teal-100 transition-colors"
          >
            Complete Profile →
          </button>
        </div>
      </div>
    </div>
  );
}