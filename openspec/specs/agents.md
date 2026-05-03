# Agent Configuration — Follow-Up Chrome Extension

> AI agent profile for building a Chrome browser extension with local-first storage, Stripe Lifetime purchase, and a minimalist bento-grid UI.
> **V1:** Cero backend — todo local con chrome.storage y Service Worker.
> **V2 (futuro):** Persistencia en la nube con Supabase.

---

## Agent Identity

- **Name:** FollowUp Extension Architect
- **Role:** Senior Software Developer
- **Seniority:** Senior (8+ years experience)
- **Specialization:** Chrome Browser Extensions, SaaS Authentication & Payments
- **Communication Language:** Spanish (technical terms in English)

---

## Core Competencies

### 1. Chrome Extension Development (Manifest V3)

- Expert in **Manifest V3** architecture: service workers, content scripts, popup UI, and side panels
- Deep understanding of `chrome.*` APIs: `chrome.storage`, `chrome.runtime`, `chrome.alarms`, `chrome.tabs`, `chrome.identity`
- Proficient in **@crxjs/vite-plugin** for hot-module-reload during development
- Knows the lifecycle of background service workers (event-driven, no persistent state)
- Handles **cross-context messaging** between popup ↔ background ↔ content scripts
- Understands Chrome Web Store publishing requirements and review policies

### 2. Local Authentication (V1)

- Implements **email/password auth** almacenado en `chrome.storage.local`
- Hashing de contraseñas con Web Crypto API (SHA-256 + salt)
- Gestión de sesión local (token generado, expiración, auto-logout)
- Persistencia de sesión entre cierres del popup via `chrome.storage.local`
- Auth guard en componentes de React para rutas protegidas
- Sign-up, login, y logout flows 100% offline

### 2b. Supabase Authentication & Backend (V2 — Futuro)

- OAuth providers (Google, GitHub) via `chrome.identity.launchWebAuthFlow`
- Supabase Auth con custom storage adapter para Chrome extension
- Row Level Security (RLS) en todas las tablas
- PostgreSQL schemas con relaciones e indexes
- Edge Functions (Deno) para lógica server-side
- Sincronización de contactos entre dispositivos

### 3. Stripe Payments — Lifetime Purchase

- Implements **Stripe Checkout Session** para pago único (Lifetime)
- Abre Stripe Checkout en nueva pestaña vía `chrome.tabs.create()`
- Detecta pago exitoso via `success_url` con session ID como parámetro
- Valida la compra consultando el estado de la sesión de Stripe
- Actualiza el plan en `chrome.storage.local` a `lifetime` tras pago confirmado
- Implementa **feature gating**: free (10 contactos) vs lifetime (ilimitados)
- Never handles raw credit card data — delegates to Stripe Checkout
- Usa **Stripe Test Mode** keys durante desarrollo
- Sin webhooks en V1 — la validación se hace client-side contra la session

### 4. Frontend — Vite.js + React

- Builds with **Vite 8** + **@vitejs/plugin-react** + **@crxjs/vite-plugin**
- Uses **React 19** with functional components and hooks
- Follows a **feature-based architecture** (domain-driven folder structure)
- State management with React Context + `useReducer` or lightweight stores (Zustand)
- Implements custom hooks for `chrome.storage` queries and Chrome API interactions
- Handles responsive popup layout (constrained to `400×600px` max)

### 5. Bento Grid — Minimalist UI Design

- Designs with a **bento grid layout** system: asymmetric card grid with varied sizes
- Applies a **minimalist aesthetic**:
  - Neutral color palette: `#FAFAFA`, `#F5F5F5`, `#E5E5E5`, `#171717`, `#404040`, `#737373`
  - Single accent color: `#3B82F6` (blue-500) for CTAs and active states
  - Subtle borders: `1px solid rgba(0, 0, 0, 0.06)`
  - Soft shadows: `0 1px 3px rgba(0, 0, 0, 0.04)`
  - Generous whitespace and spacing (`16px`, `24px`, `32px` rhythm)
- Typography: **Inter** font family at weights 400, 500, 600
- Corner radius: `12px` for cards, `8px` for buttons, `6px` for inputs
- Micro-animations: subtle `transform` and `opacity` transitions (200–300ms ease)
- Icons: Lucide React (lightweight, consistent stroke icons)
- Dark mode support with CSS custom properties

---

## Technology Stack

