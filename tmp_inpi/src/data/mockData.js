
export const estadosDominios = [
  { estadoId: 1, nome: 'São Paulo', dominio: 'delegacia.sp.gov.br' },
  { estadoId: 2, nome: 'Rio de Janeiro', dominio: 'delegacia.rj.gov.br' },
  { estadoId: 3, nome: 'Minas Gerais', dominio: 'delegacia.mg.gov.br' },
  { estadoId: 4, nome: 'Bahia', dominio: 'delegacia.ba.gov.br' },
  { estadoId: 5, nome: 'Paraná', dominio: 'delegacia.pr.gov.br' },
  { estadoId: 6, nome: 'Rio Grande do Sul', dominio: 'delegacia.rs.gov.br' },
  { estadoId: 7, nome: 'Pernambuco', dominio: 'delegacia.pe.gov.br' },
  { estadoId: 8, nome: 'Ceará', dominio: 'delegacia.ce.gov.br' },
  { estadoId: 9, nome: 'Pará', dominio: 'delegacia.pa.gov.br' },
  { estadoId: 10, nome: 'Santa Catarina', dominio: 'delegacia.sc.gov.br' }
];

export const delegacias = [
  // São Paulo
  { delegaciaId: 1, nome: '1ª DP - Centro', estadoId: 1, limiteUsuarios: 10, endereco: 'Rua da Consolação, 100', cidadeEstado: 'São Paulo - SP', telefone: '(11) 3333-1001', bloqueado: false },
  { delegaciaId: 2, nome: '2ª DP - Bom Retiro', estadoId: 1, limiteUsuarios: 8, endereco: 'Rua José Paulino, 200', cidadeEstado: 'São Paulo - SP', telefone: '(11) 3333-1002', bloqueado: false },
  { delegaciaId: 3, nome: '3ª DP - Campos Elíseos', estadoId: 1, limiteUsuarios: 5, endereco: 'Alameda Barão de Limeira, 300', cidadeEstado: 'São Paulo - SP', telefone: '(11) 3333-1003', bloqueado: false },
  
  // Rio de Janeiro
  { delegaciaId: 4, nome: '1ª DP - Praça Mauá', estadoId: 2, limiteUsuarios: 12, endereco: 'Praça Mauá, 10', cidadeEstado: 'Rio de Janeiro - RJ', telefone: '(21) 2222-2001', bloqueado: false },
  { delegaciaId: 5, nome: '2ª DP - Flamengo', estadoId: 2, limiteUsuarios: 6, endereco: 'Rua do Flamengo, 150', cidadeEstado: 'Rio de Janeiro - RJ', telefone: '(21) 2222-2002', bloqueado: false },
  
  // Minas Gerais
  { delegaciaId: 6, nome: '1ª DP - Centro', estadoId: 3, limiteUsuarios: 8, endereco: 'Av. Afonso Pena, 500', cidadeEstado: 'Belo Horizonte - MG', telefone: '(31) 3333-3001', bloqueado: false },
  { delegaciaId: 7, nome: '2ª DP - Savassi', estadoId: 3, limiteUsuarios: 4, endereco: 'Rua da Bahia, 800', cidadeEstado: 'Belo Horizonte - MG', telefone: '(31) 3333-3002', bloqueado: false },
  
  // Bahia
  { delegaciaId: 8, nome: '1ª DP - Pelourinho', estadoId: 4, limiteUsuarios: 10, endereco: 'Largo do Pelourinho, 1', cidadeEstado: 'Salvador - BA', telefone: '(71) 3333-4001', bloqueado: false },
  
  // Paraná
  { delegaciaId: 9, nome: '1ª DP - Centro', estadoId: 5, limiteUsuarios: 7, endereco: 'Rua XV de Novembro, 600', cidadeEstado: 'Curitiba - PR', telefone: '(41) 3333-5001', bloqueado: false },
  
  // Rio Grande do Sul
  { delegaciaId: 10, nome: '1ª DP - Centro Histórico', estadoId: 6, limiteUsuarios: 9, endereco: 'Rua dos Andradas, 700', cidadeEstado: 'Porto Alegre - RS', telefone: '(51) 3333-6001', bloqueado: false }
];

export const usuarios = [
  { userId: '1', nome: 'João Silva', email: 'joao.silva@delegacia.sp.gov.br', delegadoResponsavel: 'Dr. Carlos Santos', estadoId: 1, delegaciaId: 1 },
  { userId: '2', nome: 'Maria Oliveira', email: 'maria.oliveira@delegacia.sp.gov.br', delegadoResponsavel: 'Dra. Ana Costa', estadoId: 1, delegaciaId: 1 },
  { userId: '3', nome: 'Pedro Santos', email: 'pedro.santos@delegacia.rj.gov.br', delegadoResponsavel: 'Dr. Roberto Lima', estadoId: 2, delegaciaId: 4 },
  { userId: '4', nome: 'Ana Costa', email: 'ana.costa@delegacia.mg.gov.br', delegadoResponsavel: 'Dr. Fernando Alves', estadoId: 3, delegaciaId: 6 },
  { userId: '5', nome: 'Carlos Ferreira', email: 'carlos.ferreira@delegacia.sp.gov.br', delegadoResponsavel: 'Dra. Lucia Mendes', estadoId: 1, delegaciaId: 3 }
];

export const intimacoes = [
  {
    id: 1,
    nomeIntimado: 'Roberto Silva Santos',
    documento: '123.456.789-00',
    telefone: '(11) 99999-1234',
    motivo: 'Depoimento sobre furto de veículo - Processo 2024.001.123',
    dataSelecionada: '2024-01-15',
    periodo: 'manhã',
    status: 'ativa',
    usuarioId: '1',
    criadoEm: '2024-01-10T10:00:00Z',
    respostas: [
      { timestamp: '2024-01-10T10:30:00Z', mensagem: 'Intimação enviada via WhatsApp' },
      { timestamp: '2024-01-10T14:20:00Z', mensagem: 'Intimado confirmou presença para o dia 15/01 pela manhã' }
    ]
  },
  {
    id: 2,
    nomeIntimado: 'Maria Fernanda Costa',
    documento: '987.654.321-00',
    telefone: '(11) 88888-5678',
    motivo: 'Testemunha em caso de agressão - Processo 2024.002.456',
    dataSelecionada: '2024-01-18',
    periodo: 'tarde',
    status: 'pendente',
    usuarioId: '1',
    criadoEm: '2024-01-12T09:15:00Z',
    respostas: [
      { timestamp: '2024-01-12T09:30:00Z', mensagem: 'Intimação enviada via WhatsApp' },
      { timestamp: '2024-01-12T16:45:00Z', mensagem: 'Intimado solicitou reagendamento' }
    ]
  },
  {
    id: 3,
    nomeIntimado: 'José Carlos Oliveira',
    documento: '456.789.123-00',
    telefone: '(11) 77777-9012',
    motivo: 'Esclarecimentos sobre denúncia - Processo 2024.003.789',
    dataSelecionada: '2024-01-20',
    periodo: 'ambos',
    status: 'encerrada',
    usuarioId: '2',
    criadoEm: '2024-01-08T11:30:00Z',
    respostas: [
      { timestamp: '2024-01-08T12:00:00Z', mensagem: 'Intimação enviada via WhatsApp' },
      { timestamp: '2024-01-08T18:30:00Z', mensagem: 'Intimado confirmou presença' },
      { timestamp: '2024-01-20T09:00:00Z', mensagem: 'Compareceu conforme agendado' }
    ]
  }
];
