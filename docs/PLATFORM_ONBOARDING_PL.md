# Postmerce - onboarding platform i kont Triple Muffin

Stan sprawdzony: 2026-06-03.

Ten dokument jest operacyjnym przewodnikiem do:

- zalozenia i uporzadkowania kont marki Triple Muffin,
- utworzenia aplikacji deweloperskich Postmerce,
- przygotowania OAuth, scope'ow i procesow review,
- podlaczenia kont do Postmerce, gdy odpowiedni adapter jest gotowy.

Interfejsy paneli dostawcow zmieniaja sie. Nazwy zakladek moga lekko roznic sie
od opisanych, ale wymagane zasoby, uprawnienia i ograniczenia sa wazniejsze niz
aktualny uklad ekranu.

Nie zapisuj w tym pliku ani w repo:

- hasel,
- Client Secret,
- tokenow OAuth,
- kodow 2FA,
- backup codes,
- prywatnych dokumentow weryfikacyjnych.

## 1. Aktualny stan Postmerce

| Platforma | Konto marki mozna zalozyc teraz | Aplikacje API mozna przygotowac teraz | OAuth w Postmerce | Live publisher w Postmerce |
| --- | --- | --- | --- | --- |
| YouTube | Tak | Tak | Gotowy | Gotowy do kontrolowanego testu |
| Facebook Page | Tak | Tak | Niezaimplementowany | Niezaimplementowany |
| Instagram Reels | Tak | Tak | Niezaimplementowany | Niezaimplementowany |
| TikTok | Tak | Tak | Niezaimplementowany | Niezaimplementowany |
| LinkedIn | Tak | Tak | Niezaimplementowany | Niezaimplementowany |

YouTube jest jedyna platforma, ktora mozna faktycznie podlaczyc od razu po
ustawieniu domeny, zmiennych srodowiskowych i Google Cloud OAuth.

## 2. Docelowe nazwy, domeny i adresy

### 2.1. Konta publikujace

Obecne konta social reprezentuja marke Triple Muffin:

```text
Nazwa publiczna: Triple Muffin
Preferowany handle: @triplemuffin
Handle zapasowy: @triplemuffinpl
Strona marki: https://triplemuffin.pl
Kontakt publiczny: socials@triplemuffin.pl
```

Postmerce dostanie pozniej osobne konta jako `Postmerce by Triple Muffin`.
Nie uzywaj adresow `@postmerce.pl` jako loginow do kont publikujacych Triple
Muffin.

### 2.2. Aplikacja deweloperska

Gotowe wartosci do formularzy aplikacji API:

```text
App name: Postmerce
Company / organization: Triple Muffin
Product name, gdy potrzebna dluzsza nazwa: Postmerce by Triple Muffin
Website: https://postmerce.pl
Support email: support@postmerce.pl
Developer contact: developer@postmerce.pl
Privacy Policy: https://postmerce.pl/privacy
Terms of Service: https://postmerce.pl/terms
Data deletion instructions: https://postmerce.pl/data-deletion
```

Uczciwy opis produktu po angielsku:

```text
Postmerce is a social publishing tool built by Triple Muffin. It lets
authorized users upload a video, prepare platform-specific captions, schedule
publication, and review target-level publishing status. Users explicitly
connect their own social accounts through OAuth and control every publication.
```

Nie skladaj formularza review jako publiczny SaaS, dopoki publiczny onboarding
i wymagany flow nie sa faktycznie dostepne.

### 2.3. Hosty i callbacki

Docelowe hosty:

```text
https://postmerce.pl          publiczna strona produktu i dokumenty prawne
https://staging.postmerce.pl  prywatny panel testowy
https://app.postmerce.pl      przyszla produkcja
```

Callbacki staging:

```text
https://staging.postmerce.pl/oauth/youtube/callback
https://staging.postmerce.pl/oauth/linkedin/callback
https://staging.postmerce.pl/oauth/meta/callback
https://staging.postmerce.pl/oauth/tiktok/callback
```

Callbacki produkcyjne:

```text
https://app.postmerce.pl/oauth/youtube/callback
https://app.postmerce.pl/oauth/linkedin/callback
https://app.postmerce.pl/oauth/meta/callback
https://app.postmerce.pl/oauth/tiktok/callback
```

Redirect URI musi zgadzac sie dokladnie z wartoscia wysylana przez aplikacje.
Nie dodawaj query string ani fragmentu `#`.

