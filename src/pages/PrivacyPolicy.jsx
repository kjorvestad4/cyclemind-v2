import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield } from 'lucide-react';

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-5 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <span className="font-serif text-xl font-bold text-teal-700">CycleMind — Privacy Policy</span>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-5 py-12 space-y-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-teal-100 flex items-center justify-center">
            <Shield className="w-6 h-6 text-teal-700" />
          </div>
          <div>
            <h1 className="font-serif text-3xl font-bold text-gray-900">Privacy Policy</h1>
            <p className="text-sm text-gray-500">Last updated: August 2026</p>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-sm text-amber-800">
          <strong>Important:</strong> CycleMind collects sensitive health information. Please read this policy carefully. By using CycleMind, you consent to the data practices described below.
        </div>

        {[
          {
            title: "1. What Data We Collect",
            content: [
              "Account information: email address, display name, and date of birth (optional).",
              "Health data: menstrual cycle dates, symptoms, mood ratings, medication logs, vital signs, journal entries, and responses to validated clinical screening tools (PHQ-9, GAD-7, DRSP, EPDS).",
              "Usage data: app interactions, feature usage, and session data to improve the experience.",
              "Voice data: if you use voice logging, audio is processed in real-time and is not stored permanently.",
            ]
          },
          {
            title: "2. How We Use Your Data",
            content: [
              "To provide personalized cycle tracking, symptom analysis, and AI-powered insights.",
              "To generate clinical reports you choose to share with healthcare providers.",
              "To improve the accuracy of cycle predictions and pattern analysis.",
              "We do NOT sell your health data to third parties.",
              "We do NOT use your health data for advertising purposes.",
            ]
          },
          {
            title: "3. Data Storage & Security",
            content: [
              "All data is encrypted in transit (TLS) and at rest.",
              "CycleMind is a consumer wellness app. Because Luna chat can fall back to cloud language-model providers, we do not claim HIPAA compliance.",
              "Doctor share links are time-limited (30 days) and can be revoked at any time.",
              "You can export or delete all your data at any time from the Profile page.",
            ]
          },
          {
            title: "4. AI & Luna Chat",
            content: [
              "Luna prefers a local model when available. If that fails, conversation text may be sent to cloud language-model providers as a fallback.",
              "Because those cloud fallbacks can process chat text, Luna conversations are not treated as HIPAA-covered.",
              "Luna conversations may be used in aggregate, anonymized form to improve response quality.",
              "Luna does NOT provide medical diagnoses. All responses are for informational and supportive purposes only.",
              "If you disclose a crisis situation, Luna will provide safety resources (including 988) but does not alert emergency services.",
            ]
          },
          {
            title: "5. Data Sharing",
            content: [
              "We share data only with your explicit consent (e.g., when you create a doctor share link).",
              "We use trusted infrastructure providers (database, cloud hosting) under data processing agreements.",
              "We may disclose data if required by law or to protect safety.",
            ]
          },
          {
            title: "6. Your Rights",
            content: [
              "Access: You can view all your data in the app at any time.",
              "Export: Download your full data from Profile → Data Export.",
              "Deletion: Delete your account and all associated data from Profile → Delete Account.",
              "Correction: Update your profile and cycle information at any time.",
              "If you have questions or requests, contact us at: hello@cyclemind.app",
            ]
          },
          {
            title: "7. Children's Privacy",
            content: [
              "CycleMind is intended for users 13 years and older.",
              "If you are under 18, please use the app with parental awareness.",
              "We do not knowingly collect data from children under 13.",
            ]
          },
          {
            title: "8. Changes to This Policy",
            content: [
              "We may update this policy as the app evolves. You will be notified of material changes via email or in-app notice.",
              "Continued use of CycleMind after changes constitutes acceptance of the updated policy.",
            ]
          },
          {
            title: "9. Data Types We Collect",
            content: [
              "Health & Fitness: Menstrual cycle data, symptom ratings, mood scores, vital signs, and clinical screening results (PHQ-9, GAD-7, DRSP, EPDS). Linked to identity. Used for app functionality.",
              "Contact Info: Email address. Linked to identity. Used for account management and support.",
              "Identifiers: User ID. Linked to identity. Used for app functionality.",
              "Usage Data: Feature usage and session data. Not linked to identity. Used for analytics and improvement.",
              "Audio Data: Voice recordings for symptom logging. Processed in real-time. Not stored permanently.",
              "Diagnostics: Crash data and performance data. Not linked to identity. Used for app improvement.",
            ]
          },
          {
            title: "10. Third-Party SDKs and Services",
            content: [
              "Cloud language-model fallbacks: If the local Luna model is unavailable, chat text may be sent to third-party AI providers to generate a response.",
              "Base44 SDK: Provides backend infrastructure, authentication, and database services. Data stored on encrypted servers.",
              "Google / Web Search: Used only when Luna fetches external context. No personal data is sent.",
              "Payment processors: Checkout is not available in this release. We do not collect payment card data.",
            ]
          },
          {
            title: "11. Data Retention",
            content: [
              "Account data is retained for the lifetime of your account.",
              "Health tracking data (cycles, entries, symptoms) is retained until you delete it or your account.",
              "Doctor share links expire automatically after 30 days.",
              "De-identified research data (if you opt in) is retained indefinitely in aggregated form.",
              "Audit logs are retained for security and accountability.",
              "Session data and temporary voice recordings are deleted immediately after processing.",
            ]
          },
          {
            title: "12. CCPA / CPRA Compliance (California Residents)",
            content: [
              "California residents have the right to know what personal information is collected, sold, or shared.",
              "Right to delete: You can request deletion of your personal data via Profile → Delete Account.",
              "Right to opt-out of sale: CycleMind does not sell personal information.",
              "Right to limit use of sensitive personal information: Health data is used only for app functionality and improvement, not for advertising.",
              "Right to non-discrimination: We will not discriminate against you for exercising your privacy rights.",
              "To exercise these rights, contact us at hello@cyclemind.app.",
            ]
          },
          {
            title: "13. Data Security Measures",
            content: [
              "Encryption in transit: All data is transmitted over TLS 1.2+ (HTTPS).",
              "Encryption at rest: All stored data is encrypted using AES-256.",
              "Access controls: Role-based access control (RBAC) with least-privilege principles.",
              "Audit logging: Create, update, and delete actions on health data are logged for security and accountability.",
              "Session management: Sessions expire after 30 minutes of inactivity.",
              "Regular security reviews: We conduct periodic security assessments of our infrastructure.",
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