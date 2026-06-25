import { useState, useMemo, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ExternalLink, Heart, AlertTriangle, BookOpen, Phone, Baby, Flame, Shield, Bookmark, Search, X, Info } from "lucide-react";
import { toast } from "sonner";
import { getUserTier, TIERS } from "@/lib/freemium";
import PremiumBanner from "@/components/common/PremiumBanner";

// ── Crisis Lines ──────────────────────────────────────────────────────────────

const CRISIS_LINES = [
  { country: "US", name: "988 Suicide & Crisis Lifeline", contact: "Call or text 988", url: "https://988lifeline.org" },
  { country: "US", name: "Crisis Text Line", contact: 'Text "HOME" to 741741', url: "https://www.crisistextline.org" },
  { country: "US", name: "National Maternal Mental Health Hotline", contact: "1-833-TLC-MAMA (24/7)", url: "https://mchb.hrsa.gov/programs-impact/national-maternal-mental-health-hotline" },
  { country: "US", name: "Postpartum Support International Helpline", contact: "1-800-944-4773", url: "https://www.postpartum.net/get-help/helpline/" },
  { country: "UK", name: "Samaritans", contact: "116 123 (free, 24/7)", url: "https://www.samaritans.org" },
  { country: "UK", name: "PANDAS Perinatal Support", contact: "0808 1961 776", url: "https://pandasfoundation.org.uk" },
  { country: "AU", name: "Lifeline Australia", contact: "13 11 14", url: "https://www.lifeline.org.au" },
  { country: "AU", name: "PANDA Perinatal Mental Health", contact: "1300 726 306", url: "https://panda.org.au" },
  { country: "Intl", name: "Find a Crisis Line Near You", contact: "findahelpline.com", url: "https://findahelpline.com" },
];

// ── Per-section hotline banners ───────────────────────────────────────────────

const SECTION_HOTLINES = {
  menstrual: { text: "In crisis? PMDD can cause suicidal thoughts. Call or text 988 (US) · 116 123 (UK) · Text HOME to 741741", color: "border-destructive/30 bg-destructive/5 text-destructive" },
  pregnancy: { text: "National Maternal Mental Health Hotline: 1-833-TLC-MAMA (24/7, free, multilingual) · 988 for crisis support", color: "border-pink-200 bg-pink-50 text-pink-700 dark:border-pink-800 dark:bg-pink-950/30 dark:text-pink-300" },
  postpartum: { text: "Postpartum Support International: 1-800-944-4773 · 988 Lifeline · Text HOME to 741741", color: "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-950/30 dark:text-purple-300" },
  menopause: { text: "Struggling with mood or menopausal depression? Call or text 988 (US) · Samaritans: 116 123 (UK)", color: "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950/30 dark:text-orange-300" },
};

// ── Resource content ──────────────────────────────────────────────────────────

