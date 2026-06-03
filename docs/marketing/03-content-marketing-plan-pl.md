# Postmerce - plan contentu i marketingu

## Cel planu

Zbudowac wiarygodnosc Postmerce jako produktu, zanim zaczniemy sprzedawac go jak publiczny SaaS.

Plan ma trzy poziomy:

- **teraz:** publicznie nazwac problem i pokazac, ze powstaje realny system,
- **po pierwszym live loopie:** pokazac dowody z dzialania, statusy i decyzje produktowe,
- **przed beta:** zebrac rozmowy z ludzmi, ktorzy maja podobny problem publikacyjny.

Nie sprzedajemy jeszcze "narzedzia do wszystkiego". Sprzedajemy sposob myslenia: publikacja video na wielu platformach to system operacyjny, nie przypadkowa lista recznych krokow.

## Strategia bazowa

### Primary idea

> Publikacja to proces, nie przycisk.

### Mechanizm

Postmerce rozdziela:

- media,
- post bazowy,
- target platformowy,
- konto,
- schedule,
- kolejke,
- worker,
- status,
- retry,
- historie.

To jest glowny mechanizm, ktory ma wracac w contentach. Jezeli asset nie pokazuje mechanizmu, prawdopodobnie bedzie brzmial jak ogolna reklama SaaS.

### Obietnica

> Postmerce pomaga kontrolowac dystrybucje video, zanim skala publikacji zamieni sie w chaos.

### Dowody teraz

- dzialajacy panel prywatny,
- publiczna strona i legal pages,
- media upload,
- FFprobe i thumbnails,
- posty i targety,
- kolejka PostgreSQL,
- worker i dry-run,
- control center,
- kalendarz,
- konta,
- YouTube OAuth/publisher scaffold.

### Dowody po pierwszym live tescie

- screenshot albo opis przeplywu YouTube targetu,
- status przed/podczas/po publikacji,
- realny blad albo retry, jezeli wystapi,
- czas od uploadu do targetu,
- decyzja, ktora poprawila workflow.

## Odbiorcy

### Odbiorca A: content operator

Wie, ze regularna publikacja jest chaotyczna. Ma bol w recznym pilnowaniu targetow i statusow. Potrzebuje uporzadkowania, nie kolejnej inspiracji.

Postawa startowa:

> "Mam to w glowie, spreadsheetach i DM-ach. Dziala, ale trudno to powtorzyc."

Postawa docelowa:

> "Potrzebuje systemu, ktory trzyma targety i statusy, nie tylko daty."

### Odbiorca B: founder / solopreneur

Produkuje video, chce byc na kilku platformach, ale nie chce zycia w panelach platform. Rozumie wartosc repurposingu, ale nie ma operacyjnej warstwy.

Postawa startowa:

> "Mam materialy, ale dystrybucja mnie zjada."

Postawa docelowa:

> "Jeden material powinien miec kontrolowany workflow do kilku publikacji."

### Odbiorca C: agencja / maly zespol

Publikuje dla siebie lub klientow. Potrzebuje historii, statusow, przypisywania kont i mniej manualnych checkpointow.

Postawa startowa:

> "Najwiekszy problem to nie wymyslenie posta, tylko dowiezienie publikacji bez zgubienia szczegolow."

Postawa docelowa:

> "Target-level status i retry to realna wartosc operacyjna."

## Kanaly

### Wojtek LinkedIn

Najlepszy kanal na founder voice, operacyjna szczrosc i budowanie zaufania. Tu publikujemy dluzsze posty, manifesty, analizy i product notes.

### Triple Muffin LinkedIn

Kanal bardziej agencyjny. Uzywamy go do laczenia Postmerce z Content OS, procesem reklamowym i dystrybucja contentu dla klientow.

### X / krotkie watki

Krotkie mechanizmy, checklisty, statusy build-in-public. Dobre do szybkich iteracji hookow.

### YouTube Shorts / Reels / TikTok

