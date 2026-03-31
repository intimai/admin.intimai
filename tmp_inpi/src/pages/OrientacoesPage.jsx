import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const OrientacoesPage = () => {
  const orientations = [
    {
      title: 'Uso Geral da Plataforma',
      content: 'Leia atentamente as orientações abaixo para explorar todas as funcionalidades do app e otimizar sua rotina. Em caso de dúvidas, entre em contato com o suporte através do menu lateral "Suporte". Entraremos em contato em breve para garantir sua melhor experiência com o IntimAI.',
    },
    {
      title: 'Conectividade da Instância do WhatsApp',
      content: 'A conexão com a instância de WhatsApp da Delegacia é vital para o envio de novas intimações e manutenção das conversas ativas com os intimados. Nossa equipe faz um acompanhamento contínuo para que sua comexão nunca seja perdida. Mas, para evitar períodos de instabilidade, procure verificar periodicamente se o status da conexão está "Conectado", através do menu lateral "Conexão". Caso o status esteja "Desconectado", faça a leitura do QRCode que aparece na tela. Para acessar o local correto para a leitura do QRCode, encontre o menu "Dispositivos Conectados", no Whatsapp do celular oficial da Delegacia. Whatsapp Conectado é fundamental para que o sistema esteja ativo e funcionando corretamente.',
    },
    {
      title: 'Status das Intimações e Precisão dos Dados',
      content: 'Monitore regularmente o status das suas intimações para garantir que nenhuma ação seja perdida. Utilize o menu "Glossário" para entender e acompanhar todo o ciclo de vida de suas intimações, utilizando os recursos do sistema para cancelar, reativar e monitorar as etapas executadas pelo IntimAI nos bastidores. Sua participação nesse processo é essencial para que tenha o controle do que está acontecendo com suas intimações em tempo real e para o melhor funcionamento do sistema.',
    },
    {
      title: 'Consentimento e Direitos dos Titulares (LGPD)',
      content: (
        <>
          A sua privacidade e a proteção dos seus dados são nossa prioridade. Ao se cadastrar, você concordou com nossos Termos de Uso e nossa{' '}
          <Link to="/politica-de-privacidade" className="text-purple-600 hover:underline">
            Política de Privacidade
          </Link>
          , em conformidade com a Lei Geral de Proteção de Dados (LGPD). Nela, detalhamos como seus dados são coletados, usados e protegidos. Você pode revisar esses documentos a qualquer momento para entender seus direitos.
        </>
      ),
    },
    {
      title: 'Gerenciamento de Agenda',
      content: (
        <div className="text-justify space-y-3">
          <p>
            O sistema IntimAI utiliza uma janela de agendamentos de 30 em 30 minutos, tendo como padrão o período de 08:00 às 10:30 para "Manhã" e de 13:00 às 16:30 para "Tarde", com a possibibilidade de escolha de um dos períodos ou ambos no formulário de nova intimação.
          </p>
          <p>
            É recomendável que você gerencie a quantidade de intimações cadastradas por período para que não ultrapassem este limite (6 agendamentos para o período "Manhã" e 8 para o período "Tarde", totalizando 14 horários diários) para a melhor performance dos agendamentos feitos pelo IntimAI.
          </p>
          <p>
            Caso sejam cadastradas novas intimações acima deste limite, identificada a exaustão da agenda, as intimações excedentes serão tratadas como "Canceladas" por motivo "Agenda Cheia", sendo de responsabilidade do usuário solicitar a reativação para outro período futuro.
          </p>
          <p>
            Para eventuais intimações entregues externamente ao sistema IntimAI, por meio eletrônico ou documento oficial presencial, priorize a marcação entre períodos do sistema (Ex: 08:15; 08:45; 13:15, etc), mantendo sua agenda externa organizada para melhor curso do seu dia-a-dia.
          </p>
          <p>
            Em caso de marcações equivocadas no sistema ou impossibilidade de cumprimento de algum de seus horários já agendados, utilize a opção "Cancelar", disponível em sua agenda ou na consulta por intimação (a comunicação ao intimado será feita pelo IntimAI e, após a conclusão, o status será atualizado para "Cancelada").
          </p>
          <p>
            Suas sugestões serão sempre muito bem vindas através do menu "Suporte". Nosso propósito é a melhoria contínua das funcionalidades do IntimAI para o melhor atendimento à sua rotina de trabalho.
          </p>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="w-full">
        <CardContent className="p-4">
          <h2 className="text-2xl font-bold active-link-gradient italic">Orientações Importantes</h2>
          <p className="text-gray-600 text-sm">Siga estas diretrizes para garantir o melhor uso da plataforma IntimAI.</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-6">
          {orientations.map((orientation, index) => (
            <div key={index}>
              <h3 className="font-semibold text-lg text-chart-recusadas dark:text-chart-recusadas">{orientation.title}</h3>
              <div className="text-gray-700 dark:text-gray-300">{orientation.content}</div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default OrientacoesPage;
