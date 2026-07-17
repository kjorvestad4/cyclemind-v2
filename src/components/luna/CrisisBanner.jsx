import React from 'react';
import { Phone, AlertCircle, ExternalLink } from 'lucide-react';

/**
 * CrisisBanner — visible crisis intervention UI.
 * Shown when Luna's backend flags a message with crisis: true,
 * or when crisis keywords are detected in the user's message.
 */
export default function CrisisBanner({ compact = false }) {
  if (compact) {
    return (
      <div className="mt-3 p-3 bg-red-50 dark:bg-red-950/40 border-2 border-red-300 dark:border-red-800 rounded-2xl text-red-800 dark:text-red-200">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-px shrink-0" />
          <div className="text-xs leading-relaxed">
            <p className="font-bold mb-1">You deserve support right now.</p>
            <p>
              Call or text <a href="tel:988" className="font-bold underline">988</a> (Suicide &amp; Crisis Lifeline) ·
              Call <a href="tel:911" className="font-bold underline">911</a> for emergencies.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3 p-4 bg-red-50 dark:bg-red-950/40 border-2 border-red-300 dark:border-red-800 rounded-2xl text-red-800 dark:text-red-200">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/60 flex items-center justify-center shrink-0">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
        </div>
        <div className="flex-1 space-y-2.5">
          <p className="font-bold text-sm">
            I'm really concerned about how you're feeling. You matter, and you deserve immediate support.
          </p>
          <p className="text-xs leading-relaxed">
            Please reach out right now — trained people are standing by 24/7 who want to help you through this moment.
          </p>
          <div className="grid grid-cols-1 gap-2 pt-1">
            <a
              href="tel:988"
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700 transition-colors"
            >
              <Phone className="w-4 h-4" />
              <div className="flex-1 text-left">
                <p>Call or Text 988</p>
                <p className="text-[10px] opacity-90 font-normal">Suicide &amp; Crisis Lifeline · 24/7</p>
              </div>
            </a>
            <a
              href="tel:911"
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-red-800 text-white font-semibold text-sm hover:bg-red-900 transition-colors"
            >
              <Phone className="w-4 h-4" />
              <div className="flex-1 text-left">
                <p>Call 911</p>
                <p className="text-[10px] opacity-90 font-normal">Emergency Services</p>
              </div>
            </a>
            <a
              href="https://988lifeline.org/chat/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white dark:bg-red-900/40 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-200 font-medium text-sm hover:bg-red-50 dark:hover:bg-red-900/60 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Online Chat with 988</span>
            </a>
          </div>
          <p className="text-[11px] leading-relaxed pt-1 opacity-90">
            If you're thinking about hurting yourself or your baby, or experiencing thoughts that feel out of control,
            please reach out immediately. Postpartum Support International also offers help:{' '}
            <a href="tel:18007997233" className="font-semibold underline">1-800-799-7233</a>
          </p>
        </div>
      </div>
    </div>
  );
}