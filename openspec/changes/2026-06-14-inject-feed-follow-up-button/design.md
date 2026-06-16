## Context

El proyecto ya tiene `hello-world.js` como content script para perfiles `/in/...`. Ese script detecta cambios de URL (SPA de LinkedIn), hace polling del DOM para localizar la barra de acciones y clona la estructura de slot de LinkedIn para insertar el botón con coherencia visual. El feed de LinkedIn (`/feed`) es una vista diferente: muestra un listado de publicaciones donde cada tarjeta de persona incluye un botón "Seguir". El challenge técnico es que el feed usa infinite scroll (carga tarjetas nuevas con `MutationObserver`) y las clases CSS de LinkedIn son obfuscadas y cambian con deploys.

## Goals / Non-Goals

**Goals:**
- Inyectar un botón "Add follow-up" junto al botón "Seguir" en cada tarjeta de publicación de persona en `/feed`.
- Manejar infinite scroll: procesar tarjetas nuevas que aparecen sin recargar la página.
- Evitar duplicar el botón si una tarjeta ya fue procesada.
- Respetar el estándar de diseño de LinkedIn: ghost pill button (border, rounded, ícono `+`, texto).
- El botón no dispara ninguna acción por ahora.

**Non-Goals:**
- No implementar interacción (click, apertura de formulario) en esta versión.
- No integrar con el popup ni con `chrome.storage` en esta fase.
- No cubrir otros tipos de publicaciones (empresas, anuncios, reposts sin autoría visible).
- No internacionalizar el selector más allá del label `aria-label^="Seguir a"`.

## Decisions

### Selector para identificar el botón "Seguir / Follow"

Usar `button:has(svg[id="add-small"])` como selector principal. LinkedIn asigna el atributo `id="add-small"` al SVG del ícono `+` dentro de los botones de seguir/conectar. Este ID pertenece al sistema de tokens de iconos de LinkedIn (design system), no al contenido visible, por lo que es completamente agnóstico al idioma de la interfaz (Español, Inglés, Francés, etc.).

El falso positivo más probable es el botón "Connect" de conexiones de 1.er grado, que también usa `add-small`. Esto se mitiga con la validación estructural en `injectIntoCard`: si el DOM 3 niveles arriba no cumple la estructura de slot esperada (`[data-display-contents="true"]`), la función retorna sin inyectar.

Alternativa descartada — `aria-label^="Seguir a"`: frágil ante cambios de idioma. Un usuario con LinkedIn en Inglés vería `aria-label="Follow [name]"`, lo que haría que el selector nunca coincidiera.

Alternativa descartada — clases CSS del botón: las clases de LinkedIn son obfuscadas y cambian con cada deploy.

### Punto de inyección

Navegar desde el botón "Seguir" hacia arriba tres niveles del DOM:
1. `.closest('[data-display-contents="true"]')` → wrapper interno que contiene el botón.
2. `.parentElement` → div intermedio con `componentkey`.
3. `.parentElement` → wrapper externo (`data-display-contents="true"`) que actúa como slot de acción.

Insertar el nuevo slot (`data-display-contents="true"`) como hermano inmediato después del wrapper externo, dentro del contenedor flex de acciones. Este patrón es idéntico al usado en `hello-world.js` para perfiles.

Alternativa considerada: insertar directamente como hermano del botón "Seguir". Se descarta porque rompe la estructura de slots de LinkedIn y puede afectar el layout flex.

### Deduplicación

Marcar cada botón "Seguir" ya procesado con `data-followup-feed-processed="1"` después de inyectar el slot. El query de nuevas tarjetas filtra los botones que ya tienen este atributo.

Alternativa considerada: marcar el slot inyectado y buscarlo al re-evaluar. Más complejo y propenso a falsos negativos si el DOM de LinkedIn recicla nodos.

### Manejo de infinite scroll

Instalar un único `MutationObserver` en `document.body` que ejecuta `processNewPosts()` con cada mutación de `childList/subtree`. `processNewPosts` ya filtra botones no procesados, por lo que llamadas frecuentes son idempotentes y baratas.

Alternativa considerada: polling con `setInterval`. Funciona pero consume CPU cuando no hay cambios; `MutationObserver` es reactivo y más eficiente.

### Scope de activación

Verificar `location.pathname.startsWith('/feed')` al inicio del boot y en cada mutación. Si el usuario navega fuera del feed (SPA), el observer sigue instalado pero `processNewPosts` no inyecta nada. Se wrappean `pushState` y `replaceState` para re-evaluar al navegar de vuelta al feed.

Alternativa considerada: desinstalar el observer al salir del feed. Añade complejidad de reconexión innecesaria; filtrar por pathname es suficiente.

### Estilo del botón

Replicar el estilo artdeco de LinkedIn para botones secundarios ghost: `border: 1px solid rgba(0,0,0,0.6)`, `border-radius: 1.6rem`, `padding: 5px 16px`, `font-weight: 600`, `color: rgba(0,0,0,0.6)`. Incluir ícono `+` (SVG add-small idéntico al de LinkedIn) y texto "Add follow-up". Hover: fondo `rgba(0,0,0,0.08)`, border transparente.

## Risks / Trade-offs

- **Cambios en el DOM de LinkedIn** → El selector `aria-label^="Seguir a"` es semántico pero LinkedIn podría cambiar el copy. Bajo riesgo a corto plazo.
- **Rendimiento del observer** → Observar `document.body` en infinite scroll puede ser frecuente. `processNewPosts` es O(n botones no procesados), que tiende a cero rápido. Aceptable.
- **Tarjetas sin botón "Seguir"** → Publicaciones de empresas, anuncios o reposts pueden no tener el selector. El código simplemente no inyecta nada en esos casos. Sin efecto colateral.
- **Dark mode de LinkedIn** → Los colores `rgba(0,0,0,...)` no se adaptan al dark mode. V1 no lo requiere; se extiende con media query o variable CSS en el futuro.
