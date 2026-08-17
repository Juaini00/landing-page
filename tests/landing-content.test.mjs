import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const projectsSource = await readFile(new URL('../src/data/projects.ts', import.meta.url), 'utf8');
const projectsComponent = await readFile(new URL('../src/components/Projects.astro', import.meta.url), 'utf8');
const stackSource = await readFile(new URL('../src/components/Stack.astro', import.meta.url), 'utf8');
const cssSource = await readFile(new URL('../src/styles/global.css', import.meta.url), 'utf8');
const id = JSON.parse(await readFile(new URL('../src/i18n/id.json', import.meta.url), 'utf8'));
const en = JSON.parse(await readFile(new URL('../src/i18n/en.json', import.meta.url), 'utf8'));

test('featured current builds include source and demo links', () => {
  assert.match(projectsSource, /fineract-ai-reports/);
  assert.match(projectsSource, /HRIS-Mini/);
  assert.match(projectsSource, /hris-mini-production-bvwjdi\.laravel\.cloud/);
  assert.match(projectsSource, /links\?:/);
});

test('project i18n starts with the two active applications', () => {
  assert.equal(en['project.01.title'], 'Fineract AI Reports');
  assert.equal(id['project.01.title'], 'Fineract AI Reports');
  assert.match(en['project.02.title'], /NusaHR/);
  assert.match(id['project.02.title'], /NusaHR/);
  assert.match(en['project.02.demo'], /admin, HR, manager, employee/);
  assert.match(id['project.02.demo'], /admin, HR, manager, employee/);
});

test('contact copy no longer uses stale Q2 2026 availability', () => {
  assert.doesNotMatch(en['contact.eyebrow'], /Q2 2026/);
  assert.doesNotMatch(id['contact.eyebrow'], /Q2 2026/);
  assert.doesNotMatch(en['contact.avail.from'], /May 2026/);
  assert.doesNotMatch(id['contact.avail.from'], /Mei 2026/);
});

test('project workflow diagrams use aligned step layouts', () => {
  assert.match(projectsSource, /console-steps/);
  assert.match(projectsSource, /console-step/);
  assert.match(cssSource, /\.console-steps/);
  assert.match(cssSource, /grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/);
});

test('project diagrams use compact architecture panels without decorative browser chrome', () => {
  assert.doesNotMatch(projectsSource, /console-top/);
  assert.match(projectsSource, /project-diagram/);
  assert.match(cssSource, /\.project-card\s*\{[^}]*--project-card-padding:/s);
  assert.match(cssSource, /\.project-diagram\s*\{[^}]*padding:/s);
});

test('workflow connectors render as lightweight horizontal lines', () => {
  const connectorRule = cssSource.match(/\.console-arrow\s*\{[^}]+\}/)?.[0] ?? '';

  assert.match(connectorRule, /border:\s*0/);
  assert.match(connectorRule, /linear-gradient\(0deg/);
});

test('mobile workflow keeps the node connector node reading order', () => {
  const mobileRules = cssSource.match(/@media \(max-width:\s*720px\)[\s\S]*?(?=@media|$)/)?.[0] ?? '';

  assert.doesNotMatch(mobileRules, /\.console-steps\s*\{[^}]*repeat\(2,/s);
});

test('project diagrams avoid fixed mobile overflow', () => {
  const projectDiagramRule = cssSource.match(/\.project-diagram\s*\{[^}]+\}/)?.[0] ?? '';

  assert.doesNotMatch(projectDiagramRule, /min-width:/);
  assert.match(projectDiagramRule, /width:\s*100%/);
  assert.match(projectsSource, /console-flow-row/);
  assert.match(projectsSource, /console-flow-node/);
});

test('project cards keep copy before diagrams on mobile', () => {
  assert.match(projectsComponent, /project-copy order-1 md:order-none/);
  assert.match(projectsComponent, /project-visual min-w-0 order-2 md:order-none/);
});

test('stack includes PHP and Laravel with updated counts', () => {
  assert.match(stackSource, /primary:\s*\['Java', 'TypeScript', 'PHP'\]/);
  assert.match(stackSource, /primary:\s*\['Spring Boot', 'NestJS', 'Laravel'\]/);
  assert.match(stackSource, /key: 'languages'[\s\S]*count: '7'/);
  assert.match(stackSource, /key: 'backend'[\s\S]*count: '9'/);
});
