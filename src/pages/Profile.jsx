import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, differenceInDays, differenceInYears } from "date-fns";
import { queryClientInstance } from "@/lib/query-client";
import DOBPicker from "@/components/common/DOBPicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  User, Settings, LogOut, Shield, Trash2, FileDown, Link2,
  ChevronRight, Moon, Sun, Bell, Heart, Bookmark, CalendarDays, X, ChevronDown, ChevronUp, Edit
} from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import QuickModeSwitcher from "@/components/log/QuickModeSwitcher";
import ShareWithDoctor from "@/components/insights/ShareWithDoctor";
import PdfReportButton from "@/components/insights/PdfReportButton";
import EDDDisplay from "@/components/pregnancy/EDDDisplay";
import EditPregnancyModal from "@/components/profile/EditPregnancyModal";
import EditMenstrualModal from "@/components/profile/EditMenstrualModal";
import EditMenopauseModal from "@/components/profile/EditMenopauseModal";
import EditPostpartumModal from "@/components/profile/EditPostpartumModal";
import { getCycleDay } from "@/lib/symptoms";
import { getUserTier, TIERS } from "@/lib/freemium";
import { Crown } from "lucide-react";

// ── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name) {
  if (!name) return "?";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function getModeBadge(cycleType, latestCycle) {
  const pregnancyWeek = latestCycle?.pregnancy_week
    || (latestCycle?.last_menstrual_period
      ? Math.floor(differenceInDays(new Date(), new Date(latestCycle.last_menstrual_period)) / 7)
      : null);
  const ppDay = cycleType === "postpartum" && latestCycle?.start_date
    ? Math.max(1, differenceInDays(new Date(), new Date(latestCycle.start_date)) + 1) : null;

  const MAP = {
    menstrual:     { label: "Menstrual / PMDD", emoji: "🌙", color: "bg-primary/10 text-primary" },
    pregnancy:     { label: `Pregnancy${pregnancyWeek ? ` · Week ${pregnancyWeek}` : ""}`, emoji: "🤰", color: "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300" },
    postpartum:    { label: `Postpartum${ppDay ? ` · Day ${ppDay}` : ""}`, emoji: "🍼", color: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" },
    perimenopause: { label: "Perimenopause", emoji: "🌊", color: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300" },
    menopause:     { label: "Menopause", emoji: "🔥", color: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300" },
  };
  return MAP[cycleType] || MAP.menstrual;
}

// ── Section wrapper ───────────────────────────────────────────────────────────

function Section({ title, icon: Icon, children, accent }) {
  return (
    <div className={`rounded-2xl border ${accent ? "border-primary/20 bg-primary/3" : "border-border/60 bg-card"} overflow-hidden`}>
      <div className="px-4 py-3.5 border-b border-border/40 flex items-center gap-2">
        {Icon && typeof Icon === "function" && <Icon className="w-4 h-4 text-primary" />}
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function ActionRow({ icon: Icon, label, sublabel, onClick, variant = "default", rightEl }) {
  const colors = variant === "destructive"
    ? "text-destructive hover:bg-destructive/5"
    : "text-foreground hover:bg-muted/50";
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3.5 px-1 py-3.5 rounded-xl transition-colors ${colors} border-b border-border/30 last:border-0`}
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${variant === "destructive" ? "bg-destructive/10" : "bg-muted"}`}>
        {Icon && <Icon className={`w-4.5 h-4.5 ${variant === "destructive" ? "text-destructive" : "text-primary"}`} />}
      </div>
      <div className="flex-1 text-left min-w-0">
        <p className="text-sm font-medium">{label}</p>
        {sublabel && <p className="text-[11px] text-muted-foreground mt-0.5">{sublabel}</p>}
      </div>
      {rightEl || <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />}
    </button>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`w-10 h-6 rounded-full transition-colors relative shrink-0 flex items-center ${checked ? "bg-primary" : "bg-muted"}`}
    >
      <span className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
    </button>
  );
}

// ── CurrentCycleDetails Component ─────────────────────────────────────────

function CurrentCycleDetails({ latestCycle, cycleType, entries, cycles, cycleLength, setCycleLength, ovulationDay, setOvulationDay, menstruationLength, setMenstruationLength, saveSettingsMutation, onEditClick }) {
  const [expanded, setExpanded] = useState(true);

  if (!latestCycle) {
    return (
      <Section title="Current Cycle Details" icon={CalendarDays}>
        <p className="text-sm text-muted-foreground text-center py-4">No cycle recorded yet. Log a cycle from the Dashboard.</p>
      </Section>
    );
  }

  const isMenstrual = !["pregnancy", "postpartum", "menopause", "perimenopause"].includes(cycleType);
  const cycleDay = isMenstrual ? getCycleDay(format(new Date(), "yyyy-MM-dd"), cycles) : null;

  // Render mode-specific content
  const renderContent = () => {
    if (cycleType === "menstrual") {
      const cycleDayNum = cycleDay || 1;
      const cycLen = latestCycle.cycle_length || cycleLength || 28;
      const phase = cycleDayNum <= 5 ? "Menstrual" : cycleDayNum <= 12 ? "Follicular" : cycleDayNum <= 16 ? "Ovulatory" : "Luteal";
      
      // Calculate variability from cycle history
      const cycleLengths = cycles.filter(c => c.cycle_length).map(c => c.cycle_length);
      const avgLength = cycleLengths.length > 0 ? Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length) : cycLen;
      const variance = cycleLengths.length > 1 ? Math.max(...cycleLengths) - Math.min(...cycleLengths) : 0;

      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted/40 rounded-xl p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Cycle Day</p>
              <p className="text-2xl font-bold text-foreground mt-1">{cycleDayNum}</p>
            </div>
            <div className="bg-muted/40 rounded-xl p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Phase</p>
              <p className="text-sm font-semibold text-foreground mt-1">{phase}</p>
            </div>
            <div className="bg-muted/40 rounded-xl p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Cycle Length</p>
              <p className="text-lg font-bold text-foreground mt-1">{cycLen}d</p>
            </div>
            <div className="bg-muted/40 rounded-xl p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Menstruation Length</p>
              <p className="text-lg font-semibold text-foreground mt-1">{menstruationLength || 5}d</p>
            </div>
          </div>
          <div className="pt-2 border-t border-border/40 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase">Edit Cycle Settings</p>
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1.5">
                 <Label className="text-xs">Cycle Length</Label>
                 <Input type="number" min={20} max={60} value={cycleLength}
                   onChange={(e) => { const v = e.target.value === "" ? "" : parseInt(e.target.value); setCycleLength(v); if (v) setOvulationDay(Math.max(1, v - 14)); }} />
               </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Ovulation Day</Label>
                <Input type="number" min={1} max={cycleLength - 1} value={ovulationDay}
                  onChange={(e) => setOvulationDay(parseInt(e.target.value) || 14)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Period Length</Label>
                <Input type="number" min={1} max={14} value={menstruationLength}
                  onChange={(e) => setMenstruationLength(e.target.value === "" ? "" : parseInt(e.target.value))} />
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full gap-2 mb-2" onClick={() => saveSettingsMutation.mutate()} disabled={saveSettingsMutation.isPending}>
              Save Settings
            </Button>
            <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => onEditClick("menstrual")}>
              <Edit className="w-4 h-4" /> Edit Full Cycle Details
            </Button>
          </div>
        </div>
      );
    }

    if (cycleType === "perimenopause" || cycleType === "menopause") {
      const monthsInMode = latestCycle.hrt_start_date 
        ? Math.floor(differenceInDays(new Date(), new Date(latestCycle.hrt_start_date)) / 30)
        : Math.floor(differenceInDays(new Date(), new Date(latestCycle.start_date)) / 30);
      const yearsInMode = Math.floor(monthsInMode / 12);

      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted/40 rounded-xl p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">In {cycleType === "perimenopause" ? "Perimenopause" : "Menopause"}</p>
              <p className="text-lg font-bold text-foreground mt-1">
                {yearsInMode > 0 ? `${yearsInMode}y ${monthsInMode % 12}m` : `${monthsInMode}m`}
              </p>
            </div>
            <div className="bg-muted/40 rounded-xl p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">HRT Type</p>
              <p className="text-sm font-semibold text-foreground mt-1">{latestCycle.hrt_type || "Not set"}</p>
            </div>
            {latestCycle.last_menstrual_period && (
              <div className="bg-muted/40 rounded-xl p-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Last Menstrual Period</p>
                <p className="text-sm font-semibold text-foreground mt-1">{format(new Date(latestCycle.last_menstrual_period), "MMM d, yyyy")}</p>
              </div>
            )}
            <div className="bg-muted/40 rounded-xl p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Mode Started</p>
              <p className="text-sm font-semibold text-foreground mt-1">{format(new Date(latestCycle.start_date), "MMM d, yyyy")}</p>
            </div>
          </div>
          <div className="pt-2 border-t border-border/40">
            <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => onEditClick("menopause")}>
              <Edit className="w-4 h-4" /> Edit HRT / Cycle Details
            </Button>
          </div>
        </div>
      );
    }

    if (cycleType === "pregnancy") {
       const pregnancyWeek = latestCycle.pregnancy_week
         || (latestCycle.last_menstrual_period
           ? Math.floor(differenceInDays(new Date(), new Date(latestCycle.last_menstrual_period)) / 7)
           : null);
       const trimester = pregnancyWeek 
         ? (pregnancyWeek <= 13 ? "First" : pregnancyWeek <= 26 ? "Second" : "Third")
         : null;

       return (
         <div className="space-y-4">
           <EDDDisplay
             lmp={latestCycle?.last_menstrual_period}
             ovulationDate={latestCycle?.ovulation_date}
             estimatedDueDate={latestCycle?.estimated_due_date}
             pregnancyWeek={pregnancyWeek}
           />
           <div className="pt-2 border-t border-border/40">
             <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => onEditClick("pregnancy")}>
               <Edit className="w-4 h-4" /> Edit Pregnancy Details
             </Button>
           </div>
         </div>
       );
     }

    if (cycleType === "postpartum") {
      const ppDay = latestCycle.start_date
        ? Math.max(1, differenceInDays(new Date(), new Date(latestCycle.start_date)) + 1)
        : null;

      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-xl p-3">
              <p className="text-[10px] text-purple-600 dark:text-purple-400 uppercase tracking-wider font-semibold">Postpartum Day</p>
              <p className="text-2xl font-bold text-purple-700 dark:text-purple-300 mt-1">{ppDay || "—"}</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-xl p-3">
              <p className="text-[10px] text-purple-600 dark:text-purple-400 uppercase tracking-wider font-semibold">Delivery Date</p>
              <p className="text-sm font-semibold text-purple-700 dark:text-purple-300 mt-1">{format(new Date(latestCycle.start_date), "MMM d, yyyy")}</p>
            </div>
          </div>
          <div className="pt-2 border-t border-border/40">
            <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => onEditClick("postpartum")}>
              <Edit className="w-4 h-4" /> Edit Postpartum Details
            </Button>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Current Cycle Details</h3>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-2 border-t border-border/40">
          {renderContent()}
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function Profile() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [showModeSwitcher, setShowModeSwitcher] = useState(false);
  const [showSharePanel, setShowSharePanel] = useState(false);
  const [editMode, setEditMode] = useState(null); // 'pregnancy', 'menstrual', 'menopause', 'postpartum'
  const [cycleLength, setCycleLength] = useState(28);
  const [ovulationDay, setOvulationDay] = useState(14);
  const [menstruationLength, setMenstruationLength] = useState(5);
  const [notifDaily, setNotifDaily] = useState(true);
  const [notifMode, setNotifMode] = useState(true);
  const [lunaNotifications, setLunaNotifications] = useState(true);
  const [lutealMedReminder, setLutealMedReminder] = useState(false);
  const [fertilityMode, setFertilityMode] = useState(false);
  const [researchOptIn, setResearchOptIn] = useState(false);
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"));
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [fullName, setFullName] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    base44.auth.me().then((u) => {
      setUser(u);
      if (u?.cycle_length) setCycleLength(u.cycle_length);
      if (u?.ovulation_day) setOvulationDay(u.ovulation_day);
      if (u?.menstruation_length) setMenstruationLength(u.menstruation_length);
      if (u?.date_of_birth) setDateOfBirth(u.date_of_birth);
      setFullName(u?.display_name || u?.full_name || "");
      if (u?.luteal_med_reminder !== undefined) setLutealMedReminder(!!u.luteal_med_reminder);
      if (u?.fertility_mode !== undefined) setFertilityMode(!!u.fertility_mode);
      if (u?.research_opt_in !== undefined) setResearchOptIn(!!u.research_opt_in);
      if (u?.luna_notifications !== undefined) setLunaNotifications(!!u.luna_notifications);
    }).catch(() => {});
  }, []);

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      await base44.auth.updateMe({ 
        date_of_birth: dateOfBirth || null,
        display_name: fullName || null,
      });
      // Re-fetch to confirm what actually persisted
      const updated = await base44.auth.me();
      setUser(updated);
      setFullName(updated?.display_name || updated?.full_name || "");
      setDateOfBirth(updated?.date_of_birth || "");
      toast.success("Profile saved!");
    } catch (e) {
      toast.error("Could not save profile. Please make sure you're logged in.");
    } finally {
      setSavingProfile(false);
    }
  };

  const { data: cycles = [] } = useQuery({
    queryKey: ["cycles"],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.Cycle.filter({ created_by: user.email }, "-start_date", 50);
    },
  });

  const { data: entries = [] } = useQuery({
    queryKey: ["entries"],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.DailyEntry.filter({ created_by: user.email }, "-date", 200);
    },
  });

  const deleteCycleMutation = useMutation({
    mutationFn: (id) => base44.entities.Cycle.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["cycles"] }); toast.success("Cycle removed"); },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      const currentUser = await base44.auth.me();
      
      // Delete all cycles
      const userCycles = await base44.entities.Cycle.filter({ created_by: currentUser.email }, "-start_date", 1000);
      for (const cycle of userCycles) {
        await base44.entities.Cycle.delete(cycle.id);
      }

      // Delete all entries
      const userEntries = await base44.entities.DailyEntry.filter({ created_by: currentUser.email }, "-date", 1000);
      for (const entry of userEntries) {
        await base44.entities.DailyEntry.delete(entry.id);
      }

      // Delete all doctor shares
      const userShares = await base44.entities.DoctorShare.filter({ created_by: currentUser.email }, "-created_date", 1000);
      for (const share of userShares) {
        await base44.entities.DoctorShare.delete(share.id);
      }
    },
    onSuccess: async () => {
      toast.success("Account and all data deleted. Goodbye!");
      queryClientInstance.clear();
      await base44.auth.logout("/");
    },
    onError: () => toast.error("Failed to delete account. Please contact support."),
  });

  const saveSettingsMutation = useMutation({
    mutationFn: () => base44.auth.updateMe({ cycle_length: cycleLength, ovulation_day: ovulationDay, menstruation_length: menstruationLength }),
    onSuccess: () => toast.success("Settings saved!"),
  });

  const savePrefToggle = async (key, value) => {
    try {
      await base44.auth.updateMe({ [key]: value });
    } catch {
      toast.error("Could not save preference.");
    }
  };

  const handleLutealToggle = (val) => {
    setLutealMedReminder(val);
    savePrefToggle("luteal_med_reminder", val);
  };

  const handleFertilityToggle = (val) => {
    setFertilityMode(val);
    savePrefToggle("fertility_mode", val);
  };

  const handleResearchToggle = (val) => {
    setResearchOptIn(val);
    savePrefToggle("research_opt_in", val);
  };

  const handleLunaNotificationsToggle = (val) => {
    setLunaNotifications(val);
    savePrefToggle("luna_notifications", val);
  };

  const latestCycle = cycles.length > 0
    ? [...cycles].sort((a, b) => new Date(b.start_date) - new Date(a.start_date))[0]
    : null;

  const cycleType = latestCycle?.cycle_type
    || (latestCycle?.is_pregnancy_mode ? "pregnancy" : latestCycle?.is_menopause_mode ? "menopause" : "menstrual");

  const modeBadge = getModeBadge(cycleType, latestCycle);
  const isMenstrual = !["pregnancy", "postpartum", "menopause", "perimenopause"].includes(cycleType);

  const handleDarkToggle = (val) => {
    setDarkMode(val);
    document.documentElement.classList.toggle("dark", val);
  };

  const exportCSV = () => {
    if (!entries.length) { toast.info("No data to export yet."); return; }
    const isFreeUser = user && getUserTier(user) === TIERS.FREE;
    const headers = isFreeUser
      ? ["date", "cycle_type", "cycle_day", "bleeding_intensity", "menstrual_flow", "ovulation_test", "journal_entry"]
      : ["date", "cycle_type", "cycle_day", "s_mood_swings", "s_irritability", "s_anxiety", "s_depression", "phq9_score", "gad7_score", "epds_score", "journal_entry"];
    const rows = entries.map((e) => headers.map((h) => JSON.stringify(e[h] ?? "")).join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `CycleMind_Export_${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    toast.success("CSV exported!");
  };

  return (
    <div className="space-y-5 pb-28">
      {/* ── Header ── */}
      <div className="flex items-center gap-4 pt-1">
        <div className="w-16 h-16 rounded-2xl bg-primary/15 flex items-center justify-center shrink-0">
          <span className="text-2xl font-bold text-primary">{getInitials(user?.display_name || user?.full_name)}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-serif text-xl font-semibold text-foreground truncate">{user?.display_name || user?.full_name || "Your Profile"}</h2>
          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          <button
            onClick={() => setShowModeSwitcher(true)}
            className="mt-1.5 inline-flex items-center gap-1.5"
          >
            <span className={`text-[11px] px-2.5 py-1 rounded-full font-semibold ${modeBadge.color}`}>
              {modeBadge.emoji} {modeBadge.label}
            </span>
            <span className="text-[10px] text-muted-foreground underline">Switch</span>
          </button>
        </div>
      </div>

      {showModeSwitcher && (
        <QuickModeSwitcher
          currentCycleType={cycleType}
          latestCycle={latestCycle}
          onClose={() => { setShowModeSwitcher(false); queryClient.invalidateQueries({ queryKey: ["cycles"] }); }}
        />
      )}

      {/* ── Current Cycle Details (Mode-Aware) ── */}
      <CurrentCycleDetails
        latestCycle={latestCycle}
        cycleType={cycleType}
        entries={entries}
        cycles={cycles}
        cycleLength={cycleLength}
        setCycleLength={setCycleLength}
        ovulationDay={ovulationDay}
        setOvulationDay={setOvulationDay}
        menstruationLength={menstruationLength}
        setMenstruationLength={setMenstruationLength}
        saveSettingsMutation={saveSettingsMutation}
        onEditClick={(mode) => setEditMode(mode)}
      />

      {/* ── Personal Information ── */}
      <Section title="Personal Information" icon={User}>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">👤 Full Name</Label>
            <Input
              type="text"
              placeholder="Your name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="h-9 text-sm"
            />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Email</p>
            <p className="text-sm font-medium text-foreground">{user?.email || "—"}</p>
          </div>
          <div>
            <DOBPicker 
              value={dateOfBirth} 
              onChange={setDateOfBirth}
              label="🎂 Date of Birth"
              optional={true}
            />
            {dateOfBirth && (() => {
              const age = differenceInYears(new Date(), new Date(dateOfBirth));
              return !isNaN(age) && age >= 0 ? (
                <p className="text-xs text-muted-foreground mt-2">Age: {age} years</p>
              ) : null;
            })()}
          </div>
          <Button onClick={saveProfile} disabled={savingProfile} className="w-full h-10 rounded-xl font-semibold">
            {savingProfile ? "Saving…" : "Save Profile"}
          </Button>
        </div>
      </Section>

      {/* ── Quick Actions ── */}
      <Section title="Quick Actions" icon={Settings}>
        <div className="divide-y divide-border/30">
          <ActionRow
            icon={FileDown}
            label="Export All My Data"
            sublabel="Download CSV with all entries"
            onClick={exportCSV}
          />
          {user && getUserTier(user) === TIERS.FREE ? (
            <>
              <div className="py-3.5">
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Link2 className="w-4.5 h-4.5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Doctor Share Link</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Upgrade to Premium for secure sharing</p>
                  </div>
                </div>
              </div>
              <div className="py-3.5">
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <FileDown className="w-4.5 h-4.5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Download Clinical Report</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Upgrade to Premium for PDF reports</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => window.location.href = '/billing'}
                className="w-full py-2.5 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors mt-2"
              >
                Upgrade Now
              </button>
            </>
          ) : (
            <>
              <ActionRow
                icon={Link2}
                label="Doctor Share Link"
                sublabel="Secure, 30-day view-only link for your clinician"
                onClick={() => setShowSharePanel(!showSharePanel)}
              />
              <div className="pt-3">
                <PdfReportButton cycles={cycles} entries={entries} analysis={{}} user={user} />
              </div>
            </>
          )}
        </div>

        {showSharePanel && user && getUserTier(user) !== TIERS.FREE && (
          <div className="mt-4 pt-4 border-t border-border/40">
            <ShareWithDoctor cycles={cycles} entries={entries} analysis={{}} />
          </div>
        )}
      </Section>

      {/* ── Settings ── */}
      <Section title="Settings" icon={Bell}>
        {/* Notifications */}
        <div className="space-y-1 mb-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">Notifications</p>
          <div className="flex items-center justify-between py-3 border-b border-border/30">
            <div>
              <p className="text-sm font-medium">Daily Log Reminder</p>
              <p className="text-[11px] text-muted-foreground">Evening reminder to log your symptoms</p>
            </div>
            <Toggle checked={notifDaily} onChange={setNotifDaily} />
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium">Mode-Specific Alerts</p>
              <p className="text-[11px] text-muted-foreground">Reminders for EPDS check, fetal movement, etc.</p>
            </div>
            <Toggle checked={notifMode} onChange={setNotifMode} />
          </div>
          <div className="flex items-center justify-between py-3 border-b border-border/30">
            <div>
              <p className="text-sm font-medium">🌙 Luna Notifications</p>
              <p className="text-[11px] text-muted-foreground">AI-powered insights, patterns, and supportive check-ins</p>
            </div>
            <Toggle checked={lunaNotifications} onChange={handleLunaNotificationsToggle} />
          </div>
          {isMenstrual && (
            <>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium">🌸 Fertility Mode</p>
                  <p className="text-[11px] text-muted-foreground">Get alerts for your fertile window and conception probability</p>
                </div>
                <Toggle checked={fertilityMode} onChange={handleFertilityToggle} />
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium">💊 Luteal Phase Medication Reminder</p>
                  <p className="text-[11px] text-muted-foreground">Shows a gentle in-app reminder during your luteal phase to stay consistent with medications (SSRIs, supplements, etc.)</p>
                </div>
                <Toggle checked={lutealMedReminder} onChange={handleLutealToggle} />
              </div>
            </>
          )}
        </div>

        {/* Appearance */}
        <div className="mb-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">Appearance</p>
          <div className="flex items-center justify-between py-3 border-b border-border/30">
            <div className="flex items-center gap-2">
              {darkMode ? <Moon className="w-4 h-4 text-primary" /> : <Sun className="w-4 h-4 text-primary" />}
              <div>
                <p className="text-sm font-medium">Dark Mode</p>
                <p className="text-[11px] text-muted-foreground">Easier on your eyes at night</p>
              </div>
            </div>
            <Toggle checked={darkMode} onChange={handleDarkToggle} />
          </div>
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Apple Health Sync</p>
                <p className="text-[11px] text-muted-foreground">Coming soon</p>
              </div>
            </div>
            <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground font-medium">Soon</span>
          </div>
        </div>

        {/* Privacy */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">Privacy & Data</p>
          <div className="bg-muted/40 rounded-xl p-3 mb-3">
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your health data is stored privately and never shared with third parties. No ads. No data selling. Doctor share links are read-only, time-limited, and revocable at any time.
              </p>
            </div>
          </div>

          {/* Research Opt-In */}
          <div className="rounded-xl border border-border/60 bg-card p-3 space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="text-sm font-medium">🔬 Contribute to Research</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                  Opt-in to contribute <strong>de-identified, aggregated</strong> data to reproductive mental health research (HIPAA-compliant). Your name and contact info are never included. You can withdraw at any time.
                </p>
              </div>
              <Toggle checked={researchOptIn} onChange={handleResearchToggle} />
            </div>
            {researchOptIn && (
              <p className="text-[10px] text-primary font-medium">✓ Thank you for supporting research into PMDD and women's mental health.</p>
            )}
          </div>
        </div>
      </Section>

      {/* ── Account ── */}
      <Section title="Account" icon={User}>
        <div className="divide-y divide-border/30">
          {user && getUserTier(user) === TIERS.FREE && (
            <ActionRow
              icon={Crown}
              label="Upgrade to Premium"
              sublabel="Unlock all tracking modes and features"
              onClick={() => window.location.href = '/billing'}
            />
          )}
          <ActionRow
            icon={LogOut}
            label="Sign Out"
            sublabel="You'll need to sign back in to access your data"
            onClick={() => base44.auth.logout()}
          />
          <div className="pt-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="w-full flex items-center gap-3.5 px-1 py-3.5 rounded-xl transition-colors text-destructive hover:bg-destructive/5">
                  <div className="w-9 h-9 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium">Delete Account</p>
                    <p className="text-[11px] text-muted-foreground">Permanently erase all your data</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 ml-auto" />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete your account and all health data — cycles, daily entries, and settings. This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => deleteAccountMutation.mutate()}
                    disabled={deleteAccountMutation.isPending}
                  >
                    {deleteAccountMutation.isPending ? "Deleting..." : "Delete Account"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </Section>

      {/* ── Cycle History ── */}
      {cycles.length > 0 && (
        <Section title="Cycle History">
          <div className="space-y-1">
            {[...cycles].sort((a, b) => new Date(b.start_date) - new Date(a.start_date)).map((cycle) => (
              <div key={cycle.id} className="flex items-center justify-between py-2.5 border-b border-border/30 last:border-0">
                <div>
                  <p className="text-sm font-medium">{format(new Date(cycle.start_date), "MMM d, yyyy")}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {cycle.cycle_type || "menstrual"}{cycle.cycle_length ? ` · ${cycle.cycle_length}d` : ""}
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remove this cycle?</AlertDialogTitle>
                      <AlertDialogDescription>Daily entries are not affected.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteCycleMutation.mutate(cycle.id)}>Remove</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ── Footer ── */}
      <div className="text-center space-y-1 pt-2 pb-4">
        <p className="text-sm font-serif text-muted-foreground italic">CycleMind – For cycles with a mind of their own</p>
        <p className="text-[10px] text-muted-foreground">v1.0 · Based on DRSP (Endicott, Nee & Harrison, 2006)</p>
        <p className="text-[10px] text-muted-foreground">⚕️ Not a substitute for professional medical advice</p>
      </div>

      {/* ── Edit Modals ── */}
      {editMode === "pregnancy" && latestCycle && (
        <EditPregnancyModal
          cycle={latestCycle}
          onClose={() => setEditMode(null)}
          onSuccess={() => setEditMode(null)}
        />
      )}
      {editMode === "menstrual" && latestCycle && (
        <EditMenstrualModal
          cycle={latestCycle}
          onClose={() => setEditMode(null)}
          onSuccess={() => setEditMode(null)}
        />
      )}
      {editMode === "menopause" && latestCycle && (
        <EditMenopauseModal
          cycle={latestCycle}
          cycleType={cycleType}
          onClose={() => setEditMode(null)}
          onSuccess={() => setEditMode(null)}
        />
      )}
      {editMode === "postpartum" && latestCycle && (
        <EditPostpartumModal
          cycle={latestCycle}
          onClose={() => setEditMode(null)}
          onSuccess={() => setEditMode(null)}
        />
      )}
    </div>
  );
}