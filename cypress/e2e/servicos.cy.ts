describe('Gestão de Serviços', () => {

    const nome = 'Corte de Cabelo';
    const preco = '50,99';
    const duracao = '30';

    beforeEach(() => {
        // Visita a home para ter acesso ao window e IndexedDB
        cy.visit('/');

        // Limpa e preenche o banco de dados
        cy.clearAndSetupDB();

        // Visita a página de serviços já autenticado
        cy.visit('/servicos');
    });

    it('Criando', () => {
        // Abre o modal de criar serviço
        cy.get('button[aria-label="Criar novo serviço"]').click();

        // Preenche o formulário
        cy.get('input[placeholder="Nome do serviço"]').type(nome);
        cy.get('input[placeholder="Duração em minutos"]').type(duracao);
        cy.get('input[placeholder="0,00"]').type(preco);

        // Salva
        cy.contains('button', 'Salvar').click();

        // Verifica o toast de sucesso
        cy.contains('Serviço criado com sucesso!').should('be.visible');

        // Verifica se o cliente aparece na lista
        cy.contains(nome).should('be.visible');
        cy.contains(`R$${preco}`).should('be.visible');
        cy.contains(`${duracao} minutos`).should('be.visible');
    });

    it('Editando', () => {
        // Cria um cliente primeiro para editar
        cy.get('button[aria-label="Criar novo serviço"]').click();
        cy.get('input[placeholder="Nome do serviço"]').type(nome);
        cy.get('input[placeholder="Duração em minutos"]').type(duracao);
        cy.get('input[placeholder="0,00"]').type(preco);
        cy.contains('button', 'Salvar').click();
        cy.contains('Serviço criado com sucesso!').should('be.visible');

        // Abre o menu de ações do card
        cy.get('[role="dialog"]').should('not.exist');
        cy.get('button[aria-label="Abrir menu"]').click();

        // Clica em Editar
        cy.contains('Editar').click();

        // Altera os dados
        cy.get('input[placeholder="Nome do serviço"]').clear().type(nome + ' Editado');
        cy.contains('button', 'Salvar').click();

        // Verifica sucesso
        cy.contains('Serviço atualizado com sucesso!').should('be.visible');
        cy.contains(nome + ' Editado').should('be.visible');
    });

    it('Excluindo', () => {
        // Cria um cliente para excluir
        cy.get('button[aria-label="Criar novo serviço"]').click();
        cy.get('input[placeholder="Nome do serviço"]').type(nome);
        cy.get('input[placeholder="Duração em minutos"]').type(duracao);
        cy.get('input[placeholder="0,00"]').type(preco);
        cy.contains('button', 'Salvar').click();
        cy.contains('Serviço criado com sucesso!').should('be.visible');

        // Abre o menu de ações
        cy.get('[role="dialog"]').should('not.exist');
        cy.get('button[aria-label="Abrir menu"]').click();

        // Clica em Excluir
        cy.contains('Excluir').click();

        // Verifica se foi removido
        cy.contains('Serviço removido com sucesso!').should('be.visible');
        cy.contains(nome).should('not.exist');
    });

    it('Campos obrigatórios', () => {
        cy.get('button[aria-label="Criar novo serviço"]').click();
        cy.contains('button', 'Salvar').click();

        cy.contains('Por favor, preencha todos os campos.').should('exist');
    });

    it('Nome muito curto', () => {
        cy.get('button[aria-label="Criar novo serviço"]').click();
        cy.get('input[placeholder="Nome do serviço"]').type('Ab'); // Nome curto
        cy.get('input[placeholder="Duração em minutos"]').type(duracao);
        cy.get('input[placeholder="0,00"]').type(preco);
        cy.contains('button', 'Salvar').click();

        cy.contains('O nome deve ter pelo menos 3 caracteres.').should('exist');
    });

    it('Duração inválida', () => {
        cy.get('button[aria-label="Criar novo serviço"]').click();
        cy.get('input[placeholder="Nome do serviço"]').type(nome);
        cy.get('input[placeholder="Duração em minutos"]').type('-1'); // Duração inválida
        cy.get('input[placeholder="0,00"]').type(preco);
        cy.contains('button', 'Salvar').click();

        cy.contains('A duração deve ser maior que 0.').should('exist');
    });

    it('Preço inválido', () => {
        cy.get('button[aria-label="Criar novo serviço"]').click();
        cy.get('input[placeholder="Nome do serviço"]').type(nome);
        cy.get('input[placeholder="Duração em minutos"]').type(duracao);
        cy.get('input[placeholder="0,00"]').type('-10'); // Preço inválido
        cy.contains('button', 'Salvar').click();

        cy.contains('O preço deve ser maior que 0.').should('exist');
    });
});
