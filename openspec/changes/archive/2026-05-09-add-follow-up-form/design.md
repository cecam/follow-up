## Context

El popup actual monta `Dashboard` directamente desde `App.jsx`. `DashboardHeader` ya contiene el botón `+`, pero su acción solo imprime en consola. La lista usa datos mock definidos dentro de `useDashboard`, y `ContactCard` ya expone una acción de editar que también imprime en consola. Este cambio debe mover el flujo hacia la arquitectura definida en `architecture.md`: el runtime del popup coordina navegación, `features/follow-ups` contiene dominio/casos de uso/repositorio/UI reutilizable, `features/reminders` queda como boundary para recordatorios futuros y `shared` centraliza wrappers de Chrome, mensajes, tipos y utilidades.

La extensión está basada en Manifest V3. El service worker es efímero, por lo que no debe depender de memoria persistente. La UI debe conservar el estilo bento/minimalista actual, optimizado para el popup de 400x600px, y cualquier comunicación popup-background debe hacerse con `chrome.runtime.sendMessage()`.

## Goals / Non-Goals

**Goals:**
- Agregar una vista de formulario reutilizable para crear y editar follow-ups.
- Navegar al formulario desde el botón `+` del dashboard y desde la acción "Editar" de una tarjeta.
- Incluir un botón de regreso al dashboard en el header del formulario.
- Mover los mocks temporales de follow-ups fuera del hook del dashboard hacia el boundary de `features/follow-ups`, consumiéndolos mediante `list-follow-ups` y wrappers/mensajes compartidos cuando aplique.
- Validar los campos principales antes de guardar.
- Delegar el guardado al caso de uso `create-follow-up`; el background runtime hará `fetch` a `https://www.followups.com/api/create` cuando se requiera IO remoto.
- Volver al dashboard con la lista actualizada cuando el guardado sea exitoso.
- Mostrar el error "Hubo un error al guardar, inténtalo más tarde." cuando falle el guardado.

**Non-Goals:**
- No se agregará routing externo ni dependencia de router.
- No se implementará borrado ni marcado como completado.
- No se agregará autenticación, pagos ni sincronización completa en la nube.
- No se implementará todavía el fetch real para obtener la lista remota de follow-ups.
- No se cambiará el diseño base del dashboard fuera de los puntos de entrada del formulario.

## Decisions

### Navegación local por estado

`App.jsx` controlará una vista simple: `dashboard` o `followUpForm`. Para crear, guardará `selectedFollowUp = null`; para editar, guardará el contacto seleccionado. Esto encaja con el tamaño actual del popup y evita introducir React Router para dos vistas internas.

Alternativa considerada: usar rutas con hash o React Router. Se descarta por complejidad innecesaria para el alcance actual.

### Arquitectura del formulario

La pantalla de runtime `src/runtimes/popup/pages/FollowUpForm.jsx` funcionará como wrapper de navegación y adaptación para la UI reutilizable del feature. La lógica del formulario pertenece a `src/features/follow-ups/ui/follow-up-form.tsx`, usando contratos de `src/features/follow-ups/domain/follow-up.types.ts` y validaciones de `src/features/follow-ups/domain/follow-up.validators.ts`.

El formulario tendrá estado controlado para los campos editables actuales del follow-up: `name`, `profileUrl` y `notes`. También mantendrá `status`, `createdAt`, `platform = linkedin` y, en edición, `id` como datos internos no editables. La vigencia (`expirationDate`) no se captura en el formulario: se calcula automáticamente como `createdAt + 6 meses` con utilidades de `src/shared/utils/date.ts` en cada payload y se muestra como una nota debajo de las notas.

Alternativa considerada: dividir creación y edición en vistas separadas. Se descarta porque ambos flujos comparten casi toda la UI y el contrato de guardado.

### Guardado mediante feature boundary y background runtime

La UI invocará el caso de uso `src/features/follow-ups/application/create-follow-up.ts` con el payload del follow-up. Cuando el guardado requiera coordinación con el background runtime, el caso de uso usará contratos de `src/shared/types/messages.ts` y helpers de `src/shared/chrome/messaging.ts` para enviar `FOLLOW_UP_SAVE_REQUESTED`. `src/runtimes/background/message-router.ts` recibirá el mensaje y hará `fetch("https://www.followups.com/api/create", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })`.

Si la respuesta es exitosa, el repositorio `src/features/follow-ups/infrastructure/follow-up.repository.ts` normalizará el resultado y actualizará storage mediante `src/shared/chrome/storage.ts`; si el endpoint no devuelve el follow-up completo, usará el payload local con `id` y timestamps.

Alternativa considerada: hacer el `fetch` directamente desde el popup. Se descarta para mantener la lógica de IO en background y seguir el patrón MV3 de comunicación entre contextos.

### Carga temporal de follow-ups desde el feature

`useDashboard` dejará de declarar mocks directamente. En su lugar, delegará a `src/features/follow-ups/application/list-follow-ups.ts`. Mientras no exista el fetch real de listado, ese caso de uso podrá devolver una lista temporal desde infraestructura del feature o solicitarla al background runtime mediante `FOLLOW_UPS_LIST_REQUESTED`.

La función temporal de mocks debe mantener el mismo shape del modelo de `FollowUp` y vivir en una capa reemplazable, no en el hook del runtime. Ese punto después se sustituirá por el fetch real de listado de follow-ups sin cambiar el contrato que consume el dashboard.

Alternativa considerada: conservar los mocks en el hook hasta crear el endpoint de listado. Se descarta porque el dashboard ya debe usar el mismo canal popup-background que usará producción, reduciendo cambios futuros cuando se agregue el fetch real.

### Actualización del dashboard

El guardado responderá con `{ ok: true, contacts }` tras actualizar storage. El popup actualizará el estado del dashboard o disparará un reload de `useDashboard` antes de volver a la lista. `useDashboard` debe cargar follow-ups mediante `list-follow-ups`, conservando fallback local solo si Chrome APIs no están disponibles durante desarrollo.

Alternativa considerada: recargar la ventana del popup. Se descarta porque rompe estado transitorio y produce una experiencia menos limpia.

### UI y accesibilidad

El formulario usará tokens CSS existentes, `bento-card`, controles compactos y botones con iconos de Lucide cuando aplique. Los botones estarán etiquetados con `aria-label`, el estado de guardado deshabilitará el botón primario y el error se renderizará dentro del formulario sin alertas del navegador.

Alternativa considerada: crear un layout visual nuevo para el formulario. Se descarta para mantener continuidad con el dashboard.

## Risks / Trade-offs

- Endpoint remoto no disponible o CORS/CSP bloqueado -> Agregar host permission/CSP necesaria y manejar cualquier error como fallo de guardado en UI.
- Service worker efímero -> Persistir resultado en `chrome.storage.local` antes de responder éxito.
- Mocks temporales divergen del modelo real -> Mantenerlos detrás de `list-follow-ups` con el mismo shape de `FollowUp` y usar ese punto como futura sustitución por fetch de listado.
- El endpoint `/api/create` también se usa para edición -> Enviar `id` y modo implícito cuando exista un follow-up; documentar que el backend debe interpretar payloads con `id` como actualización.
- Popup se cierra durante guardado -> El service worker no debe depender del estado del popup; si el fetch termina, debe persistir storage.
- Desarrollo fuera de Chrome -> Agregar wrappers o checks para que la UI pueda probarse sin romper cuando `chrome.runtime` no exista.
