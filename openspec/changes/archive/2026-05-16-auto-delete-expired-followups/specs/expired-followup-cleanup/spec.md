## ADDED Requirements

### Requirement: Dashboard load removes expired follow-ups
The system SHALL automatically remove expired follow-ups when the dashboard obtains follow-up data.

#### Scenario: Expired follow-ups are removed before dashboard render
- **WHEN** the dashboard loads follow-ups and one or more records have a valid `expirationDate` earlier than the current query time
- **THEN** the system persists a follow-up list without those expired records
- **AND** the dashboard renders only the remaining non-expired follow-ups

#### Scenario: Non-expired follow-ups are preserved
- **WHEN** the dashboard loads follow-ups and records have an `expirationDate` equal to or later than the current query time
- **THEN** those records remain persisted
- **AND** those records remain visible in the dashboard list

#### Scenario: Invalid expiration dates are not auto-deleted
- **WHEN** the dashboard loads follow-ups and a record has an invalid `expirationDate`
- **THEN** the system does not remove that record as part of expired follow-up cleanup

### Requirement: Expired cleanup reports removed follow-up names
The system SHALL return the names of follow-ups removed by the dashboard load cleanup.

#### Scenario: Cleanup removes multiple follow-ups
- **WHEN** the dashboard load removes multiple expired follow-ups
- **THEN** the load result includes the name of each removed follow-up

#### Scenario: Cleanup removes no follow-ups
- **WHEN** the dashboard load finds no expired follow-ups
- **THEN** the load result includes an empty removed-follow-up list

### Requirement: Dashboard shows expired cleanup alert
The dashboard SHALL show an alert between the stats section and follow-up list when expired follow-ups were removed during the latest load.

#### Scenario: Removed follow-ups alert appears with count and names
- **WHEN** the latest dashboard load removed expired follow-ups
- **THEN** the dashboard displays an alert between stats and the follow-up list
- **AND** the alert states how many follow-ups were removed because they expired
- **AND** the alert lists the removed follow-up names

#### Scenario: Removed follow-ups alert is hidden when nothing was removed
- **WHEN** the latest dashboard load removed zero expired follow-ups
- **THEN** the dashboard does not display the expired cleanup alert

### Requirement: Dashboard derived state uses cleaned follow-ups
The dashboard SHALL calculate stats, active-limit state, and list rendering from the cleaned follow-up data after expired cleanup.

#### Scenario: Stats exclude removed follow-ups
- **WHEN** expired follow-ups are removed during dashboard load
- **THEN** dashboard stats are calculated from the remaining persisted follow-ups

#### Scenario: Active-limit alert uses cleaned list
- **WHEN** expired follow-ups are removed during dashboard load
- **THEN** the active-limit alert is evaluated using the remaining persisted follow-ups
