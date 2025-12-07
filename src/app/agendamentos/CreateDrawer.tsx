"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react"; // Ícone de loading opcional
import { Check, ChevronsUpDown } from "lucide-react";
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
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useAgendamento } from "@/hooks/useAgendamento";
import { useCliente } from "@/hooks/useCliente";
import { useServico } from "@/hooks/useServico";
import { toast } from "sonner";
import { set } from "date-fns";

interface CreateDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: Date | null;
}

export function CreateDrawer({ open, onOpenChange, data }: CreateDrawerProps) {
  const { items: clientes } = useCliente();
  const { items: servicos } = useServico();
  const { criar, buscarHorarios } = useAgendamento();

  // Estados do Formulário
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [clienteId, setClienteId] = useState<string>("");
  const [servicoId, setServicoId] = useState<string>("");
  const [openClienteCombobox, setOpenClienteCombobox] = useState(false);
  const [openServicoCombobox, setOpenServicoCombobox] = useState(false);


  // Estado para a lista de horários calculados
  const [horariosDisponiveis, setHorariosDisponiveis] = useState<string[]>([]);
  const [loadingHorarios, setLoadingHorarios] = useState(false);

  const [loading, setLoading] = useState(false);

  const getClienteLabel = () => {
    const cliente = clientes?.find((c: any) => c.id === clienteId);
    return cliente ? cliente.nome : "Selecione o cliente";
  };

  const getServicoLabel = () => {
    const servico = servicos?.find((s: any) => s.id === servicoId);
    return servico ? `${servico.nome} (${servico.duracaoMinutos} minutos)` : "Selecione o serviço";
  };

  // Efeito 1: Preencher data inicial
  useEffect(() => {
    if (data) {
      setSelectedDate(data.toISOString().split("T")[0]);
    }
  }, [data]);

  // Efeito 2: CALCULAR HORÁRIOS
  // Sempre que mudar a Data OU o Serviço, recalculamos os horários
  useEffect(() => {
    const carregarHorarios = async () => {
      // Só calcula se tivermos data e serviço selecionados
      if (!selectedDate || !servicoId || !servicos) {
        setHorariosDisponiveis([]);
        return;
      }

      // Encontrar a duração do serviço selecionado
      const servicoSelecionado = servicos.find((s: any) => s.id === servicoId);
      if (!servicoSelecionado) return;

      setLoadingHorarios(true);
      try {
        const slots = await buscarHorarios(selectedDate, servicoSelecionado.duracaoMinutos);
        setHorariosDisponiveis(slots);

        // Se o horário selecionado anteriormente não existir mais na nova lista, limpa
        if (!slots.includes(selectedTime)) {
          setSelectedTime("");
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingHorarios(false);
      }
    };

    carregarHorarios();
  }, [selectedDate, servicoId, servicos, buscarHorarios, selectedTime]);

  useEffect(() => {
    if (!open) {
      const timeout = setTimeout(() => {
        setClienteId("");
        setServicoId("");
        setSelectedTime("");
        setHorariosDisponiveis([]);
      }, 300);

      return () => clearTimeout(timeout);
    }
  }, [open]);

  const handleSave = async () => {
    if (!clienteId || !servicoId || !selectedDate || !selectedTime) {
      alert("Por favor, preencha todos os campos.");
      return;
    }

    setLoading(true);
    try {
      const dataHoraIso = new Date(`${selectedDate}T${selectedTime}:00Z`).toISOString();

      await criar({
        clienteId,
        servicoId: servicoId,
        dataHora: dataHoraIso,
        status: "CONFIRMADO",
      });

      onOpenChange(false);
      // Limpeza de estados
      setClienteId("");
      setServicoId("");
      setSelectedTime("");
    } catch (error) {
      console.error("Erro ao criar agendamento:", error);
      toast.error(error instanceof Error ? error.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  if (!data) return null;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="bg-card">
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Novo Agendamento</DrawerTitle>
          </DrawerHeader>

          <div className="p-4 space-y-4">
            <div className="space-y-2 flex flex-col">
              <Label>Cliente *</Label>
              <Popover open={openClienteCombobox} onOpenChange={setOpenClienteCombobox}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openClienteCombobox}
                    className="w-full justify-between font-normal" // w-full para largura total
                  >
                    {clienteId ? getClienteLabel() : "Pesquisar cliente..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>

                {/* O Conteúdo do Popover deve ter a largura do container pai */}
                <PopoverContent className="w-xs p-0">
                  <Command>
                    <CommandInput placeholder="Escreva o nome..." />
                    <CommandList>
                      <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
                      <CommandGroup>
                        {clientes?.map((cliente: any) => (
                          <CommandItem
                            key={cliente.id}
                            value={cliente.nome} // O value é o que usamos para filtrar (nome)
                            onSelect={() => {
                              setClienteId(cliente.id); // Guardamos o ID
                              setOpenClienteCombobox(false); // Fecha ao selecionar
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

            {/* 3. Seleção de Serviço (Gatilho para Horários) */}
            <div className="space-y-2">
              <div className="space-y-2 flex flex-col">
                <Label>Serviço *</Label>
                <Popover open={openServicoCombobox} onOpenChange={setOpenServicoCombobox}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openServicoCombobox}
                      className="w-full justify-between font-normal" // w-full para largura total
                    >
                      {servicoId ? getServicoLabel() : "Pesquisar serviço..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>

                  {/* O Conteúdo do Popover deve ter a largura do container pai */}
                  <PopoverContent className="w-xs p-0">
                    <Command>
                      <CommandInput placeholder="Escreva o nome..." />
                      <CommandList>
                        <CommandEmpty>Nenhum serviço encontrado.</CommandEmpty>
                        <CommandGroup>
                          {servicos?.map((servico: any) => (
                            <CommandItem
                              key={servico.id}
                              value={servico.nome} // O value é o que usamos para filtrar (nome)
                              onSelect={() => {
                                setServicoId(servico.id); // Guardamos o ID
                                setOpenServicoCombobox(false); // Fecha ao selecionar
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  servicoId === servico.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {servico.nome} ({servico.duracaoMinutos} minutos)
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid grid-cols-[1fr_2fr] gap-2">
              <div className="space-y-2">
                <Label htmlFor="date">Data *</Label>
                <Input
                  type="date"
                  id="date"
                  value={selectedDate}
                  onClick={(e) => e.currentTarget.showPicker()}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="time">Horário Disponível *</Label>
                  {loadingHorarios && <Loader2 className="h-3 w-3 animate-spin" />}
                </div>

                <Select
                  value={selectedTime}
                  onValueChange={setSelectedTime}
                  disabled={!servicoId || !selectedDate || loadingHorarios}
                >
                  <SelectTrigger id="time" className="w-full">
                    <SelectValue placeholder={
                      !servicoId ? "Selecione o serviço"
                        : loadingHorarios ? "Buscando horários..."
                          : "Selecione o horário"
                    } />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {horariosDisponiveis.length > 0 ? (
                      horariosDisponiveis.map((horario) => (
                        <SelectItem key={horario} value={horario}>
                          {horario}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-2 text-sm text-muted-foreground text-center">
                        {!servicoId ? "Aguardando serviço..." : "Sem horários livres"}
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DrawerFooter>
            <Button onClick={handleSave} disabled={loading || !selectedTime}>
              {loading ? "Salvando..." : "Confirmar Agendamento"}
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