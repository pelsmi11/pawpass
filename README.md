# PawPass

Aplicación Next.js App Router para registro de mascotas. Parte del workspace `PawPass + Cloud Run Doctor`. Esta fundación instala la base visual cálida y los gates de calidad sin implementar lógica de negocio.

## Requisitos

- Node.js `20.19.x LTS` (compatible con 22) — `node --version`
- pnpm `11.9.0` — `pnpm --version` (pin en `packageManager`)
- Git

## Instalación

```bash
pnpm install --frozen-lockfile
```

No modifica `pnpm-lock.yaml`. Si falla por lock desactualizado, actualizar dependencias y commitear nuevo lock solo si se añadió dep justificada.

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
│   │   ├── page.tsx (SiteHeader + PawpassHero + StatusCard)
│   │   └── globals.css (tokens HSL cálidos, strategy hsl(var(--)))
│   ├── components/
│   │   ├── ui/ (button, card, badge, alert, skeleton, input, label — 7)
│   │   ├── site-header.tsx, pawpass-hero.tsx, status-card.tsx
│   │   └── *.test.tsx
│   └── lib/
│       ├── utils.ts (cn)
│       └── format.ts
├── docs/
│   └── 01-visual-decisions.md
├── .husky/
├── components.json (style default, baseColor stone, shadcn@3.4.1)
├── vitest.config.mts / vitest.setup.ts
└── .env.example
```

## Documentación

- `docs/01-visual-decisions.md` — paleta cálida, tokens HSL y uso de primitives
- `specs/001-project-foundation/` — spec, plan, research, quickstart y tasks de la fundación

## Verificación

```bash
pnpm typecheck
pnpm test:coverage  # V8, 80/80/80/80, offline
pnpm verify
pnpm build
ls src/components/ui | wc -l  # 7
```

Fundación sin Neon, Drizzle, laboratorio de incidentes ni logs de negocio.
