# softhouse-finance - Agent Instructions

<!-- POLICYGUARD:MANAGED_START -->
## Project

Name: softhouse-finance

## Objective

Use Agent Policy Guard to keep AI agent changes aligned with project policies.

## Critical Rules

- [high] no-direct-supabase-in-ui: Pages e components não devem chamar Supabase diretamente.

## Expected Architecture

- Keep agent-specific integrations in adapter packages.
- Keep reusable policy loading, scanning, and reporting in packages/core.
- Do not mix CLI, editor, or agent integration concerns into core.

## Validation Commands

Run these commands after relevant changes:

```bash
npm run build
npm run test
```

## Baseline vs New Errors

Always separate existing baseline errors from errors introduced by the current change.
<!-- POLICYGUARD:MANAGED_END -->

<!-- POLICYGUARD:MANUAL_START -->
Add project-specific manual instructions here. This section is preserved by Policy Guard.
<!-- POLICYGUARD:MANUAL_END -->
