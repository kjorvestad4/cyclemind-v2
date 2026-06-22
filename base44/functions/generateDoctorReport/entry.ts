import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { jsPDF } from 'npm:jspdf@4.0.0';
import { format, parseISO, subDays, differenceInDays } from 'npm:date-fns@3.6.0';

// ─── Helpers ────────────────────────────────────────────────────────────────

function capitalize(str) {
  return str.replace(/\b\w/g, l => l.toUpperCase());
}

function symptomLabel(key) {
  return capitalize(key.replace(/^(s_|m_|p_|pp_)/, '').replace(/_/g, ' '));
}

function getSeverityInfo(score) {
  if (score >= 15) return { label: 'Mod-Severe', r: 192, g: 57, b: 43 };
  if (score >= 10) return { label: 'Moderate',   r: 211, g: 84, b: 0 };
  if (score >= 5)  return { label: 'Mild',        r: 39,  g: 174, b: 96 };
  return               { label: 'Minimal',        r: 127, g: 140, b: 141 };
}

function calculateDayTotal(entry) {
  const keys = Object.keys(entry).filter(k =>
    k.startsWith('s_') || k.startsWith('m_') || k.startsWith('p_') || k.startsWith('pp_')
  );
  return keys.reduce((sum, k) => sum + (entry[k] || 0), 0);
}

// Draw a horizontal bar (filled rect) from x, at y, with given width/height
function drawBar(doc, x, y, w, h, r, g, b) {
  doc.setFillColor(r, g, b);
  if (h > 0) doc.rect(x, y, w, h, 'F');
}

