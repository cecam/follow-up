## 1. Shared Architecture Foundation

- [x] 1.1 Create `src/shared/chrome/messaging.ts` or equivalent module for typed popup-background messaging helpers.
- [x] 1.2 Create `src/shared/chrome/storage.ts` or equivalent module that wraps `chrome.storage.local` with development-safe fallbacks.
- [x] 1.3 Create `src/shared/chrome/alarms.ts` and `src/shared/chrome/notifications.ts` wrappers for reminder-related Chrome APIs.
- [x] 1.4 Create `src/shared/types/messages.ts` with message constants and payload/response contracts for follow-up list, save, complete, and delete operations.
- [x] 1.5 Create `src/shared/types/runtime.ts` for shared runtime result/error types.
- [x] 1.6 Create `src/shared/utils/date.ts` and `src/shared/utils/id.ts` for expiration, remaining-days, date formatting, and ID generation.

## 2. Follow-Ups Domain

- [x] 2.1 Create `src/features/follow-ups/domain/follow-up.types.ts` with the canonical `FollowUp` data shape used by dashboard, form, repository, and messages.
- [x] 2.2 Create `src/features/follow-ups/domain/follow-up.ts` with factory/normalization helpers for follow-up entities.
- [x] 2.3 Create `src/features/follow-ups/domain/follow-up.validators.ts` for required fields, profile URL validation, notes length, status, platform, and expiration constraints.
- [x] 2.4 Replace local dashboard/form data-shape assumptions with imports or adapters that use the follow-up domain contract.

## 3. Follow-Ups Application and Infrastructure

- [x] 3.1 Create `src/features/follow-ups/infrastructure/follow-up.repository.ts` to list, upsert, complete, and delete follow-ups via shared storage wrappers.
- [x] 3.2 Create `src/features/follow-ups/application/list-follow-ups.ts` and move dashboard list loading/mocks behind this use case.
- [x] 3.3 Create `src/features/follow-ups/application/create-follow-up.ts` and move form payload validation, expiration calculation, remote save coordination, and repository upsert behind this use case.
- [x] 3.4 Create `src/features/follow-ups/application/complete-follow-up.ts` for future complete actions routed from dashboard cards.
- [x] 3.5 Create `src/features/follow-ups/application/delete-follow-up.ts` for delete actions routed from dashboard cards.
- [x] 3.6 Ensure application use cases return typed success/error results that popup UI can render without inspecting infrastructure details.

## 4. Background Runtime Routing

- [x] 4.1 Create `src/runtimes/background/index.ts` as the service worker entry that registers message and alarm listeners.
- [x] 4.2 Create `src/runtimes/background/message-router.ts` to handle shared follow-up messages and delegate to feature use cases or infrastructure adapters.
- [x] 4.3 Move existing follow-up list/save message handling out of `src/app/manifest/background.ts` into `message-router.ts`.
- [x] 4.4 Create `src/runtimes/background/alarm-router.ts` and route reminder alarm events toward the reminders feature boundary.
- [x] 4.5 Keep `src/app/manifest/` focused on manifest/config wiring, not runtime business behavior.

## 5. Popup Runtime Refactor

- [x] 5.1 Keep dashboard/form navigation in `src/runtimes/popup/App.tsx` or the current popup app entry, with local state for dashboard versus form.
- [x] 5.2 Update `Dashboard` so it receives follow-up data through `list-follow-ups` or a runtime hook that delegates to `list-follow-ups`.
- [x] 5.3 Update `useDashboard` so it no longer owns mocks, storage reads, message constants, or domain calculations directly.
- [x] 5.4 Update `FollowUpForm` so it delegates final validation and save behavior to `create-follow-up`.
- [x] 5.5 Ensure dashboard add/edit callbacks only coordinate popup navigation and selected follow-up state.
- [x] 5.6 Preserve the existing dashboard/form user flow, loading states, and save-error UI while changing module ownership.

## 6. Feature UI Extraction

- [x] 6.1 Create `src/features/follow-ups/ui/follow-up-form.tsx` or equivalent reusable form component driven by props and feature contracts.
- [x] 6.2 Create `src/features/follow-ups/ui/follow-up-list.tsx` or equivalent reusable list component driven by `FollowUp[]`.
- [x] 6.3 Keep popup-specific shell components such as headers, page wrappers, and navigation controls in `src/runtimes/popup/components/` or `pages/`.
- [x] 6.4 Remove duplicated date and expiration display logic from popup components in favor of shared utilities.

## 7. Profiles and Reminders Boundaries

- [x] 7.1 Create or align `src/features/profiles/domain/profile.types.ts` and `profile.ts` if dashboard/form follow-up data depends on detected profile context.
- [x] 7.2 Create or align `src/features/profiles/application/detect-current-profile.ts` and `infrastructure/profile-detectors.ts` as the source for platform/profile detection.
- [x] 7.3 Create or align `src/features/reminders/application/schedule-follow-up-reminder.ts` for reminder scheduling after follow-up creation.
- [x] 7.4 Create or align `src/features/reminders/application/handle-reminder-trigger.ts` and `infrastructure/reminder.service.ts` for alarm-triggered reminder handling.

## 8. Verification

- [x] 8.1 Verify the dashboard still loads and displays follow-ups through the new architecture boundary.
- [x] 8.2 Verify the add button opens the form in creation mode.
- [x] 8.3 Verify edit actions open the form with the selected follow-up data.
- [x] 8.4 Verify successful save returns to dashboard and displays the updated list.
- [x] 8.5 Verify failed save preserves form input and displays the existing user-facing error.
- [x] 8.6 Run the project’s relevant test, lint, or build command and document any unavailable verification.
- [x] 8.7 Run `openspec validate align-dashboard-form-architecture --strict`.
