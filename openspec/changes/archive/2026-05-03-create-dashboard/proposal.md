## Why

La extensión actualmente carece de una interfaz de usuario funcional para que los usuarios gestionen sus contactos. Necesitamos implementar el Dashboard principal, que servirá como centro de control para que los usuarios visualicen sus seguimientos, monitoreen fechas de vencimiento y accedan a acciones de gestión. Esta implementación debe alinearse estrictamente con los estándares de diseño y arquitectura definidos en `architecture.md` y `agents.md`, además de los requerimientos funcionales de `project.md`.

## What Changes

- **Dashboard Principal**: Implementación de la vista principal del popup optimizada para `400x600px`.
- **Alineación Arquitectónica**: El dashboard vive como runtime UI en `src/runtimes/popup/`, mientras que la lógica de seguimiento, perfiles, recordatorios y wrappers de Chrome se delega a `src/features/` y `src/shared/` según `architecture.md`.
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

- **Arquitectura**: Implementación siguiendo la arquitectura definida en `architecture.md` y `agents.md`: `src/runtimes/popup/` contiene la experiencia React del popup, `src/features/follow-ups/` concentra dominio, casos de uso, repositorio y componentes reutilizables de seguimientos, `src/features/profiles/` resuelve detección de perfiles, `src/features/reminders/` agenda y procesa recordatorios, y `src/shared/` centraliza wrappers de Chrome, tipos y utilidades.
- **UI/UX**: Transición de la plantilla por defecto a una interfaz premium con soporte nativo para **Dark Mode**.
- **Storage**: Consumo de `chrome.storage.local` mediante wrappers en `src/shared/chrome/storage.ts` y repositorios de feature como `src/features/follow-ups/infrastructure/follow-up.repository.ts`.
- **Dependencias**: Uso de `lucide-react` para iconografía consistente con el estilo de trazo ligero.
