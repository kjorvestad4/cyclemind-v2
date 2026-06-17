import { format } from "date-fns";
import { X, Calendar, Clock, Activity } from "lucide-react";

const CYCLE_TYPE_LABELS = {
  menstrual: "🌙 Menstrual / PMDD",
  pregnancy: "🤰 Pregnancy",
  postpartum: "🍼 Postpartum",
  perimenopause: "🔦 Perimenopause",
  menopause: "🔥 Menopause",
};

function formatDate(str) {
  if (!str) return "—";
  const [y, m, d] = str.split("-").map(Number);
  return format(new Date(y, m - 1, d), "MMM d, yyyy");
}

export default function CycleDetailModal({ cycle, label, onClose }) {
  if (!cycle) return null;

  const rows = [
    { icon: Calendar, label: "Start Date", value: formatDate(cycle.start_date) },
    { icon: Calendar, label: "End Date", value: formatDate(cycle.end_date) },
    { icon: Clock, label: "Cycle Length", value: cycle.cycle_length ? `${cycle.cycle_length} days` : "—" },
    { icon: Activity, label: "Type", value: CYCLE_TYPE_LABELS[cycle.cycle_type] || cycle.cycle_type || "Menstrual" },
  ];

  if (cycle.cycle_type === "pregnancy") {
    rows.push(
      { icon: Calendar, label: "Last Menstrual Period", value: formatDate(cycle.last_menstrual_period) },
      { icon: Calendar, label: "Estimated Due Date", value: formatDate(cycle.estimated_due_date) },
      { icon: Activity, label: "Pregnancy Week", value: cycle.pregnancy_week ? `Week ${cycle.pregnancy_week}` : "—" },
    );
  }

  if (cycle.hrt_type) {
    rows.push({ icon: Activity, label: "HRT Type", value: cycle.hrt_type });
  }

  if (cycle.notes) {
    rows.push({ icon: Activity, label: "Notes", value: cycle.notes });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg bg-background rounded-3xl border border-border shadow-2xl p-5 space-y-4 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif text-lg font-semibold">Cycle Summary</h3>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-muted hover:bg-muted/80 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2">
          {rows.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center justify-between py-2.5 border-b border-border/40 last:border-0">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </div>
              <span className="text-sm font-medium text-foreground text-right max-w-[55%]">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}