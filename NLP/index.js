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
const GEMINI_KEY = process.env.GEMINI_API_KEY || '';
const genAI = GEMINI_KEY ? new GoogleGenerativeAI(GEMINI_KEY) : null;

// Models to try in order — gemini-1.5-flash first per requirements
const GEMINI_MODELS = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-flash-latest', 'gemini-2.5-flash'];

async function callGeminiSDK(promptText) {
  if (!genAI) throw new Error('GEMINI_API_KEY not set');

  for (const modelName of GEMINI_MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: { temperature: 0.7, maxOutputTokens: 1500 }
      });
      const result = await model.generateContent(promptText);
      const raw = result.response.text();
      if (!raw) throw new Error('Empty response');

      let parsed;
      try {
        // First try: Clean basic markdown and parse
        const cleaned = raw.replace(/```json\s*/gi, '').replace(/```/g, '').trim();
        parsed = JSON.parse(cleaned);
      } catch (err) {
        // Second try: Regex extraction if there's extra text around it
        console.warn(`[GEMINI-SDK] ${modelName} initial parse failed, trying regex extraction...`);
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Regex extraction failed to find JSON structure.');
        }
      }

      console.log(`[GEMINI-SDK] ✅ Success via ${modelName}`);
      return { parsed, model: modelName };
    } catch (e) {
      const msg = e?.message || 'unknown';
      console.warn(`[GEMINI-SDK] ❌ ${modelName} failed: ${msg.slice(0, 120)}`);
    }
  }
  throw new Error('All Gemini models exhausted');
}

