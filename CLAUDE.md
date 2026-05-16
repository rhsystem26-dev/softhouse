# softhouse-finance - Claude Context

<!-- POLICYGUARD:MANAGED_START -->
## Project Memory

Project: softhouse-finance

## Claude Context

Use this file as the project-specific operating context when working with Claude.

## Work Rules

- [high] no-direct-supabase-in-ui: Pages e components não devem chamar Supabase diretamente.

## Expected Architecture

- Keep reusable policy behavior in packages/core.
- Keep Claude-specific behavior in packages/claude-adapter.
- Keep generated instructions synchronized with policyguard.yml.

## Security

Follow policy severity actions. Critical rules block, high rules require approval, medium rules warn, and low rules inform.

## Validation

Run these commands after relevant changes:

```bash
npm run build
npm run test
```

Separate existing baseline errors from new errors introduced by the current change.
<!-- POLICYGUARD:MANAGED_END -->

<!-- POLICYGUARD:MANUAL_START -->
Add Claude-specific manual memory here. This section is preserved by Policy Guard.
<!-- POLICYGUARD:MANUAL_END -->
