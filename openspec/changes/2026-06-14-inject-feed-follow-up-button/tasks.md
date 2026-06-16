## 1. Content Script — linkedin-feed-injector.js

- [x] 1.1 Crear `src/runtimes/content/linkedin-feed-injector.js`.
- [x] 1.2 Implementar `isLinkedInFeed()` que retorna `true` solo cuando `location.pathname` comienza con `/feed`.
- [x] 1.3 Implementar `findUnprocessedFollowButtons()` que retorna todos los `button[aria-label^="Seguir a"]` sin el atributo `data-followup-feed-processed`.
- [x] 1.4 Implementar `buildFeedFollowUpButton()` que crea el elemento `<button>` con estilo artdeco ghost pill (borde, border-radius, font-weight, color, ícono SVG `+`, texto "Add follow-up") y sus estados hover/mouseleave.
- [x] 1.5 Implementar `injectIntoCard(seguirBtn)` que navega 3 niveles arriba del botón "Seguir" para encontrar el wrapper externo `[data-display-contents="true"]`, crea un slot hermano y le añade el botón. Marca el `seguirBtn` con `data-followup-feed-processed="1"` al terminar.
- [x] 1.6 Implementar `processNewPosts()` que solo actúa si `isLinkedInFeed()` y llama `injectIntoCard` sobre cada botón no procesado.
- [x] 1.7 Implementar `installFeedObserver()` que instala un único `MutationObserver` en `document.body` con `{ childList: true, subtree: true }` que llama `processNewPosts()`.
- [x] 1.8 Implementar `boot()` que verifica `isLinkedInFeed()`, instala el observer y llama `processNewPosts()`.
- [x] 1.9 Wrappear `history.pushState` y `history.replaceState` (con flag `__followUpFeedWrapped`) para llamar `boot()` con `setTimeout(..., 300)` tras cada navegación SPA.
- [x] 1.10 Escuchar `popstate` para llamar `boot()` con el mismo delay.
- [x] 1.11 Disparar `boot()` en `DOMContentLoaded` si el documento aún está cargando, o inmediatamente si ya está listo.

## 2. Manifest

- [x] 2.1 Agregar `"src/runtimes/content/linkedin-feed-injector.js"` al array `js` del content script entry existente en `manifest.json`.

## 3. Verificación

- [ ] 3.1 Abrir `https://www.linkedin.com/feed/` y verificar que cada tarjeta de persona muestra el botón "Add follow-up" junto al "Seguir".
- [ ] 3.2 Hacer scroll para cargar nuevas tarjetas y verificar que el botón aparece también en las nuevas.
- [ ] 3.3 Verificar que no hay duplicación al hacer scroll y volver a pasar por tarjetas ya procesadas.
- [ ] 3.4 Navegar a un perfil `/in/...` y confirmar que el feed-injector no inyecta nada fuera del feed.
- [ ] 3.5 Hacer click en el botón y confirmar que no ocurre ninguna acción.
