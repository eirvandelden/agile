#!/usr/bin/env node
// Every host manifest that declares a version must share one pinned X.Y.Z.
// A Codex cache-buster suffix is a local-dev stamp, not the product version.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const PINNED_SEMVER = /^\d+\.\d+\.\d+$/;
const VERSIONED_MANIFESTS = [
  'package.json',
  'plugin.json',
  '.claude-plugin/plugin.json',
  '.codex-plugin/plugin.json',
  'gemini-extension.json',
];

function readVersion(rel) {
  const raw = fs.readFileSync(path.join(root, rel), 'utf8').replace(/^\uFEFF/, '');
  return JSON.parse(raw).version;
}

test('every versioned manifest is pinned X.Y.Z and they all match', () => {
  const versions = VERSIONED_MANIFESTS.map((rel) => {
    const version = readVersion(rel);
    assert.match(String(version), PINNED_SEMVER, `${rel} version must be pinned X.Y.Z, got ${JSON.stringify(version)}`);
    return [rel, version];
  });
  const sharedVersion = versions[0][1];
  for (const [rel, version] of versions) {
    assert.equal(version, sharedVersion, `${rel} version ${version} must match ${sharedVersion}`);
  }
});
