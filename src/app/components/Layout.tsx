import { Outlet, Link, useLocation } from 'react-router';
import { Map, LayoutDashboard } from 'lucide-react';

export function Layout() {
  const location = useLocation();

  return (
    <div className="h-screen w-full flex flex-col bg-neutral-50">
      {/* Header */}
      <header className="bg-neutral-900 text-white shadow-lg">
        <div className="px-4 py-3 flex items-center justify-between">
          <h1 className="font-bold">ZonaOscura</h1>
          <p className="text-xs text-neutral-400">Seguridad Ciudadana</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-white border-t border-neutral-200 shadow-lg">
        <div className="flex justify-around items-center px-4 py-3">
          <Link
            to="/"
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
              location.pathname === '/'
                ? 'bg-neutral-900 text-white'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            <Map size={20} />
            <span className="text-xs font-medium">Mapa</span>
          </Link>
          <Link
            to="/dashboard"
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
              location.pathname === '/dashboard'
                ? 'bg-neutral-900 text-white'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            <LayoutDashboard size={20} />
            <span className="text-xs font-medium">Gestión</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
