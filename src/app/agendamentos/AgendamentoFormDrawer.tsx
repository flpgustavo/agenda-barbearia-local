"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Check, ChevronsUpDown } from "lucide-react";
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
// Importa o tipo se tiveres, senão usa any ou define uma interface parcial
// import { Agendamento } from "@/core/models/Agendamento"; 

interface AgendamentoFormDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date | null; // Renomeei de 'data' para 'selectedDate' para ser mais claro
  agendamento?: any; // <--- NOVO: Objeto de agendamento para edição (opcional)
  onSuccess?: () => void; // <--- Útil para recarregar a lista no pai
}

export function AgendamentoFormDrawer({ 
  open, 
  onOpenChange, 
  selectedDate: initialDate, 
  agendamento,
  onSuccess 
}: AgendamentoFormDrawerProps) {
  
  const { items: clientes } = useCliente();
  const { items: servicos } = useServico();
  // Precisamos do 'atualizar' agora também
  const { criar, atualizar, buscarHorarios } = useAgendamento(); 

  // Estados do Formulário
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

  const isEditing = !!agendamento; // Booleano auxiliar para saber se estamos editando

  // Labels auxiliares
  const getClienteLabel = () => {
    const cliente = clientes?.find((c: any) => c.id === clienteId);
    return cliente ? cliente.nome : "Selecione o cliente";
  };

  const getServicoLabel = () => {
    const servico = servicos?.find((s: any) => s.id === servicoId);
    return servico ? `${servico.nome} (${servico.duracaoMinutos} min)` : "Selecione o serviço";
  };

  // --------------------------------------------------------
  // EFEITO 1: INICIALIZAÇÃO DO FORMULÁRIO
  // --------------------------------------------------------
  useEffect(() => {
    if (open) {
      if (agendamento) {
        // MODO EDIÇÃO: Preenche com os dados do agendamento
        setClienteId(agendamento.clienteId);
        setServicoId(agendamento.servicoId);
        
        // Converte a data ISO (ex: 2023-10-25T14:00:00Z) para Data e Hora separados
        if (agendamento.dataHora) {
            const dataObj = new Date(agendamento.dataHora);
            setData(dataObj.toISOString().split("T")[0]); // YYYY-MM-DD
            
            // Pega a hora formatada HH:mm (ajuste conforme seu fuso horário se necessário)
            // Aqui assumo que o valor vindo do banco já está correto ou em UTC tratado pelo navegador
            const horas = String(dataObj.getHours()).padStart(2, '0');
            const minutos = String(dataObj.getMinutes()).padStart(2, '0');
            setHora(`${horas}:${minutos}`);
        }
      } else if (initialDate) {
        // MODO CRIAÇÃO: Preenche apenas a data clicada no calendário
        setData(initialDate.toISOString().split("T")[0]);
        // Limpa os outros campos para garantir que não sobra "lixo" de edições anteriores
        setClienteId("");
        setServicoId("");
        setHora("");
      }
    }
  }, [open, agendamento, initialDate]);

  // --------------------------------------------------------
  // EFEITO 2: BUSCAR HORÁRIOS DISPONÍVEIS
  // --------------------------------------------------------
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
        
        // Lógica importante para EDIÇÃO:
        // Se estamos editando, o horário atual do agendamento (ex: 14:00) pode vir como "ocupado" do backend
        // (porque nós mesmos estamos ocupando). Precisamos garantir que ele apareça na lista se for o horário atual.
        let slotsFinais = slots;
        
        if (isEditing && hora && !slots.includes(hora)) {
             // Se a data e o serviço não mudaram, adicionamos o horário atual à lista
             // (Podes refinar essa lógica comparando se data == agendamento.data)
             slotsFinais = [hora, ...slots].sort();
        }

        setHorariosDisponiveis(slotsFinais);

        // Se o horário selecionado não estiver na lista (e não for o caso de edição acima), limpa
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
  }, [data, servicoId, servicos, buscarHorarios, isEditing]); // Removi 'hora' das deps para evitar loop

  // --------------------------------------------------------
  // FUNÇÃO DE SALVAR (CRIAR OU ATUALIZAR)
  // --------------------------------------------------------
  const handleSave = async () => {
    if (!clienteId || !servicoId || !data || !hora) {
      toast.warning("Por favor, preencha todos os campos.");
      return;
    }

    setLoading(true);
    try {
      // Monta a data ISO
      const dataHoraIso = format(new Date(`${data}T${hora}:00`), "yyyy-MM-dd'T'HH:mm:ssxxx");

      if (isEditing && agendamento?.id) {
        // --- ATUALIZAR ---
        await atualizar(agendamento.id, {
            clienteId,
            servicoId,
            dataHora: dataHoraIso,
            // Mantém o status anterior ou atualiza se tiver lógica para isso
            status: agendamento.status 
        });
        toast.success("Agendamento atualizado com sucesso!");
      } else {
        // --- CRIAR ---
        await criar({
          clienteId,
          servicoId,
          dataHora: dataHoraIso,
          status: "CONFIRMADO",
        });
        toast.success("Agendamento criado com sucesso!");
      }

      onOpenChange(false);
      onSuccess?.(); // Chama callback de sucesso se existir
      
      // Limpeza se for criação (opcional, pois o useEffect já trata)
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
            
            {/* --- SELEÇÃO DE CLIENTE --- */}
            <div className="space-y-2 flex flex-col">
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

            {/* --- SELEÇÃO DE SERVIÇO --- */}
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
              
              {/* --- SELEÇÃO DE HORÁRIO --- */}
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

              {/* --- INPUT DE DATA --- */}
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