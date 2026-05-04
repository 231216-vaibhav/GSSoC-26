export interface Company {
  id: number;
  company: string;
  logo: string;
  role: string;
  type: string;
  location: string;
  salary: string;
  apply_url?: string;
  required_skills: string[];
  min_experience: number;
  description: string;
}

export interface MatchResult extends Company {
  matchScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  matchLevel: 'Strong Match' | 'Good Match' | 'Partial Match';
}

// Skill Synonyms & Related Skills Map for "Fuzzy" Matching
const SKILL_MAP: Record<string, string[]> = {
  'javascript': ['js', 'es6', 'ecmascript', 'vanilla js'],
  'typescript': ['ts'],
  'react': ['reactjs', 'react.js', 'next.js', 'nextjs', 'frontend', 'redux'],
  'node.js': ['nodejs', 'node', 'express', 'backend'],
  'mongodb': ['mongo', 'nosql', 'mongoose'],
  'python': ['django', 'flask', 'fastapi', 'data science', 'ml'],
  'aws': ['amazon web services', 's3', 'ec2', 'lambda', 'cloud'],
  'sql': ['mysql', 'postgresql', 'postgres', 'database', 'rdbms', 'sqlite'],
  'css': ['tailwind', 'sass', 'scss', 'bootstrap', 'material ui', 'ui/ux'],
  'java': ['spring boot', 'spring', 'hibernate', 'j2ee'],
  'c++': ['cpp', 'c plus plus'],
  'docker': ['kubernetes', 'k8s', 'devops', 'ci/cd', 'containers'],
  'git': ['github', 'gitlab', 'version control'],
  'machine learning': ['ml', 'ai', 'artificial intelligence', 'deep learning', 'pytorch', 'tensorflow'],
  'figma': ['adobe xd', 'sketch', 'ui design', 'ux design']
};

export function calculateJobMatches(userSkills: any[], companiesInput: any, experienceYears: number = 0): MatchResult[] {
  // Handle Vite JSON import wrapping
  const companies: Company[] = Array.isArray(companiesInput) ? companiesInput : (companiesInput?.default || []);
  if (!Array.isArray(companies)) return [];

  const safeSkills = Array.isArray(userSkills) ? userSkills : [];
  
  // Normalize user skills to a list of "expanded" strings (including aliases)
  const expandedUserSkills = new Set<string>();
  safeSkills.forEach(s => {
    const name = (typeof s === 'string' ? s : (s?.name || '')).toLowerCase().trim();
    if (!name) return;
    
    expandedUserSkills.add(name);
    
    // Add aliases/related skills from our map
    Object.entries(SKILL_MAP).forEach(([primary, aliases]) => {
      if (name === primary || aliases.includes(name)) {
        expandedUserSkills.add(primary);
        aliases.forEach(a => expandedUserSkills.add(a));
      }
    });
  });

  const matches = companies.map(company => {
    const requiredSkills = company.required_skills;
    const requiredSkillsLower = requiredSkills.map(s => s.toLowerCase().trim());
    
    const matchingSkills: string[] = [];
    const missingSkills: string[] = [];

    requiredSkills.forEach(skill => {
      const skillLower = skill.toLowerCase().trim();
      
      // Direct match or alias match
      let isMatch = expandedUserSkills.has(skillLower);
      
      // Check if any of the user's skills are in the alias list for this required skill
      if (!isMatch) {
        const aliases = SKILL_MAP[skillLower] || [];
        isMatch = aliases.some(alias => expandedUserSkills.has(alias));
      }

      if (isMatch) {
        matchingSkills.push(skill);
      } else {
        missingSkills.push(skill);
      }
    });

    // Score calculation
    let matchScore = (matchingSkills.length / requiredSkills.length) * 100;

    // Experience penalty/bonus
    if (experienceYears < company.min_experience) {
      matchScore -= (company.min_experience - experienceYears) * 10;
    } else if (experienceYears > company.min_experience + 2) {
      matchScore += 5; // Slight bonus for extra experience
    }

    matchScore = Math.min(100, Math.max(0, matchScore));

    let matchLevel: MatchResult['matchLevel'] = 'Partial Match';
    if (matchScore >= 75) matchLevel = 'Strong Match';
    else if (matchScore >= 45) matchLevel = 'Good Match';

    return {
      ...company,
      matchScore: Math.round(matchScore),
      matchingSkills,
      missingSkills,
      matchLevel
    };
  });

  // Sort by score descending
  return matches.sort((a, b) => b.matchScore - a.matchScore);
}
