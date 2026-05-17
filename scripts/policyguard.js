#!/usr/bin/env node
// policyguard.js — enforces rules from policyguard.yml
// Reads config and checks source files for forbidden patterns

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const CONFIG_PATH = path.join(ROOT, "policyguard.yml");

function parseSimpleYml(text) {
  // Minimal YAML parser sufficient for policyguard.yml structure
  // Returns the forbidden_patterns and applies_to.paths
  const rules = [];
  let currentRule = null;
  let inPaths = false;
  let inForbidden = false;
  let inAllowed = false;

  for (const raw of text.split("\n")) {
    const line = raw.trimEnd();
    if (line.match(/^\s*- id:/)) {
      if (currentRule) rules.push(currentRule);
      currentRule = { id: line.split("id:")[1].trim(), paths: [], forbidden: [], allowed: [] };
      inPaths = false; inForbidden = false; inAllowed = false;
    } else if (currentRule && line.match(/^\s+applies_to:/)) {
      // nothing
    } else if (currentRule && line.match(/^\s+paths:/)) {
      inPaths = true; inForbidden = false; inAllowed = false;
    } else if (currentRule && line.match(/^\s+forbidden_patterns:/)) {
      inForbidden = true; inPaths = false; inAllowed = false;
    } else if (currentRule && line.match(/^\s+allowed_paths:/)) {
      inAllowed = true; inPaths = false; inForbidden = false;
    } else if (currentRule && line.match(/^\s+severity:|^\s+message:|^\s+fix_hint:/)) {
      inPaths = false; inForbidden = false; inAllowed = false;
    } else if (currentRule && line.match(/^\s*- /)) {
      const val = line.replace(/^\s*- /, "").replace(/^["']|["']$/g, "").trim();
      if (inPaths) currentRule.paths.push(val);
      else if (inForbidden) currentRule.forbidden.push(val);
      else if (inAllowed) currentRule.allowed.push(val);
    }
  }
  if (currentRule) rules.push(currentRule);
  return rules;
}

function globToRegex(pattern) {
  const escaped = pattern
    .replace(/\./g, "\\.")
    .replace(/\*\*/g, "DOUBLESTAR")
    .replace(/\*/g, "[^/]*")
    .replace(/DOUBLESTAR/g, ".*");
  return new RegExp(escaped.replace(/\//g, "[\\\\/]"));
}

function checkRule(rule) {
  let violations = 0;
  const pathRegexes = rule.paths.map(globToRegex);
  const allowedRegexes = rule.allowed.map(globToRegex);

  // Use git ls-files to enumerate tracked files
  let files;
  try {
    files = execSync("git ls-files src/", { cwd: ROOT, encoding: "utf8" })
      .split("\n")
      .filter(Boolean);
  } catch {
    files = [];
  }

  for (const file of files) {
    const matchesPaths = pathRegexes.some((re) => re.test(file));
    if (!matchesPaths) continue;

    const matchesAllowed = allowedRegexes.some((re) => re.test(file));
    if (matchesAllowed) continue;

    const fullPath = path.join(ROOT, file);
    if (!fs.existsSync(fullPath)) continue;

    const content = fs.readFileSync(fullPath, "utf8");
    for (const pattern of rule.forbidden) {
      if (content.includes(pattern)) {
        console.error(`[POLICYGUARD] VIOLATION — rule: ${rule.id}`);
        console.error(`  File: ${file}`);
        console.error(`  Forbidden pattern: ${pattern}`);
        violations++;
      }
    }
  }
  return violations;
}

function main() {
  if (!fs.existsSync(CONFIG_PATH)) {
    console.log("[POLICYGUARD] No policyguard.yml found — skipping");
    process.exit(0);
  }

  const yml = fs.readFileSync(CONFIG_PATH, "utf8");
  const rules = parseSimpleYml(yml);

  let total = 0;
  for (const rule of rules) {
    const n = checkRule(rule);
    total += n;
  }

  if (total === 0) {
    console.log(`[POLICYGUARD] PASS — ${rules.length} rules checked, 0 violations`);
    process.exit(0);
  } else {
    console.error(`[POLICYGUARD] FAIL — ${total} violation(s) found`);
    process.exit(1);
  }
}

main();
