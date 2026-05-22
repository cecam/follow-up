## Why

Los usuarios del plan gratuito necesitan una regla clara cuando la lista de follow-ups activos llega al maximo permitido. Sin esta validacion, la UI puede permitir iniciar o intentar crear registros que despues no deberian guardarse.

## What Changes

- Agregar una constante de limite maximo de follow-ups activos permitidos en lista con valor `10`.
- Mostrar una alerta cuando la lista tenga 10 follow-ups activos indicando: "Solo puedes tener 10 follow ups activos. Si necesitas agregar uno nuevo, debes eliminar uno."
- Reutilizar la misma alerta al entrar al formulario de creacion cuando ya existan 10 follow-ups activos.
- Deshabilitar el boton de crear en el formulario de creacion cuando ya existan 10 follow-ups activos.
- Evitar que el flujo de creacion guarde un follow-up nuevo si el limite activo ya fue alcanzado.

## Capabilities

### New Capabilities
- `active-followup-limit`: Cubre el limite maximo de follow-ups activos, la alerta de limite alcanzado y el bloqueo de creacion cuando la lista ya contiene 10 follow-ups activos.

### Modified Capabilities
Ninguna.

## Impact

- `src/features/follow-ups/` para definir la constante compartida, calcular follow-ups activos y bloquear creaciones.
- `src/runtimes/popup/` para mostrar la alerta en dashboard/lista y pasar el estado de limite al formulario de creacion.
- UI del formulario de follow-up para mostrar la alerta y deshabilitar el boton de crear.
- Casos de uso y/o repositorio de follow-ups para reforzar la regla antes de guardar un nuevo registro.
- Pruebas o verificacion manual de lista con menos de 10, exactamente 10 y despues de eliminar un follow-up.
