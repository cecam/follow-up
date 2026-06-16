## ADDED Requirements

### Requirement: El script solo actúa en el feed de LinkedIn
El content script SHALL activar su lógica de inyección únicamente cuando `location.pathname` comience con `/feed`.

#### Scenario: Navegación en el feed
- **WHEN** el usuario está en `https://www.linkedin.com/feed/`
- **THEN** el script procesa las tarjetas visibles e instala el observer

#### Scenario: Navegación fuera del feed
- **WHEN** el usuario navega a cualquier otra ruta (perfil, jobs, etc.)
- **THEN** el script no inyecta ningún botón

---

### Requirement: Cada tarjeta de publicación de persona recibe el botón
El script SHALL inyectar un botón "Add follow-up" en cada tarjeta del feed que contenga un botón con el ícono `add-small` (`button:has(svg[id="add-small"])`), independientemente del idioma de la interfaz de LinkedIn.

#### Scenario: Tarjeta con botón Seguir / Follow (cualquier idioma)
- **WHEN** el DOM contiene un `button:has(svg[id="add-small"])` no procesado con la estructura de slot correcta a 3 niveles arriba
- **THEN** el script inserta un slot con el botón "Add follow-up" como hermano inmediato del wrapper externo del botón

#### Scenario: Tarjeta sin botón de seguir (empresa, anuncio)
- **WHEN** una tarjeta no contiene `button:has(svg[id="add-small"])` o la estructura de slots no coincide
- **THEN** el script no inyecta nada en esa tarjeta

---

### Requirement: No se duplica el botón en tarjetas ya procesadas
El script SHALL marcar cada botón "Seguir" procesado para evitar inyecciones repetidas.

#### Scenario: Tarjeta procesada reevaluada por el observer
- **WHEN** el `MutationObserver` dispara y la tarjeta ya tiene `data-followup-feed-processed="1"` en su botón "Seguir"
- **THEN** el script no inserta un segundo botón en esa tarjeta

---

### Requirement: Infinite scroll — tarjetas nuevas son procesadas
El script SHALL detectar automáticamente las tarjetas que carga LinkedIn al hacer scroll y procesarlas.

#### Scenario: Nuevas tarjetas aparecen en el DOM
- **WHEN** LinkedIn agrega nuevos nodos de tarjeta al feed (scroll)
- **THEN** el `MutationObserver` dispara `processNewPosts()`
- **AND** los nuevos botones "Seguir a" no procesados reciben el slot "Add follow-up"

---

### Requirement: El botón sigue el estilo artdeco de LinkedIn
El botón inyectado SHALL visualmente coincidir con el estilo ghost pill button de LinkedIn.

#### Scenario: Renderizado del botón
- **WHEN** el botón "Add follow-up" se renderiza
- **THEN** tiene `border-radius: 1.6rem`, borde `1px solid rgba(0,0,0,0.6)`, fondo transparente, peso de fuente 600 y ícono SVG `+` a la izquierda del texto "Add follow-up"

#### Scenario: Hover sobre el botón
- **WHEN** el cursor está sobre el botón
- **THEN** el fondo cambia a `rgba(0,0,0,0.08)`, el borde se vuelve transparente y el texto oscurece a `rgba(0,0,0,0.9)`

---

### Requirement: El botón no tiene interacción al hacer click
El botón SHALL estar presente en el DOM pero no ejecutar ninguna acción cuando se hace click.

#### Scenario: Click sobre el botón
- **WHEN** el usuario hace click en "Add follow-up"
- **THEN** no ocurre ninguna acción (sin formulario, sin navegación, sin mensaje)

---

### Requirement: El script maneja navegación SPA
El script SHALL reaccionar a cambios de ruta en la SPA de LinkedIn sin recargar la página.

#### Scenario: Usuario navega al feed desde otra ruta
- **WHEN** LinkedIn llama a `history.pushState` o `history.replaceState` con una ruta `/feed`
- **THEN** `boot()` se re-ejecuta y procesa las tarjetas visibles

#### Scenario: Usuario navega fuera del feed
- **WHEN** LinkedIn llama a `history.pushState` con una ruta distinta de `/feed`
- **THEN** no se inyectan botones nuevos