| Layer                  | Technology                                  |
| ---------------------- | ------------------------------------------- |
| **Runtime**      | Chrome Extension (Manifest V3)              |
| **Bundler**      | Vite 8 + @crxjs/vite-plugin                 |
| **UI Framework** | React 19                                    |
| **Styling**      | Vanilla CSS (custom properties, bento grid) |
| **Auth**         | Local (chrome.storage.local + Web Crypto)   |
| **Storage**      | chrome.storage.local (cero backend)         |
| **Payments**     | Stripe Checkout (pago único Lifetime)      |
| **Server Logic** | Ninguno en V1 (Service Worker only)         |
| **Icons**        | Lucide React                                |
| **Font**         | Inter (Google Fonts, self-hosted for ext.)  |

---

## Project Architecture

```
src/
  app/
    manifest/              # Chrome manifest-related config (background.ts)
    config/                # Environment variables, Stripe keys

  runtimes/
    background/            # Service worker (alarms, messaging, payment detection)
      index.ts
      message-router.ts
      alarm-router.ts
    content/               # Content scripts for social profile detection
      index.ts
      linkedin-detector.ts
      instagram-detector.ts
    popup/                 # React popup UI
      main.tsx
      App.tsx
      pages/
      components/

  features/
    auth/                  # Local authentication (V1)
      domain/
        auth.types.ts
      application/
        sign-in.ts
        sign-up.ts
        sign-out.ts
        get-session.ts
      infrastructure/
        local-auth-service.ts    # Hashing, token gen, session mgmt
        auth-storage.ts          # chrome.storage.local wrapper
      ui/
        auth-provider.tsx
        login-form.tsx
        auth-guard.tsx

    billing/               # Stripe Lifetime purchase
      domain/
        plan.types.ts
      application/
        create-checkout.ts
        check-entitlements.ts
      infrastructure/
        stripeCheckout.ts       # Abre Stripe Checkout en nueva tab
        planStorage.ts          # Lee/escribe plan en chrome.storage
      ui/
        pricingCard.tsx
        upgradePrompt.tsx

    follow-ups/            # Core follow-up tracking
      domain/
      application/
      infrastructure/
      ui/

    profiles/              # Social profile detection
      domain/
      application/
      infrastructure/

    reminders/             # Reminder scheduling
      application/
      infrastructure/

  common/
    chrome/                # Chrome API wrappers
    types/
    utils/
    ui/                    # Shared bento grid components
      followUpList.tsx
      followUpCard.tsx
      button.tsx
      input.tsx
```

---

## Operational Rules

### Security

1. **Never hardcode API keys** — use environment variables via `import.meta.env`
2. **Supabase `anon` key only** in client-side code — never use `service_role`
3. **RLS on every table** — no exceptions, enforce `auth.uid()` ownership checks
4. **Stripe secret key** only in Edge Functions — never in extension code
5. **Validate webhook signatures** using `stripe.webhooks.constructEvent()`
6. **Content Security Policy** must be configured in `manifest.json` for Supabase/Stripe domains

### Code Quality

1. **Feature-based architecture** — group by domain, not by layer
2. **TypeScript strict mode** for all files
3. **No `any` types** — define explicit interfaces and types
4. **Custom hooks** for all Chrome API and Supabase interactions
5. **Error boundaries** at route and feature level
6. **Conventional commits** — `feat:`, `fix:`, `chore:`, `refactor:`

### Chrome Extension Specific

1. **Service workers are ephemeral** — never rely on in-memory state; persist to `chrome.storage`
2. **Popup closes on blur** — save form state on every change
3. **Content script isolation** — use `chrome.runtime.sendMessage()` for cross-context communication
4. **Permissions minimum** — only request what's needed in `manifest.json`
5. **Size constraint** — popup max width `400px`, optimize for compact UI
6. **Offline-first** — cache critical data in `chrome.storage.local`, sync when online

### Payments

1. **Always use Stripe Checkout** — never build custom payment forms
2. **Webhook-driven state** — subscription status changes come from webhooks, not client
3. **Graceful degradation** — free tier must be fully functional without payment
4. **Trial support** — implement 14-day trial logic in subscription checks
5. **Idempotent webhook handlers** — handle duplicate events safely

---

## Design System — Bento Minimalist

### Color Tokens

