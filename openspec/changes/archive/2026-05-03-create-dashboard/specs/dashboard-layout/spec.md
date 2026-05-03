## ADDED Requirements

### Requirement: Dashboard page structure
The dashboard page SHALL render three distinct sections in vertical order: a header section, a stats section, and a contact list section. The layout SHALL be contained within the popup dimensions of 400×600px with vertical scrolling enabled when content overflows.

#### Scenario: Dashboard renders all sections
- **WHEN** the user opens the popup and is authenticated
- **THEN** the dashboard SHALL display the header at the top, followed by the stats cards, followed by the contact list

#### Scenario: Content overflow scrolling
- **WHEN** the contact list exceeds the visible popup area
- **THEN** the dashboard SHALL enable smooth vertical scrolling on the contact list container while the header and stats sections remain fixed at the top

### Requirement: Dashboard header with welcome message
The header SHALL display a welcome message "Bienvenido de nuevo {username}" where `{username}` is the authenticated user's name. Below the welcome message, the header SHALL display the subtitle "Aquí tienes un vistazo rápido de tus seguimientos".

#### Scenario: Welcome message displays username
- **WHEN** the dashboard loads with user "David"
- **THEN** the header SHALL display "Bienvenido de nuevo David"

#### Scenario: Subtitle is always visible
- **WHEN** the dashboard loads
- **THEN** the subtitle "Aquí tienes un vistazo rápido de tus seguimientos" SHALL be visible below the welcome message

### Requirement: Settings gear menu
The header SHALL include a gear icon button positioned at the far right of the header row. Clicking the gear icon SHALL toggle a dropdown menu with two options: "Editar perfil" and "Cerrar sesión".

#### Scenario: Gear icon opens dropdown
- **WHEN** the user clicks the gear icon
- **THEN** a dropdown menu SHALL appear with "Editar perfil" and "Cerrar sesión" options

#### Scenario: Dropdown closes on outside click
- **WHEN** the dropdown is open and the user clicks anywhere outside the dropdown
- **THEN** the dropdown SHALL close

#### Scenario: Dropdown closes on option selection
- **WHEN** the user clicks any option in the dropdown
- **THEN** the dropdown SHALL close

### Requirement: Dark mode support
The dashboard SHALL support light and dark modes using CSS custom properties. The theme SHALL follow the design tokens defined in the project design system.

#### Scenario: Dark mode rendering
- **WHEN** the user's theme preference is set to "dark"
- **THEN** all dashboard surfaces, text, borders, and accent colors SHALL use the dark mode token values

#### Scenario: Light mode rendering
- **WHEN** the user's theme preference is set to "light"
- **THEN** all dashboard surfaces, text, borders, and accent colors SHALL use the light mode token values
