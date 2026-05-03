# Project: Follow-Up — Chrome Extension

## Overview

Follow-Up es una extensión de Chrome que te permite dar seguimiento a los perfiles de redes sociales que visitas. Cuando encuentras a alguien en LinkedIn o Instagram que puede ayudarte a conseguir un trabajo, una entrevista, una reunión o cerrar una venta, Follow-Up te permite guardar ese perfil con un recordatorio para contactarlo por mensaje o llamada.

El objetivo es que nunca pierdas una conexión valiosa por olvidar hacer seguimiento.

## Main Features

- **Detección de perfil:** Detecta automáticamente cuando visitas un perfil de LinkedIn o Instagram y ofrece la opción de guardarlo
- **Guardar contacto:** Registra el nombre, URL del perfil, red social, y notas personales del contacto
- **Recordatorios:** Programa recordatorios para contactar a la persona (por mensaje o llamada) en una fecha/hora específica
- **Lista de follow-ups:** Vista principal con todos los contactos pendientes de seguimiento, organizados por prioridad o fecha
- **Marcar como completado:** Marca un follow-up como realizado cuando ya contactaste a la persona
- **Búsqueda y filtros:** Filtra contactos por red social, estado (pendiente/completado) y fecha
- **Notificaciones:** Recibe alertas del navegador cuando es momento de hacer un follow-up
- **Límite por plan:** Plan gratuito permite hasta 10 contactos activos; plan Lifetime sin límite
- **Compra Lifetime:** Pasarela de pago Stripe para adquirir el plan Lifetime (pago único)
- **Loading y empty states:** Estados de carga y pantallas vacías con guía para el usuario

## User Behavior

- El usuario instala la extensión y crea una cuenta (email/password)
- Al visitar un perfil de LinkedIn o Instagram, aparece un indicador para guardar el contacto
- El usuario abre el popup para ver su lista de follow-ups y programar recordatorios
- Recibe notificaciones de Chrome cuando es momento de hacer seguimiento
- Marca contactos como "contactado" al completar el follow-up
- Si alcanza el límite de 10 contactos (plan gratuito), se le ofrece upgradeear a Lifetime
- Al comprar Lifetime, el pago se procesa por Stripe y se desbloquean contactos ilimitados

## Tech Stack

- **Runtime:** Chrome Extension (Manifest V3)
- **Bundler:** Vite 8 + @crxjs/vite-plugin
- **UI:** React 19
- **Styling:** Vanilla CSS (custom properties, bento grid layout)
- **Storage:** chrome.storage.local (cero backend)
- **Background:** Service Worker (event-driven)
- **Pagos:** Stripe Checkout (pago único Lifetime)
- **Font:** Inter (self-hosted)
- **Icons:** Lucide React

## Design Goals

- Layout de **bento grid** con tarjetas asimétricas
- Paleta de colores **minimalista** y neutral (blancos, grises, negro)
- Un solo color de acento para acciones primarias
- Tipografía limpia con **Inter**
- Micro-animaciones sutiles en hover y transiciones
- Soporte para **dark mode**
- Diseño compacto optimizado para popup de extensión (400×600px)
- Estados vacíos ilustrados para guiar al usuario

## Data Model

### Contact (Follow-Up)

| Campo         | Tipo     | Descripción                                    |
| ------------- | -------- | ---------------------------------------------- |
| `id`          | string   | UUID generado localmente                       |
| `name`        | string   | Nombre del contacto                            |
| `profileUrl`  | string   | URL del perfil (LinkedIn o Instagram)          |
| `platform`    | enum     | `linkedin` \| `instagram`                      |
| `notes`       | string   | Notas personales sobre el contacto             |
| `reason`      | enum     | `job` \| `interview` \| `meeting` \| `sale`    |
| `contactVia`  | enum     | `message` \| `call`                            |
| `reminderAt`  | datetime | Fecha/hora del próximo recordatorio            |
| `status`      | enum     | `pending` \| `completed`                       |
| `createdAt`   | datetime | Fecha de creación                              |
| `completedAt` | datetime | Fecha en que se completó el follow-up (si aplica) |
| `expirationDate` | datetime | Fecha máxima de vigencia (creación + máx 6 meses) |

### User Preferences

| Campo       | Tipo   | Descripción                                  |
| ----------- | ------ | -------------------------------------------- |
| `plan`      | enum   | `free` \| `lifetime`                         |
| `theme`     | enum   | `light` \| `dark` \| `system`                |
| `email`     | string | Email del usuario autenticado                |
| `username`  | string | Nombre del usuario para el saludo            |
| `createdAt` | datetime | Fecha de registro                          |

## Dashboard UI Requirements

### Dashboard Structure & Layout
- **Dimensiones:** Contenedor fijo de 400×600px optimizado para popup.
- **Secciones:** Header fijo (saludo + configuración), Stats Cards (métricas rápidas), y Contact List (lista con scroll).
- **Layout:** Sistema de **bento grid** con tarjetas asimétricas y bordes redondeados (12px).
- **Navegación:** Scroll vertical suave únicamente en la lista de contactos; header y stats permanecen estáticos.