Panel staging moze byc chroniony przez Cloudflare Access lub proxy auth, ale
sciezki `/oauth/*` musza pozwalac przegladarce wrocic z platformy. Callbacki sa
dodatkowo chronione podpisanym, krotkotrwalym parametrem `state`.

## 3. Fundament przed platformami

### 3.1. Adresy email

Jedno konto Google Workspace jest wystarczajace na obecnym etapie. Uzywaj:

| Adres | Rola |
| --- | --- |
| `studio@triplemuffin.pl` | Prawdziwy wlasciciel Google, Cloudflare i aplikacji deweloperskich |
| `socials@triplemuffin.pl` | Publiczny kontakt social marki Triple Muffin |
| `ads@triplemuffin.pl` | Powiadomienia i billing reklamowy |
| `instagram@triplemuffin.pl` | Unikalny login i recovery dla Instagram Triple Muffin |
| `tiktok@triplemuffin.pl` | Unikalny login i recovery dla TikTok Triple Muffin |
| `support@postmerce.pl` | Kontakt uzytkownikow Postmerce |
| `developer@postmerce.pl` | Kontakt aplikacji API |
| `privacy@postmerce.pl` | Kontakt prywatnosci |
| `security@postmerce.pl` | Kontakt bezpieczenstwa |

Aliasy sa dobre jako adresy kontaktowe i loginy platform nie-Google. Alias nie
jest osobnym kontem Google i nie moze byc niezaleznym wlascicielem Google Cloud
lub kanalu YouTube.

### 3.2. Bezpieczenstwo

- Wlacz passkey albo 2FA na kazdym koncie.
- Dodaj druga metode odzyskiwania, jesli platforma na to pozwala.
- Uzywaj stalego numeru telefonu, nie tymczasowego numeru SMS.
- Przechowuj hasla i backup codes w managerze hasel.
- Nie udostepniaj hasel agentom ani wspolpracownikom.
- Dostep zespolu nadawaj przez role platform, Pages, Business Portfolio i
  Business Center.
- Nie zakladaj fikcyjnych profili osobowych `Triple Muffin`.
- Nie rejestruj kont z rotujacego VPN albo z niespojnym krajem.

### 3.3. Assety do przygotowania

Przygotuj jeden spojny pakiet:

- logo kwadratowe,
- grafike cover/banner,
- krotki opis marki,
- dluzszy opis marki,
- adres strony `https://triplemuffin.pl`,
- publiczny email `socials@triplemuffin.pl`,
- kategorie firmy,
- kraj i strefe czasowa `Europe/Warsaw`,
- nazwe prawna firmy zgodna z dokumentami,
- dokumenty firmy do ewentualnej weryfikacji.

### 3.4. Rejestr zasobow

Prowadz rejestr bez sekretow:

| Pole | Przyklad |
| --- | --- |
| Platforma | YouTube |
| Nazwa publiczna | Triple Muffin |
| Publiczny URL | `https://youtube.com/@triplemuffin` |
| Login wlasciciela | `studio@triplemuffin.pl` |
| Kontakt | `socials@triplemuffin.pl` |
| Channel / Page / Account ID | ID bez tokena |
| Developer App ID | ID bez secretu |
| 2FA | Wlaczone / niewlaczone |
| Status API | Brak / review / gotowe |
| Status Postmerce | Brak / OAuth / test / live |

### 3.5. Wspolny review pack aplikacji

Przygotuj te materialy raz, zanim zaczniemy skladac wnioski o szerszy dostep:

- publiczna strona `https://postmerce.pl`,
- dzialajace strony Privacy Policy, Terms of Service i Data Deletion,
- publiczny email support oraz developer contact,
- logo aplikacji w wymaganych rozmiarach,
- krotki i dlugi opis produktu po angielsku,
- lista wymaganych scope'ow z uzasadnieniem kazdego z nich,
- instrukcja krok po kroku dla reviewera,
- nagranie ekranu od logowania OAuth do publikacji i statusu wyniku,
- konto testowe albo jasna instrukcja, jak reviewer ma przejsc flow,
- opis przechowywania, szyfrowania, odswiezania i usuwania tokenow,
- opis usuwania danych uzytkownika,
- zrzuty ekranu ekranow zgody, wyboru konta i potwierdzenia publikacji.

Uzasadnienie scope'u powinno opisywac konkretna funkcje widoczna w produkcie.
Nie pros o uprawnienia "na przyszlosc".

## 4. YouTube

### 4.1. Cel

