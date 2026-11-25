/**
 * Centralized Site Configuration
 * Defines metadata, navigation, brand information, and profile defaults.
 */

export const siteConfig = {
  meta: {
    name: 'STUDENT',
    displayName: 'STUDENT',
    author: 'STUDENT',
    initials: 'P',
    role: 'Computer Science Student | Developer | Technology Enthusiast',
    headline: "I'm STUDENT",
    heroLabel: "HELLO, I'M",
    heroDescription: 'Computer Science Student | Developer | Technology Enthusiast',
    heroParagraph: 'I enjoy building useful software, exploring emerging technologies, and transforming ideas into practical digital solutions.',
    
    // Education & Institution
    degree: 'B.Tech Computer Science and Engineering',
    institution: 'KL University',
    academicPeriod: '2025–2029',
    location: 'Vijayawada, Andhra Pradesh, India',
    
    // Internship Availability (Configurable - not assumed)
    isAvailableForInternships: false,
    statusAvailable: 'Available for internships & collaborations',
    statusUnavailable: 'Focused on academics & coursework',
    status: 'Focused on academics & coursework',
    
    // Resume document URL (configurable: left empty until a verified, genuine resume is provided by owner)
    resumeUrl: (typeof process !== 'undefined' && process.env && process.env.RESUME_URL) ? process.env.RESUME_URL : ''
  },

  interests: [
    'Software Development',
    'Artificial Intelligence',
    'Cybersecurity',
    'Automation',
    'Web Development'
  ],

  profileCard: {
    degree: 'B.Tech CSE',
    degreeFull: 'B.Tech Computer Science and Engineering',
    institution: 'KL University',
    academicPeriod: '2025–2029',
    location: 'Vijayawada, AP, India',
    locationFull: 'Vijayawada, Andhra Pradesh, India',
    interests: 'Software Development, AI, Cybersecurity, Automation, Web'
  },

  navigation: [
    { label: 'Home', href: '#home' },
    { label: 'About', href: '#about' },
    { label: 'Skills', href: '#skills' },
    { label: 'Education', href: '#education' },
    { label: 'Projects', href: '#projects' },
    { label: 'Experience', href: '#experience' },
    { label: 'Services', href: '#services' },
    { label: 'GitHub', href: '#github' },
    { label: 'Blog', href: '#blog' },
    { label: 'Contact', href: '#contact' }
  ],

  github: {
    // Configurable GitHub username (kept configurable; fallback setup placeholder when empty)
    username: (typeof process !== 'undefined' && process.env && process.env.GITHUB_USERNAME) ? process.env.GITHUB_USERNAME : '',
    profileUrl: 'https://github.com',
    showPublicRepos: 6
  },

  socials: [
    {
      name: 'GitHub',
      url: 'https://github.com',
      ariaLabel: 'View GitHub Profile'
    },
    {
      name: 'LinkedIn',
      url: 'https://linkedin.com',
      ariaLabel: 'View LinkedIn Profile'
    },
    {
      name: 'Instagram',
      url: 'https://instagram.com',
      ariaLabel: 'View Instagram Profile'
    }
  ],

  contact: {
    // Configurable public email address (left empty until owner provides verified address)
    email: (typeof process !== 'undefined' && process.env && process.env.PUBLIC_EMAIL) ? process.env.PUBLIC_EMAIL : '',
    location: 'Vijayawada, Andhra Pradesh, India (IST)',
    responseTime: 'Available for academic & technical discussions'
  }
};
