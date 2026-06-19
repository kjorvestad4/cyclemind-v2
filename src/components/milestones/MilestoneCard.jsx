import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, PenLine, FileText, Sparkles, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const PHASE_COLORS = {
  pregnancy: {
    dot: "bg-pink-400",
    line: "bg-pink-200 dark:bg-pink-800/40",
    ring: "ring-pink-300 dark:ring-pink-600/50",
    bg: "bg-pink-50/60 dark:bg-pink-950/10",
    badge: "bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300",
  },
  postpartum: {
    dot: "bg-purple-400",
    line: "bg-purple-200 dark:bg-purple-800/40",
    ring: "ring-purple-300 dark:ring-purple-600/50",
    bg: "bg-purple-50/60 dark:bg-purple-950/10",
    badge: "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300",
  },
};

export default function MilestoneCard({
  milestone,
  record,
  isCurrent,
  isPremiumUser,
  onToggleExperienced,
  onSaveNote,
  onLogFeelings,
  onAskLuna,
}) {
  const [showNote, setShowNote] = useState(false);
  const [note, setNote] = useState(record?.user_note || "");
  const [includeInReport, setIncludeInReport] = useState(record?.include_in_report ?? true);

  const isExperienced = record?.experienced;
  const colors = PHASE_COLORS[milestone.phase] || PHASE_COLORS.pregnancy;

  const handleSaveNote = () => {
    onSaveNote(milestone.id, { user_note: note, include_in_report: includeInReport });
    setShowNote(false);
  };

  const handleAskLuna = () => {
    if (milestone.premium && !isPremiumUser) {
      onAskLuna(milestone, true);
    } else {
      onAskLuna(milestone, false);
    }
  };

  return (
    <div className="relative flex gap-3 sm:gap-4">
      {/* Timeline dot + connector */}
      <div className="flex flex-col items-center pt-1.5 shrink-0">
        <div
          className={`w-4 h-4 rounded-full transition-all ring-4 ${
            isExperienced ? "bg-emerald-400 ring-emerald-100 dark:ring-emerald-900/30" : colors.dot
          } ${isCurrent ? colors.ring + " ring-4" : "ring-background"}`}
        />
        <div className={`w-0.5 flex-1 ${colors.line} min-h-[24px]`} />
      </div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex-1 rounded-2xl border p-4 mb-4 transition-all ${
          isCurrent ? `border-primary/40 ${colors.bg} ring-2 ${colors.ring}` : `border-border/50 ${colors.bg}`
        } ${isExperienced ? "opacity-90" : ""}`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="text-3xl leading-none">{milestone.emoji}</span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-foreground leading-tight">{milestone.title}</h3>
                {milestone.premium && (
                  <span className={`inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded-full font-semibold ${colors.badge}`}>
                    <Crown className="w-2.5 h-2.5" /> Premium
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{milestone.timing}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            {isCurrent && (
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-primary text-primary-foreground font-semibold whitespace-nowrap">
                You are here
              </span>
            )}
            {isExperienced && (
              <span className="inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-semibold whitespace-nowrap">
                <Check className="w-3 h-3" /> Experienced
              </span>
            )}
          </div>
        </div>

        {/* Blurb */}
        <p className="text-sm text-foreground/80 leading-relaxed mt-3">{milestone.blurb}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {milestone.tags.map(tag => (
            <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              {tag}
            </span>
          ))}
        </div>

        {/* Existing note display */}
        {record?.user_note && !showNote && (
          <div className="mt-3 p-3 rounded-xl bg-muted/40 border border-border/30">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Your Note for Doctor
            </p>
            <p className="text-xs text-foreground/80 leading-relaxed">{record.user_note}</p>
            {record.include_in_report && (
              <p className="text-[10px] text-primary mt-1.5 flex items-center gap-1">
                <Check className="w-3 h-3" /> Included in clinical report
              </p>
            )}
          </div>
        )}

        {/* Note editor */}
        <AnimatePresence>
          {showNote && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 space-y-2 overflow-hidden"
            >
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Write a note for your doctor or to include in your clinical report…"
                className="min-h-[80px] text-sm resize-none"
              />
              <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeInReport}
                  onChange={(e) => setIncludeInReport(e.target.checked)}
                  className="w-3.5 h-3.5 accent-primary"
                />
                Include in clinical PDF report
              </label>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setShowNote(false)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSaveNote} className="gap-1.5">
                  <Check className="w-3.5 h-3.5" /> Save Note
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2 mt-4">
          <Button size="sm" onClick={() => onLogFeelings(milestone)} className="gap-1.5">
            <PenLine className="w-3.5 h-3.5" /> Log how I'm feeling
          </Button>
          <Button size="sm" variant="outline" onClick={() => setShowNote(!showNote)} className="gap-1.5">
            <FileText className="w-3.5 h-3.5" />
            {record?.user_note ? "Edit note" : "Add note for doctor"}
          </Button>
          <Button size="sm" variant="ghost" onClick={handleAskLuna} className="gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Ask Luna
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onToggleExperienced(milestone.id, !isExperienced)}
            className="gap-1.5 ml-auto"
          >
            <Check className={`w-3.5 h-3.5 ${isExperienced ? "text-emerald-500" : ""}`} />
            {isExperienced ? "Experienced" : "Mark experienced"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}