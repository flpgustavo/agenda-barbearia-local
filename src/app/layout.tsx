import type { Metadata } from "next";
import { Geist, Geist_Mono, Quicksand } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { AppLayout } from "@/components/layout/AppLayout";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryProvider } from "@/components/QueryProvider";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const quicksand = Quicksand({
  subsets: ["latin"],
  variable: "--font-quicksand",
});

export const metadata: Metadata = {
  title: "NoteBarber",
  description: "Gerenciamento de agendamentos offline para barbearias.",
};

export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        </head>
      <body
        className={`${quicksand.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <AppLayout>
              {children}
            </AppLayout>
          </QueryProvider>
          <Toaster richColors position="top-center"/>
        </ThemeProvider>
      </body>
    </html>
  );
}
