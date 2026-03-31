import React, { useState, useRef, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { toast } from "sonner";
import { X, Send, Calendar as CalendarIcon, CheckCircle } from "lucide-react";
import { intimacaoSchema } from "@/schemas/intimacaoSchema";
import { useIntimacoes } from "@/hooks/useIntimacoes";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useHookFormMask } from "use-mask-input";
import { 
  SUBMISSION_STATUS, 
  ANIMATIONS, 
  FORM_CONFIG, 
} from "@/constants";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { AlertCircle } from "lucide-react";

export const CreateIntimacaoModal = ({ open: isOpen, onClose, onSuccess }) => {
  const dateInputRef = useRef(null);
  const { user } = useAuth();
  const { createIntimacao, fetchIntimacoes } = useIntimacoes();
  const { handleIntimacaoError, handleAuthError } = useErrorHandler();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState(
    SUBMISSION_STATUS.FORM
  );
  const [duplicateDetails, setDuplicateDetails] = useState(null);

  // Memoizar cálculo da data mínima para evitar recálculos
  const minDate = useMemo(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + FORM_CONFIG.MIN_DATE_OFFSET);
    return tomorrow.toISOString().split("T")[0];
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    resolver: zodResolver(intimacaoSchema),
  });
  const registerWithMask = useHookFormMask(register);
  const { ref: dataRegisterRef, ...dataRegisterProps } = register("data");

  // Memoizar função de formatação de dados
  const formatSubmissionData = useCallback((formData) => {
    const [year, month, day] = formData.data.split("-");
    const formattedDate = `${day}/${month}/${year}`;
    const formattedPeriodo =
      formData.periodo.charAt(0).toUpperCase() + formData.periodo.slice(1);
    const primeiraDisponibilidade = `${formattedDate} - ${formattedPeriodo}`;

    return {
      intimadoNome: formData.nome_completo,
      documento: formData.documento,
      telefone: formData.telefone,
      tipoProcedimento: formData.tipo_procedimento,
      numeroProcedimento: formData.numero_procedimento,
      primeiraDisponibilidade,
      motivo: formData.motivo || "",
    };
  }, []);

  const onSubmit = useCallback(async (formData) => {
    if (!user) {
      handleAuthError("Usuário não autenticado");
      return;
    }

    setIsSubmitting(true);
    try {
      console.log("[CreateIntimacaoModal] Iniciando submissão...");
      const submissionData = formatSubmissionData(formData);
      await createIntimacao(submissionData);
      setSubmissionStatus(SUBMISSION_STATUS.SUCCESS);
      // A notificação de sucesso para a página pai agora é feita pelos botões de ação na tela de sucesso.
    } catch (error) {
      if (error.name === "DuplicateIntimacaoError") {
        setDuplicateDetails(error.details);
        setSubmissionStatus(SUBMISSION_STATUS.DUPLICATE);
      } else {
        console.log("[CreateIntimacaoModal] Erro genérico detectado. Chamando handleIntimacaoError.");
        // Usa o hook de erro para outros tipos de falha
        handleIntimacaoError(error);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [user, formatSubmissionData, createIntimacao, handleAuthError, handleIntimacaoError]);

  const handleSuccessAndClose = useCallback(() => {
    if (onSuccess) {
      onSuccess();
    }
    reset();
    setSubmissionStatus(SUBMISSION_STATUS.FORM);
    onClose();
  }, [onSuccess, reset, onClose]);

  const handleSuccessAndContinue = useCallback(() => {
    if (onSuccess) {
      onSuccess();
    }
    reset();
    setSubmissionStatus(SUBMISSION_STATUS.FORM);
    // Não fecha o modal, apenas reseta o formulário para uma nova intimação.
  }, [onSuccess, reset]);

  const handleClose = useCallback(() => {
    reset();
    setSubmissionStatus(SUBMISSION_STATUS.FORM);
    onClose();
  }, [reset, onClose]);

  // Validação de props
  if (!isOpen) return null;
  if (!onClose) {
    return null;
  }

  return (
    <>
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
          {...ANIMATIONS.MODAL}
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-purple-600">Nova Intimação</CardTitle>
              <Button variant="ghost" size="icon" onClick={handleClose}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {submissionStatus === SUBMISSION_STATUS.FORM ? (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="nome_completo">Nome Completo</Label>
                      <Input
                        id="nome_completo"
                        {...register("nome_completo")}
                      />
                      {errors.nome_completo && (
                        <p className="text-red-500 text-xs">
                          {errors.nome_completo.message}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="documento">Documento (CPF/RG)</Label>
                      <Input id="documento" {...register("documento")} />
                      {errors.documento && (
                        <p className="text-red-500 text-xs">
                          {errors.documento.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
                      placeholder="(XX) XXXXX-XXXX"
                      {...registerWithMask("telefone", FORM_CONFIG.PHONE_MASK)}
                    />
                    {errors.telefone && (
                      <p className="text-red-500 text-xs">
                        {errors.telefone.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="tipo_procedimento">
                        Tipo de Procedimento
                      </Label>
                      <Input
                        id="tipo_procedimento"
                        {...register("tipo_procedimento")}
                      />
                      {errors.tipo_procedimento && (
                        <p className="text-red-500 text-xs">
                          {errors.tipo_procedimento.message}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="numero_procedimento">
                        Número do Procedimento
                      </Label>
                      <Input
                        id="numero_procedimento"
                        {...register("numero_procedimento")}
                      />
                      {errors.numero_procedimento && (
                        <p className="text-red-500 text-xs">
                          {errors.numero_procedimento.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="data">Data</Label>
                      <div className="relative flex items-center">
                        <CalendarIcon
                          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-600 cursor-pointer"
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
                      className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {isSubmitting ? "Gerando..." : "Gerar Intimação"}
                    </Button>
                  </div>
                </form>
              ) : submissionStatus === SUBMISSION_STATUS.SUCCESS ? (
                <div className="text-center p-8 space-y-6">
                  <motion.div {...ANIMATIONS.SUCCESS}>
                    <CheckCircle className="h-16 w-16 mx-auto text-green-500" />
                  </motion.div>
                  <h3
                    className="text-2xl font-bold"
                    style={{ color: "#D1D5DB" }}
                  >
                    Intimação Registrada com Sucesso!
                  </h3>
                  <p className="text-gray-600">
                    A intimação foi enviada e o intimado será notificado em
                    breve.
                  </p>
                  <div className="flex justify-center space-x-4 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleSuccessAndClose}
                    >
                      Encerrar
                    </Button>
                    <Button
                      type="button"
                      onClick={handleSuccessAndContinue}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      Registrar Nova Intimação
                    </Button>
                  </div>
                </div>
              ) : (
                submissionStatus === SUBMISSION_STATUS.DUPLICATE && (
                  <div className="text-center p-8 space-y-6 bg-black rounded-lg">
                    <motion.div {...ANIMATIONS.SUCCESS}>
                      <AlertCircle className="h-16 w-16 mx-auto text-yellow-500" />
                    </motion.div>
                    <h3
                      className="text-2xl font-bold"
                      style={{ color: "#D1D5DB" }}
                    >
                      Intimação Duplicada
                    </h3>
                    <p className="text-gray-400">
                      Já existe uma intimação em andamento para este intimado no sistema. Para consistência das conversas iniciadas pela IA, somente uma intimação por número de telefone pode ser registrada por vez. Após a finalização da conversa atual entre o IntimAI e o intimado, novas intimações poderão ser geradas para o mesmo telefone. Caso o registro tenha sido feito por você, acompanhe o status da intimação anterior até que ela esteja Agendada ou Recusada, ou tente novamente mais tarde.
                    </p>
                    {duplicateDetails && (
                      <div className="text-left text-sm text-gray-500 pt-4">
                      </div>
                    )}
                    <div className="flex justify-center space-x-4 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleClose}
                      >
                        OK
                      </Button>
                    </div>
                  </div>
                )
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
};

export default CreateIntimacaoModal;