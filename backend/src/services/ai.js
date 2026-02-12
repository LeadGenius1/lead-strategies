// AI Service - OpenAI for UltraLead agents
const OpenAI = require('openai');

let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

async function callAI(systemPrompt, userPrompt, jsonMode = true) {
  if (!openai) {
    throw new Error('AI service not configured. Set OPENAI_API_KEY.');
  }

  const response = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    response_format: jsonMode ? { type: 'json_object' } : undefined,
    max_tokens: 1000
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error('No response from AI');
  return jsonMode ? JSON.parse(content) : content;
}

module.exports = { callAI, openai };
