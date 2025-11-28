import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSeparator, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Download, UserPlus } from "lucide-react"; // Ícones
import Image from "next/image";
import Link from "next/link"; // Para navegação, se necessário

export default function Home() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4 dark:bg-zinc-950">

            <Card className="w-full max-w-md shadow-lg">

                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-bold tracking-tight">
                        Registre-se
                    </CardTitle>
                    <CardDescription className="text-zinc-500 dark:text-zinc-400">
                        Para criar uma conta, preencha os campos abaixo.
                    </CardDescription>
                </CardHeader>

                <CardContent className="grid gap-4">

                    <form
                        action='/api/usuario'
                        method="POST"
                    >
                        <FieldGroup>
                            <FieldSet>
                                <Field>
                                    <FieldLabel>Nome</FieldLabel>
                                    <Input name="nome" placeholder="Digite seu nome" required />
                                </Field>
                                <FieldSeparator />
                                <FieldSet>
                                    <FieldLegend variant="label" className="text-center">
                                        Informações sobre seu horário de Atendimento
                                    </FieldLegend>
                                </FieldSet>
                                <Field>
                                    <FieldLabel>Inicío *</FieldLabel>
                                    <Input name="inicio" type="time" required />
                                </Field>
                                <Field>
                                    <FieldLabel>Inicío de Intervalo</FieldLabel>
                                    <Input name="inicio_intervalo" type="time" />
                                </Field>
                                <Field>
                                    <FieldLabel>Fim de Intervalo</FieldLabel>
                                    <Input name="fim_intervalo" type="time" />
                                </Field>
                                <Field>
                                    <FieldLabel>Fim *</FieldLabel>
                                    <Input name="fim" type="time" required />
                                </Field>


                            </FieldSet>
                            <Field orientation="horizontal" className="flex justify-center w-full">
                                <Button type="submit" className="w-full">Cadastrar</Button>
                            </Field>
                        </FieldGroup>
                    </form>

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
        </div >
    );
}