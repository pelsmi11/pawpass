# PawPass — Decisiones visuales

**Repositorio**: `pawpass/` | **Fecha**: 2026-08-22 | **shadcn**: `3.4.1` pinneada

## Sistema de diseño

**Estilo**: Soft UI Evolution — calidez suave con contraste real. Superficies con sombras multicapa cálidas (sin líneas duras), interacciones de 150–200 ms y foco visible. Profesional-cálido: nunca infantil (se descartó Claymorphism por toy-like). Soportado en light y dark.

Generado y verificado con el skill `ui-ux-pro-max` (estilo + pairing tipográfico desde su base de datos).

## Tipografía

| Rol | Fuente | Uso |
|-----|--------|-----|
| Display | **Varela Round** (400) | `font-display`: h1, wordmark, iniciales de avatar |
| Body | **Nunito Sans** (variable) | `--font-sans` default en body |

Cargadas vía `next/font/google` en `layout.tsx` (self-hosted, sin CLS). Escala: h1 `text-4xl sm:text-5xl`, body 16 px con `leading-relaxed`, secundario `text-sm`. Varela Round no se combina con `font-bold` (peso único 400, evita faux-bold).

## BaseColor, style y radius

- **style**: `default`, **baseColor**: `stone` (la más cálida de shadcn)
- **radius**: `0.625rem` (10px) — amable sin ser infantil
- **Sombras**: `--shadow-soft` (superficies) y `--shadow-lifted` (tarjetas destacadas), tintadas stone `rgb(28 25 23 / …)` en `@theme`

## Tokens HSL (estrategia A: triple sin envolver + `hsl(var(--token))`)

En `src/app/globals.css`:

- **Claro** (`:root`): `--background 35 33% 98%`, `--foreground 20 14% 12%`, `--primary 24 95% 53%`, `--secondary 30 20% 94%`, `--muted 30 10% 94%`, `--accent 35 91% 65%`, `--destructive 0 72% 51%`, `--border/--input 30 12% 88%`, `--ring 24 95% 53%`
- **Oscuro** (`.dark`): `--background 20 14% 8%`, `--primary 24 94% 58%`, semánticos ajustados (ver contraste)
- **Semánticos**: `--success 142 72% 30%` (verde AA), `--warning 38 92% 50%` (ámbar, texto tinta), `--info 200 98% 32%` (sky AA)
- **Chart/Sidebar**: espejan primary/success/info

### Foregrounds semánticos (corrección 2026-08-22)

Los pares texto/fondo se verificaron numéricamente (WCAG 4.5:1 texto normal):

| Par | Ratio | Nota |
|-----|-------|------|
| tinta sobre `--primary` | 5.8–7.2 | blanco fallaba (2.8) → `--primary-foreground: 20 14% 12%` |
| blanco sobre `--success` | 4.8–5.1 | success oscurecido de 45%→30%/29% lightness |
| tinta sobre `--warning` | 7.8–10.4 | ámbar siempre lleva tinta oscura |
| blanco/tinta sobre `--info` | 5.7–8.3 | info oscurecido en claro, aclarado en oscuro |
| `--muted-foreground` sobre card | 4.7 | mínimo para texto secundario |

Regla: **los tokens medios (ámbar/naranja) llevan tinta oscura encima; los oscuros (verde/sky/rojo) llevan blanco.**

## Espaciado y responsive

- Contenedor `max-w-6xl`, padding lateral `px-4 sm:px-6`
- Secciones `py-10 sm:py-14`; bloques internos `gap-3/4/6`
- Mobile-first: nav oculta `<md` (queda brand + CTA), hero apila columnas `<lg`, tarjetas ancho completo
- Breakpoints Tailwind estándar (sm 640 / md 768 / lg 1024); verificado mentalmente en 375/768/1280

## Estados

- **Hover**: `hover:bg-primary/90`, nav `hover:bg-accent`, transiciones `duration-150/200`
- **Focus-visible**: ring 2px `--ring` + offset (primitives shadcn); skip-link visible al enfocar
- **Disabled**: `opacity-50 pointer-events-none` (en primitives)
- **Motion reducido**: `@media (prefers-reduced-motion: reduce)` global en `globals.css`
- **Touch targets**: CTAs principales usan `size="lg"` (44px); iconos decorativos siempre `aria-hidden`

## Cuándo usar cada token

- **primary**: CTA principal “Register a pet”, marca, iconos de confianza
- **secondary/muted**: fondos suaves, chips, avatares, texto secundario
- **success**: badge “Healthy”, confirmaciones positivas
- **warning**: atención sin error (“Due soon”, recordatorio de vacuna)
- **info**: neutro informativo
- **destructive**: solo error real de validación o fallo
- **border/input/ring**: bordes suaves (`/60` sobre card), inputs y foco cálido

## Componentes de página

- **site-header**: sticky con blur (`bg-background/80 backdrop-blur`), logo mark PawPrint en tile primario, nav (Pets/Health/Reminders), CTA `size="sm"`, skip-to-content
- **pawpass-hero**: grid `lg:[1.1fr_0.9fr]`; mensaje + CTAs + trust points (iconos lucide) junto a tarjeta perfil de mascota (avatar, badge Healthy, dl de stats, next checkup)
- **status-card**: búsqueda habilitada arriba, lista de mascotas con badges semánticos (texto, nunca solo color), alert warning contextual, footer global discreto

## Qué NO hacer

- No hardcodear hex en componentes — usar tokens (sombras definidas como tokens `--shadow-*`)
- No instalar `dialog`/`table`/`sonner` en fundación — diferidos
- No mezclar estrategia HSL B (`hsl(...)`) con A — solo A
- No usar blanco como foreground sobre ámbar/naranja; no clarear `--success` sin reverificar contraste
- No reutilizar paleta de Doctor (stone cálido ≠ slate frío)
