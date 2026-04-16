# Requisitos do Marco 2: UI de Transações Mobile

## Objetivo

Melhorar a listagem de transações para funcionar corretamente em dispositivos mobile com uma UI limpa e intuitiva.

## Requisitos Funcionais

### RF2.1 - Componente de Lista Mobile-First

- Substituir Table por componente de lista responsivo
- Exibir data, descrição, valor e status de forma organizada
- Layout adaptável: lista em mobile, tabela em desktop
- Cada item clicável para abrir edição

### RF2.2 - Informações por Item

- Data formatada (dd/MM)
- Descrição principal
- Badge de status (AGENDADO, PAGO, CANCELADO)
- Valor com cores: verde (entrada), vermelho (saída)
- Indicador visual de link com agendamento

### RF2.3 - Totais Resumidos

- Exibir totais de entradas e saídas no topo
- Diferença (saldo do período)

### RF2.4 - Empty State

- Mensagem amigável quando não há transações
- Instrução para criar primeira transação

## Requisitos Não Funcionais

### RNF2.1 - Responsividade

- Breakpoint: 640px (sm) para transição mobile/desktop
- Touch-friendly: áreas de clique mínimas de 44px

### RNF2.2 - Acessibilidade

- Labels adequados para leitores de tela
- Contraste adequado nas cores

### RNF2.3 - Performance

- Reutilizar dados existentes do Dexie
- Sem chamadas de API extras
