# Wodzirej Tycoon — białe plamy, burza mózgów, pytania otwarte

Krytyczne spojrzenie na projekt z `WODZIREJ-TYCOON-ARCHITEKTURA.md`: co jest
niedookreślone, co w pętli rozgrywki w ogóle nie istnieje, a co grozi zawaleniem
projektu, jeśli nie zdecydujemy wcześnie. Format: **problem → propozycja →
(ewentualnie) pytanie do rozstrzygnięcia**. Pytania zebrane też na końcu (§5).

---

## 1. Decyzje fundamentalne (zanim powstanie więcej kodu)

### 1.1 Czym ten produkt ma być? ⚠ największa biała plama w ogóle
Architektura zakłada „grę", ale nie mówi **po co ona istnieje**:
hobby/portfolio, rozszerzenie marketingu (lead magnet 2.0), czy produkt
komercyjny (itch.io / Steam / web premium)? Ta decyzja steruje wszystkim:
- komercyjny → potrzebny wishlist/marketing od wczesna, EN od początku,
  ~10 h+ contentu, może desktopowy wrapper (Electron/Tauri) na Steama;
- marketingowy → PL-first, krótszy, z CTA do wodzirejkarol.pl, za darmo;
- hobby → zakres dyktuje frajda, można ciąć bezlitośnie.

**Propozycja:** traktować jako *produkt grywalny z ambicją komercyjną, budowany
etapami* — czyli PL-first, web-first, darmowa wersja z pierwszymi tierami jako
walidacja (analog demo), decyzja o Steamie po feedbacku. Ale to musi być Twoja
decyzja. → **P1**

