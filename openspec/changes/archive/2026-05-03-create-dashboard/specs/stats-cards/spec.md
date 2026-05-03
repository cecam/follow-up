## ADDED Requirements

### Requirement: Total contacts stat card
The dashboard SHALL display a stats card showing the total number of currently active (non-expired) contacts. The card SHALL include a representative icon and the label "Total contactos".

#### Scenario: Total contacts count displays correctly
- **WHEN** the user has 7 active contacts
- **THEN** the stats card SHALL display "7" with the label "Total contactos"

#### Scenario: Zero contacts
- **WHEN** the user has no contacts
- **THEN** the stats card SHALL display "0" with the label "Total contactos"

### Requirement: Expiring contacts stat card
The dashboard SHALL display a stats card showing the number of contacts whose expiration date is within 7 days or less. The card SHALL include an expiration/clock icon and the label "Por caducar".

#### Scenario: Expiring contacts count
- **WHEN** the user has 3 contacts expiring within the next 7 days
- **THEN** the stats card SHALL display "3" with the label "Por caducar"

#### Scenario: No expiring contacts
- **WHEN** no contacts are expiring within 7 days
- **THEN** the stats card SHALL display "0" with the label "Por caducar"

#### Scenario: Expiring count uses warning styling
- **WHEN** the expiring contacts count is greater than 0
- **THEN** the count number SHALL be styled with the warning color token to draw attention

### Requirement: Stats cards layout
The stats cards SHALL be displayed in a horizontal row with equal width, following the bento grid system. Both cards SHALL be side-by-side within the popup width.

#### Scenario: Two cards side-by-side
- **WHEN** the dashboard renders
- **THEN** the total contacts card and the expiring contacts card SHALL be displayed in a single horizontal row occupying the full available width

#### Scenario: Cards have consistent styling
- **WHEN** the stats cards render
- **THEN** both cards SHALL use the `bento-card` styling: `12px` border radius, subtle border, hover elevation effect, and `16px` padding
