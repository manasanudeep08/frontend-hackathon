/**
 * Projects and Case Studies Data
 * Centralized list of actual software projects for Dheeraj.
 * 
 * Strict Accuracy Rules:
 * - No invented GitHub or deployment URLs (null when unavailable)
 * - No fake metrics or claims of unfinished features as completed
 * - Clearly distinguishes implemented features from planned features
 * - Configurable image paths (null for neutral placeholders)
 */

export const projectsData = [
  {
    id: 'project-devicebridge',
    title: 'DEVICEBRIDGE',
    fullName: 'DeviceBridge',
    category: 'Desktop Application',
    filterCategory: 'Desktop Applications',
    shortDescription: 'A desktop and mobile companion application focused on device connectivity, communication, and interaction.',
    technologies: ['Electron', 'JavaScript', 'Node.js', 'ADB', 'WebRTC'],
    thumbnail: null,
    githubUrl: null,
    liveDemoUrl: null,
    caseStudy: {
      overview: 'DeviceBridge is a companion application designed to connect desktop and mobile devices for interaction, status monitoring, and data exchange across platforms.',
      problemStatement: 'Managing, monitoring, and interacting with mobile devices from a desktop environment often requires disparate command-line tools or fragmented utilities, making unified device interaction tedious.',
      proposedSolution: 'A unified desktop application built with Electron that pairs local Android Debug Bridge (ADB) connection utilities with WebRTC data channels for direct device communication.',
      implementedFeatures: [
        'Desktop companion application shell built with Electron and modern JavaScript.',
        'Local device status detection and command invocation through Android Debug Bridge (ADB) bindings.',
        'WebRTC peer connection setup for wireless data channel messaging between devices.'
      ],
      plannedFeatures: [
        'Dedicated mobile companion application for streamlined wireless handshakes.',
        'Bidirectional local Wi-Fi file transfer manager.'
      ],
      technologiesUsed: ['Electron', 'JavaScript', 'Node.js', 'ADB', 'WebRTC'],
      developmentProcess: 'Researched ADB socket commands and Node.js child process bindings for local hardware communication. Constructed the Electron application container and implemented WebRTC data channel messaging over local network interfaces.',
      challengesEncountered: 'Handling varying ADB daemon states, device authorization permissions, and asynchronous socket communication across differing desktop environments.',
      screenshot: null
    }
  },
  {
    id: 'project-shortcut',
    title: 'SHORTCUT',
    fullName: 'SHORTCUT',
    category: 'Browser Extension',
    filterCategory: 'Browser Extensions',
    shortDescription: 'A Chrome extension designed to provide convenient access to frequently used KL University ERP functionality.',
    technologies: ['React', 'JavaScript', 'Vite', 'Chrome Extension APIs'],
    thumbnail: null,
    githubUrl: null,
    liveDemoUrl: null,
    caseStudy: {
      overview: 'SHORTCUT is a Chrome browser extension built to give KL University students direct, fast navigation to essential academic ERP modules directly from their browser toolbar.',
      problemStatement: 'Navigating through deep portal menus repeatedly for daily academic checks—such as viewing attendance, timetables, and grades—is repetitive and time-consuming.',
      proposedSolution: 'A lightweight Chrome extension popup built with React and Vite that provides direct shortcuts and navigation buttons to frequent university portal endpoints.',
      implementedFeatures: [
        'Fast React popup user interface bundled with Vite for rapid sub-second rendering.',
        'Direct navigation shortcuts to attendance, course registration, and student grade portals.',
        'Manifest V3 compliant extension architecture requiring minimal browser permissions.'
      ],
      plannedFeatures: [
        'User-customizable bookmark slots to allow students to pin specific course pages.',
        'Quick-search keyboard filter for rapid portal destination lookup.'
      ],
      technologiesUsed: ['React', 'JavaScript', 'Vite', 'Chrome Extension APIs'],
      developmentProcess: 'Mapped primary student ERP destination URLs, structured the React popup component with lightweight CSS, and packaged the extension adhering to Manifest V3 service worker specifications.',
      challengesEncountered: 'Adapting extension state handling to Manifest V3 service worker lifecycle constraints compared to legacy persistent background scripts.',
      screenshot: null
    }
  },
  {
    id: 'project-sapas',
    title: 'SAPAS',
    fullName: 'Smart Academic Performance and Analytics System',
    category: 'Analytics Platform',
    filterCategory: 'Analytics',
    shortDescription: 'A Python-based academic analytics project focused on processing and analyzing student performance data.',
    technologies: ['Python', 'NumPy', 'Pandas', 'Matplotlib'],
    thumbnail: null,
    githubUrl: null,
    liveDemoUrl: null,
    caseStudy: {
      overview: 'SAPAS (Smart Academic Performance and Analytics System) is a data evaluation project designed to analyze student score records, calculate distributions, and visualize academic trends.',
      problemStatement: 'Interpreting student performance from raw tabular score sheets makes it difficult to spot subject-level patterns, grade spreads, or comparative progress without manual calculation.',
      proposedSolution: 'An automated Python data pipeline using Pandas for ingestion and cleaning, NumPy for statistical aggregation, and Matplotlib for generating distribution plots.',
      implementedFeatures: [
        'Automated parsing, cleaning, and normalization of tabular academic score sheets using Pandas.',
        'Statistical computation of averages, standard deviations, and score distributions using NumPy.',
        'Generation of visual grade histograms and subject-level comparison bar charts using Matplotlib.'
      ],
      plannedFeatures: [
        'Multi-semester trend tracking across sequential exam cohorts.',
        'Automated export of visual performance summary sheets.'
      ],
      technologiesUsed: ['Python', 'NumPy', 'Pandas', 'Matplotlib'],
      developmentProcess: 'Defined sample academic record schemas, built data wrangling scripts to handle missing values, and created parameterized Matplotlib plotting routines for visual output.',
      challengesEncountered: 'Normalizing varying spreadsheet formats, header conventions, and handling incomplete data entries during file ingestion.',
      screenshot: null
    }
  },
  {
    id: 'project-diai',
    title: 'DIAI',
    fullName: 'DIAI',
    category: 'Automation',
    filterCategory: 'Automation',
    shortDescription: 'A personal assistant and desktop automation project designed to explore task automation and web interaction.',
    technologies: ['Python', 'PyAutoGUI', 'Selenium', 'BeautifulSoup'],
    thumbnail: null,
    githubUrl: null,
    liveDemoUrl: null,
    caseStudy: {
      overview: 'DIAI is a personal automation project designed to execute scripted desktop tasks, trigger operating system actions, and scrape dynamic web content automatically.',
      problemStatement: 'Performing repetitive daily computer actions—such as checking specific web portals, gathering information, and triggering standard desktop sequences—consumes manual effort.',
      proposedSolution: 'A modular Python automation tool pairing PyAutoGUI for operating system GUI control with Selenium and BeautifulSoup for structured web navigation and data extraction.',
      implementedFeatures: [
        'Programmatic browser navigation and automated web interaction using Selenium WebDriver.',
        'Parsing and dynamic content extraction from target web pages using BeautifulSoup.',
        'Desktop keystroke, cursor movement, and application launch automation via PyAutoGUI.'
      ],
      plannedFeatures: [
        'Command-line workflow triggers for scheduled daily task execution.',
        'Modular configuration file for defining custom multi-step task sequences.'
      ],
      technologiesUsed: ['Python', 'PyAutoGUI', 'Selenium', 'BeautifulSoup'],
      developmentProcess: 'Created targeted automation routines for specific web navigation tasks, added DOM element locators with explicit wait conditions, and integrated OS-level input scripts.',
      challengesEncountered: 'Ensuring browser automation scripts reliably handle asynchronous page loading delays and dynamic DOM updates without desynchronization.',
      screenshot: null
    }
  },
  {
    id: 'project-axion',
    title: 'AXION',
    fullName: 'Academia–Industry Skill Intelligence',
    category: 'Web Application',
    filterCategory: 'Web Development',
    shortDescription: 'A platform concept focused on connecting academic learning with industry skill requirements.',
    technologies: ['React', 'JavaScript', 'CSS'],
    thumbnail: null,
    githubUrl: null,
    liveDemoUrl: null,
    caseStudy: {
      overview: 'AXION is an educational platform concept designed to help computer science students map their academic curricula against contemporary industry software skill roadmaps.',
      problemStatement: 'Undergraduate students frequently find it challenging to connect theoretical classroom coursework with the practical technology stacks required in professional software engineering roles.',
      proposedSolution: 'A clean, interactive React web platform that organizes and maps foundational academic subjects to industry skills across software development, AI, and cybersecurity.',
      implementedFeatures: [
        'Component-based React application architecture styled with pure CSS custom properties.',
        'Categorized technical skill roadmaps highlighting modern tools and practical competencies.',
        'Interactive roadmap navigation designed for both desktop and mobile viewports.'
      ],
      plannedFeatures: [
        'Self-evaluation checklist for students to track coursework against industry expectations.',
        'Resource links to relevant documentation and practical projects for skill development.'
      ],
      technologiesUsed: ['React', 'JavaScript', 'CSS'],
      developmentProcess: 'Researched software engineering requirements, structured educational competency categories, and built responsive React components with zero external UI libraries.',
      challengesEncountered: 'Designing an intuitive visual hierarchy that organizes diverse technical competencies clearly without overwhelming the user.',
      screenshot: null
    }
  },
  {
    id: 'project-my-works',
    title: 'MY WORKS',
    fullName: 'MY WORKS',
    category: 'Web Development',
    filterCategory: 'Web Development',
    shortDescription: 'A website designed to showcase browser extensions and software development projects.',
    technologies: ['React', 'JavaScript', 'CSS'],
    thumbnail: null,
    githubUrl: null,
    liveDemoUrl: null,
    caseStudy: {
      overview: 'MY WORKS is a portfolio and project showcase website created to document, display, and organize personal software development projects, browser extensions, and tools.',
      problemStatement: 'Presenting a diverse collection of projects—including browser extensions, desktop tools, and Python scripts—requires a coherent, accessible presentation platform.',
      proposedSolution: 'A responsive single-page React website featuring categorized project cards, deep in-page case study readers, and semantic HTML without framework bloat.',
      implementedFeatures: [
        'Single-page application layout built with React and Vite for sub-second page performance.',
        'In-page accessible modal reader supporting keyboard navigation, ESC dismissal, and focus management.',
        'Interactive category filter tabs allowing visitors to browse by technical domain.',
        'Pure CSS variable design system adhering to a minimal light-theme aesthetic.'
      ],
      plannedFeatures: [
        'Interactive project demo embeds for web-based tools.',
        'Dark/light theme toggle consideration while maintaining minimalist design tokens.'
      ],
      technologiesUsed: ['React', 'JavaScript', 'CSS'],
      developmentProcess: 'Architected modular React components with centralized data models, crafted custom CSS styles, and tested across modern browsers for responsive stability.',
      challengesEncountered: 'Implementing accessible modal focus traps and body scroll locking without causing layout jitter or scrollbar shifts across platforms.',
      screenshot: null
    }
  }
];

export const projectFilterTabs = [
  'All Projects',
  'Web Development',
  'Desktop Applications',
  'Browser Extensions',
  'Automation',
  'Analytics'
];
