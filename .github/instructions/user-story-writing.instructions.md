---
applyTo: '**'
---
# User Story Writing Instructions

## Purpose
This guide provides a comprehensive template and checklist for writing high-quality user stories for this project. Follow these steps to ensure every user story is actionable, testable, and aligned with our code quality and feature standards.

---

## 1. Title
- Write a clear, concise title that summarizes the feature or change.

## 2. User Story Format
- Use the standard format:
  - **As a** [user role]
  - **I want** [feature or capability]
  - **So that** [goal or benefit]

## 3. Description
- Provide context and background for the story.
- Reference related features, user needs, or business goals.

## 4. Acceptance Criteria
- List clear, testable conditions that must be met for the story to be considered complete.
- Use bullet points or a checklist.
- Cover UI/UX, functionality, error handling, accessibility, and performance.

## 5. Code Quality Requirements
- All code must follow project coding standards (see coding.instructions.md).
- Use TypeScript strict mode and proper types.
- Ensure code is modular, maintainable, and well-documented.
- Follow SOLID and functional programming principles.
- Include JSDoc for public functions and interfaces.

## 6. Feature Requirements
- Describe the feature in detail, including UI, logic, and data flow.
- Specify any new components, hooks, or utilities needed.
- Reference design tokens, assets, or style guides if applicable.
- Note any dependencies or integration points.

## 7. Use Cases & Scenarios
- List primary and edge use cases.
- Include user flows, error scenarios, and accessibility needs.
- Consider multi-device and multi-user scenarios if relevant.

## 8. Test Cases
- Define unit, integration, and E2E test cases.
- Cover all acceptance criteria and edge cases.
- Include accessibility and performance tests.
- Reference the testing.instructions.md for standards.

## 9. Documentation
- Update or create relevant documentation (README, user guides, changelogs).
- Document new APIs, components, or configuration options.

## 10. Example User Story Template

```
# User Story: [Short Title]

## Title
[Short, descriptive title]

## As a
[User role]

## I want
[Feature or capability]

## So that
[Goal or benefit]

## Description
[Background, context, and rationale]

## Acceptance Criteria
- [Criterion 1]
- [Criterion 2]
- ...

## Code Quality Requirements
- [Requirement 1]
- [Requirement 2]
- ...

## Feature Requirements
- [Feature detail 1]
- [Feature detail 2]
- ...

## Use Cases & Scenarios
- [Use case 1]
- [Use case 2]
- ...

## Test Cases
- [Test case 1]
- [Test case 2]
- ...

## Documentation
- [Doc update 1]
- [Doc update 2]
- ...
```

---

## 11. Review Checklist
- [ ] Title and user story format are clear
- [ ] Acceptance criteria are testable
- [ ] Code quality and feature requirements are explicit
- [ ] Use cases and test cases are comprehensive
- [ ] Documentation needs are identified
- [ ] Accessibility and performance are considered

---

**Reference:** See coding, testing, and workflow instructions in `.github/instructions/` for more details and standards.
