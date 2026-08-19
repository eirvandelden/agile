#!/usr/bin/env node
// The npm package is how OpenCode loads agile without a checkout.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));

test('package name is @hubertlepicki/agile', () => {
  assert.equal(pkg.name, '@hubertlepicki/agile');
});

test('package main and exports point at the OpenCode plugin', () => {
  assert.equal(pkg.main, './.opencode/plugins/agile.mjs');
  assert.equal(pkg.exports['.'], './.opencode/plugins/agile.mjs');
  assert.equal(pkg.exports['./plugin'], './.opencode/plugins/agile.mjs');
});

test('package files include the ruleset, hooks, and OpenCode adapter', () => {
  for (const needed of ['AGENTS.md', 'hooks/', 'skills/', '.opencode/']) {
    assert.ok(pkg.files.includes(needed), 'files must include ' + needed);
  }
});