Utworzyc kanal marki Triple Muffin, skonfigurowac Google Cloud OAuth i wykonac
pierwszy upload `private` albo `unlisted` przez Postmerce.

### 4.2. Konto i kanal Triple Muffin

1. Zaloguj sie na `https://youtube.com` kontem
   `studio@triplemuffin.pl`.
2. Kliknij zdjecie profilu.
3. Wejdz w `Settings`.
4. W sekcji konta wybierz `Add or manage channel(s)`.
5. Kliknij `Create a channel` albo przejdz do listy kanalow i wybierz
   `Create a new channel`.
6. Ustaw:

```text
Name: Triple Muffin
Handle: @triplemuffin
```

7. Dodaj logo, banner, opis i link `https://triplemuffin.pl`.
8. Ustaw publiczny kontakt na `socials@triplemuffin.pl`.

Kanal z nazwa biznesowa tworzy Brand Account i moze miec wielu wlascicieli.
Postmerce musi byc autoryzowane przez prawdziwego wlasciciela kanalu, najlepiej
`studio@triplemuffin.pl`. Uzytkownicy zaproszeni tylko przez YouTube Studio
channel permissions nie moga zarzadzac kanalem przez YouTube APIs.

### 4.3. Weryfikacja kanalu

1. Wejdz na `https://studio.youtube.com`.
2. Przejdz do `Settings > Channel > Feature eligibility`.
3. W `Intermediate features` kliknij `Verify phone number`.
4. Zweryfikuj staly numer telefonu.
5. Sprawdz `Advanced features` i uzyskaj dostep przez historie kanalu albo
   weryfikacje ID/video, jesli jest potrzebna.

### 4.4. Google Cloud Project

1. Wejdz na `https://console.cloud.google.com`.
2. Zaloguj sie jako `studio@triplemuffin.pl`.
3. Utworz projekt:

```text
Project name: Postmerce Staging
```

4. Przejdz do `APIs & Services > Library`.
5. Wyszukaj `YouTube Data API v3`.
6. Kliknij `Enable`.

Na przyszlosc utworz osobny projekt `Postmerce Production`. Nie mieszaj
credentiali staging i produkcji.

### 4.5. OAuth consent screen

1. Przejdz do `Google Auth Platform` albo `APIs & Services > OAuth consent
   screen`.
2. W `Branding` ustaw:

```text
App name: Postmerce
User support email: support@postmerce.pl
App home page: https://postmerce.pl
Privacy policy: https://postmerce.pl/privacy
Terms of service: https://postmerce.pl/terms
Authorized domain: postmerce.pl
Developer contact: developer@postmerce.pl
```

3. W `Audience` wybierz:
   - `Internal`, jesli aplikacja ma dzialac tylko dla kont z obecnego Google
     Workspace,
   - `External`, gdy przygotujemy realny publiczny SaaS.
4. Przy `External` i trybie testowym dodaj `studio@triplemuffin.pl` jako test
   user.
5. W `Data Access` dodaj minimalne scope'y:

```text
https://www.googleapis.com/auth/youtube.upload
https://www.googleapis.com/auth/youtube.readonly
```

Tryb `Testing` aplikacji External moze powodowac wygasanie refresh tokenow po
7 dniach. Do stabilnego uzywania wlasnego kanalu najprostszy jest projekt
`Internal`, o ile kanal jest zarzadzany przez konto z Workspace.

### 4.6. OAuth Client

1. Przejdz do `Google Auth Platform > Clients` albo
   `APIs & Services > Credentials`.
2. Kliknij `Create credentials > OAuth client ID`.
3. Wybierz `Web application`.
4. Ustaw:

```text
Name: Postmerce Staging Web
Authorized redirect URI:
https://staging.postmerce.pl/oauth/youtube/callback
```

5. Zapisz `Client ID` i `Client Secret` w bezpiecznym miejscu.
6. Nie wklejaj ich do repo ani dokumentacji.

### 4.7. Konfiguracja Postmerce

Na serwerze ustaw:

```text
YOUTUBE_CLIENT_ID=<client id>
YOUTUBE_CLIENT_SECRET=<client secret>
YOUTUBE_REDIRECT_URI=https://staging.postmerce.pl/oauth/youtube/callback
YOUTUBE_UPLOAD_CATEGORY_ID=22
DRY_RUN=true
```

Po restarcie:

