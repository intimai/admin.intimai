import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { toast } from "sonner";
import { X, Send, Calendar as CalendarIcon, CheckCircle, AlertTriangle } from "lucide-react";
import { intimacaoSchema } from "@/schemas/intimacaoSchema";
import { useIntimacoes } from "@/hooks/useIntimacoes";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useHookFormMask } from "use-mask-input";

export const ReativarIntimacaoModal = ({ open: isOpen, onClose, intimacao, onSuccess }) => {
  const dateInputRef = useRef(null);
  const { user } = useAuth();
  const { reativarIntimacao } = useIntimacoes();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState("form");

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    resolver: zodResolver(intimacaoSchema),
    defaultValues: {
        nome_completo: intimacao?.intimadoNome || "",
        documento: intimacao?.documento || "",
        telefone: intimacao?.telefone || "",
        tipo_procedimento: intimacao?.tipoProcedimento || "",
        numero_procedimento: intimacao?.numeroProcedimento || "",
        data: '',
        periodo: ''
    }
  });

  useEffect(() => {
    if (intimacao) {
        reset({
            nome_completo: intimacao.intimadoNome,
            documento: intimacao.documento,
            telefone: intimacao.telefone,
            tipo_procedimento: intimacao.tipoProcedimento,
            numero_procedimento: intimacao.numeroProcedimento,
        });
    }
  }, [intimacao, reset]);


  const registerWithMask = useHookFormMask(register);
  const { ref: dataRegisterRef, ...dataRegisterProps } = register("data");

  const onSubmit = async (formData) => {
    if (!user) {
      toast.error("Você precisa estar logado para reativar uma intimação.");
      return;
    }

    setIsSubmitting(true);
    try {
      const [year, month, day] = formData.data.split("-");
      const formattedDate = `${day}/${month}/${year}`;
      const formattedPeriodo =
        formData.periodo.charAt(0).toUpperCase() + formData.periodo.slice(1);
      const primeiraDisponibilidade = `${formattedDate} - ${formattedPeriodo}`;

      const submissionData = {
        intimadoNome: formData.nome_completo,
        documento: formData.documento,
        telefone: formData.telefone,
        tipoProcedimento: formData.tipo_procedimento,
        numeroProcedimento: formData.numero_procedimento,
        primeiraDisponibilidade,
        motivo: formData.motivo || "",
      };

      // Usar a função específica de reativação que já tem webhook correto
      const result = await reativarIntimacao(intimacao, submissionData);
      
      if (result && result.length > 0) {
        toast.success("Intimação reativada com sucesso!");
      }

      setSubmissionStatus("success");
    } catch (error) {
      console.error("Erro ao reativar intimação:", error);
      toast.error(`Falha ao reativar intimação: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

    const handleContinue = async () => {
      reset();
      setSubmissionStatus("form");
      // Não fazer refresh aqui - deixar para o handleClose
    };

    const handleClose = () => {
      reset();
      setSubmissionStatus("form");
      
      // Chamar callback de sucesso para atualizar a lista (mesma lógica do CreateIntimacaoModal)
      if (onSuccess) {
        onSuccess();
      }
      
      onClose();
    };

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
        <style>
          {`
            #data::-webkit-calendar-picker-indicator {
              display: none;
              -webkit-appearance: none;
            }
          `}
        </style>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          <Card className="w-full">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-green-600">Reativar Intimação</CardTitle>
                  {submissionStatus === "form" && (
                    <p className="text-red-500 text-xs mt-4">
                      Atenção: Confirme os dados, especialmente o telefone, e escolha uma nova data/período.
                    </p>
                  )}
                </div>
                <Button variant="ghost" size="icon" onClick={handleClose} className="-mt-2 -mr-2">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {submissionStatus === "form" ? (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="nome_completo">Nome Completo</Label>
                      <Input id="nome_completo" {...register("nome_completo")} disabled />
                    </div>
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="documento">Documento (CPF/CNPJ)</Label>
                      <Input id="documento" {...register("documento")} disabled />
                    </div>
                  </div>

                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
                      {...registerWithMask("telefone", ["(99) 99999-9999", "(99) 9999-9999"])}
                    />
                    {errors.telefone && (
                      <p className="text-red-500 text-xs">
                        {errors.telefone.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="tipo_procedimento">Tipo de Procedimento</Label>
                      <Input id="tipo_procedimento" {...register("tipo_procedimento")} disabled />
                    </div>
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="numero_procedimento">Número do Procedimento</Label>
                      <Input id="numero_procedimento" {...register("numero_procedimento")} disabled />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="data">Nova Data de Disponibilidade</Label>
                      <div className="relative flex items-center">
                        <CalendarIcon
                          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-600 cursor-pointer"
                          onClick={() => dateInputRef.current?.showPicker()}
                        />
                        <Input
                          id="data"
                          type="date"
                          className="pl-10"
                          min={minDate}
                          {...dataRegisterProps}
                          ref={(e) => {
                            dataRegisterRef(e);
                            dateInputRef.current = e;
                          }}
                        />
                      </div>
                      {errors.data && (
                        <p className="text-red-500 text-xs">
                          {errors.data.message}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="periodo">Período</Label>
                      <Select
                        onValueChange={(value) =>
                          setValue("periodo", value, { shouldValidate: true })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o período" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manha">Manhã</SelectItem>
                          <SelectItem value="tarde">Tarde</SelectItem>
                          <SelectItem value="ambos">Ambos</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.periodo && (
                        <p className="text-red-500 text-xs">
                          {errors.periodo.message}
                        </p>
                      )}
                    </div>
                  </div>



                  <div className="flex justify-end space-x-4 pt-4">
                    <Button type="button" variant="ghost" onClick={handleClose}>
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {isSubmitting ? "Reativando..." : "Reativar Intimação"}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="text-center p-8 space-y-6">
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 260,
                      damping: 20,
                    }}
                  >
                    <CheckCircle className="h-16 w-16 mx-auto text-green-500" />
                  </motion.div>
                  <h3 className="text-2xl font-bold" style={{ color: '#D1D5DB' }}>
                    Intimação Reativada com Sucesso!
                  </h3>
                  <p className="text-gray-600">
                    Uma nova intimação foi criada com o status "pendente".
                  </p>
                  <div className="flex justify-center space-x-4 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClose}
                    >
                      Encerrar
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
};