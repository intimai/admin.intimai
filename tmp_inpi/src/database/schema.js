/**
 * Este arquivo contém os esquemas das tabelas do banco de dados.
 * Serve como uma fonte única de verdade para a estrutura do banco de dados.
 */

// Esquema da tabela usuarios
export const usuariosSchema = {
  tableName: 'usuarios',
  columns: {
    userId: {
      type: 'uuid',
      notNull: true,
      defaultValue: 'gen_random_uuid()',
      primaryKey: true
    },
    nome: {
      type: 'text',
      notNull: true
    },
    estadoId: {
      type: 'integer',
      notNull: false
    },
    criadoEm: {
      type: 'timestamp without time zone',
      notNull: false,
      defaultValue: 'now()'
    },
    atualizadoEm: {
      type: 'timestamp without time zone',
      notNull: false,
      defaultValue: 'now()'
    },
    delegadoResponsavel: {
      type: 'text',
      notNull: false
    },
    delegaciaId: {
      type: 'integer',
      notNull: false
    },
    email: {
      type: 'text',
      notNull: true,
      unique: true
    }
  },
  foreignKeys: {
    fk_user_auth: {
      columns: ['userId'],
      references: 'auth.users(id)',
      onDelete: 'CASCADE'
    },
    usuarios_delegacia_fk: {
      columns: ['delegaciaId'],
      references: 'delegacias(delegaciaId)',
      onDelete: 'CASCADE'
    },
    usuarios_estado_id_fkey: {
      columns: ['estadoId'],
      references: 'estados_dominios(estadoId)'
    }
  }
};

// Esquema da tabela estados_dominios
export const estadosDominiosSchema = {
  tableName: 'estados_dominios',
  columns: {
    estadoId: {
      type: 'serial',
      notNull: true,
      primaryKey: true
    },
    estado: {
      type: 'text',
      notNull: true
    },
    sigla: {
      type: 'text',
      notNull: true,
      unique: true
    },
    dominio: {
      type: 'text',
      notNull: true,
      unique: true
    }
  }
};

// Esquema da tabela delegacias
export const delegaciasSchema = {
  tableName: 'delegacias',
  columns: {
    delegaciaId: {
      type: 'integer',
      notNull: true,
      primaryKey: true,
      identity: true
    },
    nome: {
      type: 'text',
      notNull: true
    },
    limiteUsuarios: {
      type: 'integer',
      notNull: false,
      defaultValue: 5
    },
    estadoId: {
      type: 'integer',
      notNull: false
    },
    endereco: {
      type: 'text',
      notNull: false
    },
    cidadeEstado: {
      type: 'text',
      notNull: false
    },
    telefone: {
      type: 'text',
      notNull: false
    },
    bloqueado: {
      type: 'boolean',
      notNull: true,
      defaultValue: false
    }
  }
};

// Esquema da tabela intimacoes
export const intimacoesSchema = {
  tableName: 'intimacoes',
  columns: {
    id: {
      type: 'serial',
      notNull: true,
      primaryKey: true
    },
    userId: {
      type: 'uuid',
      notNull: false
    },
    intimadoNome: {
      type: 'text',
      notNull: true
    },
    telefone: {
      type: 'text',
      notNull: true
    },
    documento: {
      type: 'text',
      notNull: false
    },
    tipoProcedimento: {
      type: 'text',
      notNull: true
    },
    numeroProcedimento: {
      type: 'text',
      notNull: true
    },
    dataHoraSolicitacao: {
      type: 'timestamp without time zone',
      notNull: false,
      defaultValue: 'now()'
    },
    status: {
      type: 'text',
      notNull: false,
      defaultValue: "'pendente'"
    },
    comparecimento: {
      type: 'text',
      notNull: false,
      defaultValue: "'pendente'"
    },
    motivo: {
      type: 'text',
      notNull: false
    },
    criadoEm: {
      type: 'timestamp without time zone',
      notNull: false,
      defaultValue: 'now()'
    },
    atualizadoEm: {
      type: 'timestamp without time zone',
      notNull: false,
      defaultValue: 'now()'
    },
    delegadoResponsavel: {
      type: 'text',
      notNull: false
    },
    delegaciaId: {
      type: 'integer',
      notNull: false
    },
    dataAgendada: {
      type: 'date',
      notNull: false
    },
    horaAgendada: {
      type: 'time without time zone',
      notNull: false
    },
    primeiraDisponibilidade: {
      type: 'text',
      notNull: false
    },
    cancelamentoEmAndamento: {
      type: 'boolean',
      notNull: false,
      defaultValue: false
    }
  },
  foreignKeys: {
    fk_intimacoes_delegacia: {
      columns: ['delegaciaId'],
      references: 'delegacias(delegaciaId)'
    },
    intimacoes_delegacia_fk: {
      columns: ['delegaciaId'],
      references: 'delegacias(delegaciaId)',
      onDelete: 'CASCADE'
    },
    intimacoes_user_id_fkey: {
      columns: ['userId'],
      references: 'usuarios(userId)'
    }
  },

  // Tabela de logs de auditoria
  audit_logs: {
    columns: {
      id: {
        type: 'uuid',
        notNull: true,
        defaultValue: 'gen_random_uuid()'
      },
      userId: {
        type: 'uuid',
        notNull: false
      },
      userEmail: {
        type: 'text',
        notNull: false
      },
      userNome: {
        type: 'text',
        notNull: false
      },
      delegaciaNome: {
        type: 'text',
        notNull: false
      },
      actionType: {
        type: 'text',
        notNull: true
      },
      resourceType: {
        type: 'text',
        notNull: true
      },
      resourceId: {
        type: 'text',
        notNull: false
      },
      details: {
        type: 'jsonb',
        notNull: false
      },
      ipAddress: {
        type: 'inet',
        notNull: false
      },
      userAgent: {
        type: 'text',
        notNull: false
      },
      createdAt: {
        type: 'timestamp with time zone',
        notNull: false,
        defaultValue: 'now()'
      }
    },
    foreignKeys: {
      audit_logs_user_fkey: {
        columns: ['userId'],
        references: 'auth.users(id)'
      }
    }
  }
};