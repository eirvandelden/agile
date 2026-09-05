#!/usr/bin/env node
// GOAL.md, SKILL.md, and AGENTS.md are three renderings of one ruleset.
// SKILL.md and AGENTS.md are what hosts load; they, and the per-turn reminder
// in hooks/agile-core.js, must also name the off phrases.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

const RULE_COPIES = [
  'GOAL.md',
  'skills/agile/SKILL.md',
  'AGENTS.md',
];

const RULE_INVARIANTS = [
  'conversation, not a ticket',
  'just do it',
  'rule of three',
  'Never fake green',
  'No metaphors',
];

const OFF_PHRASES = [
  'stop agile',
  'normal mode',
  '/agile off',
];

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\s+/g, ' ');
}

test('GOAL.md, SKILL.md, and AGENTS.md still carry the load-bearing rules', () => {
  for (const rel of RULE_COPIES) {
    const text = read(rel);
    for (const phrase of RULE_INVARIANTS) {
      assert.ok(text.includes(phrase), `${rel} is missing rule invariant: "${phrase}"`);
    }
  }
});

test('SKILL.md, AGENTS.md, and the per-turn reminder name every phrase that turns agile off', () => {
  for (const rel of ['skills/agile/SKILL.md', 'AGENTS.md', 'hooks/agile-core.js']) {
    const text = read(rel);
    for (const phrase of OFF_PHRASES) {
      assert.ok(text.includes(phrase), `${rel} is missing off phrase: "${phrase}"`);
    }
  }
});
