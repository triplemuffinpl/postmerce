# Postmerce Remotion Animation Brief

## Cel

Stworzyć produktową animację na landing Postmerce, która pokazuje najmocniejszy
mechanizm produktu:

> jeden film -> bazowy post -> targety per platforma -> kolejka -> statusy.

Animacja ma pasować do stylu aplikacji, nie do starego landing mockupu.

## Format

Kompozycja bazowa:

- `ProductShowcase`
- 1920x1080
- 30 fps
- 12 sekund
- bez voiceoveru na start
- przygotowana do renderu jako MP4/WebM na landing oraz jako wariant social

## Assets

Używaj realnych screenshotów aplikacji:

- `apps/marketing/public/screenshots/app-dashboard.png`
- `apps/marketing/public/screenshots/app-calendar.png`
- `apps/marketing/public/screenshots/app-control.png`
- `apps/marketing/public/screenshots/app-posts.png`
- `apps/marketing/public/screenshots/app-accounts.png`

Te same screenshoty są skopiowane do:

- `apps/motion/public/screenshots/`

Przed finalnym renderem UI agent powinien zrobić świeże screeny po redesignie.

## Storyboard

### Scena 1: Source video splits into targets

Timing: 0.0-2.5s

Visual:

- ciemne tło w stylu aplikacji,
- jedna karta `launch_clip_001.mp4`,
- karta rozsuwa się na pięć linii targetów,
- platform icons: YouTube, LinkedIn, Instagram, Facebook, TikTok,
- krótkie status pills pojawiają się staggerem.

Copy:

> One video becomes platform-specific publishing targets.

### Scena 2: Calendar

Timing: 2.5-5.0s

Visual:

- screenshot kalendarza wchodzi z lekkim rotate/scale,
- target pills podświetlają się sekwencyjnie,
- linia “schedule” prowadzi do kilku dni,
- statusy `scheduled`, `queued`, `simulated` mają różne kolory.

Copy:

> Plan every target without losing the status.

### Scena 3: Control center

Timing: 5.0-8.4s

Visual:

- screenshot control center,
- wiersze targetów rozdzielają się na status lanes,
- błędy i wymagane reakcje mają inny kolor niż sukces,
- szybkie akcje `retry`, `duplicate`, `cancel` pojawiają się jako mikro-interakcje.

Copy:

> Control what is ready, queued, published or needs action.

### Scena 4: Product close

Timing: 8.4-12.0s

Visual:

- dashboard / product frame,
- platform target lines wracają do jednego control center,
- logo Postmerce,
- CTA.

Copy:

> Postmerce
> Multi-platform video publishing control.

CTA:

> postmerce.pl

## Ruch

Remotion:

- wszystkie animacje przez `useCurrentFrame()`,
- używaj `interpolate()` i `Easing.bezier(...)`,
- sekwencje przez `<Sequence premountFor={fps}>`,
- bez CSS animations w Remotion,
- bez Tailwind animation classes.

Preferowane krzywe:

```ts
Easing.bezier(0.16, 1, 0.3, 1)
Easing.bezier(0.22, 1, 0.36, 1)
Easing.bezier(0.34, 1.56, 0.64, 1)
```

## Styl

- Paleta bazuje na aplikacji Postmerce: violet/indigo/emerald/rose plus czyste
  neutralne tła.
- Platformy mają własne kolory.
- Statusy mają własne kolory.
- Animacja ma być dynamiczna, ale produktowa: zero stockowego “AI gradient hero”.
- Wykorzystuj screenshoty, nie abstrakcyjne mockupy.

## Output

Docelowo:

- `apps/motion/out/postmerce-product-showcase.mp4`
- opcjonalnie `apps/motion/out/postmerce-product-showcase.webm`
- still preview do QA

Na landing:

- dodaj asset do `apps/marketing/public/media/`,
- embed:

```astro
<video autoplay muted loop playsinline poster="/screenshots/app-calendar.png">
  <source src="/media/postmerce-product-showcase.webm" type="video/webm" />
  <source src="/media/postmerce-product-showcase.mp4" type="video/mp4" />
</video>
```

## Kontrola jakości

- Screenshot lub still na 1s, 4s, 7s i 10s.
- Brak pustych klatek.
- Brak tekstu wychodzącego poza kadr.
- Brak screenshotów z testowymi nazwami.
- Czytelny logo/CTA w ostatnich 2 sekundach.
- Wersja mobile landing nie może wymagać pobrania ciężkiego video, jeżeli
  użytkownik ma `prefers-reduced-motion`.
