# Postmerce UI Agent Brief

## Cel

Przebudować warstwę wizualną Postmerce tak, żeby aplikacja i landing wyglądały
jak jeden nowoczesny produkt publishing control center.

Design ma iść w stronę aktualnej aplikacji: jasny, precyzyjny, produktowy,
lekko futurystyczny, z mocnymi kolorami statusów i platform. Landing ma wyglądać
jak publiczny produkt, nie jak opis etapu technicznego.

## Najważniejsze zasady repo

Przeczytaj przed pracą:

1. `AGENTS.md`
2. `README.md`
3. `docs/ARCHITECTURE.md`
4. `docs/marketing/README.md`
5. ten plik

Nie ruszaj:

- logiki publikowania,
- migracji bazy,
- szyfrowania tokenów,
- OAuth,
- workerów,
- backend services,
- danych `.env`,
- Caddy/deploy, jeśli zadanie dotyczy tylko UI.

Możesz ruszać:

- `apps/app/public/assets/app.css`
- `apps/app/src/ui/layout.ts`
- `apps/app/src/ui/pages/*`
- `apps/app/src/ui/components/*`
- `apps/marketing/src/pages/index.astro`
- `apps/marketing/src/styles/site.css`
- `apps/marketing/public/screenshots/*`
- `apps/motion/*`, jeżeli pracujesz nad Remotion

Zasady kodu:

- Nie używaj `any`.
- Nie wkładaj logiki biznesowej do komponentów UI.
- Nie zmieniaj nazw statusów w domenie bez migracji i backend review.
- Utrzymaj SSR/string-rendering w appce, dopóki nie ma decyzji o frontendowym frameworku.
- Ikony mogą być inline SVG albo mały helper, ale bez ciężkiej biblioteki, jeśli nie jest potrzebna.
- Style powinny być w CSS/tokens, nie w losowych inline style, chyba że to szybki wyjątek do późniejszego sprzątania.

## Platformy

Źródło prawdy: `apps/app/src/domain.ts`

Platformy:

- `youtube`
- `linkedin`
- `instagram`
- `facebook`
- `tiktok`

Każdy element dotyczący platformy ma mieć:

- ikonę/logo platformy,
- kolor platformy,
- delikatne tło platformy,
- nazwę platformy,
- spójny wariant kompaktowy i pełny.

Proponowane tokeny:

```css
--platform-youtube: #ef4444;
--platform-youtube-soft: #fee2e2;
--platform-linkedin: #0a66c2;
--platform-linkedin-soft: #dbeafe;
--platform-instagram: #e1306c;
--platform-instagram-soft: #fce7f3;
--platform-facebook: #1877f2;
--platform-facebook-soft: #dbeafe;
--platform-tiktok: #111827;
--platform-tiktok-soft: #e5e7eb;
```

Docelowe helpery:

- `platformBadge(platform)`
- `platformIcon(platform)`
- `platformToneClass(platform)`
- `platformLabel(platform)`

Nie duplikuj map platform w pięciu plikach. Stwórz jeden mały UI helper, np.
`apps/app/src/ui/components/platform-meta.ts`.

## Statusy targetów

Źródło prawdy:

```ts
PostTargetStatus =
  | "draft"
  | "scheduled"
  | "queued"
  | "publishing"
  | "processing_on_platform"
  | "published"
  | "simulated"
  | "failed"
  | "requires_user_action"
  | "cancelled"
  | "skipped";
```

Każdy status musi mieć osobny wygląd:

| Status | PL label | Ton |
| --- | --- | --- |
| `draft` | Szkic | neutralny, szary |
| `scheduled` | Zaplanowany | niebieski |
| `queued` | W kolejce | fioletowy |
| `publishing` | Publikowanie | amber/orange + subtelny pulse |
| `processing_on_platform` | Przetwarzanie | cyan/blue + loader |
| `published` | Opublikowany | zielony |
| `simulated` | Symulacja | emerald/lime |
| `failed` | Błąd | czerwony |
| `requires_user_action` | Wymaga reakcji | pomarańczowy |
| `cancelled` | Anulowany | slate |
| `skipped` | Pominięty | muted |

Docelowe helpery:

- `targetStatusMeta(status)`
- `targetStatusBadge(status)`
- `targetStatusClass(status)`

Aktualnie `targetStatusBadge` jest w `apps/app/src/ui/components/post-components.ts`.
To dobry kandydat do rozbudowy albo przeniesienia do osobnego helpera.

## Statusy postów, kont i jobów

Obsłuż też:

```ts
PostStatus =
  | "draft"
  | "scheduled"
  | "queued"
  | "publishing"
  | "partially_published"
  | "published"
  | "failed"
  | "cancelled";

PublishJobStatus =
  | "pending"
  | "running"
  | "succeeded"
  | "failed"
  | "cancelled";

SocialAccountStatus =
  | "connected"
  | "disconnected"
  | "requires_reauth"
  | "missing_permissions"
  | "disabled"
  | "error";
```

Zasada:

- sukcesy zielone,
- plan/schedule niebieski,
- kolejka fiolet,
- akcja wymagana pomarańcz,
- błąd czerwony,
- anulowane/disabled szare,
- running/publishing animowany, ale subtelnie.

## Kalendarz

Plik: `apps/app/src/ui/pages/calendar-page.ts`

Wymagania:

- Każdy `calendar-target-card` ma platform badge z ikoną.
- Tło targetu powinno łączyć platformę i status, ale status musi być czytelniejszy niż dekoracja.
- Dni z problemami powinny mieć dyskretny alert marker.
- Dni z wieloma targetami powinny mieć licznik i kompaktową listę bez rozjazdów.
- Mobile: kalendarz nie może ściskać siedmiu kolumn. Na mobile użyj agenda/list view albo poziomy scroll z jasnym affordance.
- `+N więcej` powinno wyglądać jak akcja, nie jak zwykły tekst.
- Popraw polskie znaki w outputach widocznych przez UI, jeśli gdzieś pojawia się mojibake.

## Kontrola publikacji i zlecenia

Pliki:

- `apps/app/src/ui/pages/publishing-control-page.ts`
- `apps/app/src/ui/pages/jobs-page.ts`
- `apps/app/src/ui/components/target-control-components.ts`
- `apps/app/src/ui/components/job-components.ts`

Wymagania:

- Target row zaczyna się od platform badge + target id.
- Status ma większą hierarchię niż numer joba.
- Błędy mają osobny blok: ikona, krótkie label, tekst błędu, akcja.
- Akcje `Kolejkuj`, `Duplikuj`, `Anuluj` mają różne tony i nie zlewają się.
- Szczegóły/edycja nie mogą powodować poziomego rozjazdu tabeli.
- Rozważ card/list layout na mobile zamiast tabel.

## Landing

Pliki:

- `apps/marketing/src/pages/index.astro`
- `apps/marketing/src/styles/site.css`
- `apps/marketing/public/screenshots/*`

Kierunek:

- Landing ma wyglądać jak aplikacja Postmerce, nie jak osobny produkt.
- Używaj realnych screenshotów aplikacji.
- Nie pokazuj linku do stagingu.
- Nie opisuj etapów technicznych.
- Copy publiczne jest w `docs/marketing/02-website-copy-pl.md`.
- Animacje mogą być CSS/SVG/JS, ale strona musi zostać szybka.

Animacje:

- Hero: screenshoty mogą “rozsuwać” się w targety per platforma.
- Hover na platform cards: ikona może przekształcać się w status pill albo linię kolejki.
- Sekcja workflow: kroki mogą aktywować się sekwencyjnie przy scrollu.
- SVG line animation: film -> post -> platform target -> queue -> status.
- Nie używaj ciężkich animacji blokujących layout.
- Szanuj `prefers-reduced-motion`.

## Remotion

Remotion scaffold jest w `apps/motion`.

Cel dla UI agenta:

- dopracować kompozycję `ProductShowcase`,
- użyć screenshotów z `apps/motion/public/screenshots`,
- wyrenderować video/loop do assetów landing page,
- zintegrować finalny render z Astro jako `<video>` albo jako sequence krótkich
  animowanych elementów, jeśli lepiej działa wydajnościowo.

Brief animacji jest w:

`docs/REMOTION_ANIMATION_BRIEF_PL.md`

## Walidacja minimalna

Po zmianach UI:

```powershell
npm run typecheck -w @postmerce/app
npm run typecheck -w @postmerce/marketing
npm run build -w @postmerce/marketing
npm run lint
```

Jeśli dotykasz Remotion:

```powershell
npm run still -w @postmerce/motion
```

Jeśli zmieniasz app UI:

- uruchom staging/local app,
- zrób screenshot dashboard, calendar, control, jobs, accounts,
- sprawdź desktop i mobile,
- sprawdź, że CSS `/assets/app.css` nadal ładuje się jako `text/css`.

## Najważniejszy efekt

Po pracy UI agent powinien oddać:

- spójny system platform badges,
- spójny system status badges,
- poprawiony kalendarz,
- poprawione control/jobs tables,
- landing w tym samym stylu co aplikacja,
- realne produktowe screenshoty,
- Remotion/product animation gotową do użycia na stronie,
- brak copy o stagingu i wewnętrznym etapie w publicznych materiałach.
