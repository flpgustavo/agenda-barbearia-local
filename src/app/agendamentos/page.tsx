'use client'

import { useEffect, useState } from "react";
import { Plus, Search, MoreHorizontal, Edit, Trash2 } from "lucide-react"; // Removi Calendar não usado
import Link from "next/link";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Modelos (Mantemos os imports para tipagem, mesmo mockando)
import { Agendamento, AgendamentoStatus } from "@/core/models/Agendamento";
import { AgendamentoService } from "@/core/services/AgendamentoService";

// Componentes UI
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AgendamentoExibicao extends Agendamento {
    nomeCliente?: string;
    nomesServicos?: string[];
}

export default function AgendamentosPage() {
    const [agendamentos, setAgendamentos] = useState<AgendamentoExibicao[]>([]);
    const [loading, setLoading] = useState(true);
    const [termoBusca, setTermoBusca] = useState("");

    async function loadData() {
        try {
            setLoading(true);

            // --- SIMULAÇÃO DE DELAY DE REDE (Opcional, para ver o loading) ---
            await new Promise(resolve => setTimeout(resolve, 1000));

            // ==========================================================
            // 1. DADOS MOCKADOS (Fictícios)
            // ==========================================================

            const mockClientes = [
                { id: 'c1', nome: 'Ana Clara Silva' },
                { id: 'c2', nome: 'Roberto Carlos' },
                { id: 'c3', nome: 'Fernanda Montenegro' },
            ];

            const mockServicos = [
                { id: 's1', nome: 'Corte Masculino' },
                { id: 's2', nome: 'Barba' },
                { id: 's3', nome: 'Coloração' },
                { id: 's4', nome: 'Manicure' },
            ];

            const mockAgendamentos: Agendamento[] = [
                {
                    id: 'a1',
                    clienteId: 'c1',
                    servicosId: ['s3', 's4'],
                    dataHora: new Date().toISOString(), // Hoje
                    status: 'CONFIRMADO',
                    observacoes: 'Cliente alérgica a amônia'
                },
                {
                    id: 'a3',
                    clienteId: 'c3',
                    servicosId: ['s4'],
                    dataHora: new Date(Date.now() - 86400000).toISOString(), // Ontem (-24h)
                    status: 'CONCLUIDO'
                },
                {
                    id: 'a4',
                    clienteId: 'c1',
                    servicosId: ['s3'],
                    dataHora: new Date(Date.now() - 172800000).toISOString(), // Anteontem
                    status: 'CANCELADO'
                }
            ];

            // ==========================================================
            // 2. LÓGICA DE JUNÇÃO (Mantida igual à original)
            // ==========================================================

            // Em vez de chamar o Service, usamos os arrays mockados acima
            const listaAgendamentos = mockAgendamentos;
            const clientes = mockClientes;
            const servicos = mockServicos;

            // Criar Mapas para busca rápida
            const clientesMap = new Map(clientes.map(c => [c.id, c.nome]));
            const servicosMap = new Map(servicos.map(s => [s.id, s.nome]));

            // Cruzar os dados (Join)
            const dadosCompletos = listaAgendamentos.map(agenda => ({
                ...agenda,
                nomeCliente: clientesMap.get(agenda.clienteId) || 'Cliente Desconhecido',
                nomesServicos: agenda.servicosId.map(id => servicosMap.get(id) || 'Serviço Removido')
            }));

            // Ordenar por data (mais recente primeiro)
            dadosCompletos.sort((a, b) => new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime());

            setAgendamentos(dadosCompletos);

        } catch (error) {
            console.error(error);
            toast.error("Erro ao carregar dados simulados");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadData();
    }, []);

    // Função Delete Mockada (Visualmente funciona, mas não apaga do banco)
    async function handleDelete(id: string) {
        if (!confirm("Tem certeza que deseja cancelar este agendamento?")) return;

        try {
            // await AgendamentoService.remove(id); <--- COMENTADO

            // Simulando remoção visual
            setAgendamentos(prev => prev.filter(item => item.id !== id));
            toast.success("Agendamento removido (Simulação)");

        } catch (error) {
            toast.error("Erro ao remover agendamento");
        }
    }

    // ... Resto do código (Filtros, RenderStatusBadge e JSX) mantém-se IGUAL ...
    // Vou repetir aqui apenas o trecho do filtro e JSX para garantir que copias tudo certo se precisares.

    const agendamentosFiltrados = agendamentos.filter(ag =>
        ag.nomeCliente?.toLowerCase().includes(termoBusca.toLowerCase()) ||
        ag.status.toLowerCase().includes(termoBusca.toLowerCase())
    );

    const renderStatusBadge = (status: string) => { // Ajustei tipo para string para aceitar o mock
        switch (status) {
            case 'CONFIRMADO': return <Badge className="bg-blue-500 hover:bg-blue-600">Confirmado</Badge>;
            case 'CONCLUIDO': return <Badge className="bg-green-500 hover:bg-green-600">Concluído</Badge>;
            case 'CANCELADO': return <Badge variant="destructive">Cancelado</Badge>;
            case 'PENDENTE': return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Pendente</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Agendamentos</h2>
                    <p className="text-muted-foreground">Gerencie os horários marcados.</p>
                </div>
                <Button asChild>
                    <Link href="/agendamentos/novo">
                        <Plus className="mr-2 h-4 w-4" /> Novo Agendamento
                    </Link>
                </Button>
            </div>

            <Card className="card-hover">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Listagem</CardTitle>
                        <div className="relative w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar cliente..."
                                className="pl-8"
                                value={termoBusca}
                                onChange={(e) => setTermoBusca(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Data e Hora</TableHead>
                                <TableHead>Cliente</TableHead>
                                <TableHead>Serviços</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24">
                                        Carregando agendamentos...
                                    </TableCell>
                                </TableRow>
                            ) : agendamentosFiltrados.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                        Nenhum agendamento encontrado.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                agendamentosFiltrados.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex flex-col">
                                                <span>
                                                    {format(new Date(item.dataHora), "dd/MM/yyyy", { locale: ptBR })}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {format(new Date(item.dataHora), "HH:mm", { locale: ptBR })}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{item.nomeCliente}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {item.nomesServicos?.map((serv, idx) => (
                                                    <span key={idx} className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold transition-colors bg-secondary text-secondary-foreground">
                                                        {serv}
                                                    </span>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell>{renderStatusBadge(item.status)}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    {/* O botão envolve o ícone. Só existe 1 elemento filho direto do Trigger */}
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Abrir menu</span> {/* Boa prática para acessibilidade */}
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/agendamentos/editar/${item.id}`} className="flex items-center cursor-pointer">
                                                            <Edit className="mr-2 h-4 w-4" /> Editar
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-red-600 cursor-pointer"
                                                        onClick={() => item.id && handleDelete(item.id)}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" /> Deletar
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}