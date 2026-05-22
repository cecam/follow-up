## 1. Setup y Design Tokens

- [x] 1.1 Instalar `lucide-react` como dependencia
- [x] 1.2 Actualizar `src/index.css` con los design tokens del bento minimalist system (color tokens, typography scale, shadows, border-radius) definidos en agents.md
- [x] 1.3 Crear la estructura de runtime para el popup: `src/runtimes/popup/pages/`, `src/runtimes/popup/components/`, `src/runtimes/popup/hooks/`
- [x] 1.4 Alinear la documentación del feature con la arquitectura `src/features/follow-ups/` + `src/shared/` definida en `architecture.md`

## 2. Hook de datos del Dashboard

- [x] 2.1 Crear `src/runtimes/popup/hooks/useDashboard.js` con datos mock de contactos que matcheen el data model de `project.md` (id, name, profileUrl, platform, notes, createdAt, expirationDate)
- [x] 2.2 Implementar la lógica de cálculo de stats (total activos, por caducar ≤7 días) dentro del hook
- [x] 2.3 Exportar username mock y estados de loading/error desde el hook
- [x] 2.4 Documentar que `useDashboard` es un adaptador temporal de runtime y debe delegar el listado real a `src/features/follow-ups/application/list-follow-ups.ts`

## 3. Componente DashboardHeader

- [x] 3.1 Crear `src/runtimes/popup/components/DashboardHeader.jsx` con saludo "Bienvenido de nuevo {username}" y subtítulo
- [x] 3.2 Implementar el botón de engrane con dropdown (Editar perfil, Cerrar sesión) usando useState para toggle
- [x] 3.3 Implementar cierre del dropdown al hacer click fuera con useEffect + event listener
- [x] 3.4 Estilizar el header siguiendo el design system: Inter font, color tokens, spacing rhythm

## 4. Componente StatsCards

- [x] 4.1 Crear `src/runtimes/popup/components/StatsCards.jsx` con dos tarjetas bento side-by-side
- [x] 4.2 Implementar tarjeta "Total contactos" con icono de lucide-react y valor numérico
- [x] 4.3 Implementar tarjeta "Por caducar" con icono de reloj/expiración y warning color cuando count > 0
- [x] 4.4 Aplicar estilos bento-card: border-radius 12px, hover elevation, subtle border, padding 16px

## 5. Componente ContactCard

- [x] 5.1 Crear `src/runtimes/popup/components/ContactCard.jsx` usando `<details>/<summary>` nativo
- [x] 5.2 Implementar el header colapsable: nombre del contacto (izquierda), fecha de vigencia formateada DD/MM/YYYY
- [x] 5.3 Implementar el indicador de alerta de caducidad: warning icon cuando ≤7 días, error color cuando es hoy
- [x] 5.4 Implementar el botón de 3 puntos (⋮) con `stopPropagation` para evitar toggle del colapsable
- [x] 5.5 Implementar contenido expandido: enlace clickeable (abre en nueva tab), nota del contacto, días restantes

## 6. Componente ActionMenu

- [x] 6.1 Crear `src/runtimes/popup/components/ActionMenu.jsx` como dropdown posicionado con position absolute
- [x] 6.2 Implementar opciones "Editar" y "Borrar" con iconos de lucide-react
- [x] 6.3 Implementar lógica de cierre al click fuera y de solo un menú abierto a la vez

## 7. Componente ContactList

- [x] 7.1 Crear `src/runtimes/popup/components/ContactList.jsx` que renderiza el array de contactos como ContactCards
- [x] 7.2 Implementar scroll vertical suave con overflow-y auto en el container
- [x] 7.3 Documentar la migración objetivo de la lista reutilizable hacia `src/features/follow-ups/ui/follow-up-list.tsx`

## 8. Página Dashboard y ensamblaje

- [x] 8.1 Crear `src/runtimes/popup/pages/Dashboard.jsx` que compone DashboardHeader + StatsCards + ContactList
- [x] 8.2 Crear `src/runtimes/popup/pages/Dashboard.css` con layout vertical y spacing entre secciones
- [x] 8.3 Actualizar `src/App.jsx` para renderizar el Dashboard en lugar del contenido default de Vite

## 9. Dark mode y polish

- [x] 9.1 Agregar CSS custom properties para dark mode (tokens de `agents.md`)
- [x] 9.2 Añadir micro-animaciones: transición suave en expand/collapse, hover states en cards y botones
- [x] 9.3 Verificar que el layout funciona correctamente en 400×600px (dimensiones del popup)
- [x] 9.4 Verificar que no hay contenido cortado (clipping) en los dropdowns cerca del borde inferior
