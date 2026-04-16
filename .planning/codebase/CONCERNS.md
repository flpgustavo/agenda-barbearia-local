# Codebase Concerns

**Analysis Date:** 2026-04-16

## Security Concerns

### Critical: Hardcoded Password in Backup Operations

**Issue:** Password "senha" is hardcoded in multiple locations instead of being prompted from the user.

**Files:**
- `src/app/page.tsx` (line 37): `restaurarBackup(file, 'senha', 'sobrescrever')`
- `src/app/perfil/page.tsx` (line 83): `restaurarBackup(file, 'senha', modo)`
- `src/app/perfil/page.tsx` (line 186): `fazerBackup("senha")`

**Impact:** Any user who imports a backup must know the original password, but the backup export doesn't allow setting a custom password. Users cannot create encrypted backups with their own password.

**Fix approach:** Add password input dialogs before backup/restore operations. Allow users to set custom encryption password when creating backups.

### Medium: No Real Authentication System

**Issue:** The application uses a local IndexedDB database with no server-side authentication. The "register" flow simply creates a local user record.

**Files:**
- `src/app/register/page.tsx`
- `src/hooks/useUsuario.ts`
- `src/core/services/UsuarioService.ts`

**Impact:** No data protection. Anyone with browser access can view/modify all data. No multi-user isolation. Data is tied to a single browser instance.

**Current mitigation:** Client-side AES-GCM encryption for backups (see `src/core/utils/Crypto.ts`).

**Recommendations:** If this is intended as a single-user local app, document this clearly. If multi-user is needed, consider adding proper authentication.

### Medium: Sensitive Data in LocalStorage

**Issue:** All business data (customers, appointments, transactions) stored unencrypted in browser's IndexedDB.

**Files:**
- `src/core/db/index.ts`

**Impact:** Anyone with physical/browser access can read all business data. No data isolation between users.

---

## Technical Debt

### High: TypeScript Suppression in BaseService

**Issue:** Uses `@ts-ignore` to bypass type checking when accessing database tables.

**Files:** `src/core/services/BaseService.ts` (line 13)

```typescript
constructor(tableName: keyof typeof db) {
    // @ts-ignore
    this.table = db[tableName];
    this.tableName = String(tableName);
}
```

**Impact:** No compile-time safety for table name access. Could lead to runtime errors if invalid table names are passed.

**Fix approach:** Create proper type-safe table accessor or use a more specific type union.

### Medium: Large Service Files

**Issue:** Several service files exceed 2,000 lines, containing complex business logic.

**Files:**
- `src/core/services/AgendamentoService.ts` (10,533 bytes - 319 lines)
- `src/core/services/ServicoService.ts` (2,517 bytes)
- `src/core/services/BackupService.ts` (4,289 bytes)
- `src/core/services/UsuarioService.ts` (2,009 bytes)

**Impact:** Hard to maintain, test, and understand. Single responsibility principle violated.

**Fix approach:** Extract business rules into separate modules/classes. Consider using domain-driven design patterns.

### Medium: Seeder Code Commented Out

**Issue:** Database seeder is disabled and commented out.

**Files:** `src/core/db/index.ts` (lines 32-35)

```typescript
// db.on("ready", async () => {
//     await seedDatabase(db);
// });
```

**Impact:** No default data population on first run. New installations start empty.

**Fix approach:** Enable seeder for initial setup or create proper onboarding flow.

---

## Performance Issues

### Medium: Sequential Data Fetching in listWithDetails

**Issue:** When fetching appointments with client/service details, each related record is fetched sequentially.

**Files:** `src/core/services/AgendamentoService.ts` (lines 132-146)

```typescript
async listWithDetails(): Promise<AgendamentoComDetalhes[]> {
    const agendamentos = await this.list();

    return Promise.all(
        agendamentos.map(async (ag) => {
            const cliente = await db.clientes.get(ag.clienteId);
            const servico = await db.servicos.get(ag.servicoId);
            // ...
        })
    );
}
```

**Impact:** N+1 query pattern - for 100 appointments, makes 200+ database calls sequentially. Performance degrades with data growth.

**Fix approach:** Use Dexie's `.bulkGet()` or indexedDB's cursor-based loading to fetch related data in batch.

### Medium: Client-Side Dashboard Aggregations

**Issue:** Dashboard statistics (revenue by day, service distribution) are computed client-side on every render.

**Files:** `src/hooks/useDashboardAgendamentos.ts` (lines 74-100+)

**Impact:** Large datasets cause UI lag. No memoization for expensive aggregations beyond React.useMemo.

