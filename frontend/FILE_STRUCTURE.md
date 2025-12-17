# 📂 Navigation System File Structure

## Complete File Tree

```
frontend/src/
│
├── 📋 config/
│   └── navigation.ts              ⭐ Central navigation configuration
│
├── 🎨 layout/
│   ├── DashboardLayout.tsx        ⭐ Protected pages layout with sidebar
│   ├── MainLayout.tsx             Public pages layout
│   └── AuthLayout.tsx             Auth pages layout
│
├── 🧩 components/
│   └── Dashboard/
│       ├── Sidebar.tsx            ⭐ Navigation sidebar with collapse
│       ├── PageHeader.tsx         ⭐ Auto page header component
│       └── FileUpload.tsx         Other dashboard components
│
├── 📄 pages/
│   └── Dashboard/
│       ├── index.ts               ⭐ Centralized exports
│       ├── DashboardOverview.tsx  ⭐ Main dashboard page
│       ├── EditorPage.tsx         ⭐ Video editor page
│       ├── ProjectsPage.tsx       ⭐ Projects browser
│       ├── LibraryPage.tsx        ⭐ Media library
│       └── SettingsPage.tsx       ⭐ Settings page
│
├── 🛣️ routes/
│   └── AppRoutes.tsx              ⭐ Route definitions
│
└── 📚 Documentation/
    ├── QUICK_START.md             ⭐ Quick guide to add pages
    └── NAVIGATION_GUIDE.md        ⭐ Complete documentation

⭐ = Core navigation files
```

## What Each File Does

### Core Configuration
- **`navigation.ts`** - Single source of truth for all navigation items (icons, paths, labels)

### Layouts
- **`DashboardLayout.tsx`** - Wraps protected pages with sidebar + header
- **`MainLayout.tsx`** - Public pages (landing page)
- **`AuthLayout.tsx`** - Login/auth pages

### Components
- **`Sidebar.tsx`** - Collapsible navigation sidebar with active states
- **`PageHeader.tsx`** - Automatic page headers based on route

### Pages
- **`DashboardOverview.tsx`** - Landing page after login
- **`EditorPage.tsx`** - Video editing interface
- **`ProjectsPage.tsx`** - Browse video projects
- **`LibraryPage.tsx`** - Media assets library
- **`SettingsPage.tsx`** - User preferences
- **`index.ts`** - Clean exports for all pages

### Routing
- **`AppRoutes.tsx`** - Maps URLs to pages with auth protection

## Data Flow

```
User clicks sidebar item
         ↓
Navigation config (navigation.ts)
         ↓
React Router (AppRoutes.tsx)
         ↓
DashboardLayout (sidebar + header)
         ↓
Page Component (e.g., EditorPage.tsx)
         ↓
PageHeader auto-fills from navigation config
```

## Component Hierarchy

```
<BrowserRouter>
  <AppRoutes>
    <PrivateRoute>
      <DashboardLayout>
        <Sidebar />
        <div>
          <PageHeader />
          <main>
            <Outlet /> ← Your page renders here
          </main>
        </div>
      </DashboardLayout>
    </PrivateRoute>
  </AppRoutes>
</BrowserRouter>
```

## Adding a New Page (4 Steps)

1. **Add to navigation.ts** (config)
2. **Create YourPage.tsx** (page component)
3. **Export in index.ts** (clean imports)
4. **Add route in AppRoutes.tsx** (routing)

See [QUICK_START.md](./QUICK_START.md) for detailed examples.

## Styling System

### Color Palette
- **Background**: `bg-black`, `bg-neutral-900`
- **Borders**: `border-neutral-800`
- **Text**: `text-white`, `text-neutral-400`
- **Accent**: `text-amber-500`, `bg-amber-500`

### Component Patterns
```typescript
// Page Container
<div className="p-8">
  <div className="max-w-7xl mx-auto">

// Card
<div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">

// Interactive
hover:border-amber-500/50 transition-all
```

## Navigation Features

✅ Auto-collapse sidebar  
✅ Active route highlighting  
✅ Tooltips in collapsed mode  
✅ Badge support ("New", "Beta")  
✅ Auto page headers from config  
✅ Auth-protected routes  
✅ Smooth transitions  
✅ Responsive layout  

## Key Benefits

1. **Single Source of Truth**: All navigation in one file
2. **Type Safe**: Full TypeScript support
3. **DRY**: No repeated navigation code
4. **Easy to Extend**: 4 files to add a page
5. **Consistent**: Automatic styling and structure
6. **Maintainable**: Clear separation of concerns

## File Sizes (Lines of Code)

```
navigation.ts         ~65 lines
DashboardLayout.tsx   ~30 lines
Sidebar.tsx           ~100 lines
PageHeader.tsx        ~35 lines
AppRoutes.tsx         ~70 lines
YourPage.tsx          ~30 lines (per page)
```

## Dependencies

- `react-router-dom` - Routing
- `lucide-react` - Icons
- `zustand` - Auth state
- `tailwindcss` - Styling

---

**Total Files Modified/Created**: 15 files  
**Lines of Code**: ~800 lines  
**Time to Add New Page**: ~5 minutes
