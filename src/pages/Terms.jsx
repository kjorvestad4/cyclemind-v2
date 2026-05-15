import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText } from 'lucide-react';

export default function Terms() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-5 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <span className="font-serif text-xl font-bold text-teal-700">CycleMind — Terms of Use</span>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-5 py-12 space-y-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-teal-100 flex items-center justify-center">
            <FileText className="w-6 h-6 text-teal-700" />
          </div>
          <div>
            <h1 className="font-serif text-3xl font-bold text-gray-900">Terms of Use</h1>
            <p className="text-sm text-gray-500">Last updated: May 2026</p>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-sm text-red-800">
          <strong>Medical Disclaimer:</strong> CycleMind is an informational and symptom-tracking tool only. It does NOT provide medical diagnoses, treatment recommendations, or replace professional healthcare. Always consult a qualified healthcare provider for medical decisions.
        </div>

        {[
          {
            title: "1. Acceptance of Terms",
            content: [
              "By creating an account and using CycleMind, you agree to these Terms of Use.",
              "If you do not agree, please do not use the app.",
              "We may update these terms periodically. Continued use constitutes acceptance.",
            ]
          },
          {
            title: "2. Not Medical Advice",
            content: [
              "CycleMind is a wellness and symptom tracking app, NOT a medical device.",
              "The DRSP, PHQ-9, GAD-7, and EPDS tools are provided for informational self-tracking purposes only.",
              "Luna AI provides supportive conversation only — not clinical diagnosis or treatment.",
              "Always consult a licensed healthcare provider for medical decisions, diagnosis, or treatment.",
              "In a medical emergency, call 911 (US) or your local emergency number immediately.",
            ]
          },
          {
            title: "3. Eligibility",
            content: [
              "You must be at least 13 years old to use CycleMind.",
              "By using the app, you represent that you meet this age requirement.",
            ]
          },
          {
            title: "4. Account Responsibilities",
            content: [
              "You are responsible for maintaining the security of your account.",
              "Do not share your login credentials with others.",
              "You are responsible for all activity under your account.",
              "Notify us immediately of any unauthorized access at hello@cyclemind.app.",
            ]
          },
          {
            title: "5. Acceptable Use",
            content: [
              "Use CycleMind only for lawful personal health tracking purposes.",
              "Do not attempt to reverse-engineer, scrape, or misuse the platform.",
              "Do not use Luna AI to generate harmful, abusive, or medically reckless content.",
              "Do not attempt to use the app to diagnose or treat others without appropriate clinical training.",
            ]
          },
          {
            title: "6. Premium Subscription",
            content: [
              "Premium features require a paid subscription.",
              "Subscriptions auto-renew unless cancelled before the renewal date.",
              "Founder's Plan pricing is locked for life as long as the subscription remains active.",
              "Refunds are handled on a case-by-case basis — contact hello@cyclemind.app.",
            ]
          },
          {
            title: "7. Data & Privacy",
            content: [
              "Your use of CycleMind is also governed by our Privacy Policy.",
              "You own your health data. We are stewards of it.",
              "You can export or delete your data at any time from the Profile page.",
            ]
          },
          {
            title: "8. Limitation of Liability",
            content: [
              "CycleMind is provided 'as is' without warranties of any kind.",
              "We are not liable for decisions made based on information in the app.",
              "We are not liable for any medical outcomes resulting from use or non-use of the app.",
              "Our maximum liability to you is limited to the amount you paid in the past 12 months.",
            ]
          },
          {
            title: "9. Intellectual Property",
            content: [
              "All content, branding, and technology in CycleMind is owned by CycleMind and its founders.",
              "You may not reproduce, distribute, or create derivative works without written permission.",
            ]
          },
          {
            title: "10. Termination",
            content: [
              "We reserve the right to terminate accounts that violate these terms.",
              "You may delete your account at any time from the Profile page.",
              "Upon termination, your data is deleted per our Privacy Policy.",
            ]
          },
        ].map(({ title, content }) => (
          <section key={title} className="space-y-3">
            <h2 className="font-bold text-lg text-gray-900">{title}</h2>
            <ul className="space-y-2">
              {content.map((item, i) => (
                <li key={i} className="flex gap-2 text-sm text-gray-600 leading-relaxed">
                  <span className="text-teal-500 mt-1 shrink-0">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>
        ))}

        <div className="border-t border-gray-200 pt-8 text-sm text-gray-500">
          <p>Questions? Contact us at <a href="mailto:hello@cyclemind.app" className="text-teal-600 hover:underline">hello@cyclemind.app</a></p>
          <p className="mt-2">© {new Date().getFullYear()} CycleMind. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}