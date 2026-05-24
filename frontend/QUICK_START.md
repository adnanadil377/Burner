# 🎯 Quick Start: Adding a New Page

## Step-by-Step Example

Let's add a new "Analytics" page to the dashboard:

### 1. **Update Navigation Config** (1 file)
📁 `src/config/navigation.ts`

```typescript
import { BarChart3 } from 'lucide-react'; // Add your icon

export const navigationItems: NavigationItem[] = [
  // ... existing items ...
  {
    id: 'analytics',
    label: 'Analytics',
    path: '/analytics',
    icon: BarChart3,
    description: 'View your video analytics and insights'
  }
];
```

### 2. **Create Page Component** (1 file)
📁 `src/pages/Dashboard/AnalyticsPage.tsx`

```typescript
import { BarChart3 } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6">
          <h2 className="text-white text-xl mb-4">Analytics Overview</h2>
          <p className="text-neutral-400">Your analytics content goes here</p>
        </div>
      </div>
    </div>
  );
}
```

### 3. **Add Export** (1 file)
📁 `src/pages/Dashboard/index.ts`

```typescript
export { default as AnalyticsPage } from './AnalyticsPage';
```

### 4. **Add Route** (1 file)
📁 `src/routes/AppRoutes.tsx`

```typescript
// Add to imports
import {
  DashboardOverview,
  EditorPage,
  ProjectsPage,
  LibraryPage,
  SettingsPage,
  AnalyticsPage  // ← Add this
} from '../pages/Dashboard';

// Add to routes
<Route element={
  <PrivateRoute>
    <DashboardLayout />
  </PrivateRoute>
}>
  <Route path="/dashboard" element={<DashboardOverview />} />
  <Route path="/editor" element={<EditorPage />} />
  <Route path="/projects" element={<ProjectsPage />} />
  <Route path="/library" element={<LibraryPage />} />
  <Route path="/settings" element={<SettingsPage />} />
  <Route path="/analytics" element={<AnalyticsPage />} />  {/* ← Add this */}
</Route>
```

## ✅ That's It!

Your new page will automatically have:
- ✨ Sidebar navigation item with icon
- 📋 Page header with title and description
- 🔐 Authentication protection
- 🎨 Consistent dark theme styling

## 📊 File Count: 4 files touched

1. `navigation.ts` - Add config
2. `AnalyticsPage.tsx` - Create page
3. `index.ts` - Export page
4. `AppRoutes.tsx` - Add route

---

## 🎨 Styling Quick Reference

```typescript
// Page Container
<div className="p-8">
  <div className="max-w-7xl mx-auto space-y-6">
    {/* Content */}
  </div>
</div>

// Card/Panel
<div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
  {/* Card content */}
</div>

// Button
<button className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors">
  Click Me
</button>

// Text Colors
<h1 className="text-white">Primary Text</h1>
<p className="text-neutral-400">Secondary Text</p>
<span className="text-amber-500">Accent Text</span>
```

## 🔍 Common Patterns

### Grid Layout
```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map(item => <Card key={item.id} {...item} />)}
</div>
```

### Empty State
```typescript
<div className="bg-neutral-900 rounded-xl border border-neutral-800 p-12 text-center">
  <Icon size={48} className="text-neutral-600 mx-auto mb-4" />
  <h3 className="text-white font-semibold mb-2">No items yet</h3>
  <p className="text-neutral-400">Add your first item to get started</p>
</div>
```

### Custom Page Header
```typescript
import PageHeader from '../../components/Dashboard/PageHeader';

export default function YourPage() {
  return (
    <>
      <PageHeader 
        title="Custom Title"
        actions={
          <button className="px-4 py-2 bg-amber-500 text-white rounded-lg">
            Action
          </button>
        }
      />
      <div className="p-8">
        {/* Content */}
      </div>
    </>
  );
}
```

---

For more details, see [NAVIGATION_GUIDE.md](./NAVIGATION_GUIDE.md)
