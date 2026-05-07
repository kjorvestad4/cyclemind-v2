import { useState } from "react";
import { ExternalLink, Heart, AlertTriangle, BookOpen, Phone, Baby, Flame, Shield, Bookmark } from "lucide-react";
import { toast } from "sonner";

// ── Data ──────────────────────────────────────────────────────────────────────

const TABS = [
  { id: "menstrual", short: "Menstrual" },
  { id: "pregnancy", short: "Pregnancy" },
  { id: "menopause", short: "Menopause" },
  { id: "crisis", short: "Crisis 🆘" },
];

const CONTENT = {
  menstrual: {
    intro: "Evidence-based resources for PMS, PMDD, and menstrual health — curated with clinical care.",
    articles: [
      {
        icon: Heart,
        title: "What is PMDD?",
        tag: "Core Guide",
        tagColor: "bg-primary/10 text-primary",
        body: "Premenstrual Dysphoric Disorder (PMDD) affects 3–8% of menstruating people. Symptoms — severe mood swings, depression, anxiety, irritability — cluster in the 1–2 weeks before menstruation (luteal phase) and resolve within days of bleeding starting. PMDD is a recognised psychiatric diagnosis (DSM-5) and is treatable.",
        link: { label: "IAPMD Full PMDD Guide", url: "https://iapmd.org/about-pmdd" },
      },
      {
        icon: BookOpen,
        title: "The DRSP — How Clinical Tracking Works",
        tag: "Clinical Tool",
        tagColor: "bg-emerald-100 text-emerald-700",
        body: "The Daily Record of Severity of Problems (Endicott, Nee & Harrison, 2006) is the gold-standard validated tool for PMDD diagnosis. Rate 1–6 daily for two cycles. PMDD is indicated when luteal scores are ≥30% higher than follicular, and ≥3 symptoms average above mild. Your CycleMind Insights page performs this analysis automatically.",
        link: { label: "ACOG PMDD Clinical FAQ", url: "https://www.acog.org/womens-health/faqs/premenstrual-syndrome" },
      },
      {
        icon: AlertTriangle,
        title: "SSRI Timing for PMDD",
        tag: "Treatment Info",
        tagColor: "bg-orange-100 text-orange-700",
        body: "First-line treatment for PMDD is SSRIs (e.g. fluoxetine, sertraline). They can be taken continuously or luteal-phase only (days 14–28). Luteal-phase dosing has been shown effective with fewer side effects. Always discuss with your psychiatrist or GP — never adjust without guidance.",
        link: { label: "IAPMD Treatment Overview", url: "https://iapmd.org/treatments" },
      },
      {
        icon: BookOpen,
        title: "Lifestyle & Supplements",
        tag: "Self-Care",
        tagColor: "bg-secondary text-secondary-foreground",
        body: "Evidence supports: Calcium 1200mg/day, Vitamin B6, Magnesium, and Vitamin D for symptom reduction. Aerobic exercise 3–5×/week during the luteal phase significantly reduces mood symptoms. Reduce caffeine, alcohol, and sodium. Sleep hygiene is particularly important in the luteal phase.",
      },
      {
        icon: Shield,
        title: "When to Seek Help",
        tag: "Important",
        tagColor: "bg-destructive/10 text-destructive",
        body: "Seek urgent help if you experience suicidal thoughts, inability to function, or severe depressive episodes before your period. PMDD-related suicidality is real and well-documented. Your healthcare provider can escalate treatment quickly. You do not have to suffer.",
        link: { label: "NHS PMS Overview", url: "https://www.nhs.uk/conditions/pre-menstrual-syndrome/" },
      },
    ],
  },
  pregnancy: {
    intro: "Perinatal mental health resources for expectant and new parents, from conception through early parenthood.",
    articles: [
      {
        icon: Baby,
        title: "Perinatal Mood Disorders (PMDs)",
        tag: "Core Guide",
        tagColor: "bg-pink-100 text-pink-700",
        body: "Up to 1 in 5 pregnant people experience a perinatal mood or anxiety disorder (PMAD). These include prenatal depression, postpartum depression (PPD), anxiety, OCD, and postpartum psychosis. PMADs are the most common complication of childbirth — they are medical conditions, not personal failures.",
        link: { label: "Postpartum Support International", url: "https://www.postpartum.net" },
      },
      {
        icon: AlertTriangle,
        title: "Warning Signs to Act On Immediately",
        tag: "Urgent",
        tagColor: "bg-destructive/10 text-destructive",
        body: "Seek emergency help if you experience: thoughts of harming yourself or your baby, hearing or seeing things others don't, extreme confusion or disorientation, going days without sleep while not feeling tired. These may indicate postpartum psychosis — a psychiatric emergency requiring same-day care.",
        link: { label: "PSI Emergency Resources", url: "https://www.postpartum.net/get-help/helpline/" },
      },
      {
        icon: Heart,
        title: "Prenatal Depression & Anxiety",
        tag: "During Pregnancy",
        tagColor: "bg-pink-100 text-pink-700",
        body: "Depression and anxiety during pregnancy are common and underdiagnosed. Evidence-based treatments including therapy and medication are safe in pregnancy — discuss options with your OB or midwife.",
        link: { label: "ACOG Perinatal Mental Health", url: "https://www.acog.org/womens-health/faqs/postpartum-depression" },
      },
      {
        icon: BookOpen,
        title: "Safe Medication in Pregnancy & Postpartum",
        tag: "Treatment",
        tagColor: "bg-emerald-100 text-emerald-700",
        body: "SSRIs (particularly sertraline and fluoxetine) are generally considered compatible with pregnancy and breastfeeding. The risks of untreated depression to the fetus are well-documented. Your doctor or psychiatrist can help you make an informed, personalised decision.",
      },
      {
        icon: Shield,
        title: "Building Your Support Network",
        tag: "Self-Care",
        tagColor: "bg-secondary text-secondary-foreground",
        body: "Identify your primary support person before birth. Join a local or online perinatal support group. Ask your midwife about a specialist perinatal mental health referral. Complete the Edinburgh Postnatal Depression Scale (EPDS) at your postnatal check.",
        link: { label: "Find a PSI Provider", url: "https://www.postpartum.net/get-help/find-a-psi-provider-2/" },
      },
    ],
  },
  menopause: {
    intro: "Clinician-reviewed resources for perimenopause and menopause — focused on HRT, sleep, and mental health.",
    articles: [
      {
        icon: Flame,
        title: "Understanding Perimenopause & Menopause",
        tag: "Core Guide",
        tagColor: "bg-orange-100 text-orange-700",
        body: "Perimenopause begins years before menopause (average age 51) and is characterised by irregular cycles, hormonal fluctuations, hot flashes, sleep disruption, and mood changes. Menopause is confirmed after 12 consecutive months without a period.",
        link: { label: "Menopause Society – Patient Resources", url: "https://www.menopause.org/for-women/menopauseflashes" },
      },
      {
        icon: Heart,
        title: "HRT — The Evidence-Based Decision",
        tag: "Treatment",
        tagColor: "bg-orange-100 text-orange-700",
        body: "Hormone Replacement Therapy (HRT) is the most effective treatment for vasomotor symptoms. Modern transdermal HRT has an excellent safety profile for most women under 60. Discuss with your GP or menopause specialist.",
        link: { label: "NAMS HRT Decision Tool", url: "https://www.menopause.org/for-women/menopauseflashes/menopause-symptoms-and-treatments/hormone-therapy-is-it-right-for-you-" },
      },
      {
        icon: BookOpen,
        title: "Sleep Strategies for Menopause",
        tag: "Self-Care",
        tagColor: "bg-secondary text-secondary-foreground",
        body: "Sleep disruption affects up to 60% of menopausal women. Keep bedroom cool (below 18°C/65°F), use moisture-wicking bedding, avoid alcohol within 3 hours of sleep, and consider CBT-I (Cognitive Behavioural Therapy for Insomnia).",
      },
      {
        icon: AlertTriangle,
        title: "Mood Changes & Menopausal Depression",
        tag: "Mental Health",
        tagColor: "bg-primary/10 text-primary",
        body: "Oestrogen decline significantly affects serotonin and dopamine pathways, increasing risk of depression and anxiety. Many women are misdiagnosed with primary depression when HRT could address root hormonal causes.",
        link: { label: "British Menopause Society", url: "https://thebms.org.uk/publications/tools-for-clinicians/bms-menopause-and-mental-health/" },
      },
      {
        icon: Shield,
        title: "Tracking Symptoms for Your Appointment",
        tag: "Clinical",
        tagColor: "bg-primary/10 text-primary",
        body: "Bring your CycleMind data to appointments: hot flash frequency, sleep scores, PHQ-9/GAD-7 trends, and HRT medication logs. Use the 'Doctor Share' feature in Insights to generate a shareable clinical report.",
      },
    ],
  },
  crisis: {
    intro: "If you are in crisis or experiencing thoughts of self-harm, please use these resources immediately.",
    articles: [],
  },
};

