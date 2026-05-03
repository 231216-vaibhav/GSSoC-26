export interface Mentor {
  id: number;
  name: string;
  role: string;
  company: string;
  domain: string;
  rating: number;
  sessions: number;
  avatar: string;
  skills: string[];
  available: string[];
  bio: string;
}

export interface Skill {
  name: string;
  score: number;
  status: 'passed' | 'failed' | 'not-tested';
  gap?: string;
}

export interface InterviewQuestion {
  id: number;
  question: string;
  category: string;
  hint?: string;
}

export const mentors: Mentor[] = [
  {
    id: 1,
    name: 'Aisha Patel',
    role: 'Senior Software Engineer',
    company: 'Google',
    domain: 'Web Dev',
    rating: 4.9,
    sessions: 142,
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400',
    skills: ['React', 'Node.js', 'TypeScript', 'System Design'],
    available: ['Mon 10AM', 'Wed 2PM', 'Fri 4PM'],
    bio: 'Helping engineers land FAANG roles with structured prep and real-world guidance.',
  },
  {
    id: 2,
    name: 'Marcus Chen',
    role: 'ML Research Scientist',
    company: 'OpenAI',
    domain: 'AI/ML',
    rating: 4.8,
    sessions: 98,
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400',
    skills: ['Python', 'PyTorch', 'NLP', 'Deep Learning'],
    available: ['Tue 11AM', 'Thu 3PM', 'Sat 10AM'],
    bio: 'Bridging the gap between research and industry for aspiring AI engineers.',
  },
  {
    id: 3,
    name: 'Priya Sharma',
    role: 'Product Manager',
    company: 'Airbnb',
    domain: 'Product',
    rating: 4.7,
    sessions: 210,
    avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400',
    skills: ['Product Strategy', 'User Research', 'Agile', 'Analytics'],
    available: ['Mon 2PM', 'Thu 10AM', 'Fri 11AM'],
    bio: 'Guiding aspiring PMs through case studies and real product challenges.',
  },
  {
    id: 4,
    name: 'David Kim',
    role: 'Cybersecurity Lead',
    company: 'Microsoft',
    domain: 'Cybersecurity',
    rating: 4.9,
    sessions: 77,
    avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=400',
    skills: ['Penetration Testing', 'SIEM', 'Cloud Security', 'Networking'],
    available: ['Wed 9AM', 'Fri 2PM', 'Sat 3PM'],
    bio: 'Helping students break into security with real threat modeling and CTF training.',
  },
  {
    id: 5,
    name: 'Sofia Torres',
    role: 'Data Engineer',
    company: 'Spotify',
    domain: 'Data Science',
    rating: 4.6,
    sessions: 134,
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
    skills: ['SQL', 'Spark', 'Airflow', 'dbt', 'BigQuery'],
    available: ['Tue 9AM', 'Thu 4PM', 'Sat 1PM'],
    bio: 'Passionate about data pipelines and helping analysts level up to engineering roles.',
  },
  {
    id: 6,
    name: 'James Okafor',
    role: 'Cloud Architect',
    company: 'AWS',
    domain: 'Cloud',
    rating: 4.8,
    sessions: 165,
    avatar: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=400',
    skills: ['AWS', 'Terraform', 'Kubernetes', 'DevOps'],
    available: ['Mon 3PM', 'Wed 11AM', 'Fri 9AM'],
    bio: 'Helping cloud beginners architect production-grade systems on AWS.',
  },
];

export const domains = ['All', 'Web Dev', 'AI/ML', 'Product', 'Cybersecurity', 'Data Science', 'Cloud'];

export const skillCategories = [
  'JavaScript / TypeScript',
  'React & Frontend',
  'Node.js / Backend',
  'Python',
  'Data Structures & Algorithms',
  'System Design',
  'SQL & Databases',
  'Machine Learning',
];

export const interviewQuestions: InterviewQuestion[] = [
  {
    id: 1,
    question: 'Tell me about yourself and why you are interested in this role.',
    category: 'Behavioral',
    hint: 'Use the STAR framework. Focus on relevant experiences.',
  },
  {
    id: 2,
    question: 'What is the difference between synchronous and asynchronous programming? Give an example.',
    category: 'Technical',
    hint: 'Think about blocking vs non-blocking I/O. Mention Promises, async/await.',
  },
  {
    id: 3,
    question: 'Describe a time you resolved a conflict within your team.',
    category: 'Behavioral',
    hint: 'Highlight communication, empathy, and resolution outcome.',
  },
  {
    id: 4,
    question: 'Explain the concept of Big O notation and why it matters.',
    category: 'Technical',
    hint: 'Relate to time and space complexity. Use O(n), O(log n) examples.',
  },
  {
    id: 5,
    question: 'How would you design a URL shortening service like bit.ly?',
    category: 'System Design',
    hint: 'Cover: hashing strategy, database schema, read/write ratio, caching.',
  },
  {
    id: 6,
    question: 'What are your greatest strengths and a weakness you are actively improving?',
    category: 'Behavioral',
    hint: 'Be honest and specific. Show self-awareness on the weakness.',
  },
];

export const roadmapSteps = [
  { step: 1, title: 'Profile & Skill Assessment', done: true },
  { step: 2, title: 'Resume Analysis', done: true },
  { step: 3, title: 'Gap Analysis Report', done: false },
  { step: 4, title: 'Mentor Match', done: false },
  { step: 5, title: 'Mock Interviews', done: false },
  { step: 6, title: 'Job-Ready Certification', done: false },
];

export const userSkillData: Skill[] = [
  { name: 'JavaScript', score: 72, status: 'passed' },
  { name: 'React', score: 65, status: 'passed' },
  { name: 'Node.js', score: 38, status: 'failed', gap: 'Focus on REST APIs, middleware, and async patterns.' },
  { name: 'System Design', score: 29, status: 'failed', gap: 'Study distributed systems, CAP theorem, and load balancing.' },
  { name: 'SQL', score: 55, status: 'passed' },
  { name: 'Machine Learning', score: 0, status: 'not-tested', gap: 'Take the ML skill assessment to get scored.' },
];