### 1.2 Język treści: PL-first czy dwujęzycznie od dnia 1?
Tycoon jest kulturowo *bardzo* polski (disco polo, oczepiny, ZUS, wujek).
Angielska wersja to nie tłumaczenie, tylko **adaptacja kulturowa** (co jest
odpowiednikiem zakazu disco polo dla gracza z UK? „no Sweet Caroline"?).
Utrzymywanie dwóch kultur treści od początku podwaja koszt każdego maila,
recenzji i kryzysu.
**Propozycja:** infrastruktura i18n od dnia 1 (klucze, `t()` — to tanie),
treść **tylko PL** do końca M8; EN jako osobny milestone po walidacji. → **P2**

### 1.3 Długość i struktura sesji
Nigdzie nie zdefiniowaliśmy: ile trwa jedno wesele w minutach realnych? Ile
wesel ma kariera do Legendy? Prototypowa scena `Dance` trwa ~2,5 min — pełne
wesele Tycoona (dojazd? setup? impreza 7 faz? debrief) może urosnąć do 15–20
min. 50 wesel × 15 min = 12,5 h samej fazy imprezy. Czy to feature czy męczarnia
— zależy od §2.6 (powtarzalność).
**Propozycja celów:** wesele = 8–12 min; kariera do Legendy = 25–35 wesel
(~6–8 h) + endgame sandbox. Te liczby wpisać do balansu i trzymać się ich przy
projektowaniu faz. → **P3**

### 1.4 Mobile: pion czy poziom?
Faza menedżerska (maile, listy) naturalnie chce **pionu**, faza imprezy
(izometryczna sala + joystick) — **poziomu**. Wymuszanie obrotu telefonu
w połowie pętli to tarcie przy każdym weselu.
**Propozycja:** projektować obie fazy pod **landscape** (manager w landscape =
layout dwukolumnowy à la FM, działa dobrze), pion jako „da się, ale gorzej".
Alternatywa: desktop-first, mobile jako bonus. → **P4**

---

## 2. Białe plamy w pętli — spacer przez cały flow

Przechodzę pętlę krok po kroku, od nowej gry do endgame'u, i wskazuję dziury.

### 2.1 Start kariery i onboarding — nie istnieje
Nie mamy: kreacji postaci (czy gram Karolem? własnym wodzirejem?), stanu
początkowego (skąd pierwszy sprzęt i pierwszy klient?), tutorialu dwufazowej
pętli.
**Propozycja:** skryptowane „wesele zerowe" — kuzynka prosi o poprowadzenie
wesela za darmo, pożyczonym sprzętem. Uczy sterowania, energii i jednego
lekkiego kryzysu; pierwsza recenzja rozkręca inbox. Kreacja postaci minimalna
(imię + 1 z 3 archetypów startowych: Gadatliwy / Techniczny / Wyszkolony —
różny startowy skill/sprzęt/kasa) — tanie, a daje replayability od progu.

### 2.2 Tydzień jako zasób — co gracz właściwie ROBI między weselami? ⚠
Architektura ma `clock.ts` (tygodnie) i szkolenia „zajmują tygodnie", ale poza
tym tydzień to pusty tick. W FM między meczami jest trening, taktyka, transfery
— u nas na razie tylko czytanie maili. To główna dziura fazy menedżerskiej.
**Propozycja — tydzień ma 2–3 „sloty akcji"**, gracz wybiera np.:
- szkolenie (multi-tydzień), serwis/tuning sprzętu, **marketing** (§2.3),
- spotkanie z parą przed weselem (§2.4), próba oczepin z ekipą,
- odpoczynek (regeneracja kondycji — §2.9), fucha zastępcza (osiemnastka,
  event firmowy: szybka kasa, zero reputacji weselnej, ryzyko zmęczenia).
Sloty tworzą realne decyzje strategiczne i sprzęgają wszystkie podsystemy.

### 2.3 Skąd biorą się klienci? Popyt jest z sufitu
W M3 oferty „generują się wg reputacji" — gracz nie ma **żadnej sprawczości po
stronie popytu**. To anty-tycoonowe: gracz zarządzający firmą musi móc
inwestować w widoczność.
**Propozycja — lejek marketingowy:** źródła leadów = word-of-mouth (pochodna
recenzji), profil w internecie (odpowiadanie na recenzje! §2.8), targi ślubne
(sezonowy event: koszt + minigra rozmów z parami → pakiet leadów), własna
strona www (ulepszalna, pasywny dopływ). Każde źródło daje inny profil klienta
— targi dają tier wyżej, word-of-mouth klientów „takich jak ostatni".

### 2.4 Negocjacje: brak konkretnych czasowników i brak ryzyka informacyjnego
„Maszyna stanów wątku mailowego" to szkielet bez mięsa. Czego brakuje:
- **Verbs:** targowanie stawki, zakres (ile godzin? oczepiny? poprawiny?),
  zaliczka %, lista zakazów/życzeń, pytania *zadawane przez gracza*.
- **Ryzyko informacyjne — kluczowy pomysł:** klient nie mówi wszystkiego.
  Maile zawierają **red flags** do wychwycenia („wujek Staszek na pewno
  będzie grzeczny…", „sala ma świetny, zabytkowy prąd"). Gracz może dopytać
  (koszt: slot akcji / ryzyko irytacji klienta) albo podpisać w ciemno —
  wtedy kryzysy na weselu zaskakują. Spotkanie z parą (§2.2) odkrywa
  ukryte pola kontraktu. To zamienia inbox z czytanki w grę w dedukcję.
- **Wysoka stawka = wysokie oczekiwania:** próg recenzji 5★ rośnie ze stawką
  (przepłacony wodzirej „musiał być idealny"). Chroni przed strategią
  „zawsze targuj maksa".

### 2.5 Dzień wesela przed imprezą: dojazd i setup jako obowiązek
Czy Load-in (scena `Setup`) gramy przy **każdym** weselu? Za 20. razem to
chore. Dojazd nie istnieje w ogóle.
**Propozycja:** dojazd = tekstowy event z rzadka (korek, awaria busa —
mitygowane leasingiem lepszego busa); setup grywalny zawsze, ale **skracalny**:
zatrudnij pomocnika (koszt/etat §2.10) → „auto-setup" z jakością zależną od
pomocnika; jakość setupu ma konsekwencje (pospieszony/auto = wyższa waga awarii
sprzętu wieczorem). Gracz-perfekcjonista gra sam, gracz-tycoon deleguje i płaci.

### 2.6 Faza imprezy: powtarzalność ⚠ ryzyko nr 1 całego projektu
Wesele #3 i #30 nie mogą grać się tak samo. Osie różnicowania (każda tania
w danych, drogie tylko łącznie):
- **sala** (`venues.ts`): układ, rozmiar, liczba pięter/przeszkód → inna
  topologia biegania w kryzysach;
- **profil gości**: langMix, rowdiness, wiek (starsi → polonez i wolniejsze
  bloki, młodzi → hype);
- **motyw wesela**: góralskie / glamour / boho / disco-polo-owe (tu zakaz jest
  odwrotny!) — moduły contentowe zmieniające muzykę, stroje NPC, kryzysy;
- **pula i budżet kryzysów** rosnące z tierem;
- **pogoda/sezon** (§2.11): wesele plenerowe + burza = własna klasa kryzysów.
Do tego **wesele-sztuka**: raz na kilka kontraktów „wesele z piekła" —
skumulowane red flags, wysoka stawka, materiał na tytuł/Legendę.

### 2.7 Faza imprezy: pozytywne czasowniki — czym gracz GRA, gdy nie gasi pożarów?
Mamy energię, zmiany gatunku muzyki i kryzysy (reaktywne). Brakuje
**proaktywnego rdzenia**: zabaw weselnych. „Szkolenia odblokowują zabawy" —
ale czym jest zabawa mechanicznie?
**Propozycja — zabawa jako mini-sekwencja (15–30 s):** wybór z koła przy DJ-ce
→ zebranie chętnych (podbiegnij, zaproś — mechanika z istniejącego bukietu!) →
krótki skill-check (rytm/QTE/celowanie — 3 szablony wystarczą na start) →
wynik skaluje energię. Zabawa ma cooldown i „zużywa się" (ci sami goście nie
zrobią wężyka 3×). Playlist zabaw = plan taktyczny ustawiany przed weselem
(FM-owy skład!) — to domyka fantazję menedżera.

