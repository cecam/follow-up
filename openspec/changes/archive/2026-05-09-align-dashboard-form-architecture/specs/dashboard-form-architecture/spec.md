## ADDED Requirements

### Requirement: Popup runtime owns dashboard and form composition
The system SHALL keep dashboard and follow-up form page composition inside the popup runtime while delegating follow-up business behavior to feature modules.

#### Scenario: Dashboard renders from popup runtime
- **WHEN** the popup opens to the dashboard
- **THEN** the dashboard page SHALL be composed from `src/runtimes/popup/` and SHALL receive follow-up data through a feature-facing boundary

#### Scenario: Form renders from popup runtime
- **WHEN** the user opens the follow-up form from the dashboard add button or edit action
- **THEN** the form page SHALL be composed from `src/runtimes/popup/` and SHALL delegate follow-up validation and persistence to `src/features/follow-ups/`

### Requirement: Follow-up domain owns data contracts and validation
The system SHALL define follow-up entity behavior, data types, and validation rules under `src/features/follow-ups/domain/`.

#### Scenario: Form builds a follow-up payload
- **WHEN** the user submits a valid follow-up form
- **THEN** the payload SHALL conform to the follow-up domain types and validators before persistence or messaging occurs

#### Scenario: Dashboard displays a follow-up
- **WHEN** the dashboard receives follow-ups to render
- **THEN** each item SHALL conform to the follow-up domain model used by the form and repository

### Requirement: Follow-up application layer owns use cases
The system SHALL route create, list, complete, and delete behavior through application use cases in `src/features/follow-ups/application/`.

#### Scenario: Dashboard loads follow-ups
- **WHEN** the dashboard needs its list data
- **THEN** it SHALL call or adapt to `list-follow-ups` instead of reading mocks, storage, or remote data directly

#### Scenario: Form saves a follow-up
- **WHEN** the user saves a follow-up from the form
- **THEN** the popup SHALL call or adapt to `create-follow-up` instead of performing storage writes or remote fetches directly

#### Scenario: Follow-up actions are added
- **WHEN** complete or delete actions are invoked from dashboard UI
- **THEN** the popup SHALL route them through `complete-follow-up` or `delete-follow-up`

### Requirement: Follow-up infrastructure owns persistence
The system SHALL encapsulate follow-up storage and normalization inside `src/features/follow-ups/infrastructure/follow-up.repository.ts`.

#### Scenario: List reads persisted follow-ups
- **WHEN** `list-follow-ups` needs local data
- **THEN** it SHALL use the follow-up repository rather than calling `chrome.storage.local` directly

#### Scenario: Save persists a follow-up
- **WHEN** a follow-up save succeeds
- **THEN** the repository SHALL normalize and persist the follow-up through shared Chrome storage wrappers

### Requirement: Shared modules own Chrome API wrappers and cross-runtime contracts
The system SHALL centralize Chrome API access, message contracts, runtime types, dates, and IDs under `src/shared/`.

#### Scenario: Popup sends a background message
- **WHEN** popup code needs to communicate with the background runtime
- **THEN** it SHALL use message constants/types from `src/shared/types/messages.ts` and helpers from `src/shared/chrome/messaging.ts`

#### Scenario: Feature code accesses storage
- **WHEN** feature infrastructure needs Chrome local storage
- **THEN** it SHALL use `src/shared/chrome/storage.ts` instead of direct `chrome.storage.local` calls

#### Scenario: UI formats expiration metadata
- **WHEN** dashboard or form displays expiration dates or remaining days
- **THEN** it SHALL use shared date utilities rather than duplicating date calculations in components

### Requirement: Background runtime owns message and alarm routing
The system SHALL move background runtime behavior to `src/runtimes/background/` with dedicated routers for messages and alarms.

#### Scenario: Background receives follow-up messages
- **WHEN** the service worker receives a follow-up list or save message
- **THEN** `message-router.ts` SHALL route the message to the appropriate follow-up use case or infrastructure adapter

#### Scenario: Background receives reminder alarms
- **WHEN** Chrome triggers a reminder alarm
- **THEN** `alarm-router.ts` SHALL route the event toward `src/features/reminders/application/handle-reminder-trigger.ts`

### Requirement: Dashboard and form preserve existing user behavior during architecture migration
The architecture migration SHALL preserve the current visible dashboard and form flows while changing ownership boundaries.

#### Scenario: User creates a follow-up
- **WHEN** the user opens the form from the dashboard, submits valid data, and the save succeeds
- **THEN** the popup SHALL return to the dashboard and display the updated follow-up list

#### Scenario: User edits a follow-up
- **WHEN** the user opens the form from an existing follow-up action, submits valid changes, and the save succeeds
- **THEN** the popup SHALL return to the dashboard and display the edited follow-up values

#### Scenario: Save fails
- **WHEN** the save flow fails because of a network, validation, or persistence error
- **THEN** the form SHALL remain open, preserve user input, and display a user-facing error
