import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Calendar, Info, ArrowRight } from "lucide-react";
import { format, parseISO } from "date-fns";

export default function FertilityGuidanceCard({ user, cycles }) {
  const [isTryingToConceive, setIsTryingToConceive] = useState(user?.trying_to_conceive || false);

  const { data: fertilityData, isLoading, error } = useQuery({
    queryKey: ['fertilityGuidance'],
    queryFn: async () => {
      const response = await base44.functions.invoke('getFertilityGuidance', {});
      return response.data;
    },
    enabled: isTryingToConceive,
    retry: false
  });

  const handleToggleTTC = async () => {
    try {
      await base44.auth.updateMe({ 
        trying_to_conceive: !isTryingToConceive 
      });
      setIsTryingToConceive(!isTryingToConceive);
    } catch (error) {
      console.error("Failed to update TTC status", error);
    }
  };

  if (!isTryingToConceive) {
    return (
      <Card className="border-pink-200 bg-pink-50 dark:border-pink-800 dark:bg-pink-950/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Heart className="w-4 h-4 text-pink-600" />
            Trying to Conceive?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Enable fertility mode to get daily conception probability, ovulation predictions, and evidence-based tips.
          </p>
          <Button onClick={handleToggleTTC} size="sm" className="w-full bg-pink-600 hover:bg-pink-700">
            Enable Fertility Mode
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="border-pink-200 bg-pink-50">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-pink-200 rounded w-3/4"></div>
            <div className="h-3 bg-pink-100 rounded w-full"></div>
            <div className="h-3 bg-pink-100 rounded w-5/6"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-pink-200 bg-pink-50">
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">{error.message}</p>
          <Button onClick={handleToggleTTC} variant="outline" size="sm" className="mt-2">
            Disable Fertility Mode
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { fertilityData: data } = fertilityData;

  return (
    <Card className="border-pink-200 bg-gradient-to-br from-pink-50 to-purple-50 dark:border-pink-800 dark:from-pink-950/20 dark:to-purple-950/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Heart className="w-4 h-4 text-pink-600" />
            Fertility Guidance
          </CardTitle>
          <Button onClick={handleToggleTTC} variant="ghost" size="sm">
            Disable
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Conception Probability */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-muted-foreground">Conception Probability</span>
            <Badge variant={data.conceptionProbability >= 20 ? "default" : "secondary"}>
              {data.conceptionProbability}%
            </Badge>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-pink-500 h-3 rounded-full transition-all"
              style={{ width: `${data.conceptionProbability}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {data.isInFertilityWindow 
              ? "🌸 You're in your fertility window!" 
              : `Ovulation in ${data.daysUntilOvulation} days`}
          </p>
        </div>

        {/* Key Dates */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-3 h-3 text-pink-600" />
              <span className="text-[10px] font-semibold text-muted-foreground">Fertility Window</span>
            </div>
            <p className="text-xs font-medium">
              {format(parseISO(data.fertilityWindowStart), 'MMM d')} - {format(parseISO(data.fertilityWindowEnd), 'MMM d')}
            </p>
          </div>
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Heart className="w-3 h-3 text-purple-600" />
              <span className="text-[10px] font-semibold text-muted-foreground">Predicted Ovulation</span>
            </div>
            <p className="text-xs font-medium">
              {format(parseISO(data.predictedOvulation), 'MMM d')}
            </p>
          </div>
        </div>

        {/* Tips */}
        <div className="space-y-2">
          {data.tips.slice(0, 3).map((tip, i) => (
            <div key={i} className={`rounded-lg p-2.5 text-xs ${
              tip.priority === 'high' 
                ? 'bg-pink-100 dark:bg-pink-900/30 border border-pink-200 dark:border-pink-800' 
                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
            }`}>
              <div className="flex items-start gap-2">
                <span className="text-xs">{tip.priority === 'high' ? '🔴' : '🟡'}</span>
                <div>
                  <p className="font-semibold text-[10px] uppercase tracking-wide mb-0.5">{tip.category}</p>
                  <p className="text-muted-foreground leading-relaxed">{tip.text}</p>
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