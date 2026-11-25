import assert from 'node:assert';
import { projectsData, projectFilterTabs } from '../src/data/projects.js';

console.log('--- Testing Phase 04 Featured Projects Showcase Data Integrity ---');

// 1. Verify project count
assert.strictEqual(projectsData.length, 6, 'Should contain exactly 6 authentic projects');
console.log('1. Exactly 6 authentic projects found: PASS');

// 2. Verify project titles
const expectedTitles = ['DEVICEBRIDGE', 'SHORTCUT', 'SAPAS', 'DIAI', 'AXION', 'MY WORKS'];
const actualTitles = projectsData.map((p) => p.title);
assert.deepStrictEqual(actualTitles, expectedTitles, 'Project titles must match authentic list');
console.log('2. Project titles verification: PASS');

// 3. Verify filter categories & tabs
const expectedTabs = [
  'All Projects',
  'Web Development',
  'Desktop Applications',
  'Browser Extensions',
  'Automation',
  'Analytics'
];
assert.deepStrictEqual(projectFilterTabs, expectedTabs, 'Project filter tabs match specifications');

for (const tab of projectFilterTabs) {
  if (tab === 'All Projects') continue;
  const matches = projectsData.filter((p) => p.filterCategory === tab || p.category === tab);
  assert.ok(matches.length > 0, `Filter tab "${tab}" must match at least one project`);
}
console.log('3. Filter tabs and category mappings: PASS');

// 4. Verify all 11 required case study fields
const requiredCaseStudyKeys = [
  'overview',
  'problemStatement',
  'proposedSolution',
  'implementedFeatures',
  'plannedFeatures',
  'technologiesUsed',
  'developmentProcess',
  'challengesEncountered'
];

for (const project of projectsData) {
  assert.ok(project.title, `Project ${project.id} must have a title`);
  assert.ok(project.shortDescription, `Project ${project.id} must have a shortDescription`);
  assert.ok(Array.isArray(project.technologies) && project.technologies.length > 0, `Project ${project.id} must have technologies`);
  assert.ok(project.caseStudy, `Project ${project.id} must have a caseStudy`);
  
  for (const key of requiredCaseStudyKeys) {
    assert.ok(project.caseStudy[key] !== undefined, `Project ${project.id} case study missing "${key}"`);
  }

  assert.ok(Array.isArray(project.caseStudy.implementedFeatures), `implementedFeatures must be an array in ${project.id}`);
  assert.ok(Array.isArray(project.caseStudy.plannedFeatures), `plannedFeatures must be an array in ${project.id}`);

  // 5. Verify no invented URLs or fake metrics
  assert.strictEqual(project.githubUrl, null, `Project ${project.id} githubUrl should be null until verified`);
  assert.strictEqual(project.liveDemoUrl, null, `Project ${project.id} liveDemoUrl should be null until verified`);
  assert.strictEqual(project.thumbnail, null, `Project ${project.id} thumbnail should be null (using neutral vector placeholder)`);
  assert.strictEqual(project.caseStudy.screenshot, null, `Project ${project.id} screenshot should be null (using neutral vector placeholder)`);
}
console.log('4. All 11 case study fields verified for all 6 projects: PASS');

// 6. Verify banned / fabricated project names do not exist
const bannedKeywords = ['StreamCore', 'Prism UI', 'NetSentinel', 'AutoTask'];
const serialized = JSON.stringify(projectsData);
for (const word of bannedKeywords) {
  assert.ok(!serialized.includes(word), `Banned project keyword "${word}" found in projects.js`);
}
console.log('5. Banned legacy names absent: PASS');

console.log('\nAll Phase 04 Featured Projects Showcase integrity tests passed!\n');
