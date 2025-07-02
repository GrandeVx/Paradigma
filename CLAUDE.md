# Global Development Principles

## FUNDAMENTAL RULE: VERIFY EVERYTHING, ASSUME NOTHING

Before taking ANY action in ANY language or framework:
- **VERIFY** the actual state of the codebase - read it, don't assume it
- **CHECK** that files, functions, modules, and dependencies actually exist
- **READ** the source code to understand actual implementations
- **CONFIRM** exports, imports, and APIs match what you're trying to use
- **TEST** your understanding with small verification steps

## Core Principles

### 1. Source of Truth is the Code
- Always check the source documentation and repo before installing dependencies
- The codebase is the only truth - not your memory, not common patterns, not "standard" practices
- Read actual function signatures, type definitions, and implementations
- Verify module exports before importing (whether it's Python, JavaScript, Rust, Go, etc.)
- Check that build commands and scripts exist before running them

### 2. Think Before Acting
- When faced with an error, consider whether the cause of the error is actually the problem before blindly resolving it
- Analyze root causes, not symptoms
- Understand WHY something doesn't work before changing it
- Every fix should be intentional and well-understood

### 3. Maintain Code Integrity
- Prioritize keeping the codebase clean and consistent
- Always aim to keep naming, access conventions, initialization methods, etc., all consistent
- Keep the codebase homogenous - follow existing patterns
- Match the style and conventions already present in each project
- Never introduce inconsistencies for convenience

### 4. Professional Development Practices
- DO NOT COMMIT AND PUSH WITHOUT MY EXPRESS INSTRUCTIONS
- WE ONLY COMMIT VERIFIED, TESTED, WORKING CODE
- DO NOT RUN MY PROJECTS WITHOUT MY EXPRESS INSTRUCTION
- Never use temp directories, or temporary working copies
- We fix things in place and rely on git history if we need to refer to old implementations
- No hacky workarounds, no "temporary" fixes that become permanent

### 5. Safety and Security
- Never do `killall node` or similar broad process termination commands
- Be extremely careful with destructive operations
- Always verify command effects before execution
- Consider security implications of all changes
- Never expose secrets, keys, or sensitive data

### 6. Language-Agnostic Verification Steps
Before using ANY code construct:
1. **File Operations**: Verify paths exist (`ls`, `dir`, `os.path.exists`, etc.)
2. **Imports/Includes**: Check the module/package is installed and exports what you need
3. **Function Calls**: Verify the function exists and understand its signature
4. **Type Usage**: Confirm types/classes/interfaces are defined and accessible
5. **Build Commands**: Check build scripts exist and understand what they do
6. **Dependencies**: Verify packages are in package.json/requirements.txt/Cargo.toml/go.mod/etc.

### 7. Universal Best Practices
- No `any` types, `void*`, or bypassing type systems
- No suppressing warnings or errors without fixing root causes
- No commenting out code to "fix" problems
- Always handle errors properly for the language/framework
- Follow security best practices for each platform
- Respect the idioms of each language while maintaining consistency

## Remember
Every language has its package manager, type system, and conventions, but the principle remains:
**NEVER ASSUME - ALWAYS VERIFY**

Whether it's `npm`, `pip`, `cargo`, `go get`, `gem`, `composer`, `gradle`, or any other tool - check first, act second.
