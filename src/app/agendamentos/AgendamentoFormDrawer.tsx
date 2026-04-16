"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toBlob } from "html-to-image";
import { Loader2, Check, ChevronsUpDown, Plus, Trash2Icon, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

import { useAgendamento } from "@/hooks/useAgendamento";
import { useCliente } from "@/hooks/useCliente";
import { useServico } from "@/hooks/useServico";
import { toast } from "sonner";
import { format } from "date-fns";
import { AgendamentoComDetalhes } from "@/core/services/AgendamentoService";
import { ClienteFormDrawer } from "../clientes/ClienteFormDrawer";

interface AgendamentoFormDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date | null;
  agendamento?: AgendamentoComDetalhes;
  onSuccess?: (id: string) => void;
}

export function AgendamentoFormDrawer({
  open,
  onOpenChange,
  selectedDate: initialDate,
  agendamento,
  onSuccess,
}: AgendamentoFormDrawerProps) {

  const { items: clientes, recarregar } = useCliente();
  const { items: servicos } = useServico();
  const { criar, atualizar, buscarHorarios } = useAgendamento();

  const popoverPrintRef = useRef<HTMLDivElement>(null);

  // --- Estados do Formulário ---
  const [data, setData] = useState<string>("");
  const [hora, setHora] = useState<string>("");
  const [clienteId, setClienteId] = useState<string>("");
  const [servicoId, setServicoId] = useState<string>("");

  // --- Estados de UI ---
  const [openClienteCombobox, setOpenClienteCombobox] = useState(false);
  const [openServicoCombobox, setOpenServicoCombobox] = useState(false);
  const [openTimePopover, setOpenTimePopover] = useState(false);
  const [openClienteForm, setOpenClienteForm] = useState(false);

  const [horariosDisponiveis, setHorariosDisponiveis] = useState<string[]>([]);
  const [loadingHorarios, setLoadingHorarios] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const isEditing = !!agendamento;

  // --- Labels ---
  const getClienteLabel = () => {
    const clienteNaLista = clientes?.find((c: Record<string, any>) => c.id === clienteId);
    if (clienteNaLista) return clienteNaLista.nome;
    return "Selecione o cliente";
  };

  const getServicoLabel = () => {
    const servico = servicos?.find((s: Record<string, any>) => s.id === servicoId);
    return servico ? `${servico.nome} (${servico.duracaoMinutos} min)` : "Selecione o serviço";
  };

  const handleShareHorarios = async () => {
    if (popoverPrintRef.current === null) return;
    setIsSharing(true);

    try {
      const diaFormatado = new Date(data).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
        weekday: "long"
      });

      // Gera a imagem com um fundo branco (evita fundo transparente no iOS)
      const blob = await toBlob(popoverPrintRef.current, {
        cacheBust: true,
        backgroundColor: "#ffffff"
      });

      if (!blob) throw new Error("Falha ao gerar imagem.");

      const file = new File([blob], `horarios-${data}.png`, { type: "image/png" });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Horários Disponíveis",
          text: `Confira os horários disponíveis para o dia ${diaFormatado}.`,
        });
      } else {
        // Fallback: Tenta copiar para a área de transferência
        const item = new ClipboardItem({ "image/png": blob });
        await navigator.clipboard.write([item]);
        toast.success("Imagem copiada para a área de transferência!");
      }
    } catch (error: any) {
      if (error.name !== "AbortError") {
        console.error("Erro ao compartilhar:", error);
        toast.error("Erro ao gerar a imagem dos horários.");
      }
    } finally {
      setIsSharing(false);
    }
  };

  // --- Reset ao fechar ---
  useEffect(() => {
    if (!open) {
      const timer = setTimeout(() => {
        setClienteId("");
        setServicoId("");
        setHora("");
        setData("");
        setHorariosDisponiveis([]);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // --- Inicialização ---
  useEffect(() => {
    if (open) {
      if (agendamento) {
        setClienteId(agendamento.clienteId);
        setServicoId(agendamento.servicoId);
        if (agendamento.dataHora) {
          const dataObj = new Date(agendamento.dataHora);
          setData(dataObj.toISOString().split("T")[0]);
          const horas = String(dataObj.getHours()).padStart(2, '0');
          const minutos = String(dataObj.getMinutes()).padStart(2, '0');
          setHora(`${horas}:${minutos}`);
        }
      } else if (initialDate) {
        setData(initialDate.toISOString().split("T")[0]);
      }
    }
  }, [open, agendamento, initialDate]);

  // --- Busca de Horários ---
  useEffect(() => {
    const carregarHorarios = async () => {
      if (!data || !servicoId || !servicos) {
        setHorariosDisponiveis([]);
        return;
      }

      const servicoSelecionado = servicos.find((s: Record<string, any>) => s.id === servicoId);
      if (!servicoSelecionado) return;

      setLoadingHorarios(true);
      try {
        const slots = await buscarHorarios(data, servicoSelecionado.duracaoMinutos);
        let slotsFinais = slots;

        if (isEditing && hora && !slots.includes(hora)) {
          slotsFinais = [hora, ...slots].sort();
        }

        setHorariosDisponiveis(slotsFinais);

        if (!slotsFinais.includes(hora) && !isEditing) {
          setHora("");
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingHorarios(false);
      }
    };

    carregarHorarios();
  }, [hora, data, servicoId, servicos, buscarHorarios, isEditing]);

  // --- Handlers ---

  const handleClienteSuccess = async (novoCliente: Record<string, any>) => {
    setOpenClienteForm(false);
    if (novoCliente?.id) {
      setClienteId(novoCliente.id);
    }
  };

  const handleSave = async () => {
    if (!clienteId || !servicoId || !data || !hora) {
      toast.warning("Por favor, preencha todos os campos.");
      return;
    }

    setLoading(true);
    try {
      let id = agendamento?.id;
      const dataHoraIso = format(new Date(`${data}T${hora}:00`), "yyyy-MM-dd'T'HH:mm:ssxxx");

      if (isEditing && id) {
        await atualizar(id, {
          clienteId: clienteId,
          servicoId: servicoId,
          dataHora: dataHoraIso,
          status: agendamento.status
        });
        toast.success("Agendamento atualizado com sucesso!");
      } else {
        id = await criar({
          clienteId,
          servicoId,
          dataHora: dataHoraIso,
          status: "CONFIRMADO",
        });
        toast.success("Agendamento criado com sucesso!");
      }

      onOpenChange(false);
      onSuccess?.(id);

      if (!isEditing) {
        setClienteId("");
        setServicoId("");
        setHora("");
      }

    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error(error instanceof Error ? error.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  if (!initialDate && !agendamento) return null;

  return (
    <>
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="bg-card">
          <div className="mx-auto w-full max-w-sm">
            <DrawerHeader>
              <DrawerTitle>
                {isEditing ? "Editar Agendamento" : "Novo Agendamento"}
              </DrawerTitle>
            </DrawerHeader>

            <div className="p-4 space-y-4">

              <div className="space-y-2 flex flex-row items-center justify-between gap-2">
                <div className="w-full space-y-2 flex flex-col">
                  <Label>Cliente *</Label>
                  <Popover open={openClienteCombobox} onOpenChange={setOpenClienteCombobox} modal={true}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openClienteCombobox}
                        className="w-full justify-between font-normal"
                      >
                        {clienteId ? getClienteLabel() : "Pesquisar cliente..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Escreva o nome..." />
                        <CommandList>
                          <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
                          <CommandGroup>
                            {clientes?.map((cliente: Record<string, any>) => (
                              <CommandItem
                                key={cliente.id}
                                value={cliente.nome}
                                onSelect={() => {
                                  setClienteId(cliente.id);
                                  setOpenClienteCombobox(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    clienteId === cliente.id ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {cliente.nome}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                <Button
                  type="button"
                  variant="default"
                  size="icon"
                  disabled={loading}
                  className="mt-3"
                  onClick={() => setOpenClienteForm(true)}
                  title="Cadastrar novo cliente"
                >
                  <Plus className="size-5 font-bold" />
                </Button>
              </div>

              <div className="space-y-2 flex flex-col">
                <Label>Serviço *</Label>
                <Popover open={openServicoCombobox} onOpenChange={setOpenServicoCombobox} modal={true}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openServicoCombobox}
                      className="w-full justify-between font-normal"
                    >
                      {servicoId ? getServicoLabel() : "Pesquisar serviço..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Escreva o nome..." />
                      <CommandList>
                        <CommandEmpty>Nenhum serviço encontrado.</CommandEmpty>
                        <CommandGroup>
                          {servicos?.map((servico: Record<string, any>) => (
                            <CommandItem
                              key={servico.id}
                              value={servico.nome}
                              onSelect={() => {
                                setServicoId(servico.id);
                                setOpenServicoCombobox(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  servicoId === servico.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {servico.nome} ({servico.duracaoMinutos} min)
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid grid-cols-[2fr_1fr] gap-2">
                <div className="space-y-2 flex flex-col">
                  <Label>Horário *</Label>
                  <Popover open={openTimePopover} onOpenChange={setOpenTimePopover} modal={true}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openTimePopover}
                        className={cn(
                          "w-full justify-between font-normal",
                          !hora && "text-muted-foreground"
                        )}
                        disabled={!servicoId || !data || loadingHorarios}
                      >
                        {loadingHorarios ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" /> Buscando...
                          </span>
                        ) : hora ? (
                          hora
                        ) : (
                          "Selecione..."
                        )}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 flex flex-col" align="start">
                      <div ref={popoverPrintRef} className="bg-card rounded-md shadow-md">
                        <div className="p-2 border-b bg-muted/10 flex flex-row items-center justify-between">
                          <p className="ml-2 text-sm font-semibold">Escolha um horário: </p>
                          <div className="flex gap-1 ml-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs text-muted-foreground hover:text-primary"
                              disabled={isSharing || horariosDisponiveis.length === 0}
                              onClick={handleShareHorarios}
                              title="Compartilhar horários com o cliente"
                            >
                              {isSharing ? <Loader2 className="size-4 animate-spin" /> : <Share2 className="size-4" />}
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs text-muted-foreground hover:text-red-700 dark:hover:text-red-500"
                              disabled={!hora}
                              onClick={() => { setHora(""); }}
                              title="Limpar horário"
                            >
                              <Trash2Icon className="size-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="h-[300px] overflow-y-auto p-4">
                          <div className="grid grid-cols-4 gap-2">
                            {horariosDisponiveis.length > 0 ? (
                              horariosDisponiveis.map((time) => (
                                <Button
                                  key={time}
                                  variant={hora === time ? "primary_outline" : "outline"}
                                  className={cn(
                                    "rounded-full h-8 text-xs transition-all",
                                    hora === time && "ring-2 ring-primary font-bold bg-primary/5"
                                  )}
                                  onClick={() => {
                                    setHora(time);
                                    setOpenTimePopover(false);
                                  }}
                                >
                                  {time}
                                </Button>
                              ))
                            ) : (
                              <div className="col-span-4 text-sm text-muted-foreground py-2 text-center w-[200px]">
                                {!loadingHorarios && "Nenhum horário disponível."}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Data *</Label>
                  <Input
                    type="date"
                    id="date"
                    required
                    value={data}
                    onClick={(e) => e.currentTarget.showPicker()}
                    onChange={(e) => setData(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <DrawerFooter>
              <Button onClick={handleSave} disabled={loading || !hora}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {loading ? "Salvando..." : isEditing ? "Salvar Alterações" : "Confirmar Agendamento"}
              </Button>
              <DrawerClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DrawerClose>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>

      <ClienteFormDrawer
        open={openClienteForm}
        onOpenChange={setOpenClienteForm}
        onSuccess={handleClienteSuccess}
      />
    </>
  );
}