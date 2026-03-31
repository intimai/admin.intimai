import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Filter, Calendar, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useIntimacoes } from '@/hooks/useIntimacoes';
import { CreateIntimacaoModal } from '@/components/dashboard/CreateIntimacaoModal';
import { IntimacaoCard } from '@/components/dashboard/IntimacaoCard';
import { Pagination } from '@/components/ui/Pagination';
import { chartColors } from '@/config/chartColors';
import { toast } from '@/components/ui/use-toast';
import { useDebounce } from '@/hooks/useDebounce';

export function IntimacoesPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingIntimacao, setEditingIntimacao] = useState(null);
  const [filter, setFilter] = useState('todas');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Hook de debounce para otimizar a busca
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  const { 
    intimacoes, 
    loading, 
    fetchIntimacoes, 
    cancelIntimacao,
    createIntimacao,
    mutate: refreshIntimacoes,
    // Novos recursos de paginação
    currentPage,
    totalItems,
    itemsPerPage,
    hasNextPage,
    hasPreviousPage,
    totalPages,
    goToNextPage,
    goToPreviousPage,
    goToPage,
    fetchIntimacoesWithFilters
  } = useIntimacoes();

  const handleCreationSubmit = async (formData) => {
    // A lógica de criação e tratamento de erro agora está centralizada no CreateIntimacaoModal.
    // A página apenas se preocupa em recarregar os dados em caso de sucesso.
    const statusFilter = filter === 'todas' ? null : statusMap[filter];
    fetchIntimacoesWithFilters(statusFilter, debouncedSearchTerm);
    toast({ title: "Intimação criada com sucesso!" });
  };

  const handleOpenCreateModal = () => {
    setEditingIntimacao(null);
    setShowCreateModal(true);
  };

  // Efeito para buscar quando filtros ou busca mudarem
  useEffect(() => {
    const statusFilter = filter === 'todas' ? null : statusMap[filter];
    fetchIntimacoesWithFilters(statusFilter, debouncedSearchTerm);
  }, [filter, debouncedSearchTerm, fetchIntimacoesWithFilters]);

  const handleCancelIntimacao = async (id) => {
    try {
      await cancelIntimacao(id);
      toast({ title: "Solicitação de cancelamento enviada." });
      // Re-fetch mantendo os filtros atuais
      const statusFilter = filter === 'todas' ? null : statusMap[filter];
      fetchIntimacoesWithFilters(statusFilter, debouncedSearchTerm);
    } catch (error) {
      toast({ title: "Erro ao solicitar cancelamento", description: error.message, variant: "destructive" });
    }
  };

  const handleFilterChange = useCallback((newFilter) => {
    setFilter(newFilter);
    // A busca será disparada automaticamente pelo useEffect
  }, []);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
    // A busca será disparada automaticamente pelo useEffect após o debounce
  }, []);

  const filterColorClasses = {
    pendentes: { text: 'text-chart-pendentes', border: 'border-chart-pendentes' },
    entregues: { text: 'text-chart-entregues', border: 'border-chart-entregues' },
    ativas: { text: 'text-chart-ativas', border: 'border-chart-ativas' },
    agendadas: { text: 'text-chart-agendadas', border: 'border-chart-agendadas' },
    recusadas: { text: 'text-chart-recusadas', border: 'border-chart-recusadas' },
    canceladas: { text: 'text-chart-canceladas', border: 'border-chart-canceladas' },
    finalizadas: { text: 'text-chart-finalizadas', border: 'border-chart-finalizadas' },
    ausentes: { text: 'text-chart-ausentes', border: 'border-chart-ausentes' },
  };

  const statusMap = {
    pendentes: 'pendente',
    entregues: 'entregue',
    ativas: 'ativa',
    agendadas: 'agendada',
    recusadas: 'recusada',
    canceladas: 'cancelada',
    finalizadas: 'finalizada',
    ausentes: 'ausente',
  };

  // Remover filtragem local - agora é feita no backend
  // const filteredIntimacoes = intimacoes; // Direto do hook já filtrado

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="w-full">
        <CardContent className="p-4">
          <h2 className="text-2xl font-bold active-link-gradient italic">Intimações</h2>
          <p className="text-gray-600 text-sm">Visualize e gerencie suas intimações de forma eficiente.</p>
        </CardContent>
      </Card>

        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Buscar por nome ou documento..."
                  className="pl-10 w-full"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
              <Button onClick={handleOpenCreateModal} className="btn-primary w-full md:w-auto flex-shrink-0">
                <Plus className="w-4 h-4 mr-2" />
                Nova Intimação
              </Button>
            </div>
            <div className="mt-4 border-b border-gray-200 dark:border-gray-700 overflow-x-auto pb-1">
              <div className="flex min-w-max gap-x-4 px-1">
                  {[
                    { key: 'todas', label: 'Todas' },
                    { key: 'pendentes', label: 'Pendentes' },
                    { key: 'entregues', label: 'Entregues' },
                    { key: 'ativas', label: 'Ativas' },
                    { key: 'agendadas', label: 'Agendadas' },
                    { key: 'recusadas', label: 'Recusadas' },
                    { key: 'canceladas', label: 'Canceladas' },
                    { key: 'finalizadas', label: 'Finalizadas' },
                    { key: 'ausentes', label: 'Ausentes' },
                  ].map(f => {
                    const isSelected = filter === f.key;
                    const colorClasses = filterColorClasses[f.key];

                    let textColorClass;
                    let borderColorClass;

                    if (f.key === 'todas') {
                      textColorClass = 'text-gray-900 dark:text-white';
                    } else {
                      textColorClass = colorClasses.text;
                    }

                    if (isSelected) {
                      if (f.key === 'todas') {
                        borderColorClass = 'border-gray-900 dark:border-white';
                      } else {
                        borderColorClass = colorClasses.border;
                      }
                    } else {
                      borderColorClass = 'border-transparent';
                    }

                    return (
                      <button
                        key={f.key}
                        onClick={() => handleFilterChange(f.key)}
                        className={`
                          py-2 px-1 text-sm font-medium transition-all duration-200
                          border-b-2 hover:border-gray-300 dark:hover:border-gray-600
                          ${isSelected ? 'font-bold' : ''} ${textColorClass} ${borderColorClass}
                        `}
                      >
                        {f.label}
                      </button>
                    );
                  })}
              </div>
            </div>

            <div className="pt-4 space-y-6">
                {intimacoes.length === 0 ? (
                <div className="p-12 text-center">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white">Nenhuma intimação encontrada</h3>
                    <p className="text-gray-400 mb-4">Tente um filtro diferente ou crie uma nova intimação.</p>
                    <Button onClick={() => setShowCreateModal(true)} className="btn-primary"><Plus className="w-4 h-4 mr-2" />Criar Intimação</Button>
                </div>
                ) : (
                <>
                  <div className="space-y-4">
                      {intimacoes.map((intimacao, index) => (
                      <motion.div key={intimacao.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                          <IntimacaoCard intimacao={intimacao} onCancel={handleCancelIntimacao} onReativar={() => {
                            // Re-fetch mantendo os filtros atuais
                            const statusFilter = filter === 'todas' ? null : statusMap[filter];
                            fetchIntimacoesWithFilters(statusFilter, debouncedSearchTerm);
                          }} />
                      </motion.div>
                      ))}
                  </div>
                  
                  {/* Componente de paginação */}
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    hasNextPage={hasNextPage}
                    hasPreviousPage={hasPreviousPage}
                    onPageChange={goToPage}
                    onNextPage={goToNextPage}
                    onPreviousPage={goToPreviousPage}
                    totalItems={totalItems}
                    itemsPerPage={itemsPerPage}
                    className="mt-6"
                  />
                </>
                )}
            </div>
          </CardContent>
        </Card>

        <CreateIntimacaoModal
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreationSubmit} // Passa a função de recarregamento
        />
    </div>
  );
}