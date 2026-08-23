# PawPass

Aplicación Next.js App Router para registro de mascotas. Parte del workspace `PawPass + Cloud Run Doctor`. La interfaz usa `next-intl` con rutas en inglés y español.

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

## Persistencia, catálogo y laboratorio

- **Neon + Drizzle**: `pawpass/src/db/schema.ts` define `pet_types(id UUID PK, code UNIQUE, title)`, `pets(id UUID PK, name, pet_type_id FK, age INT 0-100, owner_name, session_id UUID INDEXED, created_at TIMESTAMPTZ)` y `demo_config(id="global" PK CHECK id='global', database_outage bool, high_latency bool, latency_ms int 6000, updated_at TIMESTAMPTZ)` — mapeo API `petTypeCode` (DOG/CAT/REPTILE) → `pet_types.code` → `pet_type_id` UUID; REPTILE usa sentinel `00000000-0000-4000-a000-000000000000` para 23503.
- **Migraciones**: `pawpass/drizzle/0001_pet_catalog_and_pets.sql` y `0002_demo_config.sql` (CHECK + seed `global,false,false,6000`). Aplicar con `DATABASE_URL_UNPOOLED=... pnpm exec drizzle-kit migrate` (nunca auto-ejecuta al iniciar Next.js; `drizzle.config.ts` exige solo `DATABASE_URL_UNPOOLED`).
- **Clientes**: `pawpass/src/db/client.ts` `db` (DATABASE_URL pooled) y `getBrokenDb()` lazy (BROKEN_DATABASE_URL, solo con `database_outage=true`); `DATABASE_URL_UNPOOLED` solo migraciones.
- **Catálogo constante**: `pawpass/src/utils/constant/petCatalog.ts` exporta `PET_TYPE_CODES=["DOG","CAT","REPTILE"]` y `REPTILE_SENTINEL_UUID`; formulario usa constante + `next-intl` (no `GET /api/pet-types`); `GET /api/pet-types` conserva verdad persistida (solo DOG/CAT).
- **Laboratorio**: `demo_config` single-row `global` gobierna `db` vs `getBrokenDb()`; panel `DemoLabPanel` siempre visible `#demo-lab` con `GET /api/demo/status` público; writes requieren `x-demo-token` vs `DEMO_CONTROL_TOKEN` + `DEMO_LAB_ENABLED=true` (403 LAB_DISABLED / 403 INVALID_DEMO_TOKEN); `BROKEN` produce 503, REPTILE 23503 produce 500 con `supportId === requestId` UUID puro.
- `.env.example` mantiene valores ficticios; `.env.local` ignorado.

## API

- `GET /api/health` → `{status:"ok", service:"pawpass", requestId}` (200 siempre, sin DB)
- `GET /api/pet-types` → `{ok, petTypes:[{id,code,title}], requestId}` (solo DOG/CAT, asegura `pawpass_session`)
- `GET /api/session` → `{ok:true}` (crea/confirma cookie `pawpass_session` HttpOnly SameSite=Lax Secure prod Max-Age 86400; nunca expone `sessionId` en body)
- `GET /api/pets` → `{ok, pets:[{id,name,petTypeId,age,ownerName,createdAt, petType:{id,code,title}}], requestId}` máx 50, orden `created_at DESC`, nunca expone `session_id`
- `POST /api/pets` → `{name, petTypeCode:"DOG"|"CAT"|"REPTILE", age?, ownerName}` → `201 {ok, pet, requestId}` (DOG/CAT), `500 {ok:false, errorCode:"INTERNAL_ERROR", supportId}` (REPTILE → 23503), `503 {ok:false, errorCode:"SERVICE_UNAVAILABLE", supportId}` (outage), `400 {ok:false, errorCode, fieldErrorCodes, supportId}` (validación; rechaza `petTypeId`/`sessionId`/`session_id`; `supportId` = `requestId` UUID puro)
- `GET /api/demo/status` → `{ok, demo:{databaseOutage, highLatency, latencyMs, updatedAt}, requestId}` público, sin secretos
- `POST /api/demo/database-outage` → `x-demo-token` + `DEMO_LAB_ENABLED=true` → `200 {ok:true, demo, requestId}` o `403 {ok:false, errorCode:"LAB_DISABLED"|"INVALID_DEMO_TOKEN", supportId}`; log `DEMO_DATABASE_OUTAGE_ACTIVATED`
- `POST /api/demo/reset` → idem `403` o `200` + `DEMO_INCIDENT_RESET`, siempre con `db` normal, establece `false/false/6000`
- Logs JSON single-line `service:"pawpass"` con `severity/message/event/route/sessionId/requestId/httpStatus/durationMs/petTypeCode/errorType/databaseCode/incident` (sin PII/secretos/URLs)