### 2.8 Po weselu: pieniądze i opinie są zbyt automatyczne
- **Płatność:** dziś „wypłata natychmiast". Smaczniej: zaliczka przy podpisaniu,
  reszta po weselu — a klient tier 1 czasem **nie płaci** (event windykacyjny:
  odpuść / windykuj slotem akcji / „umowa pisemna" ze szkolenia prawniczego
  eliminuje problem). Uczy wartości szkoleń nietechnicznych.
- **Opinie przychodzą z opóźnieniem** (2–5 dni), nie hurtem na debriefie —
  inbox żyje, a zła recenzja tydzień po świetnym weselu to emocja.
- **Odpowiadanie na recenzje = odpowiednik konferencji prasowej FM:** publiczna
  odpowiedź na niesprawiedliwą 1★ (opcje: dyplomatycznie / z humorem / wdać się
  w pyskówkę). Dobra odpowiedź neutralizuje szkodę i buduje markę, pyskówka =
  viral minus. Tanie w implementacji (te same klocki tekstowe), a robi z
  niesprawiedliwych recenzji grę zamiast frustracji.

### 2.9 Wodzirej jako człowiek: kondycja i głos — nie istnieją
Overbooking nie ma dziś żadnego kosztu → optymalna strategia to grać co weekend
bez przerwy = nudny grind.
**Propozycja:** dwa paski: **kondycja** (spada za każde wesele i fuchę,
regeneruje odpoczynkiem) i **głos/chrypka** (spada przy przegadanych weselach,
np. dużo kryzysów rozwiązywanych gadaniem). Niska kondycja = wolniejszy bieg
w kryzysach i słabsze skill-checki; stracony głos = wesele praktycznie
nie do poprowadzenia. Tworzy rytm sezonu i realny wybór „czy brać trzecie
wesele w tym tygodniu".

