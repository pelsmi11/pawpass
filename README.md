# PawPass

Aplicación Next.js App Router para registro de mascotas. Parte del workspace `PawPass + Cloud Run Doctor`. Esta fundación instala la base visual cálida y los gates de calidad sin implementar lógica de negocio.

## Requisitos

- Node.js `20.19.x LTS` (compatible con 22) — `node --version`
- pnpm `11.9.0` — `pnpm --version` (pin en `packageManager`)
- Git
- Neon PostgreSQL (para registro; tests usan mocks sin red)

## Instalación

```bash
pnpm install --frozen-lockfile
```

No modifica `pnpm-lock.yaml`. Si falla por lock desactualizado, actualizar dependencias y commitear nuevo lock solo si se añadió dep justificada.

## Persistencia y catálogo

- **Neon + Drizzle**: `pawpass/src/db/schema.ts` define `pet_types(id UUID PK, code UNIQUE, title)` y `pets(id UUID PK, name, pet_type_id FK, age INT 0-100, owner_name, session_id UUID INDEXED, created_at TIMESTAMPTZ)` — mapeo API `petTypeId` ↔ DB `pet_type_id` ↔ Drizzle `petTypeId`.
- **Migración**: `pawpass/drizzle/0001_pet_catalog_and_pets.sql` con índice `pets_session_id_idx` y seeds `DOG→Perro`, `CAT→Gato`. Aplicar con `pnpm exec drizzle-kit migrate` (no auto-ejecuta al iniciar Next.js).
- **Clientes**: `pawpass/src/db/client.ts` usa `@neondatabase/serverless` pooled HTTP para tráfico normal; `drizzle.config.ts` usa `DATABASE_URL` directa para migraciones.
- `.env.example` mantiene valores ficticios; `.env.local` ignorado.

## API

- `GET /api/pet-types` → `{ok, petTypes:[{id,code,title}], requestId}` (lee catálogo, asegura `pawpass_session`)
- `GET /api/session` → `{ok:true}` (crea/confirma cookie `pawpass_session` HttpOnly SameSite=Lax Secure prod Max-Age 86400; nunca expone `sessionId` en body)
- `GET /api/pets` → `{ok, pets:[{id,name,petTypeId,age,ownerName,createdAt, petType:{id,code,title}}], requestId}` máx 50, orden `created_at DESC`, nunca expone `session_id`
- `POST /api/pets` → `{name, petTypeId, age?, ownerName}` → `201 {ok, pet, requestId}` o `400 {ok:false, message, fieldErrors, supportId}` (rechazo estricto si body trae `sessionId`/`session_id`; validación Zod en español; `supportId` = `requestId`)

## Scripts

| Script | Comando | Descripción |
|--------|---------|-------------|
| `dev` | `next dev` | Desarrollo |
| `build` | `next build` | Build producción |
| `start` | `next start` | Servir build |
| `lint` | `eslint .` | ESLint flat config |
| `typecheck` | `tsc --noEmit` | Tipos |
| `test` | `vitest` | Watch |
| `test:unit` | `vitest run` | Unitario |
| `test:coverage` | `vitest run --coverage` | Cobertura V8 80% |
| `verify` | `pnpm typecheck && pnpm test:coverage` | Gate Husky/CI |
| `prepare` | `node .husky/install.mjs` | Instala hooks Husky |

## Estructura

```
pawpass/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx (SiteHeader + PawpassHero + PetForm + PetList + StatusCard)
│   │   ├── globals.css (tokens HSL cálidos, strategy hsl(var(--)))
│   │   └── api/
│   │       ├── pet-types/route.ts
│   │       ├── pets/route.ts (GET list 50 + POST create)
│   │       └── session/route.ts
│   ├── components/
│   │   ├── ui/ (button, card, badge, alert, skeleton, input, label — 7)
│   │   ├── site-header.tsx, pawpass-hero.tsx, status-card.tsx
│   │   ├── pet-form.tsx (RHF+Zod, usa GET /api/pet-types, Tab/Enter navegable)
│   │   ├── pet-list.tsx (lista 50, estado vacío en español)
│   │   ├── providers.tsx (QueryClientProvider)
│   │   └── *.test.tsx (incluye Tab/Enter y límites 100/101)
│   ├── db/
│   │   ├── schema.ts (pet_types, pets con índice session_id)
│   │   ├── client.ts (pooled neon http)
│   │   └── queries.ts (listPetTypes, findPetTypeById, createPet, listRecentPets)
│   ├── services/
│   │   └── pet.service.ts (orquesta validación → catálogo → sesión → insert)
│   └── lib/
│       ├── utils.ts (cn)
│       ├── format.ts
│       ├── validation.ts (Zod, mensajes ES, 100/101 límites, rechazo sessionId)
│       ├── session.ts (cookie pawpass_session, no headers)
│       ├── request-context.ts (requestId UUID)
│       └── errors.ts
├── drizzle/
│   ├── 0001_pet_catalog_and_pets.sql
│   └── meta/_journal.json
├── drizzle.config.ts
├── docs/
│   └── 01-visual-decisions.md
├── .husky/
├── components.json (style default, baseColor stone, shadcn@3.4.1)
├── vitest.config.mts / vitest.setup.ts
└── .env.example
```

## Documentación

- `docs/01-visual-decisions.md` — paleta cálida, tokens HSL, uso de primitives y notas de formulario/lista
- `specs/001-project-foundation/` — spec, plan, research, quickstart y tasks de la fundación
- `specs/002-pet-registration/` — spec, plan, data-model, contracts, quickstart y tasks del registro

## Verificación

```bash
pnpm typecheck
pnpm test:coverage  # V8, 80/80/80/80, offline (mocks, sin Neon real)
pnpm verify
pnpm build
ls src/components/ui | wc -l  # 7
```

## Flujo de sesión

- Cookie `pawpass_session` (UUID, HttpOnly, SameSite=Lax, Secure prod, 24h) se crea al primer request relevante vía `GET /api/session` o cualquier handler que llame `getOrCreateSessionId()`. Nunca via header `Authorization` ni body.
- `POST /api/pets` persiste `session_id` en `pets.session_id` (indexado) y nunca lo expone en respuestas públicas.

## Checks adicionales (SPEC-002)

```bash
# No expone session_id en respuestas públicas
grep -r "session_id" src/app/api --include="*.ts" | grep -v "session_id.*idx" || echo "ok"
# No usa headers para sesión
grep -r "authorization\|x-session" pawpass/src --include="*.ts" --include="*.tsx" | grep -i session && echo "fail" || echo "ok: solo cookie"
# cloud-run-doctor intacto
git status --porcelain -- ../cloud-run-doctor 2>&1 | head
```
