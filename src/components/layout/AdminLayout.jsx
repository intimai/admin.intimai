import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  LogOut,
  Target,
  Building2,
  Headphones,
  UserCog,
  FileText,
  Gavel,
  Receipt,
  ChevronDown,
  Briefcase,
  FolderOpen,
  Settings2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

const AdminLayout = () => {
  const location = useLocation();
  const { logoSrc } = useTheme();
  const { user, logout, isSuperAdmin, hasMenuAccess } = useAdminAuth();

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const NavItem = ({ to, icon: Icon, label }) => (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium rounded-lg transition-all duration-200",
        isActive(to)
          ? "bg-primary text-white shadow-md"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      <Icon size={18} />
      {label}
    </Link>
  );

  const SubNavItem = ({ to, label, icon: Icon }) => (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-2.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200",
        isActive(to)
          ? "text-primary font-bold"
          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
      )}
    >
      <span className={cn("transition-all duration-200 flex items-center gap-2", isActive(to) ? 'translate-x-1' : '')}>
        <Icon size={14} className={isActive(to) ? "text-primary" : "text-muted-foreground opacity-70"} />
        {label}
      </span>
    </Link>
  );

  const NavGroup = ({ label, icon: Icon, paths, children }) => {
    const active = paths.some(path => isActive(path));
    const [isExpanded, setIsExpanded] = useState(active);

    useEffect(() => {
      if (active) setIsExpanded(true);
    }, [active, location.pathname]);

    return (
      <div className="flex flex-col mb-1 relative">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "flex items-center justify-between w-full px-4 py-2.5 text-[13px] font-medium rounded-lg transition-all duration-200 border border-transparent",
            active
              ? "bg-primary text-white shadow-md border-primary/20"
              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground hover:border-border/50"
          )}
        >
          <div className="flex items-center gap-3">
            <Icon size={18} />
            {label}
          </div>
          <ChevronDown
            size={14}
            className={cn("transition-transform duration-200 opacity-70", isExpanded ? "rotate-180" : "rotate-0")}
          />
        </button>

        <div
          className={cn(
            "grid transition-all duration-300 ease-in-out",
            isExpanded ? "grid-rows-[1fr] opacity-100 mt-1" : "grid-rows-[0fr] opacity-0"
          )}
        >
          <div className="overflow-hidden">
            <div className="flex flex-col space-y-0.5 mt-1 border-l border-border/40 ml-6 pl-2 py-1">
              {children}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 border-r border-border bg-card hidden md:flex flex-col shadow-sm z-10 overflow-hidden">
        <div className="p-6 border-b border-border flex flex-shrink-0 items-center justify-center h-20">
          <img src={logoSrc} alt="IntimAI Admin" className="h-10 w-auto object-contain" />
        </div>

        <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-primary/10 scrollbar-track-transparent">

          <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />

          {/* Comercial */}
          {(hasMenuAccess('pipeline') || hasMenuAccess('propostas') || hasMenuAccess('suporte')) && (
            <NavGroup label="Comercial" icon={Briefcase} paths={['/pipeline', '/propostas', '/suporte']}>
              {hasMenuAccess('pipeline') && <SubNavItem to="/pipeline" icon={Target} label="Pipeline" />}
              {hasMenuAccess('propostas') && <SubNavItem to="/propostas" icon={FileText} label="Propostas" />}
              {hasMenuAccess('suporte') && <SubNavItem to="/suporte" icon={Headphones} label="Suporte" />}
            </NavGroup>
          )}

          {/* Cadastros */}
          {(hasMenuAccess('delegacias') || hasMenuAccess('users')) && (
            <NavGroup label="Cadastros" icon={FolderOpen} paths={['/delegacias', '/users']}>
              {hasMenuAccess('delegacias') && <SubNavItem to="/delegacias" icon={Building2} label="Delegacias" />}
              {hasMenuAccess('users') && <SubNavItem to="/users" icon={Users} label="Usuários" />}
            </NavGroup>
          )}

          {/* Administrativo */}
          {(hasMenuAccess('contratos') || hasMenuAccess('nfe') || hasMenuAccess('finance') || isSuperAdmin) && (
            <NavGroup label="Administrativo" icon={Settings2} paths={['/contratos', '/nfe', '/finance', '/colaboradores']}>
              {hasMenuAccess('contratos') && <SubNavItem to="/contratos" icon={Gavel} label="Contratos" />}
              {hasMenuAccess('nfe') && <SubNavItem to="/nfe" icon={Receipt} label="NF-e" />}
              {hasMenuAccess('finance') && <SubNavItem to="/finance" icon={CreditCard} label="Financeiro" />}
              {isSuperAdmin && (
                <SubNavItem to="/colaboradores" icon={UserCog} label="Colaboradores" />
              )}
            </NavGroup>
          )}

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