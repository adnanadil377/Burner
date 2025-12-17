# Navigation System Documentation

## Overview

The application uses a centralized navigation system that makes it easy to add, modify, and manage pages. All navigation is configured in a single place, ensuring consistency across the application.

## Architecture

```
frontend/src/
├── config/
│   └── navigation.ts          # Central navigation configuration
├── layout/
│   ├── DashboardLayout.tsx    # Layout with sidebar for protected pages
│   ├── MainLayout.tsx         # Layout for public pages
│   └── AuthLayout.tsx         # Layout for auth pages
├── components/
│   └── Dashboard/
│       ├── Sidebar.tsx        # Navigation sidebar component
│       └── PageHeader.tsx     # Page header component
├── pages/
│   └── Dashboard/
│       ├── DashboardOverview.tsx
│       ├── EditorPage.tsx
│       ├── ProjectsPage.tsx
│       ├── LibraryPage.tsx
│       └── SettingsPage.tsx
└── routes/
    └── AppRoutes.tsx          # Route definitions
```

## Adding a New Page

Follow these steps to add a new page to the dashboard:

### 1. Add Navigation Configuration

Edit `frontend/src/config/navigation.ts`:

```typescript
import { YourIcon } from 'lucide-react';

export const navigationItems: NavigationItem[] = [
  // ... existing items
  {
    id: 'your-page',
    label: 'Your Page Name',
    path: '/your-path',
    icon: YourIcon,
    description: 'Description for your page',
    badge: 'New' // Optional badge
  }
];
```

### 2. Create the Page Component

Create `frontend/src/pages/Dashboard/YourPage.tsx`:

```typescript
/**
 * Your Page Title
 * 
 * Brief description of what this page does
 */
export default function YourPage() {
  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Your page content */}
        <h2 className="text-white text-xl">Your Page Content</h2>
      </div>
    </div>
  );
}
```

### 3. Add Route

Edit `frontend/src/routes/AppRoutes.tsx`:

```typescript
// 1. Import your page
import YourPage from '../pages/Dashboard/YourPage';

// 2. Add route inside DashboardLayout
<Route element={
  <PrivateRoute>
    <DashboardLayout />
  </PrivateRoute>
}>
  {/* ... existing routes */}
  <Route path="/your-path" element={<YourPage />} />
</Route>
```

That's it! Your new page will automatically:
- ✅ Appear in the sidebar
- ✅ Have a page header with title/description
- ✅ Be protected by authentication
- ✅ Support navigation and routing

## Navigation Configuration Options

```typescript
interface NavigationItem {
  id: string;          // Unique identifier
  label: string;       // Display name in sidebar
  path: string;        // URL path (must start with /)
  icon: LucideIcon;    // Icon from lucide-react
  description?: string; // Shows in page header
  badge?: string;      // Optional badge (e.g., "New", "Beta")
}
```

## Customizing Page Headers

You can override the automatic header in your page component:

```typescript
import PageHeader from '../../components/Dashboard/PageHeader';

export default function YourPage() {
  return (
    <>
      <PageHeader 
        title="Custom Title"
        description="Custom description"
        actions={
          <button className="px-4 py-2 bg-amber-500 text-white rounded-lg">
            Action Button
          </button>
        }
      />
      <div className="p-8">
        {/* Page content */}
      </div>
    </>
  );
}
```

## Available Icons

The project uses [Lucide React](https://lucide.dev/) for icons. Common icons include:

- `Home` - Dashboard/home
- `Film` - Video/media
- `Folder` - Projects/files
- `LayoutGrid` - Grid/library
- `Settings` - Settings/preferences
- `Upload` - Upload actions
- `Plus` - Create/add
- `User` - User/profile
- `Bell` - Notifications
- `Search` - Search functionality

Browse all icons at: https://lucide.dev/icons

## Sidebar Features

The sidebar includes:

- **Auto-collapse**: Click the chevron to collapse/expand
- **Active state**: Current page is highlighted
- **Tooltips**: Collapsed sidebar shows tooltips on hover
- **Badges**: Show "New" or "Beta" labels
- **Logout**: Built-in logout button at bottom

## Page Layout Best Practices

### Standard Page Structure

```typescript
export default function YourPage() {
  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Content sections */}
      </div>
    </div>
  );
}
```

### Full-height Pages (e.g., Video Editor)

```typescript
export default function EditorPage() {
  return (
    <div className="h-full">
      {/* Full-height content */}
    </div>
  );
}
```

## Styling Guidelines

The application uses:

- **Color Scheme**: Dark theme with amber accents
- **Background**: `bg-neutral-900` for cards, `bg-black` for main areas
- **Borders**: `border-neutral-800`
- **Text**: `text-white` for primary, `text-neutral-400` for secondary
- **Accents**: `text-amber-500`, `bg-amber-500`
- **Hover Effects**: `hover:border-amber-500/50` for interactive elements

## Examples

See existing pages for reference:

- **Grid Layout**: [ProjectsPage.tsx](../pages/Dashboard/ProjectsPage.tsx)
- **Categories**: [LibraryPage.tsx](../pages/Dashboard/LibraryPage.tsx)
- **Settings Sections**: [SettingsPage.tsx](../pages/Dashboard/SettingsPage.tsx)
- **Quick Actions**: [DashboardOverview.tsx](../pages/Dashboard/DashboardOverview.tsx)
- **Full Height**: [EditorPage.tsx](../pages/Dashboard/EditorPage.tsx)

## Troubleshooting

### Sidebar not showing new page

1. Check that the path in `navigation.ts` matches the route in `AppRoutes.tsx`
2. Ensure the path starts with `/`
3. Verify the icon is imported correctly

### Page not loading

1. Check that the component is imported in `AppRoutes.tsx`
2. Verify the route is inside the `DashboardLayout` wrapper
3. Check for TypeScript errors

### Styling issues

1. Ensure you're using Tailwind classes
2. Check that the page has proper padding (`p-8`)
3. Use `max-w-7xl mx-auto` for content width
