const isDev = process.env.NODE_ENV === 'development';

export const Logger = {
  info: (mensagem: string, dados?: any) => {
    if (isDev) {
      console.log(`%c[INFO] ${mensagem}`, 'color: green; font-weight: bold;', dados || '');
    }
  },

  error: (mensagem: string, erro: any) => {
    console.error(`%c[ERRO] ${mensagem}`, 'color: red; font-weight: bold;', erro);
    
    if (erro && erro.name) {
       console.error(`Tipo do erro: ${erro.name}`);
       console.error(`Mensagem: ${erro.message}`);
    }
  },

  warn: (mensagem: string, dados?: any) => {
    if (isDev) {
      console.warn(`%c[AVISO] ${mensagem}`, 'color: orange; font-weight: bold;', dados || '');
    }
  }
};