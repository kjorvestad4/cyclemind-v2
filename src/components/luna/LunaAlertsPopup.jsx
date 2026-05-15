import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Bell, AlertCircle, Calendar, TrendingUp, MessageCircle, FileDown, Baby, Flame, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { toast } from "sonner";

const alertIcons = {
  luteal_phase: Calendar,
  severe_symptoms: AlertCircle,
  log_reminder: MessageCircle,
  pattern_insight: TrendingUp,
  fertility_window: Baby,
  menopause_milestone: Flame,
};

const alertColors = {
  high: "bg-red-50 border-red-200 text-red-800 dark:bg-red-950/30 dark:border-red-900 dark:text-red-300",
  medium: "bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/30 dark:border-amber-900 dark:text-amber-300",
  low: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/30 dark:border-blue-900 dark:text-blue-300",
};

export default function LunaAlertsPopup({ onClose }) {
  const queryClient = useQueryClient();
  const [selectedAlert, setSelectedAlert] = useState(null);

  const { data: alertData, isLoading } = useQuery({
    queryKey: ["luna-alerts"],
    queryFn: async () => {
      const response = await base44.functions.invoke("generateLunaAlerts", {});
      return response.data;
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (alertId) => {
      await base44.entities.LunaAlert.update(alertId, { is_read: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["luna-alerts"] });
    },
  });

  const clearAllMutation = useMutation({
    mutationFn: async () => {
      const unreadAlerts = alerts.filter(a => !a.is_read);
      for (const alert of unreadAlerts) {
        await base44.entities.LunaAlert.update(alert.id, { is_read: true });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["luna-alerts"] });
      toast.success("All alerts cleared");
    },
  });

  const handleClearAll = () => {
    clearAllMutation.mutate();
  };

  const handleAlertClick = (alert) => {
    if (!alert.is_read) {
      markAsReadMutation.mutate(alert.id);
    }
    setSelectedAlert(alert);
  };

  const handleGenerateReport = () => {
    base44.functions.invoke("generateClinicalReport", { days: 90 }).then((response) => {
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `CycleMind_Clinical_Summary_${format(new Date(), "yyyy-MM-dd")}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    });
    onClose();
  };

  const alerts = alertData?.alerts || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="w-full max-w-md max-h-[80vh] rounded-3xl bg-white dark:bg-slate-900 shadow-2xl flex flex-col border border-slate-200 dark:border-slate-800 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b flex items-center justify-between bg-slate-50 dark:bg-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-purple-500 flex items-center justify-center shadow">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-semibold text-slate-900 dark:text-slate-100">Luna's Alerts</h3>
              <p className="text-xs text-muted-foreground">
                {alerts.filter(a => !a.is_read).length} unread alert{alerts.filter(a => !a.is_read).length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {alerts.some(a => !a.is_read) && (
              <button
                onClick={handleClearAll}
                disabled={clearAllMutation.isPending}
                className="text-xs text-red-600 dark:text-red-400 hover:underline font-medium disabled:opacity-50"
              >
                Clear All
              </button>
            )}
            <button onClick={onClose} aria-label="Close alerts">
              <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </button>
          </div>
        </div>

        {/* Alerts List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {isLoading ? (
            <p className="text-center text-muted-foreground py-8">Loading alerts...</p>
          ) : alerts.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="text-slate-600 dark:text-slate-400">No alerts right now</p>
              <p className="text-xs text-muted-foreground mt-1">Luna will notify you when she spots patterns or important updates</p>
            </div>
          ) : (
            alerts.map((alert) => {
              const Icon = alertIcons[alert.alert_type] || Bell;
              const colorClass = alertColors[alert.severity];
              
              return (
                <button
                  key={alert.id}
                  onClick={() => handleAlertClick(alert)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all hover:shadow-md ${colorClass} ${!alert.is_read ? "ring-2 ring-teal-500/30" : "opacity-80"}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${alert.severity === "high" ? "bg-white/50" : "bg-white/30"}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold mb-1">{alert.title}</p>
                      <p className="text-xs leading-relaxed opacity-90">{alert.message}</p>
                      <p className="text-[10px] mt-2 opacity-70">
                        {format(new Date(alert.created_date), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Selected Alert Actions */}
        {selectedAlert && (
          <div className="p-5 border-t bg-slate-50 dark:bg-slate-800 space-y-3">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">What would you like to do?</p>
            <div className="flex gap-2">
              {selectedAlert.alert_type === "severe_symptoms" && (
                <Button onClick={handleGenerateReport} size="sm" className="flex-1">
                  <FileDown className="w-4 h-4 mr-2" />
                  Generate Report
                </Button>
              )}
              {(selectedAlert.alert_type === "luteal_phase" || selectedAlert.alert_type === "pattern_insight") && (
                <Button onClick={onClose} size="sm" className="flex-1" variant="outline">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Chat with Luna
                </Button>
              )}
              <Button onClick={onClose} size="sm" variant="outline" className="flex-1">
                Dismiss
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}