# Postmerce - pozycjonowanie i mapa claimów

## Definicja produktu

Postmerce to publishing control center do video: od jednego pliku, przez bazowy
post i targety per platforma, po kolejkę, kalendarz, statusy, retry i historię
publikacji.

Produkt jest dla osób i zespołów, które nie chcą traktować dystrybucji video jak
jednego przycisku. Każda platforma ma własny kontekst, konto, termin, format i
ryzyko błędu. Postmerce robi z tego widoczny workflow.

## One-linery

Najmocniejszy:

> Jeden film. Osobna publikacja dla każdej platformy.

Mechanizm:

> Postmerce zamienia materiał video w platformowe targety, kolejkuje publikacje
> i pokazuje status każdego wyjścia.

Krótki:

> Publikuj video z kontrolą targetów, kont i statusów.

English:

> Postmerce is a multi-platform video publishing control center with
> platform-specific targets, queues, calendars and target-level status.

## Najważniejsza teza

Problem dystrybucji video nie polega tylko na tym, że trzeba kliknąć “opublikuj”
w kilku miejscach.

Problem polega na tym, że jeden materiał zamienia się w zestaw decyzji:

- jaki tytuł i opis pasuje do platformy,
- które konto publikuje,
- kiedy target ma wyjść,
- jaki jest status widoczności,
- czy publikacja czeka w kolejce,
- czy platforma przyjęła request,
- czy błąd wymaga retry albo decyzji operatora.

Postmerce jest budowane wokół tych decyzji.

## Dla kogo

### Twórcy i founderzy

Publikują video na kilku kanałach i chcą mniej ręcznego pilnowania, a więcej
jednego systemu kontroli.

### Małe zespoły marketingowe

Potrzebują planu publikacji, platformowych wariantów i widocznych statusów bez
ciężkiego enterprise social suite.

### Agencje

Obsługują powtarzalną dystrybucję i chcą wiedzieć, co jest gotowe, co czeka, co
poszło i gdzie potrzebna jest reakcja.

## Claim map

| Obszar | Bezpieczna formulacja | Unikać | Powód |
| --- | --- | --- | --- |
| Core | `Postmerce kontroluje workflow publikacji video.` | `Postmerce sam rozwiązuje cały marketing.` | Produkt dotyczy publikacji i statusów, nie całej strategii contentu. |
| Platformy | `Platformowe targety mogą mieć osobne copy, konto, termin i status.` | `Każda platforma zawsze opublikuje wszystko automatycznie.` | Platformy mają własne API, limity i review. |
| Automatyzacja | `Kolejka i worker zdejmują publikację z requestu HTTP.` | `Zero pracy operatora.` | Konta, błędy i zgody nadal wymagają kontroli. |
| Kalendarz | `Kalendarz pokazuje targety i luki w planie.` | `To tylko kalendarz social media.` | Kalendarz jest widokiem na workflow, nie całym produktem. |
| Statusy | `Każdy target ma własny status i historię.` | `Status platformy zawsze jest natychmiast pewny.` | Część platform ma processing, opóźnienia i asynchroniczne błędy. |
| AI/copy | `Postmerce może przyjmować gotowe warianty copy z Content OS.` | `AI samo tworzy najlepszy content.` | Generator treści i publikator to osobne odpowiedzialności. |

## Filary komunikacji

### 1. Jeden materiał to wiele decyzji

Ten sam film może potrzebować innych opisów, kont, terminów i statusów na każdej
platformie.

### 2. Target jest jednostką pracy

Nie publikujemy “posta na wszystko”. Publikujemy konkretne targety: platforma,
konto, copy, termin, status.

### 3. Kalendarz nie wystarcza bez statusów

Plan mówi, co ma wyjść. Status mówi, co naprawdę dzieje się z publikacją.

### 4. Operator potrzebuje kontroli po kliknięciu

Błędy platform, retry, kolejka i wymagana reakcja muszą mieć swoje miejsce w
produkcie.

### 5. Produkt pokazuje mechanizm

Screeny i animacje powinny pokazywać: upload -> post -> targety -> kolejka ->
kalendarz -> status -> retry.

## Obiekcje

### “To brzmi jak scheduler.”

Scheduler zwykle zaczyna od kalendarza. Postmerce zaczyna od targetów i statusu:
co dokładnie ma wyjść, gdzie, z jakiego konta i w jakim stanie.

### “Czy to publikuje wszędzie?”

Postmerce organizuje publikację po platformach i pracuje na osobnych targetach.
Integracje zależą od połączonych kont, uprawnień i zasad API danej platformy.

### “Czy to robi copy?”

Postmerce pilnuje publikacji. Copy może pochodzić z Content OS albo od zespołu.
Rozdzielenie jest celowe: generator ma pomagać w treści, a Postmerce ma pilnować
workflow i statusów.

## Język

Używamy:

- `target`,
- `platforma`,
- `konto`,
- `kolejka`,
- `kalendarz`,
- `status`,
- `retry`,
- `control center`,
- `workflow publikacji`,
- `platform-specific`.

Nie używamy:

- `staging`,
- `internal tool`,
- `AI magic`,
- `publish everywhere instantly`,
- `zero manual work`,
- `social media chaos solved forever`.