### 2.10 Skalowanie firmy: co jest w mid/late game? ⚠
Obecna progresja to „droższe zlecenia i lepszy sprzęt" — czyli te same decyzje
z większymi liczbami. Prawdziwy tycoon skaluje **strukturę**, nie liczby:
**Propozycja — ekipa:** zatrudnij technika (auto-setup, szybsze naprawy),
DJ-a (możesz odpuścić blok muzyczny), drugiego wodzireja (NPC ze statami —
wysyłasz go SAMEGO na wesela tier 1-2: symulacja w tle à la FM „wynik meczu
rezerw", jego wpadki też generują recenzje Twojej firmy!). Late game = agencja:
Ty gracz bierzesz tylko wesela-legendy, ekipa robi wolumen. To też naturalny
zawór na powtarzalność (§2.6): rutynowe wesela delegujesz zamiast odbębniać.

### 2.11 Sezonowość i kalendarz roczny — nie istnieją
Polski rynek weselny to maj–wrzesień + sylwester; zima to pustynia. Bez tego
kalendarz jest szarą taśmą tygodni.
**Propozycja:** sezon wysoki (nadmiar ofert — sztuka odmawiania, kondycja!),
zima (cash flow ujemny → fuchy: studniówki, sylwester, karnawał; czas na
szkolenia i serwis). Rok ma rytm, księgowość z M6 nabiera sensu (rezerwa na
zimę), a „18 ślubów w sezonie" staje się osiągnięciem.

### 2.12 Konkurencja: rywale NPC — nie istnieją
FM bez innych klubów nie byłby FM. U nas nie ma nikogo, kto by nam zabrał
zlecenie.
**Propozycja (lekka wersja, duży efekt):** 3–5 nazwanych rywali (np. „DJ Waldi
& Wodzirej Max") z reputacją liczoną tym samym kodem co nasza. Skutki: część
ofert to **przetargi** (para pyta dwóch wodzirejów — przegrywasz, gdy stawka
i reputacja nie domykają się), rywal może podkupić Twojego DJ-a (§2.10),
ranking regionalny w UI jako stały cel pośredni. Rywale nie potrzebują pełnej
symulacji — wystarczy dryf reputacji + kilka eventów.

### 2.13 Porażka i trudność
- **Bankructwo** jest (M6), ale brakuje **soft-fail spirali**: niska reputacja →
  tanie zlecenia → brak kasy na rozwój → nuda zamiast wyzwania. Potrzebny
  mechanizm odbicia: „wesele ostatniej szansy" (ktoś desperacko szuka na jutro,
  wysokie ryzyko/nagroda) pojawiające się przy niskiej reputacji.
- **Czy można przegrać samo wesele?** Propozycja: tak — energia na zerze zbyt
  długo / kryzys eskalowany do końca = para przerywa imprezę; brak zapłaty
  reszty, seria recenzji 1★. Rzadkie, ale możliwe = stawka jest realna.
- **Pauza i przerwania na mobile:** telefon dzwoni w trakcie wesela → auto-pauza
  i powrót bez kary; save między fazami wesela, nie w ich trakcie.

### 2.14 Endgame: co po Legendzie?
**Propozycja:** Legenda = „ukończenie gry" (napisy, statystyki kariery,
podziękowania) + odblokowany **tryb sandbox/prestiż**: nowa kariera
z modyfikatorami (start w innym regionie, tryb „tylko wesela z piekła",
ironman). Tanie, przedłuża życie gry.

---

## 3. Białe plamy techniczno-produkcyjne

### 3.1 Muzyka a prawa autorskie ⚠ zderzenie z rzeczywistością
Mechanika „zakazanych utworów" sugeruje rozpoznawalne piosenki — **żadnych
prawdziwych utworów użyć nie można** (ani tytułów jako elementów rozgrywki
1:1). Prototypowy syntezator ratuje sytuację: gatunki pozostają proceduralne,
a utwory dostają **tytuły-pastisze** („Majteczki w kropeczki" → „Skarpeteczki
w kropeczki"). Zakaz disco polo działa na poziomie *gatunku* (już mamy koło
gatunków!), a konkretne „hity" to warstwa tekstowo-humorystyczna. Do decyzji:
czy inwestujemy w rozbudowę sekwencera (więcej patternów per gatunek), bo
8 godzin kariery na obecnej pętli muzycznej zmęczy. → **P8**

### 3.2 Balans ekonomii: nie mamy ani jednej liczby
Stawki, ceny sprzętu, koszty stałe, krzywa reputacji — zero konkretów. Ryzyko:
balansowanie „na oko" w kodzie == wieczne przestrajanie.
**Propozycja:** plik `docs/BALANS.md` + **headless symulator kariery** — skoro
`core/` jest czystym TS, piszemy bota grającego 1000 karier (strategie: skąpiec
/ inwestor / hazardzista) i sprawdzamy w teście: czy da się zbankrutować, czy
Legenda wychodzi w ~30 wesel, czy któraś strategia nie dominuje. To jest tani
super-power tej architektury — wykorzystajmy go od M2.

### 3.3 Produkcja treści: kto to napisze?
System klocków recenzji/maili potrzebuje setek fragmentów w dobrym, śmiesznym
polskim. To największy koszt *contentowy* projektu.
**Propozycja:** ton ustala krótki **STYL.md** („biblia humoru": satyra ciepła,
nie złośliwa; absurd tak, chamstwo nie; ZUS-jokes dozwolone), fragmenty
generujemy wspólnie (Ty + ja) partiami per milestone, każdy fragment z tagami
(ton, tier, kontekst kryzysu), żeby generator nie sklejał absurdów przypadkowo.

