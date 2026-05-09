import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, Sparkles } from "lucide-react";

export default function ProfileCompletionBanner({ user, latestCycle }) {
  const [dismissed, setDismissed] = useState(false);
  const navigate = useNavigate();

  if (dismissed) return null;

  const missingLmp = !latestCycle?.last_menstrual_period && !latestCycle?.start_date;
  const missingName = !user?.full_name && !user?.display_name;
  const missingDob = !user?.date_of_birth;

  if (!missingLmp && !missingName && !missingDob) return null;

  return (
    <div className="relative rounded-2xl border border-teal-200 bg-teal-50 dark:border-teal-800 dark:bg-teal-950/30 px-4 py-3.5">
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-3 right-3 text-teal-400 hover:text-teal-600 dark:hover:text-teal-300 transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-start gap-3 pr-6">
        <div className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center shrink-0 mt-0.5">
          <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-teal-900 dark:text-teal-100">
            Complete your profile for better insights
          </p>
          <p className="text-xs text-teal-700 dark:text-teal-300 mt-0.5 leading-relaxed">
            Add your {[missingLmp && "LMP", missingName && "name", missingDob && "birth date"].filter(Boolean).join(", ")} to unlock personalized cycle tracking and symptom analysis.
          </p>
          <button
            onClick={() => navigate("/profile")}
            className="mt-2.5 text-xs font-semibold text-teal-700 dark:text-teal-300 bg-teal-100 dark:bg-teal-900/60 hover:bg-teal-200 dark:hover:bg-teal-800/60 px-3 py-1.5 rounded-lg transition-colors"
          >
            Complete Profile →
          </button>
        </div>
      </div>
    </div>
  );
}