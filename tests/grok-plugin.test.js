#!/usr/bin/env node
// Grok Build loads agile through its native skill system. Lifecycle-hook
// stdout is passive in Grok, so this adapter must not register any hooks.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

test('Grok manifest is a skill-only adapter with no lifecycle hooks', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'plugin.json'), 'utf8'));
  assert.equal(manifest.name, 'agile');
  assert.equal(manifest.hooks, undefined);
  assert.equal(manifest.mcpServers, undefined);
  assert.ok(!fs.existsSync(path.join(root, 'hooks', 'hooks.json')));
  assert.ok(!fs.existsSync(path.join(root, '.grok-plugin', 'hooks.json')));
});

test('Grok marketplace lists agile at the repo root', () => {
  const marketplace = JSON.parse(
    fs.readFileSync(path.join(root, '.grok-plugin', 'marketplace.json'), 'utf8'));
  assert.equal(marketplace.name, 'agile');
  const plugin = marketplace.plugins.find((p) => p.name === 'agile');
  assert.ok(plugin, 'marketplace must list plugin agile');
  assert.equal(plugin.source, './');
});

test('Agile skill describes every coding task for Grok auto-invocation', () => {
  const skill = fs.readFileSync(path.join(root, 'skills', 'agile', 'SKILL.md'), 'utf8');
  assert.match(skill, /Use on ANY\s+coding task/i);
  assert.doesNotMatch(skill, /disable-model-invocation:\s*true/i);
});