1. Wejdz do `https://staging.postmerce.pl/accounts`.
2. Kliknij `Polacz YouTube`.
3. Zaloguj sie jako wlasciciel kanalu Triple Muffin.
4. Wybierz wlasciwy kanal, jesli Google pokaze wybor konta/kanalu.
5. Zaakceptuj uprawnienia.
6. Sprawdz, czy konto pojawilo sie na stronie Accounts.

### 4.8. Pierwszy test

1. Zostaw `DRY_RUN=true` i sprawdz zwykly flow Postmerce.
2. Ustaw `DRY_RUN=false` dopiero na kontrolowany test.
3. Wgraj krotkie, nieszkodliwe wideo.
4. Ustaw target YouTube jako `private` albo `unlisted`.
5. Opublikuj.
6. Sprawdz:
   - status targetu,
   - wynik joba,
   - link zewnetrzny,
   - widocznosc filmu w YouTube Studio,
   - zachowanie token refresh,
   - retry po kontrolowanym bledzie.
7. Po tescie przywroc `DRY_RUN=true`, dopoki nie uznamy adaptera za stabilny.

### 4.9. Ograniczenia i review

- `videos.insert` wymaga OAuth uzytkownika. Service account nie zastapi
  wlasciciela kanalu.
- Projekty API, ktore nie przeszly audytu YouTube, moga miec uploady
  ograniczone do widocznosci prywatnej.
- Publiczny SaaS lub potrzeba wiekszej kwoty moze wymagac YouTube API audit.
- Domyslna kwota projektu jest ograniczona, wiec monitoruj usage w Google
  Cloud.

## 5. Facebook Page i Instagram Reels

### 5.1. Decyzja architektoniczna

Dla Postmerce uzywamy wspolnego flow Meta opartego o Facebook Page:

- Facebook Page `Triple Muffin`,
- Instagram Professional Business `Triple Muffin`,
- Instagram polaczony z Facebook Page,
- jedna aplikacja Meta `Postmerce`,
- User Access Token, z ktorego pobieramy Page Access Token i Instagram User ID.

Meta ma rowniez Instagram API with Instagram Login, ale osobny flow nie daje
nam korzysci, gdy chcemy publikowac jednoczesnie na Facebook Page i Instagram.

### 5.2. Prawdziwy profil administratora

1. Uzyj swojego prawdziwego profilu Facebook.
2. Wlacz 2FA.
3. Nie tworz profilu osobowego o nazwie `Triple Muffin`.
4. Nie udostepniaj hasla do profilu.

### 5.3. Utworzenie Facebook Page

1. Zaloguj sie na Facebook.
2. Wejdz na `https://facebook.com/pages/create`.
3. Ustaw:

```text
Page name: Triple Muffin
Category: kategoria najlepiej odpowiadajaca firmie
Bio: krotki opis Triple Muffin
```

4. Kliknij `Create Page`.
5. Dodaj logo, cover, opis, strone `https://triplemuffin.pl` i kontakt
   `socials@triplemuffin.pl`.
6. Ustaw username `@triplemuffin` albo `@triplemuffinpl`.
7. Sprawdz, czy Twoj profil ma Facebook access z full control.

### 5.4. Utworzenie Instagram Triple Muffin

1. Utworz konto Instagram z unikalnym aliasem
   `instagram@triplemuffin.pl`.
2. Ustaw:

```text
Name: Triple Muffin
Username: @triplemuffin albo @triplemuffinpl
Website: https://triplemuffin.pl
Contact email: socials@triplemuffin.pl
```

3. Wlacz 2FA i zapisz backup codes.
4. W aplikacji Instagram przejdz do profilu.
5. Wejdz w `Menu > Settings and privacy > Account type and tools`.
6. Wybierz `Switch to professional account`.
7. Wybierz `Business`, nie `Creator`.

Konto Professional jest publiczne. Oficjalne API nie publikuje na zwykle konta
consumer.

### 5.5. Polaczenie Instagram z Facebook Page

Najprostsza sciezka z aplikacji Instagram:

1. Wejdz w profil Instagram.
2. Kliknij `Edit profile`.
3. W `Public business information` wybierz `Page`.
4. Kliknij `Continue`.
5. Zaloguj sie do Facebook.
6. Wybierz Page `Triple Muffin`.
7. Kliknij `Connect`.

Alternatywnie z Facebook Page:

1. Przelacz sie na Page `Triple Muffin`.
2. Wejdz w `Settings & privacy > Settings`.
3. W `Permissions` wybierz `Linked accounts`.
4. Obok Instagram kliknij `View > Connect account`.

### 5.6. Meta Business Portfolio

