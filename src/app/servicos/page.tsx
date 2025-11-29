import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Servico } from "@/core/models/Servico";
import { Plus, MoreVertical, Clock, DollarSign } from "lucide-react"; // Ícones necessários

const servicesData: Servico[] = [
  {
    id: "1",
    nome: "Corte de Cabelo",
    preco: 30.00,
    duracaoMinutos: 30,
  },
  {
    id: "2",
    nome: "Barbearia Simples",
    preco: 45.00,
    duracaoMinutos: 45,
  },
  {
    id: "3",
    nome: "Barbearia Com Design",
    preco: 60.00,
    duracaoMinutos: 60,
  },
  {
    id: "4",
    nome: "Barbearia Completa",
    preco: 90.00,
    duracaoMinutos: 90,
  },
];

export default function Servicos() {
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Cabeçalho da Página */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Serviços</h1>
          <p className="text-muted-foreground">
            Gerencie os serviços oferecidos aos seus clientes.
          </p>
        </div>
      </div>

      {/* Grid de Serviços */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {servicesData.map((service) => (
          <Card key={service.id} className="flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="relative pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg font-semibold">{service.nome}</CardTitle>
                <button className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
                    <MoreVertical size={18} />
                </button>
              </div>
            </CardHeader>
            
            <CardContent>
             {/* Informações extras com ícones */}
              <div className="flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
                <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>{service.duracaoMinutos}</span>
                </div>
                <div className="flex items-center gap-1">
                    <DollarSign size={14} />
                    <span>{service.preco}<sup>R$</sup></span>
                </div>
              </div>
            </CardContent>

            <CardFooter>
                <Button variant="secondary" className="w-full h-8 text-xs">
                    Editar Detalhes
                </Button>
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