import React, { useState } from 'react';
import { Shield, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { APP_VERSION } from '@/lib/appVersion';

/**
 * ResearchConsentModal — explicit, detailed consent flow for contributing
 * de-identified data to reproductive mental health research.
 * Replaces the simple toggle with a full consent screen as required for
 * HIPAA-compliant research data contribution.
 */
export default function ResearchConsentModal({ onConsent, onDecline, onClose }) {
  const [agreedItems, setAgreedItems] = useState({
    deidentified: false,
    voluntary: false,
    withdraw: false,
    noClinical: false,
    privacy: false,
  });

  const allAgreed = Object.values(agreedItems).every(Boolean);

  const toggle = (key) => {
    setAgreedItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleConsent = () => {
    if (!allAgreed) return;
    onConsent();
  };

  const consentItems = [
    {
      key: 'deidentified',
      label: 'I understand my data will be de-identified and aggregated',
      desc: 'Your name, email, and contact information are never included in research data.',
    },
    {
      key: 'voluntary',
      label: 'I am voluntarily choosing to participate',
      desc: 'This is not required to use CycleMind. All core features work without participating.',
    },
    {
      key: 'withdraw',
      label: 'I understand I can withdraw at any time',
      desc: 'You can turn off research contribution in Settings at any point. Previously submitted aggregated data cannot be individually withdrawn.',
    },
    {
      key: 'noClinical',
      label: 'I understand this is not a clinical service',
      desc: 'Research data contribution does not affect your medical care or clinical recommendations.',
    },
    {
      key: 'privacy',
      label: 'I have read and understand the Privacy Policy',
      desc: 'Data is stored using HIPAA-aligned practices with encryption at rest and in transit.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-3xl bg-background shadow-2xl border border-border"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-border flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-foreground">Research Consent</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Contribute to reproductive mental health research</p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <div className="bg-muted/40 rounded-xl p-4 space-y-2">
            <p className="text-sm text-foreground leading-relaxed">
              By consenting, you allow CycleMind to contribute <strong>de-identified, aggregated</strong> health
              tracking data to reproductive mental health research studies. This data helps advance understanding of
              PMDD, perinatal mood disorders, and menopause-related mental health.
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your contribution is governed by HIPAA-aligned practices and reviewed by our clinical team.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold text-foreground">Please confirm your understanding:</p>
            {consentItems.map((item) => (
              <label
                key={item.key}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                  agreedItems[item.key]
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:bg-muted/30'
                }`}
              >
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                  agreedItems[item.key]
                    ? 'bg-primary border-primary'
                    : 'border-muted-foreground/40'
                }`}>
                  {agreedItems[item.key] && <Check className="w-3.5 h-3.5 text-primary-foreground" />}
                </div>
                <div className="flex-1">
                  <input
                    type="checkbox"
                    checked={agreedItems[item.key]}
                    onChange={() => toggle(item.key)}
                    className="sr-only"
                  />
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex gap-3">
          <Button
            variant="outline"
            onClick={onDecline}
            className="flex-1 rounded-xl"
          >
            Decline
          </Button>
          <Button
            onClick={handleConsent}
            disabled={!allAgreed}
            className="flex-1 rounded-xl"
          >
            I Consent
          </Button>
        </div>

        <div className="px-6 pb-4 text-center">
          <p className="text-[10px] text-muted-foreground">
            CycleMind v{APP_VERSION} · HIPAA-aligned data practices
          </p>
        </div>
      </div>
    </div>
  );
}