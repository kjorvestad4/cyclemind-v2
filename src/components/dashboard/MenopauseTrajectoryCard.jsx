import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Info, Thermometer, Brain, Moon } from "lucide-react";
import { format } from "date-fns";

export default function MenopauseTrajectoryCard({ user, cycles }) {
  const isMenopauseMode = user?.cycle_type === 'menopause' || user?.cycle_type === 'perimenopause';

  const { data: trajectoryData, isLoading, error } = useQuery({
    queryKey: ['menopauseTrajectory'],
    queryFn: async () => {
      const response = await base44.functions.invoke('getMenopauseTrajectory', {});
      return response.data;
    },
    enabled: isMenopauseMode,
    retry: false
  });

  if (!isMenopauseMode) {
    return null;
  }

  if (isLoading) {
    return (
      <Card className="border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950/20">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3"></div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-purple-200 bg-purple-50">
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </CardContent>
      </Card>
    );
  }

  const { menopauseData: data } = trajectoryData;

  const getStageColor = (stage) => {
    if (stage.startsWith('+')) return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
    if (stage === '0') return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
    return 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300';
  };

  return (
    <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 dark:border-purple-800 dark:from-purple-950/20 dark:to-pink-950/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-purple-600" />
          Menopause Trajectory
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* STRAW+10 Stage */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-muted-foreground">STRAW+10 Stage</span>
            <Badge className={getStageColor(data.strawStage)}>
              Stage {data.strawStage}
            </Badge>
          </div>
          <p className="text-sm font-semibold text-foreground mb-1">{data.stageName}</p>
          <p className="text-xs text-muted-foreground leading-relaxed">{data.description}</p>
          {data.monthsSinceLastPeriod >= 0 && (
            <p className="text-xs text-muted-foreground mt-2">
              {data.monthsSinceLastPeriod === 0 
                ? "Currently menstruating" 
                : `${data.monthsSinceLastPeriod} month${data.monthsSinceLastPeriod !== 1 ? 's' : ''} since last period`}
            </p>
          )}
        </div>

        {/* Symptom Trajectory Chart */}
        {data.trajectory && data.trajectory.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
            <p className="text-xs font-semibold text-muted-foreground mb-3">6-Month Symptom Trend</p>
            <div className="flex items-end gap-2 h-24">
              {data.trajectory.map((month, i) => (
                <div key={month.month} className="flex-1 flex flex-col items-center gap-1">
                  <div 
                    className="w-full bg-purple-500 dark:bg-purple-400 rounded-t transition-all"
                    style={{ height: `${(month.avgSeverity / 6) * 100}%` }}
                    title={`Avg severity: ${month.avgSeverity}`}
                  />
                  <span className="text-[9px] text-muted-foreground">
                    {format(new Date(month.month + '-01'), 'MMM')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Symptoms */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground">Top Symptoms</p>
          <div className="flex flex-wrap gap-2">
            {data.topSymptoms.map((symptom, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {symptom.name} ({symptom.frequency}d)
              </Badge>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="space-y-2">
          {data.recommendations.map((rec, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-2.5 border border-purple-100 dark:border-purple-800">
              <div className="flex items-start gap-2">
                {rec.category === 'HRT' && <Thermometer className="w-3 h-3 text-purple-600 shrink-0 mt-0.5" />}
                {rec.category === 'Mental Health' && <Brain className="w-3 h-3 text-purple-600 shrink-0 mt-0.5" />}
                {rec.category === 'Lifestyle' && <Moon className="w-3 h-3 text-purple-600 shrink-0 mt-0.5" />}
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-purple-600 mb-0.5">{rec.category}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{rec.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-2">
          <Info className="w-3 h-3 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-[10px] text-amber-700 dark:text-amber-300 leading-relaxed">
            {data.disclaimer}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}