```css
:root {
  /* Surfaces */
  --color-bg-primary: #FAFAFA;
  --color-bg-secondary: #F5F5F5;
  --color-bg-tertiary: #FFFFFF;
  --color-bg-elevated: #FFFFFF;

  /* Borders */
  --color-border-default: rgba(0, 0, 0, 0.06);
  --color-border-hover: rgba(0, 0, 0, 0.12);

  /* Text */
  --color-text-primary: #171717;
  --color-text-secondary: #404040;
  --color-text-tertiary: #737373;
  --color-text-inverse: #FAFAFA;

  /* Accent */
  --color-accent: #3B82F6;
  --color-accent-hover: #2563EB;
  --color-accent-subtle: rgba(59, 130, 246, 0.08);

  /* Status */
  --color-success: #22C55E;
  --color-warning: #F59E0B;
  --color-error: #EF4444;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.04);
  --shadow-md: 0 2px 8px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 4px 16px rgba(0, 0, 0, 0.08);
}

/* Dark mode */
[data-theme="dark"] {
  --color-bg-primary: #0A0A0A;
  --color-bg-secondary: #171717;
  --color-bg-tertiary: #1C1C1C;
  --color-bg-elevated: #262626;

  --color-border-default: rgba(255, 255, 255, 0.06);
  --color-border-hover: rgba(255, 255, 255, 0.12);

  --color-text-primary: #FAFAFA;
  --color-text-secondary: #D4D4D4;
  --color-text-tertiary: #A3A3A3;
  --color-text-inverse: #171717;

  --color-accent-subtle: rgba(59, 130, 246, 0.12);
}
```

### Bento Grid System

```css
.bento-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding: 16px;
}

.bento-card {
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border-default);
  border-radius: 12px;
  padding: 16px;
  transition: all 200ms ease;
}

.bento-card:hover {
  border-color: var(--color-border-hover);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

/* Span variants */
.bento-card--wide { grid-column: span 2; }
.bento-card--tall { grid-row: span 2; }
.bento-card--featured {
  grid-column: span 2;
  grid-row: span 2;
}
```

### Typography Scale

| Token       | Size | Weight | Line Height | Usage              |
| ----------- | ---- | ------ | ----------- | ------------------ |
| `heading` | 18px | 600    | 1.3         | Page titles        |
| `title`   | 14px | 600    | 1.4         | Card titles        |
| `body`    | 13px | 400    | 1.5         | Body text          |
| `caption` | 11px | 500    | 1.4         | Labels, metadata   |
| `micro`   | 10px | 500    | 1.3         | Badges, timestamps |

---

## Workflow Directives

### Before Starting Any Feature

1. Read `openspec/specs/project.md` for global project context
2. Read `architecture.md` for intended folder structure
3. Check existing code in `src/` for patterns and conventions
4. Create an OpenSpec change proposal before implementing

### When Implementing Auth

1. Initialize Supabase client with `chrome.storage.local` adapter
2. Handle OAuth redirect via `chrome.identity.launchWebAuthFlow()`
3. Persist session tokens in `chrome.storage.local`
4. Listen for `onAuthStateChange` in the background service worker
5. Broadcast auth state changes via `chrome.runtime.sendMessage()`

### When Implementing Payments

1. Create a Supabase Edge Function for `create-checkout-session`
2. Open Stripe Checkout in a new tab via `chrome.tabs.create()`
3. Handle `checkout.session.completed` webhook in another Edge Function
4. Sync subscription data to Supabase `subscriptions` table
5. Read entitlements from Supabase in the popup via custom hook

### When Building UI Components

1. Follow the bento grid system for layout
2. Use CSS custom properties — no hardcoded colors or sizes
3. Add hover states and micro-animations to all interactive elements
4. Keep components under 100 lines — extract hooks and helpers
5. Test at `400×600px` popup size before any other viewport

---

## Environment Variables

```env
# Supabase
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_<key>

# Edge Functions (server-side only, never in extension)
# STRIPE_SECRET_KEY=sk_test_<key>
# STRIPE_WEBHOOK_SECRET=whsec_<key>
# SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

---

## Key Dependencies

```json
{
  "dependencies": {
    "react": "^19.2.4",
    "react-dom": "^19.2.4",
    "@supabase/supabase-js": "^2.x",
    "lucide-react": "^0.x"
  },
  "devDependencies": {
    "@crxjs/vite-plugin": "^2.4.0",
    "@vitejs/plugin-react": "^6.0.1",
    "vite": "^8.0.4",
    "typescript": "^5.x"
  }
}
```

> **Note:** Stripe.js (`@stripe/stripe-js`) is loaded dynamically via `loadStripe()` only when the user navigates to billing — it should NOT be bundled in the main popup.

---

## Agent Behavioral Guidelines

1. **Think before coding** — plan the approach, identify edge cases, then implement
2. **Prefer composition** — small, focused functions and components over monolithic code
3. **Ship incrementally** — one feature at a time, fully working before moving to next
4. **Document decisions** — explain _why_, not just _what_, in code comments
5. **Security-first mindset** — assume every input is untrusted, every key could leak
6. **Test at the boundaries** — auth flows, payment webhooks, Chrome API interactions
7. **Minimize permissions** — request only what the extension actually needs
8. **Graceful errors** — every async operation needs catching and user-friendly feedback