## Scripts

| Script | Comando | Descripción |
|--------|---------|-------------|
| `dev` | `next dev` | Desarrollo |
| `build` | `next build` | Build producción (sin Neon, con `DATABASE_URL` ficticia válida si no hay `.env.local`) |
| `start` | `next start` | Servir build |
| `lint` | `eslint .` | ESLint flat config |
| `typecheck` | `tsc --noEmit` | Tipos (`forceConsistentCasingInFileNames:true`) |
| `test` | `vitest` | Watch |
| `test:unit` | `vitest run` | Unitario |
| `test:coverage` | `vitest run --coverage` | Cobertura V8 80% (4 métricas) |
| `test:integration` | `vitest run --config vitest.config.integration.mts` | Integración Neon opt-in (requiere `DATABASE_URL`/`UNPOOLED`/`BROKEN` de rama aislada, verifica sentinel 23503 y outage; no en precommit) |
| `verify` | `pnpm lint && pnpm typecheck && pnpm test:coverage` | Gate Husky/CI (sin Neon, sin build) |
| `verify:full` | `pnpm verify && pnpm build` | Gate final antes de PR/deploy (sin Neon) |
| `prepare` | `node .husky/install.mjs` | Instala hooks Husky (omite en `CI=true` o `NODE_ENV=production`) |

## Estructura

```
pawpass/
├── src/
│   ├── app/
│   │   ├── [locale]/layout.tsx
│   │   ├── [locale]/page.tsx (rutas `/en` y `/es`)
│   │   ├── globals.css (tokens HSL cálidos, strategy hsl(var(--)))
│   │   └── api/
│   │       ├── pet-types/route.ts
│   │       ├── pets/route.ts (GET list 50 + POST create)
│   │       └── session/route.ts
│   ├── i18n/ (routing, request y navegación localizada)
│   ├── proxy.ts (redirección `/` → `/en`, excluye APIs/assets)
│   ├── components/
│   │   ├── ui/ (button, card, badge, alert, skeleton, input, label — 7)
│   │   ├── index.ts (barrel de componentes propios)
│   │   ├── SiteHeader.tsx, PawpassHero.tsx, StatusCard.tsx
│   │   ├── PetForm.tsx (RHF+Zod, usa GET /api/pet-types, Tab/Enter navegable)
│   │   ├── PetList.tsx (lista 50, estado vacío en español)
│   │   ├── Providers.tsx (QueryClientProvider)
│   │   └── *.test.tsx (incluye Tab/Enter y límites 100/101)
│   ├── hooks/ (custom hooks y barrel `index.ts`)
│   ├── interface/ (tipos de dominio, API y validación)
│   ├── utils/
│   │   ├── constant/ (constantes propias)
│   │   └── functions/ (funciones puras y builders API)
│   ├── db/
│   │   ├── schema.ts (pet_types, pets con índice session_id)
│   │   ├── client.ts (pooled neon http)
│   │   └── queries.ts (listPetTypes, findPetTypeById, createPet, listRecentPets)
│   ├── services/
│   │   ├── petService.ts (orquesta validación → catálogo → sesión → insert)
│   │   └── session.ts (cookie pawpass_session, no headers)
│   ├── validation/petValidation.ts (Zod, códigos estables, límites 100/101, rechazo sessionId)
│   └── lib/utils.ts (shim compatible para shadcn)
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

## Internacionalización

- Locales soportados: `en` y `es`; inglés es el predeterminado.
- Todas las páginas usan prefijo obligatorio y `/` redirige a `/en`.
- El selector `EN / ES` conserva la ruta actual; las APIs permanecen en `/api/*`.
- `DOG` y `CAT` se traducen por `code`; el `title` persistido se conserva como fallback para códigos futuros.
- Los errores de API usan `errorCode`/`fieldErrorCodes`; ningún handler devuelve texto humano localizado.

## Checks adicionales (SPEC-002)

```bash
# No expone session_id en respuestas públicas
grep -r "session_id" src/app/api --include="*.ts" | grep -v "session_id.*idx" || echo "ok"
# No usa headers para sesión
grep -r "authorization\|x-session" pawpass/src --include="*.ts" --include="*.tsx" | grep -i session && echo "fail" || echo "ok: solo cookie"
# cloud-run-doctor intacto
git status --porcelain -- ../cloud-run-doctor 2>&1 | head
```
