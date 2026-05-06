import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { User, CalendarDays, Plus, LogOut, Shield, Trash2 } from "lucide-react";
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
  const [newPeriodDate, setNewPeriodDate] = useState(format(new Date(), "yyyy-MM-dd"));

  useEffect(() => {
    base44.auth.me().then((u) => {
      setUser(u);
      if (u?.cycle_length) setCycleLength(u.cycle_length);
    }).catch(() => {});
  }, []);

  const { data: cycles = [] } = useQuery({
    queryKey: ["cycles"],
    queryFn: () => base44.entities.Cycle.list("-start_date", 50),
  });

  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      await base44.auth.updateMe({ cycle_length: cycleLength });
    },
    onSuccess: () => {
      toast.success("Profile updated!");
    },
  });

  const addCycleMutation = useMutation({
    mutationFn: async () => {
      // Update previous cycle's length if exists
      if (cycles.length > 0) {
        const prevCycle = cycles[0]; // most recent
        const prevStart = new Date(prevCycle.start_date);
        const newStart = new Date(newPeriodDate);
        const daysDiff = Math.round((newStart - prevStart) / (1000 * 60 * 60 * 24));
        if (daysDiff > 0) {
          await base44.entities.Cycle.update(prevCycle.id, { cycle_length: daysDiff });
        }
      }
      await base44.entities.Cycle.create({ start_date: newPeriodDate });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cycles"] });
      toast.success("Period start date recorded! 🩸");
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

      {/* Cycle Settings */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-primary" />
            Cycle Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs">Typical Cycle Length (days)</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                min={20}
                max={45}
                value={cycleLength}
                onChange={(e) => setCycleLength(parseInt(e.target.value) || 28)}
                className="w-24"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateProfileMutation.mutate()}
                disabled={updateProfileMutation.isPending}
              >
                Save
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Luteal phase is estimated as the last 14 days of your cycle.
            </p>
            <div className="mt-2 rounded-lg bg-accent/50 border border-accent-foreground/10 px-3 py-2 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Estimated Day of Ovulation</span>
              <span className="text-xs font-semibold text-accent-foreground">Day {Math.max(1, cycleLength - 14)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Log New Period */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Plus className="w-4 h-4 text-accent-foreground" />
            Mark Period Start (Day 1)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label className="text-xs">First day of menstrual flow</Label>
            <Input
              type="date"
              value={newPeriodDate}
              onChange={(e) => setNewPeriodDate(e.target.value)}
            />
          </div>
          <Button
            onClick={() => addCycleMutation.mutate()}
            disabled={addCycleMutation.isPending}
            className="w-full"
          >
            Record Period Start
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

      <p className="text-[10px] text-muted-foreground text-center pb-4">
        CycleMind v1.0 • Based on the DRSP (Endicott, Nee & Harrison, 2006)
      </p>
    </div>
  );
}