const ALL_RESOURCES = [
  // ── MENSTRUAL CYCLES — General Education ──
  {
    id: "mc-acog-basics",
    tab: "menstrual",
    icon: BookOpen,
    title: "ACOG — Understanding Your Menstrual Cycle",
    tag: "Education",
    tagColor: "bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300",
    body: "A comprehensive patient FAQ from the American College of Obstetricians and Gynecologists covering normal cycle length, what irregular periods mean, and when to see a doctor.",
    links: [
      { label: "ACOG Menstrual Cycles FAQ", url: "https://www.acog.org/womens-health/faqs/abnormal-uterine-bleeding" },
      { label: "ACOG: The Menstrual Cycle", url: "https://www.acog.org/womens-health/infographics/the-menstrual-cycle" },
    ],
  },
  {
    id: "mc-iapmd-tracker",
    tab: "menstrual",
    icon: Heart,
    title: "IAPMD — Why Track Your Cycle?",
    tag: "Education",
    tagColor: "bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-950",
    body: "IAPMD explains why prospective daily tracking (like what CycleMind provides) is essential for PMDD diagnosis and treatment monitoring. Tracking two full cycles is required for DSM-5 PMDD diagnosis.",
    links: [
      { label: "IAPMD: Tracking Your Symptoms", url: "https://iapmd.org/about-pmdd" },
    ],
  },

  // ── MENSTRUAL / PMDD ──
  {
    id: "pmdd-iapmd",
    tab: "menstrual",
    icon: Heart,
    title: "IAPMD — Official PMDD Resource",
    tag: "Core Guide",
    tagColor: "bg-primary/10 text-primary",
    body: "The International Association for Premenstrual Disorders is the leading global resource for PMDD and PME. Includes symptom info, diagnosis guidance, support groups, and a community directory.",
    links: [
      { label: "IAPMD Official Site", url: "https://www.iapmd.org/" },
      { label: "Support Groups", url: "https://www.iapmd.org/support" },
    ],
  },
  {
    id: "pmdd-treatments",
    tab: "menstrual",
    icon: Shield,
    title: "IAPMD Evidence-Based Treatments Guide",
    tag: "Treatment",
    tagColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    body: "A clinically-reviewed breakdown of treatments with strong evidence for PMDD: SSRIs (luteal-phase or continuous), GnRH agonists, hormonal contraceptives, CBT, and dietary interventions. Includes evidence ratings for each approach.",
    links: [
      { label: "IAPMD Treatments Guide", url: "https://www.iapmd.org/treatments-strong-evidence" },
    ],
  },
  {
    id: "pmdd-infokit",
    tab: "menstrual",
    icon: BookOpen,
    title: "Free PMD InfoKit",
    tag: "Patient Resource",
    tagColor: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    body: "IAPMD's comprehensive information kit on Premenstrual Disorders. Designed for patients and clinicians — ideal to bring to appointments or share with a GP who is unfamiliar with PMDD.",
    links: [
      { label: "Download Free InfoKit", url: "https://www.iapmd.org/shop/p/iapmd-premenstrual-disorders-pmd-infokit" },
    ],
  },
  {
    id: "pmdd-drsp",
    tab: "menstrual",
    icon: BookOpen,
    title: "DRSP — How Clinical Tracking Works",
    tag: "Clinical Tool",
    tagColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    body: "The Daily Record of Severity of Problems (Endicott, Nee & Harrison, 2006) is the gold-standard validated tool for PMDD diagnosis. Rate 1–6 daily for two cycles. PMDD is indicated when luteal scores are ≥30% higher than follicular, with ≥3 symptoms averaging above mild. CycleMind's Insights page performs this analysis automatically.",
    links: [
      { label: "ACOG PMDD Clinical FAQ", url: "https://www.acog.org/womens-health/faqs/premenstrual-syndrome" },
    ],
  },
  {
    id: "pmdd-ssri",
    tab: "menstrual",
    icon: AlertTriangle,
    title: "SSRI Timing for PMDD",
    tag: "Treatment Info",
    tagColor: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
    body: "First-line treatment for PMDD is SSRIs (e.g. fluoxetine, sertraline). They can be taken continuously or luteal-phase only (days 14–28). Luteal-phase dosing has been shown effective with fewer side effects. Always discuss with your psychiatrist or GP — never adjust without guidance.",
    links: [
      { label: "IAPMD Treatments Guide", url: "https://www.iapmd.org/treatments-strong-evidence" },
    ],
  },
  {
    id: "pmdd-lifestyle",
    tab: "menstrual",
    icon: Heart,
    title: "Lifestyle & Supplements",
    tag: "Self-Care",
    tagColor: "bg-secondary text-secondary-foreground",
    body: "Evidence supports: Calcium 1200mg/day, Vitamin B6, Magnesium, and Vitamin D for symptom reduction. Aerobic exercise 3–5×/week during the luteal phase significantly reduces mood symptoms. Reduce caffeine, alcohol, and sodium. Sleep hygiene is especially important in the luteal phase.",
  },

  // ── PREGNANCY ──
  {
    id: "preg-acog-toolkit",
    tab: "pregnancy",
    icon: Heart,
    title: "ACOG Perinatal Mental Health Toolkit",
    tag: "Core Guide",
    tagColor: "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300",
    body: "The American College of Obstetricians and Gynecologists' comprehensive perinatal mental health resource, including screening guidelines, clinical tools, and patient materials for depression and anxiety during and after pregnancy.",
    links: [
      { label: "ACOG Perinatal Mental Health", url: "https://www.acog.org/programs/perinatal-mental-health" },
    ],
  },
  {
    id: "preg-epds",
    tab: "pregnancy",
    icon: BookOpen,
    title: "EPDS Screening — What Your Score Means",
    tag: "Screening",
    tagColor: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    body: "The Edinburgh Postnatal Depression Scale (Cox et al., 1987) is validated for both prenatal and postnatal use. Score 0–8: Low concern. 9–11: Monitor closely. 12–14: Likely depression. ≥15: High concern — seek immediate clinical assessment. ACOG recommends screening at least once prenatally and at the 6-week postnatal visit.",
    links: [
      { label: "ACOG Screening & Diagnosis Guideline", url: "https://www.acog.org/clinical/clinical-guidance/clinical-practice-guideline/articles/2023/06/screening-and-diagnosis-of-mental-health-conditions-during-pregnancy-and-postpartum" },
    ],
  },
  {
    id: "preg-warning",
    tab: "pregnancy",
    icon: AlertTriangle,
    title: "Warning Signs to Act On Immediately",
    tag: "Urgent",
    tagColor: "bg-destructive/10 text-destructive",
    body: "Seek emergency help immediately if you experience: thoughts of harming yourself or your baby, hearing or seeing things others don't, extreme confusion or disorientation, going days without sleep without feeling tired. These may indicate postpartum psychosis — a psychiatric emergency requiring same-day care.",
    links: [
      { label: "PSI Emergency Resources", url: "https://www.postpartum.net/get-help/helpline/" },
    ],
  },
  {
    id: "preg-meds",
    tab: "pregnancy",
    icon: Shield,
    title: "Safe Medication in Pregnancy",
    tag: "Treatment",
    tagColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    body: "SSRIs (particularly sertraline and fluoxetine) are generally considered compatible with pregnancy and breastfeeding. The risks of untreated depression to the fetus are well documented — this is an important clinical discussion, not a reason to avoid treatment. Your doctor or psychiatrist can guide you.",
  },
  {
    id: "preg-support",
    tab: "pregnancy",
    icon: Baby,
    title: "Building Your Perinatal Support Network",
    tag: "Self-Care",
    tagColor: "bg-secondary text-secondary-foreground",
    body: "Identify your primary support person before birth. Join a local or online perinatal support group. Ask your midwife or OB about a specialist perinatal mental health referral. Complete the EPDS at your postnatal check and share your CycleMind data with your care team.",
    links: [
      { label: "Find a PSI Provider", url: "https://postpartum.net/get-help/provider-directory/" },
    ],
  },

  // ── POSTPARTUM ──
  {
    id: "pp-psi",
    tab: "postpartum",
    icon: Baby,
    title: "Postpartum Support International (PSI)",
    tag: "Core Guide",
    tagColor: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
    body: "PSI is the leading global resource for postpartum mood and anxiety disorders. Provides a helpline, provider directory, peer support groups, and resources for partners and families. PMADs affect 1 in 5 new mothers — they are medical conditions, not personal failures.",
    links: [
      { label: "PSI Official Site", url: "https://www.postpartum.net/" },
      { label: "Find a PSI Provider", url: "https://postpartum.net/get-help/provider-directory/" },
    ],
  },
  {
    id: "pp-acog",
    tab: "postpartum",
    icon: BookOpen,
    title: "ACOG Postpartum Depression Resources",
    tag: "Clinical Guide",
    tagColor: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    body: "ACOG clinical guidance on postpartum depression: screening, diagnosis, and treatment. Includes the distinction between baby blues (normal, resolves by 2 weeks) and PPD (persistent, treatable with therapy and/or medication).",
    links: [
      { label: "ACOG PPD Resources", url: "https://www.acog.org/womens-health/faqs/postpartum-depression" },
    ],
  },
  {
    id: "pp-epds",
    tab: "postpartum",
    icon: Shield,
    title: "EPDS Self-Help + When to Seek Care",
    tag: "Screening",
    tagColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    body: "Track your EPDS score weekly in the CycleMind log. Score ≥10 warrants a conversation with your provider. Score ≥13 suggests likely depression. Question 10 (self-harm thoughts) should always trigger an urgent clinical conversation regardless of total score. You deserve support — the sooner you reach out, the faster you'll recover.",
  },
  {
    id: "pp-baby-blues",
    tab: "postpartum",
    icon: Heart,
    title: "Baby Blues vs. Postpartum Depression",
    tag: "Core Info",
    tagColor: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
    body: "Baby blues affect up to 80% of new mothers in the first 2 weeks and resolve without treatment. PPD is more intense, lasts longer, and requires support. PPD can occur any time in the first year. Postpartum anxiety, OCD, and psychosis are also real conditions — don't dismiss symptoms that concern you.",
    links: [
      { label: "PSI: About Perinatal Mental Health", url: "https://postpartum.net/perinatal-mental-health/" },
    ],
  },
  {
    id: "pp-recovery",
    tab: "postpartum",
    icon: Info,
    title: "Physical Recovery — What's Normal",
    tag: "Self-Care",
    tagColor: "bg-secondary text-secondary-foreground",
    body: "Lochia (postpartum bleeding) typically lasts 4–6 weeks. Perineal or incision pain usually improves significantly by 6 weeks. Breast engorgement peaks day 3–5. Urinary incontinence affects 1 in 3 postpartum women — pelvic floor physiotherapy is highly effective. Always flag symptoms that concern you to your midwife or healthcare provider.",
  },

  // ── PERIMENOPAUSE — General Education ──
  {
    id: "peri-nams-what-is",
    tab: "menopause",
    icon: BookOpen,
    title: "NAMS — What is Perimenopause?",
    tag: "Education",
    tagColor: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    body: "The North American Menopause Society explains the perimenopause transition: what it is, when it starts (typically mid-40s), how long it lasts, and what symptoms to expect. Includes guidance on irregular periods, hot flashes, and mood changes.",
    links: [
      { label: "NAMS: Understanding Perimenopause", url: "https://menopause.org/patient-education" },
    ],
  },
  {
    id: "peri-acog-guide",
    tab: "menopause",
    icon: Shield,
    title: "ACOG — Menopause & Perimenopause Guide",
    tag: "Education",
    tagColor: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
    body: "ACOG's patient-facing guide on perimenopause and menopause: what's normal, diagnosis, hormone therapy decisions, and alternatives. Explains when periods become irregular and what workup may be needed.",
    links: [
      { label: "ACOG Menopause FAQ", url: "https://www.acog.org/womens-health/faqs/the-menopause-years" },
    ],
  },
  {
    id: "peri-british-meno-society",
    tab: "menopause",
    icon: Heart,
    title: "British Menopause Society — Patient Hub",
    tag: "Education",
    tagColor: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
    body: "Comprehensive patient education from the BMS covering perimenopause symptoms, HRT options, mental health during the menopause transition, and lifestyle interventions. Includes downloadable resources.",
    links: [
      { label: "Women's Health Concern (BMS Patient Hub)", url: "https://www.womens-health-concern.org/help-and-advice/menopause-wellness-hub/" },
      { label: "BMS Tools for Clinicians", url: "https://thebms.org.uk/publications/tools-for-clinicians/" },
    ],
  },

  // ── PERI/MENOPAUSE ──
  {
    id: "meno-nams",
    tab: "menopause",
    icon: Flame,
    title: "North American Menopause Society (NAMS)",
    tag: "Core Guide",
    tagColor: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
    body: "NAMS is the leading clinical authority on menopause care in North America. Their patient-facing resources include symptom guides, treatment information, and a directory of certified menopause practitioners.",
    links: [
      { label: "NAMS Patient Resources", url: "https://menopause.org/" },
    ],
  },
  {
    id: "meno-menonotes",
    tab: "menopause",
    icon: BookOpen,
    title: "MenoNotes Series — Hot Flashes, Mood & HRT",
    tag: "Patient Guides",
    tagColor: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
    body: "NAMS's concise, evidence-based patient education series. Covers hot flash management, mood changes, sleep disruption, vaginal health, and the HRT decision. Ideal for preparation before a menopause specialist appointment.",
    links: [
      { label: "MenoNotes Series", url: "https://menopause.org/patient-education/menonotes" },
    ],
  },
  {
    id: "meno-hrt",
    tab: "menopause",
    icon: Heart,
    title: "HRT Decision Guide",
    tag: "Treatment",
    tagColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    body: "Hormone Replacement Therapy (HRT) is the most effective treatment for vasomotor symptoms (hot flashes, night sweats). Modern transdermal HRT has an excellent safety profile for most women under 60 without contraindications. Discusses types: estrogen-only, combined, and bioidentical options.",
    links: [
      { label: "NAMS: Hormone Therapy Guide", url: "https://menopause.org/patient-education/menopause-topics/hormone-therapy" },
    ],
  },
  {
    id: "meno-mood",
    tab: "menopause",
    icon: AlertTriangle,
    title: "Mood Symptom Management in Menopause",
    tag: "Mental Health",
    tagColor: "bg-primary/10 text-primary",
    body: "Estrogen decline significantly affects serotonin and dopamine pathways, increasing risk of depression and anxiety. Many women are misdiagnosed with primary depression when HRT could address hormonal root causes. SSRIs and SNRIs also have evidence for vasomotor symptoms in women who can't take HRT.",
    links: [
      { label: "British Menopause Society", url: "https://thebms.org.uk/publications/tools-for-clinicians/bms-menopause-and-mental-health/" },
    ],
  },
  {
    id: "meno-sleep",
    tab: "menopause",
    icon: Shield,
    title: "Sleep Strategies for Menopause",
    tag: "Self-Care",
    tagColor: "bg-secondary text-secondary-foreground",
    body: "Sleep disruption affects up to 60% of menopausal women. Keep bedroom below 18°C/65°F, use moisture-wicking bedding, avoid alcohol within 3 hours of sleep, and consider CBT-I (Cognitive Behavioural Therapy for Insomnia). Track sleep quality in CycleMind to bring data to your appointment.",
  },
  {
    id: "meno-tracking",
    tab: "menopause",
    icon: Info,
    title: "Tracking Symptoms for Your Appointment",
    tag: "Clinical",
    tagColor: "bg-primary/10 text-primary",
    body: "Bring your CycleMind data to appointments: hot flash frequency, sleep scores, PHQ-9/GAD-7 trends, and HRT medication logs. Use the 'Doctor Share' feature in Insights to generate a shareable clinical PDF report for your menopause specialist.",
  },
];

