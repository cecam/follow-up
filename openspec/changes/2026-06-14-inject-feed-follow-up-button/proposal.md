## Why

Los usuarios deben poder agregar un follow-up desde cualquier punto de contacto lógico con otras personas. El perfil individual ya cuenta con este botón (hello-world.js). El feed de publicaciones (`/feed`) es la fuente principal de descubrimiento de contactos en LinkedIn y actualmente no expone ningún punto de entrada para crear un follow-up.

## What Changes

- Crear un nuevo content script `src/runtimes/content/linkedin-feed-injector.js` que inyecte un botón "Add follow-up" en cada tarjeta de publicación de persona en el feed de LinkedIn.
- El botón se coloca junto al botón "Seguir" existente, respetando el estándar de diseño de LinkedIn (ghost pill button con ícono).
- El botón no tiene interacción en esta versión: solo se renderiza.
- El script maneja infinite scroll mediante `MutationObserver` para procesar nuevas tarjetas que aparecen al desplazarse.
- Registrar el nuevo script en `manifest.json` para que se cargue junto al script existente en `https://www.linkedin.com/*`.

## Capabilities

### New Capabilities
- `feed-follow-up-button`: Inyección del botón "Add follow-up" en tarjetas de publicación de persona en el feed de LinkedIn.

### Modified Capabilities
Ninguna.

## Impact

- `src/runtimes/content/linkedin-feed-injector.js` — archivo nuevo con toda la lógica de detección e inyección.
- `manifest.json` — agregar el nuevo archivo JS al array `js` del entry de content_scripts existente.
