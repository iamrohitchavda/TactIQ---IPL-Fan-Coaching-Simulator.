import type { AnalysisResult } from '../types';

interface AnalysisParams {
  overNumber: number;
  matchSituation: string;
  batsmanName: string;
  strikerSR: number;
  weakness: string;
  pitchCondition: string;
  fanPlacements: string[];
  fanBowler: string;
  fanBowlerType: string;
  actualPlacements: string[];
  actualBowler: string;
  overResult: string;
}

function generateFallbackScore(params: AnalysisParams): AnalysisResult {
  const matched = params.fanPlacements.filter((p) =>
    params.actualPlacements.includes(p)
  );
  const fieldScore = Math.min(
    60,
    matched.length * 6 + (params.fanPlacements.length - matched.length) * 2
  );
  const bowlingScore =
    params.fanBowler === params.actualBowler
      ? 40
      : params.fanBowlerType === params.actualPlacements[0]
        ? 20
        : 5;
  const totalScore = fieldScore + bowlingScore;

  return {
    fieldScore,
    bowlingScore,
    bonusPoints: 0,
    totalScore,
    matchedPositions: matched,
    missedPositions: params.actualPlacements.filter(
      (p) => !params.fanPlacements.includes(p)
    ),
    commentary:
      totalScore > 75
        ? 'Excellent tactical read! Your field placement showed strong cricket awareness and alignment with professional captaincy.'
        : totalScore > 50
          ? 'Solid decision-making. A couple of adjustments could have been more optimal for this match situation.'
          : 'The captain opted for a different tactical approach in this situation. Study the match context more closely.',
    keyInsight:
      totalScore > 75
        ? 'Your instincts align closely with elite captaincy.'
        : 'Focus on the match situation — it drives every tactical decision.',
    grade:
      totalScore >= 90
        ? 'S'
        : totalScore >= 75
          ? 'A'
          : totalScore >= 60
            ? 'B'
            : totalScore >= 45
              ? 'C'
              : 'D',
  };
}

export async function getOverAnalysis(
  params: AnalysisParams
): Promise<AnalysisResult> {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

  if (!apiKey || apiKey === 'your_key_here' || apiKey === '') {
    console.log('No API key found, using fallback scoring');
    return generateFallbackScore(params);
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: `You are an elite IPL cricket analyst and coaching evaluator.

Match: MI vs RCB, Wankhede Stadium
Over: ${params.overNumber} | Situation: ${params.matchSituation}
Batsman: ${params.batsmanName} (SR: ${params.strikerSR}) | Weakness: ${params.weakness}
Pitch: ${params.pitchCondition}

FAN CHOSE:
Field: ${params.fanPlacements.join(', ')}
Bowler: ${params.fanBowler} (${params.fanBowlerType})

CAPTAIN CHOSE:
Field: ${params.actualPlacements.join(', ')}
Bowler: ${params.actualBowler}

Over result: ${params.overResult}

Compare both sets of field placements. Count exact matches and zone matches.
Evaluate the bowling choice.

Return ONLY valid JSON — no markdown, no explanation, no preamble:
{
  "fieldScore": <number 0-60>,
  "bowlingScore": <number 0-40>,
  "bonusPoints": <number 0-10>,
  "totalScore": <number 0-100>,
  "matchedPositions": [<array of exactly matching position names>],
  "missedPositions": [<array of captain positions fan missed>],
  "commentary": "<2-3 sentences comparing the tactical decisions>",
  "keyInsight": "<single punchy sentence, the most important observation>",
  "grade": "<S if >90, A if >75, B if >60, C if >45, D if lower>"
}`,
          },
        ],
      }),
    });

    if (!response.ok) throw new Error(`API error: ${response.status}`);

    const data = await response.json();
    const text = data.content[0].text;
    const clean = text.replace(/```json|```/g, '').trim();
    return JSON.parse(clean) as AnalysisResult;
  } catch (error) {
    console.error('Claude API failed, using fallback:', error);
    return generateFallbackScore(params);
  }
}