Docelowo do pokazywania mini mechanizmow: "jeden plik to nie jeden post", "czym jest target", "dlaczego worker, a nie request handler".

### Website / blog

Po pierwszym live loopie. Blog ma byc dokumentacja myslenia, nie SEO filler.

## Filary contentu

### 1. Publikacja to proces

Cel:

Przekonac odbiorce, ze problem nie jest "brak narzedzia do wrzucania", tylko brak widocznego workflow.

Formaty:

- manifesty,
- karuzele,
- krotkie wideo,
- checklisty,
- porownania "kalendarz vs control center".

Przykladowe tezy:

- jeden plik to nie jeden post,
- platforma to target, nie checkbox,
- status publikacji jest funkcja produktu,
- bez retry nie masz automatyzacji, masz nadzieje.

### 2. Kontrola przed skala

Cel:

Pokazac, ze private-first nie jest slaboscia. To wybor produktowy, ktory chroni core przed SaaS overhead.

Formaty:

- founder notes,
- product decisions,
- release notes,
- "dlaczego jeszcze nie public beta".

Przykladowe tezy:

- najpierw loop, potem landing z pricingiem,
- prawdziwy produkt zaczyna sie od tarcia operatora,
- SaaS zbyt wczesnie przykrywa problem warstwami.

### 3. Platform-specific content

Cel:

Polaczyc Postmerce z Content OS i pokazac, ze copy oraz publikacja powinny byc rozdzielone, ale kompatybilne.

Formaty:

- porownania opisow per platforma,
- mini case studies,
- "ten sam material, trzy warianty caption",
- content templates.

Przykladowe tezy:

- LinkedIn potrzebuje kontekstu, Shorts potrzebuje napiecia,
- target platformowy to decyzja komunikacyjna i techniczna,
- Content OS daje lepsze warianty, Postmerce pilnuje wykonania.

### 4. Operator-grade reliability

Cel:

Zbudowac zaufanie techniczne u ludzi, ktorzy wiedza, ze integracje social API sa kruche.

Formaty:

- tech/product explainers,
- diagramy,
- changelog,
- status notes.

Przykladowe tezy:

- request HTTP nie powinien publikowac bezposrednio,
- API review jest czescia produktu,
- redacted logs i encrypted tokens to podstawy, nie dodatki,
- dry-run pozwala testowac workflow bez palenia kont.

### 5. API reality

Cel:

Odroznic Postmerce od narzedzi, ktore obiecuja "publish everywhere" bez mowienia o review, scope'ach i ograniczeniach platform.

Formaty:

- posty edukacyjne,
- krotkie notatki o review,
- transparent roadmap,
- "co jest gotowe, co nie".

Przykladowe tezy:

- YouTube first, bo review i test da sie przeprowadzic kontrolowanie,
- TikTok wymaga szczegolnej ostroznosci przy private tools,
- platform API nie sa detalem technicznym, tylko czescia strategii produktu.

### 6. Early access learning

Cel:

Zbierac rozmowy z osobami, ktore maja prawdziwy workflow publikacyjny.

Formaty:

- pytania do operatorow,
- ankiety,
- DM scripts,
- "pokaz mi swoj proces publikacji",
- beta invitation.

Przykladowe tezy:

- nie szukamy ludzi, ktorzy chca nowego narzedzia; szukamy ludzi, ktorzy maja powtarzalny problem,
- early access ma byc rozmowa o workflow, nie masowym signupem.

## 90-dniowy horyzont

