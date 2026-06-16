import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

const CYCLE_TYPES = [
  { id: "menstrual", label: "🌙 Menstrual / PMDD" },
  { id: "pregnancy", label: "🤰 Pregnancy" },
  { id: "postpartum", label: "🍼 Postpartum" },
  { id: "perimenopause", label: "🔦 Perimenopause" },
  { id: "menopause", label: "🔥 Menopause" },
];

export default function NewCycleModal({ onClose }) {
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState("");
  const [cycleLength, setCycleLength] = useState(28);
  const [cycleType, setCycleType] = useState("menstrual");
  const [lmp, setLmp] = useState("");
  const [pregnancyWeek, setPregnancyWeek] = useState("");
  const [saving, setSaving] = useState(false);

  const isPregnancy = cycleType === "pregnancy";

  const handleSave = async () => {
    if (!startDate) { toast.error("Please select a start date"); return; }
    setSaving(true);
    try {
      await base44.entities.Cycle.create({
        start_date: startDate,
        end_date: endDate || undefined,
        cycle_length: cycleLength || 28,
        cycle_type: cycleType,
        last_menstrual_period: isPregnancy ? (lmp || startDate) : startDate,
        pregnancy_week: isPregnancy && pregnancyWeek ? parseInt(pregnancyWeek) : undefined,
      });
      toast.success("New cycle entry added!");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save cycle. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg bg-background rounded-t-3xl border-t border-border shadow-2xl p-5 space-y-5 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif text-lg font-semibold">Log New Period</h3>
            <p className="text-xs text-muted-foreground">Record the start of a new cycle</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-muted hover:bg-muted/80 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Cycle Type */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Cycle Type</Label>
            <div className="grid grid-cols-1 gap-1.5">
              {CYCLE_TYPES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setCycleType(t.id)}
                  className={`text-left px-3 py-2 rounded-xl border text-sm transition-all ${
                    cycleType === t.id
                      ? "border-primary bg-primary/10 font-semibold text-primary"
                      : "border-border bg-background text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Start Date */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">
              {isPregnancy ? "Cycle / Delivery Start Date" : "Period Start Date"}
            </Label>
            <Input
              type="date"
              value={startDate}
              max={format(new Date(), "yyyy-MM-dd")}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-10"
            />
          </div>

          {/* End Date */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">End Date <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <Input
              type="date"
              value={endDate}
              min={startDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-10"
            />
          </div>

          {/* Cycle Length — not shown for pregnancy */}
          {!isPregnancy && (
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Cycle Length (days)</Label>
              <Input
                type="number"
                min={20}
                max={60}
                value={cycleLength}
                onChange={(e) => setCycleLength(parseInt(e.target.value) || 28)}
                className="h-10"
              />
            </div>
          )}

          {/* Pregnancy fields */}
          {isPregnancy && (
            <>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Last Menstrual Period (LMP)</Label>
                <Input
                  type="date"
                  value={lmp}
                  max={format(new Date(), "yyyy-MM-dd")}
                  onChange={(e) => setLmp(e.target.value)}
                  className="h-10"
                />
                <p className="text-[11px] text-muted-foreground">Used to calculate estimated due date</p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Current Pregnancy Week <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <Input
                  type="number"
                  min={1}
                  max={42}
                  placeholder="e.g. 12"
                  value={pregnancyWeek}
                  onChange={(e) => setPregnancyWeek(e.target.value)}
                  className="h-10"
                />
              </div>
            </>
          )}
        </div>

        <Button
          onClick={handleSave}
          disabled={saving || !startDate}
          className="w-full h-12 rounded-2xl font-semibold text-base gap-2"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
          Save Cycle Entry
        </Button>
      </div>
    </div>
  );
}