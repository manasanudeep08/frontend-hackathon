/**
 * Interest Categories and Suggested Skill Sets for the Five-Minute Student Portfolio Builder.
 */

export const INTEREST_CATEGORIES = [
  {
    id: 'web-dev',
    name: 'Web Development',
    description: 'Frontend, backend, responsive web apps, APIs and full-stack development',
    icon: 'code'
  },
  {
    id: 'ai-ml',
    name: 'AI / Machine Learning',
    description: 'Machine learning models, neural networks, NLP, and intelligent systems',
    icon: 'cpu'
  },
  {
    id: 'cybersecurity',
    name: 'Cybersecurity',
    description: 'Network security, system hardening, ethical hacking, and defense',
    icon: 'shield'
  },
  {
    id: 'data-science',
    name: 'Data Science',
    description: 'Data analytics, visualization, statistical modeling, and insights',
    icon: 'bar-chart'
  },
  {
    id: 'mobile-dev',
    name: 'Mobile Development',
    description: 'Cross-platform native applications for Android and iOS',
    icon: 'smartphone'
  },
  {
    id: 'ui-ux',
    name: 'UI/UX',
    description: 'User interface design, wireframing, prototyping, and accessibility',
    icon: 'layout'
  },
  {
    id: 'cloud',
    name: 'Cloud Computing',
    description: 'Cloud infrastructure, containers, serverless, and deployment',
    icon: 'cloud'
  },
  {
    id: 'automation',
    name: 'Automation',
    description: 'Workflow automation, scripting, task runners, and tooling efficiency',
    icon: 'zap'
  },
  {
    id: 'iot',
    name: 'IoT',
    description: 'Internet of Things, microcontrollers, embedded hardware, and telemetry',
    icon: 'radio'
  },
  {
    id: 'other',
    name: 'Other',
    description: 'Software engineering fundamentals, algorithms, and general computing',
    icon: 'terminal'
  }
];

export const SUGGESTED_SKILLS_BY_INTEREST = {
  'Web Development': [
    'HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Node.js',
    'REST APIs', 'Git', 'Responsive Design', 'WebSockets'
  ],
  'AI / Machine Learning': [
    'Python', 'Machine Learning', 'Data Analysis', 'NumPy', 'Pandas',
    'Scikit-learn', 'TensorFlow', 'PyTorch', 'NLP'
  ],
  'Cybersecurity': [
    'Networking', 'Linux', 'Security Fundamentals', 'Web Security',
    'Cryptography', 'Penetration Testing', 'Identity & Access Management'
  ],
  'Data Science': [
    'Python', 'SQL', 'Data Visualization', 'Pandas', 'Statistics',
    'Tableau', 'Power BI', 'ETL Pipelines'
  ],
  'Mobile Development': [
    'React Native', 'Flutter', 'Kotlin', 'Swift', 'Android Studio',
    'Mobile UI', 'REST APIs', 'App Store Deployment'
  ],
  'UI/UX': [
    'Figma', 'UI Design', 'Wireframing', 'Prototyping', 'Design Systems',
    'User Research', 'Accessibility (WCAG)', 'Interaction Design'
  ],
  'Cloud Computing': [
    'AWS', 'Google Cloud', 'Microsoft Azure', 'Docker', 'Kubernetes',
    'Linux', 'CI/CD Pipelines', 'Serverless Architecture'
  ],
  'Automation': [
    'Python Scripting', 'Bash', 'PowerShell', 'Task Automation',
    'Cron Jobs', 'API Integration', 'Puppeteer', 'Playwright'
  ],
  'IoT': [
    'C++', 'Python', 'Arduino', 'Raspberry Pi', 'MQTT',
    'Sensors & Actuators', 'Hardware Interfacing', 'Embedded C'
  ],
  'Other': [
    'Data Structures', 'Algorithms', 'Object-Oriented Programming',
    'Git & GitHub', 'Problem Solving', 'Unit Testing', 'Technical Writing'
  ]
};

export const PROJECT_CATEGORIES = [
  'Web Application',
  'Mobile Application',
  'Desktop Application',
  'Browser Extension',
  'Analytics Platform',
  'Cloud Architecture',
  'Automation Script',
  'Machine Learning Model',
  'Open Source Tool',
  'Other'
];

export default {
  INTEREST_CATEGORIES,
  SUGGESTED_SKILLS_BY_INTEREST,
  PROJECT_CATEGORIES
};
