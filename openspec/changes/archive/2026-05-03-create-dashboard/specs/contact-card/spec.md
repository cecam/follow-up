## ADDED Requirements

### Requirement: Contact card as collapsible element
Each contact SHALL be rendered as a collapsible card using the native `<details>/<summary>` HTML element, styled to match the bento minimalist design system. The card SHALL be collapsed by default.

#### Scenario: Card renders collapsed
- **WHEN** the dashboard loads with contacts
- **THEN** each contact card SHALL render in collapsed state showing only the summary header

#### Scenario: Card expands on click
- **WHEN** the user clicks on a collapsed contact card header
- **THEN** the card SHALL expand to reveal the full contact details with a smooth animation

#### Scenario: Card collapses on re-click
- **WHEN** the user clicks on an expanded contact card header
- **THEN** the card SHALL collapse back to show only the summary header

### Requirement: Collapsed header content
The collapsed header of each contact card SHALL display: the contact name (left-aligned), the expiration date formatted as "DD/MM/YYYY" (center or right area), an expiration warning indicator (when applicable), and a three-dot action menu button (far right).

#### Scenario: Header shows contact name
- **WHEN** a contact card renders with name "María López"
- **THEN** the header SHALL display "María López" as the primary text on the left

#### Scenario: Header shows expiration date
- **WHEN** a contact card has expiration date "2026-08-15"
- **THEN** the header SHALL display the date formatted as "15/08/2026"

### Requirement: Expanded card content
When a contact card is expanded, it SHALL display three additional fields: the source link (URL where the contact was found), a note field (maximum 255 characters), and the expiration date with context.

#### Scenario: Source link is displayed
- **WHEN** a contact card is expanded with profileUrl "https://linkedin.com/in/maria-lopez"
- **THEN** the expanded area SHALL display the URL as a clickable link that opens in a new tab

#### Scenario: Note is displayed
- **WHEN** a contact card is expanded with notes "Recruiter en Google, contactar sobre posición frontend"
- **THEN** the expanded area SHALL display the note text

#### Scenario: Note truncation at 255 characters
- **WHEN** a contact has a note of exactly 255 characters
- **THEN** the note SHALL display in full without truncation

#### Scenario: Expiration date with remaining days
- **WHEN** a contact card is expanded and the expiration date is 30 days away
- **THEN** the expanded area SHALL show the expiration date and indicate "30 días restantes"

### Requirement: Expiration warning indicator
The contact card header SHALL display a visual warning indicator when the contact's expiration date is within 7 days or less from the current date. The indicator SHALL use the warning color token from the design system.

#### Scenario: Warning shown for expiring contact
- **WHEN** a contact's expiration date is 5 days from now
- **THEN** the header SHALL display a warning icon/badge with the warning color (#F59E0B)

#### Scenario: Warning shown on last day
- **WHEN** a contact's expiration date is today
- **THEN** the header SHALL display a warning icon/badge with the error color (#EF4444)

#### Scenario: No warning for distant expiration
- **WHEN** a contact's expiration date is 30 days from now
- **THEN** the header SHALL NOT display any warning indicator

### Requirement: Three-dot action menu
Each contact card header SHALL include a three-dot (⋮) icon button positioned at the far right. Clicking the button SHALL toggle a dropdown menu with two options: "Editar" and "Borrar".

#### Scenario: Action menu opens on click
- **WHEN** the user clicks the three-dot button on a contact card
- **THEN** a dropdown menu SHALL appear with "Editar" and "Borrar" options

#### Scenario: Action menu does not toggle card expansion
- **WHEN** the user clicks the three-dot button
- **THEN** the click SHALL NOT cause the card to expand or collapse

#### Scenario: Action menu closes on outside click
- **WHEN** the action menu is open and the user clicks outside of it
- **THEN** the menu SHALL close

#### Scenario: Only one action menu open at a time
- **WHEN** the user opens an action menu on one card while another card's menu is already open
- **THEN** the previously open menu SHALL close and only the new menu SHALL be visible

### Requirement: Expiration date constraint
Each contact card's expiration date SHALL be a maximum of 6 months from the contact's creation date. The system SHALL enforce this constraint when creating or editing contacts.

#### Scenario: Valid expiration within 6 months
- **WHEN** a contact was created on "2026-05-01" with expiration "2026-10-30"
- **THEN** the expiration date SHALL be accepted (within 6 months)

#### Scenario: Expiration exceeding 6 months is rejected
- **WHEN** a contact was created on "2026-05-01" with expiration "2026-12-01"
- **THEN** the system SHALL reject the date and enforce the maximum of "2026-11-01"
