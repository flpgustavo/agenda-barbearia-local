# Testing Patterns

**Analysis Date:** 2026-04-16

## Test Framework

**E2E Testing:**
- Framework: Cypress v15.8.0
- Config: `cypress.config.ts`
- Base URL: `http://localhost:3000`

**Unit Testing:**
- Not detected - no Jest, Vitest, or similar configured

**Other Testing Dependencies:**
- React Testing Library: Not detected
- Mock Service Worker: Not detected

**Run Commands:**
```bash
npm run dev              # Start dev server
npx cypress open        # Open Cypress UI
npx cypress run         # Run Cypress tests headless
```

## Test File Organization

**Location:**
- Tests located in: `cypress/e2e/*`
- Support files: `cypress/support/*`
- Fixtures: `cypress/fixtures/*`

**Naming:**
- E2E tests: `[feature].cy.ts`
- Examples: `clientes.cy.ts`, `servicos.cy.ts`, `home.cy.ts`

**Structure:**
```
cypress/
├── e2e/
│   ├── clientes.cy.ts
│   ├── servicos.cy.ts
│   └── home.cy.ts
├── support/
│   ├── commands.ts
│   └── e2e.ts
├── fixtures/
│   └── example.json
└── screenshots/
```

## Test Structure

**Suite Organization:**
```typescript
describe('Gestão de Clientes', () => {
  const nome = 'João Silva';
  const telefone = '11999999999';

  beforeEach(() => {
    // Setup before each test
    cy.visit('/');
    cy.clearAndSetupDB();
    cy.visit('/clientes');
  });

  it('Criando', () => {
    // Test implementation
  });
});
```

**Patterns:**
- Test describe blocks use feature names in Portuguese
- Shared test data as constants at describe block level
- `beforeEach` for common setup
- Multiple `it` blocks per feature for different scenarios

## Cypress Configuration

**Basic Setup:**
- Config file: `cypress.config.ts`
- Minimal configuration (baseUrl and setupNodeEvents only)

**Project-Specific Commands:**
- Custom `clearAndSetupDB()` command for IndexedDB seeding
- Located in `cypress/support/commands.ts`

## Mocking

**IndexedDB Mocking:**
- Custom command directly manipulates IndexedDB for tests
- Pattern from `cypress/support/commands.ts`:
```typescript
Cypress.Commands.add('clearAndSetupDB', () => {
  cy.window().then((win) => {
    return new Promise<void>((resolve, reject) => {
      const deleteReq = win.indexedDB.deleteDatabase('agenda-barbearia');
      deleteReq.onsuccess = () => {
        const openReq = win.indexedDB.open('agenda-barbearia', 2);
        openReq.onupgradeneeded = (e: any) => {
          const db = e.target.result;
          ['clientes', 'servicos', 'usuarios', 'agendamentos', 'transacoes'].forEach(s => {
            if (!db.objectStoreNames.contains(s)) 
              db.createObjectStore(s, { keyPath: 'id' });
          });
        };
        openReq.onsuccess = (e: any) => {
          const db = e.target.result;
          const tx = db.transaction(['usuarios'], 'readwrite');
          tx.objectStore('usuarios').add({
            id: 'user-default',
            nome: 'Usuário Teste',
            // ... seed data
          });
          tx.oncomplete = () => { db.close(); resolve(); };
        };
      };
    });
  });
});
```

**What to Mock:**
- IndexedDB database state via custom command
- No API mocking (local database)

**What NOT to Mock:**
- UI components (real rendering in browser)
- User interactions

## Fixtures and Factories

**Test Data:**
- Inline constants in test files
- Example: `const nome = 'João Silva'; const telefone = '11999999999';`

**Seed Data:**
- Default user created via `clearAndSetupDB()`:
```typescript
{
  id: 'user-default',
  nome: 'Usuário Teste',
  inicio: '09:00',
  fim: '18:00',
  intervaloInicio: '12:00',
  intervaloFim: '13:00',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}
```

**Location:**
- `cypress/fixtures/example.json` (Cypress default)

## Test Types

**E2E Tests:**
- Full integration tests against running app
- Tests IndexedDB operations
- Tests UI interactions and flows

**Test Coverage Observed:**
- `clientes.cy.ts`: Create, edit, delete, validation tests
- `servicos.cy.ts`: Not examined (assumed similar patterns)
- `home.cy.ts`: Home page tests

## E2E Test Examples

**Create Test:**
```typescript
it('Criando', () => {
  cy.get('button[aria-label="Criar novo cliente"]').click();
  cy.get('input[placeholder="Nome do cliente"]').type(nome);
  cy.get('input[placeholder="(99) 99999-9999"]').type(telefone);
  cy.contains('button', 'Salvar').click();
  cy.contains('Cliente criado com sucesso!').should('be.visible');
  cy.contains(nome).should('be.visible');
});
```

**Validation Test:**
```typescript
it('Campos obrigatórios', () => {
  cy.get('button[aria-label="Criar novo cliente"]').click();
  cy.contains('button', 'Salvar').click();
  cy.contains('Por favor, preencha todos os campos.').should('exist');
});

it('Telefone incompleto', () => {
  cy.get('button[aria-label="Criar novo cliente"]').click();
  cy.get('input[placeholder="Nome do cliente"]').type(nome);
  cy.get('input[placeholder="(99) 99999-9999"]').type('119999');
  cy.contains('button', 'Salvar').click();
  cy.contains('O telefone parece incompleto...').should('exist');
});
```

**Delete Test:**
```typescript
it('Excluindo', () => {
  // Create first
  cy.get('button[aria-label="Criar novo cliente"]').click();
  cy.get('input[placeholder="Nome do cliente"]').type(nome);
  // ... create
  // Delete
  cy.get('button[aria-label="Abrir menu"]').click();
  cy.contains('Excluir').click();
  cy.contains('Cliente removido com sucesso!').should('be.visible');
  cy.contains(nome).should('not.exist');
});
```

## Common Patterns

**Selector Patterns:**
- Button with aria-label: `[aria-label="Criar novo cliente"]`
- Input with placeholder: `input[placeholder="Nome do cliente"]`
- Dialog role: `[role="dialog"]`
- Button by text: `cy.contains('button', 'Salvar')`

**Assertions:**
- Visibility: `.should('be.visible')`
- Non-existence: `.should('not.exist')`
- Text content: `cy.contains(text)`

**Flows:**
1. Visit page via URL
2. Setup database
3. Perform UI actions
4. Assert results in UI/toast

## Coverage

**Requirements:** None enforced

**View Coverage:** Not applicable (Cypress E2E tests)

## CI/CD Testing

**Not configured:**
- No GitHub Actions workflow
- No test commands in package.json scripts
- Cypress not in CI pipeline

**Manual test execution required:**
```bash
npx cypress run  # Run all E2E tests
```

## Known Testing Gaps

**Unit Tests:**
- No unit test framework configured
- No component tests
- No hook tests
- No service/tests

**Integration Tests:**
- Only E2E with full browser
- No API integration tests

**Mocking:**
- No external service mocking
- Tests rely on local IndexedDB

**Coverage:**
- No test coverage tool integrated
- Test files not comprehensive (only partial coverage observed)

---

*Testing analysis: 2026-04-16*