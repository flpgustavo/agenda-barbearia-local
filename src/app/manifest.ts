import { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Agenda Barbearia Pro",
    short_name: "NoteBarber",
    description: "Gerenciamento de agendamentos offline para barbearias.",
    start_url: "/",
    id: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ff592c",
    orientation: "portrait",
    lang: "pt-BR",
    dir: "ltr",
    categories: [
      "productivity",
      "business"
    ],
    icons: [
      {
        src: '/logoapp.png',
        sizes: '252x252',
        type: 'image/png',
      },
    ],
    shortcuts: [
      {
        name: "Novo Agendamento",
        short_name: "Agendar",
        description: "Adicionar cliente rapidamente",
        url: "/agendamentos?action=novo",
        icons: [
          {
            src: "/actionadd.png",
            sizes: "252x252",
            type: "image/png", // É boa prática adicionar o type
          }
        ]
      }
    ],


  }
}