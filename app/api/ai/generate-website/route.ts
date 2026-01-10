import { NextRequest, NextResponse } from 'next/server';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';

export const dynamic = 'force-dynamic';

// POST /api/ai/generate-website - Generate complete landing page from AI prompt
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
    const { prompt, websiteName } = body;

    if (!prompt || !prompt.trim()) {
      return NextResponse.json(
        { success: false, error: 'Prompt is required' },
        { status: 400 }
      );
    }

    if (!ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'AI API not configured. Please set ANTHROPIC_API_KEY environment variable.' },
        { status: 503 }
      );
    }

    // Create comprehensive prompt for Claude to generate complete landing page
    const systemPrompt = `You are an expert web designer and developer. Generate a complete, professional landing page structure based on the user's description.

Return a JSON object with this exact structure:
{
  "pages": [
    {
      "id": "home",
      "name": "Home",
      "slug": "home",
      "sections": [
        {
          "id": "section-1",
          "type": "hero",
          "content": {
            "title": "...",
            "subtitle": "...",
            "ctaText": "...",
            "ctaLink": "#",
            "alignment": "center"
          },
          "settings": {
            "backgroundColor": "#030303",
            "textColor": "#ffffff",
            "padding": { "top": 80, "bottom": 80 }
          }
        },
        {
          "id": "section-2",
          "type": "features",
          "content": {
            "title": "...",
            "subtitle": "...",
            "features": [
              {
                "icon": "🚀",
                "title": "...",
                "description": "..."
              }
            ],
            "columns": 3
          },
          "settings": {
            "backgroundColor": "#050505",
            "textColor": "#ffffff",
            "padding": { "top": 60, "bottom": 60 }
          }
        },
        {
          "id": "section-3",
          "type": "cta",
          "content": {
            "title": "...",
            "subtitle": "...",
            "ctaText": "...",
            "ctaLink": "#",
            "alignment": "center"
          },
          "settings": {
            "backgroundColor": "#1a1a1a",
            "textColor": "#ffffff",
            "padding": { "top": 60, "bottom": 60 }
          }
        }
      ]
    }
  ],
  "settings": {
    "primaryColor": "#a855f7",
    "secondaryColor": "#ffffff",
    "fontFamily": "default"
  }
}

Available section types: hero, features, testimonials, cta, contact, pricing, faq

Make the landing page compelling, professional, and tailored to the user's description. Include 3-5 sections that make sense for their use case.`;

    const userPrompt = `Create a landing page for: ${websiteName || 'my website'}

Description: ${prompt}

Generate a complete landing page structure with appropriate sections, compelling copy, and professional design.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { success: false, error: error.error?.message || 'Failed to generate website' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const content = data.content[0].text;

    // Extract JSON from response (handle markdown code blocks)
    let jsonContent = content;
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonContent = jsonMatch[1];
    }

    // Parse JSON response
    try {
      const websiteData = JSON.parse(jsonContent.trim());
      
      // Validate structure
      if (!websiteData.pages || !Array.isArray(websiteData.pages)) {
        throw new Error('Invalid response structure');
      }

      return NextResponse.json({
        success: true,
        data: websiteData,
      });
    } catch (parseError) {
      console.error('Parse error:', parseError);
      console.error('Content:', content);
      
      // Fallback: Create a basic structure
      return NextResponse.json({
        success: true,
        data: {
          pages: [
            {
              id: 'home',
              name: 'Home',
              slug: 'home',
              sections: [
                {
                  id: 'section-1',
                  type: 'hero',
                  content: {
                    title: websiteName || 'Welcome',
                    subtitle: prompt.substring(0, 100) || 'Get started today',
                    ctaText: 'Get Started',
                    ctaLink: '#',
                    alignment: 'center',
                  },
                  settings: {
                    backgroundColor: '#030303',
                    textColor: '#ffffff',
                    padding: { top: 80, bottom: 80 },
                  },
                },
              ],
            },
          ],
          settings: {
            primaryColor: '#a855f7',
            secondaryColor: '#ffffff',
            fontFamily: 'default',
          },
        },
      });
    }
  } catch (error) {
    console.error('Generate website error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
