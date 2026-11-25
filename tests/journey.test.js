import assert from 'node:assert';
import { developmentJourneyData } from '../src/data/experience.js';
import { servicesData } from '../src/data/services.js';

console.log('--- Testing Phase 05: Journey & Services Data Integrity ---');

// 1. Verify Development Journey projects
const expectedJourneyProjects = [
  'DeviceBridge',
  'SHORTCUT',
  'SAPAS',
  'DIAI',
  'AXION',
  'MY WORKS'
];

assert.strictEqual(developmentJourneyData.length, 6, 'Should contain exactly 6 development journey projects');
const actualNames = developmentJourneyData.map((item) => item.name);
assert.deepStrictEqual(actualNames, expectedJourneyProjects, 'Development journey project names match');

for (const item of developmentJourneyData) {
  assert.ok(item.category, `Item ${item.name} must have a category`);
  assert.ok(item.shortDescription, `Item ${item.name} must have a short description`);
  assert.ok(Array.isArray(item.technologies) && item.technologies.length > 0, `Item ${item.name} must have technologies`);
  assert.ok(Array.isArray(item.milestones) && item.milestones.length >= 2, `Item ${item.name} must have milestones`);
  
  // Verify no fabricated employment company or position
  assert.strictEqual(item.company, undefined, `Item ${item.name} should not claim employment company`);
}
console.log('1. Development journey items & milestones verified: PASS');

// 2. Verify Services & Capabilities
const expectedServices = [
  'Web Development',
  'Browser Extension Development',
  'Python Automation',
  'Software Development',
  'UI Implementation',
  'Technical Problem Solving'
];

assert.strictEqual(servicesData.length, 6, 'Should contain exactly 6 technical capabilities');
const actualServiceTitles = servicesData.map((s) => s.title);
assert.deepStrictEqual(actualServiceTitles, expectedServices, 'Capabilities titles match specification');

for (const service of servicesData) {
  assert.ok(service.description, `Capability ${service.title} must have a description`);
  assert.ok(Array.isArray(service.technologies) && service.technologies.length > 0, `Capability ${service.title} must have technologies`);
  assert.ok(service.iconType, `Capability ${service.title} must specify an icon`);
  assert.ok(service.ctaHref === '#contact', `Capability ${service.title} CTA must link to #contact`);
}
console.log('2. Capabilities & services verified: PASS');

console.log('All Phase 05 Journey & Services data integrity tests passed!\n');
