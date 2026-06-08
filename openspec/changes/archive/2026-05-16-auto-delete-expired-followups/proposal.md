## Why

Expired follow-ups currently remain visible until the user manually deletes them, which creates stale dashboard data and can make the active-limit state harder to reason about. The dashboard should clean up expired records automatically when it loads so the user sees an accurate list.

## What Changes

- Add automatic cleanup when follow-ups are fetched for the dashboard.
- Detect follow-ups whose `expirationDate` is earlier than the current query time.
- Delete expired follow-ups from local storage before rendering the dashboard list.
- Track the names of deleted follow-ups in UI state for the current dashboard session.
- Show an alert between the stats section and follow-up list with the number of expired follow-ups removed and a list of their names.
- Keep non-expired follow-ups visible and preserve existing manual edit/delete behavior.

## Capabilities

### New Capabilities
- `expired-followup-cleanup`: Covers automatic removal of expired follow-ups during dashboard loading and user-facing notification of removed records.

### Modified Capabilities
- None.

## Impact

- Affected code:
  - `src/features/follow-ups/application/follow-up.service.ts`
  - `src/features/follow-ups/hooks/use-follow-up.ts`
  - `src/features/follow-ups/infrastructure/follow-up.repository.ts`
  - `src/features/follow-ups/ui/follow-up-dashboard.tsx`
  - `src/features/follow-ups/ui/styles/follow-up-dashboard.css`
- No new runtime dependencies.
- No storage schema migration required; expired records are removed from existing `chrome.storage.local` data.
