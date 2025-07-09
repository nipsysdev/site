---
applyTo: "**"
---

# AI Documentation Guidelines

## ⚠️ STOP - READ THIS FIRST

**BEFORE doing ANYTHING else, you MUST follow this workflow:**

### Required Workflow

1. **First, check for `.ai` directory documentation**
   ```bash
   # Search .ai docs for relevant keywords
   grep -r "relevant_keywords" .ai/
   ```

2. **Read applicable documentation in this order:**
   - `.ai/README.md` - Project overview and quick start
   - `.ai/ARCHITECTURE.md` - Key components and architecture 
   - `.ai/DEVELOPMENT.md` - Setup and coding conventions
   - `.ai/COMMANDS.md` - Command system documentation (if working with commands)

3. **Acknowledge understanding by stating:**
   - "After reading .ai/[FILE].md, I understand that..."
   - Reference specific patterns or conventions you'll follow

4. **THEN proceed with your task**

## Purpose

The `.ai` directory contains comprehensive documentation to help AI agents quickly understand and continue development on the project. It serves as a knowledge base for the project's architecture, features, and development process.

## Usage Guidelines

1. **ALWAYS consult the `.ai` documentation when starting work on the project**
2. Use the documentation to understand the project structure and conventions
3. Reference specific patterns from the docs in your implementation
4. When in doubt, search the `.ai` files for guidance

## Maintenance

1. Update the documentation when making significant changes to the project
2. Keep the documentation accurate and up-to-date
3. Add new sections when introducing major features or architectural changes
4. Remove outdated information promptly

## Decision Making

1. Use the documentation as a reference when making architectural decisions
2. Follow established patterns and conventions documented in `.ai`
3. Consider the impact of changes on documented components and features
4. Update documentation to reflect any approved changes
