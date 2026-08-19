'use strict';

// agile command-file frontmatter parser.
//
// Pulled out of agile.mjs so the plugin module's only top-level export is
// the plugin function itself. OpenCode's legacy plugin loader treats every
// function exported from a plugin module as a plugin.

function parseCommandFile(filePath) {
  const fs = require('fs');
  const content = fs.readFileSync(filePath, 'utf8');
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return null;
  const description = match[1].match(/description:\s*(.+)/)?.[1]?.trim();
  return { description, template: match[2].trim() };
}

module.exports = { parseCommandFile };
