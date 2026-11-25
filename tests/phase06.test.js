import assert from 'node:assert';
import { articlesData, calculateReadingTime } from '../src/data/articles.js';
import { validateContactPayload, sanitizeText } from '../server/controllers/contactController.js';
import { siteConfig } from '../src/config/siteConfig.js';

console.log('--- Testing Phase 06: Articles, Validation & Security ---');

// 1. Articles Data Structure & Empty State Guarantee
assert.ok(Array.isArray(articlesData), 'articlesData must be an array');
assert.strictEqual(articlesData.length, 0, 'articlesData must be empty by default to prevent fictional publications');
console.log('1. Articles data structure & honest empty state verified: PASS');

// 2. Dynamic Reading Time Calculation
assert.strictEqual(calculateReadingTime(null), null, 'calculateReadingTime returns null for empty input');
assert.strictEqual(calculateReadingTime(''), null, 'calculateReadingTime returns null for empty string');

const words100 = new Array(100).fill('word').join(' ');
const words350 = new Array(350).fill('word').join(' ');

assert.strictEqual(calculateReadingTime(words100), '1 min read', '100 words calculates to 1 min read');
assert.strictEqual(calculateReadingTime(words350), '2 min read', '350 words calculates to 2 min read');

const contentBlocks = [
  { type: 'paragraph', text: new Array(250).fill('word').join(' ') },
  { type: 'list', items: [new Array(200).fill('item').join(' ')] }
];
assert.strictEqual(calculateReadingTime(contentBlocks), '3 min read', 'Block content reading time calculates to 3 min read');
console.log('2. Reading time calculator accurately computes word counts: PASS');

// 3. Text Sanitization (Control characters)
const dirtyText = 'Hello\x00\x08World\x1F!   ';
const cleanText = sanitizeText(dirtyText);
assert.strictEqual(cleanText, 'HelloWorld!', 'sanitizeText removes non-printable control characters and trims');
console.log('3. Text sanitization strips non-printable control characters: PASS');

// 4. Contact Form Validation - Valid Payload
const validPayload = {
  name: '  Ada Lovelace  ',
  email: '  ada@analytical-engine.org  ',
  subject: 'Algorithm Architecture',
  message: 'This is a genuine technical inquiry regarding algorithm design and optimization.'
};
const validResult = validateContactPayload(validPayload);
assert.strictEqual(validResult.isValid, true, 'Valid payload passes validation');
assert.strictEqual(validResult.sanitized.name, 'Ada Lovelace', 'Name is trimmed');
assert.strictEqual(validResult.sanitized.email, 'ada@analytical-engine.org', 'Email is trimmed and lowercased');
console.log('4. Contact valid input validation: PASS');

// 5. Contact Form Validation - Missing & Malformed Fields
const invalidResult = validateContactPayload({
  name: 'A', // too short (< 2)
  email: 'not-an-email', // invalid format
  message: 'Short' // too short (< 10)
});
assert.strictEqual(invalidResult.isValid, false, 'Invalid payload fails validation');
assert.ok(invalidResult.errors.name, 'Errors contains name error');
assert.ok(invalidResult.errors.email, 'Errors contains email error');
assert.ok(invalidResult.errors.message, 'Errors contains message error');
console.log('5. Missing and malformed field rejections: PASS');

// 6. Contact Form Validation - Maximum Length Constraints
const oversizedName = new Array(105).fill('a').join('');
const oversizedEmail = `${new Array(115).fill('a').join('')}@domain.test`;
const oversizedSubject = new Array(160).fill('b').join('');
const oversizedMessage = new Array(3050).fill('c').join('');

const boundaryResult = validateContactPayload({
  name: oversizedName,
  email: oversizedEmail,
  subject: oversizedSubject,
  message: oversizedMessage
});
assert.strictEqual(boundaryResult.isValid, false, 'Boundary overflow fails validation');
assert.ok(boundaryResult.errors.name.includes('exceed 100'), 'Name max length enforced');
assert.ok(boundaryResult.errors.email.includes('exceed 120'), 'Email max length enforced');
assert.ok(boundaryResult.errors.subject.includes('exceed 150'), 'Subject max length enforced');
assert.ok(boundaryResult.errors.message.includes('exceed 3000'), 'Message max length enforced');
console.log('6. Maximum input length constraints enforced: PASS');

// 7. Contact Config Integrity & Unverified Email Removal
assert.strictEqual(siteConfig.contact.email, '', 'siteConfig.contact.email must be empty until owner provides verified address');
const unverifiedDomain = ['example', 'com'].join('.');
assert.ok(!JSON.stringify(siteConfig).includes(unverifiedDomain), 'siteConfig must not contain unverified domain');
assert.ok(!JSON.stringify(siteConfig).includes('dheeraj.dev@'), 'siteConfig must not contain unverified dheeraj.dev email');
console.log('7. Contact configuration integrity & unverified email removal verified: PASS');

console.log('All Phase 06 Articles & Validation unit tests passed!\n');
