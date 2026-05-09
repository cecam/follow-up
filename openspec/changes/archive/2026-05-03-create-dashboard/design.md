## Context

Follow-Up es una Chrome extension (Manifest V3) que permite guardar contactos de redes sociales con recordatorios de seguimiento. Actualmente el popup muestra la plantilla default de Vite+React. Reemplazaremos esta vista con el Dashboard principal, aplicando estrictamente el sistema de diseño **Bento Minimalist** y la arquitectura de carpetas definida en `architecture.md` y `agents.md`. La extensión opera sin backend (V1) usando `chrome.storage.local` detrás de wrappers compartidos. El popup tiene una dimensión fija de **400×600px**.

## Goals / Non-Goals

**Goals:**
- Construir el dashboard funcional con header, stats y lista de contactos.
- Aplicar el sistema de diseño bento (rejilla asimétrica, bordes sutiles, micro-animaciones).
- Implementar tarjetas colapsables con menú de acciones y alertas de caducidad.
- Consumir follow-ups mediante el boundary de `src/features/follow-ups/`, dejando `chrome.storage.local` encapsulado en infraestructura/repositorios y wrappers de `src/shared/chrome/`.
- Soporte nativo para **Dark Mode** usando los tokens de color oficiales.

**Non-Goals:**
- No se implementará el formulario de creación/edición de contactos (fuera de scope).
- No se conectará auth real — se usará un username mock para la UI.
- No se implementará la lógica de persistencia de borrado real en este paso.

## Decisions

### 1. Arquitectura de Componentes — Runtime + Features

**Decisión:** El dashboard vive como experiencia de runtime en `src/runtimes/popup/`, pero no debe concentrar reglas de negocio ni acceso directo a Chrome APIs.
- **Runtime page**: `src/runtimes/popup/pages/Dashboard.jsx` compone la pantalla y maneja navegación local del popup.
- **Runtime components**: `src/runtimes/popup/components/` contiene piezas específicas del shell del popup, como header y tarjetas de métricas.
- **Feature UI**: `src/features/follow-ups/ui/follow-up-list.tsx` y componentes relacionados renderizan la lista de seguimientos cuando la UI sea promovida al boundary de feature.
- **Application layer**: `src/features/follow-ups/application/list-follow-ups.ts` calcula la lista consumida por el dashboard.
- **Infrastructure**: `src/features/follow-ups/infrastructure/follow-up.repository.ts` encapsula lectura desde storage local.
- **Shared**: `src/shared/chrome/storage.ts`, `src/shared/types/messages.ts` y `src/shared/utils/date.ts` centralizan wrappers, contratos y utilidades reutilizables.

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

**Decisión:** Los objetos que consume el dashboard deben alinearse con el modelo de follow-up definido en `src/features/follow-ups/domain/follow-up.types.ts`:
- `platform`: Determinará el icono (LinkedIn/Instagram).
- `expirationDate`: Activará la alerta visual si `Date.now() - expirationDate` es menor a 7 días.

El runtime puede conservar un hook adaptador como `useDashboard()` para estado de carga y errores, pero ese hook debe delegar el listado a la capa de aplicación del feature, no definir mocks ni leer `chrome.storage.local` directamente.

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
| `src/runtimes/popup/hooks/useDashboard.js` | Adaptador de estado del dashboard que delega a `features/follow-ups`. |
| `src/features/follow-ups/domain/follow-up.types.ts` | Contrato de datos del follow-up usado por dashboard y formulario. |
| `src/features/follow-ups/application/list-follow-ups.ts` | Caso de uso para listar follow-ups y calcular datos de presentación. |
| `src/features/follow-ups/infrastructure/follow-up.repository.ts` | Persistencia local vía wrappers compartidos de Chrome storage. |
| `src/features/follow-ups/ui/follow-up-list.tsx` | UI reutilizable de lista cuando se extraiga del runtime popup. |
| `src/shared/chrome/storage.ts` | Wrapper de `chrome.storage.local`. |
| `src/shared/utils/date.ts` | Formato de fechas y cálculo de días restantes. |