1. Wejdz do `https://business.facebook.com`.
2. Utworz Business Portfolio dla Triple Muffin, jesli jeszcze nie istnieje.
3. Uzyj nazwy prawnej firmy i poprawnego kraju.
4. Dodaj Page `Triple Muffin`.
5. Dodaj konto Instagram `Triple Muffin`.
6. Upewnij sie, ze Twoj prawdziwy profil ma pelny dostep do obu assetow.
7. Wlacz wymaganie 2FA dla osob z dostepem, jesli opcja jest dostepna.

### 5.7. Konto deweloperskie i aplikacja Meta

1. Wejdz na `https://developers.facebook.com`.
2. Zaloguj sie prawdziwym profilem Facebook.
3. Dokoncz rejestracje Meta for Developers.
4. Przejdz do `My Apps`.
5. Kliknij `Create App`.
6. Wybierz use case lub typ aplikacji pozwalajacy zarzadzac zasobami biznesowymi
   i Instagram. Gdy panel pyta o typ, wybierz `Business`.
7. Ustaw:

```text
App name: Postmerce
App contact email: developer@postmerce.pl
Business Portfolio: Triple Muffin
```

8. W `App settings > Basic` uzupelnij:

```text
App domains: postmerce.pl
Privacy Policy URL: https://postmerce.pl/privacy
Terms of Service URL: https://postmerce.pl/terms
User data deletion: https://postmerce.pl/data-deletion
Category: odpowiednia kategoria produktu
App icon: logo Postmerce
```

### 5.8. Produkty, OAuth i uprawnienia

W panelu aplikacji dodaj konfiguracje potrzebne dla:

- Facebook Login for Business albo aktualnego odpowiednika OAuth dla zasobow
  biznesowych,
- Instagram API with Facebook Login,
- Pages API.

Dodaj callback:

```text
https://staging.postmerce.pl/oauth/meta/callback
```

Minimalny plan uprawnien:

```text
pages_show_list
pages_read_engagement
pages_manage_posts
instagram_basic
instagram_content_publish
```

`instagram_manage_comments` dodamy dopiero, gdy Postmerce bedzie obslugiwac
komentarze.

Meta moze wymagac Advanced Access, App Review i Business Verification dla
uprawnien uzywanych przez konta spoza rol aplikacji.

### 5.9. Jak bedzie dzialac adapter Meta

Po OAuth Postmerce powinno:

1. Otrzymac User Access Token.
2. Pobrac zarzadzane strony przez `/me/accounts`.
3. Zapisac Page Access Token dla wybranej strony.
4. Pobrac `page_id` i `instagram_business_account.id`.
5. Utworzyc osobne wpisy kont:
   - Facebook Page `Triple Muffin`,
   - Instagram `Triple Muffin`.

Instagram Reels:

1. Udostepnic platformie publiczny, tymczasowy `video_url`.
2. Utworzyc kontener `/media` z `media_type=REELS`.
3. Polling statusu kontenera do `FINISHED`.
4. Wywolac `/media_publish`.

Facebook Reels:

1. Utworzyc sesje `/me/video_reels?upload_phase=start`.
2. Wyslac plik lub wskazac zrodlo wideo.
3. Sprawdzic status przetwarzania.
4. Opublikowac Reel.

### 5.10. Co mozesz zrobic dzis

Mozesz wykonac punkty 5.2-5.8 i przygotowac aplikacje. Nie podlaczysz jej do
Postmerce, dopoki nie powstanie `/oauth/meta/callback` oraz adaptery Facebook i
Instagram.

### 5.11. Pierwszy test po implementacji

- Najpierw testuj na osobnej testowej Page/Instagram Professional albo
  nieszkodliwym materiale, ktory mozna usunac.
- Zweryfikuj, czy Page i Instagram sa widoczne jako dwa osobne konta.
- Sprawdz polling przetwarzania wideo.
- Sprawdz wygasanie i odnawianie tokenow.
- Sprawdz, czy blad jednego targetu nie blokuje drugiego.

## 6. TikTok

### 6.1. Najwazniejsze ograniczenie

TikTok Direct Post API nie jest przeznaczone dla prywatnego narzedzia tylko dla
wlasciciela lub zespolu. Wniosek musi opisywac realny produkt dostepny dla
szerszej grupy uzytkownikow. Nie skladamy review, dopoki Postmerce nie ma
publicznej strony, dokumentow prawnych, dzialajacego flow i planu publicznego
onboardingu.

