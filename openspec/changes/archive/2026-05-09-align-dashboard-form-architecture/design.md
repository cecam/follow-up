## Context

El proyecto define en `openspec/specs/agents.md` una arquitectura por runtimes, features y shared modules. El flujo actual de dashboard y formulario ya existe en el popup, pero mezcla responsabilidades: navegación, UI, mocks, acceso remoto, mensajes y persistencia están acoplados a componentes/hooks del runtime.

El cambio debe convertir ese flujo en una implementación alineada con la arquitectura objetivo sin cambiar el comportamiento visible: el usuario seguirá viendo el dashboard, podrá abrir el formulario desde `+` o editar, guardar follow-ups y volver a una lista actualizada.

## Goals / Non-Goals

**Goals:**

- Separar runtime UI, dominio, casos de uso, infraestructura y utilidades compartidas según `agents.md`.
- Mantener el popup como composición y navegación local en `src/runtimes/popup/`.
- Crear el feature `src/features/follow-ups/` con domain, application, infrastructure y ui.
- Centralizar wrappers de Chrome APIs, mensajes y utilidades en `src/shared/`.
- Mover routing del service worker a `src/runtimes/background/message-router.ts` y alarm handling a `alarm-router.ts`.
- Preservar el comportamiento actual del dashboard y form mientras se cambia la estructura.

**Non-Goals:**

- No se rediseñará visualmente el dashboard ni el formulario.
- No se agregará autenticación, billing, Supabase ni sincronización cloud.
- No se reemplazará el endpoint remoto `https://www.followups.com/api/create`.
- No se agregará React Router; la navegación interna del popup seguirá siendo estado local.
- No se ampliará el scope de perfiles o recordatorios más allá de boundaries necesarios para follow-ups.

## Decisions

### Runtime popup como composición

`src/runtimes/popup/` seguirá conteniendo `main`, `App`, páginas y componentes específicos del shell del popup. `App` controlará si se muestra dashboard o form, y las páginas adaptarán callbacks de navegación.

Alternativa considerada: mover todas las páginas al feature. Se descarta porque `runtimes/popup/` representa el entorno Chrome popup y debe conservar responsabilidades de montaje, dimensiones, navegación y composición.

### Follow-ups como feature owner

Todo contrato de follow-up vivirá bajo `src/features/follow-ups/`:

- `domain/follow-up.ts`, `follow-up.types.ts`, `follow-up.validators.ts`
- `application/create-follow-up.ts`, `complete-follow-up.ts`, `delete-follow-up.ts`, `list-follow-ups.ts`
- `infrastructure/follow-up.repository.ts`
- `ui/follow-up-form.tsx`, `follow-up-list.tsx`

El dashboard y form no deben construir payloads inconsistentes ni calcular reglas de dominio fuera del feature. El form puede tener estado controlado, pero la creación/validación final pertenece al feature.

Alternativa considerada: dejar la lógica en hooks del popup. Se descarta porque impide reutilización y contradice la arquitectura estipulada.

### Shared para Chrome APIs, mensajes y utilidades

`src/shared/chrome/` encapsulará `chrome.runtime`, `chrome.storage`, `chrome.notifications` y `chrome.alarms`. `src/shared/types/messages.ts` será la fuente única de tipos y constantes de mensajes. `src/shared/utils/date.ts` e `id.ts` contendrán cálculo de expiración, días restantes, formato de fechas e IDs.

Alternativa considerada: importar `chrome.*` directamente en features. Se descarta para mantener testabilidad y permitir fallback en desarrollo fuera de Chrome.

### Background runtime como router

`src/runtimes/background/index.ts` solo registrará listeners y delegará a `message-router.ts` y `alarm-router.ts`. El message router procesará mensajes tipados y llamará casos de uso/repositorios. El alarm router coordinará recordatorios con `src/features/reminders/`.

Alternativa considerada: mantener todo en `src/app/manifest/background.ts`. Se descarta porque `app/manifest` debe contener configuración de manifest, no runtime behavior.

### Migración incremental

La implementación podrá conservar archivos `.jsx/.js` existentes durante una transición si el proyecto todavía no está completamente en TypeScript, pero los nuevos nombres de arquitectura documentados en `agents.md` son la dirección final. Si se mantiene JavaScript temporalmente, los módulos deben conservar los mismos boundaries y contratos.

Alternativa considerada: convertir todo a TypeScript en un solo cambio. Se descarta para evitar mezclar refactor arquitectónico con migración de lenguaje.

## Risks / Trade-offs

- Refactor con archivos existentes en JavaScript -> Mantener boundaries primero y dejar conversión TS como paso mecánico posterior si hace falta.
- Service worker efímero -> Persistir cualquier estado relevante mediante repositorios y wrappers de storage antes de responder al popup.
- Mensajes popup-background inconsistentes -> Definir constantes/tipos en `src/shared/types/messages.ts` y usarlos en ambos lados.
- Regressions visuales por mover UI -> Mantener páginas runtime como wrappers y extraer solo piezas reutilizables del feature de forma incremental.
- Mocks temporales duplicados -> Ubicarlos detrás de `list-follow-ups` o del repositorio, nunca dentro de componentes del popup.

## Migration Plan

1. Crear `src/shared/chrome/`, `src/shared/types/` y `src/shared/utils/` con wrappers y contratos mínimos.
2. Crear `src/features/follow-ups/domain/` con tipos, entidad y validadores.
3. Crear casos de uso `list-follow-ups` y `create-follow-up`, reutilizando comportamiento actual del dashboard/form.
4. Crear `follow-up.repository` para storage local y normalización.
5. Reubicar message handling desde el background actual hacia `src/runtimes/background/message-router.ts`.
6. Convertir `useDashboard`, `Dashboard` y `FollowUpForm` en adaptadores de runtime que llaman casos de uso y UI reusable.
7. Verificar create/edit/list/error states desde el popup y validar OpenSpec.

## Open Questions

- ¿La migración a TypeScript debe ejecutarse dentro de este cambio o en un cambio posterior? La arquitectura final lo espera, pero el repo actual contiene varios archivos `.jsx/.js`.
- ¿El endpoint remoto seguirá aceptando updates en `/api/create` con `id`, o se separará una ruta de edición más adelante?
