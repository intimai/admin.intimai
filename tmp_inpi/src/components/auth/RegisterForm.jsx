import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

const steps = [
  { id: 1, title: 'Escolha do Estado', description: 'Selecione seu estado' },
  { id: 2, title: 'Escolha da Delegacia', description: 'Selecione sua delegacia' },
  { id: 3, title: 'Dados do Usuário', description: 'Preencha seus dados' },
  { id: 4, title: 'Criação de Conta', description: 'Finalize seu cadastro' }
];

export function RegisterForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    estadoId: '',
    delegaciaId: '',
    nomeCompleto: '',
    delegadoResponsavel: '',
    emailPrefix: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [estados, setEstados] = useState([]);
  const [delegacias, setDelegacias] = useState([]);
  const { signUp } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const fetchEstados = async () => {
      const { data, error } = await supabase.from('estados_dominios').select('*');
      if (error) {
        toast({ title: "Erro ao carregar estados", variant: "destructive" });
      } else {
        setEstados(data);
      }
    };
    fetchEstados();
  }, []);

  useEffect(() => {
    if (formData.estadoId) {
      const fetchDelegacias = async () => {
        const { data, error } = await supabase
          .from('delegacias')
          .select('"delegaciaId", nome, endereco, telefone, "estadoId", "limiteUsuarios"')
          .eq('"estadoId"', formData.estadoId);

        if (error) {
          toast({ title: "Erro ao carregar delegacias", variant: "destructive" });
        } else {
          setDelegacias(data);
        }
      };
      fetchDelegacias();
    } else {
      setDelegacias([]);
    }
  }, [formData.estadoId]);

  const selectedEstado = estados.find(e => e.estadoId === parseInt(formData.estadoId));
  const selectedDelegacia = delegacias.find(d => d.delegaciaId === parseInt(formData.delegaciaId));

  const validateStep = (step) => {
    const newErrors = {};
    switch (step) {
      case 1: if (!formData.estadoId) newErrors.estadoId = 'Selecione um estado'; break;
      case 2: if (!formData.delegaciaId) newErrors.delegaciaId = 'Selecione uma delegacia'; break;
      case 3:
        if (!formData.nomeCompleto) newErrors.nomeCompleto = 'Nome completo é obrigatório';
        if (!formData.delegadoResponsavel) newErrors.delegadoResponsavel = 'Delegado responsável é obrigatório';
        if (!formData.emailPrefix) newErrors.emailPrefix = 'Prefixo do email é obrigatório';
        
        // Validação para impedir @ no email
        if (formData.emailPrefix && formData.emailPrefix.includes('@')) {
          newErrors.emailPrefix = 'Não digite @ no email. O domínio será adicionado automaticamente.';
        }
        
        // Validação para impedir domínio duplicado
        if (formData.emailPrefix && selectedEstado && formData.emailPrefix.includes(selectedEstado.dominio.replace('@', ''))) {
          newErrors.emailPrefix = `Não digite o domínio ${selectedEstado.dominio}. Ele será adicionado automaticamente.`;
        }
        break;
      case 4:
        if (!formData.password) newErrors.password = 'Senha é obrigatória';
        if (formData.password.length < 6) newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Senhas não coincidem';
        break;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = async () => {
    if (validateStep(4) && selectedEstado) {
      setLoading(true);
      
      const fullEmail = `${formData.emailPrefix}${selectedEstado.dominio.startsWith('@') ? '' : '@'}${selectedEstado.dominio}`;

      const { error } = await signUp(
        fullEmail,
        formData.password,
        {
          nome: formData.nomeCompleto,
          delegado_responsavel: formData.delegadoResponsavel,
          estado_id: parseInt(formData.estadoId),
          delegacia_id: parseInt(formData.delegaciaId),
        }
      );

      if (!error) {
        toast({
          title: "Verifique seu email!",
          description: "Enviamos um link de confirmação para seu email.",
        });
        
        // Redirecionar para login após 3 segundos para usuário ver a mensagem
        setTimeout(() => {
          window.location.href = '/login';
        }, 3000);
      } else {
        // Tratar erro 422 (email já existe) e outros erros
        if (error.message?.includes('already') || error.message?.includes('exists')) {
          toast({
            title: "Email já cadastrado",
            description: "Este email já possui uma conta. Tente fazer login.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Erro no cadastro",
            description: error.message || "Ocorreu um erro inesperado. Tente novamente.",
            variant: "destructive"
          });
        }
      }
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div>
            <Label htmlFor="estado">Estado</Label>
            <Select value={formData.estadoId} onValueChange={(value) => setFormData({...formData, estadoId: value, delegaciaId: ''})}>
              <SelectTrigger className={errors.estadoId ? 'border-red-500' : ''}><SelectValue placeholder="Selecione um estado" /></SelectTrigger>
              <SelectContent>
                {estados.map((estado) => <SelectItem key={estado.estadoId} value={estado.estadoId.toString()}>{estado.estado}</SelectItem>)}
              </SelectContent>
            </Select>
            {errors.estadoId && <p className="text-sm text-red-500 mt-1">{errors.estadoId}</p>}
          </div>
        );
      case 2:
        return (
          <div>
            <Label htmlFor="delegacia">Delegacia</Label>
            <Select value={formData.delegaciaId} onValueChange={(value) => setFormData({...formData, delegaciaId: value})}>
              <SelectTrigger className={errors.delegaciaId ? 'border-red-500' : ''}><SelectValue placeholder="Selecione uma delegacia" /></SelectTrigger>
              <SelectContent>
                {delegacias.map((d) => <SelectItem key={d.delegaciaId} value={d.delegaciaId.toString()}>{d.nome}</SelectItem>)}
              </SelectContent>
            </Select>
            {errors.delegaciaId && <p className="text-sm text-red-500 mt-1">{errors.delegaciaId}</p>}
            {selectedDelegacia && (
              <div className="mt-4 p-4 bg-secondary rounded-lg text-sm text-secondary-foreground">
                <p><strong>Endereço:</strong> {selectedDelegacia.endereco}</p>
                <p><strong>Telefone:</strong> {selectedDelegacia.telefone}</p>
              </div>
            )}
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="nomeCompleto">Nome Completo</Label>
              <Input id="nomeCompleto" value={formData.nomeCompleto} onChange={(e) => setFormData({...formData, nomeCompleto: e.target.value})} className={errors.nomeCompleto ? 'border-red-500' : ''} />
              {errors.nomeCompleto && <p className="text-sm text-red-500 mt-1">{errors.nomeCompleto}</p>}
            </div>
            <div>
              <Label htmlFor="delegadoResponsavel">Delegado Responsável</Label>
              <Input id="delegadoResponsavel" value={formData.delegadoResponsavel} onChange={(e) => setFormData({...formData, delegadoResponsavel: e.target.value})} className={errors.delegadoResponsavel ? 'border-red-500' : ''} />
              {errors.delegadoResponsavel && <p className="text-sm text-red-500 mt-1">{errors.delegadoResponsavel}</p>}
            </div>
            <div>
              <Label htmlFor="emailPrefix">Email</Label>
              <div className="flex items-center space-x-2">
                <Input 
                  id="emailPrefix" 
                  value={formData.emailPrefix} 
                  onChange={(e) => {
                    let value = e.target.value;
                    // Remover @ automaticamente se o usuário tentar digitar
                    value = value.replace('@', '');
                    // Remover domínio se o usuário tentar digitar
                    if (selectedEstado && value.includes(selectedEstado.dominio.replace('@', ''))) {
                      value = value.replace(selectedEstado.dominio.replace('@', ''), '');
                    }
                    setFormData({...formData, emailPrefix: value});
                  }} 
                  className={errors.emailPrefix ? 'border-red-500' : ''} 
                  placeholder="usuario" 
                />
                <span className="text-muted-foreground">{selectedEstado?.dominio ? `${selectedEstado.dominio.startsWith('@') ? '' : '@'}${selectedEstado.dominio}` : '...'}</span>
              </div>
              {errors.emailPrefix && <p className="text-sm text-red-500 mt-1">{errors.emailPrefix}</p>}
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className={`${errors.password ? 'border-red-500' : ''} pr-10`} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <div className="relative">
                <Input id="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} className={`${errors.confirmPassword ? 'border-red-500' : ''} pr-10`} />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-sm text-red-500 mt-1">{errors.confirmPassword}</p>}
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="w-full max-w-[448px] mx-auto">
      <Card className="card-hover glass-effect border-border">
        <CardHeader>
          <CardTitle className="text-center active-link-gradient">{steps[currentStep - 1].title}</CardTitle>
          <p className="text-center text-muted-foreground text-sm">{steps[currentStep - 1].description}</p>
          <div className="flex items-center justify-center space-x-2 mt-4">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep > step.id ? 'bg-green-500 text-white' : currentStep === step.id ? 'gradient-purple text-white' : 'bg-secondary text-secondary-foreground'}`}>
                  {currentStep > step.id ? <Check className="w-4 h-4" /> : step.id}
                </div>
                {index < steps.length - 1 && <div className={`w-8 h-0.5 mx-2 ${currentStep > step.id ? 'bg-green-500' : 'bg-secondary'}`} />}
              </React.Fragment>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <motion.div key={currentStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
            {renderStepContent()}
          </motion.div>
          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={prevStep} disabled={currentStep === 1}><ChevronLeft className="w-4 h-4 mr-2" />Anterior</Button>
            {currentStep < 4 ? (
              <Button onClick={nextStep} className="btn-primary">Próximo<ChevronRight className="w-4 h-4 ml-2" /></Button>
            ) : (
              <Button onClick={handleSubmit} className="btn-primary" disabled={loading}>
                {loading ? 'Criando...' : <><Check className="w-4 h-4 mr-2" />Criar Conta</>}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      <div className="text-center mt-6">
        <p className="mt-6 text-center text-muted-foreground">
            Já tem uma conta?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Faça login
            </Link>
          </p>
      </div>
      <p className="text-center text-xs text-muted-foreground mt-4">powered by Aurios AI</p>
    </div>
  );
}