Nieaudytowane klienty Direct Post sa ograniczone do prywatnej widocznosci
postow. To nadal pozwala testowac integracje bez publikowania publicznie.

### 6.2. Konto TikTok Triple Muffin

1. Utworz konto TikTok z adresem `tiktok@triplemuffin.pl`.
2. Uzyj stalego numeru telefonu.
3. Ustaw:

```text
Name: Triple Muffin
Username: @triplemuffin albo @triplemuffinpl
Website: https://triplemuffin.pl
Contact: socials@triplemuffin.pl
```

4. Wlacz 2FA i zapisz backup codes.
5. W aplikacji TikTok przejdz do:
   `Profile > Menu > Settings and privacy > Account`.
6. Kliknij `Switch to Business Account`.
7. Wybierz najlepiej pasujaca kategorie.

TikTok zaleca Business Account, gdy glownym celem konta jest promowanie firmy.
Konto Business ma ograniczenie do Commercial Music Library. Dla tresci
komercyjnych uzywaj muzyki z odpowiednimi prawami.

Jeden email i jeden numer telefonu moga byc przypisane tylko do jednego konta
TikTok. Dla przyszlego `@postmerce` utworzymy inne aliasy i numer.

### 6.3. TikTok Business Center

Business Center nie jest wymagane przez samo Content Posting API, ale warto je
utworzyc do uporzadkowania assetow i przyszlych reklam.

1. Wejdz na `https://business.tiktok.com`.
2. Kliknij `Register` lub `Create`.
3. Zaloz TikTok for Business na `ads@triplemuffin.pl`.
4. Wybierz `I am an advertiser`.
5. Ustaw poprawny kraj, strefe czasowa, walute i prawna nazwe firmy.
6. Nazwij Business Center `Triple Muffin`.
7. Dodaj konto TikTok Triple Muffin jako asset, gdy panel na to pozwoli.

### 6.4. Konto deweloperskie i aplikacja

1. Wejdz na `https://developers.tiktok.com`.
2. Zaloguj sie albo utworz konto deweloperskie.
3. Przejdz do `Manage apps`.
4. Kliknij `Create an app`.
5. Ustaw:

```text
App name: Postmerce
Website: https://postmerce.pl
Privacy Policy: https://postmerce.pl/privacy
Terms of Service: https://postmerce.pl/terms
Support email: support@postmerce.pl
```

6. Dodaj produkt `Login Kit`.
7. Dodaj produkt `Content Posting API`.
8. W Login Kit ustaw redirect URI:

```text
https://staging.postmerce.pl/oauth/tiktok/callback
```

9. Wnioskuj o minimalne scope'y:

```text
video.publish
video.upload
```

`video.publish` sluzy do Direct Post. `video.upload` sluzy do przeslania
materialu do dalszego dokonczenia przez uzytkownika.

### 6.5. Przygotowanie review i audytu

Przed wyslaniem wniosku przygotuj:

- publiczna strone produktu,
- Privacy Policy i Terms,
- dzialajacy OAuth,
- dzialajacy ekran wyboru ustawien publikacji,
- jasna informacje, ze uzytkownik kontroluje publikacje,
- nagranie ekranu calego flow,
- opis przechowywania i usuwania danych,
- uzasadnienie kazdego scope'u,
- publiczny albo rzeczywiscie planowany onboarding.

Nie opisuj Postmerce jako publicznego SaaS, jesli nim jeszcze nie jest.

### 6.6. Konfiguracja Postmerce po implementacji

Na serwerze:

```text
TIKTOK_CLIENT_KEY=<client key>
TIKTOK_CLIENT_SECRET=<client secret>
TIKTOK_REDIRECT_URI=https://staging.postmerce.pl/oauth/tiktok/callback
```

Adapter powinien:

- pobierac creator info przed Direct Post,
- respektowac opcje prywatnosci zwrocone dla danego konta,
- odswiezac tokeny,
- nie zakladac, ze publiczna widocznosc jest dostepna,
- zapisywac status przetwarzania i wynik publikacji.

### 6.7. Co mozesz zrobic dzis

Mozesz wykonac punkty 6.2-6.4. Nie skladaj jeszcze finalnego review Direct Post
i nie podlaczysz konta do Postmerce, dopoki nie powstanie OAuth i adapter
TikTok.

## 7. LinkedIn

### 7.1. Struktura kont

LinkedIn Page nie ma osobnego loginu. Jest zarzadzana przez prawdziwe profile
osobowe.

Uzywaj:

