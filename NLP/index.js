require('dotenv').config();
const express = require('express');
const multer = require('multer');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

// ── Gemini SDK Setup (server-side only — key NEVER exposed to frontend) ────────
const { GoogleGenerativeAI } = require('@google/generative-ai');

// ─── Collect up to 6 Gemini API keys ──────────────────────────────────────────
const GEMINI_KEYS = [
  'AIzaSyBOm7iiSD7uBuhP2UEA-v5hEr7qQMn7Ano',
  process.env.GEMINI_API_KEY,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
  process.env.GEMINI_API_KEY_4,
  process.env.GEMINI_API_KEY_5,
  process.env.GEMINI_API_KEY_6,
].filter(Boolean);

// ─── Collect Groq & Mistral Keys (Free Tier) ──────────────────────────────────
const GROQ_KEYS = [process.env.GROQ_API_KEY, process.env.GROQ_API_KEY_2].filter(Boolean);
const TOGETHER_KEYS = [process.env.TOGETHER_API_KEY].filter(Boolean);

// Global genAI instance for basic checks
const genAI = GEMINI_KEYS.length > 0 ? new GoogleGenerativeAI(GEMINI_KEYS[0]) : null;

// Models prioritized by accuracy
const GEMINI_MODELS = [
  'gemini-3.1-pro-preview',
  'gemini-pro-latest',
  'gemini-flash-latest',
  'gemini-2.5-flash-lite',
];
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const TOGETHER_MODEL = process.env.TOGETHER_MODEL || 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo';

// ─── Round-robin key + model rotation — tries every key × every model ─────────
async function callGeminiSDK(promptText, preferFast = false, customModels = null) {
  if (GEMINI_KEYS.length === 0) return null;
  const models = customModels || (preferFast ? [...GEMINI_MODELS].reverse() : GEMINI_MODELS);

  for (const apiKey of GEMINI_KEYS) {
    const client = new GoogleGenerativeAI(apiKey);
    for (const modelName of models) {
      try {
        const model = client.getGenerativeModel({
          model: modelName,
          systemInstruction: "You are the SkillBridge Master AI — a high-performance career coach. Your #1 rule is to ALWAYS answer the user's question directly and specifically. NEVER ignore their question to talk about their score or profile gaps. Answer first, then briefly relate it to their profile if helpful. NEVER be generic; provide real names of companies, tools, or strategies.",
          generationConfig: { temperature: 0.3, maxOutputTokens: 3000 }, // Lower temperature for higher accuracy
        });
        const result = await model.generateContent(promptText);
        const raw = result.response.text();
        const cleaned = raw.replace(/```json\s*/gi, '').replace(/```/g, '').trim();
        return { parsed: JSON.parse(cleaned), model: modelName, provider: 'Gemini' };
      } catch (e) {
        console.warn(`[GEMINI] ❌ ${modelName}: ${e.message}`);
      }
    }
  }
  return null;
}

async function callGroqSDK(promptText) {
  if (GROQ_KEYS.length === 0) return null;
  for (const key of GROQ_KEYS) {
    try {
      const res = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
        model: GROQ_MODEL,
        messages: [{ role: 'user', content: promptText }],
        temperature: 0.6,
        response_format: { type: 'json_object' }
      }, {
        headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' }
      });
      return { parsed: JSON.parse(res.data.choices[0].message.content), model: GROQ_MODEL, provider: 'Groq' };
    } catch (e) {
      console.warn(`[GROQ] ❌ Error: ${e.response?.data?.error?.message || e.message}`);
    }
  }
  return null;
}

async function callTogetherSDK(promptText) {
  if (TOGETHER_KEYS.length === 0) return null;
  for (const key of TOGETHER_KEYS) {
    try {
      const res = await axios.post('https://api.together.xyz/v1/chat/completions', {
        model: TOGETHER_MODEL,
        messages: [{ role: 'user', content: promptText }],
        temperature: 0.6,
      }, {
        headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' }
      });
      const raw = res.data.choices[0].message.content;
      const cleaned = raw.replace(/```json\s*/gi, '').replace(/```/g, '').trim();
      return { parsed: JSON.parse(cleaned), model: TOGETHER_MODEL, provider: 'Together' };
    } catch (e) {
      console.warn(`[TOGETHER] Skip key due to error: ${e.message}`);
    }
  }
  return null;
}

// ─── Simple In-Memory Cache ──────────────────────────────────────────────────
const cache = new Map();
const CACHE_TTL = 1000 * 60 * 10; // 10 minutes

function getCached(key) {
  const item = cache.get(key);
  if (item && (Date.now() - item.ts < CACHE_TTL)) return item.data;
  return null;
}

function setCache(key, data) {
  cache.set(key, { data, ts: Date.now() });
}

