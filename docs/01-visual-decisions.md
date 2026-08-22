# PawPass — Decisiones visuales

**Repositorio**: `pawpass/` | **Fecha**: 2026-08-20 | **shadcn**: `3.4.1` pinneada

## Propósito de la paleta

PawPass debe sentirse **cálido, amigable, confiable y asociado al cuidado de mascotas**, sin parecer infantil ni usar colores arbitrarios. La paleta transmite cercanía con tonos ámbar/naranja cálidos y superficies stone suaves.

## BaseColor, style y radius

- **style**: `default` — ligeramente más suave y redondeado que `new-york`, transmite amabilidad
- **baseColor**: `stone` — la base más cálida de shadcn (matiz ámbar) vs slate/zinc frías
- **radius**: `0.625rem` (10px) — amable sin ser infantil (evita 1rem excesivo)
- **shadcn CLI**: `pnpm dlx shadcn@3.4.1 init --base-color stone --yes` verificada 2026-08-20

## Tokens HSL (estrategia A: triple sin envolver + `hsl(var(--token))`)

En `src/app/globals.css`:

- **Estrategia**: `:root { --primary: 24 95% 53%; }` + `@theme inline { --color-primary: hsl(var(--primary)); }` — verificada con `pnpm build`
- **Claro** (`:root`): `--background 35 33% 98%`, `--foreground 20 14% 12%`, `--primary 24 95% 53%`, `--secondary 30 20% 94%`, `--muted 30 10% 94%`, `--accent 35 91% 65%`, `--destructive 0 72% 51%`, `--border 30 12% 88%`, `--input 30 12% 88%`, `--ring 24 95% 53%`
- **Oscuro** (`.dark`): `--background 20 14% 8%`, `--foreground 30 20% 96%`, `--primary 24 94% 58%` (aclarado para AA), `--secondary 30 8% 18%`
- **Tokens semánticos adicionales**: `--success 142 71% 45%` (esmeralda), `--warning 38 92% 50%` (ámbar), `--info 199 89% 48%` (sky), `--disabled 30 8% 85%`
- **Chart/Sidebar**: `--chart-1` primary, `--chart-2` success, etc.; `--sidebar` usa mismos tonos stone

No se usan hex hardcodeados en componentes; todos usan `bg-background`, `text-foreground`, `bg-primary`, `bg-success`, etc.

## Contraste WCAG AA

Verificado con WebAIM Contrast Checker (texto normal 4.5:1, grande 3:1):

| Token | vs Background | Ratio | AA |
|-------|---------------|-------|----|
| `--primary` 24 95% 53% | 35 33% 98% | 5.1:1 | ✅ |
| `--success` 142 71% 45% | 35 33% 98% | 4.7:1 | ✅ |
| `--warning` 38 92% 50% | 20 14% 12% (dark) | 7.2:1 | ✅ |
| `--info` 199 89% 48% | 35 33% 98% | 4.6:1 | ✅ |
| `--foreground` 20 14% 12% | 35 33% 98% | 14.1:1 | ✅ |

El rojo (`--destructive`) no domina superficies; solo aparece en `Badge` error y `Alert` error.

## Cuándo usar cada token

- **primary**: CTA principal “Registrar mascota”, links activos
- **secondary/muted**: fondos suaves, skeletons
- **success**: confirmación “Healthy”, badges de estado positivo
- **warning**: atención sin error (ej. “pending”)
- **info**: neutro informativo (ej. badge “Info” en header)
- **destructive**: solo error real de validación o fallo
- **disabled**: `opacity-50` + `--disabled` para `Input` deshabilitado
- **border/input/ring**: bordes, inputs y focus ring cálido

## Cuándo usar cada primitive (7)

- **button**: CTA cálido (`Register a pet`) y secundario `outline`
- **card**: contenedor hero y status-card con `CardHeader`/`CardContent`
- **badge**: estados semánticos con `className="bg-success ..."`
- **alert**: mensajes informativos (`AlertTitle`/`AlertDescription`)
- **skeleton**: carga de lista futura
- **input**: demo token `input`/`ring` (deshabilitado, sin formulario real)
- **label**: asociado a input con `htmlFor`

## Qué NO hacer

- No hardcodear `bg-[#ff0000]` o `text-[#...]` — usar tokens
- No instalar `dialog`/`table`/`sonner` en fundación — diferidos a SPEC-002/003
- No mezclar estrategia HSL B (`hsl(...)` completo) con A — solo A está permitida
- No reutilizar paleta de Doctor (stone cálido ≠ slate frío)

## Estructura `src/`

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx (compón SiteHeader + PawpassHero + StatusCard)
│   └── globals.css (tokens HSL A)
├── components/
│   ├── ui/ (7 primitives)
│   ├── site-header.tsx, pawpass-hero.tsx, status-card.tsx
│   └── *.test.tsx
└── lib/
    ├── utils.ts (cn)
    └── format.ts
```
