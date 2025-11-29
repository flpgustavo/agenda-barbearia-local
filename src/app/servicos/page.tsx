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
import { Servico } from "@/core/models/Servico";
import { Plus, MoreVertical, Clock, DollarSign, Edit, Trash2 } from "lucide-react";

const servicesData: Servico[] = [
    {
        id: "1",
        nome: "Corte de Cabelo",
        preco: 40.00,
        duracaoMinutos: 30,
        createdAt: new Date().toISOString(),
    },
    {
        id: "2",
        nome: "Barbearia Simples",
        preco: 55.00,
        duracaoMinutos: 45,
        createdAt: new Date().toISOString(),
    },
    {
        id: "3",
        nome: "Barbearia Com Design",
        preco: 60.00,
        duracaoMinutos: 60,
        createdAt: new Date().toISOString(),
    },
    {
        id: "4",
        nome: "Barbearia Completa",
        preco: 90.00,
        duracaoMinutos: 60,
        createdAt: new Date().toISOString(),
    },
];

export default function Servicos() {

    const handleEdit = (id: string) => {
        console.log(`Editando serviço ${id}`);
    }

    const handleDelete = (id: string) => {
        console.log(`Excluindo serviço ${id}`);
    }

    return (
        <div className="min-h-screen bg-background pb-24">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Serviços</h1>
                    <p className="text-muted-foreground">
                        Gerencie os serviços oferecidos aos seus clientes.
                    </p>
                </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {servicesData.map((service) => (
                    <Card key={service.id} className="flex flex-col gap-2 pb-4 justify-between shadow-md hover:scale-[1.02] hover:shadow-lg transition-shadow">
                        <CardHeader className="relative">
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-lg font-semibold">{service.nome}</CardTitle>
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
                                        
                                        <DropdownMenuItem onClick={() => handleEdit(service.id || '')} className="cursor-pointer">
                                            <Edit className="mr-2 h-4 w-4" />
                                            <span>Editar</span>
                                        </DropdownMenuItem>
                                        
                                        <DropdownMenuItem 
                                            onClick={() => handleDelete(service.id || '')} 
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
                                <div className="flex items-center gap-1 text-2xl font-bold text-primary">
                                    <span><sup className="">R$</sup>{service.preco}</span>
                                </div>
                                <div className="flex items-center gap-1 text-lg font-semibold">
                                    <sup><Clock size={14} /></sup>
                                    <span>{service.duracaoMinutos} minutos</span>
                                </div>
                            </div>
                        </CardContent>

                        <CardFooter>
                            <small className="text-xs font-semibold text-secondary w-full mt-1">
                                {service.createdAt && (
                                    "criado em " + new Date(service.createdAt).toLocaleDateString()
                                )}
                            </small>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            <div className="fixed bottom-6 right-6 z-50">
                <Button
                    size="icon"
                    className="h-14 w-14 rounded-full shadow-xl bg-primary hover:bg-primary/90 transition-transform hover:scale-105"
                    aria-label="Criar novo serviço"
                >
                    <Plus className="h-6 w-6 text-primary-foreground" />
                </Button>
            </div>

        </div>
    );
}