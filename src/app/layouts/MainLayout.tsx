import { Link, Outlet, useLocation } from 'react-router';
import { Calendar, BarChart3, Layers, BookOpen } from 'lucide-react';
import { clsx } from 'clsx';

const NAVIGATION_ITEMS = [
  { path: '/', label: 'Расписание', icon: Calendar },
  { path: '/analytics', label: 'Аналитика', icon: BarChart3 },
  { path: '/resources', label: 'Ресурсы и услуги', icon: Layers },
  { path: '/book', label: 'Запись клиента', icon: BookOpen },
];

export const MainLayout = () => {
  const location = useLocation();

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 antialiased">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 bg-white p-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 px-2 py-3 mb-6">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg">
              C
            </div>
            <span className="font-semibold text-lg tracking-tight">ChronoFlow</span>
          </div>

          <nav className="space-y-1">
            {NAVIGATION_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={clsx(
                    'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="px-2 py-3 text-xs text-slate-400 border-t border-slate-100">
          ChronoFlow B2B v0.1.0
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  );
};