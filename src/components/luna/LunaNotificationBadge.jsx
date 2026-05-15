import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LunaNotificationBadge({ onClick }) {
  const { data: alertData, isLoading } = useQuery({
    queryKey: ["luna-alerts"],
    queryFn: async () => {
      const response = await base44.functions.invoke("generateLunaAlerts", {});
      return response.data;
    },
    refetchInterval: 30000, // Check every 30 seconds
  });

  const unreadCount = alertData?.unreadCount || 0;
  const hasAlerts = unreadCount > 0;

  if (isLoading || unreadCount === 0) return null;

  return (
    <button
      onClick={onClick}
      className="absolute -top-1 -right-1 z-10"
      aria-label={`${unreadCount} Luna alerts`}
    >
      <div className={cn(
        "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow-md transition-all",
        hasAlerts 
          ? "bg-red-500 text-white animate-pulse" 
          : "bg-gray-300 text-gray-600"
      )}>
        {unreadCount}
      </div>
    </button>
  );
}