// ─── Premium Model Calls ──────────────────────────────────────────────────
async function callOpenAI(promptText) {
  if (!process.env.OPENAI_API_KEY) return null;
  try {
    const res = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: process.env.OPENAI_MODEL || 'gpt-4o',
      messages: [
        { role: 'system', content: "You are the SkillBridge Master AI. Rule #1: ALWAYS answer the user's specific question directly. NEVER lecture them about their low score as a primary answer. Answer first, analysis second." },
        { role: 'user', content: promptText }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" }
    }, {
      headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` }
    });
    return { parsed: JSON.parse(res.data.choices[0].message.content), model: 'GPT-4o', provider: 'OpenAI' };
  } catch (e) { console.warn('[OPENAI] Error:', e.message); return null; }
}

async function callAnthropic(promptText) {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  try {
    const res = await axios.post('https://api.anthropic.com/v1/messages', {
      model: process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-20240620',
      max_tokens: 4096,
      messages: [{ role: 'user', content: promptText + "\n\nReturn JSON ONLY." }],
      system: "You are the SkillBridge Master AI. Rule #1: ALWAYS answer the user's specific question directly. NEVER lecture them about their low score as a primary answer. Answer first, analysis second."
    }, {
      headers: { 
        'x-api-key': process.env.ANTHROPIC_API_KEY, 
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json' 
      }
    });
    const raw = res.data.content[0].text;
    const cleaned = raw.replace(/```json\s*/gi, '').replace(/```/g, '').trim();
    return { parsed: JSON.parse(cleaned), model: 'Claude 3.5', provider: 'Anthropic' };
  } catch (e) { console.warn('[ANTHROPIC] Error:', e.message); return null; }
}

async function callAI(promptText, preferFast = true) {
  const cacheKey = promptText.substring(0, 100);
  const cached = getCached(cacheKey);
  if (cached) return cached;

  // 1. Try High-Accuracy Premium Models first if keys exist
  let res = await callAnthropic(promptText);
  if (!res) res = await callOpenAI(promptText);

  // 2. Fallback to Gemini
  if (!res) {
    const models = preferFast ? ['gemini-flash-latest', 'gemini-pro-latest'] : ['gemini-pro-latest', 'gemini-flash-latest'];
    res = await callGeminiSDK(promptText, preferFast, models);
  }

  // 3. Fallback to Groq (Lightning Fast)
  if (!res) {
    console.log('[AI] Falling back to GROQ (Lightning Fast)...');
    res = await callGroqSDK(promptText);
  }
  
  if (res) setCache(cacheKey, res);
  return res;
}

// ─── Raw text AI caller (no JSON required) — for general/conversational questions ───
async function callAIRaw(question, history = []) {
  const historyText = history.slice(-5).map(h => `User: ${h.user}\nAI: ${h.ai_insight}`).join('\n\n');
  const fullPrompt = history.length > 0 
    ? `CONTEXT HISTORY:\n${historyText}\n\nCURRENT QUESTION: "${question}"\n\nINSTRUCTION: Answer ONLY the CURRENT QUESTION. Use the context history for context only if needed. Do NOT repeat or merge previous answers.`
    : question;
  // Try Gemini first (returns raw text, no JSON.parse)
  const modelsToTry = ['gemini-flash-latest', 'gemini-pro-latest'];
  for (const apiKey of GEMINI_KEYS) {
    for (const modelName of modelsToTry) {
      try {
        const client = new GoogleGenerativeAI(apiKey);
        const model = client.getGenerativeModel({
          model: modelName,
          systemInstruction: 'You are a helpful AI career assistant. Rule #1: ANSWER THE QUESTION DIRECTLY. Be like ChatGPT.',
          generationConfig: { temperature: 0.7, maxOutputTokens: 2000 },
        });
        const result = await model.generateContent(fullPrompt);
        const text = result.response.text().trim();
        if (text && text.length > 3) return { text, provider: 'Gemini', model: modelName };
      } catch(e) { console.warn(`[RAW] Gemini ${modelName}: ${e.message}`); }
    }
  }
  // Fallback to Groq (raw text)
  for (const key of GROQ_KEYS) {
    try {
      const res = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: 'You are a helpful AI assistant. Answer the current question only. Do not merge with previous context.' },
          ...history.slice(-3).map(h => ([{role: 'user', content: h.user}, {role: 'assistant', content: h.ai_insight}])).flat(),
          { role: 'user', content: question }
        ],
        temperature: 0.7,
      }, { headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' } });
      const text = res.data.choices[0].message.content.trim();
      if (text) return { text, provider: 'Groq', model: GROQ_MODEL };
    } catch(e) { console.warn(`[RAW] Groq: ${e.message}`); }
  }
  return null;
}

// ─── Detect intent from question to customize the prompt ──────────────────────
function detectIntent(question) {
  const q = question.toLowerCase().trim();

  // Greetings
  if (q.match(/^(hi+|hello+|hey+|hola|hii+|yo+|sup|greetings|good\s*(morning|evening|afternoon|night|day)|namaste|howdy|wassup|what'?s up|how are you|how r u|how do you do|nice to meet|pleased to meet)/)) return 'greeting';
  
  // Job Search / Companies
  if (q.match(/job|apply|application|search|find|compan[y|ay]|hire|target|market|vacancy|opening|recruit|startup|mnc/)) return 'job_search';

  // Career-specific intents
  if (q.match(/roadmap|plan|path|schedule|week|day by day|step by step/)) return 'roadmap';
  if (q.match(/skill|learn|improve|study|language|framework|tool|technology|what to learn/)) return 'skills';
  if (q.match(/reject|rejection|why.*(not|fail)|not getting|no callback|ghosted/)) return 'rejection';
  if (q.match(/resume|cv|portfolio|profile|linkedin/)) return 'resume';
  if (q.match(/interview|prepare|question|mock|practice|hr round/)) return 'interview';
  if (q.match(/salary|pay|package|compensation|ctc|lpa/)) return 'salary';
  if (q.match(/weak|gap|missing|lack|strength|weakness/)) return 'gaps';
  if (q.match(/project|build|develop|create|make/)) return 'projects';
  if (q.match(/role|profe[s|ss]ion|backg[r|ro]ound/)) return 'general';

  // Casual conversational / general knowledge
  if (q.match(/joke|funny|laugh|humor|riddle|pun|meme/)) return 'random_chat';
  if (q.match(/who (is|was|are)|what is|what are|what was|what were|tell me about|explain|define|meaning of|definition/)) return 'random_chat';
  if (q.match(/how (to|do|does|can|did|many|much|old|long|far|big|small)|when (did|was|is|are)/)) return 'random_chat';
  if (q.match(/fact|trivia|did you know|fun fact|true or false|quiz me|history|science|math|calculate|solve|equation/)) return 'random_chat';
  if (q.match(/recommend (a |me |some )?(movie|book|song|show|series|game|food|restaurant|place|travel)/)) return 'random_chat';
  if (q.match(/weather|news|sports|cricket|football|today|time|date|year|season/)) return 'random_chat';
  if (q.match(/thank|thanks|ty|thx|great|awesome|cool|nice|good|ok|okay|sure|alright|got it|understood|perfect|wow|amazing|wonderful/)) return 'greeting';
  if (q.match(/who are you|what are you|are you (an? )?(ai|bot|robot|assistant|chatbot)|your name|introduce yourself/)) return 'random_chat';

  // Default
  return 'general';
}

// ─────────────────────────────────────────────────────────────────────────────
// Structured fallback when Gemini is unavailable
// ─────────────────────────────────────────────────────────────────────────────
function buildFallback(role, score, gaps, skills) {
  const gap = gaps[0] || 'technical skills';
  const gap2 = gaps[1] || 'industry tools';
  const skill = skills?.[0] || 'core foundation';
  
  const insights = [
    `Your readiness for ${role} is at ${score}%, primarily held back by ${gap}.`,
    `To hit the competitive bar for ${role}, we need to boost your ${score}% score by focusing on ${gap}.`,
    `Current analysis shows a ${score}% match. The biggest gap between you and a hire is ${gap}.`
  ];
  
  const reasons = [
    `Market data for ${role} roles shows ${gap} is a mandatory requirement in 90% of job descriptions. Your score of ${score}% suggests your resume might be filtered out by ATS systems looking for this specific skill.`,
    `While you have a solid start with ${skill}, top-tier companies hiring for ${role} prioritize ${gap} and ${gap2}. Without these, your ${score}% readiness makes it harder to secure interviews.`,
    `ATS optimization is key. Since ${gap} is missing, your profile ranks lower for ${role} positions. Improving this will drastically change your callback rate.`
  ];

  const actionPool = [
    `Master ${gap} basics using freeCodeCamp or YouTube tutorials.`,
    `Build a mini-project that integrates ${gap} with your current ${skill} knowledge.`,
    `Update your LinkedIn profile with keywords for ${gap} and ${gap2}.`,
    `Reach out to a ${role} professional for a quick networking chat.`,
    `Practice 3 coding challenges related to ${gap} on LeetCode.`,
    `Refactor your latest project to include ${gap2} best practices.`
  ];

  // Shuffle and pick
  const shuffledActions = actionPool.sort(() => 0.5 - Math.random()).slice(0, 5);

  return {
    insight: insights[Math.floor(Math.random() * insights.length)],
    reason: reasons[Math.floor(Math.random() * reasons.length)],
    actions: shuffledActions,
    roadmap: [
      `Week 1: Focus on ${gap} fundamentals and setup.`,
      `Week 2: Build a small implementation using ${gap}.`,
      `Week 3: Deep dive into ${gap2} and integration.`,
      `Week 4: Finalize a portfolio project and update your resume.`
    ],
    today_task: `Spend 1 hour researching the most popular ${gap} resources on GitHub or YouTube.`,
    chat_summary: `You've got a strong base in ${skill}. Focus on ${gap} and you'll see your readiness score climb fast!`
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/ai-mentor — Smart AI Career Mentor (Intent-Aware + Resume-Personalized)
// Body: { userData: { role, score, skills[], gaps[], projects[], experience_years }, question }
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/ai-mentor', async (req, res) => {
  const startTime = Date.now();
  var role = 'Software Developer';
  var score = 50;
  var gaps = [];
  var skills = [];
  var level = 'Professional';
  
  try {
    const { userData, question, conversationHistory = [] } = req.body;
    if (!userData || !question) return res.status(400).json({ error: 'Missing userData or question' });

    role = userData.role || 'Software Developer';
    score = userData.score || 50;
    gaps = userData.gaps || [];
    skills = userData.skills || [];
    level = userData.level || 'Professional';
    const projects = userData.projects || [];
    const experience_years = userData.experience_years || 0;

    const intent = detectIntent(question);
    console.log(`\n[AI-MENTOR] Intent:${intent} | Role:${role} | Score:${score}% | Skills:[${skills.slice(0,5).join(',')}] | Gaps:[${gaps.join(',')}]`);
    console.log(`[AI-MENTOR] Q: "${question.slice(0, 80)}"`);        

    // ─── Intent-specific instruction blocks ──────────────────────────────────
    const intentGuide = {
      roadmap: `
FOCUS: Generate a DETAILED, PERSONALIZED learning roadmap.
- Base it on their ACTUAL skills (${skills.join(', ')}) and gaps (${gaps.join(', ')}).
- Cover at least 6 weeks with daily hour estimates.
- Include free resource names (Coursera, YouTube channel names, freeCodeCamp, LeetCode, etc.).
- Each roadmap entry must follow: "Week N [Level | X hrs | Topic]: What to do".`,

      greeting: `
FOCUS: Respond to a simple greeting.
- Be extremely brief.
- Just say hello and ask how you can help with their career or resume analysis.
- DO NOT give career advice yet. Wait for a specific question.`,

      skills: `
FOCUS: Recommend SPECIFIC skills/languages/frameworks to learn.
- Analyze their current stack: ${skills.join(', ')}.
- Identify gaps for ${role}: ${gaps.join(', ')}.
- Rank recommendations by industry demand and hiring frequency.
- Mention WHY each skill matters for ${role} jobs in 2024-2025.
- Include free learning platforms for each skill.`,

      rejection: `
FOCUS: Diagnose WHY they are getting rejected and fix it.
- Their readiness score is ${score}/100 — explain what this means for ATS systems.
- Identify which gaps (${gaps.join(', ')}) are causing the most rejections.
- Suggest concrete resume/application changes.
- Give ATS keyword optimization advice specific to ${role} roles.`,

      resume: `
FOCUS: Give actionable resume improvement advice.
- Analyze their projects: ${projects.map(p => p.title).join(', ') || 'none uploaded'}.
- Suggest bullet point rewrites, keyword additions, and structure improvements.
- Highlight which skills to feature most prominently for ${role}.
- Advise on LinkedIn/GitHub profile optimization.`,

      interview: `
FOCUS: Give a targeted interview preparation plan.
- Cover technical topics they'll be asked about (from their skills: ${skills.join(', ')}).
- Cover gap topics they should prepare to explain (${gaps.join(', ')}).
- Suggest 5+ specific practice questions for ${role} interviews.
- Recommend mock interview resources (Pramp, interviewing.io, LeetCode).`,

      salary: `
FOCUS: Give realistic salary guidance for ${role} with their profile.
- ${experience_years} years of experience, ${score}% job readiness.
- Current skills: ${skills.join(', ')}.
- Explain salary ranges by tier (fresher, 2-3 yrs, senior) for ${role}.
- Advise on how to negotiate and what skills would increase their package.`,

      job_search: `
FOCUS: Give a smart, personalized job search strategy.
- Which companies to target based on their stack (${skills.join(', ')}).
- Which job portals and strategies work best for ${role} in India/global.
- How to tailor applications for each job posting.
- Cold email/LinkedIn outreach templates.`,

      gaps: `
FOCUS: Deep dive into their skill gaps and how to close them fast.
- Gaps identified: ${gaps.join(', ')}.
- Prioritize by hiring frequency for ${role}.
- Give a realistic timeline to close each gap.
- Recommend the single best resource per gap.`,

      projects: `
FOCUS: Suggest projects they should build to strengthen their profile.
- Based on their current skills: ${skills.join(', ')}.
- Projects must demonstrate the missing skills: ${gaps.join(', ')}.
- Suggest 3-4 portfolio projects with tech stack, complexity level, and deployment target.
- Each project should directly address a real ${role} job requirement.`,

      general: `
FOCUS: Answer the user's question DIRECTLY with high-accuracy data.
- If they ask for company recommendations, list top companies for their role (e.g., for Sales Manager: Salesforce, HubSpot, Oracle).
- If they ask for advice, give specific, actionable steps.
- Do NOT repeat that their score is low as the main answer. Answer the question FIRST.
- Be concise, direct, and professional.`
    };

    // ─── GENERAL / RANDOM / GREETING — simple ChatGPT-style response ──────────
    if (['greeting', 'random_chat', 'general'].includes(intent)) {
      try {
        const rawRes = await callAIRaw(question, conversationHistory);
        if (rawRes && rawRes.text) {
          console.log(`[AI-MENTOR] ✅ General Q by ${rawRes.provider}:${rawRes.model} in ${Date.now() - startTime}ms`);
          return res.json({ 
            insight: rawRes.text, 
            reason: '', 
            actions: [], 
            roadmap: [], 
            today_task: '', 
            chat_summary: '',
            meta: { role, model: `${rawRes.provider}:${rawRes.model}`, responseTime: Date.now() - startTime } 
          });
        }
      } catch(e) {
        console.error('[AI-MENTOR] Raw call failed:', e.message);
      }
      
      // Secondary fallback to JSON-based call if raw fails
      try {
        const { parsed, model, provider } = await callAI(`Answer concisely: ${question}`, true);
        return res.json({ ...parsed, meta: { role, model: `${provider}:${model}` } });
      } catch(e) {
        console.error('[AI-MENTOR] Fallback call failed:', e.message);
        return res.json({ 
          insight: "I'm having trouble connecting to my brain right now, but based on your profile, you should focus on your top skills and apply to companies in your target domain. Try asking me again in a moment!", 
          reason: 'AI service timeout or limit reached.', 
          actions: ['Check internet connection', 'Try a more specific question'], 
          roadmap: [], 
          today_task: 'Refresh and try again.', 
          chat_summary: 'Service interruption.' 
        });
      }
    }

    // ─── Master prompt (Career-specific questions) ────────────────────────────
    const prompt = `You are SkillBridge Assistant, an expert AI career mentor.
You have access to the user's resume data: ${JSON.stringify(userData)}

STRICT OPERATIONAL MODE:
- ALWAYS give personalized advice based on their actual skills: ${skills.join(', ')}
- For roadmap questions: give week-by-week specific learning plan
- For resume questions: point out exact improvements with examples  
- For rejection questions: analyze skill gaps vs job requirements for ${role}
- For 'what to learn next': prioritize based on current skill level
- Never give generic advice, always reference their specific skills
- Be encouraging but honest about gaps: ${gaps.join(', ')}
- Format responses with bullet points and clear steps

User extracted skills: ${skills.join(', ')}
User experience level: ${level} (Years: ${experience_years})
User target role: ${role}

══════════════════════════════════════════════════════
  CONVERSATION HISTORY
══════════════════════════════════════════════════════
${conversationHistory.slice(-3).map(h => `Q: ${h.user} -> AI: ${h.ai_insight || '...'}`).join('\n')}
══════════════════════════════════════════════════════

Current Question: "${question}"

JSON Schema:
{
  "insight": "DIRECT detailed answer with bullet points if needed.",
  "reason": "Technical reasoning based on their profile.",
  "actions": ["Specific actionable task 1", "Specific actionable task 2"],
  "roadmap": ["Week 1: ...", "Week 2: ...", "Week 3: ..."],
  "today_task": "Single highest priority task for today.",
  "chat_summary": "Short professional wrap-up."
}`;

    let aiResponse;
    let modelUsed = 'fallback';

    try {
      const { parsed, model, provider } = await callAI(prompt, false);
      aiResponse = parsed;
      modelUsed = `${provider}:${model}`;
      console.log(`[AI-MENTOR] ✅ ${provider} responded in ${Date.now() - startTime}ms`);
    } catch (e) {
      console.warn('[AI-MENTOR] ⚠️ All AI providers failed, using fallback:', e.message);
      aiResponse = buildFallback(role, score, gaps, skills);
    }

    // ── Validate and sanitize the response ──────────────────────────────────
    aiResponse = aiResponse || {};
    
    // For greetings or general chats, do not force strict career fallbacks
    const isGeneral = ['greeting', 'general', 'random_chat'].includes(intent);
    
    aiResponse.insight = aiResponse.insight || (isGeneral ? "Hello! How can I assist with your career today?" : "Unable to analyze completely right now.");
    aiResponse.reason = aiResponse.reason || (isGeneral ? "" : "Temporary issue with full analysis.");
    aiResponse.actions = Array.isArray(aiResponse.actions) ? aiResponse.actions : (isGeneral ? [] : ["Please try again"]);
    aiResponse.roadmap = Array.isArray(aiResponse.roadmap) ? aiResponse.roadmap : (isGeneral ? [] : ["Check back later"]);
    aiResponse.today_task = aiResponse.today_task || (isGeneral ? "" : "Review your skills");
    aiResponse.chat_summary = aiResponse.chat_summary || "";

    return res.json({
      ...aiResponse,
      meta: {
        role,
        score,
        gaps,
        skills,
        model: modelUsed,
        responseTime: Date.now() - startTime,
        timestamp: Date.now()
      }
    });

  } catch (err) {
    console.error('[AI-MENTOR ERROR]', err.message);
    const u = req.body?.userData || {};
    const fallback = buildFallback(u.role || 'Software Developer', u.score || 50, u.gaps || [], u.skills || []);
    return res.json({
      ...fallback,
      meta: { error: true, message: err.message, timestamp: Date.now() }
    });
  }
});


const upload = multer({ storage: multer.memoryStorage() });

const DEBUG = true;

// -------------------------------------------------------------------
// COMPREHENSIVE SKILL LIST (100+ skills)
// -------------------------------------------------------------------
const ALL_SKILLS = [
  // Languages
  "python", "java", "javascript", "typescript", "c++", "c#", "c",
  "ruby", "php", "swift", "kotlin", "go", "rust", "scala", "r",
  "matlab", "perl", "bash", "shell", "dart", "lua",

  // Web Frontend
  "html", "css", "react", "vue", "angular", "svelte",
  "next.js", "nuxt.js", "jquery", "bootstrap", "tailwind",
  "tailwindcss", "sass", "scss", "webpack", "vite", "redux",

  // Web Backend
  "node.js", "express", "django", "flask", "fastapi",
  "spring boot", "spring", "rails", "laravel", "asp.net",

  // Databases
  "sql", "mysql", "postgresql", "sqlite", "mongodb", "redis",
  "firebase", "supabase", "oracle", "dynamodb", "cassandra",

  // Data Science / ML / AI
  "pandas", "numpy", "matplotlib", "seaborn", "scikit-learn",
  "tensorflow", "keras", "pytorch", "opencv", "nltk", "spacy",
  "machine learning", "deep learning", "nlp", "computer vision",
  "data science", "data analysis",

  // DevOps / Cloud
  "docker", "kubernetes", "aws", "azure", "gcp",
  "jenkins", "terraform", "ansible", "linux", "unix",
  "nginx", "github actions", "ci/cd",

  // Testing / QA
  "selenium", "playwright", "cypress", "jest", "mocha",
  "junit", "pytest", "automation testing", "unit testing",

  // Tools
  "git", "github", "gitlab", "jira", "postman",
  "figma", "excel", "power bi", "tableau", "photoshop",

  // Mobile
  "react native", "flutter", "android", "ios",

  // Other
  "graphql", "rest api", "microservices", "websocket",
  "jwt", "oauth", "blockchain", "ethereum", "solidity",
  "arduino", "raspberry pi", "iot",
];

let lastTextHash = null;
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash;
}

// -------------------------------------------------------------------
// SMART PDF TEXT FIX
// Only join truly isolated single characters (char-per-line PDFs)
// NOT regular words on separate lines
// -------------------------------------------------------------------
function fixPdfText(text) {
  const lines = text.split('\n');
  const result = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // If the line is a single character, it might be a char-per-line PDF
    if (trimmed.length === 1 && /[A-Za-z]/.test(trimmed)) {
      let word = trimmed;
      // Collect consecutive single-char lines
      while (i + 1 < lines.length && lines[i + 1].trim().length === 1 && /[A-Za-z]/.test(lines[i + 1].trim())) {
        i++;
        word += lines[i].trim();
      }
      result.push(word);
    } else {
      result.push(line);
    }
    i++;
  }

  // Clean up extra spaces within each line but preserve newlines
  return result.map(l => l.replace(/[ \t]+/g, ' ').trim()).join('\n');
}

// -------------------------------------------------------------------
// SKILL EXTRACTION — matches on flat (newline→space) text
// -------------------------------------------------------------------
function extractSkills(text) {
  // For matching: replace newlines with space so cross-line skills are caught
  const flatText = text.replace(/\n/g, ' ').replace(/\s+/g, ' ');
  const lowerFlat = flatText.toLowerCase();

  const found = [];
  const seen = new Set();

  ALL_SKILLS.forEach(skill => {
    if (seen.has(skill)) return;
    const escaped = skill.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    // Word-boundary match
    const regex = new RegExp(`(?<![a-zA-Z0-9])${escaped}(?![a-zA-Z0-9])`, 'gi');
    const matches = lowerFlat.match(regex);

    if (matches && matches.length > 0) {
      seen.add(skill);
      // Build display name
      let name = skill.split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
      // Overrides for all-caps or special casing
      const overrides = {
        'c++': 'C++', 'c#': 'C#', 'c': 'C', 'sql': 'SQL', 'html': 'HTML',
        'css': 'CSS', 'php': 'PHP', 'aws': 'AWS', 'gcp': 'GCP', 'ios': 'iOS',
        'iot': 'IoT', 'nlp': 'NLP', 'jwt': 'JWT', 'rest api': 'REST API',
        'ci/cd': 'CI/CD', 'asp.net': 'ASP.NET', 'node.js': 'Node.js',
        'next.js': 'Next.js', 'nuxt.js': 'Nuxt.js', 'react native': 'React Native',
        'spring boot': 'Spring Boot', 'power bi': 'Power BI',
        'scikit-learn': 'Scikit-Learn', 'github actions': 'GitHub Actions',
        'machine learning': 'Machine Learning', 'deep learning': 'Deep Learning',
        'computer vision': 'Computer Vision', 'data science': 'Data Science',
        'data analysis': 'Data Analysis', 'automation testing': 'Automation Testing',
        'unit testing': 'Unit Testing', 'raspberry pi': 'Raspberry Pi',
      };
      if (overrides[skill]) name = overrides[skill];

      found.push({
        name,
        occurrences: matches.length,
        confidence: matches.length >= 3 ? 'high' : 'medium'
      });
    }
  });

  // DYNAMIC: scan Skills section for extra capitalized tech words
  const genericWords = new Set([
    'the','and','or','with','for','from','that','this','have','has','been','will',
    'are','was','were','not','but','its','also','which','when','than','more',
    'some','each','other','they','their','them','there','then','into','about',
    'skills','technologies','tools','experience','projects','education',
    'profile','summary','contact','phone','email','address','linkedin','github',
    'teamwork','leadership','communication','management','hardworking',
    'certified','university','college','bachelor','master','degree','institute',
    'programmer','developer','engineer','freelancer','analyst','designer',
    'dynamic','strong','recognized','specializing','foundation','custom',
    'solutions','recognized','excellent','great','good','able','also',
  ]);

  const lines = text.split('\n');
  let inSkillSection = false;

  lines.forEach(line => {
    const lower = line.toLowerCase().trim();
    if (lower === 'skills' || lower === 'technical skills' || lower === 'technologies' ||
        lower.startsWith('skill') || lower.includes('tech stack') || lower.includes('tools used')) {
      inSkillSection = true;
      return;
    }
    if (inSkillSection && (lower === 'experience' || lower === 'education' ||
        lower === 'projects' || lower === 'certifications' || lower === 'achievements' ||
        lower === 'profile' || lower === 'summary')) {
      inSkillSection = false;
      return;
    }
    if (inSkillSection && line.trim().length > 0) {
      const tokens = line.split(/[\s,|•▪\-\/\n]+/);
      tokens.forEach(token => {
        token = token.trim().replace(/[^a-zA-Z0-9.#+]/g, '');
        if (token.length < 2 || token.length > 20) return;
        const lowerToken = token.toLowerCase();
        if (genericWords.has(lowerToken)) return;
        if (seen.has(lowerToken)) return;
        if (/^[A-Z][a-zA-Z0-9.#+]+$/.test(token)) {
          const escaped = lowerToken.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
          const regex = new RegExp(`(?<![a-zA-Z0-9])${escaped}(?![a-zA-Z0-9])`, 'gi');
          const matches = lowerFlat.match(regex);
          if (matches && matches.length > 0) {
            seen.add(lowerToken);
            found.push({
              name: token,
              occurrences: matches.length,
              confidence: matches.length >= 3 ? 'high' : 'medium'
            });
          }
        }
      });
    }
  });

  // Sort: high first, then by occurrences
  return found.sort((a, b) => {
    if (a.confidence !== b.confidence) return a.confidence === 'high' ? -1 : 1;
    return b.occurrences - a.occurrences;
  });
}

// -------------------------------------------------------------------
// PROJECT EXTRACTION
// -------------------------------------------------------------------
function extractProjects(text, skills) {
  const projects = [];
  const lines = text.split('\n');
  let inProjects = false;
  let current = null;

  const projKeywords = ['projects', 'work experience', 'experience', 'portfolio', 'internship'];
  const stopKeywords = ['education', 'skills', 'technical skills', 'certifications', 'achievements', 'languages', 'references', 'hobbies', 'contact'];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const lower = line.toLowerCase();

    if (projKeywords.some(k => lower === k || lower.startsWith(k + ' ') || lower.startsWith(k + ':'))) {
      inProjects = true;
      continue;
    }
    if (inProjects && stopKeywords.some(k => lower === k || lower.startsWith(k + ' '))) {
      inProjects = false;
      if (current) { projects.push(current); current = null; }
      continue;
    }

    if (inProjects && line.length > 4) {
      const isBullet = /^[-•*▪●]/.test(line) || /^\d+\./.test(line);
      const isTitle = /^[A-Z]/.test(line) && line.length < 80 && !line.endsWith(',');

      if (isBullet || isTitle) {
        if (current) projects.push(current);
        let title = line.replace(/^[-•*▪●]\s*|\d+\.\s*/, '').trim();
        if (title.includes(':')) title = title.split(':')[0].trim();
        if (title.includes('|')) title = title.split('|')[0].trim();

        const projLower = line.toLowerCase();
        const tools = skills.filter(s => {
          const escaped = s.name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
          return new RegExp(`(?<![a-zA-Z0-9])${escaped.toLowerCase()}(?![a-zA-Z0-9])`, 'gi').test(projLower);
        }).map(s => s.name);

        current = { title: title.slice(0, 80), description: line.replace(/^[-•*▪●]\s*/, '').trim(), tools };
      } else if (current) {
        current.description += ' ' + line;
        const projLower = line.toLowerCase();
        skills.forEach(s => {
          if (!current.tools.includes(s.name)) {
            const escaped = s.name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
            if (new RegExp(`(?<![a-zA-Z0-9])${escaped.toLowerCase()}(?![a-zA-Z0-9])`, 'gi').test(projLower)) {
              current.tools.push(s.name);
            }
          }
        });
      }
    }
  }
  if (current) projects.push(current);
  return projects.slice(0, 5);
}

function extractLinks(text) {
  const flatText = text.replace(/\n/g, ' ');
  const ghMatch = flatText.match(/https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9_\-]+/i);
  const liMatch = flatText.match(/https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_\-]+/i);
  return {
    github: ghMatch ? ghMatch[0] : null,
    linkedin: liMatch ? liMatch[0] : null
  };
}

function extractExperience(text) {
  const match = text.match(/(\d+)\s*\+?\s*years?\s+(?:of\s+)?experience/i);
  return match ? parseInt(match[1], 10) : 0;
}

// -------------------------------------------------------------------
// ROUTES
// -------------------------------------------------------------------
app.get('/', (req, res) => {
  res.json({
    service: 'SkillBridge NLP Resume Parser + AI Mentor',
    status: 'running ✅',
    version: '4.0',
    endpoints: {
      parse:    'POST /api/resume/parse',
      aiMentor: 'POST /api/ai-mentor',
      health:   'GET  /api/health'
    },
    geminiReady: !!genAI,
    supportedFormats: ['PDF', 'DOCX', 'TXT'],
    timestamp: Date.now()
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

app.post('/api/resume/parse', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const { buffer, originalname, mimetype, size } = req.file;
    console.log(`\n[REQUEST] "${originalname}" | ${(size/1024).toFixed(1)}KB | ${mimetype}`);

    if (size === 0) return res.status(400).json({ error: 'File is empty.' });

    let rawText = '';

    if (mimetype === 'application/pdf' || originalname.toLowerCase().endsWith('.pdf')) {
      const data = await pdf(buffer);
      rawText = data.text;
    } else if (
      mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      originalname.toLowerCase().endsWith('.docx')
    ) {
      const result = await mammoth.extractRawText({ buffer });
      rawText = result.value;
    } else if (mimetype === 'text/plain' || originalname.toLowerCase().endsWith('.txt')) {
      rawText = buffer.toString('utf-8');
    } else {
      return res.status(400).json({ error: 'Unsupported file type. Use PDF, DOCX or TXT.' });
    }

    rawText = fixPdfText(rawText);

    if (!rawText || rawText.length < 20) {
      return res.status(422).json({ error: 'Could not extract readable text.' });
    }

    if (DEBUG) {
      console.log('[TEXT PREVIEW]\n', rawText.slice(0, 500));
    }

    const hash = simpleHash(rawText);
    if (hash === lastTextHash) console.warn('[WARNING] Same resume as before!');
    else lastTextHash = hash;

    const skills = extractSkills(rawText);
    const projects = extractProjects(rawText, skills);
    const links = extractLinks(rawText);
    const experience_years = extractExperience(rawText);

    console.log(`[RESULT] Skills:${skills.length} | Projects:${projects.length} | Exp:${experience_years}yrs`);

    let aiInsights = { 
      role: 'Professional', 
      domain: 'General', 
      level: 'Entry', 
      top_skills: [],
      experience_years: 0,
      current_role: "",
      target_role: "",
      education: "",
      projects: [],
      gaps: []
    };
    try {
      const prompt = `Analyze the following resume text and provide comprehensive details.
      
      Resume text (first 3000 chars): ${rawText.slice(0, 3000)}

      Return ONLY a JSON object with these EXACT keys: 
      "skills" (array of strings),
      "experience_years" (number),
      "current_role" (string),
      "target_role" (string),
      "education" (string),
      "projects" (array of objects with {title, description, tools[]}),
      "gaps" (array of strings - identifying missing skills for their target role),
      "domain" (string),
      "level" (string)
      `;
      const aiResponse = await callAI(prompt, false); // use pro model for accuracy
      if (aiResponse && aiResponse.parsed) {
        aiInsights = {
          ...aiInsights,
          ...aiResponse.parsed,
          top_skills: Array.isArray(aiResponse.parsed.skills) ? aiResponse.parsed.skills : []
        };
      }
    } catch (e) {
      console.warn("[AI CLASSIFICATION FAILED]", e.message);
    }

    // Merge AI extracted skills with regex skills
    const mergedSkills = [...skills];
    aiInsights.top_skills.forEach(sk => {
      if (!mergedSkills.some(s => s.name.toLowerCase() === sk.toLowerCase())) {
        mergedSkills.push({ name: sk, occurrences: 1, confidence: 'high' });
      }
    });

    return res.json({
      skills: mergedSkills,
      experience_years: aiInsights.experience_years || experience_years,
      current_role: aiInsights.current_role || "",
      target_role: aiInsights.target_role || aiInsights.role || "",
      education: aiInsights.education || "",
      projects: aiInsights.projects && aiInsights.projects.length > 0 ? aiInsights.projects : projects,
      gaps: aiInsights.gaps || [],
      domain: aiInsights.domain || "General",
      level: aiInsights.level || "Entry",
      links,
      timestamp: Date.now()
    });

  } catch (err) {
    console.error('[ERROR]', err.message);
    return res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/interview/generate — Generate AI Mock Interview Questions
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/interview/generate', async (req, res) => {
  try {
    const { profile, role = 'Software Developer', mode = 'normal' } = req.body;
    if (!profile) return res.status(400).json({ error: 'No profile provided' });

    const domain = profile.domain || 'Technical';
    const level = profile.level || 'Professional';
    const skills = profile.skills || [];
    const gaps = profile.gaps || [];

    let prompt;
    if (mode === 'quiz') {
      prompt = `You are a Senior ${domain} Integrity & Technical Examiner. 
      Generate 10 highly specific Multiple Choice Questions (MCQs) for a ${level} ${role}.
      
      CORE OBJECTIVE: Verify if the candidate ACTUALLY possesses the skills they claim in their resume. Detect "fake" resumes by asking deep, practical questions.
      
      USER PROFILE:
      - Claimed Skills: ${skills.join(', ')}
      - Identified Gaps: ${gaps.join(', ')}
      
      INSTRUCTIONS:
      1. 70% of questions must target their "Claimed Skills" to verify proficiency and detect fake claims.
      2. 30% of questions must target their "Identified Gaps" to assess learning potential.
      3. Each question must have 4 options (A, B, C, D) and a clear 'correct_answer'.
      4. Difficulty: Calibrate for ${level} level.
      5. Provide 'solution_explanation' for each.

      RETURN JSON:
      {
        "questions": [
          { 
            "id": 1, 
            "category": "Skill Verification", 
            "question": "...", 
            "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
            "correct_answer": "A) ...",
            "solution_explanation": "..."
          }
        ]
      }`;
    } else {
      prompt = `You are an expert ${domain} interviewer. Generate 5 targeted, high-quality interview questions for a ${level} ${role}.
      USER PROFILE: Skills: ${skills.join(', ')}, Gaps: ${gaps.join(', ')}.
      REQUIREMENTS: Focus on technical depth and behavioral fit for ${domain}.
      RETURN JSON: { "questions": [{ "id": 1, "category": "...", "question": "...", "hint": "..." }] }`;
    }

    try {
      const aiResult = await callAI(prompt, true);
      const parsed = aiResult?.parsed;
      if (parsed && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
        return res.json({ questions: parsed.questions });
      }
    } catch (e) {
      console.warn('[INTERVIEW-GEN] AI Failed, using local logic:', e.message);
    }

    // --- ROBUST FALLBACK LOGIC ---
    const fallbackBank = [
      { category: 'JavaScript', question: 'What is the purpose of the "use strict" directive?', options: ['A) Enables strict mode', 'B) Makes code faster', 'C) Prevents global variables', 'D) Both A and C'], correct_answer: 'D) Both A and C', solution_explanation: 'Strict mode catches common coding bloopers and prevents use of unsafe features.' },
      { category: 'React', question: 'Which hook is used to handle side effects in functional components?', options: ['A) useState', 'B) useEffect', 'C) useContext', 'D) useReducer'], correct_answer: 'B) useEffect', solution_explanation: 'useEffect allows performing side effects like data fetching or DOM manipulation.' },
      { category: 'SQL', question: 'Which SQL command is used to remove all records from a table without logging individual row deletions?', options: ['A) DELETE', 'B) DROP', 'C) TRUNCATE', 'D) REMOVE'], correct_answer: 'C) TRUNCATE', solution_explanation: 'TRUNCATE is faster as it does not log individual row deletions.' },
      { category: 'DevOps', question: 'What is the primary purpose of a Dockerfile?', options: ['A) To run containers', 'B) To define the environment and build steps for an image', 'C) To manage network configurations', 'D) To store application data'], correct_answer: 'B) To define the environment and build steps for an image', solution_explanation: 'A Dockerfile contains all instructions to build a reproducible container image.' },
      { category: 'Python', question: 'How do you create a deep copy of an object in Python?', options: ['A) copy.copy()', 'B) copy.deepcopy()', 'C) obj.copy()', 'D) list(obj)'], correct_answer: 'B) copy.deepcopy()', solution_explanation: 'deepcopy creates a new object and recursively adds copies of the objects found in the original.' }
    ];
    
    // Ensure we are working with strings to avoid toLowerCase() crashes
    const safeSkills = skills.map(s => String(s || '').toLowerCase());
    const safeGaps = gaps.map(g => String(g || '').toLowerCase());

    const filtered = fallbackBank.filter(q => {
      const cat = q.category.toLowerCase();
      return safeSkills.some(s => s.includes(cat)) || safeGaps.some(g => g.includes(cat));
    });

    res.json({ questions: filtered.length > 0 ? filtered : fallbackBank });

  } catch (error) {
    console.error('[INTERVIEW-GEN] Critical Error:', error);
    res.status(500).json({ error: 'System failure: ' + error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/interview/evaluate — AI Mock Interview Evaluator
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/interview/evaluate', async (req, res) => {
  try {
    const { qaPairs, profile } = req.body;
    if (!qaPairs) return res.status(400).json({ error: 'Missing qaPairs' });

    const domain = profile?.domain || 'Technical';
    const level = profile?.level || 'Professional';
    const isTech = domain.toLowerCase().includes('tech') || domain.toLowerCase().includes('software') || domain.toLowerCase().includes('engineering');

    const prompt = `You are a Senior ${domain} Manager and Expert Evaluator. Evaluate these interview responses with 100% precision.
${profile ? `USER PROFILE: Level:${level}, Role:${profile.targetRole || profile.role}, Gaps:${profile.gaps?.join(',')}` : ''}

REFERENCE EXAMPLES FOR GRADING:
- If the domain is highly Technical (like Software), expect precise definitions, code awareness, and structured architecture (e.g., STAR format).
- If the domain is Non-Technical (like Marketing, Medical, or Student), grade based on clarity, domain-specific logic, communication, and situational problem-solving.
- Grade strictly according to the expectations of a ${level} candidate. A 'Student' requires less depth than a 'Senior'.

RESPONSES TO EVALUATE:
${qaPairs.map((pair, i) => `Q${i+1} (${pair.category}): ${pair.question}\nAnswer: ${pair.answer}`).join('\n\n')}

INSTRUCTIONS:
1. Be highly critical but fair to their ${level} seniority. Only give 100 if the answer is completely exhaustive for their field.
2. For MCQs: Strict 100 or 0.
3. Provide the 'optimalSolution' (The industry-standard perfect response for a ${level} ${domain} professional).
4. Provide 'solution_explanation' (The 'why').

RETURN ONLY VALID JSON:
{
  "evaluations": [
    { "score": 85, "feedback": "...", "improvement": "...", "optimalSolution": "...", "solution_explanation": "..." },
    ...
  ]
}`;

    const { parsed } = await callAI(prompt);
    res.json({ evaluations: parsed?.evaluations || [] });
  } catch (error) {
    console.error('[INTERVIEW-EVAL] Error:', error);
    res.status(500).json({ error: 'Failed to evaluate' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n✅ SkillBridge NLP + AI Mentor v5.0`);
  console.log(`   GET  http://localhost:${PORT}/`);
  console.log(`   POST http://localhost:${PORT}/api/resume/parse`);
  console.log(`   POST http://localhost:${PORT}/api/ai-mentor`);
  console.log(`   Gemini SDK: ${GEMINI_KEYS.length > 0 ? `🟢 active (${GEMINI_KEYS.length} keys loaded)` : '🔴 fallback mode'}\n`);
});
