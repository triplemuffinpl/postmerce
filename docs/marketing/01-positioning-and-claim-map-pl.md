# Postmerce - pozycjonowanie i mapa claimow

## Definicja produktu

Postmerce to private-first system do kontroli dystrybucji video: od wgrania jednego materialu, przez bazowy post i targety per platforma, po kolejke, worker, statusy, retry i historie publikacji.

Nie jest jeszcze publicznym SaaS-em. Nie jest tez tylko landingiem ani prostym schedulerem. To operacyjny core publikowania, ktory najpierw ma udowodnic prywatny loop Triple Muffin, a dopiero potem urosnac w produkt.

## One-linery

Najmocniejszy:

> Jeden material. Osobne decyzje dla kazdej platformy. Pelna kontrola publikacji.

Krotszy:

> Publikacja to proces, nie przycisk.

Techniczny:

> Postmerce zamienia video w platformowe targety, kolejkuje publikacje i pokazuje status kazdego targetu.

English review-safe:

> Postmerce is a private-first social publishing tool built by Triple Muffin. It lets authorized users upload a video, prepare platform-specific captions and settings, queue publication jobs, and review target-level publishing status.

## Najwazniejsza teza

Wiekszosc narzedzi i procesow mowi o publikacji tak, jakby wystarczylo wrzucic plik. W realnym dzialaniu publikacja sklada sie z decyzji:

- jaki wariant komunikatu idzie na dana platforme,
- ktore konto jest uzyte,
- jaki jest status prywatnosci,
- kiedy target ma wyjsc,
- czy platforma przyjela request,
- czy trzeba czekac na processing,
- czy blad jest retryable,
- co ma zrobic operator, jezeli platforma wymaga akcji.

Postmerce jest budowane wlasnie wokol tych decyzji.

## Dla kogo

### Pierwszy odbiorca

Wojtek i Triple Muffin jako realny operator contentu. To daje prawdziwy workflow, prawdziwe tarcia i prawdziwe ograniczenia API przed budowaniem SaaS-owych warstw.

### Wczesny odbiorca zewnetrzny

- founderzy i tworzacy operatorzy, ktorzy publikuja video na kilku platformach,
- male zespoly marketingowe, ktore maja regularna dystrybucje,
- agencje, ktore chca kontrolowac statusy publikacji zamiast prosic ludzi o reczne wrzucanie,
- osoby, ktore potrzebuja systemu publikacji bardziej niz kolejnego kalendarza social media.

### Nie dla kogo dzis

- duze enterprise wymagajace SSO, audit logow, zaawansowanych uprawnien i SLA,
- firmy oczekujace publicznego self-service signup, billing i multi-workspace dzisiaj,
- zespoly, ktore chca automatyzacji wszystkich platform bez review API i bez weryfikacji kont,
- ktokolwiek, kto potrzebuje obietnicy "publish everywhere" juz teraz.

## Status produktu

### Potwierdzone

- Astro landing i publiczne legal pages.
- Fastify app jako prywatny panel.
- Upload media.
- FFprobe/metadane i thumbnails.
- Posty bazowe.
- Targety per platforma.
- Platform-specific captions, tytuly, hashtagi i ustawienia.
- Account-aware targety.
- PostgreSQL queue.
- Worker i dry-run.
- Statusy targetow, retry, cancel, duplicate.
- Kalendarz publikacji.
- Control center.
- Social accounts.
- YouTube OAuth scaffold i publisher do kontrolowanego testu po konfiguracji danych.

### W toku / do potwierdzenia

- pierwszy kontrolowany live test YouTube,
- stabilizacja YouTube po realnym processingu i bledach platformy,
- finalne decyzje UX wokol kont, targetow i retry,
- obserwacja prywatnego loopa Triple Muffin.

### Zaplanowane

- adaptery LinkedIn, Meta/Facebook, Instagram i TikTok po weryfikacji API,
- publiczny app host,
- auth, onboarding, billing i workspace dopiero po prywatnym dowodzie wartosci,
- blog / knowledge base / public beta po pierwszych realnych publikacjach.

## Claim map

| Obszar | Bezpieczna formulacja | Unikac | Powod |
| --- | --- | --- | --- |
| Status produktu | "Postmerce jest private-first systemem w aktywnym rozwoju." | "Postmerce to gotowy publiczny SaaS." | Publiczny onboarding i billing nie istnieja. |
| Platformy | "Przygotowujemy targety per platforma i rozwijamy adaptery publikacji." | "Publikujemy automatycznie na wszystkich platformach." | Nie wszystkie adaptery sa live i zaakceptowane przez review. |
| YouTube | "YouTube jest pierwszym adapterem do kontrolowanego testu." | "YouTube publishing dziala produkcyjnie dla kazdego." | Wymaga konfiguracji OAuth i realnego testu. |
| TikTok | "TikTok jest na roadmapie po review API." | "TikTok direct post jest gotowy." | TikTok Direct Post ma review i ograniczenia dla prywatnych narzedzi. |
| Automatyzacja | "System kolejkuje publikacje i izoluje prace workera od requestow HTTP." | "Zero recznej pracy." | OAuth, bledy platform i review nadal wymagaja decyzji operatora. |
| AI/copy | "Postmerce moze przyjmowac gotowy content z Content OS." | "AI automatycznie robi najlepsze copy." | Generator copy nie jest core funkcja Postmerce dzis. |
| Bezpieczenstwo | "Tokeny sa przechowywane zaszyfrowane, a logi sa redagowane." | "Platformy nigdy nie zawioda." | Platform API moga odrzucac requesty lub zmieniac zasady. |
| SaaS | "Core jest projektowany tak, by mogl urosnac do SaaS." | "Kup konto juz teraz." | Produkt nie ma jeszcze publicznego self-service. |

