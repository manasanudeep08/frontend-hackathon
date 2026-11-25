/**
 * Education & Academic Milestones Data
 * Sourced for Dheeraj - Computer Science Student & Developer
 * 
 * Minimal, verified academic entry with modular space for future achievements.
 * Strict rule: No unverified coursework, certifications, or academic claims.
 */

export const educationData = {
  header: {
    eyebrow: 'Academic Journey',
    title: 'Education & Academic Timeline',
    description: 'Undergraduate computer science education and verified academic milestones at KL University.'
  },

  academicTimeline: [
    {
      id: 'edu-kl-university',
      degree: 'B.Tech Computer Science and Engineering',
      institution: 'KL University',
      period: '2025 — 2029',
      location: 'Vijayawada, Andhra Pradesh, India',
      status: 'Current Undergraduate Student',
      overview: 'Four-year undergraduate degree program in Computer Science and Engineering, focusing on computation, programming fundamentals, and software development.'
    }
  ],

  // Reusable spaces for future milestones, certifications, and technical workshops
  reusableCategories: [
    {
      id: 'certifications',
      title: 'Certifications & Accreditations',
      description: 'Modular space reserved for verified technical certifications and credential completions.',
      statusNotice: 'Future Milestone Space',
      emptyNotice: 'No certifications listed yet. Verified credentials will appear here upon completion.'
    },
    {
      id: 'workshops-milestones',
      title: 'Workshops, Hackathons & Seminars',
      description: 'Modular space reserved for verified university technical workshops, symposiums, and coding events.',
      statusNotice: 'Future Milestone Space',
      emptyNotice: 'Space reserved for future technical workshops and hackathon participations.'
    }
  ]
};
