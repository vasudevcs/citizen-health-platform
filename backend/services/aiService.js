/**
 * Thin wrapper around an OpenAI-compatible chat completion API.
 *
 * Configure via env vars:
 *   AI_API_KEY   - required to actually call the provider
 *   AI_API_URL   - defaults to OpenAI's endpoint
 *   AI_MODEL     - defaults to 'gpt-4o-mini'
 *
 * When AI_API_KEY is not set (e.g. local dev without a key), callers get
 * a clearly-labeled fallback response instead of a hard failure — the
 * rest of the platform should degrade gracefully, not throw 500s, when
 * this optional layer isn't configured.
 */
const AI_API_URL = process.env.AI_API_URL || 'https://api.openai.com/v1/chat/completions';
const AI_MODEL = process.env.AI_MODEL || 'gpt-4o-mini';

function isConfigured() {
  return !!process.env.AI_API_KEY;
}

async function chatCompletion(messages, { maxTokens = 400 } = {}) {
  if (!isConfigured()) {
    return {
      configured: false,
      reply:
        "The AI assistant isn't configured yet. Ask an administrator to set the AI_API_KEY environment variable to enable this feature.",
    };
  }

  const response = await fetch(AI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.AI_API_KEY}`,
    },
    body: JSON.stringify({
      model: AI_MODEL,
      messages,
      max_tokens: maxTokens,
      temperature: 0.4,
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    throw new Error(`AI provider error (${response.status}): ${errText.slice(0, 300)}`);
  }

  const data = await response.json();
  const reply = data?.choices?.[0]?.message?.content?.trim() || '';
  return { configured: true, reply };
}

const HEALTH_ASSISTANT_SYSTEM_PROMPT = `You are a friendly health information assistant embedded in a citizen health platform.
You provide general wellness, nutrition, and preventive-care information only.
You NEVER diagnose conditions, prescribe medication, or replace professional medical advice.
If a message describes an emergency or a specific personal medical concern, tell the person to contact a doctor or emergency services.
Keep answers concise (under 150 words) and easy to understand.`;

async function askHealthAssistant(userMessage, history = []) {
  const messages = [
    { role: 'system', content: HEALTH_ASSISTANT_SYSTEM_PROMPT },
    ...history.slice(-6).map((h) => ({ role: h.role, content: h.content })),
    { role: 'user', content: userMessage },
  ];
  return chatCompletion(messages);
}

async function explainRiskAssessment(riskAssessment) {
  const summary = Object.entries(riskAssessment.conditions || {})
    .map(([cond, r]) => `${cond}: ${r.level} (score ${r.score}/100)`)
    .join(', ');

  const messages = [
    {
      role: 'system',
      content:
        'You explain disease-risk assessment results in plain, reassuring, non-alarming language for a general audience. Keep it under 120 words. Do not diagnose — only explain what the risk levels mean and suggest general next steps like consulting a doctor.',
    },
    { role: 'user', content: `Explain this risk assessment result in plain language: ${summary}` },
  ];
  return chatCompletion(messages, { maxTokens: 250 });
}

module.exports = { isConfigured, askHealthAssistant, explainRiskAssessment };
