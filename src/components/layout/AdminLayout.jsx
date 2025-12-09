import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, CreditCard, LogOut, Target, Building2, Headphones } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

const AdminLayout = () => {
  const location = useLocation();
  const { logoSrc } = useTheme();
  const { user, logout } = useAdminAuth();

  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  const NavItem = ({ to, icon: Icon, label }) => (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200",
        isActive(to)
          ? "bg-primary text-white shadow-md"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      <Icon size={20} />
      {label}
    </Link>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 border-r border-border bg-card hidden md:flex flex-col shadow-sm z-10">
        <div className="p-6 border-b border-border flex items-center justify-center">
          <img src={logoSrc} alt="IntimAI Admin" className="h-10 w-auto object-contain" />
        </div>
        
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto py-6">
          <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
          <NavItem to="/prospeccao" icon={Target} label="Prospecção" />
          <NavItem to="/delegacias" icon={Building2} label="Delegacias" />
          <NavItem to="/users" icon={Users} label="Usuários" />
          <NavItem to="/suporte" icon={Headphones} label="Suporte" />
          <NavItem to="/finance" icon={CreditCard} label="Financeiro" />
        </nav>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-card/60 border-b border-border h-16 flex items-center justify-end px-4 md:px-6 sticky top-0 z-30 backdrop-blur-sm">
          <div className="flex items-center gap-6">
            <span className="text-sm font-semibold text-foreground truncate">
              {user?.nome || 'Administrador'}
            </span>
            <button 
              onClick={logout}
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              title="Sair"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-muted/10 relative p-4 md:p-6">
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none" />
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;