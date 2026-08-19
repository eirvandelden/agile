#!/usr/bin/env node
// Gemini CLI / Antigravity load a thin manifest that points at AGENTS.md.
// Claude/Codex hook events must not sit at hooks/hooks.json or Gemini
// auto-discovers them.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const MANIFEST = 'gemini-extension.json';
const PINNED_SEMVER = /^\d+\.\d+\.\d+$/;
const RULE_INVARIANTS = [
  'conversation, not a ticket',
  'just do it',
  'rule of three',
  'Never fake green',
  'No metaphors',
];

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}

function loadManifest() {
  assert.ok(fs.existsSync(path.join(root, MANIFEST)), `${MANIFEST} must exist`);
  return JSON.parse(read(MANIFEST));
}

test('manifest names the agile extension with a pinned version', () => {
  const manifest = loadManifest();
  assert.equal(manifest.name, 'agile');
  assert.match(manifest.version, PINNED_SEMVER);
});

test('contextFileName resolves to a file carrying the agile rules', () => {
  const manifest = loadManifest();
  assert.equal(manifest.contextFileName, 'AGENTS.md');
  const context = read(manifest.contextFileName).replace(/\s+/g, ' ');
  for (const phrase of RULE_INVARIANTS) {
    assert.ok(context.includes(phrase), `context file missing rule invariant: "${phrase}"`);
  }
});

test('the skill the adapter reuses is present', () => {
  assert.ok(fs.existsSync(path.join(root, 'skills', 'agile', 'SKILL.md')));
});

test('Gemini cannot auto-discover Claude/Codex hook events', () => {
  assert.equal(
    fs.existsSync(path.join(root, 'hooks', 'hooks.json')),
    false,
    'hooks/hooks.json is auto-loaded by Gemini CLI; keep Claude/Codex hooks on manifest paths',
  );
});
