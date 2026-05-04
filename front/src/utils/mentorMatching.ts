export interface SessionType {
  name: string;
  duration: number;
  price: number;
  is_free?: boolean;
  highlight?: boolean;
}

export interface Mentor {
  id: number;
  name: string;
  photo: string;
  current_role: string;
  company: string;
  college?: string;
  batch?: string;
  experience_years: number;
  domain: string;
  skills: string[];
  languages?: string[];
  rating: number;
  total_sessions: number;
  price_per_hour: number;
  lowest_session_price?: number;
  tier: 'Expert' | 'Pro' | 'Community';
  availability: string[];
  bio: string;
  linkedin: string;
  speciality: string;
  first_session_free?: boolean;
  alumni_badge?: string;
  session_types: SessionType[];
  matchScore?: number;
}

export function matchMentors(userSkills: string[], targetRole: string, mentors: Mentor[]) {
  return mentors
    .map(mentor => {
      const skillOverlap = mentor.skills.filter(s => 
        userSkills.map(u => u.toLowerCase()).includes(s.toLowerCase())
      ).length;
      
      // Basic match score logic: overlap / total skills * 100
      // Also consider domain match for extra points
      let matchScore = Math.round((skillOverlap / mentor.skills.length) * 100);
      
      // If domain matches targetRole (loosely), boost score
      if (mentor.domain.toLowerCase().includes(targetRole.toLowerCase()) || 
          targetRole.toLowerCase().includes(mentor.domain.toLowerCase())) {
        matchScore = Math.min(100, matchScore + 20);
      }

      return { ...mentor, matchScore };
    })
    .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
}