const CRISIS_LINES = [
  { country: "US", name: "988 Suicide & Crisis Lifeline", contact: "Call or text 988", url: "https://988lifeline.org" },
  { country: "US", name: "Crisis Text Line", contact: "Text HOME to 741741", url: "https://www.crisistextline.org" },
  { country: "US", name: "Postpartum Support International", contact: "1-800-944-4773", url: "https://www.postpartum.net/get-help/helpline/" },
  { country: "UK", name: "Samaritans", contact: "116 123 (free, 24/7)", url: "https://www.samaritans.org" },
  { country: "UK", name: "PANDAS Perinatal Support", contact: "0808 1961 776", url: "https://pandasfoundation.org.uk" },
  { country: "AU", name: "Lifeline Australia", contact: "13 11 14", url: "https://www.lifeline.org.au" },
  { country: "AU", name: "PANDA Perinatal Mental Health", contact: "1300 726 306", url: "https://panda.org.au" },
  { country: "Intl", name: "Find a Crisis Line Near You", contact: "findahelpline.com", url: "https://findahelpline.com" },
];

function ArticleCard({ article, saved, onToggleSave }) {
  const Icon = article.icon;
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4 space-y-3 relative">
      <div className="flex items-start gap-3 pr-8">
        <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center shrink-0 mt-0.5">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-sm font-semibold text-foreground">{article.title}</span>
            {article.tag && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${article.tagColor}`}>{article.tag}</span>
            )}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{article.body}</p>
          {article.link && (
            <a
              href={article.link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-primary hover:underline"
            >
              {article.link.label} <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
      <button
        onClick={() => onToggleSave(article.title)}
        className={`absolute top-3 right-3 p-1.5 rounded-lg transition-colors ${
          saved ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-primary hover:bg-muted"
        }`}
      >
        <Bookmark className={`w-3.5 h-3.5 ${saved ? "fill-primary" : ""}`} />
      </button>
    </div>
  );
}

function CrisisTab() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border-2 border-destructive/30 bg-destructive/5 p-4 space-y-2">
        <div className="flex items-center gap-2">
          <Phone className="w-5 h-5 text-destructive" />
          <span className="text-sm font-bold text-destructive">If you are in immediate danger, call 911 (US) or your local emergency number now.</span>
        </div>
        <p className="text-xs text-muted-foreground">
          PMDD, perinatal mood disorders, and menopausal depression can all cause suicidal thoughts. These are symptoms of an illness — not who you are. Help is available and treatment works.
        </p>
      </div>
      <div className="space-y-3">
        {CRISIS_LINES.map((line) => (
          <a
            key={line.name}
            href={line.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-2xl border border-border/60 bg-card p-4 hover:bg-muted/30 transition-colors"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-semibold">{line.country}</span>
                <span className="text-sm font-semibold text-foreground">{line.name}</span>
              </div>
              <p className="text-xs font-mono text-primary mt-0.5">{line.contact}</p>
            </div>
            <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0" />
          </a>
        ))}
      </div>
    </div>
  );
}

export default function Resources() {
  const [activeTab, setActiveTab] = useState("menstrual");
  const [saved, setSaved] = useState([]);

  const content = CONTENT[activeTab];

  const toggleSave = (title) => {
    setSaved((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
    toast.success(saved.includes(title) ? "Removed from saved" : "Saved!");
  };

  return (
    <div className="space-y-5 pb-10">
      <div>
        <h2 className="font-serif text-2xl font-semibold">Resources</h2>
        <p className="text-xs text-muted-foreground mt-1">Psychiatrist-reviewed content for every stage of your journey.</p>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-4 gap-1 bg-muted rounded-2xl p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-2 rounded-xl text-[11px] font-semibold transition-all ${
              activeTab === tab.id
                ? "bg-card shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.short}
          </button>
        ))}
      </div>

      <p className="text-xs text-muted-foreground px-1">{content?.intro}</p>

      {activeTab === "crisis" && <CrisisTab />}

      {activeTab !== "crisis" && (
        <div className="space-y-3">
          {content?.articles.map((article) => (
            <ArticleCard
              key={article.title}
              article={article}
              saved={saved.includes(article.title)}
              onToggleSave={toggleSave}
            />
          ))}
        </div>
      )}

      {saved.length > 0 && activeTab !== "crisis" && (
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 space-y-2">
          <p className="text-xs font-semibold text-primary flex items-center gap-1.5">
            <Bookmark className="w-3.5 h-3.5 fill-primary" /> Saved ({saved.length})
          </p>
          {saved.map((title) => (
            <p key={title} className="text-xs text-muted-foreground">• {title}</p>
          ))}
        </div>
      )}

      <div className="bg-muted/40 rounded-xl p-4 text-center">
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          ⚕️ Content is for informational purposes only. Not a substitute for professional medical advice. Always consult your qualified healthcare provider.
        </p>
      </div>
    </div>
  );
}