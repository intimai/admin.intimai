import {
  LayoutDashboard,
  Target,
  FileText,
  Headphones,
  Building2,
  Users,
  PenLine,
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
  ShieldCheck,
  Phone,
  AlertTriangle,
} from 'lucide-react';

export const MENU_CONFIG = [
  {
    type: 'group',
    category: 'Central de Controle',
    id: 'central_controle',
    icon: ShieldCheck,
    items: [
      { slug: 'auditoria', path: '/auditoria', label: 'Governança & LGPD', icon: ShieldCheck },
      { slug: 'conexoes', path: '/conexoes', label: 'Conexões', icon: Phone },
      { slug: 'monitoramento-ia', path: '/monitoramento-ia', label: 'Monitoramento IA', icon: AlertTriangle },
    ],
  },
  {
    type: 'group',
    category: 'Comercial',
    id: 'comercial',
    icon: Briefcase,
    items: [
      { slug: 'pipeline', path: '/pipeline', label: 'Pipeline', icon: Target },
      { slug: 'suporte', path: '/suporte', label: 'Suporte', icon: Headphones },
    ],
  },
  {
    type: 'group',
    category: 'Cadastros',
    id: 'cadastros',
    icon: FolderOpen,
    items: [
      { slug: 'delegacias', path: '/delegacias', label: 'Delegacias', icon: Building2 },
      { slug: 'users', path: '/users', label: 'Usuários', icon: Users },
      { slug: 'colaboradores', path: '/colaboradores', label: 'Colaboradores', icon: UserCog, isSuperAdminOnly: true },
    ],
  },
  {
    type: 'group',
    category: 'Administrativo',
    id: 'administrativo',
    icon: Settings2,
    items: [
      { slug: 'propostas', path: '/propostas', label: 'Propostas', icon: FileText },
      { slug: 'contratos', path: '/contratos', label: 'Contratos', icon: PenLine },
      { slug: 'nfe', path: '/nfe', label: 'Notas Fiscais', icon: Receipt },
    ],
  },
  {
    type: 'group',
    category: 'Financeiro',
    id: 'financeiro',
    icon: Wallet,
    items: [
      { slug: 'faturas', path: '/faturas', label: 'Faturas (Receitas)', icon: TrendingUp },
      { slug: 'despesas', path: '/despesas', label: 'Despesas (Custos)', icon: TrendingDown }
    ],
  },
];