| Tydzien | Temat | Cel | Assety |
| --- | --- | --- | --- |
| 1 | Manifest Postmerce | Nazwac problem | LinkedIn manifesto, short video, strona |
| 2 | Jeden plik to nie jeden post | Zmienic frame | Karuzela 6 krokow, thread, micro post |
| 3 | Target platformowy | Wytlumaczyc mechanizm | Explainer, diagram, product screenshot po akceptacji |
| 4 | Kolejka i worker | Zbudowac zaufanie techniczne | Product note, short "dlaczego nie request handler" |
| 5 | Dry-run | Pokazac bezpieczne testowanie | Demo note, checklist |
| 6 | YouTube adapter | Przygotowac grunt pod dowod | Status post, review-safe update |
| 7 | Pierwszy live loop | Pokazac fakt, nie hype | Founder note, case note, release note |
| 8 | Kalendarz vs control center | Odroznic produkt | Porownanie, karuzela, FAQ |
| 9 | Content OS + Postmerce | Polaczyc copy i publikacje | Post "generator nie zastapi statusu", workflow |
| 10 | API reality | Budowac wiarygodnosc | Post o review, transparent roadmap |
| 11 | Early access criteria | Wybrac dobrych rozmowcow | Landing CTA, DM, email |
| 12 | Beta narrative | Zamknac pierwszy cykl | Summary, waitlist note, roadmap update |

## Cadence

Minimalny rytm:

- 2 dluzsze posty LinkedIn tygodniowo,
- 2 krotkie posty / watki tygodniowo,
- 1 short video tygodniowo,
- 1 produktowa notatka po kazdej istotnej zmianie,
- 1 pytanie do operatorow co 2 tygodnie.

Nie publikowac tylko po to, zeby wypelnic kalendarz. Jezeli nie ma nowego dowodu albo nowego rozroznienia, lepiej przerobic asset niz rozmywac pozycje.

## Lejek komunikacji

### Awareness

Cel:

Nazwac chaos dystrybucji video.

Assety:

- manifest,
- "jeden plik to nie jeden post",
- "publikacja to proces".

Metryka:

- komentarze od ludzi, ktorzy opisuja wlasny workflow,
- zapisane posty,
- DM-y z opisem problemu.

### Consideration

Cel:

Pokazac, ze Postmerce ma realny mechanizm, nie tylko haslo.

Assety:

- workflow 6 krokow,
- queue/worker explainer,
- target-level status explainer,
- product truth updates.

Metryka:

- pytania o early access,
- rozmowy z operatorami,
- konkretne pytania o integracje.

### Action

Cel:

Zebrac ludzi do rozmow i pozniejszej bety.

Assety:

- early access note,
- email,
- DM script,
- landing CTA.

Metryka:

- liczba sensownych rozmow,
- profil odbiorcy,
- liczba realnych workflowow do analizy,
- gotowosc do testu po funkcjach, nie po hype.

## Metryki produktu i marketingu

### Metryki contentu

- ile osob opisuje konkretny problem publikacyjny,
- ile osob prosi o pokazanie produktu,
- ile osob odroznia Postmerce od schedulera,
- ile assetow prowadzi do rozmowy, nie tylko do reakcji.

### Metryki produktu

- liczba udanych dry-run targetow,
- liczba kontrolowanych live publikacji,
- czas od uploadu do queued targetow,
- liczba bledow retryable/non-retryable,
- liczba przypadkow requires user action,
- liczba decyzji UX wynikajacych z realnego loopa.

### Metryki early access

- ile osob ma przynajmniej 3 platformy w workflow,
- ile publikuje video co tydzien,
- ile ma bol statusow/retry/kont,
- ile ma gotowosc do testu bez publicznego SaaS UX.

## Playbook wyboru metody Content OS

### Gdy odbiorca mysli: "To zwykly scheduler"

- strategic method: conflict-contrast,
- research/substantiation: product truth map,
- expression: comparison table,
- editing: one-mississippi.

Kierunek:

Pokazac roznice: scheduler pokazuje date, Postmerce pokazuje target i status.

### Gdy odbiorca mysli: "Po co private-first?"

- strategic method: attitude-bridge,
- research/substantiation: proof-before-scale,
- expression: founder note,
- editing: cub-edit.

Kierunek:

Nie przepraszac za private-first. Wyjasnic, ze to metoda dowodu.

### Gdy odbiorca mysli: "Czy to publikuje wszedzie?"

- strategic method: truth-evidence-gate,
- research/substantiation: API feasibility,
- expression: current/future split,
- editing: claim audit.

