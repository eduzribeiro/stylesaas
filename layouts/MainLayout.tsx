import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogOut, Menu, Scissors } from 'lucide-react';
import { useAuth } from '../src/context';
import { MENU_ITEMS, COLORS } from '../constants';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  if (!user) return null;

  const menu = MENU_ITEMS[user.role] || [];

  return (
    <div className="min-h-screen flex bg-mint-400mint-500space-900 text-mint-400mint-500silver-200 print:block print:bg-mint-400mint-500white">
      {/* Sidebar Desktop */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-mint-400mint-500space-800 border-mint-400mint-500r border-mint-400mint-500space-700 transform transition-transform duration-300 md:relative md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} print:hidden`}>
        <div className="flex flex-col h-full">
          <div className="p-6 flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg shadow-mint-500/20 overflow-hidden`}>
              <img src="/logo.png" alt="StyleSaaS Logo" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-mint-400mint-500xl font-bold text-mint-400mint-500chrome">StyleSaaS</h1>
          </div>

          <nav className="flex-1 px-4 space-y-1 mt-4">
            {menu.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                    ? 'bg-mint-500/10 text-mint-500 font-medium border border-mint-500/20'
                    : 'text-silver-400 hover:bg-space-700 hover:text-silver-200'
                    }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-mint-400mint-500t border-mint-400mint-500space-700">
            <div className="flex items-center gap-3 px-4 py-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-mint-400mint-500space-700 border border-mint-400mint-500space-600 flex items-center justify-center text-mint-400mint-500silver-200 font-bold uppercase shadow-sm">
                {user.profile.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-mint-400mint-500sm font-medium text-mint-400mint-500silver-200 truncate">{user.profile.name}</p>
                <p className="text-mint-400mint-500xs text-mint-400mint-500silver-400 capitalize">{user.role.replace('_', ' ')}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 text-mint-400mint-500red-400 hover:bg-mint-400mint-500red-400/10 rounded-lg transition-colors"
            >
              <LogOut size={20} />
              Sair
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-mint-400mint-500space-900 print:bg-mint-400mint-500white print:overflow-visible print:block">
        <header className="h-16 flex items-center justify-between px-6 bg-mint-400mint-500space-800 border-mint-400mint-500b border-mint-400mint-500space-700 md:hidden print:hidden">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="StyleSaaS Logo" className="w-8 h-8 rounded-lg object-cover" />
            <span className="font-bold text-mint-400mint-500chrome">StyleSaaS</span>
          </div>
          <button onClick={() => setSidebarOpen(true)} className="p-2 text-mint-400mint-500silver-400 hover:text-mint-400mint-500silver-200">
            <Menu size={24} />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto print:overflow-visible">
          <div className="max-w-7xl mx-auto p-4 md:p-8 print:p-0 print:max-w-none print:w-full">
            {children}
          </div>
        </main>
      </div>

      {/* Overlay Mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-mint-400mint-500space-900/80 backdrop-blur-sm z-40 md:hidden animate-in fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default MainLayout;
