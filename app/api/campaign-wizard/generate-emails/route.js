import { NextResponse } from 'next/server';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514';

export async function POST(req) {
  try {
    if (!ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'AI service not configured' }, { status: 503 });
    }

    const { goal, industry, jobTitle, companySize, location } = await req.json();

    if (!goal || !industry || !jobTitle) {
      return NextResponse.json({ error: 'goal, industry, and jobTitle are required' }, { status: 400 });
    }

    const prompt = `Generate 3 cold outreach emails for a ${goal} campaign targeting ${jobTitle} at ${industry} companies of ${companySize || 'any size'} employees in ${location || 'the United States'}.

Return ONLY valid JSON, no other text. Format:
[{"subject":"...","body":"..."},{"subject":"...","body":"..."},{"subject":"...","body":"..."}]

Rules:
- Email 1: Initial outreach. Email 2: Follow-up (+3 days). Email 3: Final touchpoint (+7 days).
- Each email body: max 3 sentences. Professional but conversational tone.
- Use {{firstName}} as the recipient placeholder.
- Subject lines: short, specific, no clickbait.`;

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Anthropic API error:', err);
      return NextResponse.json({ error: 'AI generation failed' }, { status: 502 });
    }

    const data = await res.json();
    const text = data.content?.[0]?.text || '';

    // Extract JSON from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
    }

    const emails = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ emails });
  } catch (error) {
    console.error('Generate emails error:', error);
    return NextResponse.json({ error: 'Failed to generate emails' }, { status: 500 });
  }
}
