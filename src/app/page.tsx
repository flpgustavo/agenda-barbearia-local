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
import { useBackup } from "@/hooks/useBackup";
import useUsuario from "@/hooks/useUsuario";
import { Download, Loader2, UserPlus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

export default function Home() {
  const { items } = useUsuario();
  const { restaurarBackup, loading } = useBackup();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (items.length > 0) {
      router.push('/dashboard');
    }
  }, [items, router]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    toast.promise(restaurarBackup(file, 'senha', 'sobrescrever'), {
      loading: "Restaurando seus dados...",
      success: () => {
        router.push("/dashboard");
        return "Backup restaurado com sucesso!";
      },
      error: (err: Error) => err.message || "Falha ao importar backup."
    });
  };

  if (items.length > 0) return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">

      <Card className="w-[calc(100%-2rem)] max-w-md shadow-lg animate-enter ">

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

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".backup, .txt"
          />

          <Button
            variant="outline"
            className="w-full h-12 text-base border-dashed border-zinc-300 dark:border-zinc-700"
            size="lg"
            disabled={loading}
            onClick={() => fileInputRef.current?.click()}
          >
            {loading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Download className="mr-2 h-5 w-5" />
            )}
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