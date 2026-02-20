/// <reference types="cypress" />

export { };

declare global {
    namespace Cypress {
        interface Chainable<Subject = any> {
            /**
             * Limpa e configura o IndexedDB com dados iniciais para testes
             * @example cy.clearAndSetupDB()
             */
            clearAndSetupDB(): Chainable<void>
        }
    }
}

Cypress.Commands.add('clearAndSetupDB', () => {
    cy.window().then((win) => {
        return new Promise<void>((resolve, reject) => {
            const deleteReq = win.indexedDB.deleteDatabase('agenda-barbearia');
            deleteReq.onsuccess = () => {
                const openReq = win.indexedDB.open('agenda-barbearia', 2);
                openReq.onupgradeneeded = (e: any) => {
                    const db = e.target.result;
                    ['clientes', 'servicos', 'usuarios', 'agendamentos', 'transacoes'].forEach(s => {
                        if (!db.objectStoreNames.contains(s)) db.createObjectStore(s, { keyPath: 'id' });
                    });
                };
                openReq.onsuccess = (e: any) => {
                    const db = e.target.result;
                    const tx = db.transaction(['usuarios'], 'readwrite');
                    tx.objectStore('usuarios').add({
                        id: 'user-default',
                        nome: 'Usuário Teste',
                        inicio: '09:00',
                        fim: '18:00',
                        intervaloInicio: '12:00',
                        intervaloFim: '13:00',
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    });
                    tx.oncomplete = () => { db.close(); resolve(); };
                };
            };
        });
    });
});
