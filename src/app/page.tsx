import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Download, UserPlus } from "lucide-react"; // Ícones
import Image from "next/image";
import Link from "next/link"; // Para navegação, se necessário

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4 dark:bg-zinc-950">

      <Card className="w-full max-w-md shadow-lg">

        <CardHeader className="space-y-1 text-center">
          <div className="w-full flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="Agenda Barbearia Pro"
              width={150}
              height={150}
            />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Bem-vindo!
          </CardTitle>
          <CardDescription className="text-zinc-500 dark:text-zinc-400">
            Para começar, escolha como deseja prosseguir.
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-4">

          <Button
            className="w-full h-12 text-base"
            size="lg"
          >
            <UserPlus className="mr-2 h-5 w-5" />
            Criar nova conta
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-zinc-200 dark:border-zinc-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-zinc-500 dark:bg-zinc-950 dark:text-zinc-400">
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