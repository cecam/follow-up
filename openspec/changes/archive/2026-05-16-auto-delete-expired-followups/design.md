## Context

The dashboard currently loads follow-ups through `useFollowUp`, which calls `getAllFollowUps` in the application service and renders the returned list through `FollowUpDashboard`. Expired records are still stored and shown until a user manually deletes them, even though the domain already treats expired follow-ups as inactive for active-limit logic.

The cleanup must happen when the dashboard obtains follow-ups, because that is the point where the user expects the list, stats, and alerts to reflect the current date.

## Goals / Non-Goals

**Goals:**
- Remove expired follow-ups automatically during dashboard data loading.
- Persist the cleaned list back to local storage.
- Return the names of removed follow-ups to the dashboard load hook.
- Show a dismissible or persistent session alert between stats and the follow-up list with the removal count and names.
- Keep dashboard stats, active-limit alert, and list rendering based on the cleaned data.

**Non-Goals:**
- Add a background scheduled cleanup job.
- Add new storage fields or a migration.
- Delete follow-ups during edit/create flows unless those flows explicitly reload dashboard data.
- Change the definition of expiration or active follow-up counting.

## Decisions

1. **Perform cleanup in the application service when loading dashboard data.**
   - Use a new application-level function such as `getDashboardFollowUps` or `getAllFollowUpsWithExpiredCleanup`.
   - Rationale: the service can coordinate read, expiration evaluation, write-back, and return metadata without leaking storage details into the UI.
   - Alternative considered: perform cleanup directly in `FollowUpDashboard`; rejected because UI would need repository/delete orchestration and would duplicate domain logic.

2. **Use one storage write with the filtered list instead of deleting records one by one.**
   - Add or reuse repository support for replacing the follow-up list after filtering.
   - Rationale: a single write avoids repeated reads/writes and preserves ordering of non-expired follow-ups.
   - Alternative considered: call `deleteFollowUpRepository` for every expired record; rejected because it performs multiple storage updates and is easier to race.

3. **Compare `expirationDate` against a single captured `now` value per load.**
   - Add the expiration predicate to `src/features/follow-ups/domain/follow-up.validators.ts` alongside the existing follow-up validation helpers.
   - Rationale: every record in one dashboard fetch should be evaluated against the same timestamp.
   - Expired means `expirationDate` is a valid date and is earlier than the captured current time.
   - Invalid expiration dates should not be auto-deleted in this change; they should remain visible for existing validation/edit handling.

4. **Expose cleanup metadata from `useFollowUp`.**
   - Extend the hook result with an `expiredFollowUpsRemoved` array of names from the most recent non-override fetch.
   - Rationale: the dashboard should not recompute deleted items because they no longer exist in returned data.
   - When `contactsOverride` is provided, the hook should set cleanup metadata to an empty array because no storage cleanup is being performed.

5. **Render the cleanup alert between stats and list.**
   - The alert should use existing dashboard alert styling conventions and show:
     - the number of removed follow-ups
     - a list of deleted follow-up names
   - It should not replace the active-limit alert. If both alerts are present, the expired-cleanup alert appears before the active-limit alert because it explains why the visible list changed.

## Risks / Trade-offs

- Expired follow-ups are permanently removed on dashboard load -> Mitigation: show the names immediately in the cleanup alert so the user understands what changed.
- Cleanup write could fail after reading records -> Mitigation: surface the existing dashboard load error state and avoid showing a partial success alert.
- Invalid dates could be accidentally deleted if treated as expired -> Mitigation: only delete records with valid expiration timestamps earlier than `now`.
- Multiple dashboard reloads should not repeat the same alert -> Mitigation: after storage is cleaned, later fetches return no deleted names.
