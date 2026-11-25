/**
 * Skills and Technologies Data
 * Sourced for Dheeraj - Computer Science Student & Developer
 * 
 * Strict rule: No fabricated percentages, progress bars, or expert claims.
 */

export const skillsData = {
  categories: [
    {
      id: 'programming',
      name: 'Programming',
      description: 'Core languages utilized for software logic, algorithms, and application development.',
      skills: [
        { name: 'C', category: 'Programming', iconType: 'c' },
        { name: 'Python', category: 'Programming', iconType: 'python' },
        { name: 'Java', category: 'Programming', iconType: 'java' },
        { name: 'JavaScript', category: 'Programming', iconType: 'javascript' }
      ]
    },
    {
      id: 'frontend',
      name: 'Frontend',
      description: 'Technologies for crafting accessible, semantic, and responsive user interfaces.',
      skills: [
        { name: 'HTML5', category: 'Frontend', iconType: 'html5' },
        { name: 'CSS3', category: 'Frontend', iconType: 'css3' },
        { name: 'React.js', category: 'Frontend', iconType: 'react' }
      ]
    },
    {
      id: 'backend',
      name: 'Backend',
      description: 'Server runtime environments, data services, and API architectures.',
      skills: [
        { name: 'Node.js', category: 'Backend', iconType: 'nodejs' },
        { name: 'REST APIs', category: 'Backend', iconType: 'api' }
      ]
    },
    {
      id: 'tools',
      name: 'Tools',
      description: 'Developer environments, version control systems, and operating platforms.',
      skills: [
        { name: 'Git', category: 'Tools', iconType: 'git' },
        { name: 'GitHub', category: 'Tools', iconType: 'github' },
        { name: 'VS Code', category: 'Tools', iconType: 'vscode' },
        { name: 'PyCharm', category: 'Tools', iconType: 'pycharm' },
        { name: 'Linux', category: 'Tools', iconType: 'linux' }
      ]
    },
    {
      id: 'data-analytics',
      name: 'Data Analytics',
      description: 'Libraries for data manipulation, numerical analysis, and plotting.',
      skills: [
        { name: 'NumPy', category: 'Data Analytics', iconType: 'numpy' },
        { name: 'Pandas', category: 'Data Analytics', iconType: 'pandas' },
        { name: 'Matplotlib', category: 'Data Analytics', iconType: 'matplotlib' }
      ]
    },
    {
      id: 'technical-interests',
      name: 'Technical Interests',
      description: 'Core focus domains and areas of ongoing exploration and project work.',
      skills: [
        { name: 'Artificial Intelligence', category: 'Technical Interests', iconType: 'ai' },
        { name: 'Cybersecurity', category: 'Technical Interests', iconType: 'security' },
        { name: 'Automation', category: 'Technical Interests', iconType: 'automation' }
      ]
    }
  ]
};

// Flat list helper for filtering and search
export const allSkillsList = skillsData.categories.flatMap((cat) => cat.skills);