### 3.4 Telemetria i playtesty
Web-gra daje łatwy feedback loop, ale nie zaplanowaliśmy żadnego: gdzie gracze
odpadają? który kryzys frustruje?
**Propozycja:** minimalna, anonimowa telemetria zdarzeń (start/koniec wesela,
bankructwo, rage-quit w fazie) — decyzja czy w ogóle (RODO, prostota). → **P9**

### 3.5 Wersjonowanie save'ów w trakcie dewelopmentu
Migracje są w planie (M1), ale przy tempie zmian schematu w M2–M7 utrzymywanie
migracji dev-save'ów spowolni nas.
**Propozycja:** do wydania 0.x save łamiemy bez migracji (komunikat „nowa era,
nowa kariera"), migracje włączamy dopiero od pierwszego publicznego wydania.

---

## 4. Szybkie strzały z burzy mózgów (do zaparkowania lub wzięcia)

- **Poprawiny** jako opcjonalny „drugi mecz" za pół stawki przy zmęczonej
  ekipie — ryzyko/nagroda po dobrym weselu.
- **Teściowa jako trzecia strona negocjacji** — para chce A, matka płaci i chce
  B; komu dogodzisz, ten wystawia recenzję.
- **Wesele bez prądu w plenerze** — cały event na agregacie: limit mocy =
  zarządzanie sprzętem (nie włączysz wszystkich świateł i wędzarni naraz).
- **Katalog gadżetów-absurdów:** ciężki dym, napis LOVE (pali się = kryzys),
  fotobudka (pasywny dochód + kolejka blokująca parkiet).
- **Osiągnięcia** („Puściłeś jednak to disco polo…") — tanie, a niosą humor.
- **Tryb „prawdziwa historia"**: seedowane scenariusze tygodnia („wesele,
  na którym zgasło światło 3×") z leaderboardem wyniku — łatwy content
  społecznościowy, gdy gra będzie publiczna.
- **Cameo gry reklamowej:** w Tycoonie sala z prototypu to „pierwsza sala
  Karola" — mrugnięcie okiem, zero kosztu.

---

## 5. Pytania otwarte — ROZSTRZYGNIĘTE

> **Decyzja (2026-07-09): wszystkie domyślne propozycje przyjęte bez zmian.**
> Wynikające z nich korekty zakresu są wpisane do planu M0–M9 w
> `WODZIREJ-TYCOON-ARCHITEKTURA.md` §8.

| # | Pytanie | Decyzja (przyjęta 2026-07-09) |
|---|---|---|
| P1 | Cel produktu: hobby / marketing / komercja? | Produkt z ambicją komercyjną, walidowany darmową wersją web |
| P2 | Treść EN od początku? | Nie — i18n-infra tak, treść PL-first, EN po M8 |
| P3 | Cel długości: wesele / kariera? | 8–12 min / 25–35 wesel (~6–8 h) |
| P4 | Mobile: pion, poziom, czy desktop-first? | Landscape obie fazy; desktop-first w devie |
| P5 | Gramy Karolem czy własną postacią? | Własna postać + archetyp startowy (Karol jako mentor/NPC?) |
| P6 | Ekipa i delegacja (§2.10) w zakresie 1.0? | Tak, ale późno (po M8) — projektować typy danych pod to od razu |
| P7 | Rywale NPC (§2.12) w zakresie 1.0? | Wersja lekka (reputacja + przetargi) tak, pełna symulacja nie |
| P8 | Inwestujemy w rozbudowę syntezatora muzyki? | Tak, umiarkowanie: +2–3 patterny na gatunek, dopiero po M7 |
| P9 | Telemetria? | Odroczyć do pierwszego publicznego wydania |
| P10 | Setup grywalny przy każdym weselu? | Tak, dopóki nie ma technika w ekipie; potem delegowalny |

Korekty zakresu wynikające z decyzji zostały wpisane do architektury (§8):
sloty akcji tygodnia w M3, lejek marketingowy i red flags w M3, kondycja/głos
w M5, zabawy jako mini-sekwencje w M7, recenzje z opóźnieniem + publiczne
odpowiedzi w M8, rywale (wersja lekka) jako nowy M9; ekipa/delegacja
odroczona za 1.0 (typy danych projektowane pod nią od razu).
