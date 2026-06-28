import { NavLink } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';

interface NavItemProps {
  to: string;
  icon: LucideIcon;
  label: string;
  collapsed?: boolean;
}

export function NavItem({ to, icon: Icon, label, collapsed = false }: NavItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          'flex items-center gap-3 px-3 py-2.5 rounded-r-md transition-colors duration-150 relative',
          'text-sm font-medium group',
          isActive
            ? 'text-brass-500 bg-green-800 border-l-2 border-brass-500 -ml-px pl-[11px]'
            : 'text-cream-400 hover:text-cream-100 hover:bg-green-800/50 ml-0',
        ].join(' ')
      }
    >
      <Icon size={18} className="shrink-0" />
      {!collapsed && <span>{label}</span>}
      {collapsed && (
        <span className="absolute left-full ml-2 px-2 py-1 bg-green-700 text-cream-100 text-xs rounded
          opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
          {label}
        </span>
      )}
    </NavLink>
  );
}
