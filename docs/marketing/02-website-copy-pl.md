# Postmerce - komplet copy na strone

Ten dokument zawiera copy na publiczny landing, warianty hero, mikrocopy, FAQ i teksty bezpieczne pod platform review. Aktualna strona powinna byc szczera: Postmerce jest private-first produktem w aktywnym rozwoju, a publiczny SaaS nie jest jeszcze otwarty.

## Meta

### PL

Title:

> Postmerce - jeden material, osobne publikacje, pelna kontrola

Description:

> Postmerce to private-first system do przygotowania, kolejkowania i kontrolowania publikacji video na wielu platformach.

### EN, gdy trzeba pod review

Title:

> Postmerce - private-first social publishing control

Description:

> Postmerce lets authorized users upload video, prepare platform-specific publishing targets, queue jobs, and review target-level status.

## Nawigacja

- Brand: Postmerce
- Privacy
- Terms
- Data deletion
- Optional future: Early access

Legal pages zostaja po angielsku, bo pracuja tez pod platform review.

## Hero - wersja glowna

Eyebrow:

> Private-first publishing control center

H1:

> Jeden material. Osobne decyzje dla kazdej platformy.

Lead:

> Postmerce pomaga wgrac wideo, przygotowac bazowy post, dopasowac targety per platforma, wyslac je do kolejki i sprawdzic status kazdej publikacji bez udawania, ze dystrybucja contentu jest jednym przyciskiem.

CTA primary:

> Porozmawiajmy o early access

CTA secondary:

> Prywatny staging

Status note:

> Status: najpierw prywatny system Triple Muffin, potem produkt dla zespolow, ktore publikuja regularnie i potrzebuja kontroli procesu.

## Hero - warianty

### Wariant bardziej produktowy

H1:

> Zamien jeden film w kontrolowany workflow publikacji.

Lead:

> Postmerce rozdziela material, post bazowy, targety platformowe, kolejke i statusy. Dzieki temu widzisz, co ma wyjsc, gdzie ma wyjsc, na jakim koncie i co zrobic, jezeli platforma zatrzyma publikacje.

### Wariant mocniejszy / founder note

H1:

> Nie publikuj szybciej chaosu.

Lead:

> Jezeli jeden film ma trafic na kilka platform, to nie jest juz jeden post. To zestaw decyzji, limitow i statusow. Postmerce powstal po to, zeby ten proces byl widoczny, powtarzalny i gotowy do skalowania dopiero wtedy, gdy core naprawde dziala.

### Wariant review-safe po angielsku

H1:

> Private-first publishing control for platform-specific video posts.

Lead:

> Postmerce lets authorized users upload a video, prepare platform-specific captions and settings, queue publication jobs, and review the status of each publishing target. The product is currently used privately by Triple Muffin while the publishing workflow is being validated.

## Sekcja problemu

Eyebrow:

> Problem

H2:

> Publikacja to proces, nie moment wrzucenia pliku.

Body:

> Ten sam material inaczej dziala na YouTube Shorts, LinkedIn, Instagramie, Facebooku i TikToku. Inny tytul, inny opis, inny rytm, inne konto, inna prywatnosc, inne limity API i inne miejsce, w ktorym cos moze pojsc nie tak.

> Postmerce porzadkuje ten proces od strony operacyjnej: media, warianty platformowe, kolejka, worker, statusy, retry i historia.

Insight card:

> Glowna zasada

> Nie publikuj szybciej chaosu. Publikuj z kontrola.

> Szybkosc ma sens dopiero wtedy, gdy wiesz, co zostalo przygotowane, gdzie ma pojsc, na jakim koncie, w jakim stanie i co zrobic, gdy platforma odmowi publikacji.

## Sekcja workflow

Eyebrow:

> Workflow

H2:

> Od jednego pliku do osobnego statusu kazdego targetu.

Kroki:

1. **Wgraj material**
   Jeden plik wideo trafia do biblioteki. System sprawdza metadane, czas trwania i gotowosc pliku do dalszej pracy.

2. **Zbuduj bazowy post**
   Tworzysz tytul, opis, hashtagi i intencje komunikatu bez mieszania tego z wymaganiami konkretnej platformy.

3. **Dopasuj targety**
   Kazda platforma dostaje osobny tytul, opis, ustawienia prywatnosci, konto i termin publikacji.

4. **Wyslij do kolejki**
   HTTP nie publikuje bezposrednio. Targety zamieniaja sie w zadania, a worker publikuje albo robi kontrolowany dry-run.

5. **Sprawdz status**
   Widzisz osobny stan kazdego targetu: queued, publishing, simulated, published, failed albo requires user action.

6. **Popraw i powtorz**
   Bledy, retry, anulowanie i duplikowanie targetow sa czescia procesu, nie ukrytym skutkiem ubocznym.

## Sekcja statusu produktu

Eyebrow:

> Product truth

H2:

> Budujemy produkt, ale nie przeskakujemy dowodu.

Body:

> Postmerce jest juz dzialajacym prywatnym systemem. Publiczny SaaS przyjdzie dopiero wtedy, gdy core publikowania bedzie sprawdzony na realnym, powtarzalnym loopie.

Karty:

### Gotowe dzis

> Media, posty, targety per platforma, kolejka PostgreSQL, worker, dry-run, kalendarz, control center i konta.

### Pierwszy live adapter

