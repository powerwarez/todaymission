import { Outlet } from 'react-router';
import { Sidebar } from '../components/Sidebar';
import { requireAuth } from '../lib/auth';
import { useTheme } from '../lib/theme-context';
import { cn } from '../lib/utils';

export async function loader() {
  await requireAuth();
  return {};
}

export default function DashboardLayout() {
  const { themeColor } = useTheme();
  
  return (
    <div className={cn(
      "flex h-screen",
      `bg-theme-${themeColor}`
    )}>
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  );
} 