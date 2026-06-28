import { LayoutDashboard, TrendingUp, Calculator, GraduationCap, BookOpen, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { NavItem } from './NavItem';
import { useAuthStore } from '../../store/authStore';
import { db } from '../../lib/db';
import { fmtCompactUSD } from '../../lib/format';
import { usePortfolioStore } from '../../store/portfolioStore';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Portfolio' },
  { to: '/pitches', icon: TrendingUp, label: 'Pitches' },
  { to: '/dcf', icon: Calculator, label: 'DCF Valuation' },
  { to: '/training', icon: GraduationCap, label: 'Training' },
  { to: '/research', icon: BookOpen, label: 'Research' },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { profile } = useAuthStore();
  const { aum } = usePortfolioStore((s) => ({ aum: s.aum }));

  const handleLogout = async () => {
    await db.signOut();
    useAuthStore.getState().setProfile(null);
  };

  return (
    <aside
      className={[
        'fixed top-0 left-0 h-screen bg-green-900 border-r border-green-700 flex flex-col z-40 transition-all duration-200',
        collapsed ? 'w-14' : 'w-56',
      ].join(' ')}
    >
      {/* Logo + wordmark */}
      <div className="flex items-center gap-3 px-3 pt-5 pb-4 border-b border-green-700">
        <img
          src="/logo.png"
          alt="MCG Crest"
          className="w-8 h-8 object-contain shrink-0"
          onError={(e) => {
            const el = e.currentTarget;
            el.style.display = 'none';
            const fallback = el.nextElementSibling as HTMLElement;
            if (fallback) fallback.style.display = 'flex';
          }}
        />
        <div
          className="w-8 h-8 shrink-0 bg-brass-500/20 border border-brass-500/40 rounded items-center justify-center hidden"
          aria-hidden="true"
        >
          <span className="text-brass-500 font-cormorant font-bold text-sm">M</span>
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p
              className="font-cormorant font-semibold text-cream-200 leading-tight text-sm tracking-wide truncate"
            >
              Mustang Capital
            </p>
            <p className="text-xs text-cream-400 truncate">Group</p>
          </div>
        )}
      </div>

      {/* AUM readout */}
      {!collapsed && (
        <div className="px-3 py-2.5 border-b border-green-700">
          <p className="text-xs text-cream-400 uppercase tracking-wide mb-0.5">AUM</p>
          <p className="font-mono text-brass-500 text-sm font-medium" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>
            {aum != null ? fmtCompactUSD(aum) : '—'}
          </p>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 py-3 px-1 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavItem key={item.to} {...item} collapsed={collapsed} />
        ))}
        {import.meta.env.DEV && (
          <NavItem to="/design-system" icon={LayoutDashboard} label="Design System" collapsed={collapsed} />
        )}
      </nav>

      {/* User + logout */}
      <div className="border-t border-green-700 p-2 space-y-1">
        {!collapsed && profile && (
          <div className="px-2 py-1">
            <p className="text-xs text-cream-200 font-medium truncate">{profile.full_name || profile.email}</p>
            <p className="text-xs text-cream-400 truncate capitalize">{profile.role}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-2 py-2 text-cream-400 hover:text-loss hover:bg-loss/10 rounded transition-colors text-sm"
          aria-label="Sign out"
        >
          <LogOut size={16} />
          {!collapsed && <span>Sign out</span>}
        </button>
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="flex items-center gap-2 w-full px-2 py-2 text-cream-400 hover:text-cream-100 hover:bg-green-800 rounded transition-colors text-sm"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          {!collapsed && <span className="text-xs">Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