### Header Components
- **Bienvenida:** Saludo dinámico "Bienvenido de nuevo {username}" con subtítulo informativo.
- **Botón Agregar:** Icono "+" destacado para acceso rápido a la creación de contactos.
- **Menú Configuración:** Icono de engrane con dropdown para "Editar perfil" y "Cerrar sesión".

### Stats Cards
- **Total contactos:** Muestra el conteo de contactos activos no expirados.
- **Por caducar:** Muestra el conteo de contactos con vigencia ≤ 7 días. Usa el color de advertencia (`--color-warning`) cuando el conteo es > 0.

### Contact Card (Collapsible)
- **Estado Inicial:** Renderizado como colapsable nativo (`<details>`), cerrado por defecto.
- **Header del Card:** Muestra Nombre, Fecha de vigencia (DD/MM/YYYY), Indicador de alerta (si caduca pronto) y Menú de acciones (⋮).
- **Contenido Expandido:**
  - Enlace directo al perfil (LinkedIn/Instagram) con contador de días restantes.
  - Bloque de notas estilizado con fondo diferenciado.
- **Alertas de Expiración:**
  - Icono de advertencia naranja cuando quedan ≤ 7 días.
  - Icono de error rojo cuando la vigencia es el día de hoy o ha expirado.
- **Menú de Acciones:** Dropdown con opciones para "Editar" y "Borrar" el contacto.

### Functional Constraints
- **Vigencia Máxima:** Todo contacto tiene una fecha de expiración máxima de 6 meses desde su creación.
- **Tratamiento de Notas:** Límite máximo de 255 caracteres para las notas personales.

## Storage Architecture (V1)

```
chrome.storage.local
├── user_prefs          → { plan, theme, email, createdAt }
├── contacts            → Contact[]  (array de follow-ups)
├── auth_session        → { email, token, expiresAt }
└── stripe_purchase     → { sessionId, status, purchasedAt }
```

- **Sin backend.** Todo vive en `chrome.storage.local` y el Service Worker
- Las queries se hacen directamente sobre el array de contactos en storage
- Los recordatorios se programan con `chrome.alarms`
- Las notificaciones se disparan con `chrome.notifications`

## User Flows

### 1. Registro & Login
```
Abrir popup → Pantalla de login → Crear cuenta (email/password)
→ Guardar sesión en storage → Mostrar dashboard vacío
```

### 2. Guardar un Contacto
```
Visitar perfil en LinkedIn/Instagram → Content script detecta la URL
→ Click en icono de extensión o badge → Formulario pre-llenado con datos del perfil
→ Agregar notas, razón, tipo de contacto, fecha de recordatorio
→ Guardar en chrome.storage.local
```

### 3. Recibir Recordatorio
```
chrome.alarms dispara alarma → Service Worker la intercepta
→ Muestra chrome.notification con nombre y razón
→ Click en notificación abre el popup con el contacto
```

### 4. Comprar Lifetime
```
Dashboard → Banner de upgrade o Settings → Pricing
→ Click "Comprar Lifetime" → Abre nueva pestaña con Stripe Checkout
→ Pago exitoso → Stripe redirige a success URL
→ Background service worker detecta → Actualiza plan en storage
```

## Scope Limitations (V1)

- **Sin backend** — Todo almacenamiento es local (`chrome.storage.local`)
- **Sin sincronización** entre dispositivos (esto es V2 con Supabase)
- **Solo LinkedIn e Instagram** — no X/Twitter, no Facebook
- **Solo popup** — no side panel ni opciones page (por ahora)
- **Autenticación local** — sin OAuth providers, solo email/password local
- **Sin export/import** de contactos
- **Sin analytics** de follow-ups

## Roadmap — V2 (Futuro)

- **Persistencia en la nube** con Supabase (PostgreSQL + RLS)
- **Sincronización entre dispositivos** para usuarios Lifetime
- **Backup automático** de la lista de contactos
- **OAuth login** (Google, GitHub) vía Supabase Auth
- **Detección de X (Twitter)** y otras redes
- **Exportar contactos** a CSV
- **Side panel** para vista expandida sin popup
- **Estadísticas** de seguimientos realizados

## Subscription Plans

| Característica         | Gratuito     | Lifetime ($) |
| ---------------------- | ------------ | ------------ |
| Contactos activos      | Hasta 10     | Ilimitados   |
| Recordatorios          | ✅            | ✅            |
| Notificaciones         | ✅            | ✅            |
| Dark mode              | ✅            | ✅            |
| Backup en la nube      | ❌            | ✅ (V2)       |
| Sync entre dispositivos| ❌            | ✅ (V2)       |
| Pago                   | Gratis       | Único        |
