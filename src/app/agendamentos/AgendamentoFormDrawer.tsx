"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Check, ChevronsUpDown, Plus } from "lucide-react";
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
import { Cliente } from "@/core/models/Cliente";

interface AgendamentoFormDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date | null;
  agendamento?: AgendamentoComDetalhes;
  onSuccess?: () => void;
  onAddCliente?: () => void;
  clienteSelected?: Cliente | null;
}

export function AgendamentoFormDrawer({
  open,
  onOpenChange,
  selectedDate: initialDate,
  agendamento,
  onSuccess,
  onAddCliente,
  clienteSelected
}: AgendamentoFormDrawerProps) {

  const { items: clientes } = useCliente();
  const { items: servicos } = useServico();

  const { criar, atualizar, buscarHorarios } = useAgendamento();

  const [data, setData] = useState<string>("");
  const [hora, setHora] = useState<string>("");
  const [clienteId, setClienteId] = useState<string>("");
  const [servicoId, setServicoId] = useState<string>("");

  const [openClienteCombobox, setOpenClienteCombobox] = useState(false);
  const [openServicoCombobox, setOpenServicoCombobox] = useState(false);
  const [openTimePopover, setOpenTimePopover] = useState(false);

  const [horariosDisponiveis, setHorariosDisponiveis] = useState<string[]>([]);
  const [loadingHorarios, setLoadingHorarios] = useState(false);
  const [loading, setLoading] = useState(false);

  const isEditing = !!agendamento;

  const getClienteLabel = () => {
    const clienteNaLista = clientes?.find((c: any) => c.id === clienteId);
    if (clienteNaLista) return clienteNaLista.nome;

    if (clienteSelected && clienteSelected.id === clienteId) {
      return clienteSelected.nome;
    }

    return "Selecione o cliente";
  };

  const getServicoLabel = () => {
    const servico = servicos?.find((s: any) => s.id === servicoId);
    return servico ? `${servico.nome} (${servico.duracaoMinutos} min)` : "Selecione o serviço";
  };

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
        if (clienteSelected) {
          setClienteId(clienteSelected.id || "");
        }
      }
    }
  }, [open, agendamento, initialDate, clienteSelected]);

  useEffect(() => {
    const carregarHorarios = async () => {
      if (!data || !servicoId || !servicos) {
        setHorariosDisponiveis([]);
        return;
      }

      const servicoSelecionado = servicos.find((s: any) => s.id === servicoId);
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
  }, [data, servicoId, servicos, buscarHorarios, isEditing]);

  const handleSave = async () => {
    if (!clienteId || !servicoId || !data || !hora) {
      toast.warning("Por favor, preencha todos os campos.");
      return;
    }

    setLoading(true);
    try {
      const dataHoraIso = format(new Date(`${data}T${hora}:00`), "yyyy-MM-dd'T'HH:mm:ssxxx");

      if (isEditing && agendamento?.id) {
        await atualizar(agendamento.id, {
          clienteId,
          servicoId,
          dataHora: dataHoraIso,
          status: agendamento.status
        });
        toast.success("Agendamento atualizado com sucesso!");
      } else {

        await criar({
          clienteId,
          servicoId,
          dataHora: dataHoraIso,
          status: "CONFIRMADO",
        });
        toast.success("Agendamento criado com sucesso!");
      }

      onOpenChange(false);
      onSuccess?.();

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
                          {clientes?.map((cliente: any) => (
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
                onClick={onAddCliente}
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
                        {servicos?.map((servico: any) => (
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
                  <PopoverContent className="w-[200px] p-0" align="start">
                    <Command>
                      <CommandList>
                        <CommandEmpty>Sem horários livres.</CommandEmpty>
                        <CommandGroup>
                          {horariosDisponiveis.map((time) => (
                            <CommandItem
                              key={time}
                              value={time}
                              onSelect={() => {
                                setHora(time);
                                setOpenTimePopover(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  hora === time ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {time}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
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
  );
}