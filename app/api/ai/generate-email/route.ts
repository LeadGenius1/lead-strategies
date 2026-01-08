import { NextRequest, NextResponse } from 'next/server';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';
const RAILWAY_API_URL = process.env.RAILWAY_API_URL || process.env.NEXT_PUBLIC_API_URL || '';

export const dynamic = 'force-dynamic';

// POST /api/ai/generate-email - Generate email using Claude AI
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { leadInfo, campaignType, tone, length } = body;

    if (!ANTHROPIC_API_KEY) {
      // Demo mode - return template
      return NextResponse.json({
        success: true,
        data: {
          subject: `Quick introduction from ${leadInfo?.company || 'our company'}`,
          body: `Hi ${leadInfo?.firstName || 'there'},

I hope this email finds you well. I'm reaching out from ${leadInfo?.company || 'our company'} to introduce ourselves.

We specialize in ${leadInfo?.industry || 'business solutions'} and thought you might be interested in learning more.

Would you be open to a brief conversation this week?

Best regards,
${leadInfo?.senderName || 'Team'}`,
        },
      });
    }

    // Use Claude API to generate email
    const prompt = `Generate a professional ${campaignType || 'introduction'} email with a ${tone || 'professional'} tone (${length || 'medium'} length) for:

Lead Information:
- Name: ${leadInfo?.firstName} ${leadInfo?.lastName}
- Company: ${leadInfo?.company || 'N/A'}
- Title: ${leadInfo?.title || 'N/A'}
- Industry: ${leadInfo?.industry || 'N/A'}

Return a JSON object with "subject" and "body" fields.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { success: false, error: error.error?.message || 'Failed to generate email' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const content = data.content[0].text;

    // Parse JSON response
    try {
      const emailData = JSON.parse(content);
      return NextResponse.json({
        success: true,
        data: emailData,
      });
    } catch {
      // If not JSON, extract subject and body
      const lines = content.split('\n');
      const subjectMatch = content.match(/subject["\s:]+([^\n"]+)/i);
      const subject = subjectMatch ? subjectMatch[1].trim() : 'Email from our team';
      const body = content.replace(/subject["\s:]+[^\n"]+/i, '').trim();

      return NextResponse.json({
        success: true,
        data: {
          subject,
          body,
        },
      });
    }
  } catch (error) {
    console.error('Generate email error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
