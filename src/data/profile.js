/**
 * Profile and Narrative Data
 * Sourced for STUDENT - Computer Science Student & Developer
 */

import { siteConfig } from '../config/siteConfig.js';

export const profileData = {
  hero: {
    eyebrow: 'Computer Science Student & Developer',
    heading: siteConfig.meta.headline,
    subheading: siteConfig.meta.heroDescription,
    paragraph: siteConfig.meta.heroParagraph,
    primaryCta: { label: 'Explore Projects', href: '#projects' },
    secondaryCta: { label: 'Contact Me', href: '#contact' },
    statusBadge: siteConfig.meta.isAvailableForInternships 
      ? siteConfig.meta.statusAvailable 
      : siteConfig.meta.statusUnavailable
  },

  about: {
    eyebrow: 'About Me',
    title: 'Building Practical Software & Exploring Emerging Technologies',
    description: 'B.Tech Computer Science and Engineering student at KL University (2025–2029) passionate about hands-on software engineering, problem solving, and modern computing systems.',
    intro: [
      "I'm STUDENT, a Computer Science and Engineering undergraduate at KL University (2025–2029) based in Vijayawada, Andhra Pradesh, India. I have a natural curiosity for technology, software architecture, and the mechanics of modern digital systems.",
      "My passion lies in building practical, reliable software applications—ranging from responsive web interfaces and productivity-enhancing browser extensions to desktop companion tools and automation workflows. I enjoy dissecting how software works under the hood, understanding core fundamentals, and turning creative concepts into functional tools.",
      "I actively explore emerging domains across Software Development, Artificial Intelligence, Cybersecurity, Automation, and Web Development. I prioritize clean standards, continuous hands-on practice, and developing solutions that address real-world technical problems."
    ],
    academicCard: {
      name: siteConfig.meta.name,
      degree: siteConfig.meta.degree,
      institution: siteConfig.meta.institution,
      period: siteConfig.meta.academicPeriod,
      location: siteConfig.meta.location,
      status: siteConfig.meta.isAvailableForInternships 
        ? siteConfig.meta.statusAvailable 
        : 'Active Undergraduate Student',
      interests: siteConfig.interests
    }
  }
};
