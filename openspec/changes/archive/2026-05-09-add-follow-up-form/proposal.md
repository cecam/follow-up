## Why

El dashboard ya presenta la lista de follow-ups, pero el botón de agregar no permite crear un registro real. Este cambio habilita el flujo principal para capturar y editar follow-ups desde el popup, con guardado coordinado por el background runtime.

## What Changes

- Agregar una vista de formulario para crear y editar follow-ups con el mismo estilo visual del dashboard.
- Alinear el formulario con la arquitectura objetivo: UI reutilizable en `src/features/follow-ups/ui/`, casos de uso en `src/features/follow-ups/application/`, persistencia en `src/features/follow-ups/infrastructure/` y navegación en `src/runtimes/popup/`.
- Conectar el botón `+` del header del dashboard para navegar a la nueva vista.
- Agregar un botón en el header del formulario para regresar al dashboard.
- Mover la lista temporal de mocks fuera del hook del dashboard hacia la capa de aplicación/infraestructura del feature, usando mensajes tipados cuando el popup necesite coordinarse con el background runtime.
- Enviar el guardado por el boundary del feature; el background runtime ejecutará el `fetch` a `https://www.followups.com/api/create` cuando el caso de uso requiera IO remoto.
- Al guardar exitosamente, volver al dashboard y actualizar la lista.
- Si el guardado falla, mostrar un error visible en la UI: "Hubo un error al guardar, inténtalo más tarde."

## Capabilities

### New Capabilities
- `follow-up-form`: Cubre la creación y edición de follow-ups desde el popup, incluyendo navegación, validación básica, carga temporal por el boundary de `features/follow-ups`, guardado coordinado con el background runtime, estados de carga y manejo de error.

### Modified Capabilities
Ninguna.

## Impact

- `src/runtimes/popup/pages/Dashboard.jsx`
- `src/runtimes/popup/components/DashboardHeader.jsx`
- Nueva vista de runtime en `src/runtimes/popup/pages/FollowUpForm.jsx` o wrapper equivalente que compone la UI del feature
- `src/features/follow-ups/ui/follow-up-form.tsx` como formulario reutilizable del feature
- `src/features/follow-ups/application/create-follow-up.ts` para construir, validar y guardar follow-ups nuevos
- `src/features/follow-ups/application/list-follow-ups.ts` para alimentar dashboard y refrescos posteriores al guardado
- `src/features/follow-ups/infrastructure/follow-up.repository.ts` para persistencia local y normalización de resultados
- `src/shared/chrome/messaging.ts`, `src/shared/chrome/storage.ts`, `src/shared/types/messages.ts` y `src/shared/utils/date.ts` para contratos compartidos
- `src/runtimes/background/message-router.ts` y `src/runtimes/background/index.ts` para manejar mensajes de listado temporal y guardado remoto
- Permisos/CSP del manifest si el endpoint remoto requiere declaración explícita
- Spec OpenSpec para el nuevo formulario
