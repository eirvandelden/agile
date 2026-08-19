#!/usr/bin/env node
// Claude Code and Codex share one hook map. Commands must point at scripts
// that ship, run as plain `node` on POSIX, and keep a PowerShell twin so
// Windows can resolve either plugin root. The prompt hook must also exit
// if stdin never closes — on Windows a PowerShell wrapper can swallow the
// piped JSON and freeze the session.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const root = path.join(__dirname, '..');
const HOOKS_JSON = 'hooks/claude-codex-hooks.json';
const HOST_PLUGIN_MANIFESTS = [
  '.claude-plugin/plugin.json',
  '.codex-plugin/plugin.json',
];
const POSIX_GUARD_SYNTAX = /\bcommand\s+-v\b|&&|\|\||>\/dev\/null|2>&1/;
const HOOK_SCRIPT = /hooks[\\/]([\w.-]+\.(?:js|mjs|cjs|ps1|sh))/;

function commandHooks() {
  const config = JSON.parse(fs.readFileSync(path.join(root, HOOKS_JSON), 'utf8'));
  return Object.values(config.hooks)
    .flat()
    .flatMap((entry) => entry.hooks);
}

function scriptFrom(command) {
  const match = String(command).match(HOOK_SCRIPT);
  return match ? match[1] : null;
}

test('Claude and Codex manifests point at the shared host-specific hook config', () => {
  for (const rel of HOST_PLUGIN_MANIFESTS) {
    const manifest = JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
    assert.equal(manifest.hooks, `./${HOOKS_JSON}`, `${rel} must point at ${HOOKS_JSON}`);
  }
});

test('every hook command points at a script that ships in hooks/', () => {
  const hooks = commandHooks();
  assert.ok(hooks.length > 0, 'expected at least one hook command');
  for (const hook of hooks) {
    const script = scriptFrom(hook.command);
    assert.ok(script, `cannot find a hooks/ script in command: ${hook.command}`);
    assert.ok(
      fs.existsSync(path.join(root, 'hooks', script)),
      `command references a missing hook script: ${script}`,
    );
  }
});

test('shared hook commands invoke node directly and avoid bash-only exec', () => {
  const commands = commandHooks().map((h) => h.command).filter(Boolean);
  assert.ok(commands.length > 0, 'expected at least one shared command entry');
  for (const cmd of commands) {
    assert.match(cmd, /^node\s+/, `command must invoke node directly: ${cmd}`);
    assert.doesNotMatch(cmd, /(^|\s)exec\s/, `command must not use the bash-only exec builtin: ${cmd}`);
    assert.doesNotMatch(cmd, POSIX_GUARD_SYNTAX, `command uses POSIX-only guard syntax: ${cmd}`);
  }
});

test('each hook keeps a PowerShell commandWindows that launches the same script', () => {
  for (const hook of commandHooks()) {
    assert.equal(typeof hook.commandWindows, 'string', `hook must set commandWindows: ${hook.command}`);
    assert.notEqual(hook.commandWindows, '', `commandWindows must not be empty: ${hook.command}`);
    const posixScript = scriptFrom(hook.command);
    const windowsScript = scriptFrom(hook.commandWindows);
    assert.equal(
      windowsScript,
      posixScript,
      `commandWindows must launch the same script as command (${posixScript}): ${hook.commandWindows}`,
    );
  }
});

test('agile-prompt self-exits when stdin never closes (no freeze)', async () => {
  const hook = path.join(root, 'hooks', 'agile-prompt.js');
  const child = spawn(process.execPath, [hook], { stdio: ['pipe', 'ignore', 'ignore'] });

  const code = await new Promise((resolve, reject) => {
    const guard = setTimeout(() => {
      child.kill('SIGKILL');
      reject(new Error('hook hung on open stdin — it would freeze the session'));
    }, 3000);
    child.on('exit', (c) => { clearTimeout(guard); resolve(c); });
    child.on('error', reject);
  });

  assert.equal(code, 0, 'hook must exit cleanly when stdin never closes');
});
