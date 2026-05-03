## Why

La extensión actualmente carece de una interfaz de usuario funcional para que los usuarios gestionen sus contactos. Necesitamos implementar el Dashboard principal, que servirá como centro de control para que los usuarios visualicen sus seguimientos, monitoreen fechas de vencimiento y accedan a acciones de gestión. Esta implementación debe alinearse estrictamente con los estándares de diseño y arquitectura definidos en `agents.md` y los requerimientos funcionales de `project.md`.

## What Changes

- **Dashboard Principal**: Implementación de la vista principal del popup optimizada para `400x600px`.
- **Sistema de Diseño Bento Minimalist**: Aplicación rigurosa de la paleta neutral (`#FAFAFA`, `#171717`, etc.), tipografía Inter y micro-animaciones (200-300ms) especificadas en `agents.md`.
- **Header de Usuario**: Saludo personalizado "Bienvenido de nuevo {username}", subtítulo informativo y menú de configuración (engrane) con opciones de "Editar perfil" y "Cerrar sesión".
- **Tarjetas de Estadísticas (Bento Grid)**: Visualización de métricas clave (Total de contactos y Contactos por caducar) usando el sistema de rejilla asimétrica.
- **Lista de Contactos Colapsables**:
    - Cada tarjeta será un componente `<details>/<summary>` (según `design.md`).
    - **Header**: Nombre, fecha de vigencia, alerta de expiración (≤7 días) y menú contextual de 3 puntos (Editar/Borrar).
    - **Contenido**: Enlace de origen, nota personal (límite 255 caracteres) y contador de días restantes.
- **Gating de Funciones**: Preparación de la UI para el límite de 10 contactos del plan gratuito especificado en `project.md`.

## Capabilities

### New Capabilities
- `dashboard-layout`: Estructura bento-grid del popup (`400x600px`) con header fijo y scroll vertical.
- `contact-collapsible`: Componente de tarjeta de contacto con estados expandido/colapsado y lógica de alerta de caducidad.
- `stats-summary`: Visualización de métricas de seguimiento integradas en la rejilla bento.
- `user-navigation`: Menú de acciones de cuenta y navegación contextual.

### Modified Capabilities
_Ninguna — se establecen las bases iniciales del dashboard._

## Impact

- **Arquitectura**: Implementación siguiendo la "Feature-based architecture" definida en `agents.md` (`src/runtimes/popup/`).
- **UI/UX**: Transición de la plantilla por defecto a una interfaz premium con soporte nativo para **Dark Mode**.
- **Storage**: Consumo de `chrome.storage.local` para los modelos `Contact` y `UserPreferences` definidos en `project.md`.
- **Dependencias**: Uso de `lucide-react` para iconografía consistente con el estilo de trazo ligero.
