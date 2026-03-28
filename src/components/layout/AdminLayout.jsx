import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  LogOut,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { MENU_CONFIG } from '@/config/menuConfig';

const SIDEBAR_KEY = 'intimai_sidebar_collapsed';

const AdminLayout = () => {
  const location = useLocation();
  const { logoSrc } = useTheme();
  const { user, logout, isSuperAdmin, hasMenuAccess } = useAdminAuth();

  const [isCollapsed, setIsCollapsed] = useState(true);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  // ── NavItem: item de menu simples ──────────────────────────────────────────
  const NavItem = ({ to, icon: Icon, label }) => (
    <Link
      to={to}
      title={isCollapsed ? label : undefined}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 text-[13px] font-medium rounded-lg transition-all duration-200',
        isCollapsed ? 'justify-center' : '',
        isActive(to)
          ? 'bg-primary text-white shadow-md'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      )}
    >
      <Icon size={18} className="shrink-0" />
      {!isCollapsed && <span className="truncate">{label}</span>}
    </Link>
  );

  // ── SubNavItem: sub-item dentro de um grupo ────────────────────────────────
  const SubNavItem = ({ to, label, icon: Icon }) => {
    const active = isActive(to);
    return (
      <Link
        to={to}
        title={isCollapsed ? label : undefined}
        className={cn(
          'flex items-center gap-2.5 font-medium transition-all duration-200',
          isCollapsed 
            ? 'justify-center py-2.5 rounded-lg mb-1 px-3 text-[13px]' 
            : 'px-3 py-1.5 text-xs rounded-md',
          active
            ? isCollapsed
                ? 'bg-primary text-white shadow-md'
                : 'text-primary font-bold'
            : isCollapsed
                ? 'text-muted-foreground hover:bg-muted hover:text-foreground'
                : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
        )}
      >
        <span
          className={cn(
            'transition-all duration-200 flex items-center gap-2',
            active && !isCollapsed ? 'translate-x-1' : ''
          )}
        >
          <Icon
            size={isCollapsed ? 18 : 14}
            className={active && isCollapsed ? 'text-white' : (active ? 'text-primary' : 'text-muted-foreground opacity-70')}
          />
          {!isCollapsed && label}
        </span>
      </Link>
    );
  };

  // ── NavGroup: categoria expansível ────────────────────────────────────────
  const NavGroup = ({ label, icon: Icon, paths, children }) => {
    const active = paths.some((path) => isActive(path));
    const [isExpanded, setIsExpanded] = useState(active);

    useEffect(() => {
      if (active) setIsExpanded(true);
    }, [active, location.pathname]);

    // No modo retraído, NÃO mostra o ícone do grupo, apenas os filhos enfileirados.
    if (isCollapsed) {
      return (
        <div className="flex flex-col items-center gap-0.5 w-full mb-1">
          {children}
        </div>
      );
    }

    return (
      <div className="flex flex-col mb-1 relative">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            'flex items-center justify-between w-full px-4 py-2.5 text-[13px] font-medium rounded-lg transition-all duration-200 border border-transparent',
            active
              ? 'bg-primary text-white shadow-md border-primary/20'
              : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground hover:border-border/50'
          )}
        >
          <div className="flex items-center gap-3">
            <Icon size={18} />
            {label}
          </div>
          <ChevronDown
            size={14}
            className={cn(
              'transition-transform duration-200 opacity-70',
              isExpanded ? 'rotate-180' : 'rotate-0'
            )}
          />
        </button>

        <div
          className={cn(
            'grid transition-all duration-300 ease-in-out',
            isExpanded ? 'grid-rows-[1fr] opacity-100 mt-1' : 'grid-rows-[0fr] opacity-0'
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
      <aside
        className={cn(
          'border-r border-border bg-card hidden md:flex flex-col shadow-sm z-40 relative transition-all duration-300',
          isCollapsed ? 'w-[68px]' : 'w-60'
        )}
      >
        {/* Logo */}
        <div className="p-4 border-b border-border flex flex-shrink-0 items-center justify-center h-20 relative overflow-hidden">
          {isCollapsed ? (
            <img
              src="/logo_reduzida.png"
              alt="IntimAI"
              className="h-8 w-auto object-contain"
            />
          ) : (
            <img
              src={logoSrc}
              alt="IntimAI Admin"
              className="h-10 w-auto object-contain"
            />
          )}
        </div>

        {/* Botão toggle — Orelha lateral semicircular */}
        <button
          onClick={toggleSidebar}
          title={isCollapsed ? 'Expandir menu' : 'Retrair menu'}
          className={cn(
            'absolute top-8 right-0 translate-x-full z-10 flex items-center justify-center cursor-pointer group',
            'h-10 w-[18px] rounded-r-xl bg-card border border-l-0 border-primary shadow-sm',
            'text-primary hover:text-primary transition-all duration-300'
          )}
        >
          {isCollapsed ? <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" /> : <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />}
        </button>

        {/* Nav */}
        <nav
          className={cn(
            'flex-1 py-6 space-y-2 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-primary/10 scrollbar-track-transparent',
            isCollapsed ? 'px-2' : 'px-3'
          )}
        >
          <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />

          {MENU_CONFIG.map((option) => {
            // Se for um item direto (standalone)
            if (option.type === 'item') {
              const hasAccess = option.isSuperAdminOnly ? isSuperAdmin : hasMenuAccess(option.slug);
              if (!hasAccess) return null;
              
              return (
                <NavItem 
                  key={option.slug} 
                  to={option.path} 
                  icon={option.icon} 
                  label={option.label} 
                />
              );
            }

            // Se for um grupo (categoria)
            if (option.type === 'group') {
              const accessibleItems = option.items.filter((item) =>
                item.isSuperAdminOnly ? isSuperAdmin : hasMenuAccess(item.slug)
              );

              if (accessibleItems.length === 0) return null;

              return (
                <NavGroup
                  key={option.id}
                  label={option.category}
                  icon={option.icon}
                  paths={accessibleItems.map((i) => i.path)}
                >
                  {accessibleItems.map((item) => (
                    <SubNavItem
                      key={item.slug}
                      to={item.path}
                      icon={item.icon}
                      label={item.label}
                    />
                  ))}
                </NavGroup>
              );
            }

            return null;
          })}
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