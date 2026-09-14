# AI Agent Instructions

## Project Hygiene

Please follow these rules when working in this repository:

### Never modify or inspect generated/dependency folders unless explicitly required

Ignore these folders by default:

- `node_modules/`
- `bin/`
- `obj/`
- `.vs/`
- `.vscode/` — do not modify workspace settings unless explicitly requested
- `dist/`
- `build/`
- `coverage/`
- `out/`
- `publish/`
- `TestResults/`

Also ignore generated/cache files such as:

- `*.vsidx`
- `*.user`
- `*.suo`
- `*.cache`
- `*.log`

### Source code only

When searching, analyzing, refactoring, or making changes:

1. Prefer actual source code and configuration files.
2. Do not edit generated files.
3. Do not edit dependency files inside `node_modules`.
4. Do not manually modify files under `bin` or `obj`.
5. If a generated file needs to change, modify its source/configuration instead.
6. Avoid committing generated artifacts or local IDE files.

### Git hygiene

Before suggesting or running Git commands:

- Do not include `node_modules`, `bin`, `obj`, `.vs`, `dist`, `build`, coverage, or other generated folders.
- Check `.gitignore` when relevant.
- Never force-add ignored/generated files unless explicitly instructed by the user.
- If Git reports a generated/IDE file such as `.vs/*.vsidx`, do not try to work around the error by adding it. Fix the Git ignore/tracking issue instead.

### Search hygiene

When using repository-wide search:

- Exclude `node_modules`, `bin`, `obj`, `.vs`, `dist`, `build`, coverage, and other generated directories.
- Focus on project source directories such as `src`, `app`, `components`, `Controllers`, `Services`, etc.
- Do not waste time analyzing minified bundles or dependency source unless explicitly needed.

### Safety rule

If you are unsure whether a file is generated or source-controlled, inspect its context first rather than modifying it blindly.

## General Agent Behavior

- Keep changes focused on the requested task.
- Do not introduce unrelated refactors.
- Reuse existing project patterns and conventions.
- Before creating a new abstraction, check whether an existing one can be reused.
- Do not change dependencies or package versions unless the task requires it.
- Do not delete files or code unless necessary and justified.
- After changes, verify the affected project builds/tests when practical.