## Narracyjny kregoslup

1. **Sytuacja:** tworcy i zespoly produkuja coraz wiecej video, ale dystrybucja jest rozbita na platformy, konta i reczne decyzje.
2. **Napiece:** zwykly scheduler nie pokazuje pelnego procesu publikacji; kalendarz nie wystarcza, gdy trzeba pilnowac targetow, statusow i bledow.
3. **Mechanizm:** Postmerce rozdziela material, post bazowy, target platformowy, kolejke, worker i status.
4. **Dowod:** obecny core ma media, targety, queue, dry-run, control center i przygotowany YouTube adapter.
5. **Ograniczenie:** publiczny SaaS jeszcze nie jest otwarty, bo najpierw sprawdzamy prywatny loop.
6. **Wezwanie:** porozmawiajmy, jezeli Twoj problem to regularna dystrybucja video, nie "brak kolejnego kalendarza".

## Filary komunikacji

### 1. Publikacja to proces

Tematy:

- jeden plik nie znaczy jeden post,
- platforma to osobny target, nie tylko checkbox,
- status publikacji jest czescia produktu,
- blad platformy musi miec miejsce w workflow.

### 2. Kontrola przed skala

Tematy:

- dlaczego Postmerce zaczyna prywatnie,
- co musi byc prawdziwe, zanim produkt stanie sie SaaS-em,
- jak oddzielamy core od SaaS overhead,
- czemu dry-run jest wazniejszy niz ladny dashboard.

### 3. Platform-specific content

Tematy:

- opis na LinkedIn to nie opis na Shorts,
- prywatnosc, tytul i hashtagi sa decyzjami produktowymi,
- content generator moze podac intencje i warianty, ale publishing musi znac status.

### 4. Operator-grade reliability

Tematy:

- worker zamiast publikacji w request handlerze,
- PostgreSQL queue i retry,
- target-level status,
- redacted platform logs,
- OAuth i review jako realna czesc produktu.

### 5. SaaS later, useful system first

Tematy:

- produkt ma najpierw pracowac u nas,
- onboarding ma sens po dowodzie loopa,
- mniej warstw, wiecej dzialajacego core,
- publiczne obietnice dopiero po technicznym potwierdzeniu.

## Obiekcje i odpowiedzi

### "To brzmi jak social media scheduler."

Nie. Scheduler zwykle zaczyna od kalendarza. Postmerce zaczyna od workflow publikacji: media, post, target, konto, queue, worker, status, retry. Kalendarz jest widokiem, nie centrum produktu.

### "Czy to publikuje wszedzie automatycznie?"

Nie dzisiaj. System przygotowuje targety per platforma i ma kolejke/worker. YouTube jest pierwszym adapterem do kontrolowanego live testu. Pozostale adaptery beda dochodzic po weryfikacji API i review.

### "Dlaczego nie robicie od razu pelnego SaaS?"

Bo SaaS overhead moze przykryc najwazniejsze pytanie: czy publikowanie wielu platformowych targetow da sie obslugiwac w czystym, powtarzalnym loopie. Najpierw dowod core, potem auth, billing i workspace.

### "Czy to bedzie mialo AI copy?"

Postmerce ma byc publikacyjnym control center. Copy moze przychodzic z Content OS: zrodla, metody, glos, warianty i rekomendacje. Produkt nie powinien mieszac generatora copy z odpowiedzialnoscia za status publikacji, dopoki oba systemy nie sa stabilne.

### "Czy to jest dla agencji?"

Docelowo tak, jezeli agencja ma duzo powtarzalnej dystrybucji video i chce kontrolowac targety. Dzisiaj pierwszym etapem jest prywatny loop Triple Muffin i early access dla ludzi z podobnym problemem.

## Glos

Postmerce ma brzmiec jak produkt budowany przez operatora:

- konkretnie,
- spokojnie,
- bez pozy launchowej,
- z widocznym mechanizmem,
- z jawnym statusem,
- z jasnym nastepnym krokiem.

Nie uzywamy:

- "rewolucja",
- "game changer",
- "automatyzacja wszystkiego",
- "publish everywhere instantly",
- "AI magic",
- "platformy juz nie sa problemem".

Uzywamy:

- "target",
- "kolejka",
- "worker",
- "status",
- "retry",
- "control center",
- "private-first",
- "platform-specific",
- "potwierdzony loop",
- "early access".

## Content OS method map

| Sytuacja | Metoda glowna | Metoda dowodowa | Metoda ekspresji | Kontrola edycji |
| --- | --- | --- | --- | --- |
| Landing / pozycjonowanie | rule-of-one | truth-evidence-gate | conflict-contrast | one-mississippi |
| Post edukacyjny | attitude-bridge | facts-first | dimensionalization | cub-edit |
| Post produktowy | OCPB | mechanism-first | contrast table | three-sentence-tests |
| Launch note | problem-mechanism-proof | product truth map | direct founder voice | claim audit |
| Feature update | before-after-mechanism | changelog proof | operational example | no-hype pass |
| Obiekcja | objection inversion | current status proof | calm rebuttal | source check |

## Minimalny brief dla kazdego assetu

```text
objective:
audience:
awareness:
current_attitude:
desired_attitude:
evidence:
offer_or_next_step:
format:
voice_risk:
constraints:
```

## Decyzja strategiczna

Postmerce nie powinien jeszcze sprzedawac "wiekszej ilosci contentu". To za szerokie i latwo wpada w hype. Lepsza pozycja:

> Postmerce daje operatorom kontrolowany workflow dystrybucji video, zanim skala zamieni publikowanie w chaos.

Ta pozycja pozwala pozniej podlaczyc Content OS jako zrodlo lepszego copy, ale nie myli produktu publikacyjnego z generatorem tresci.