// Section header: teal band + white title, returns new y after header
function sectionHeader(doc, margin, y, width, title) {
  doc.setFillColor(15, 90, 70);
  doc.rect(margin, y, width, 7, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(title, margin + 4, y + 5);
  return y + 7;
}

// Light card background
function cardBg(doc, margin, y, width, height) {
  doc.setFillColor(248, 251, 249);
  doc.setDrawColor(220, 235, 228);
  doc.setLineWidth(0.3);
  doc.rect(margin, y, width, height, 'FD');
}

// Dotted horizontal rule
function hRule(doc, margin, y, width) {
  doc.setDrawColor(210, 225, 218);
  doc.setLineWidth(0.3);
  doc.setLineDash([1, 2]);
  doc.line(margin, y, margin + width, y);
  doc.setLineDash([]);
}

// ─── Main handler ────────────────────────────────────────────────────────────

// Fetch image URL and convert to base64 data URI for jsPDF
async function fetchImageAsBase64(url) {
  const res = await fetch(url);
  const buf = await res.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  const b64 = btoa(binary);
  const mime = res.headers.get('content-type') || 'image/png';
  return `data:${mime};base64,${b64}`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { includeJournal, includeMedications, includeScreening, includeChart, includeAppointmentPrep, start_date, end_date } = await req.json();
    const startDate = start_date ? parseISO(start_date) : subDays(new Date(), 90);
    const endDate   = end_date   ? parseISO(end_date)   : new Date();

    const cycles  = await base44.entities.Cycle.filter({ user_id: user.id });
    const allEntries = await base44.entities.DailyEntry.filter({});
    const entries = allEntries
      .filter(e => { const d = parseISO(e.date); return d >= startDate && d <= endDate; })
      .sort((a, b) => a.date.localeCompare(b.date));

    // ── Stats ──
    const avgCycleLength = cycles.length
      ? Math.round(cycles.reduce((s, c) => s + (c.cycle_length || 28), 0) / cycles.length)
      : null;

    const phq9Scores = entries.filter(e => e.phq9_score != null).map(e => e.phq9_score);
    const gad7Scores = entries.filter(e => e.gad7_score != null).map(e => e.gad7_score);
    const epdsScores = entries.filter(e => e.epds_score != null).map(e => e.epds_score);
    const avg = arr => arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length) : null;
    const avgPHQ9 = avg(phq9Scores);
    const avgGAD7 = avg(gad7Scores);
    const avgEPDS = avg(epdsScores);

    // ── Symptom counts (moderate+ = >=3) ──
    const symptomCounts = {};
    entries.forEach(e => {
      Object.entries(e).forEach(([k, v]) => {
        if ((k.startsWith('s_') || k.startsWith('m_') || k.startsWith('p_') || k.startsWith('pp_')) && v >= 3) {
          symptomCounts[k] = (symptomCounts[k] || 0) + 1;
        }
      });
    });
    const topSymptoms = Object.entries(symptomCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([key, count]) => ({ key, name: symptomLabel(key), days: count }));

    // ── Weekly severity ──
    const weekMap = {};
    entries.forEach(e => {
      const d = parseISO(e.date);
      const wk = format(subDays(d, d.getDay()), 'MMM d');
      if (!weekMap[wk]) weekMap[wk] = { sum: 0, n: 0 };
      const keys = Object.keys(e).filter(k => k.startsWith('s_') || k.startsWith('m_') || k.startsWith('p_') || k.startsWith('pp_'));
      if (keys.length) {
        weekMap[wk].sum += keys.reduce((s, k) => s + (e[k] || 0), 0) / keys.length;
        weekMap[wk].n++;
      }
    });
    const weeklyTrend = Object.entries(weekMap)
      .map(([wk, d]) => ({ wk, avg: parseFloat((d.sum / d.n).toFixed(2)) }))
      .sort((a, b) => new Date(a.wk) - new Date(b.wk))
      .slice(-10);

    // ── Mood vs Physical daily ──
    const MOOD_KEYS     = ['s_depressed','s_anxious','s_mood_swings','s_angry','s_hopeless','s_sensitive','s_overwhelmed','s_out_of_control'];
    const PHYSICAL_KEYS = ['s_breast_tender','s_bloating','s_headache','s_pain','s_cramping','s_insomnia','s_appetite'];
    const dailyTrend = entries.slice(-28).map(e => ({
      date:     format(parseISO(e.date), 'M/d'),
      mood:     parseFloat((MOOD_KEYS.reduce((s, k) => s + (e[k] || 0), 0) / MOOD_KEYS.length).toFixed(2)),
      physical: parseFloat((PHYSICAL_KEYS.reduce((s, k) => s + (e[k] || 0), 0) / PHYSICAL_KEYS.length).toFixed(2)),
    }));

    // ── Luteal vs Follicular comparison (if menstrual cycles) ──
    const LUTEAL_LEN = 14;
    let lutealAvg = null, follAvg = null;
    if (cycles.length >= 1) {
      const lutealScores = [], follScores = [];
      cycles.slice(0, 3).forEach(cycle => {
        const cStart = parseISO(cycle.start_date);
        const cLen   = cycle.cycle_length || 28;
        const cEnd   = new Date(cStart.getTime() + cLen * 86400000);
        const cEntries = entries.filter(e => {
          const d = parseISO(e.date);
          return d >= cStart && d < cEnd;
        });
        cEntries.forEach((e, i) => {
          const dayNum = i + 1;
          const keys = Object.keys(e).filter(k => k.startsWith('s_') || k.startsWith('m_'));
          if (!keys.length) return;
          const avg = keys.reduce((s, k) => s + (e[k] || 0), 0) / keys.length;
          if (dayNum > cLen - LUTEAL_LEN) lutealScores.push(avg);
          else follScores.push(avg);
        });
      });
      if (lutealScores.length) lutealAvg = parseFloat((lutealScores.reduce((a,b)=>a+b,0)/lutealScores.length).toFixed(2));
      if (follScores.length)   follAvg   = parseFloat((follScores.reduce((a,b)=>a+b,0)/follScores.length).toFixed(2));
    }

    // ── Medications ──
    const medMap = {};
    if (includeMedications) {
      entries.forEach(e => {
        (e.medications_taken || []).forEach(m => { medMap[m] = (medMap[m] || 0) + 1; });
      });
    }
    const meds = Object.entries(medMap).sort((a,b)=>b[1]-a[1]).slice(0,10);

    // ── Journal entries ──
    const journals = includeJournal
      ? entries.filter(e => e.journal_entry && e.journal_entry.trim()).slice(-5)
      : [];

    // ── Fetch logo ──
    let logoDataUri = null;
    try {
      logoDataUri = await fetchImageAsBase64('https://media.base44.com/images/public/69fb50354d2f1f828f13182f/1f6e3c73e_generated_image.png');
    } catch (e) {
      console.warn('Logo fetch failed, falling back to text:', e.message);
    }

    // ────────────────────────────────────────────────────────────────────────
    // BUILD PDF
    // ────────────────────────────────────────────────────────────────────────
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const PW = 210, PH = 297;
    const M = 14;           // margin
    const CW = PW - M * 2;  // content width
    const FOOTER_H = 18;
    const PAGE_BOTTOM = PH - FOOTER_H - 4;

    let y = 0;

    // ── Helper: ensure we have space, add page if not ──
    function ensureSpace(needed) {
      if (y + needed > PAGE_BOTTOM) {
        addFooter();
        doc.addPage();
        y = 18;
      }
    }

    // ── HEADER (Page 1 only) ──
    // Full-width teal header band
    doc.setFillColor(15, 90, 70);
    doc.rect(0, 0, PW, 38, 'F');

    // Subtle accent strip at bottom of header
    doc.setFillColor(20, 140, 100);
    doc.rect(0, 36, PW, 2, 'F');

    // Logo image or fallback circle
    if (logoDataUri) {
      doc.addImage(logoDataUri, 'PNG', M, 5, 18, 18);
    } else {
      doc.setFillColor(255, 255, 255);
      doc.circle(M + 8, 14, 8, 'F');
    }

    // App name
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('CycleMind', M + 22, 16);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(180, 230, 210);
    doc.text('Clinical Summary Report  |  DRSP-Based Assessment', M + 22, 23);

    // Patient + date (right-aligned)
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(255, 255, 255);
    doc.text(`Patient: ${user.full_name || 'Anonymous'}`, PW - M, 14, { align: 'right' });
    doc.text(`Generated: ${format(new Date(), 'MMM d, yyyy')}`, PW - M, 21, { align: 'right' });
    doc.text(`Period: ${format(startDate, 'MMM d')} to ${format(endDate, 'MMM d, yyyy')}`, PW - M, 28, { align: 'right' });

    y = 44;

    // ── SUMMARY METRICS BAR ──
    const metricBoxW = CW / 4;
    const metricItems = [
      { label: 'Days Tracked',   value: `${entries.length}` },
      { label: 'Cycles',         value: `${cycles.length}` },
      { label: 'Avg Cycle',      value: avgCycleLength ? `${avgCycleLength}d` : 'N/A' },
      { label: 'Report Span',    value: `${differenceInDays(endDate, startDate)}d` },
    ];
    metricItems.forEach((m, i) => {
      const x = M + i * metricBoxW;
      doc.setFillColor(i % 2 === 0 ? 232 : 240, i % 2 === 0 ? 244 : 249, i % 2 === 0 ? 238 : 244);
      doc.rect(x, y, metricBoxW, 14, 'F');
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 90, 70);
      doc.text(m.value, x + metricBoxW / 2, y + 8, { align: 'center' });
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 120, 110);
      doc.text(m.label, x + metricBoxW / 2, y + 12.5, { align: 'center' });
    });

    // Border under metrics
    doc.setDrawColor(200, 220, 210);
    doc.setLineWidth(0.4);
    doc.line(M, y + 14, M + CW, y + 14);
    y += 18;

    // ── SECTION: MOOD SCREENING SCORES ──
    if (includeScreening && (avgPHQ9 != null || avgGAD7 != null || avgEPDS != null)) {
      ensureSpace(40);
      const scores = [];
      if (avgPHQ9 != null) scores.push({ name: 'PHQ-9', subtitle: 'Depression', value: avgPHQ9.toFixed(1), ...getSeverityInfo(avgPHQ9) });
      if (avgGAD7 != null) scores.push({ name: 'GAD-7', subtitle: 'Anxiety',    value: avgGAD7.toFixed(1), ...getSeverityInfo(avgGAD7) });
      if (avgEPDS != null) scores.push({ name: 'EPDS',  subtitle: 'Postpartum', value: avgEPDS.toFixed(1), ...getSeverityInfo(avgEPDS) });

      const secH = 9 + scores.length * 10 + 4;
      cardBg(doc, M, y, CW, secH);
      const yAfter = sectionHeader(doc, M, y, CW, 'Mood Screening — Average Scores');
      let sy = yAfter + 5;

      scores.forEach((sc, i) => {
        const barMaxW = CW - 80;
        const barW = Math.min((parseFloat(sc.value) / 27) * barMaxW, barMaxW);
        const bx = M + 55;
        const by = sy - 3.5;

        // Score name
        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(40, 60, 50);
        doc.text(`${sc.name}`, M + 4, sy);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(100);
        doc.text(`(${sc.subtitle})`, M + 19, sy);

        // Numeric value
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(sc.r, sc.g, sc.b);
        doc.text(sc.value, M + 42, sy, { align: 'right' });

        // Severity label
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(sc.r, sc.g, sc.b);
        doc.text(`${sc.label}`, M + 44, sy);

        // Bar background
        doc.setFillColor(220, 235, 228);
        doc.rect(bx, by, barMaxW, 4, 'F');
        // Bar fill
        drawBar(doc, bx, by, barW, 4, sc.r, sc.g, sc.b);

        if (i < scores.length - 1) hRule(doc, M + 4, sy + 4, CW - 8);
        sy += 10;
      });

      y += secH + 5;
    }

    // ── SECTION: TOP SYMPTOMS TABLE ──
    if (topSymptoms.length > 0) {
      const rowH = 7;
      const secH = 9 + topSymptoms.length * rowH + 6;
      ensureSpace(secH);
      cardBg(doc, M, y, CW, secH);
      const yAfter = sectionHeader(doc, M, y, CW, `Top Symptoms  (moderate+ severity, last ${differenceInDays(endDate,startDate)} days)`);
      let sy = yAfter + 5;

      const maxDays = topSymptoms[0]?.days || 1;
      const barAreaW = CW - 90;

      topSymptoms.forEach((sym, i) => {
        // Alternating row bg
        if (i % 2 === 0) {
          doc.setFillColor(240, 248, 244);
          doc.rect(M, sy - 4.5, CW, rowH, 'F');
        }

        // Rank
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 90, 70);
        doc.text(`${i + 1}`, M + 4, sy);

        // Symptom name
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(40);
        doc.text(sym.name, M + 11, sy);

        // Days count
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 90, 70);
        doc.text(`${sym.days}d`, M + 72, sy, { align: 'right' });

        // Bar
        const bx = M + 75;
        const by = sy - 4;
        const bw = (sym.days / maxDays) * barAreaW;
        doc.setFillColor(210, 230, 222);
        doc.rect(bx, by, barAreaW, 3.5, 'F');
        const intensity = Math.round(15 + (sym.days / maxDays) * 75);
        drawBar(doc, bx, by, bw, 3.5, 15, intensity, 70);

        sy += rowH;
      });

      y += secH + 5;
    }

    // ── SECTION: WEEKLY SEVERITY TREND (BAR CHART) ──
    if (includeChart && weeklyTrend.length >= 2) {
      const chartH = 45;
      const secH = 9 + chartH + 16;
      ensureSpace(secH);
      cardBg(doc, M, y, CW, secH);
      const yAfter = sectionHeader(doc, M, y, CW, 'Weekly Average Symptom Severity (Scale 1-6)');
      let sy = yAfter + 6;

      const barW = Math.min(16, (CW - 16) / weeklyTrend.length - 2);
      const gap  = ((CW - 16) / weeklyTrend.length) - barW;
      const baseY = sy + chartH;
      const maxVal = Math.max(...weeklyTrend.map(d => d.avg), 0.1);

      // Y-axis grid lines (1–6)
      for (let v = 1; v <= 6; v++) {
        const gy = baseY - (v / 6) * chartH;
        doc.setDrawColor(210, 225, 218);
        doc.setLineWidth(0.2);
        doc.setLineDash([1.5, 2]);
        doc.line(M + 8, gy, M + CW - 4, gy);
        doc.setLineDash([]);
        doc.setFontSize(6);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(140);
        doc.text(`${v}`, M + 5, gy + 1, { align: 'right' });
      }

      // Moderate reference line at 3
      const modY = baseY - (3 / 6) * chartH;
      doc.setDrawColor(200, 100, 100);
      doc.setLineWidth(0.5);
      doc.setLineDash([2, 2]);
      doc.line(M + 8, modY, M + CW - 4, modY);
      doc.setLineDash([]);
      doc.setFontSize(6);
      doc.setTextColor(180, 60, 60);
      doc.text('moderate', M + CW - 3, modY - 0.5, { align: 'right' });

      weeklyTrend.forEach((d, i) => {
        const bx = M + 10 + i * (barW + gap);
        const bh = Math.max((d.avg / 6) * chartH, 1);
        const by = baseY - bh;

        // Color based on severity
        const r = d.avg >= 4 ? 192 : d.avg >= 3 ? 211 : 15;
        const g = d.avg >= 4 ? 57  : d.avg >= 3 ? 84  : 90;
        const b = d.avg >= 4 ? 43  : d.avg >= 3 ? 0   : 70;
        drawBar(doc, bx, by, barW, bh, r, g, b);

        // Value above bar
        doc.setFontSize(6.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(r, g, b);
        doc.text(d.avg.toFixed(1), bx + barW / 2, by - 1, { align: 'center' });

        // X label
        doc.setFontSize(5.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100);
        doc.text(d.wk, bx + barW / 2, baseY + 4.5, { align: 'center' });
      });

      y += secH + 5;
    }

    // ── SECTION: MOOD vs PHYSICAL TREND (LINE CHART) ──
    if (includeChart && dailyTrend.length >= 5) {
      const chartH = 40;
      const secH = 9 + chartH + 18;
      ensureSpace(secH);
      cardBg(doc, M, y, CW, secH);
      const yAfter = sectionHeader(doc, M, y, CW, 'Daily Mood vs Physical Symptoms (last 28 days, scale 1-6)');
      const sy = yAfter + 5;
      const baseY = sy + chartH;
      const cStartX = M + 10;
      const cWidth = CW - 18;

      // Grid
      for (let v = 0; v <= 6; v += 2) {
        const gy = baseY - (v / 6) * chartH;
        doc.setDrawColor(210, 225, 218);
        doc.setLineWidth(0.2);
        doc.setLineDash([1.5, 2]);
        doc.line(cStartX, gy, cStartX + cWidth, gy);
        doc.setLineDash([]);
        doc.setFontSize(6);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(140);
        doc.text(`${v}`, cStartX - 2, gy + 1, { align: 'right' });
      }

      // Mood line (teal)
      doc.setDrawColor(15, 90, 70);
      doc.setLineWidth(1.2);
      dailyTrend.forEach((d, i) => {
        const px = cStartX + (i / (dailyTrend.length - 1)) * cWidth;
        const py = baseY - (d.mood / 6) * chartH;
        if (i === 0) { doc.moveTo ? null : null; return; }
        const ppx = cStartX + ((i-1) / (dailyTrend.length - 1)) * cWidth;
        const ppy = baseY - (dailyTrend[i-1].mood / 6) * chartH;
        doc.line(ppx, ppy, px, py);
      });

      // Physical line (orange)
      doc.setDrawColor(200, 100, 30);
      doc.setLineWidth(1.2);
      dailyTrend.forEach((d, i) => {
        if (i === 0) return;
        const px  = cStartX + (i / (dailyTrend.length - 1)) * cWidth;
        const py  = baseY - (d.physical / 6) * chartH;
        const ppx = cStartX + ((i-1) / (dailyTrend.length - 1)) * cWidth;
        const ppy = baseY - (dailyTrend[i-1].physical / 6) * chartH;
        doc.line(ppx, ppy, px, py);
      });

      // X-axis labels (every ~7 days)
      dailyTrend.forEach((d, i) => {
        if (i % 7 === 0 || i === dailyTrend.length - 1) {
          const px = cStartX + (i / (dailyTrend.length - 1)) * cWidth;
          doc.setFontSize(5.5);
          doc.setTextColor(120);
          doc.text(d.date, px, baseY + 4, { align: 'center' });
        }
      });

      // Legend
      const lx = M + CW - 52;
      const ly = sy + 3;
      doc.setFillColor(15, 90, 70);
      doc.rect(lx, ly, 7, 1.5, 'F');
      doc.setFontSize(7);
      doc.setTextColor(40);
      doc.text('Mood', lx + 9, ly + 1.5);

      doc.setFillColor(200, 100, 30);
      doc.rect(lx, ly + 5, 7, 1.5, 'F');
      doc.text('Physical', lx + 9, ly + 6.5);

      y += secH + 5;
    }

    // ── SECTION: LUTEAL vs FOLLICULAR ──
    if (lutealAvg != null && follAvg != null) {
      const secH = 9 + 30;
      ensureSpace(secH);
      cardBg(doc, M, y, CW, secH);
      const yAfter = sectionHeader(doc, M, y, CW, 'Luteal vs Follicular Phase Comparison');
      let sy = yAfter + 8;

      const maxPhase = Math.max(lutealAvg, follAvg, 0.1);
      const barMaxW  = CW / 2 - 30;
      const diff     = lutealAvg - follAvg;
      const isPMDD   = diff > 1.0;

      [
        { label: 'Luteal Phase',     val: lutealAvg, r: 192, g: 57, b: 43 },
        { label: 'Follicular Phase', val: follAvg,   r: 15,  g: 90, b: 70 },
      ].forEach(p => {
        const bw = (p.val / 6) * barMaxW;
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(50);
        doc.text(p.label, M + 4, sy);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(p.r, p.g, p.b);
        doc.text(p.val.toFixed(2), M + 50, sy, { align: 'right' });

        doc.setFillColor(220, 235, 228);
        doc.rect(M + 55, sy - 4.5, barMaxW, 5, 'F');
        drawBar(doc, M + 55, sy - 4.5, bw, 5, p.r, p.g, p.b);
        sy += 10;
      });

      // PMDD flag
      if (isPMDD) {
        doc.setFillColor(255, 240, 238);
        doc.setDrawColor(192, 57, 43);
        doc.setLineWidth(0.4);
        doc.rect(M + 4, sy - 2, CW - 8, 8, 'FD');
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(192, 57, 43);
        doc.text(`⚠  Luteal symptoms ${diff.toFixed(1)} pts higher than follicular — consistent with PMDD pattern.`, M + 7, sy + 3.5);
      } else {
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100);
        doc.text(`Luteal - Follicular difference: ${diff.toFixed(2)} (threshold for PMDD pattern: >1.0)`, M + 4, sy + 2);
      }

      y += secH + 5;
    }

    // ── SECTION: MEDICATIONS ──
    if (includeMedications && meds.length > 0) {
      const rowH = 6.5;
      const secH = 9 + meds.length * rowH + 4;
      ensureSpace(secH);
      cardBg(doc, M, y, CW, secH);
      const yAfter = sectionHeader(doc, M, y, CW, 'Medications & Supplements Logged');
      let sy = yAfter + 5;
      const maxMedDays = meds[0][1];

      meds.forEach(([med, days], i) => {
        if (i % 2 === 0) { doc.setFillColor(240, 248, 244); doc.rect(M, sy - 4, CW, rowH, 'F'); }
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(40);
        doc.text(med, M + 4, sy);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 90, 70);
        doc.text(`${days}d`, M + CW - 4, sy, { align: 'right' });
        const bw = (days / maxMedDays) * (CW - 90);
        doc.setFillColor(210, 235, 225);
        doc.rect(M + 70, sy - 3.5, CW - 90, 3.5, 'F');
        drawBar(doc, M + 70, sy - 3.5, bw, 3.5, 15, 130, 100);
        sy += rowH;
      });
      y += secH + 5;
    }

    // ── SECTION: JOURNAL ENTRIES ──
    if (journals.length > 0) {
      ensureSpace(20);
      const yStart = y;
      const yAfter = sectionHeader(doc, M, yStart, CW, 'Selected Journal Entries');
      y = yAfter + 4;

      journals.forEach(entry => {
        const dateStr = format(parseISO(entry.date), 'MMMM d, yyyy');
        const text    = (entry.journal_entry || '').substring(0, 300);
        const lines   = doc.splitTextToSize(text, CW - 12);
        const needed  = 7 + lines.length * 4.5 + 6;
        ensureSpace(needed);

        cardBg(doc, M, y, CW, needed);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 90, 70);
        doc.text(dateStr, M + 4, y + 5.5);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(50);
        doc.text(lines, M + 4, y + 11);
        y += needed + 4;
      });
    }

    // ── SECTION: APPOINTMENT PREP ──
    if (includeAppointmentPrep) {
      const questions = [
        'Are my symptoms consistent with PMDD, PME, or another hormonal condition?',
        'What treatment options do you recommend (SSRIs, lifestyle, hormonal therapy)?',
        'Should I adjust the timing of any current medications?',
        'Are my screening scores (PHQ-9, GAD-7) a concern?',
        'Would you recommend a referral to a psychiatrist or reproductive specialist?',
      ];
      const secH = 9 + 12 + (topSymptoms.length > 0 ? 8 : 0) + questions.length * 6 + 8;
      ensureSpace(secH);
      cardBg(doc, M, y, CW, secH);
      const yAfter = sectionHeader(doc, M, y, CW, 'Appointment Preparation Checklist');
      let sy = yAfter + 6;

      if (topSymptoms.length > 0) {
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 90, 70);
        doc.text('Primary concerns to raise:', M + 4, sy);
        sy += 5;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(50);
        doc.text(topSymptoms.slice(0, 4).map(s => s.name).join('  |  '), M + 4, sy);
        sy += 8;
        hRule(doc, M + 4, sy - 3, CW - 8);
      }

      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 90, 70);
      doc.text('Questions for your provider:', M + 4, sy);
      sy += 5;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(50);
      questions.forEach((q, i) => {
        doc.setFillColor(15, 90, 70);
        doc.circle(M + 6, sy - 1, 1, 'F');
        doc.text(q, M + 10, sy);
        sy += 6;
      });

      y += secH + 5;
    }

    // ── FOOTER on all pages ──
    function addFooter() {
      const pc = doc.internal.getNumberOfPages();
      doc.setPage(pc);
      doc.setFillColor(15, 90, 70);
      doc.rect(0, PH - FOOTER_H, PW, 1.5, 'F');
      doc.setFillColor(245, 251, 248);
      doc.rect(0, PH - FOOTER_H + 1.5, PW, FOOTER_H - 1.5, 'F');
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100);
      doc.text('Based on the Daily Record of Severity of Problems (Endicott, Nee & Harrison, 2006).  For informational purposes only - not a diagnostic tool.', M, PH - 8);
      doc.text('Always consult a qualified healthcare provider before making any medical decisions.', M, PH - 4);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 90, 70);
      doc.text(`Page ${pc}`, PW - M, PH - 6, { align: 'right' });
    }

    addFooter();

    return new Response(doc.output('arraybuffer'), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="CycleMind_Report_${format(new Date(), 'yyyy-MM-dd')}.pdf"`,
      },
    });
  } catch (error) {
    console.error('PDF error:', error);
    return Response.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
});