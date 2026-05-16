## 1. Domain Limit Rules

- [x] 1.1 Add `FOLLOW_UP_ACTIVE_LIMIT = 10` to `src/features/follow-ups/domain/follow-up.constants.ts`.
- [x] 1.2 Add a shared active-limit alert message constant for dashboard, form, and create failures.
- [x] 1.3 Add a domain/application helper that counts active follow-ups as `pending` and not expired.
- [x] 1.4 Add focused tests or deterministic checks for active count with pending, completed, expired, and deleted follow-ups.

## 2. Creation Guard

- [x] 2.1 Update `createFollowUp` to load existing follow-ups before persisting a new one.
- [x] 2.2 Reject new creation with `ACTIVE_LIMIT_REACHED` when the active count is already 10.
- [x] 2.3 Map the active-limit failure through `useCreateFollowUp` so the UI can display the shared alert text.
- [x] 2.4 Confirm `updateFollowUp` and `deleteFollowUp` are not blocked by the active-limit rule.

## 3. Dashboard Alert

- [x] 3.1 Compute active follow-up count in `FollowUpDashboard` using the shared helper.
- [x] 3.2 Show the shared alert when the dashboard list has 10 active follow-ups.
- [x] 3.3 Keep the alert hidden when the dashboard list has fewer than 10 active follow-ups.
- [x] 3.4 Recalculate the alert state after `onFollowUpsChange` updates the list following deletion.

## 4. Creation Form Limit State

- [x] 4.1 Pass the current follow-up list or active-limit state from `App.tsx` into the creation form.
- [x] 4.2 Show the shared alert in `FollowUpForm` when creation mode opens at the active limit.
- [x] 4.3 Disable the primary create button in creation mode when the active limit is reached.
- [x] 4.4 Ensure edit mode can still save existing follow-ups even when the active limit is reached.
- [x] 4.5 Keep normal create-button behavior below the active limit, including existing validation and loading disables.

## 5. Verification

- [x] 5.1 Verify dashboard with 9 active follow-ups: no limit alert and creation remains available.
- [x] 5.2 Verify dashboard with 10 active follow-ups: limit alert appears.
- [x] 5.3 Verify creation form with 10 active follow-ups: same alert appears and create button is disabled.
- [x] 5.4 Verify direct creation call at 10 active follow-ups: no new record is persisted and the limit failure is returned.
- [x] 5.5 Verify deleting one active follow-up removes the alert and re-enables creation on the next form entry.
