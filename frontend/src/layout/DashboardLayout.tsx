import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import PageHeader from './PageHeader';

/**
 * DashboardLayout: For authenticated pages with sidebar navigation
 * 
 * This layout provides:
 * - Sidebar navigation with collapse functionality
 * - Page header with title and description
 * - Main content area for page components
 */
export default function DashboardLayout() {
  return (
    <div className="min-h-screen flex bg-black overflow-x-visible">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-x-visible">
        {/* Page Header */}
        <PageHeader />
        
        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
