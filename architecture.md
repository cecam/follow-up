# Intended architecture for the project

src/
    app/
        manifest/
        config/

    runtimes/
        background/
            index.ts
            message-router.ts
            alarm-router.ts
        content/
            index.ts
            linkedin-detector.ts
            instagram-detector.ts
            x-detector.ts
        popup/
            main.tsx
            router.tsx
            App.tsx
            pages/
            components/

    features/
        follow-ups/
            domain/
                follow-up.ts
                follow-up.types.ts
                follow-up.validators.ts
            application/
                create-follow-up.ts
                complete-follow-up.ts
                delete-follow-up.ts
                list-follow-ups.ts
            infrastructure/
                follow-up.repository.ts
            ui/
                follow-up-form.tsx
                follow-up-list.tsx

        profiles/
            domain/
                profile.ts
                profile.types.ts
            application/
                detect-current-profile.ts
            infrastructure/
                profile-detectors.ts

        reminders/
            application/
                schedule-follow-up-reminder.ts
                handle-reminder-trigger.ts
            infrastructure/
                reminder.service.ts

    shared/
        chrome/
            messaging.ts
            storage.ts
            notifications.ts
            alarms.ts
        types/
            messages.ts
            runtime.ts
        utils/
            date.ts
            id.ts

## Popup routing

Popup navigation lives in `src/runtimes/popup/` and should use `MemoryRouter`, so routing remains a popup runtime concern instead of leaking into feature modules.