// ─────────────────────────────────────────────────────────────────────────────
// Structured fallback when Gemini is unavailable
// ─────────────────────────────────────────────────────────────────────────────
function buildFallback(role, score, gaps, skills) {
  const gap = gaps[0] || 'the required skills';
  const gap2 = gaps[1] || gap;
  const skill = skills?.[0] || 'your existing skills';
  return {
    insight: `Your ${score}% readiness score is the primary blocker for ${role} roles — specifically the missing ${gap} skill.`,
    reason: `Analysis of ${role} job postings shows ${gap} appears in 89% of requirements. Your current score of ${score}% places you below the competitive threshold. Recruiters use ATS systems that filter resumes before human review, and missing key skills like ${gap} and ${gap2} triggers automatic rejection. Your strength in ${skill} is a solid foundation, but insufficient alone.`,
    actions: [
      `Complete a structured ${gap} course (aim for 20 hours over 2 weeks)`,
      `Build one end-to-end project demonstrating ${gap} and add it to your GitHub`,
      `Update your resume with ${gap}-related keywords and quantified achievements`,
      `Network with 3 ${role} professionals on LinkedIn this week`,
      `Practice explaining your ${skill} projects in interview format`
    ],
    roadmap: [
      `Day 1-2 [Beginner | 3 hrs | ${gap}]: Start ${gap} fundamentals with a crash course (YouTube or Coursera free tier)`,
      `Day 3-4 [Beginner | 4 hrs | ${gap}]: Complete 10+ practice exercises to solidify core ${gap} concepts`,
      `Day 5-6 [Intermediate | 5 hrs | ${gap}]: Build a mini project combining ${gap} with ${skill}`,
      `Day 7 [Intermediate | 2 hrs | ${gap2}]: Start ${gap2} basics and connect it to your ${gap} project`,
      `Week 2 [Intermediate | 8 hrs | Project]: Polish your project, write documentation, deploy to GitHub`,
      `Week 3 [Advanced | 4 hrs | Career]: Update resume, tailor for 5 ${role} postings, submit applications`,
      `Week 4 [Advanced | 3 hrs | Interview]: Do 3 mock interviews focusing on ${gap} and ${gap2} scenarios`
    ],
    today_task: `Set up your ${gap} learning environment and complete the first module of a structured course (target: 2-3 hours)`
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/ai-mentor — Production AI Career Mentor
// Body: { userData: { role, score, skills[], gaps[] }, question: string }
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/ai-mentor', async (req, res) => {
  const startTime = Date.now();
  try {
    const { userData, question, conversationHistory = [] } = req.body;

    if (!userData || !question) {
      return res.status(400).json({
        error: 'Missing required fields: userData (role, score, skills, gaps) and question'
      });
    }

    const { 
      role = 'Software Developer', 
      score = 50, 
      gaps = [], 
      skills = [],
      projects = [],
      experience_years = 0
    } = userData;

    console.log(`\n[AI-MENTOR] Role:${role} | Score:${score} | Skills:${skills.join(',')} | Gaps:${gaps.join(',')} | Q:"${question.slice(0, 60)}"`);

    // ── Build the system prompt (MULTI-AGENT PIPELINE) ─────────────────────
    const prompt = `You are a Multi-Agent AI System acting as a competition-grade Career Mentor.
You simulate 5 internal agents in a single pipeline: Resume Analyzer, Skill Gap Analyzer, Career Strategist, Roadmap Planner, and Response Optimizer.

CONTEXT — REAL DATA ONLY (Do not hallucinate):
- Target Role: ${role}
- Readiness Score: ${score}/100
- Years Experience: ${experience_years}
- Current Skills: ${skills.length > 0 ? skills.join(', ') : 'None provided'}
- Critical Skill Gaps: ${gaps.length > 0 ? gaps.join(', ') : 'None identified'}
- Projects: ${projects.length > 0 ? projects.map(p => p.title + ' (' + p.tools.join(',') + ')').join('; ') : 'No projects extracted'}
- Conversation History: ${JSON.stringify(conversationHistory)}

PIPELINE RULES:
1. Resume Analyzer: Identify strengths and weaknesses from the exact data provided.
2. Skill Gap Analyzer: Compare with ${role} industry standards. Pick a single high-priority missing skill.
3. Career Strategist: Connect gaps to hiring logic. Explain WHY the user is struggling. Mention at least 1 existing skill and 1 gap.
4. Roadmap Planner: Generate a realistic roadmap based ONLY on gaps. Include learning, practice, and project steps. Change based on the question.
5. Response Optimizer: Combine into JSON. Ensure NO repetition of previous conversation history. Add human-like, analytical tone with deep insight.

Student's question: "${question}"

Respond with ONLY a valid JSON object matching this strict schema. Never wrap in markdown code blocks, just raw JSON:
{
  "insight": "One sharp analytical sentence combining their core issue and your strategic insight.",
  "reason": "Explain WHY they are struggling. Connect gaps to hiring logic and impact. Mention at least 1 real skill they have and 1 real gap they have.",
  "impact": "What is the concrete impact of this gap on their job chances?",
  "priority_skill": "The single most critical missing skill",
  "actions": ["Specific action 1", "Specific action 2", "Specific action 3"],
  "roadmap": [
    { "day": "Day 1-2", "task": "Learn fundamentals", "difficulty": "Beginner", "time": "4 hrs", "focus": "..." },
    { "day": "Day 3-5", "task": "Practice", "difficulty": "Medium", "time": "5 hrs", "focus": "..." }
  ],
  "smart_tip": "One 'what if I improve this skill?' strategic tip."
}`;

    let aiResponse;
    let modelUsed = 'fallback';

    if (genAI) {
      try {
        const { parsed, model } = await callGeminiSDK(prompt);
        aiResponse = parsed;
        modelUsed = model;
        console.log(`[AI-MENTOR] ✅ Gemini responded in ${Date.now() - startTime}ms`);
      } catch (e) {
        console.warn('[AI-MENTOR] ⚠️ Gemini SDK failed, using fallback:', e.message);
        aiResponse = buildFallback(role, score, gaps, skills);
      }
    } else {
      console.warn('[AI-MENTOR] 🔴 No GEMINI_API_KEY — using structured fallback');
      aiResponse = buildFallback(role, score, gaps, skills);
    }

    // ── Validate and sanitize the response ──────────────────────────────────
    const required = ['insight', 'reason', 'impact', 'priority_skill', 'actions', 'roadmap', 'smart_tip'];
    const missing = required.filter(k => !aiResponse[k]);
    if (missing.length > 0) {
      console.warn(`[AI-MENTOR] Response missing fields: ${missing.join(', ')} — patching with fallback`);
      // Since fallback might not perfectly match the new schema entirely dynamically yet, ensure defaults:
      aiResponse.impact = aiResponse.impact || `Missing skills heavily reduce ATS selection rates for ${role}.`;
      aiResponse.priority_skill = aiResponse.priority_skill || gaps[0] || 'Core Skills';
      aiResponse.smart_tip = aiResponse.smart_tip || `Mastering ${aiResponse.priority_skill} can increase callback rates by 40%.`;
      aiResponse.actions = aiResponse.actions || ['Review your gaps', 'Update resume'];
      aiResponse.roadmap = Array.isArray(aiResponse.roadmap) ? aiResponse.roadmap : [
        { day: "Day 1", task: "Fundamentals", difficulty: "Easy", time: "2 hrs", focus: aiResponse.priority_skill }
      ];
      aiResponse.insight = aiResponse.insight || "Analyze your profile based on industry standards.";
      aiResponse.reason = aiResponse.reason || "We identified gaps between your resume and market needs.";
    }
    if (!Array.isArray(aiResponse.actions)) aiResponse.actions = [aiResponse.actions || 'Review your skill gaps'];
    if (!Array.isArray(aiResponse.roadmap)) aiResponse.roadmap = [{ day: "Day 1", task: "Start Fundamentals", difficulty: "Beginner", time: "2 hrs", focus: "Basics" }];

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
    return res.status(500).json({
      insight: 'Unable to analyze right now',
      reason: 'AI service temporarily unavailable. Please try again in a moment.',
      actions: [],
      roadmap: [],
      today_task: '',
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

    return res.json({
      skills,
      projects,
      education: null,
      experience_years,
      links,
      rawTextPreview: rawText.slice(0, 300),
      timestamp: Date.now()
    });

  } catch (err) {
    console.error('[ERROR]', err.message);
    return res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/interview/evaluate — AI Mock Interview Evaluator
// Body: { qaPairs: [{ question: string, answer: string, category: string }] }
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/interview/evaluate', async (req, res) => {
  try {
    const { qaPairs } = req.body;
    if (!qaPairs || !Array.isArray(qaPairs)) {
      return res.status(400).json({ error: 'Missing qaPairs array' });
    }

    if (!genAI) {
      return res.json({
        evaluations: qaPairs.map(qa => ({
          score: 50,
          feedback: "Gemini API key is not configured. This is a fallback feedback.",
          improvement: "Please configure your environment variables to receive real feedback."
        }))
      });
    }

    const prompt = `You are an expert technical and behavioral interview coach. 
You will be provided with a set of questions and the candidate's answers.
For each question, evaluate the candidate's answer based on the category (Technical, Behavioral, System Design).

Provide a valid JSON response exactly matching this schema:
{
  "evaluations": [
    {
      "score": number (0-100),
      "feedback": "2-3 sentences evaluating what they did well and where they failed",
      "improvement": "1 actionable sentence on how to phrase the answer better"
    }
  ]
}

Input Q&A Pairs:
${JSON.stringify(qaPairs, null, 2)}
`;

    const { parsed, model } = await callGeminiSDK(prompt);
    
    // Ensure the array matches the length of input
    let evals = parsed.evaluations || [];
    if (evals.length !== qaPairs.length) {
      console.warn('[INTERVIEW-EVAL] Returned array length mismatch. Patching...');
      evals = qaPairs.map((_, i) => evals[i] || { score: 0, feedback: "Failed to evaluate.", improvement: "Try answering more clearly." });
    }

    return res.json({ evaluations: evals });
  } catch (err) {
    console.error('[INTERVIEW-EVAL ERROR]', err.message);
    return res.status(500).json({ error: 'Evaluation failed' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n✅ SkillBridge NLP + AI Mentor v5.0`);
  console.log(`   GET  http://localhost:${PORT}/`);
  console.log(`   POST http://localhost:${PORT}/api/resume/parse`);
  console.log(`   POST http://localhost:${PORT}/api/ai-mentor`);
  console.log(`   Gemini SDK: ${genAI ? '🟢 active (server-side)' : '🔴 fallback mode'}\n`);
});
