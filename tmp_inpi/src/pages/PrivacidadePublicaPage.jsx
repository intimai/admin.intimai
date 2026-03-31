import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Users, FileText, Phone, Calendar, Lock, Eye, Download, Trash2 } from 'lucide-react';

const PrivacidadePublicaPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header com Logo */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center">
          <img 
            src="/logo.png" 
            alt="IntimAI Logo" 
            className="h-12 w-auto"
          />
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-4 space-y-6 max-w-5xl">
        {/* Card do Título */}
        <Card className="w-full">
          <CardContent className="p-4 text-center">
            <h2 className="text-2xl font-bold active-link-gradient italic">Política de Privacidade</h2>
            <p className="text-gray-600 text-sm">Informações sobre o tratamento de dados pessoais no sistema IntimAI.</p>
          </CardContent>
        </Card>

        {/* Card do Conteúdo */}
        <Card>
          <CardContent className="p-8">
            <div className="space-y-8 text-muted-foreground">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-purple-600" />
                  Sobre o IntimAI
                </h3>
                <p>
                  O <strong>IntimAI</strong> é uma ferramenta utilizada por <strong>agentes públicos (policiais civis)</strong> 
                  para facilitar a entrega de intimações através de WhatsApp utilizando Inteligência Artificial. 
                  Este sistema permite o agendamento inteligente de oitivas e a gestão completa do ciclo de vida das intimações.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-purple-600" />
                  Dados Tratados
                </h3>
                <p>
                  <strong>IMPORTANTE:</strong> Os dados inseridos e manipulados no sistema são de <strong>terceiros (intimados)</strong>, 
                  não dos usuários (policiais). Estes dados são previamente manipulados e sob responsabilidade dos usuários, 
                  que são <strong>agentes públicos</strong> com prerrogativa legal para tal tratamento.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                  <Phone className="w-5 h-5 mr-2 text-purple-600" />
                  Dados Coletados dos Intimados
                </h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Nome completo</strong> do intimado</li>
                  <li><strong>Documento</strong> (CPF ou CNPJ)</li>
                  <li><strong>Telefone</strong> para contato</li>
                  <li><strong>Número do procedimento</strong> judicial</li>
                  <li><strong>Tipo de procedimento</strong></li>
                  <li><strong>Data e hora</strong> de agendamento</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-purple-600" />
                  Finalidade do Tratamento
                </h3>
                <p>
                  Os dados são utilizados exclusivamente para:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                  <li>Entrega de intimações via WhatsApp</li>
                  <li>Agendamento de oitivas através de IA</li>
                  <li>Gestão do ciclo de vida das intimações</li>
                  <li>Cumprimento de obrigações legais</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                  <Lock className="w-5 h-5 mr-2 text-purple-600" />
                  Base Legal
                </h3>
                <p>
                  O tratamento de dados pessoais ocorre sob <strong>amparo legal específico</strong> conforme 
                  <strong> Art. 7º, III da LGPD</strong> - <em>execução de políticas públicas</em>. 
                  A atividade policial constitui execução de política pública de segurança, 
                  dispensando consentimento específico do titular, mas requerendo transparência e proporcionalidade.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                  <Eye className="w-5 h-5 mr-2 text-purple-600" />
                  Seus Direitos como Intimado
                </h3>
                <p>
                  Conforme a Lei Geral de Proteção de Dados (LGPD), você tem direito a:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                  <li><strong>Confirmação e Acesso</strong> aos seus dados</li>
                  <li><strong>Correção</strong> de dados incompletos ou incorretos</li>
                  <li><strong>Informações</strong> sobre compartilhamento de dados</li>
                </ul>
                <p className="mt-3">
                  <strong>Direitos Limitados:</strong> Devido à base legal (política pública), 
                  alguns direitos como exclusão e oposição são limitados pela necessidade de 
                  manutenção dos dados para fins legais.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                  <Download className="w-5 h-5 mr-2 text-purple-600" />
                  Como Exercer Seus Direitos
                </h3>
                <p>
                  Para exercer seus direitos ou solicitar informações sobre seus dados, 
                  utilize nossa página dedicada de <strong>Direitos dos Titulares</strong> ou 
                  entre em contato através dos canais oficiais da instituição responsável.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                  <Trash2 className="w-5 h-5 mr-2 text-purple-600" />
                  Retenção de Dados
                </h3>
                <p>
                  Os dados são mantidos pelo tempo necessário para cumprimento das obrigações legais 
                  e para fins de auditoria e fiscalização. Após o período de retenção obrigatório, 
                  os dados são anonimizados ou eliminados de forma segura.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Links de Navegação */}
        <div className="flex justify-center space-x-4">
          <a 
            href="/transparencia" 
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Portal de Transparência
          </a>
          <a 
            href="/direitos-titulares" 
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Exercer Direitos
          </a>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-card/60 border-t border-border py-6">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2025 IntimAI - Sistema de Gestão de Intimações</p>
          <p className="text-sm mt-2">Powered by Aurios AI</p>
        </div>
      </footer>
    </div>
  );
};

export default PrivacidadePublicaPage;
