import {
  LayoutDashboard,
  Target,
  FileText,
  Headphones,
  Building2,
  Users,
  Gavel,
  Receipt,
  UserCog,
  Briefcase,
  FolderOpen,
  Settings2,
  Wallet,
  CreditCard,
  TrendingUp,
  TrendingDown,
  BarChart3,
} from 'lucide-react';

export const MENU_CONFIG = [
  {
    category: 'Comercial',
    id: 'comercial',
    icon: Briefcase,
    items: [
      { slug: 'pipeline', path: '/pipeline', label: 'Pipeline', icon: Target },
      { slug: 'propostas', path: '/propostas', label: 'Propostas', icon: FileText },
      { slug: 'suporte', path: '/suporte', label: 'Suporte', icon: Headphones },
    ],
  },
  {
    category: 'Cadastros',
    id: 'cadastros',
    icon: FolderOpen,
    items: [
      { slug: 'delegacias', path: '/delegacias', label: 'Delegacias', icon: Building2 },
      { slug: 'users', path: '/users', label: 'Usuários', icon: Users },
    ],
  },
  {
    category: 'Administrativo',
    id: 'administrativo',
    icon: Settings2,
    items: [
      { slug: 'contratos', path: '/contratos', label: 'Contratos', icon: Gavel },
      { slug: 'nfe', path: '/nfe', label: 'Notas Fiscais (NF-e)', icon: Receipt },
      { slug: 'colaboradores', path: '/colaboradores', label: 'Colaboradores', icon: UserCog, isSuperAdminOnly: true },
    ],
  },
  {
    category: 'Financeiro',
    id: 'financeiro',
    icon: Wallet,
    items: [
      { slug: 'contas-pagar', path: '/contas-pagar', label: 'Contas a Pagar', icon: CreditCard },
      { slug: 'contas-receber', path: '/contas-receber', label: 'Contas a Receber', icon: Wallet },
      { slug: 'receitas', path: '/receitas', label: 'Receitas', icon: TrendingUp },
      { slug: 'despesas', path: '/despesas', label: 'Despesas', icon: TrendingDown },
      { slug: 'relatorios-financeiros', path: '/relatorios-financeiros', label: 'Relatórios Financeiros', icon: BarChart3 },
    ],
  },
];
