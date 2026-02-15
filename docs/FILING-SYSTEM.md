# Master Database Filing System

## Overview
Canonical project structure for AI Lead Strategies Platform. 11 files total.

## File Inventory (11)

| # | Path | Purpose |
|---|------|---------|
| 1 | PROJECT-MANIFEST.json | Full project manifest |
| 2 | .ai-tools-config.json | AI tools configuration |
| 3 | .cursor/rules/source-of-truth.mdc | Source-of-truth rule |
| 4 | .cursor/rules/tool-capabilities-reference.mdc | Tool reference |
| 5 | .cursor/workspace.json | Workspace config |
| 6 | scripts/verify-source-of-truth.js | SOT verification |
| 7 | scripts/verify-deployment.js | Deployment check |
| 8 | scripts/cleanup-duplicates.js | Duplicate check |
| 9 | docs/FILING-SYSTEM.md | This file |
| 10 | docs/QUICK-REFERENCE.md | Quick reference |
| 11 | docs/CLAUDE-CAPABILITIES.md | Claude reference |

## Usage
- Run: .\setup-filing-system.ps1
- Verify: npm run verify
- Cleanup check: npm run cleanup:check