const TABS = [
  { id: "menstrual", label: "Menstrual / PMDD", emoji: "🌙" },
  { id: "pregnancy", label: "Pregnancy", emoji: "🤰" },
  { id: "postpartum", label: "Postpartum", emoji: "🍼" },
  { id: "menopause", label: "Peri / Menopause", emoji: "🔥" },
  { id: "crisis", label: "Crisis Help", emoji: "🆘" },
];

// ── Sub-components ────────────────────────────────────────────────────────────

function HotlineBanner({ hotline }) {
  return (
    <div className={`rounded-2xl border-2 p-3 flex items-start gap-2.5 ${hotline.color}`}>
      <Phone className="w-4 h-4 shrink-0 mt-0.5" />
      <p className="text-xs font-semibold leading-snug">{hotline.text}</p>
    </div>
  );
}

function ResourceCard({ resource, saved, onToggleSave }) {
  const Icon = resource.icon;
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4 space-y-3 relative hover:shadow-sm transition-shadow">
      <div className="flex items-start gap-3 pr-8">
        <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center shrink-0 mt-0.5">
          <Icon className="w-4.5 h-4.5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <span className="text-sm font-semibold text-foreground leading-snug">{resource.title}</span>
            {resource.tag && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${resource.tagColor}`}>
                {resource.tag}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{resource.body}</p>
          {resource.links && resource.links.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-2.5">
              {resource.links.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  {link.label} <ExternalLink className="w-3 h-3" />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
      <button
        onClick={() => onToggleSave(resource.id)}
        title={saved ? "Remove from saved" : "Save to My Library"}
        className={`absolute top-3 right-3 p-1.5 rounded-lg transition-colors ${
          saved ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-primary hover:bg-muted"
        }`}
      >
        <Bookmark className={`w-3.5 h-3.5 ${saved ? "fill-primary" : ""}`} />
      </button>
    </div>
  );
}

function CrisisSection() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border-2 border-destructive/40 bg-destructive/5 p-4 space-y-2">
        <div className="flex items-center gap-2">
          <Phone className="w-5 h-5 text-destructive shrink-0" />
          <span className="text-sm font-bold text-destructive">
            If you are in immediate danger, call 911 (US), 999 (UK), or your local emergency number now.
          </span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          PMDD, perinatal mood disorders, and menopausal depression can all cause suicidal thoughts. These are symptoms of illness — not who you are. Help is available and effective treatment exists.
        </p>
      </div>
      <div className="space-y-2.5">
        {CRISIS_LINES.map((line) => (
          <a
            key={line.name}
            href={line.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-2xl border border-border/60 bg-card p-4 hover:bg-muted/30 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-bold">{line.country}</span>
                <span className="text-sm font-semibold text-foreground">{line.name}</span>
              </div>
              <p className="text-xs font-mono text-primary mt-0.5">{line.contact}</p>
            </div>
            <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0 ml-3" />
          </a>
        ))}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function Resources() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("menstrual");
  const [saved, setSaved] = useState([]);
  const [search, setSearch] = useState("");
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const toggleSave = (id) => {
    const isNowSaved = !saved.includes(id);
    setSaved((prev) => isNowSaved ? [...prev, id] : prev.filter((s) => s !== id));
    toast.success(isNowSaved ? "Saved to My Library 🔖" : "Removed from library");
  };

  const tabResources = useMemo(() => {
    const base = ALL_RESOURCES.filter((r) => r.tab === activeTab);
    if (!search.trim()) return base;
    const q = search.toLowerCase();
    return base.filter((r) =>
      r.title.toLowerCase().includes(q) ||
      r.body.toLowerCase().includes(q) ||
      (r.tag || "").toLowerCase().includes(q)
    );
  }, [activeTab, search]);

  const savedResources = useMemo(() =>
    ALL_RESOURCES.filter((r) => saved.includes(r.id)),
    [saved]
  );

  const hotline = SECTION_HOTLINES[activeTab];

  return (
    <div className="space-y-5 pb-24">
      {/* Premium Banner for Free Users */}
      {user && getUserTier(user) === TIERS.FREE && (
        <PremiumBanner />
      )}

      {/* Header */}
      <div>
        <h2 className="font-serif text-2xl font-semibold tracking-tight">Resources</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Evidence-based support, curated with psychiatrist input.</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          placeholder="Search resources…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-10 pl-9 pr-9 rounded-2xl border border-border bg-card text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all"
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Saved Library toggle */}
      {saved.length > 0 && (
        <button
          onClick={() => setShowSaved(!showSaved)}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl border-2 transition-all ${
            showSaved ? "border-primary bg-primary/5" : "border-border bg-card"
          }`}
        >
          <span className="flex items-center gap-2 text-sm font-semibold">
            <Bookmark className={`w-4 h-4 ${showSaved ? "fill-primary text-primary" : "text-muted-foreground"}`} />
            My Library
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">{saved.length}</span>
          </span>
          <span className="text-xs text-muted-foreground">{showSaved ? "Hide" : "Show"}</span>
        </button>
      )}

      {showSaved && (
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground px-1">Saved Resources</p>
          {savedResources.map((r) => (
            <ResourceCard key={r.id} resource={r} saved={true} onToggleSave={toggleSave} />
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setSearch(""); }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-semibold whitespace-nowrap transition-all shrink-0 ${
              activeTab === tab.id
                ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
            }`}
          >
            <span>{tab.emoji}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Crisis section */}
      {activeTab === "crisis" && <CrisisSection />}

      {/* Resource sections */}
      {activeTab !== "crisis" && (
        <div className="space-y-4">
          {/* Per-section hotline */}
          {hotline && !search && <HotlineBanner hotline={hotline} />}

          {tabResources.length === 0 && (
            <div className="rounded-2xl border border-border/40 bg-muted/30 p-8 text-center">
              <p className="text-sm text-muted-foreground">No resources match "{search}"</p>
            </div>
          )}

          {tabResources.map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              saved={saved.includes(resource.id)}
              onToggleSave={toggleSave}
            />
          ))}
        </div>
      )}

      {/* Disclaimer */}
      <div className="bg-muted/40 rounded-2xl p-4 text-center">
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          ⚕️ Resources curated with psychiatrist input. Not a substitute for professional medical advice, diagnosis, or treatment. Always consult your qualified healthcare provider.
        </p>
      </div>
    </div>
  );
}