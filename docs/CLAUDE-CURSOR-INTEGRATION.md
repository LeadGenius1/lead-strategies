# Claude + Cursor Integration

## Workflow
1. **Claude** (claude.ai): Architecture, planning, analysis, complex problem solving
2. **Cursor** (IDE): Implementation, multi-file editing, git, deployment

## Context Files for Claude
- PROJECT-MANIFEST.json
- .source-of-truth.json
- docs/CLAUDE-CAPABILITIES.md
- docs/FILING-SYSTEM.md

## Handoff
- Claude produces plans, specs, or PRDs
- Cursor implements with @ references to files
- Commit -> Push -> Railway verify
