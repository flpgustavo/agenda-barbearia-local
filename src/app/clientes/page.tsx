'use client'

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useCliente } from "@/hooks/useCliente";
import { Plus, MoreVertical, Clock, DollarSign, Edit, Trash2 } from "lucide-react";
import Link from "next/link";

export default function Servicos() {

    const { items } = useCliente()

    const handleEdit = (id: string) => {
        console.log(`Editando serviço ${id}`);
    }

    const handleDelete = (id: string) => {
        console.log(`Excluindo serviço ${id}`);
    }

    return (
        <div className="min-h-screen bg-background pb-24 p-6">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Cliente</h1>
                    <p className="text-muted-foreground">
                        Gerencie todos os seus clientes.
                    </p>
                </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {items.map((cliente) => (
                    <Card key={cliente.id} className="flex flex-col gap-2 pb-4 justify-between shadow-md hover:scale-[1.02] hover:shadow-lg transition-shadow">
                        <CardHeader className="relative">
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-lg font-semibold">{cliente.nome}</CardTitle>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="-mt-2 -mr-2 h-8 w-8 text-muted-foreground hover:text-foreground"
                                        >
                                            <MoreVertical className="h-4 w-4" />
                                            <span className="sr-only">Abrir menu</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                        <DropdownMenuSeparator />

                                        <DropdownMenuItem onClick={() => handleEdit(cliente.id || '')} className="cursor-pointer">
                                            <Edit className="mr-2 h-4 w-4" />
                                            <span>Editar</span>
                                        </DropdownMenuItem>

                                        <DropdownMenuItem
                                            onClick={() => handleDelete(cliente.id || '')}
                                            className="text-red-600 focus:text-red-600 cursor-pointer"
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            <span>Excluir</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </CardHeader>

                        <CardContent>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1 text-lg font-semibold">
                                    {cliente.telefone}
                                </div>
                            </div>
                        </CardContent>

                        <CardFooter>
                            <small className="text-xs font-semibold text-muted-foreground w-full mt-1">
                                {cliente.createdAt && (
                                    "cliente desde " + new Date(cliente.createdAt).toLocaleDateString()
                                )}
                            </small>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            <div className="fixed bottom-6 right-6 z-50">
                <Link href="/clientes/novo">
                <Button
                    size="icon"
                    className="h-14 w-14 rounded-full shadow-xl bg-primary hover:bg-primary/90 transition-transform hover:scale-105"
                    aria-label="Criar novo cliente"
                >
                    <Plus className="size-5 font-bold text-primary-foreground" />
                </Button>
                </Link>
            </div>

        </div>
    );
}