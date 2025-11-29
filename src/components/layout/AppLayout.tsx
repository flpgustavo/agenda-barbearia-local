'use client'

import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { Menu, User, Home, Settings, LogOut, Loader2, Sun, Moon, LayoutList, CalendarDaysIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetClose
} from "@/components/ui/sheet";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { UsuarioService } from "@/core/services/UsuarioService";
import { Usuario } from "@/core/models/Usuario";
import { useTheme } from "next-themes";

interface AppLayoutProps {
    children: ReactNode;
}

const menuItems = [
    {
        label: "Agenda",
        href: "/agendamentos",
        icon: CalendarDaysIcon
    },
    {
        label: "Seus Serviços",
        href: "/servicos", 
        icon: LayoutList
    },
];

export function AppLayout({ children }: AppLayoutProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { theme, setTheme } = useTheme()

    const [usuarioAtual, setUsuarioAtual] = useState<Usuario | null>(null);
    const [isChecking, setIsChecking] = useState(true);

    const publicRoutes = ['/', '/register'];
    const isPublicPage = publicRoutes.includes(pathname);

    function toggleTheme() {
        setTheme(theme === "dark" ? "light" : "dark");
    }

    useEffect(() => {
        if (isPublicPage) {
            setIsChecking(false);
            return;
        }

        async function validarUsuario() {
            try {
                setIsChecking(true);
                const usuarios = await UsuarioService.list();

                if (usuarios.length > 0) {
                    setUsuarioAtual(usuarios[0]);
                } else {
                    router.push('/');
                }
            } catch (error) {
                console.error("Erro ao validar usuário:", error);
                router.push('/');
            } finally {
                setIsChecking(false);
            }
        }

        validarUsuario();
    }, [pathname, isPublicPage, router]);

    if (isPublicPage) {
        return <>{children}</>;
    }

    if (isChecking) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!usuarioAtual) {
        return null;
    }

    const getIniciais = (nome: string) => {
        return nome
            .split(' ')
            .map((n) => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <header className="border-b h-16 px-4 flex items-center shadow-md justify-between bg-card sticky top-0 z-50">

                <div className="flex items-center gap-4">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Menu className="h-6 w-6" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="px-4">
                            <SheetHeader className="pl-0 pb-0">
                                <SheetTitle>Menu</SheetTitle>
                            </SheetHeader>
                            <nav className="flex flex-col gap-4 mt-0">
                                {menuItems.map((item) => {
                                    const isActive = pathname === item.href;

                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={`flex items-center gap-2 text-lg transition-colors p-2 rounded-md hover:bg-muted ${isActive
                                                    ? "text-primary font-semibold bg-primary/10"
                                                    : "text-muted-foreground"
                                                }`}
                                        >
                                            <item.icon className="h-5 w-5" />
                                            {item.label}
                                        </Link>
                                    );
                                })}
                            </nav>

                        </SheetContent>
                    </Sheet>
                    <h1 className="text-xl font-bold">NoteBarber</h1>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={toggleTheme}>
                        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        <span className="sr-only">Alternar tema</span>
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                                <Avatar>
                                    <AvatarImage src="" alt={usuarioAtual.nome} />
                                    <AvatarFallback>{getIniciais(usuarioAtual.nome)}</AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">{usuarioAtual.nome}</p>
                                    <p className="text-xs leading-none text-muted-foreground">
                                        Usuário Ativo
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="cursor-pointer">
                                <User className="mr-2 h-4 w-4" />
                                <span>Perfil</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600 cursor-pointer" onClick={() => router.push('/')}>
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Sair</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                </div>

            </header>

            <main className="flex-1 p-6">
                {children}
            </main>
        </div>
    );
}