import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';

export function PerfilPage() {
  const { user, loading } = useAuth();
  const [nome, setNome] = useState('');
  const [delegadoResponsavel, setDelegadoResponsavel] = useState('');

  useEffect(() => {
    if (user) {
      setNome(user.nome || '');
      setDelegadoResponsavel(user.delegadoResponsavel || '');
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('usuarios')
      .update({ 
        nome: nome,
        delegadoResponsavel: delegadoResponsavel 
      })
      .eq('userId', user.id);

    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao salvar alterações.', description: error.message });
    } else {
      toast({ title: 'Perfil salvo com sucesso!' });
      // Opcional: forçar a recarga dos dados do usuário no contexto para refletir as alterações imediatamente
    }
  };

  if (loading) {
    return <div className="text-center p-4">Carregando...</div>;
  }

  if (!user) {
    return <div className="text-center p-4">Usuário não autenticado.</div>;
  }

  return (
    <div className="space-y-6">
      <Card className="w-full">
        <CardContent className="p-4">
          <h2 className="text-2xl font-bold active-link-gradient italic">Perfil</h2>
          <p className="text-gray-600 text-sm">Gerencie suas informações de perfil.</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div>
            <Label htmlFor="nome">Nome</Label>
            <Input id="nome" name="nome" value={nome} onChange={(e) => setNome(e.target.value)} />
          </div>
          <div>
            <Label>Email</Label>
            <Input value={user.email} disabled />
          </div>
          <div>
            <Label>Delegacia</Label>
            <Input value={user.delegaciaNome || 'N/A'} disabled />
          </div>
          <div>
            <Label>Endereço da Delegacia</Label>
            <Input value={user.delegaciaEndereco || 'N/A'} disabled />
          </div>
          <div>
            <Label htmlFor="delegadoResponsavel">Delegado Responsável</Label>
            <Input id="delegadoResponsavel" name="delegadoResponsavel" value={delegadoResponsavel} onChange={(e) => setDelegadoResponsavel(e.target.value)} />
          </div>
          <Button onClick={handleSave} className="w-full btn-primary">Salvar Alterações</Button>
        </CardContent>
      </Card>
    </div>
  );
}