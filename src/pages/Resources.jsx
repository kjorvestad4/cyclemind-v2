import { ExternalLink, Heart, AlertTriangle, BookOpen, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const RESOURCES = [
  {
    title: "What is PMDD?",
    content: "Premenstrual Dysphoric Disorder (PMDD) is a severe form of PMS that affects 3–8% of menstruating women. Symptoms include intense mood swings, depression, anxiety, and irritability that occur during the luteal phase (the 1–2 weeks before your period) and improve within a few days of menstruation starting.",
    icon: Heart,
  },
  {
    title: "What is PMS?",
    content: "Premenstrual Syndrome (PMS) affects up to 75% of menstruating women. Symptoms are milder than PMDD but still significantly impact quality of life. Common symptoms include bloating, breast tenderness, mood changes, food cravings, and fatigue.",
    icon: BookOpen,
  },
  {
    title: "The DRSP Questionnaire",
    content: "The Daily Record of Severity of Problems (DRSP) is a validated clinical tool developed by Endicott, Nee & Harrison. It's the gold standard for tracking PMS/PMDD symptoms and is widely used in clinical research and diagnosis. This app follows the official DRSP scoring method.",
    icon: BookOpen,
  },
  {
    title: "How Scoring Works",
    content: "Rate each symptom 1–6 daily (1 = not at all, 6 = extreme). After two cycles, the app compares your luteal phase (last ~14 days before period) to your follicular phase. If your luteal scores are ≥30% higher than follicular scores — and more than 3 symptoms average above mild (3) — this pattern is consistent with PMS/PMDD.",
    icon: AlertTriangle,
  },
];

const LINKS = [
  { label: "IAPMD – International Association for Premenstrual Disorders", url: "https://iapmd.org" },
  { label: "ACOG – Premenstrual Syndrome FAQ", url: "https://www.acog.org/womens-health/faqs/premenstrual-syndrome" },
  { label: "NHS – PMS Overview", url: "https://www.nhs.uk/conditions/pre-menstrual-syndrome/" },
  { label: "NIMH – Premenstrual Dysphoric Disorder", url: "https://www.nimh.nih.gov" },
];

export default function Resources() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-semibold">Resources</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Understanding PMDD, PMS, and how tracking helps.
        </p>
      </div>

      {RESOURCES.map((res) => {
        const Icon = res.icon;
        return (
          <Card key={res.title} className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Icon className="w-4 h-4 text-primary" />
                {res.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground leading-relaxed">{res.content}</p>
            </CardContent>
          </Card>
        );
      })}

      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <ExternalLink className="w-4 h-4 text-primary" />
            Helpful Links
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {LINKS.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-xs text-primary hover:underline"
            >
              {link.label} ↗
            </a>
          ))}
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Phone className="w-4 h-4 text-destructive" />
            Crisis Support
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground leading-relaxed">
            If you're in crisis or having thoughts of self-harm, please reach out immediately:
          </p>
          <p className="text-xs font-semibold mt-2">
            988 Suicide & Crisis Lifeline: Call or text <strong>988</strong> (US)
          </p>
          <p className="text-xs font-semibold">
            Crisis Text Line: Text <strong>HOME</strong> to <strong>741741</strong>
          </p>
        </CardContent>
      </Card>

      <div className="bg-muted/50 rounded-xl p-4 text-center">
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          ⚕️ This app is not a substitute for professional medical advice, diagnosis, or treatment.
          Always seek the advice of your physician or other qualified health provider with any
          questions you may have regarding a medical condition.
        </p>
      </div>
    </div>
  );
}