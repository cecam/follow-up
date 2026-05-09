## 1. Popup Navigation

- [x] 1.1 Update `App.jsx` to switch between dashboard and follow-up form views using local React state.
- [x] 1.2 Pass an add handler from `App.jsx` through `Dashboard` to `DashboardHeader`.
- [x] 1.3 Replace the `+` button console action with navigation to the follow-up form in creation mode.
- [x] 1.4 Pass an edit handler from `App.jsx` through `Dashboard`, `ContactList`, and `ContactCard`.
- [x] 1.5 Replace the contact card "Editar" console action with navigation to the follow-up form in edit mode.
- [x] 1.6 Keep popup navigation in `src/runtimes/popup/` and document that domain/application logic belongs under `src/features/follow-ups/`.

## 2. Follow-Up Form UI

- [x] 2.1 Add a `FollowUpForm` page component styled with existing bento/minimalist tokens.
- [x] 2.2 Add a form header with a Lucide back button that returns to the dashboard without saving.
- [x] 2.3 Add controlled fields for name, profile URL, and notes.
- [x] 2.4 Prefill form values from an existing follow-up when opened in edit mode.
- [x] 2.5 Add compact loading, disabled, validation, and save-error UI states.
- [x] 2.6 Document the target reusable feature component at `src/features/follow-ups/ui/follow-up-form.tsx`, with the runtime page acting as popup wrapper.

## 3. Form Validation and Payload

- [x] 3.1 Validate required fields before submit: name and profile URL.
- [x] 3.2 Enforce the 255-character notes limit in the form.
- [x] 3.3 Calculate expiration date automatically as creation date plus 6 months.
- [x] 3.4 Build a complete follow-up payload including id in edit mode, platform fixed to LinkedIn, status, timestamps, automatic expiration date, and all editable fields.
- [x] 3.5 Document domain contracts in `src/features/follow-ups/domain/follow-up.types.ts` and validation ownership in `src/features/follow-ups/domain/follow-up.validators.ts`.

## 4. Background Runtime List and Save Flow

- [x] 4.1 Add typed message constants or helpers for `FOLLOW_UPS_LIST_REQUESTED` and `FOLLOW_UP_SAVE_REQUESTED`.
- [x] 4.2 Move the current dashboard mock contacts behind a temporary follow-ups feature/background list implementation.
- [x] 4.3 Add a background message-router path that returns `{ ok: true, contacts }` for list requests.
- [x] 4.4 Add a background message-router path that accepts valid follow-up save messages.
- [x] 4.5 POST the full payload as JSON to `https://www.followups.com/api/create`.
- [x] 4.6 Treat network failures, non-2xx responses, and invalid responses as save failures.
- [x] 4.7 On success, merge the created or updated follow-up into local storage through the follow-up repository and shared Chrome storage wrapper.
- [x] 4.8 Respond to the popup with `{ ok: true, contacts }` or `{ ok: false, error }`.
- [x] 4.9 Document the target routing through `src/runtimes/background/message-router.ts`, shared message contracts in `src/shared/types/messages.ts`, and storage access through `src/features/follow-ups/infrastructure/follow-up.repository.ts`.

## 5. Dashboard Refresh

- [x] 5.1 Update `useDashboard` to load contacts through `list-follow-ups`, using `FOLLOW_UPS_LIST_REQUESTED` through shared messaging when the background runtime is needed.
- [x] 5.2 Refresh or replace dashboard contact state after a successful save response.
- [x] 5.3 Return to the dashboard only after storage/list state is updated.
- [x] 5.4 Keep the user on the form and show "Hubo un error al guardar, inténtalo más tarde." when save fails.
- [x] 5.5 Document the target dashboard refresh path through `src/features/follow-ups/application/list-follow-ups.ts`.

## 6. Extension Configuration and Verification

- [x] 6.1 Update extension host permissions or CSP if required for `https://www.followups.com/api/create`.
- [x] 6.2 Verify the dashboard renders the temporary mock list returned through the follow-ups feature/background boundary.
- [x] 6.3 Verify create mode from the dashboard `+` button.
- [x] 6.4 Verify edit mode from a contact card "Editar" action.
- [x] 6.5 Verify successful save returns to an updated dashboard.
- [x] 6.6 Verify failed save preserves form input and displays the requested error message.
