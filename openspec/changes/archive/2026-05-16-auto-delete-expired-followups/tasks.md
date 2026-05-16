## 1. Cleanup Data Flow

- [x] 1.1 Add the expired follow-up validator to `src/features/follow-ups/domain/follow-up.validators.ts`, using a valid `expirationDate` earlier than a provided `now`.
- [x] 1.2 Add repository support to persist a full cleaned follow-up list in one storage write.
- [x] 1.3 Add an application service load function that reads follow-ups, filters expired records, persists the cleaned list when needed, and returns cleaned contacts plus removed follow-up names.
- [x] 1.4 Keep invalid expiration dates out of automatic deletion.

## 2. Dashboard Hook State

- [x] 2.1 Update `useFollowUp` to call the cleanup-aware load function for normal dashboard fetches.
- [x] 2.2 Extend `useFollowUp` result state with removed expired follow-up names from the latest fetch.
- [x] 2.3 Reset removed-name state to an empty list when `contactsOverride` is used or when no expired records are removed.
- [x] 2.4 Preserve existing loading, error, and `refetch` behavior.

## 3. Dashboard Alert UI

- [x] 3.1 Render an expired-cleanup alert in `FollowUpDashboard` between `FollowUpStats` and `FollowUpList`.
- [x] 3.2 Show the number of removed expired follow-ups in the alert.
- [x] 3.3 Show a list of removed follow-up names in the alert.
- [x] 3.4 Ensure dashboard stats, active-limit alert, and list rendering use the cleaned `data`.
- [x] 3.5 Add dashboard CSS for the cleanup alert consistent with existing alert styling.

## 4. Verification

- [x] 4.1 Verify dashboard load with no expired follow-ups does not show the cleanup alert.
- [x] 4.2 Verify dashboard load with one expired follow-up removes it from storage and shows its name in the alert.
- [x] 4.3 Verify dashboard load with multiple expired follow-ups shows the correct count and list of names.
- [x] 4.4 Verify follow-ups expiring today or in the future remain visible.
- [x] 4.5 Verify records with invalid `expirationDate` are not auto-deleted.
- [x] 4.6 Run the project build after implementation.
