import { AlertTriangle, Info, CheckCircle, TrendingUp, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const INSIGHT_STYLES = {
  alert: {
    border: "border-red-200 dark:border-red-900",
    bg: "bg-red-50 dark:bg-red-950/40",
    iconBg: "bg-red-100 dark:bg-red-900",
    iconColor: "text-red-500",
  },
  warning: {
    border: "border-orange-200 dark:border-orange-900",
    bg: "bg-orange-50 dark:bg-orange-950/40",
    iconBg: "bg-orange-100 dark:bg-orange-900",
    iconColor: "text-orange-500",
  },
  info: {
    border: "border-border/50",
    bg: "bg-card",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
  },
};

const ACTION_SUGGESTIONS = {
  "PMDD pattern": "Share with your provider",
  "PHQ-9": "Complete PHQ-9 on Log page",
  "GAD-7": "Complete GAD-7 on Log page",
  "Cycle length": "Keep tracking consistently",
  "PMDD pattern detected": "Consider sharing insights",
  "moderate-to-severe": "Discuss with provider",
  "High variability": "Track consistently",
  "No strong PMDD": "Continue logging",
};

export default function InsightCard({ insight }) {
  const style = INSIGHT_STYLES[insight.type] || INSIGHT_STYLES.info;
  
  const getIcon = () => {
    switch (insight.type) {
      case "alert": return <AlertTriangle className="w-4 h-4" />;
      case "warning": return <TrendingUp className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getActionSuggestion = () => {
    for (const [keyword, action] of Object.entries(ACTION_SUGGESTIONS)) {
      if (insight.title.toLowerCase().includes(keyword.toLowerCase())) {
        return action;
      }
    }
    return null;
  };

  const actionSuggestion = getActionSuggestion();

  return (
    <div className={`rounded-2xl border p-4 flex gap-3 items-start ${style.border} ${style.bg}`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${style.iconBg}`}>
        <span className="text-lg">{insight.emoji}</span>
      </div>
      <div className="flex-1 space-y-1">
        <p className="text-sm font-semibold text-foreground">{insight.title}</p>
        <p className="text-xs text-muted-foreground leading-relaxed">{insight.detail}</p>
        {actionSuggestion && (
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-black/5">
            <span className="text-[10px] text-muted-foreground font-medium">Suggested action:</span>
            <span className="text-[10px] text-primary font-semibold">{actionSuggestion}</span>
          </div>
        )}
      </div>
    </div>
  );
}