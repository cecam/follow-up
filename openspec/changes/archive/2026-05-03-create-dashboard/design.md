## Context

Follow-Up es una Chrome extension (Manifest V3) que permite guardar contactos de redes sociales con recordatorios de seguimiento. Actualmente el popup muestra la plantilla default de Vite+React. Reemplazaremos esta vista con el Dashboard principal, aplicando estrictamente el sistema de diseño **Bento Minimalist** y la arquitectura de carpetas definida en `agents.md`. La extensión opera sin backend (V1) usando `chrome.storage.local`. El popup tiene una dimensión fija de **400×600px**.

## Goals / Non-Goals

**Goals:**
- Construir el dashboard funcional con header, stats y lista de contactos.
- Aplicar el sistema de diseño bento (rejilla asimétrica, bordes sutiles, micro-animaciones).
- Implementar tarjetas colapsables con menú de acciones y alertas de caducidad.
- Consumir datos de `chrome.storage.local` mediante el hook `useDashboard`.
- Soporte nativo para **Dark Mode** usando los tokens de color oficiales.

**Non-Goals:**
- No se implementará el formulario de creación/edición de contactos (fuera de scope).
- No se conectará auth real — se usará un username mock para la UI.
- No se implementará la lógica de persistencia de borrado real en este paso.

## Decisions

### 1. Arquitectura de Componentes — Feature-based

**Decisión:** Los componentes de UI del popup vivirán en `src/runtimes/popup/` para mantener la separación de entornos de ejecución de la extensión.
- **Pages**: `src/runtimes/popup/pages/Dashboard.jsx`
- **Components**: `src/runtimes/popup/components/`
- **Styles**: Uso de CSS Modules o Vanilla CSS referenciando tokens globales.

### 2. Sistema de Rejilla — Bento Grid Layout

**Decisión:** Usar las clases CSS definidas en `agents.md` para la estructura:
- Container principal: `.bento-grid` con `gap: 12px`.
- Tarjetas de Stats: `.bento-card` con hover states (`transform: translateY(-1px)`).
- Tarjetas de Contactos: `.bento-card--wide` para ocupar todo el ancho del popup.

### 3. Tokens de Color y Tipografía

**Decisión:** Uso exclusivo de variables CSS de `agents.md`:
- **Fondos**: `var(--color-bg-primary)` para el body, `var(--color-bg-elevated)` para tarjetas.
- **Bordes**: `var(--color-border-default)` con radio de `12px` para bento cards.
- **Texto**: `var(--color-text-primary)` (heading: 18px), `var(--color-text-secondary)` (body: 13px).
- **Acento**: `var(--color-accent)` (#3B82F6) para botones y estados activos.
- **Tipografía**: Fuente **Inter** (weights 400, 500, 600).

### 4. Interactividad y Micro-animaciones

**Decisión:** Implementar transiciones de **200-300ms ease** en:
- Hover de tarjetas (`box-shadow: var(--shadow-md)`).
- Apertura/cierre de colapsables (usando el evento `toggle` de `<details>`).
- Dropdowns de acciones.

### 5. Estructura de Datos y Modelado

**Decisión:** El hook `useDashboard()` retornará objetos que cumplan con el modelo `Contact` definido en `project.md`:
- `platform`: Determinará el icono (LinkedIn/Instagram).
- `expirationDate`: Activará la alerta visual si `Date.now() - expirationDate` es menor a 7 días.

## Risks / Trade-offs

- **Limitación de Espacio (400px)**: El bento grid de 2 columnas para stats debe ser preciso. Se usará `grid-template-columns: repeat(2, 1fr)`.
- **Dark Mode**: Se requiere asegurar que `data-theme="dark"` se propague correctamente en el root del popup para activar los overrides de variables.
- **Details/Summary Styling**: Para mantener el look "premium", se ocultará el marcador por defecto (`::-webkit-details-marker`) y se usará un icono de Lucide rotado con CSS.

## Archivos a Crear/Modificar

| Archivo | Responsabilidad |
|---------|-----------------|
| `src/index.css` | Inyectar todos los tokens de `agents.md`. |
| `src/runtimes/popup/pages/Dashboard.jsx` | Composición bento de la vista. |
| `src/runtimes/popup/components/DashboardHeader.jsx` | Header con `var(--color-bg-secondary)`. |
| `src/runtimes/popup/components/StatsCards.jsx` | Grid de métricas. |
| `src/runtimes/popup/components/ContactCard.jsx` | Tarjeta colapsable `.bento-card--wide`. |
| `src/runtimes/popup/hooks/useDashboard.js` | Lógica de filtrado y estados. |
