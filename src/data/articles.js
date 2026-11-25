/**
 * Technical Articles & Engineering Notes Data
 * Sourced for Dheeraj - Computer Science Student & Developer
 * 
 * Strict Accuracy Rules:
 * - Do not invent published articles, publication dates, credentials, or external URLs.
 * - Do not create fictional article content and present it as published work.
 * - When no verified articles exist, articlesData is empty, rendering an honest "coming soon" state.
 * - Configurable structure below allows adding genuine publications as they are produced.
 */

/**
 * Calculates estimated reading time from article content blocks
 * @param {Array<{ type: string, text?: string, items?: string[] }> | string} content
 * @returns {string | null} e.g. "5 min read"
 */
export function calculateReadingTime(content) {
  if (!content) return null;
  let wordCount = 0;

  if (Array.isArray(content)) {
    for (const block of content) {
      if (block.text && typeof block.text === 'string') {
        wordCount += block.text.trim().split(/\s+/).filter(Boolean).length;
      }
      if (Array.isArray(block.items)) {
        for (const item of block.items) {
          if (typeof item === 'string') {
            wordCount += item.trim().split(/\s+/).filter(Boolean).length;
          }
        }
      }
    }
  } else if (typeof content === 'string') {
    wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  }

  if (wordCount === 0) return null;
  const minutes = Math.max(1, Math.ceil(wordCount / 200));
  return `${minutes} min read`;
}

/**
 * Verified Technical Articles List
 * Kept empty until genuine technical essays/articles are authored and published.
 */
export const articlesData = [];
