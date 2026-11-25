/**
 * Experience & Development Journey Data
 * Sourced for Dheeraj - Computer Science Student & Developer
 * 
 * Strict Accuracy Rules:
 * - Independent academic and personal projects only.
 * - No invented company names, employment history, internships, dates, awards, or achievements.
 * - Distinct from education.js to prevent duplication.
 */

export const developmentJourneyData = [
  {
    id: 'journey-devicebridge',
    name: 'DeviceBridge',
    category: 'Desktop Application',
    tagline: 'Desktop & Mobile Companion Development',
    shortDescription: 'Desktop and mobile companion application development focused on cross-device connectivity, communication, and interaction.',
    technologies: ['Electron', 'JavaScript', 'Node.js', 'ADB', 'WebRTC'],
    milestones: [
      'Constructed modular Electron desktop application shell using modern JavaScript and Node.js.',
      'Implemented local Android Debug Bridge (ADB) daemon integration for device detection and status commands.',
      'Configured WebRTC peer connection pipelines for local wireless messaging between devices.'
    ]
  },
  {
    id: 'journey-shortcut',
    name: 'SHORTCUT',
    category: 'Browser Extension',
    tagline: 'Productivity Tooling for University ERP',
    shortDescription: 'Chrome extension development designed to provide quick navigation to frequently used KL University ERP functionality.',
    technologies: ['React', 'JavaScript', 'Vite', 'Chrome Extension APIs'],
    milestones: [
      'Engineered fast React popup user interface bundled with Vite for rapid sub-second rendering.',
      'Mapped and streamlined student endpoints for daily academic checks including attendance and course portals.',
      'Implemented Manifest V3 service worker architecture with minimal required browser permissions.'
    ]
  },
  {
    id: 'journey-sapas',
    name: 'SAPAS',
    category: 'Academic Analytics',
    tagline: 'Smart Academic Performance and Analytics System',
    shortDescription: 'Academic performance analytics project focused on processing, analyzing, and visualizing student score distributions.',
    technologies: ['Python', 'NumPy', 'Pandas', 'Matplotlib'],
    milestones: [
      'Built automated data parsing and cleaning routines for tabular academic score sheets using Pandas.',
      'Implemented statistical computations for averages, standard deviations, and score spreads using NumPy.',
      'Generated visual distribution histograms and comparative performance charts using Matplotlib.'
    ]
  },
  {
    id: 'journey-diai',
    name: 'DIAI',
    category: 'Automation & Assistant',
    tagline: 'Personal Assistant & Desktop Automation',
    shortDescription: 'Personal assistant and desktop automation project designed to explore task automation and web interaction.',
    technologies: ['Python', 'PyAutoGUI', 'Selenium', 'BeautifulSoup'],
    milestones: [
      'Engineered programmatic browser automation scripts with explicit DOM wait conditions via Selenium.',
      'Implemented dynamic web scrapers and parser routines with BeautifulSoup for structured data extraction.',
      'Configured operating system GUI automation and keyboard/cursor macro sequences with PyAutoGUI.'
    ]
  },
  {
    id: 'journey-axion',
    name: 'AXION',
    category: 'Web Platform',
    tagline: 'Academia–Industry Skill Intelligence',
    shortDescription: 'Academia–Industry Skill Intelligence platform concept connecting university curricula with professional industry requirements.',
    technologies: ['React', 'JavaScript', 'CSS'],
    milestones: [
      'Researched foundational computer science subjects and organized them against contemporary industry skill roadmaps.',
      'Engineered modular React component structure with pure CSS variables and zero external UI libraries.',
      'Designed responsive roadmap navigation optimized for both desktop and mobile viewports.'
    ]
  },
  {
    id: 'journey-my-works',
    name: 'MY WORKS',
    category: 'Web Development',
    tagline: 'Software Showcase & Portfolio Platform',
    shortDescription: 'Website development project designed to showcase browser extensions, tools, and technical software projects.',
    technologies: ['React', 'JavaScript', 'CSS'],
    milestones: [
      'Architected responsive single-page application with accessible in-page case study readers and modals.',
      'Implemented pure CSS custom property design system adhering to a minimal light-theme aesthetic.',
      'Established modular architecture separating presentation components from centralized data files.'
    ]
  }
];

// Alias for backward compatibility
export const experienceData = developmentJourneyData;
