# OpenFest — Application Architecture & Design Patterns

---

## 1. UI & Theming (Global Frontend)

### Tailwind Styling Standard
The application uses base **Tailwind CSS** directly.

### Standardized Color Palette
To ensure visual consistency across all pages, developers must adhere to the following color assignments:

| Role | Standard Tailwind Classes | Usage |
| :--- | :--- | :--- |
| **Primary (Brand / Key CTAs)** | `bg-blue-600`, `hover:bg-blue-700`, `text-white`, `text-blue-500` / `text-blue-400`, `focus:ring-blue-500`, `focus:border-blue-500` | Main action buttons, links, active state indicators, focus rings |
| **Secondary / Neutral Actions** | `bg-gray-100 dark:bg-gray-800`, `text-gray-700 dark:text-gray-200`, `hover:bg-gray-200 dark:hover:bg-gray-700`, `border-gray-300 dark:border-gray-700` | Cancel buttons, secondary actions, filter pills |
| **Canvas Backgrounds** | `bg-white dark:bg-gray-950` | App-wide page background |
| **Card / Surface Backgrounds**| `bg-white dark:bg-gray-900`, `border-gray-200 dark:border-gray-800` | Content containers, cards, modals |
| **Typography** | `text-gray-900 dark:text-white` (headings/body), `text-gray-600 dark:text-gray-400` (subdued/muted labels) | All text elements |
| **Success** | `bg-emerald-600`, `text-emerald-700 dark:text-emerald-300`, `border-emerald-200 dark:border-emerald-800` | Badges, success messages, confirmation alerts |
| **Destructive / Error** | `bg-red-600`, `hover:bg-red-700`, `text-red-600 dark:text-red-400`, `border-red-200 dark:border-red-800` | Delete actions, inline validation error text, failure banners |

### Component Styling Conventions
- **DO**: Use `blue` (`blue-600`, `blue-700`, `blue-500`) consistently as the primary brand color for buttons, active links, and focus rings.
- **DO**: Support dark mode by pairing base classes with `dark:` variants (e.g., `bg-white dark:bg-gray-900`, `text-gray-900 dark:text-white`).
- **DO NOT**: Mix arbitrary color families for primary actions or highlights (e.g., do not use `indigo-*`, `purple-*`, or `violet-*` for primary controls).

---

## 2. Component Structure (Frontend App & Components)

### Co-location
- Components used exclusively by a single page or feature reside in a `components/` directory co-located with the route (e.g., `frontend/app/dashboard/components/`).
- Components shared across two or more routes reside in a shared components directory at the root of the app (e.g., `frontend/components/shared/`).
- Components that are strictly UI primitives should reside in another shared components directory at the root of the app (`frontend/components/ui`).

### Separation of Concerns
- **Presentational Components**: Focus strictly on layout and styling. They receive data and event handlers exclusively via props.
- **Business & Form Logic**: Keep business logic outside of strict UI components rather than mixing calculations, validation, or complex state orchestration directly inside large JSX templates.

### Component Extraction
- When a sub-tree of a component handles independent state (e.g., an edit modal, filter drawer, or table row action menu), extract it into its own file in the co-located `components/` folder.

---

## 3. Backend API Integration (Frontend to Spring Boot)

### Security Baseline
- **Session Model**: Spring Boot manages user authentication using HTTP cookies (`JSESSIONID`).
- **CSRF Model**: Spring Security enforces CSRF validation on mutating operations (`POST`, `PUT`, `DELETE`, `PATCH`).
- **CORS Model**: Configured to permit requests with credentials (`allowCredentials: true`) from the frontend domain.

### Centralized API Location
All external API calls to Spring Boot must reside in dedicated domain files inside `frontend/lib/api/*.ts` (e.g., `frontend/lib/api/auth.ts`, `frontend/lib/api/events.ts`).

- **DO**: Export clean, callable async functions from `frontend/lib/api/*.ts` for components to consume.
- **DO**: Allow each API function to handle its own required endpoint setup, headers, credentials (`credentials: "include"`), and CSRF token retrieval as needed for that specific request.
- **DO NOT**: Write raw inline `fetch()` calls directly inside UI components or page files.

---

## 4. Form Validation (Frontend & Backend Boundary)
> *Note: Work in progress — validation standards and schema specifications are being finalized alongside API DTO definitions.*
