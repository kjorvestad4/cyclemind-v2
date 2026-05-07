import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { User, CalendarDays, LogOut, Shield, Trash2, Layers } from "lucide-react";
import ModeSwitcher from "@/components/profile/ModeSwitcher";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Profile() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [cycleLength, setCycleLength] = useState(28);
  const [ovulationDay, setOvulationDay] = useState(14);
  const [lastPeriodDate, setLastPeriodDate] = useState("");
  const [lastOvulationDate, setLastOvulationDate] = useState("");
  useEffect(() => {
    base44.auth.me().then((u) => {
      setUser(u);
      if (u?.cycle_length) setCycleLength(u.cycle_length);
      if (u?.ovulation_day) setOvulationDay(u.ovulation_day);
      if (u?.last_period_date) setLastPeriodDate(u.last_period_date);
      if (u?.last_ovulation_date) setLastOvulationDate(u.last_ovulation_date);
    }).catch(() => {});
  }, []);

  const { data: cycles = [] } = useQuery({
    queryKey: ["cycles"],
    queryFn: () => base44.entities.Cycle.list("-start_date", 50),
  });

  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      await base44.auth.updateMe({
        cycle_length: cycleLength,
        ovulation_day: ovulationDay,
        last_period_date: lastPeriodDate,
        last_ovulation_date: lastOvulationDate,
      });
    },
    onSuccess: () => {
      toast.success("Profile updated!");
    },
  });

  const deleteCycleMutation = useMutation({
    mutationFn: (id) => base44.entities.Cycle.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cycles"] });
      toast.success("Cycle removed");
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-semibold">Profile & Settings</h2>
        <p className="text-sm text-muted-foreground mt-1">Manage your cycle and preferences.</p>
      </div>

      {/* User Info */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            Account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <p className="text-sm font-medium">{user?.full_name || "User"}</p>
          <p className="text-xs text-muted-foreground">{user?.email}</p>
        </CardContent>
      </Card>

      {/* Mode Switcher */}
      <Card className="border-primary/20 bg-primary/3">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            Tracking Mode
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ModeSwitcher
            currentCycleType={
              cycles.length > 0
                ? ([...cycles].sort((a, b) => new Date(b.start_date) - new Date(a.start_date))[0]?.cycle_type
                  || ([...cycles].sort((a, b) => new Date(b.start_date) - new Date(a.start_date))[0]?.is_pregnancy_mode ? "pregnancy"
                  : [...cycles].sort((a, b) => new Date(b.start_date) - new Date(a.start_date))[0]?.is_menopause_mode ? "menopause"
                  : "menstrual"))
                : "menstrual"
            }
            latestCycle={cycles.length > 0 ? [...cycles].sort((a, b) => new Date(b.start_date) - new Date(a.start_date))[0] : null}
          />
        </CardContent>
      </Card>

      {/* Cycle Settings */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-primary" />
            Cycle Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Cycle Length (days)</Label>
              <Input
                type="number"
                min={20}
                max={60}
                value={cycleLength}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 28;
                  setCycleLength(val);
                  setOvulationDay(Math.max(1, val - 14));
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Ovulation Day</Label>
              <Input
                type="number"
                min={1}
                max={cycleLength - 1}
                value={ovulationDay}
                onChange={(e) => setOvulationDay(parseInt(e.target.value) || 14)}
              />
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground">
            Ovulation day auto-fills as cycle length − 14. Adjust if your cycle is non-standard.
          </p>

          <div className="space-y-1.5">
            <Label className="text-xs">Date of Last Period</Label>
            <Input
              type="date"
              value={lastPeriodDate}
              onChange={(e) => setLastPeriodDate(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Date of Last Ovulation</Label>
            <Input
              type="date"
              value={lastOvulationDate}
              onChange={(e) => setLastOvulationDate(e.target.value)}
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => updateProfileMutation.mutate()}
            disabled={updateProfileMutation.isPending}
            className="w-full"
          >
            Save Settings
          </Button>
        </CardContent>
      </Card>

      {/* Cycle History */}
      {cycles.length > 0 && (
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Cycle History</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {cycles.map((cycle) => (
              <div key={cycle.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                <div>
                  <p className="text-sm font-medium">{format(new Date(cycle.start_date), "MMM d, yyyy")}</p>
                  {cycle.cycle_length && (
                    <p className="text-[10px] text-muted-foreground">{cycle.cycle_length} day cycle</p>
                  )}
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this cycle?</AlertDialogTitle>
                      <AlertDialogDescription>This will remove this period start date. Daily entries are not affected.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteCycleMutation.mutate(cycle.id)}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Privacy & Actions */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            Privacy & Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Your data is private and stored securely per your account. We do not share your health data
            with third parties. No ads are shown in this app.
          </p>
          <Button
            variant="outline"
            className="w-full gap-2 text-muted-foreground"
            onClick={() => base44.auth.logout()}
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </Button>
        </CardContent>
      </Card>

      {/* Delete Account */}
      <Card className="border-destructive/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-destructive flex items-center gap-2">
            <Trash2 className="w-4 h-4" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full" size="sm">
                Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete your account and all associated data including cycles, daily entries, and settings. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => {
                    toast.error("Please contact support to delete your account.");
                  }}
                >
                  Delete Account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

      <p className="text-[10px] text-muted-foreground text-center pb-4">
        CycleMind v1.0 • Based on the DRSP (Endicott, Nee & Harrison, 2006)
      </p>
    </div>
  );
}