## ADDED Requirements

### Requirement: Dashboard loads follow-ups through the follow-ups feature boundary
The dashboard SHALL request its follow-up list through `features/follow-ups` instead of defining mock follow-ups inside the popup hook.

#### Scenario: Temporary mock list request
- **WHEN** the dashboard loads while the real follow-up listing fetch is not implemented
- **THEN** the popup delegates the list request to `list-follow-ups`, which may use shared Chrome runtime messaging to request data from the background runtime

#### Scenario: Background runtime returns temporary mocks
- **WHEN** the background message router receives a follow-up list request
- **THEN** it returns mock follow-ups through the shared message contract with the same data shape used by the `FollowUp` domain model

#### Scenario: Future list fetch replacement point
- **WHEN** the real follow-up listing fetch is implemented later
- **THEN** it can replace the temporary mock-list implementation behind `list-follow-ups` without changing the dashboard request contract

### Requirement: Dashboard entry points open the follow-up form
The popup SHALL provide a follow-up form view that is reachable from the dashboard add button and from an existing follow-up edit action.

#### Scenario: Open form from add button
- **WHEN** the user clicks the `+` button in the dashboard header
- **THEN** the popup displays the follow-up form in creation mode

#### Scenario: Open form from edit action
- **WHEN** the user selects "Editar" from a follow-up card action menu
- **THEN** the popup displays the follow-up form prefilled with that follow-up's current values

### Requirement: Form header returns to dashboard
The follow-up form SHALL include a header action that returns the user to the dashboard without saving changes.

#### Scenario: Return without saving
- **WHEN** the user clicks the return-to-dashboard button in the form header
- **THEN** the popup displays the dashboard

### Requirement: Form captures follow-up characteristics
The follow-up form SHALL capture all user-editable characteristics required to create or edit a follow-up.

#### Scenario: Creation form has editable fields
- **WHEN** the user opens the form in creation mode
- **THEN** the form displays editable controls for name, profile URL, and notes

#### Scenario: Platform is fixed to LinkedIn
- **WHEN** the user opens or saves the form
- **THEN** the form does not display a platform selector and saves the follow-up with platform `linkedin`

#### Scenario: Notes are constrained
- **WHEN** the user enters notes longer than 255 characters
- **THEN** the form prevents saving more than 255 note characters

#### Scenario: Expiration is automatic
- **WHEN** the user opens the form in creation or edit mode
- **THEN** the form calculates expiration date as creation date plus 6 months and displays "Tienes hasta {date} para que expire tu follow-up" below the notes without offering an editable expiration control

### Requirement: Form validates required fields before saving
The follow-up form SHALL prevent submission when required data is missing or invalid.

#### Scenario: Missing required data
- **WHEN** the user clicks save without a required name or profile URL
- **THEN** the form keeps the user on the form and displays validation feedback

### Requirement: Save delegates remote creation through the follow-ups feature boundary
The popup SHALL submit saves through the `create-follow-up` use case, and the background runtime SHALL POST the complete follow-up payload to `https://www.followups.com/api/create` when remote IO is required.

#### Scenario: Create save request
- **WHEN** the user clicks save on a valid creation form
- **THEN** the popup passes the editable follow-up fields and automatic expiration date to the `create-follow-up` use case

#### Scenario: Edit save request
- **WHEN** the user clicks save on a valid edit form
- **THEN** the popup passes the editable follow-up fields, automatic expiration date, and existing follow-up id to the `create-follow-up` use case

#### Scenario: Background runtime fetch request
- **WHEN** the background message router receives a valid follow-up save message from the feature boundary
- **THEN** it sends a JSON POST request to `https://www.followups.com/api/create`

### Requirement: Successful save returns to an updated dashboard
After a successful feature save, the popup SHALL return to the dashboard and display the updated follow-up list.

#### Scenario: Successful create
- **WHEN** the save request succeeds for a new follow-up
- **THEN** the popup returns to the dashboard and the new follow-up appears in the list

#### Scenario: Successful edit
- **WHEN** the save request succeeds for an existing follow-up
- **THEN** the popup returns to the dashboard and the edited follow-up values appear in the list

### Requirement: Failed save displays UI error
If the feature/background save flow fails, the popup SHALL keep the user on the form and display a user-facing error.

#### Scenario: Save fetch fails
- **WHEN** the save flow reports a network error, non-success HTTP response, or invalid response while saving
- **THEN** the form displays "Hubo un error al guardar, inténtalo más tarde."

#### Scenario: Save fails without losing user input
- **WHEN** saving fails after the user submitted a valid form
- **THEN** the form remains populated with the user's current input
