import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { addDays, differenceInDays, parseISO } from 'npm:date-fns@3.6.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all cycles for this user
    const cycles = await base44.entities.Cycle.filter({ created_by: user.email });
    
    if (cycles.length === 0) {
      return Response.json({ 
        error: 'No cycle data available',
        next_period_start: null,
        ovulation_window: null,
        confidence_score: 0,
        explanation: 'Please log at least one cycle to receive predictions.'
      });
    }

    // Sort cycles by start date (most recent first)
    const sortedCycles = [...cycles].sort((a, b) => 
      new Date(b.start_date) - new Date(a.start_date)
    );

    const latestCycle = sortedCycles[0];
    const cycleLengths = sortedCycles
      .filter(c => c.cycle_length && c.cycle_length > 0)
      .map(c => c.cycle_length);

    // Calculate average cycle length
    const avgCycleLength = cycleLengths.length > 0
      ? cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length
      : 28;

    // Calculate standard deviation
    const stdDev = cycleLengths.length > 1
      ? Math.sqrt(cycleLengths.reduce((sum, len) => sum + Math.pow(len - avgCycleLength, 2), 0) / cycleLengths.length)
      : 0;

    // Predict next period start
    const lastStartDate = new Date(latestCycle.start_date);
    const predictedNextPeriod = addDays(lastStartDate, Math.round(avgCycleLength));

    // Predict ovulation window (14 days before next period, +/- 2 days)
    const predictedOvulation = addDays(predictedNextPeriod, -14);
    const ovulationWindowStart = addDays(predictedOvulation, -2);
    const ovulationWindowEnd = addDays(predictedOvulation, 2);

    // Calculate confidence score based on data quality
    let confidenceScore = 50; // Base confidence
    
    if (cycleLengths.length >= 3) confidenceScore += 20;
    if (cycleLengths.length >= 6) confidenceScore += 15;
    if (stdDev < 3) confidenceScore += 15; // Regular cycles
    else if (stdDev < 5) confidenceScore += 8;
    
    confidenceScore = Math.min(100, Math.round(confidenceScore));

    // Generate explanation
    const explanation = `Based on ${cycleLengths.length} cycle(s) with an average length of ${avgCycleLength.toFixed(1)} days (±${stdDev.toFixed(1)} days), your next period is predicted to start on ${predictedNextPeriod.toISOString().split('T')[0]}. Your fertile window is estimated from ${ovulationWindowStart.toISOString().split('T')[0]} to ${ovulationWindowEnd.toISOString().split('T')[0]}, with ovulation likely around ${predictedOvulation.toISOString().split('T')[0]}. ${stdDev < 3 ? 'Your cycles are very regular, which increases prediction accuracy.' : 'Cycle length variability may affect prediction precision.'}`;

    // Store prediction
    const prediction = await base44.entities.Prediction.create({
      user_id: user.id,
      prediction_type: 'cycle',
      next_period_start: predictedNextPeriod.toISOString().split('T')[0],
      ovulation_window_start: ovulationWindowStart.toISOString().split('T')[0],
      ovulation_window_end: ovulationWindowEnd.toISOString().split('T')[0],
      confidence_score: confidenceScore,
      explanation: explanation,
      data_points_analyzed: cycleLengths.length,
      generated_date: new Date().toISOString().split('T')[0]
    });

    return Response.json({
      next_period_start: predictedNextPeriod.toISOString().split('T')[0],
      ovulation_window: {
        start: ovulationWindowStart.toISOString().split('T')[0],
        end: ovulationWindowEnd.toISOString().split('T')[0]
      },
      confidence_score: confidenceScore,
      explanation: explanation,
      prediction_id: prediction.id
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});