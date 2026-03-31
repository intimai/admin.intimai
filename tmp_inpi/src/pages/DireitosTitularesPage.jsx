import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, FileText, Download, Trash2, Edit, Eye, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { lgpdService } from '@/lib/lgpdService';

const DireitosTitularesPage = () => {
  const [formData, setFormData] = useState({
    nome: '',
    documento: '',
    email: '',
    telefone: '',
    tipoSolicitacao: '',
    descricao: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Enviar solicitação usando o serviço LGPD
      const result = await lgpdService.enviarSolicitacao(formData);
      
      console.log('Solicitação enviada com sucesso:', result);
      setSubmitted(true);
    } catch (error) {
      console.error('Erro ao enviar solicitação:', error);
      alert('Erro ao enviar solicitação: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
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

        {/* Success Message */}
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <Card>
            <CardContent className="p-8 text-center">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-green-600 mb-4">Solicitação Enviada com Sucesso!</h2>
              <p className="text-muted-foreground mb-6">
                Sua solicitação foi recebida e será processada em até <strong>10 dias úteis</strong>. 
                Você receberá uma resposta através do email informado.
              </p>
                             <div className="border border-border p-4 rounded-lg mb-6">
                 <h3 className="font-semibold text-foreground mb-2">Próximos Passos:</h3>
                 <ul className="text-sm text-muted-foreground space-y-1">
                   <li>• Verificação da identidade do solicitante</li>
                   <li>• Análise da solicitação pela equipe responsável</li>
                   <li>• Resposta detalhada sobre os dados solicitados</li>
                   <li>• Implementação das medidas solicitadas (quando aplicável)</li>
                 </ul>
               </div>
              <Button 
                onClick={() => setSubmitted(false)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Nova Solicitação
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
               <h2 className="text-2xl font-bold active-link-gradient italic">Direitos dos Titulares de Dados</h2>
               <p className="text-gray-600 text-sm">Exercer seus direitos conforme a Lei Geral de Proteção de Dados (LGPD).</p>
             </CardContent>
           </Card>

          {/* Card do Conteúdo */}
          <Card>
            <CardContent className="p-8">
              <div className="space-y-8 text-muted-foreground">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                    <Eye className="w-5 h-5 mr-2 text-purple-600" />
                    Seus Direitos Conforme a LGPD
                  </h3>
                  <p>
                    Como titular de dados pessoais tratados pelo sistema IntimAI, você tem direito a:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                    <li><strong>Confirmação e Acesso:</strong> Saber se seus dados são tratados e acessá-los</li>
                    <li><strong>Correção:</strong> Solicitar correção de dados incompletos ou incorretos</li>
                    <li><strong>Informações:</strong> Obter informações sobre compartilhamento de dados</li>
                    <li><strong>Portabilidade:</strong> Receber seus dados em formato estruturado</li>
                  </ul>
                </div>

                                 <div className="border border-border p-4 rounded-lg">
                   <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center">
                     <AlertCircle className="w-5 h-5 mr-2 text-yellow-600" />
                     Direitos Limitados
                   </h3>
                   <p className="text-sm">
                     <strong>Importante:</strong> Devido à base legal específica (Art. 7º, III LGPD - execução de políticas públicas), 
                     alguns direitos como <strong>exclusão</strong> e <strong>oposição</strong> são limitados pela necessidade 
                     de manutenção dos dados para fins legais e de auditoria.
                   </p>
                 </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-purple-600" />
                    Como Exercer Seus Direitos
                  </h3>
                  <p>
                    Para exercer seus direitos, preencha o formulário abaixo. Sua solicitação será analisada 
                    e respondida em até <strong>10 dias úteis</strong>, conforme exigido pela LGPD.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

        {/* Card do Formulário */}
        <Card>
          <CardContent className="p-8">
            <h3 className="text-xl font-bold text-purple-600 mb-6">Formulário de Solicitação</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Nome Completo *
                  </label>
                  <Input
                    value={formData.nome}
                    onChange={(e) => handleInputChange('nome', e.target.value)}
                    placeholder="Digite seu nome completo"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    CPF/CNPJ *
                  </label>
                  <Input
                    value={formData.documento}
                    onChange={(e) => handleInputChange('documento', e.target.value)}
                    placeholder="Digite seu CPF ou CNPJ"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email *
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Digite seu email"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Telefone
                  </label>
                  <Input
                    value={formData.telefone}
                    onChange={(e) => handleInputChange('telefone', e.target.value)}
                    placeholder="Digite seu telefone"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Tipo de Solicitação *
                </label>
                <Select 
                  value={formData.tipoSolicitacao} 
                  onValueChange={(value) => handleInputChange('tipoSolicitacao', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de solicitação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="acesso">Confirmação e Acesso aos Dados</SelectItem>
                    <SelectItem value="correcao">Correção de Dados</SelectItem>
                    <SelectItem value="informacoes">Informações sobre Compartilhamento</SelectItem>
                    <SelectItem value="portabilidade">Portabilidade de Dados</SelectItem>
                    <SelectItem value="outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Descrição da Solicitação *
                </label>
                <Textarea
                  value={formData.descricao}
                  onChange={(e) => handleInputChange('descricao', e.target.value)}
                  placeholder="Descreva detalhadamente sua solicitação..."
                  rows={4}
                  required
                />
              </div>

                             <div className="border border-border p-4 rounded-lg">
                 <h4 className="font-semibold text-foreground mb-2">Informações Importantes:</h4>
                 <ul className="text-sm text-muted-foreground space-y-1">
                   <li>• Sua identidade será verificada antes do processamento</li>
                   <li>• Resposta será enviada em até 10 dias úteis</li>
                   <li>• Dados sensíveis podem ser solicitados para verificação</li>
                   <li>• Em caso de dúvidas, entre em contato com a instituição responsável</li>
                 </ul>
               </div>

              <div className="flex justify-center">
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-purple-600 hover:bg-purple-700 px-8"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Enviar Solicitação
                    </>
                  )}
                </Button>
              </div>
            </form>
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
            href="/termos-de-uso" 
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Termos de Uso
          </a>
          <a 
            href="/transparencia" 
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Portal de Transparência
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

export default DireitosTitularesPage;
