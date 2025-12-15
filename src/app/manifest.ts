import { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Agenda Barbearia Pro",
    short_name: "Barbearia",
    description: "Gerenciamento de agendamentos offline para barbearias.",
    start_url: "/",
    id: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    orientation: "portrait",
    lang: "pt-BR",
    dir: "ltr",
    categories: [
      "productivity",
      "business"
    ],
    icons: [
      {
        src: '/logo.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/logo.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    shortcuts: [
      {
        name: "Novo Agendamento",
        short_name: "Agendar",
        description: "Adicionar cliente rapidamente",
        url: "/agendar?action=novo",
        icons: [
          {
            src: "/logo.png",
            sizes: "192x192",
            type: "image/png", // É boa prática adicionar o type
          }
        ]
      }
    ],
  }
}