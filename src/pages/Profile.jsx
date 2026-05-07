import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, differenceInDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  User, Settings, LogOut, Shield, Trash2, FileDown, Link2,
  ChevronRight, Moon, Sun, Bell, Heart, Bookmark, CalendarDays, X
} from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import QuickModeSwitcher from "@/components/log/QuickModeSwitcher";
import ShareWithDoctor from "@/components/insights/ShareWithDoctor";
import PdfReportButton from "@/components/insights/PdfReportButton";

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
        {Icon && <Icon className="w-4 h-4 text-primary" />}
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
      className={`w-10 h-6 rounded-full transition-colors relative shrink-0 ${checked ? "bg-primary" : "bg-muted"}`}
    >
      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? "translate-x-5" : "translate-x-1"}`} />
    </button>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function Profile() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [showModeSwitcher, setShowModeSwitcher] = useState(false);
  const [showSharePanel, setShowSharePanel] = useState(false);
  const [showEditCycle, setShowEditCycle] = useState(false);
  const [cycleLength, setCycleLength] = useState(28);
  const [ovulationDay, setOvulationDay] = useState(14);
  const [notifDaily, setNotifDaily] = useState(true);
  const [notifMode, setNotifMode] = useState(true);
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"));

  useEffect(() => {
    base44.auth.me().then((u) => {
      setUser(u);
      if (u?.cycle_length) setCycleLength(u.cycle_length);
      if (u?.ovulation_day) setOvulationDay(u.ovulation_day);
    }).catch(() => {});
  }, []);

  const { data: cycles = [] } = useQuery({
    queryKey: ["cycles"],
    queryFn: () => base44.entities.Cycle.list("-start_date", 50),
  });

  const { data: entries = [] } = useQuery({
    queryKey: ["entries"],
    queryFn: () => base44.entities.DailyEntry.list("-date", 200),
  });

  const deleteCycleMutation = useMutation({
    mutationFn: (id) => base44.entities.Cycle.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["cycles"] }); toast.success("Cycle removed"); },
  });

  const saveSettingsMutation = useMutation({
    mutationFn: () => base44.auth.updateMe({ cycle_length: cycleLength, ovulation_day: ovulationDay }),
    onSuccess: () => toast.success("Settings saved!"),
  });

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
    const headers = ["date", "cycle_type", "cycle_day", "s_mood_swings", "s_irritability", "s_anxiety", "s_depression", "phq9_score", "gad7_score", "epds_score", "journal_entry"];
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
          <span className="text-2xl font-bold text-primary">{getInitials(user?.full_name)}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-serif text-xl font-semibold text-foreground truncate">{user?.full_name || "Your Profile"}</h2>
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

      {/* ── Current Cycle Summary ── */}
      <Section title="My Current Cycle" icon={CalendarDays}>
        {latestCycle ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Mode", value: modeBadge.emoji + " " + (cycleType.charAt(0).toUpperCase() + cycleType.slice(1)) },
                { label: "Started", value: latestCycle.start_date ? format(new Date(latestCycle.start_date), "MMM d, yyyy") : "—" },
                cycleType === "pregnancy" && latestCycle.estimated_due_date
                  ? { label: "Due Date", value: format(new Date(latestCycle.estimated_due_date), "MMM d, yyyy") }
                  : cycleType === "postpartum" && latestCycle.start_date
                  ? { label: "Postpartum Day", value: `Day ${Math.max(1, differenceInDays(new Date(), new Date(latestCycle.start_date)) + 1)}` }
                  : isMenstrual
                  ? { label: "Cycle Length", value: `${latestCycle.cycle_length || cycleLength} days` }
                  : { label: "HRT", value: latestCycle.hrt_type || "Not set" },
                cycleType === "pregnancy" && latestCycle.last_menstrual_period
                  ? { label: "LMP", value: format(new Date(latestCycle.last_menstrual_period), "MMM d, yyyy") }
                  : { label: "Entries", value: `${entries.length} total` },
              ].filter(Boolean).slice(0, 4).map((item) => (
                <div key={item.label} className="bg-muted/40 rounded-xl p-3">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{item.label}</p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">{item.value}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowEditCycle(!showEditCycle)}
              className="w-full py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
            >
              {showEditCycle ? "Hide Cycle Settings" : "Edit Cycle Settings"}
            </button>

            {showEditCycle && (
              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Cycle Length</Label>
                    <Input type="number" min={20} max={60} value={cycleLength}
                      onChange={(e) => { const v = parseInt(e.target.value) || 28; setCycleLength(v); setOvulationDay(Math.max(1, v - 14)); }} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Ovulation Day</Label>
                    <Input type="number" min={1} max={cycleLength - 1} value={ovulationDay}
                      onChange={(e) => setOvulationDay(parseInt(e.target.value) || 14)} />
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full" onClick={() => saveSettingsMutation.mutate()} disabled={saveSettingsMutation.isPending}>
                  Save Settings
                </Button>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">No cycle recorded yet. Log a cycle from the Dashboard.</p>
        )}
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
          <ActionRow
            icon={Link2}
            label="Doctor Share Link"
            sublabel="Secure, 30-day view-only link for your clinician"
            onClick={() => setShowSharePanel(!showSharePanel)}
          />
          <div className="pt-3">
            <PdfReportButton cycles={cycles} entries={entries} analysis={{}} user={user} />
          </div>
        </div>

        {showSharePanel && (
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
        </div>
      </Section>

      {/* ── Account ── */}
      <Section title="Account" icon={User}>
        <div className="divide-y divide-border/30">
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
                    onClick={() => toast.error("Please contact support to delete your account.")}
                  >
                    Delete Account
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
    </div>
  );
}