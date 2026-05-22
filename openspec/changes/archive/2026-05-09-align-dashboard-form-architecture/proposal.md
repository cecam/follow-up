## Why

El dashboard y el formulario de follow-ups ya existen como flujo de popup, pero su implementación actual concentra responsabilidades en `src/runtimes/popup/` y no refleja la arquitectura estipulada en `openspec/specs/agents.md`. Este cambio crea el contrato para mover dominio, casos de uso, persistencia, mensajes y utilidades a las capas `features/`, `runtimes/` y `shared/` correspondientes antes de seguir construyendo sobre una estructura difícil de mantener.

## What Changes

- Alinear dashboard y form con la arquitectura de `agents.md`: runtime UI en `src/runtimes/popup/`, lógica de follow-ups en `src/features/follow-ups/`, background messaging en `src/runtimes/background/` y helpers compartidos en `src/shared/`.
- Crear el dominio de follow-ups con tipos, entidad y validadores reutilizables.
- Mover la creación, listado, completado y borrado de follow-ups a casos de uso dentro de `src/features/follow-ups/application/`.
- Encapsular persistencia local de follow-ups en `src/features/follow-ups/infrastructure/follow-up.repository.ts`, usando wrappers de `src/shared/chrome/storage.ts`.
- Centralizar mensajes popup-background en `src/shared/types/messages.ts` y `src/shared/chrome/messaging.ts`, con routing en `src/runtimes/background/message-router.ts`.
- Mantener `Dashboard` y `FollowUpForm` como páginas del popup que componen UI y navegación, sin leer storage ni ejecutar reglas de negocio directamente.
- Preparar la UI reusable de follow-ups en `src/features/follow-ups/ui/follow-up-form.tsx` y `src/features/follow-ups/ui/follow-up-list.tsx`.

## Capabilities

### New Capabilities

- `dashboard-form-architecture`: Define cómo dashboard y form deben respetar los límites arquitectónicos de runtime, feature, infrastructure y shared definidos en `agents.md`.

### Modified Capabilities

_Ninguna. No existen specs activas previas para dashboard/form en `openspec/specs/`; este cambio crea el contrato arquitectónico inicial._

## Impact

- `src/runtimes/popup/App.tsx` o equivalente: navegación entre dashboard y form.
- `src/runtimes/popup/pages/`: wrappers de página para dashboard y formulario.
- `src/runtimes/popup/components/`: componentes específicos del shell del popup.
- `src/runtimes/background/index.ts`, `message-router.ts` y `alarm-router.ts`: entrada del service worker, mensajes y alarmas.
- `src/features/follow-ups/domain/`: entidad, tipos y validadores.
- `src/features/follow-ups/application/`: casos de uso de create/list/complete/delete.
- `src/features/follow-ups/infrastructure/`: repositorio local.
- `src/features/follow-ups/ui/`: formulario y lista reutilizables.
- `src/features/profiles/` y `src/features/reminders/`: boundaries para detección de perfil y scheduling cuando el flujo de follow-up los use.
- `src/shared/chrome/`, `src/shared/types/` y `src/shared/utils/`: wrappers de Chrome APIs, contratos de mensajes y utilidades transversales.
