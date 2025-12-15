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
import useUsuario from "@/hooks/useUsuario";
import { Download, UserPlus } from "lucide-react"; // Ícones
import Image from "next/image";
import Link from "next/link"; // Para navegação, se necessário

export default function Home() {
  const { items } = useUsuario();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">

      <Card className="w-full max-w-md shadow-lg animate-enter">

        <CardHeader className="space-y-1 text-center">
          <div className="w-full flex items-center justify-center invert dark:invert-0">
            <Image
              src="/logo.png"
              alt="Agenda Barbearia Pro"
              width={100}
              height={100}
            />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Bem-vindo!
          </CardTitle>
          <CardDescription>
            Para começar, escolha como deseja prosseguir.
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-4">
          {items.length > 0 ? (
            <Link href="/agendamentos">
              <Button
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md shadow-neon w-full animate-pulse-glow"
                size="lg"
              >
                <UserPlus className="mr-2 h-5 w-5" />
                Acessar minha conta
              </Button>
            </Link>
          ) : (
            <Link href="/register">
              <Button
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md shadow-neon w-full animate-pulse-glow"
                size="lg"
              >
                <UserPlus className="mr-2 h-5 w-5" />
                Criar nova conta
              </Button>
            </Link>
          )}

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="px-2 bg-card ">
                Ou
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full h-12 text-base border-dashed border-zinc-300 dark:border-zinc-700"
            size="lg"
          >
            <Download className="mr-2 h-5 w-5" />
            Importar Backup
          </Button>

        </CardContent>

        <CardFooter className="justify-center">
          <p className="text-xs text-center text-zinc-500 dark:text-zinc-400">
            Ao continuar, você aceita nossos{" "}
            <Link href="/termos" className="underline hover:text-zinc-900 dark:hover:text-zinc-50">
              Termos de Uso
            </Link>.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}