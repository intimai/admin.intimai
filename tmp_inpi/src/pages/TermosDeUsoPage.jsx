import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const TermosDeUsoPage = () => {
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
            <h2 className="text-2xl font-bold active-link-gradient italic">Termos de Uso</h2>
            <p className="text-gray-600 text-sm">Sistema IntimAI - Plataforma para Policiais Civis</p>
          </CardContent>
        </Card>

          {/* Card do Conteúdo */}
          <Card>
            <CardContent className="py-8 space-y-8">
              
              {/* 1. Aceitação dos Termos */}
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  📋 1. Aceitação dos Termos
                </h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>
                    Ao utilizar o Sistema IntimAI, você, como <strong>policial civil</strong>, 
                    concorda integralmente com estes Termos de Uso e com nossa Política de Privacidade.
                  </p>
                  <p>
                    O uso do sistema está condicionado à aceitação expressa destes termos e 
                    ao cumprimento das normas legais aplicáveis ao exercício da função policial.
                  </p>
                </div>
              </section>

              {/* 2. Finalidade do Sistema */}
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  🎯 2. Finalidade do Sistema
                </h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>
                    O IntimAI é uma plataforma exclusiva para <strong>policiais civis</strong> 
                    destinada a:
                  </p>
                  <ul className="ml-6 space-y-2">
                    <li>• Gestão e entrega de intimações via WhatsApp</li>
                    <li>• Agendamento automatizado de oitivas utilizando IA</li>
                    <li>• Controle do ciclo de vida das intimações</li>
                    <li>• Organização da agenda individual de cada policial</li>
                    <li>• Acompanhamento das interações com intimados</li>
                  </ul>
                </div>
              </section>

              {/* 3. Responsabilidades do Usuário */}
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  ⚖️ 3. Responsabilidades do Usuário
                </h2>
                <div className="space-y-4 text-muted-foreground">
                  <div className="border border-border rounded-lg p-4">
                    <h3 className="font-semibold text-foreground mb-2">
                      3.1 Tratamento de Dados de Terceiros
                    </h3>
                    <p>
                      Como agente público, você é responsável por:
                    </p>
                    <ul className="ml-4 mt-2 space-y-1">
                      <li>• Inserir dados precisos e atualizados dos intimados</li>
                      <li>• Utilizar as informações apenas para fins legais e funcionais</li>
                      <li>• Manter sigilo sobre dados sensíveis conforme legislação</li>
                      <li>• Não compartilhar credenciais de acesso com terceiros</li>
                    </ul>
                  </div>

                  <div className="border border-border rounded-lg p-4">
                    <h3 className="font-semibold text-foreground mb-2">
                      3.2 Uso Adequado da Plataforma
                    </h3>
                    <ul className="ml-4 space-y-1">
                      <li>• Utilizar o sistema apenas para atividades funcionais</li>
                      <li>• Não tentar burlar medidas de segurança</li>
                      <li>• Reportar falhas de segurança ou funcionamento</li>
                      <li>• Manter dados de acesso seguros e atualizados</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* 4. Dados Coletados */}
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  🔒 4. Dados Coletados e Tratados
                </h2>
                <div className="space-y-4 text-muted-foreground">
                  <div className="border border-border rounded-lg p-4">
                    <h3 className="font-semibold text-foreground mb-2">
                      4.1 Seus Dados (Usuário do Sistema)
                    </h3>
                    <ul className="ml-4 space-y-1">
                      <li>• Nome, e-mail e dados funcionais</li>
                      <li>• Informações da delegacia de lotação</li>
                      <li>• Logs de acesso e utilização</li>
                      <li>• Histórico de ações para auditoria</li>
                    </ul>
                  </div>

                  <div className="border border-border rounded-lg p-4">
                    <h3 className="font-semibold text-foreground mb-2">
                      4.2 Dados de Terceiros (Intimados)
                    </h3>
                    <ul className="ml-4 space-y-1">
                      <li>• Dados pessoais (nome, CPF, RG, telefone)</li>
                      <li>• Endereços e informações de contato</li>
                      <li>• Dados processuais e de intimações</li>
                      <li>• Histórico de comunicações via WhatsApp</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* 5. Segurança e Proteção */}
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  🛡️ 5. Segurança e Proteção de Dados
                </h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>
                    Implementamos medidas técnicas e organizacionais para proteger os dados:
                  </p>
                  <ul className="ml-6 space-y-2">
                    <li>• Criptografia de dados sensíveis</li>
                    <li>• Controle de acesso baseado em delegacia</li>
                    <li>• Logs de auditoria completos</li>
                    <li>• Backups seguros e regulares</li>
                    <li>• Monitoramento de segurança 24/7</li>
                  </ul>
                </div>
              </section>

              {/* 6. Limitações e Responsabilidades */}
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  ⚠️ 6. Limitações e Responsabilidades
                </h2>
                <div className="space-y-3 text-muted-foreground">
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <p className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2">
                      Importante:
                    </p>
                    <ul className="space-y-1">
                      <li>• O sistema é uma ferramenta auxiliar ao trabalho policial</li>
                      <li>• A responsabilidade legal pelos dados permanece com o policial</li>
                      <li>• Não nos responsabilizamos por uso inadequado da plataforma</li>
                      <li>• Falhas técnicas podem ocorrer e serão corrigidas prontamente</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* 7. Alterações nos Termos */}
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  🔄 7. Alterações nos Termos
                </h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>
                    Estes termos podem ser atualizados periodicamente. Usuários serão 
                    notificados sobre alterações significativas e deverão aceitar os 
                    novos termos para continuar utilizando o sistema.
                  </p>
                </div>
              </section>

              {/* 8. Contato */}
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  📞 8. Contato e Suporte
                </h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>
                    Para dúvidas, suporte técnico ou questões relacionadas à privacidade:
                  </p>
                  <div className="border border-border rounded-lg p-4 bg-card/50">
                    <p><strong>E-mail:</strong> suporte@intimai.app</p>
                    <p><strong>Sistema de Suporte:</strong> Disponível no menu lateral da plataforma</p>
                  </div>
                </div>
              </section>

              {/* Data de Atualização */}
              <div className="border-t border-border pt-6 mt-8">
                <p className="text-sm text-muted-foreground text-center">
                  <strong>Última atualização:</strong> {new Date().toLocaleDateString('pt-BR')}
                </p>
              </div>

            </CardContent>
          </Card>

        {/* Links de Navegação */}
        <div className="flex justify-center space-x-4">
          <a 
            href="/privacidade" 
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Política de Privacidade
          </a>
          <a 
            href="/transparencia" 
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
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

export default TermosDeUsoPage;
