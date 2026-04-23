const { success, error } = require('../utils/apiResponse');

// System instruction matching the frontend's Gemini prompt
const SYSTEM_INSTRUCTION = `You are a professional yet friendly AI Medical Assistant for the CareSync healthcare platform.
Your goal is to help patients understand their symptoms through a dynamic conversation.

GUIDELINES:
1. Conversational & Adaptive: Don't use fixed patterns. Respond naturally to what the user says.
2. Follow-up Questions: Before suggesting any conditions, ask 2-3 relevant follow-up questions to understand the severity, duration, and associated symptoms (e.g., "Is it a sharp or dull pain?", "Have you noticed any fever?").
3. Context-Aware: Remember previous parts of the conversation. If a user already mentioned something, don't ask it again.
4. Identify Possible Conditions: After gathering enough info, suggest 2-4 realistic possibilities. Use clear language.
5. Safety & Disclaimers:
   - NEVER provide a definitive diagnosis.
   - NEVER prescribe specific medications.
   - ALWAYS include: "This is not a medical diagnosis. Please consult a doctor."
6. Integration Suggestions:
   - If symptoms seem moderate/new: "Would you like to book an appointment with one of our specialists?"
   - If symptoms seem serious or acute: "I recommend checking available doctors immediately or using our Emergency SOS feature if this is urgent."
7. Tone: Professional, empathetic, and clear.
8. Formatting: Use short paragraphs and bullet points for readability.`;

// ─── Utility: call OpenAI ────────────────────────────────────────────────
const callOpenAI = async (messages) => {
  const OpenAI = require('openai');
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const response = await client.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: SYSTEM_INSTRUCTION },
      ...messages,
    ],
    max_tokens: 600,
    temperature: 0.7,
  });

  return response.choices[0].message.content;
};

// ─── Fallback mock — used when no API key is set ──────────────────────────
const getMockResponse = (userMessage) => {
  const msg = userMessage.toLowerCase();

  const patterns = [
    {
      keywords: ['headache', 'head pain', 'migraine'],
      response: `I understand you're experiencing headaches. To help me better understand your situation, could you tell me:\n\n• **How long** have you been experiencing these headaches?\n• Would you describe them as **sharp, throbbing, or dull**?\n• Have you noticed any **sensitivity to light or nausea** alongside the headaches?\n\nThis will help me provide more relevant information. Remember, this is not a medical diagnosis — please consult a doctor for a proper evaluation.`,
    },
    {
      keywords: ['fever', 'temperature', 'hot', 'chills'],
      response: `Fever can have many causes. Let me ask a few follow-up questions:\n\n• **What is your current temperature** (if you've measured it)?\n• How long have you had the fever — is it **constant or intermittent**?\n• Are you experiencing any **other symptoms** like cough, sore throat, or body aches?\n\nPlease note this is not a medical diagnosis. If your fever is above 103°F (39.4°C) or has lasted more than 3 days, please consult a doctor immediately or use our **Emergency SOS** feature if needed.`,
    },
    {
      keywords: ['chest pain', 'chest', 'heart', 'breathing'],
      response: `⚠️ Chest pain and breathing difficulties require immediate attention.\n\nIf you are experiencing **severe chest pain, shortness of breath, or pain radiating to your arm or jaw**, please:\n\n1. **Call emergency services immediately (112)**\n2. Use the **Emergency SOS** button in the app\n\nIf the discomfort is mild, please describe it further — is it sharp, pressure-like, or burning? Does it worsen with activity? I strongly recommend **booking an urgent appointment** with a cardiologist.\n\n*This is not a medical diagnosis. Please consult a doctor.*`,
    },
    {
      keywords: ['stomach', 'abdomen', 'nausea', 'vomit', 'diarrhea'],
      response: `Gastrointestinal symptoms can stem from various causes. To narrow it down:\n\n• Is the pain **localised** (specific area) or generalised across the abdomen?\n• Have you noticed any changes in **appetite or bowel habits**?\n• Did the symptoms start **after eating** specific foods?\n\nPossible considerations include gastritis, food intolerance, or IBS — but a proper diagnosis requires a medical examination. **This is not a medical diagnosis. Please consult a doctor.**`,
    },
    {
      keywords: ['cough', 'cold', 'sore throat', 'sneezing', 'runny nose'],
      response: `Respiratory symptoms are common. Let me ask:\n\n• Is your cough **dry or producing mucus**? If mucus, what colour?\n• How long have you had these symptoms?\n• Do you have a **fever or body aches** as well?\n\nThese symptoms could indicate a common cold, flu, or respiratory infection. If symptoms persist beyond 7 days or worsen significantly, consider **booking an appointment** with a general physician. *This is not a medical diagnosis. Please consult a doctor.*`,
    },
  ];

  for (const pattern of patterns) {
    if (pattern.keywords.some((kw) => msg.includes(kw))) {
      return pattern.response;
    }
  }

  // Default
  return `Thank you for reaching out to CareSync's AI Medical Assistant. I'm here to help you understand your symptoms better.\n\nCould you please **describe your main symptom** in detail? For example:\n- Where exactly is the discomfort located?\n- When did it start?\n- Is it constant or does it come and go?\n\nThe more detail you provide, the better I can assist you. Please remember that **this is not a substitute for professional medical advice**. Always consult a qualified doctor for diagnosis and treatment.`;
};

// ─── POST /api/ai/chat ─────────────────────────────────────────────────────
const chat = async (req, res, next) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || !message.trim()) {
      return error(res, 'Message is required', 422);
    }

    // Build conversation history for multi-turn context
    const messages = [
      ...history.map((h) => ({
        role: h.role === 'user' ? 'user' : 'assistant',
        content: h.content,
      })),
      { role: 'user', content: message },
    ];

    let reply;

    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
      reply = await callOpenAI(messages);
    } else {
      // Fallback mock — useful for development without an API key
      reply = getMockResponse(message);
    }

    return success(res, {
      reply,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    // If OpenAI call fails, fall back to mock
    if (err.code === 'insufficient_quota' || err.status === 429 || err.status === 401) {
      const reply = getMockResponse(req.body.message || '');
      return success(res, { reply, timestamp: new Date().toISOString(), fallback: true });
    }
    next(err);
  }
};

module.exports = { chat };