```text
Administrator: prawdziwy profil LinkedIn Wojtka
Page: Triple Muffin
Website: https://triplemuffin.pl
Contact: socials@triplemuffin.pl
```

Nie tworz profilu osobowego `Triple Muffin` i nie udostepniaj loginu do
profilu.

### 7.2. Utworzenie LinkedIn Page

1. Zaloguj sie do swojego prawdziwego profilu LinkedIn.
2. Kliknij `For Business` w prawym gornym rogu.
3. Wybierz `Create a Company Page`.
4. Wybierz typ `Company`.
5. Uzupelnij:

```text
Company name: Triple Muffin
LinkedIn public URL: linkedin.com/company/triplemuffin
Website: https://triplemuffin.pl
Industry: najlepiej pasujaca branza
Company size: zgodnie ze stanem faktycznym
Company type: zgodnie ze stanem faktycznym
Tagline: krotki opis firmy
```

6. Zaznacz potwierdzenie, ze masz prawo dzialac w imieniu firmy.
7. Kliknij `Create page`.
8. Dodaj logo, cover, opis, lokalizacje i pozostale dane.
9. Sprawdz, czy jestes `Super admin`.

### 7.3. Weryfikacja Page

Weryfikacja Page nie jest dostepna dla kazdej strony od razu, ale warto
przygotowac poprawna domene i kompletne dane.

1. Wejdz w super admin view Page.
2. Przejdz do `Settings > Verification controls`.
3. Jesli opcja jest dostepna, rozpocznij weryfikacje domeny i firmy.

### 7.4. Aplikacja LinkedIn

1. Wejdz na `https://www.linkedin.com/developers/apps`.
2. Zaloguj sie prawdziwym profilem Wojtka.
3. Kliknij `Create app`.
4. Ustaw:

```text
App name: Postmerce
LinkedIn Page: Triple Muffin
Privacy Policy URL: https://postmerce.pl/privacy
App logo: logo Postmerce
```

5. Potwierdz powiazanie aplikacji z Page jako jej administrator.
6. W zakladce `Auth` dodaj redirect URL:

```text
https://staging.postmerce.pl/oauth/linkedin/callback
```

7. Zapisz Client ID i Client Secret w bezpiecznym miejscu.

### 7.5. Produkty i uprawnienia

Dla publikacji na osobisty profil:

1. W zakladce `Products` dodaj `Share on LinkedIn`.
2. Uzyj scope:

```text
w_member_social
```

Opcjonalnie dodaj `Sign In with LinkedIn using OpenID Connect`, gdy adapter
bedzie potrzebowal stabilnej identyfikacji uzytkownika:

```text
openid
profile
email
```

Dla publikacji jako LinkedIn Page:

1. Wnioskuj o Community Management API.
2. Przygotuj powiazanie aplikacji ze zweryfikowana organizacja.
3. Uzyj minimalnego scope:

```text
w_organization_social
```

Dodatkowe scope'y odczytu dodajemy tylko, gdy powstaje konkretna funkcja
statusow albo analityki.

Development tier sluzy do testow. Standard tier i szerszy dostep do
organizacji moga wymagac dodatkowego review oraz opisu use case'u.

### 7.6. Wideo i posty

Docelowy adapter powinien uzywac:

- Videos API do inicjalizacji, uploadu i finalizacji wideo,
- Posts API do utworzenia posta osobistego albo organizacyjnego,
- aktualnej wersji LinkedIn Marketing API,
- 3-legged OAuth Authorization Code Flow.

LinkedIn regularnie wygasza starsze wersje Marketing API. Nie koduj wersji API
bez aktualnego sprawdzenia dokumentacji.

### 7.7. Konfiguracja Postmerce po implementacji

Na serwerze:

```text
LINKEDIN_CLIENT_ID=<client id>
LINKEDIN_CLIENT_SECRET=<client secret>
LINKEDIN_REDIRECT_URI=https://staging.postmerce.pl/oauth/linkedin/callback
```

### 7.8. Co mozesz zrobic dzis

Mozesz utworzyc Page, aplikacje, redirect URI i dodac self-service products.
Nie podlaczysz LinkedIn do Postmerce, dopoki nie powstanie OAuth i adapter.

## 8. Zalecana kolejnosc wykonania

### Etap A - fundament

