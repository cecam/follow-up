## Context

La app ya guarda follow-ups en `chrome.storage.local` mediante `src/features/follow-ups/infrastructure/follow-up.repository.ts`, expone los casos de uso desde `src/features/follow-ups/application/follow-up.service.ts` y renderiza dashboard/formulario desde `src/features/follow-ups/ui/`. El proyecto define que el plan gratuito permite hasta 10 contactos activos, pero la UI y el caso de uso de creacion todavia no aplican ese limite.

Para este cambio, "follow-up activo" se tratara como un registro pendiente que sigue vigente. Los follow-ups completados, expirados o eliminados no deben contar contra el limite de creacion.

## Goals / Non-Goals

**Goals:**
- Definir una constante compartida con el limite maximo de follow-ups activos: `10`.
- Calcular el conteo de follow-ups activos desde el dominio o capa de aplicacion, no con logica duplicada en componentes.
- Mostrar una alerta en el dashboard/lista cuando el usuario ya tenga 10 follow-ups activos.
- Permitir entrar al formulario de creacion aun con el limite alcanzado, pero mostrar la misma alerta y deshabilitar el boton primario de crear.
- Reforzar la regla en `createFollowUp` para que una creacion nueva no se persista si el limite fue alcanzado.
- Mantener edicion y eliminacion funcionando aun cuando el limite ya este alcanzado.

**Non-Goals:**
- No se implementara upgrade a Lifetime ni diferencias por plan.
- No se cambiara la persistencia local ni el storage key actual.
- No se agregara backend ni sincronizacion.
- No se modificara el limite de notas, expiracion ni validaciones no relacionadas.
- No se bloqueara la edicion de follow-ups existentes.

## Decisions

### Constante y helper de dominio

Agregar `FOLLOW_UP_ACTIVE_LIMIT = 10` en `src/features/follow-ups/domain/follow-up.constants.ts`. Agregar un helper pequeno, por ejemplo `isActiveFollowUp(followUp, now)` y/o `getActiveFollowUpCount(followUps, now)`, junto al dominio o servicio de follow-ups.

Esto evita que dashboard, formulario y servicio interpreten "activo" de forma distinta. La regla debe considerar activo a un follow-up con `status === 'pending'` y `expirationDate` mayor o igual al momento actual.

Alternativa considerada: contar simplemente `data.length` en UI. Se descarta porque incluiria completados o expirados y podria bloquear creaciones validas.

### Alerta compartida

Definir el mensaje de limite en una constante reutilizable, por ejemplo:

`Solo puedes tener 10 follow ups activos. Si necesitas agregar uno nuevo, debes eliminar uno.`

El dashboard mostrara esta alerta cuando `activeCount >= FOLLOW_UP_ACTIVE_LIMIT`. El formulario de creacion recibira `activeLimitReached` o `activeFollowUpCount` desde `App.tsx`/dashboard state y mostrara la misma alerta cuando no este en modo edicion.

Alternativa considerada: duplicar el texto en cada componente. Se descarta para evitar divergencias de copy y facilitar cambios futuros.

### Flujo de creacion con limite alcanzado

El boton del dashboard podra seguir abriendo el formulario de creacion. Al entrar, el formulario mostrara la alerta y deshabilitara el boton primario de crear. El usuario puede regresar y eliminar un follow-up desde la lista.

La UI no debe esconder la razon del bloqueo. Mostrar el formulario con el boton deshabilitado hace visible por que no se puede crear y mantiene el flujo solicitado por producto.

Alternativa considerada: bloquear el click del boton `+` en el dashboard. Se descarta porque el requerimiento pide que al entrar al formulario de creacion aparezca la misma alerta.

### Guard de aplicacion antes de persistir

`createFollowUp` debe obtener la lista actual con `getAllFollowUpsRepository()`, calcular activos y devolver `fail('ACTIVE_LIMIT_REACHED')` cuando el limite ya este alcanzado. Este guard aplica solo a creacion; `updateFollowUp` no debe bloquearse para permitir correcciones de registros existentes.

La UI de `useCreateFollowUp`/`FollowUpForm` traducira ese fallo al mismo mensaje visible. Esto cubre condiciones de carrera o llamadas directas al caso de uso aunque el boton este deshabilitado.

Alternativa considerada: validar solo en el formulario. Se descarta porque seria facil saltarse la regla desde otro entry point de creacion.

### Actualizacion tras eliminar

Cuando el usuario elimine un follow-up y `onFollowUpsChange` actualice la lista en `App.tsx`, el dashboard y cualquier proxima entrada al formulario deben recalcular el limite con los contactos nuevos. No se necesita recargar el popup.

Alternativa considerada: mantener un flag local independiente. Se descarta porque podria quedar desincronizado con storage o con la lista actual.

## Risks / Trade-offs

- Definicion ambigua de "activo" -> Usar `pending` y no expirado, alineado con las stats actuales de contactos activos no expirados.
- Desincronizacion entre UI y storage -> Recalcular desde la lista actual y reforzar en `createFollowUp` antes de persistir.
- Usuario en formulario mientras otra accion cambia la lista -> El guard de aplicacion evita guardar por encima del limite.
- Copy duplicado -> Centralizar el mensaje para dashboard y formulario.
- Tests dependientes de fecha -> Permitir inyectar `now` o aislar helper de conteo para pruebas deterministas.
