# SuperMail - React + TypeScript + Vite + Zustand

A modern email management application built with React, TypeScript, Vite, and Zustand for state management.

## 🚀 Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **Zustand** - State management ⭐ NEW!
- **React Router** - Routing
- **TailwindCSS** - Styling
- **FastAPI** - Backend (Python)

## 🐻 Zustand State Management

This project uses **Zustand** for state management. It's lightweight, simple, and powerful!

### 📚 Learning Resources

- **[ZUSTAND_TUTORIAL.md](ZUSTAND_TUTORIAL.md)** - Complete step-by-step tutorial
- **[ZUSTAND_GUIDE.md](ZUSTAND_GUIDE.md)** - Quick reference & best practices
- **[ZUSTAND_ARCHITECTURE.md](ZUSTAND_ARCHITECTURE.md)** - Visual architecture diagrams
- **[ZUSTAND_SUMMARY.md](ZUSTAND_SUMMARY.md)** - What was implemented
- **[src/stores/exercises.ts](src/stores/exercises.ts)** - Interactive exercises

### 📂 Store Files

- `src/stores/useAuthStore.ts` - Authentication state (login, user, token)
- `src/stores/useUIStore.ts` - UI state (modals, sidebar, theme)
- `src/stores/examples.ts` - Advanced patterns & examples
- `src/stores/exercises.ts` - Practice exercises

### Quick Example

\`\`\`tsx
import { useAuthStore } from './stores/useAuthStore';

function MyComponent() {
  const { isAuthenticated, user, logout } = useAuthStore();
  
  return (
    <div>
      {isAuthenticated ? (
        <>
          <p>Welcome, {user?.email}</p>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <p>Please login</p>
      )}
    </div>
  );
}
\`\`\`

## 🎯 Getting Started

### Install Dependencies

\`\`\`bash
npm install
\`\`\`

### Run Development Server

\`\`\`bash
npm run dev
\`\`\`

### Build for Production

\`\`\`bash
npm run build
\`\`\`

## 📁 Project Structure

\`\`\`
src/
├── stores/              # Zustand state management ⭐
│   ├── useAuthStore.ts
│   ├── useUIStore.ts
│   ├── examples.ts
│   └── exercises.ts
├── pages/               # Page components
│   ├── Landing/
│   ├── Login/
│   └── Dashboard/
├── components/          # Reusable components
├── routes/              # Routing configuration
├── services/            # API services
└── utils/               # Utility functions
\`\`\`

## 🔐 Authentication

The app uses JWT tokens for authentication:
- Login via username/password
- OAuth2 with Google
- Protected routes
- Persistent sessions (via Zustand + localStorage)

## 🎨 UI Design Principles

This project follows bold, intentional design:
- Expressive typography
- High-contrast colors (WCAG AA compliant)
- Purposeful animations
- Layered backgrounds with depth
- Dark mode by default

## React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