**Fix approach:** Consider IndexedDB views/aggregations or move computation to Web Workers for large datasets.

---

## Known Functional Gaps

### High: No Transaction Service Integration

**Issue:** Transaction model and service exist but appear disconnected from appointment flow.

**Files:**
- `src/core/models/Transacao.ts`
- `src/core/services/TransacaoService.ts`
- `src/app/transacoes/page.tsx`

**Impact:** No automatic transaction creation when appointments are completed. Revenue tracking must be manual or through separate process.

**Fix approach:** Integrate transaction creation into appointment status change workflow (when status becomes "CONCLUIDO").

### Medium: Limited Search/Filtering Capabilities

**Issue:** No full-text search across entities. Filtering is basic.

**Files:** `src/hooks/useBase.ts`

**Impact:** Users cannot quickly find customers by partial name or phone number. Poor scalability as data grows.

**Fix approach:** Implement Dexie.js full-text search addon or create indexed lookup tables.

### Medium: No Data Export Beyond Backup

**Issue:** Only backup format available for data export. No CSV/Excel export for reports.

**Impact:** Cannot easily share appointment lists with external systems or generate printed reports.

**Fix approach:** Add CSV/Excel export for dashboard reports and list views.

---

## Database Concerns

### Medium: Missing Indexes for Common Queries

**Issue:** Database indexes defined but may not cover all query patterns.

**Files:** `src/core/db/index.ts`

```typescript
this.version(2).stores({
    clientes: "id, nome, telefone, createdAt, updatedAt",
    servicos: "id, nome, duracaoMinutos, preco, createdAt, updatedAt",
    usuarios: "id, nome, inicio, fim, intervaloInicio, intervaloFim, createdAt, updatedAt",
    agendamentos: "id, clienteId, servicoId, dataHora, status, createdAt, updatedAt",
    transacoes: "id, agendamentoId, dataHora, status, createdAt, updatedAt",
});
```

**Impact:** Complex queries (like date range with status filter) may be slow. Dexie relies on indexes for .where() clauses.

**Fix approach:** Add compound indexes for common query patterns (e.g., `dataHora+status` for appointment queries).

### High: Browser-Bound Data Storage

**Issue:** All data stored in browser IndexedDB - no server persistence.

**Files:** `src/core/db/index.ts`

**Impact:**
- Data lost if browser is cleared/cookies deleted
- No cross-device sync
- No backup to cloud
- Cannot access data from multiple devices

**Fix approach:** If this is intended behavior, document clearly. Otherwise, consider adding server-side storage (Supabase, Firebase, etc.).

---

## Error Handling Gaps

### Low: Generic Error Handling in Components

**Issue:** Most error handling just logs to console and shows generic "Erro desconhecido".

**Files:** Multiple components (e.g., `src/app/agendamentos/AgendamentoFormDrawer.tsx`, `src/app/clientes/page.tsx`)

```typescript
} catch (error) {
    console.error(error);
    toast.error(error instanceof Error ? error.message : "Erro desconhecido");
}
```

**Impact:** Poor user experience. Errors don't provide actionable guidance. Hard to debug in production.

**Fix approach:** Add user-friendly error messages for each known error type. Implement error boundaries.

### Low: No Retry Logic for Operations

**Issue:** No retry mechanism for failed database operations.

**Impact:** Network-related or transient failures cause immediate failure without retry.

**Fix approach:** Add retry logic to mutations or use React Query's built-in retry options.

---

## Testing Gaps

### Medium: No Unit Tests

**Issue:** No unit tests for services, hooks, or utilities.

**Impact:** Refactoring is risky. Business logic can break without detection. No confidence in code correctness.

**Current state:** Cypress e2e tests exist (`cypress/e2e/`) but no unit test coverage.

**Fix approach:** Add Vitest or Jest for unit testing services and hooks.

---

## PWA/Offline Concerns

### Low: Service Worker Configuration

**Issue:** Service worker exists (`public/sw.js`) but offline capabilities unclear.

**Files:**
- `public/sw.js`
- `next.config.ts` (Serwist configuration)

**Impact:** App may not work offline. No offline-first guarantee.

**Fix approach:** Test offline behavior and ensure critical flows work without network.

---

## Scalability Limits

### Low: Single User Architecture

**Issue:** No multi-user support. All data in single browser instance.

**Impact:** Cannot serve multiple barbers from same installation. No team features.

**Consider:** If multi-barber scheduling is needed, significant architecture changes required.

---

*Concerns audit: 2026-04-16*