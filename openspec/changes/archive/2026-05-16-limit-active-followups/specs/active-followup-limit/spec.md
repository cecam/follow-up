## ADDED Requirements

### Requirement: Active follow-up limit is defined centrally
The system SHALL define the maximum number of active follow-ups as a shared constant with value `10`.

#### Scenario: Limit value is reused
- **WHEN** dashboard, form, or creation logic needs to evaluate the active follow-up limit
- **THEN** it uses the shared maximum value of `10` instead of duplicating a literal number

### Requirement: Active follow-ups are counted consistently
The system SHALL count only active follow-ups when evaluating the creation limit.

#### Scenario: Pending non-expired follow-ups count as active
- **WHEN** a follow-up has status `pending` and has not expired
- **THEN** it counts toward the active follow-up limit

#### Scenario: Completed or expired follow-ups do not count as active
- **WHEN** a follow-up is completed or expired
- **THEN** it does not count toward the active follow-up limit

### Requirement: Dashboard warns when the active limit is reached
The dashboard SHALL show a visible alert when the user has 10 active follow-ups.

#### Scenario: List reaches 10 active follow-ups
- **WHEN** the dashboard renders with exactly 10 active follow-ups
- **THEN** it displays "Solo puedes tener 10 follow ups activos. Si necesitas agregar uno nuevo, debes eliminar uno."

#### Scenario: List is below the active limit
- **WHEN** the dashboard renders with fewer than 10 active follow-ups
- **THEN** it does not display the active-limit alert

### Requirement: Creation form blocks new follow-ups at the active limit
The creation form SHALL show the active-limit alert and disable creation when the user already has 10 active follow-ups.

#### Scenario: Open creation form at active limit
- **WHEN** the user opens the creation form while already having 10 active follow-ups
- **THEN** the form displays "Solo puedes tener 10 follow ups activos. Si necesitas agregar uno nuevo, debes eliminar uno."
- **AND** the primary create button is disabled

#### Scenario: Open creation form below active limit
- **WHEN** the user opens the creation form while having fewer than 10 active follow-ups
- **THEN** the form does not display the active-limit alert
- **AND** the primary create button is enabled when the form is otherwise valid and not submitting

### Requirement: Creation use case enforces the active limit
The follow-up creation use case SHALL reject new follow-ups when the active follow-up limit has already been reached.

#### Scenario: Save new follow-up at active limit
- **WHEN** a create request is submitted while storage already contains 10 active follow-ups
- **THEN** the system does not persist the new follow-up
- **AND** it returns an active-limit failure that the UI can display with the shared alert message

#### Scenario: Save new follow-up below active limit
- **WHEN** a create request is submitted while storage contains fewer than 10 active follow-ups
- **THEN** the system validates and persists the new follow-up normally

### Requirement: Existing follow-ups remain manageable at the active limit
The system SHALL allow users to edit or delete existing follow-ups even when the active follow-up limit is reached.

#### Scenario: Edit existing follow-up at active limit
- **WHEN** the user opens an existing follow-up in edit mode while already having 10 active follow-ups
- **THEN** the form does not disable saving because of the active-limit rule

#### Scenario: Delete follow-up at active limit
- **WHEN** the user deletes an active follow-up while already having 10 active follow-ups
- **THEN** the dashboard recalculates the active count
- **AND** the active-limit alert no longer appears if the active count is below 10
