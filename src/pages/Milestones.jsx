import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format, differenceInDays } from "date-fns";
import { ArrowLeft, FileDown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { MILESTONES, getCurrentMilestoneId } from "@/lib/milestones";
import { getUserTier, TIERS } from "@/lib/freemium";
import MilestoneCard from "@/components/milestones/MilestoneCard";

export default function Milestones() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: cycles = [] } = useQuery({
    queryKey: ["cycles"],
    queryFn: async () => {
      const u = await base44.auth.me();
      return base44.entities.Cycle.filter({ created_by: u.email }, "-start_date", 50);
    },
  });

  const { data: userMilestones = [] } = useQuery({
    queryKey: ["userMilestones"],
    queryFn: async () => {
      const u = await base44.auth.me();
      return base44.entities.UserMilestone.filter({ created_by: u.email });
    },
  });

  const parseLocal = (str) => {
    if (!str) return null;
    const [y, m, d] = str.split("-").map(Number);
    return new Date(y, m - 1, d);
  };

  const latestCycle = cycles.length > 0
    ? [...cycles].sort((a, b) => parseLocal(b.start_date) - parseLocal(a.start_date))[0]
    : null;

  const cycleType = latestCycle?.cycle_type || "menstrual";

  const pregnancyWeek =
    cycleType === "pregnancy" && latestCycle
      ? latestCycle.pregnancy_week ||
        (latestCycle.last_menstrual_period
          ? Math.floor(differenceInDays(new Date(), parseLocal(latestCycle.last_menstrual_period)) / 7)
          : null)
      : null;

  const postpartumDay =
    cycleType === "postpartum" && latestCycle?.start_date
      ? Math.max(1, differenceInDays(new Date(), parseLocal(latestCycle.start_date)) + 1)
      : null;

  const activePhase =
    cycleType === "pregnancy" ? "pregnancy" : cycleType === "postpartum" ? "postpartum" : null;
  const currentMilestoneId = activePhase
    ? getCurrentMilestoneId(activePhase, pregnancyWeek, postpartumDay)
    : null;

  const userTier = getUserTier(user);
  const isPremiumUser = userTier !== TIERS.FREE;

  const getRecord = (milestoneId) =>
    userMilestones.find((m) => m.milestone_id === milestoneId);

  const handleToggleExperienced = async (milestoneId, experienced) => {
    const milestone = MILESTONES.find((m) => m.id === milestoneId);
    const existing = getRecord(milestoneId);
    try {
      if (existing) {
        await base44.entities.UserMilestone.update(existing.id, {
          experienced,
          experienced_date: experienced ? format(new Date(), "yyyy-MM-dd") : undefined,
        });
      } else {
        await base44.entities.UserMilestone.create({
          milestone_id: milestoneId,
          phase: milestone.phase,
          experienced,
          experienced_date: experienced ? format(new Date(), "yyyy-MM-dd") : undefined,
        });
      }
      queryClient.invalidateQueries({ queryKey: ["userMilestones"] });
      toast.success(experienced ? `Marked "${milestone.title}" as experienced` : "Removed experienced mark");
    } catch {
      toast.error("Failed to update milestone");
    }
  };

  const handleSaveNote = async (milestoneId, { user_note, include_in_report }) => {
    const milestone = MILESTONES.find((m) => m.id === milestoneId);
    const existing = getRecord(milestoneId);
    try {
      if (existing) {
        await base44.entities.UserMilestone.update(existing.id, { user_note, include_in_report });
      } else {
        await base44.entities.UserMilestone.create({
          milestone_id: milestoneId,
          phase: milestone.phase,
          user_note,
          include_in_report,
        });
      }
      queryClient.invalidateQueries({ queryKey: ["userMilestones"] });
      toast.success("Note saved for clinical report");
    } catch {
      toast.error("Failed to save note");
    }
  };

  const handleLogFeelings = (milestone) => {
    const tagsParam = milestone.tags.join(",");
    navigate(`/log?tags=${encodeURIComponent(tagsParam)}&milestone=${milestone.id}`);
  };

  const handleAskLuna = (milestone, isPremiumLocked) => {
    if (isPremiumLocked && !isPremiumUser) {
      toast("Premium feature", {
        description: "Upgrade to Premium for personalized Luna insights on this milestone.",
        action: { label: "Upgrade", onClick: () => navigate("/billing") },
      });
      return;
    }
    window.dispatchEvent(
      new CustomEvent("open-luna-chat", {
        detail: {
          message: `Tell me more about the "${milestone.title}" milestone (${milestone.timing})`,
        },
      })
    );
  };

  const experiencedCount = userMilestones.filter((m) => m.experienced).length;
  const totalCount = MILESTONES.length;
  const progressPct = Math.round((experiencedCount / totalCount) * 100);

  const pregnancyMilestones = MILESTONES.filter((m) => m.phase === "pregnancy");
  const postpartumMilestones = MILESTONES.filter((m) => m.phase === "postpartum");
  const currentMilestone = currentMilestoneId
    ? MILESTONES.find((m) => m.id === currentMilestoneId)
    : null;

  // Auto-scroll to current milestone when arriving via #current hash
  useEffect(() => {
    if (currentMilestoneId && window.location.hash === "#current") {
      const el = document.getElementById(`milestone-${currentMilestoneId}`);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 300);
      }
    }
  }, [currentMilestoneId]);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border/40 px-4 py-3">
        <div className="flex items-center justify-between gap-3 max-w-2xl mx-auto">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h1 className="font-serif text-base sm:text-lg font-semibold text-foreground text-center flex-1 truncate">
            Pregnancy & Postpartum Milestones
          </h1>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 shrink-0"
            onClick={() => navigate("/insights")}
          >
            <FileDown className="w-3.5 h-3.5" /> Export
          </Button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-4 space-y-6">
        {/* Progress */}
        <div className="bg-card rounded-2xl border border-border/50 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">Your Journey Progress</p>
            <span className="text-xs text-muted-foreground">
              {experiencedCount} / {totalCount} experienced
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-pink-400 to-purple-400 rounded-full transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          {currentMilestone && (
            <p className="text-[11px] text-primary flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Currently at: {currentMilestone.title} ({currentMilestone.timing})
            </p>
          )}
          {!activePhase && (
            <p className="text-[11px] text-muted-foreground">
              Switch to Pregnancy or Postpartum mode to see your current milestone highlighted.
            </p>
          )}
        </div>

        {/* Pregnancy section */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-1">
            <span className="text-xl">🤰</span>
            <h2 className="font-serif text-base font-semibold text-foreground">Pregnancy Journey</h2>
          </div>
          {pregnancyMilestones.map((m) => (
            <div key={m.id} id={`milestone-${m.id}`} className="scroll-mt-20">
              <MilestoneCard
                milestone={m}
                record={getRecord(m.id)}
                isCurrent={currentMilestoneId === m.id}
                isPremiumUser={isPremiumUser}
                onToggleExperienced={handleToggleExperienced}
                onSaveNote={handleSaveNote}
                onLogFeelings={handleLogFeelings}
                onAskLuna={handleAskLuna}
              />
            </div>
          ))}
        </div>

        {/* Postpartum section */}
        <div className="space-y-2 pt-4">
          <div className="flex items-center gap-2 px-1">
            <span className="text-xl">🍼</span>
            <h2 className="font-serif text-base font-semibold text-foreground">Postpartum Journey</h2>
          </div>
          {postpartumMilestones.map((m) => (
            <div key={m.id} id={`milestone-${m.id}`} className="scroll-mt-20">
              <MilestoneCard
                milestone={m}
                record={getRecord(m.id)}
                isCurrent={currentMilestoneId === m.id}
                isPremiumUser={isPremiumUser}
                onToggleExperienced={handleToggleExperienced}
                onSaveNote={handleSaveNote}
                onLogFeelings={handleLogFeelings}
                onAskLuna={handleAskLuna}
              />
            </div>
          ))}
        </div>

        <p className="text-[10px] text-muted-foreground text-center pt-4 leading-relaxed">
          Notes marked "Include in clinical report" will appear in your Clinical PDF under
          "Milestones & Maternal Mental Health Journey". Export from the Insights page.
        </p>
      </div>
    </div>
  );
}