Kierunek:

Mowic precyzyjnie, co jest gotowe, co jest w tescie, co jest na roadmapie.

### Gdy odbiorca ma bol operacyjny

- strategic method: OCPB,
- research/substantiation: workflow evidence,
- expression: before/after,
- editing: three-sentence-tests.

Kierunek:

Opisac koszt chaosu, pokazac mechanizm, dac nastepny krok.

## Launch sequence V1

### Dzien 1

- Wdrozyc nowy landing.
- Opublikowac founder note: "Publikacja to proces, nie przycisk."
- CTA: "Jezeli masz podobny workflow, napisz."

### Dzien 2

- Karuzela: "Jeden film to 6 decyzji publikacyjnych."
- Krotki thread z definicja targetu.

### Dzien 3

- Product note: "Dlaczego Postmerce zaczyna private-first."
- CTA do rozmow z operatorami.

### Dzien 4

- Short video: "Scheduler vs publishing control center."
- Pytanie do odbiorcow: "Gdzie dzis trzymasz status publikacji?"

### Dzien 5

- Post techniczny: "Dlaczego worker, a nie publikacja w request handlerze."
- Pokazac prosty workflow bez zdradzania prywatnych danych.

### Dzien 6

- FAQ / objection post: "Czy to publikuje wszedzie?"
- Jawnie opisac YouTube first i roadmap.

### Dzien 7

- Summary tygodnia i zaproszenie do 5 rozmow early access.

## Early access criteria

Dobra osoba do rozmowy:

- publikuje video minimum raz w tygodniu,
- ma minimum 2-3 platformy,
- ma problem z wariantami opisow albo statusami,
- rozumie, ze platform API moga byc ograniczeniem,
- chce pokazac obecny proces.

Slaba osoba do rozmowy:

- chce tylko "AI wrzuci mi wszystko wszedzie",
- nie publikuje regularnie,
- nie ma konkretnego problemu,
- wymaga publicznego SaaS i integracji wszystkich platform dzisiaj.

## Oferta rozmowy

Tekst:

> Budujemy Postmerce jako private-first system kontroli publikacji video. Nie szukamy jeszcze masowego signupu. Szukamy kilku osob, ktore publikuja regularnie na wielu platformach i chca pokazac, gdzie dzis gubi sie proces. W zamian pokazemy, jak myslimy o targetach, kolejce, statusach i early access.

## Paid marketing

Nie uruchamiac platnych kampanii przed:

- pierwszym live YouTube loopiem,
- spisana beta oferta,
- jasnym profilem early access,
- minimum jednym assetem z realnym dowodem produktu.

Po tym testowac male kampanie tylko na rozmowy, nie na zakup:

- audience: creator operators, small agencies, social media operators,
- claim: "Stop treating video publishing as one upload",
- CTA: "Show us your publishing workflow",
- success: quality conversations, not CPL alone.

## Co laczyc z Triple Muffin

Postmerce moze byc pokazywany jako czesc szerszego systemu:

- Content OS daje lepsze copy i warianty,
- Growth systems mowia, co ma byc komunikowane,
- Postmerce pilnuje wykonania publikacji.

Nie mieszac claimow:

- Triple Muffin moze mowic o systemie contentu i reklam,
- Postmerce ma mowic o publikacji i statusie,
- Content OS ma mowic o metodach, glosie i jakosci copy.

## Najblizsze konkretne kroki

1. Wdrozyc landing z nowym copy.
2. Uruchomic pierwszy tydzien launch sequence.
3. Zrobic kontrolowany YouTube test po konfiguracji OAuth.
4. Po tescie dopisac case note: co dzialalo, co sie zepsulo, co zmieniamy.
5. Zebrac 5 rozmow early access z ludzmi, ktorzy publikuja video na kilku platformach.
6. Dopiero potem wybrac nastepny adapter wedlug realnego bolu, nie wedlug atrakcyjnosci logo.
