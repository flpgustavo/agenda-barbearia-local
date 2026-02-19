describe('Gestão de Clientes', () => {

    const nome = 'João Silva';
    const telefone = '11999999999';

    beforeEach(() => {
        // Visita a home para ter acesso ao window e IndexedDB
        cy.visit('/');

        // Limpa e preenche o banco de dados
        cy.clearAndSetupDB();

        // Visita a página de clientes já autenticado
        cy.visit('/clientes');
    });

    it('Criando', () => {
        // Abre o modal de criar cliente
        cy.get('button[aria-label="Criar novo cliente"]').click();

        // Preenche o formulário
        cy.get('input[placeholder="Nome do cliente"]').type(nome);
        cy.get('input[placeholder="(99) 99999-9999"]').type(telefone);

        // Salva
        cy.contains('button', 'Salvar').click();

        // Verifica o toast de sucesso
        cy.contains('Cliente criado com sucesso!').should('be.visible');

        // Verifica se o cliente aparece na lista
        cy.contains(nome).should('be.visible');
        cy.contains(telefone).should('be.visible');
    });

    it('Editando', () => {
        // Cria um cliente primeiro para editar
        cy.get('button[aria-label="Criar novo cliente"]').click();
        cy.get('input[placeholder="Nome do cliente"]').type(nome);
        cy.get('input[placeholder="(99) 99999-9999"]').type(telefone);
        cy.contains('button', 'Salvar').click();
        cy.contains('Cliente criado com sucesso!').should('be.visible');

        // Abre o menu de ações do card
        cy.get('[role="dialog"]').should('not.exist');
        cy.get('button[aria-label="Abrir menu"]').click();

        // Clica em Editar
        cy.contains('Editar').click();

        // Altera os dados
        cy.get('input[placeholder="Nome do cliente"]').clear().type(nome + ' Editado');
        cy.contains('button', 'Salvar').click();

        // Verifica sucesso
        cy.contains('Cliente atualizado com sucesso!').should('be.visible');
        cy.contains(nome + ' Editado').should('be.visible');
    });

    it('Excluindo', () => {
        // Cria um cliente para excluir
        cy.get('button[aria-label="Criar novo cliente"]').click();
        cy.get('input[placeholder="Nome do cliente"]').type(nome);
        cy.get('input[placeholder="(99) 99999-9999"]').type(telefone);
        cy.contains('button', 'Salvar').click();
        cy.contains('Cliente criado com sucesso!').should('be.visible');

        // Abre o menu de ações
        cy.get('[role="dialog"]').should('not.exist');
        cy.get('button[aria-label="Abrir menu"]').click();

        // Clica em Excluir
        cy.contains('Excluir').click();

        // Verifica se foi removido
        cy.contains('Cliente removido com sucesso!').should('be.visible');
        cy.contains(nome).should('not.exist');
    });

    it('Campos obrigatórios', () => {
        cy.get('button[aria-label="Criar novo cliente"]').click();
        cy.contains('button', 'Salvar').click();

        cy.contains('Por favor, preencha todos os campos.').should('exist');
    });

    it('Telefone incompleto', () => {
        cy.get('button[aria-label="Criar novo cliente"]').click();
        cy.get('input[placeholder="Nome do cliente"]').type(nome);
        cy.get('input[placeholder="(99) 99999-9999"]').type('119999'); // Telefone incompleto
        cy.contains('button', 'Salvar').click();

        cy.contains('O telefone parece incompleto. Digite o DDD + Número.').should('exist');
    });

    it('Nome muito curto', () => {
        cy.get('button[aria-label="Criar novo cliente"]').click();
        cy.get('input[placeholder="Nome do cliente"]').type('Ab'); // Nome curto
        cy.get('input[placeholder="(99) 99999-9999"]').type(telefone);
        cy.contains('button', 'Salvar').click();

        cy.contains('O nome deve ter pelo menos 3 caracteres.').should('exist');
    });
});
