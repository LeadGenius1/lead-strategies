# Claude AI - Complete Capabilities Reference
**Version:** 2.0 (February 2026)  
**Purpose:** Permanent reference for Cursor IDE integration and project database

---

## 📊 TABLE OF CONTENTS

1. [Model Family Overview](#model-family-overview)
2. [Core Capabilities](#core-capabilities)
3. [Best Practices](#best-practices-quick-reference-for-task-accuracy)
4. [Limitations](#limitations)
5. [Additional Resources](#additional-resources)

*Full reference with Tool Use, Artifacts, Extended Thinking, API features: see original at `Downloads/CLAUDE-CAPABILITIES.md`*

---

## 🤖 MODEL FAMILY OVERVIEW

### Current Models (February 2026)

#### Claude Opus 4.6 (Latest - Frontier Intelligence)
- **Released:** January 2026
- **Specialty:** World's best coding, enterprise agents, professional work
- **Benchmarks:**
  - 88.8% MMLU (PhD-level reasoning)
  - 80.9% GPQA Diamond (scientific reasoning)
  - 90% AIME 2025 with tool use (mathematics)
  - 81.4% TAU-bench (agentic workflows)
- **Context:** 200K tokens (1M with beta header)
- **Pricing:** $15 input / $75 output per million tokens
- **Best For:** Mission-critical analysis, complex multi-step tasks, production agents

#### Claude Sonnet 4.5 (Balanced Excellence)
- **Released:** September 2025
- **Specialty:** Industry-leading coding (77.2% SWE-bench), balanced performance
- **Features:**
  - Hybrid reasoning modes (instant or deep)
  - 61.4% OSWorld (Computer Use)
  - Superior instruction following
- **Context:** 200K tokens (1M with beta header)
- **Pricing:** $3 input / $15 output per million tokens
- **Best For:** Production development, professional content, everyday agents

#### Claude Haiku 4.5 (Speed + Intelligence)
- **Released:** October 2025
- **Specialty:** Fastest Claude ever (2x Sonnet 4 speed)
- **Features:**
  - Near-frontier intelligence at 1/3 cost
  - First Haiku with extended thinking
  - 73.3% SWE-bench
- **Context:** 200K tokens
- **Pricing:** $1 input / $5 output per million tokens
- **Best For:** High-volume deployments, real-time applications, cost-sensitive workloads

#### Claude Opus 4.1 (Precision Specialist)
- **Released:** August 2025
- **Specialty:** Maximum intelligence for specialized tasks
- **Features:**
  - Conservative, precise edits (minimal collateral changes)
  - Enhanced extended thinking
  - Sustained reasoning capabilities
- **Context:** 200K tokens
- **Pricing:** $15 input / $75 output per million tokens
- **Best For:** Research synthesis, high-stakes decisions, complex analysis

---

## 🎯 CORE CAPABILITIES

### 1. Natural Language Understanding
- **Multilingual Support:** 100+ languages
- **Nuanced Context:** Understands subtext, tone, intent
- **Complex Instructions:** Multi-step task comprehension
- **Domain Expertise:** Technical, creative, analytical content

### 2. Code Generation & Analysis
- **Languages:** Python, JavaScript, TypeScript, Java, C++, Go, Rust, Ruby, PHP, Swift, Kotlin, and more
- **Capabilities:**
  - Complete application scaffolding
  - Refactoring across large codebases
  - Bug detection and fixing
  - Test generation
  - Documentation creation
  - Code review and optimization
  - Migration assistance
- **Advanced:** Long-context code analysis (200K-1M tokens)

### 3. Writing & Content Creation
- **Styles:** Technical docs, creative writing, marketing copy, academic papers
- **Formats:** Reports, emails, articles, scripts, documentation
- **Quality:** Human-level prose with natural flow
- **Editing:** Grammar correction, style improvement, restructuring

### 4. Analysis & Reasoning
- **Data Analysis:** Extract insights from documents, spreadsheets, logs
- **Research:** Multi-source synthesis, fact-checking, literature review
- **Problem Solving:** Step-by-step logical reasoning
- **Decision Support:** Pros/cons analysis, risk assessment

### 5. Vision Capabilities
- **Input Types:** Images, charts, graphs, diagrams, screenshots, PDFs
- **Tasks:**
  - Image description and analysis
  - OCR (text extraction from images)
  - Chart/graph interpretation
  - Technical diagram understanding
  - UI/UX analysis
  - Document processing
- **Limitations:** NO image generation (analysis only)

---

## Best Practices (Quick Reference for Task Accuracy)

### Prompt Engineering

#### 1. Clear Instructions
```
Good: "Write a Python function that calculates Fibonacci numbers using memoization"
Bad: "Help with Fibonacci"
```

#### 2. Provide Context
```
"I'm building a React app for expense tracking.
I need a component that displays monthly spending by category.
Use Chart.js for visualization.
Follow our style guide: Material Design with blue theme (#0066CC)."
```

#### 3. Use Examples
```
"Format the output like this:
Input: user profile data
Output: {
  'name': 'John Doe',
  'email': 'john@example.com',
  'role': 'admin'
}"
```

#### 4. Request Structure
```
"Create a detailed project plan with:
1. Timeline (Gantt chart)
2. Resource allocation
3. Risk assessment
4. Budget breakdown

Use markdown tables for clarity."
```

#### 5. XML Tags (for complex data)
```
<document>
{{large document content}}
</document>

<instructions>
Summarize the key findings from the document above.
Focus on financial metrics and risks.
</instructions>
```

### Code Generation - Specify Requirements
```
"Create a REST API endpoint that:
- Accepts POST requests with JSON
- Validates input using Joi
- Stores data in PostgreSQL
- Returns 201 with created resource
- Handles errors with proper status codes
- Includes unit tests"
```

### Analysis - Structured Output
```
"Analyze this data and provide:

**Summary:** Key findings in 2-3 sentences
**Insights:** 5 actionable insights
**Recommendations:** Prioritized action items
**Risks:** Potential concerns
**Next Steps:** Specific tasks with owners"
```

---

## ⚠️ LIMITATIONS

- **Image Generation:** No (analysis only)
- **Real-time Web Browsing:** Uses web search tool
- **Knowledge Cutoff:** January 2025 (use web search for current events)
- **Token Limits:** 200K–1M context, 4096 output default

---

## 📚 ADDITIONAL RESOURCES

- **API Docs:** https://docs.anthropic.com
- **Claude.ai Help:** https://support.claude.com
- **Platform:** https://claude.ai

---

*Reference this doc when building complex tasks with Claude. Use @docs/CLAUDE-CAPABILITIES.md in Cursor or paste relevant sections into Claude for higher-accuracy prompts.*