> YouTube ma przygotowany OAuth i publisher do kontrolowanego testu po konfiguracji produkcyjnych danych.

### Nastepne kroki

> LinkedIn, Meta, Instagram i TikTok beda dochodzic po review API i prywatnym potwierdzeniu loopa.

## Sekcja dla kogo

Eyebrow:

> Dla kogo

H2:

> Dla ludzi, ktorzy traktuja dystrybucje jak system.

### Dla operatorow contentu

> Dla ludzi, ktorzy publikuja duzo i musza pilnowac wersji, platform, kont, terminow oraz bledow.

### Dla founderow i malych zespolow

> Dla osob, ktore nie potrzebuja jeszcze wielkiego social suite, ale potrzebuja porzadku w dystrybucji.

### Dla agencji

> Dla zespolow, ktore chca zamienic reczne publikowanie w czytelny proces z targetami, statusami i historia.

## CTA final

Eyebrow:

> Early access

H2:

> Chcesz zobaczyc Postmerce, gdy prywatny loop bedzie gotowy do pokazania?

Body:

> Napisz, jezeli publikujesz duzo video, masz kilka platform do obsluzenia i chcesz rozmawiac o narzedziu, ktore zaczyna od kontroli procesu, a nie od obietnicy automatyzacji wszystkiego.

CTA:

> support@postmerce.pl

Secondary:

> Zobacz zasady prywatnosci

## FAQ na landing albo osobna sekcje

### Czy Postmerce jest juz publicznym SaaS-em?

Nie. Obecnie to private-first system Triple Muffin w aktywnym rozwoju. Publiczny SaaS ma sens dopiero po potwierdzeniu core loopa publikacji.

### Czy Postmerce publikuje na wszystkich platformach?

System obsluguje targety per platforma, kolejke, worker i statusy. YouTube jest pierwszym adapterem do kontrolowanego live testu. Pozostale platformy sa na roadmapie i wymagaja review oraz implementacji adapterow.

### Czym Postmerce rozni sie od kalendarza social media?

Kalendarz pokazuje, kiedy cos ma wyjsc. Postmerce trzyma caly proces: media, bazowy post, platformowe targety, konta, statusy, retry i bledy. Kalendarz jest jednym widokiem, nie sednem produktu.

### Czy Postmerce tworzy copy?

Postmerce jest systemem publikacji. Copy moze przychodzic z Content OS, gdzie osobno trzymamy metody, glos, zrodla i rekomendacje. To rozdzielenie jest celowe: generator ma poprawiac jakosc contentu, a Postmerce ma pilnowac publikacji.

### Dla kogo bedzie early access?

Dla osob i zespolow, ktore realnie publikuja duzo video na kilku platformach i potrafia opisac obecny workflow, bledy, reczne kroki oraz koszt chaosu.

## Mikrocopy produktu / panelu

### Upload

- "Wgraj material do biblioteki"
- "System sprawdzi metadane przed publikacja"
- "Ten plik jest zrodlem, nie gotowym postem"

### Post bazowy

- "Ustaw intencje i bazowe copy"
- "To nie musi byc finalny opis dla kazdej platformy"
- "Platformowe warianty dodasz w targetach"

### Targety

- "Target to konkretna publikacja na konkretnej platformie"
- "Dopasuj konto, opis, prywatnosc i termin"
- "Kazdy target ma osobny status"

### Kolejka

- "Dodaj do kolejki"
- "Worker przejmie publikacje poza requestem HTTP"
- "Dry-run symuluje publikacje bez wysylania do platformy"

### Statusy

- "Queued - target czeka w kolejce"
- "Publishing - worker wykonuje zadanie"
- "Simulated - dry-run zakonczony"
- "Published - platforma przyjela publikacje"
- "Failed - publikacja wymaga diagnozy"
- "Requires user action - platforma wymaga decyzji albo autoryzacji"

## Copy pod platform review

### Product description EN

> Postmerce is a private-first social publishing tool built by Triple Muffin. It lets authorized users upload a video, prepare platform-specific captions and settings, queue publication jobs, and review target-level publishing status. Users explicitly connect their own social accounts through OAuth and control every publication.

### Internal/private status EN

> Postmerce is currently used privately by Triple Muffin while the publishing workflow is being validated. Public self-service onboarding is not available yet.

### Data handling EN

> Postmerce stores media metadata, user-provided captions, publishing targets, job status, and encrypted OAuth tokens where required for connected accounts. Platform responses are redacted before storage when possible.

### OAuth explanation EN

> Users connect only accounts they own or are authorized to manage. Postmerce uses OAuth scopes required for account identification and publishing, and does not publish without an explicit user-created publishing target.

## Claim checklist przed wdrozeniem strony

- Czy nie obiecujemy publicznego self-service?
- Czy nie mowimy, ze wszystkie platformy sa live?
- Czy YouTube jest opisany jako pierwszy kontrolowany adapter, a nie gotowa masowa integracja?
- Czy TikTok/Meta/LinkedIn sa opisane jako roadmapa lub future adapters?
- Czy legal pages sa latwo dostepne?
- Czy CTA prowadzi do kontaktu/early access, a nie do zakupu?
- Czy copy tlumaczy mechanizm, a nie tylko efekt?

## Wersja bardzo krotka na header albo social bio

> Postmerce is a private-first publishing control center for platform-specific video posts.

PL:

> Postmerce to private-first control center do publikacji video na wielu platformach.
