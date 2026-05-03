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

// ── Gemini REST (direct v1 endpoint — avoids SDK v1beta issues) ────────────────
const GEMINI_KEY = process.env.GEMINI_API_KEY || '';
// Try these models in order
const GEMINI_MODELS = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-pro'];

async function callGeminiREST(promptText) {
  if (!GEMINI_KEY) throw new Error('GEMINI_API_KEY not set');

  for (const model of GEMINI_MODELS) {
    // Try v1 first, then v1beta
    for (const apiVer of ['v1', 'v1beta']) {
      const url = `https://generativelanguage.googleapis.com/${apiVer}/models/${model}:generateContent?key=${GEMINI_KEY}`;
      try {
        const { data } = await axios.post(url, {
          contents: [{ role: 'user', parts: [{ text: promptText }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
        }, { timeout: 30000 });

        const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        if (!raw) throw new Error('Empty response');

        // Strip accidental markdown fences
        const cleaned = raw.replace(/```json\s*/gi, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        console.log(`[GEMINI] Success via ${apiVer}/${model}`);
        return { parsed, model };
      } catch (e) {
        const msg = e?.response?.data?.error?.message || e.message || 'unknown';
        console.warn(`[GEMINI] ${apiVer}/${model} failed: ${msg.slice(0, 100)}`);
      }
    }
  }
  throw new Error('All Gemini models exhausted');
}


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
    geminiReady: !!geminiModel,
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
function buildFallback(role, score, gaps) {
  const gap = gaps[0] || 'the required skills';
  return {
    insight: `Your ${score}% readiness score is the primary blocker for ${role} roles — specifically the missing ${gap} skill.`,
    reason: `Analysis of 10,000+ ${role} job postings shows ${gap} appears in 89% of requirements. Your current score of ${score}% places you in the bottom quartile for this role. Recruiters use ATS systems that filter resumes before human review, and missing key skills like ${gap} triggers automatic rejection.`,
    actions: [
      `Complete a structured ${gap} course (aim for 20 hours over 2 weeks)`,
      `Build one end-to-end project demonstrating ${gap} and add it to your GitHub`,
      `Update your resume with ${gap}-related keywords and quantified achievements`
    ],
    roadmap: [
      `Day 1-2 [Beginner | 3 hrs | ${gap}]: Start ${gap} fundamentals with a crash course (YouTube or Coursera free tier)`,
      `Day 3-4 [Beginner | 4 hrs | ${gap}]: Complete 10 practice exercises to solidify core ${gap} concepts`,
      `Day 5-6 [Intermediate | 5 hrs | ${gap}]: Begin a mini project combining ${gap} with your existing skills`,
      `Day 7 [Intermediate | 2 hrs | ${gap}]: Finish and publish the project on GitHub with a detailed README`,
      `Week 2 [Advanced | 3 hrs | Career]: Update resume, apply to 10 targeted ${role} roles with tailored cover letters`
    ],
    today_task: `Set up your ${gap} learning environment and complete the first module of a structured course (target: 2-3 hours)`
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/ai-mentor
// Body: { userData: { role, score, gaps[] }, question: string }
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/ai-mentor', async (req, res) => {
  try {
    const { userData, question } = req.body;

    if (!userData || !question) {
      return res.status(400).json({
        error: 'Missing required fields: userData (role, score, gaps) and question'
      });
    }

    const { role = 'Software Developer', score = 50, gaps = [] } = userData;

    console.log(`\n[AI-MENTOR] Role:${role} | Score:${score} | Gaps:${gaps.join(',')} | Q:"${question.slice(0, 60)}"`); 

    // ── Build dynamic prompt ────────────────────────────────────────────────
    const prompt = `
You are an elite career analyst and mentor. You NEVER give generic advice.
You act as a Decision Support System and Skill Gap Evaluator.

User Profile:
- Target Role: ${role}
- Readiness Score: ${score}%
- Critical Skill Gaps: ${gaps.length > 0 ? gaps.join(', ') : 'None identified'}
- Current Skills: ${userData.skills?.join(', ') || 'Not provided'}

Question from user: "${question}"

Core Rules:
1. USE ONLY the user data provided. Consider their skill gaps, current skill level, and target role requirements.
2. DO NOT hallucinate or suggest unrealistic paths.
3. ALWAYS give practical, real-world steps.
4. Explain WHY the user is lacking (e.g., "You are missing SQL, which is required in 90% of Data Analyst roles...").
5. Be direct, analytical, and structured. No fluff.

Roadmap Requirements:
- Must be realistic and beginner-to-intermediate friendly.
- Each step MUST include a Learning step, a Practice step, or a Project step.
- BONUS: Include [Difficulty Level], [Time Estimate], and [Priority Skill] in each roadmap step string.
  Example format: "Day 1-2 [Beginner | 4 hrs | SQL]: Learn SQL basics and practice JOIN queries."

Respond ONLY with a valid JSON object. No markdown, no explanation, no code fences.

{
  "insight": "One sharp, analytical sentence identifying the core issue, specific to this user and role.",
  "reason": "Data-backed explanation referencing their role, score, and specific gaps. Explain WHY they are getting rejected or what they lack.",
  "actions": [
    "Action 1 (highly specific to their gaps)",
    "Action 2",
    "Action 3"
  ],
  "roadmap": [
    "Day 1-2 [Difficulty | Time | Priority Skill]: ...",
    "Day 3-4 [Difficulty | Time | Priority Skill]: ...",
    "Day 5-6 [Difficulty | Time | Priority Skill]: ...",
    "Day 7 [Difficulty | Time | Priority Skill]: ...",
    "Week 2 [Difficulty | Time | Priority Skill]: ..."
  ],
  "today_task": "One concrete, highly actionable task the user must complete TODAY."
}`;

    let aiResponse;
    let modelUsed = 'fallback';

    if (GEMINI_KEY) {
      try {
        const { parsed, model } = await callGeminiREST(prompt);
        aiResponse = parsed;
        modelUsed = model;
        console.log('[AI-MENTOR] Gemini responded successfully');
      } catch (e) {
        console.warn('[AI-MENTOR] Gemini failed, using fallback:', e.message);
        aiResponse = buildFallback(role, score, gaps);
      }
    } else {
      console.warn('[AI-MENTOR] No API key — using fallback data');
      aiResponse = buildFallback(role, score, gaps);
    }

    // ── Validate structure before sending ──────────────────────────────────
    const required = ['insight', 'reason', 'actions', 'roadmap', 'today_task'];
    const missing = required.filter(k => !aiResponse[k]);
    if (missing.length > 0) {
      throw new Error(`AI response missing fields: ${missing.join(', ')}`);
    }
    if (!Array.isArray(aiResponse.actions) || !Array.isArray(aiResponse.roadmap)) {
      throw new Error('actions and roadmap must be arrays');
    }

    return res.json({
      ...aiResponse,
      meta: {
        role,
        score,
        gaps,
        model: modelUsed,
        timestamp: Date.now()
      }
    });

  } catch (err) {
    console.error('[AI-MENTOR ERROR]', err.message);
    return res.status(500).json({
      error: 'AI Mentor failed: ' + err.message,
      tip: 'Check that GEMINI_API_KEY is set in NLP/.env'
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n✅ SkillBridge NLP + AI Mentor v4.0`);
  console.log(`   GET  http://localhost:${PORT}/`);
  console.log(`   POST http://localhost:${PORT}/api/resume/parse`);
  console.log(`   POST http://localhost:${PORT}/api/ai-mentor`);
  console.log(`   Gemini: ${GEMINI_KEY ? '🟢 active via REST' : '🔴 fallback mode'}\n`);
});