- [ ] `postmerce.pl` aktywne w Cloudflare.
- [ ] `postmerce.pl` dodane jako secondary domain w Google Workspace.
- [ ] Aliasy `support@`, `developer@`, `privacy@`, `security@` dzialaja.
- [ ] `https://postmerce.pl` dziala.
- [ ] `https://postmerce.pl/privacy` dziala.
- [ ] `https://postmerce.pl/terms` dziala.
- [ ] `https://postmerce.pl/data-deletion` dziala.
- [ ] `https://staging.postmerce.pl` dziala na drugim VPS.
- [ ] Callbacki `/oauth/*` sa osiagalne dla przegladarki.

### Etap B - konta marki Triple Muffin

- [ ] YouTube Channel Triple Muffin.
- [ ] Facebook Page Triple Muffin.
- [ ] Instagram Business Triple Muffin polaczony z Facebook Page.
- [ ] TikTok Business Triple Muffin.
- [ ] LinkedIn Page Triple Muffin.
- [ ] Wszystkie konta maja 2FA, logo, opis, link i kontakt.
- [ ] Wszystkie ID i URL-e sa zapisane w rejestrze assetow bez sekretow.

### Etap C - integracje

1. YouTube: credentiale, OAuth i prywatny test live.
2. Meta: implementacja wspolnego OAuth, Facebook Page i Instagram Reels.
3. LinkedIn: implementacja OAuth, profil osobisty, potem Page.
4. TikTok: implementacja OAuth, prywatny test, pozniej uczciwy review.

## 9. Oficjalne zrodla

### YouTube i Google

- [Create a YouTube channel](https://support.google.com/youtube/answer/1646861)
- [Manage YouTube channels](https://support.google.com/youtube/answer/4642409)
- [Channel permissions and YouTube API limitation](https://support.google.com/youtube/answer/9481328)
- [Verify a YouTube account](https://support.google.com/youtube/answer/171664)
- [OAuth 2.0 for YouTube web server apps](https://developers.google.com/youtube/v3/guides/auth/server-side-web-apps)
- [YouTube API scopes](https://developers.google.com/youtube/v3/guides/authentication)
- [videos.insert](https://developers.google.com/youtube/v3/docs/videos/insert)
- [YouTube API quota costs](https://developers.google.com/youtube/v3/determine_quota_cost)

### Meta, Facebook i Instagram

- [Create a Facebook Page](https://www.facebook.com/help/104002523024878)
- [About Instagram professional accounts](https://www.facebook.com/help/instagram/138925576505882)
- [Connect Instagram Professional to a Facebook Page](https://www.facebook.com/help/570895513091465)
- [Instagram API with Facebook Login](https://www.postman.com/meta/instagram/folder/3uqmcgi/instagram-api-with-facebook-login)
- [Instagram Reels container upload](https://www.postman.com/meta/instagram/request/dcbtql2/upload-a-reel-to-an-ig-container)
- [Instagram container status](https://www.postman.com/meta/instagram/request/fsgg0hp/get-ig-container-status)
- [Facebook Pages and Reels API collection](https://www.postman.com/meta/facebook/documentation/r56bjfd/facebook-api)

### TikTok

- [TikTok account types](https://support.tiktok.com/en/using-tiktok/growing-your-audience/switching-to-a-creator-or-business-account)
- [TikTok email and phone number rules](https://support.tiktok.com/en/log-in-troubleshoot/log-in/email-and-phone-number)
- [TikTok Business Center setup](https://ads.tiktok.com/help/article/create-tiktok-business-center?lang=pl-PL)
- [Content Posting API getting started](https://developers.tiktok.com/doc/content-posting-api-get-started)
- [Direct Post API](https://developers.tiktok.com/doc/content-posting-api-reference-direct-post)
- [TikTok app review guidelines](https://developers.tiktok.com/doc/app-review-guidelines)
- [Content Sharing Guidelines](https://developers.tiktok.com/doc/content-sharing-guidelines)

### LinkedIn

- [Create a LinkedIn Page](https://www.linkedin.com/help/linkedin/answer/a545752)
- [LinkedIn Page admin access](https://www.linkedin.com/help/linkedin/answer/a8024204)
- [Getting access to LinkedIn APIs](https://learn.microsoft.com/en-us/linkedin/shared/authentication/getting-access)
- [Share on LinkedIn](https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/share-on-linkedin)
- [LinkedIn Authorization Code Flow](https://learn.microsoft.com/en-us/linkedin/shared/authentication/authorization-code-flow)
- [LinkedIn Posts API](https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api)
- [LinkedIn Videos API](https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/videos-api)
- [Community Management API access tiers](https://learn.microsoft.com/en-us/linkedin/marketing/increasing-access)
