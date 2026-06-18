import { useState } from 'react';
import { Moon, Crown, Bell } from 'lucide-react';
import { canAccessLuna } from '@/lib/freemium';
import LunaChat from './LunaChat';
import LunaAlertsPopup from './LunaAlertsPopup';
import LunaNotificationBadge from './LunaNotificationBadge';

export default function LunaButton({ user, cycleMode, cycleDay, cyclePhase, eddInfo }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  // Wait for user to load — null means still loading, avoids flash of grayed-out button
  const hasLunaAccess = user ? canAccessLuna(user) : null;

  if (hasLunaAccess === null) return null;

  if (hasLunaAccess) {
    return (
      <>
        <button
          id="tour-luna-button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-[96px] right-6 z-40 flex flex-col items-center gap-0.5"
          title="Chat with Luna"
          style={{ zIndex: 40 }}
        >
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-teal-600 to-blue-600 text-white shadow-lg hover:shadow-xl hover:scale-110 transition-all active:scale-95 flex items-center justify-center relative">
            <Moon className="w-6 h-6" />
            <LunaNotificationBadge onClick={() => setShowAlerts(true)} />
          </div>
          <span className="text-[10px] font-medium text-teal-700 dark:text-teal-400">Luna</span>
        </button>

        {isOpen && (
          <LunaChat
            cycleMode={cycleMode}
            cycleDay={cycleDay}
            cyclePhase={cyclePhase}
            eddInfo={eddInfo}
            onClose={() => setIsOpen(false)}
          />
        )}

        {showAlerts && (
          <LunaAlertsPopup onClose={() => setShowAlerts(false)} />
        )}
      </>
    );
  }

  // Free tier: locked bubble
  return (
    <button
      id="tour-luna-button"
      onClick={() => window.location.href = '/billing'}
      className="fixed bottom-32 right-4 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 text-slate-600 shadow-lg hover:shadow-xl hover:scale-110 transition-all active:scale-95 flex items-center justify-center group"
      title="Upgrade to Premium for Luna AI"
    >
      <div className="relative">
        <Moon className="w-6 h-6 opacity-50" />
        <Crown className="w-3.5 h-3.5 absolute -top-1 -right-1 text-amber-500" />
      </div>

      {/* Tooltip */}
      <div className="absolute bottom-full right-0 mb-2 px-3 py-2 rounded-lg bg-slate-900 text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
        Unlock Luna — Upgrade to Premium
      </div>
    </button>
  );
}