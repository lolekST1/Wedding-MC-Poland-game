# Wodzirej Tycoon — architektura i plan wdrożenia

Dokument projektowy dla rozbudowy prototypu „Wodzirej Karol: Master of the Dancefloor"
(obecnie `index.html`) do pełnej gry typu tycoon/manager: **„Football Manager meets
The Sims"** o pracy wodzireja weselnego.

Stan wyjściowy (prototyp): jeden plik HTML, Phaser 3 z CDN, 4 sceny
(`Boot → Hub → Setup/Dance → Result`), grafika proceduralna (`genAssets`), muzyka
syntezowana Web Audio, i18n PL/EN przez słownik `I18N` + `t()`. W scenie `Dance`
działa już **proto-system kryzysów**: `evPlan` (pijany wujek, awaria głośnika,
prośby o piosenki, zdjęcie) oraz system energii parkietu i fazy wieczoru (`DPH`).

---

## 0. Dom projektu — osobny produkt, to samo repo

Decyzja: **Tycoon rozwija się niezależnie od gry reklamowej**, jako osobny
projekt w katalogu `tycoon/` na `main`.

- Gra reklamowa (`index.html`, `index-en.html`) zostaje **zamrożona jako osobny
  produkt** — Tycoon niczego w niej nie zmienia i nie współdzieli z nią plików.
  Kod prototypu jest do Tycoona **kopiowany (portowany), nie przenoszony**.
- `tycoon/` deployuje się razem z resztą repo na GitHub Pages →
  `https://lolekst1.github.io/Wedding-MC-Poland-game/tycoon/` — obecny workflow
  „merge do main = test na żywo" działa więc od pierwszego dnia także dla
  Tycoona. (Workflow Pages dostanie w M0 krok `npm ci && npm run build`
  w `tycoon/`; artefakt = root repo + zbudowany `tycoon/`.)
- Rozwój jak dotąd: krótkie feature-branche → PR → merge do `main`. Nie
  utrzymujemy długiej gałęzi produktowej — separację daje katalog, nie branch
  (długa gałąź = wieczne konflikty i brak deployu do testów).
- Gdy projekt urośnie lub się skomercjalizuje, katalog da się wyciąć do
  własnego repozytorium z pełną historią (`git subtree split` /
  `git filter-repo`) — decyzja jest w pełni odwracalna.

> Uzupełnieniem tego dokumentu jest **`WODZIREJ-TYCOON-BIALE-PLAMY.md`** —
> krytyczna analiza luk w projekcie: decyzje fundamentalne do podjęcia, białe
> plamy w pętli rozgrywki i lista pytań otwartych. Czytaj oba razem.

---

## 1. Stos technologiczny — rekomendacja

### Werdykt: **Phaser 3 + TypeScript + Vite; faza menedżerska w DOM (Preact)**

| Opcja | Ocena | Dlaczego |
|---|---|---|
| **Phaser 3 + TS + Vite + DOM-UI** ✅ | rekomendowana | Prototyp przenosi się niemal 1:1; UI menedżerskie w HTML/CSS; nadal statyczne pliki (GitHub Pages / serwer klienta) |
| React + PixiJS ❌ | odrzucona | Pixi to tylko renderer — sceny, input, tweeny, kamerę, depth-sorting trzeba by napisać od zera, czyli wyrzucić prototyp |
| Godot (eksport web) ❌ | odrzucona | Przepisanie wszystkiego od zera; ~30 MB wasm zabija pierwsze wejście na telefonie — a gra jest też assetem marketingowym; brak przewagi dla gry 2D tej skali |
| Czysty JS w jednym pliku ❌ | koniec drogi | 2 188 linii to już granica utrzymywalności; tycoon to 5–10× więcej kodu, dwa duże podsystemy i dziesiątki plików danych |

Uzasadnienie kluczowych decyzji:

1. **Zostajemy przy Phaserze.** Cały kapitał prototypu — `iso()`, `tdepth()`,
   `genAssets`, `Audio`, sceny `Setup` i `Dance`, sterowanie, joystick mobilny —
   przenosi się bez przepisywania. Zmiana silnika to utrata 100% działającego kodu
   w zamian za zero nowych możliwości (gra nie potrzebuje 3D, fizyki ani edytora).

2. **Faza menedżerska w DOM, nie w canvasie.** Ekran w stylu Football Managera to
   listy, tabele, formularze, wątki mailowe, scrollowanie, tooltips — HTML/CSS robi
   to natywnie (plus dostępność, zaznaczanie tekstu, klawiatura mobilna przy
   wpisywaniu playlist). Rysowanie tego w Phaserze to walka z silnikiem.
   Rekomendacja: **Preact + @preact/signals** (~4 kB, JSX, komponenty) — na tyle
   mały, że nie zmienia charakteru projektu, a dziesięć ekranów menedżerskich
   pisze się deklaratywnie zamiast ręcznie składać DOM. (Wariant zapasowy: czysty
   TS + `lit-html`, jeśli chcesz zero frameworka.)

3. **Vite + TypeScript.** Vite daje moduły, HMR i build do statycznych plików —
   deploy pozostaje „wgraj pliki" (Pages lub dowolny hosting statyczny). Tycoon
   to normalny wieloplikowy build Vite w `tycoon/` (lepszy caching niż jeden
   wielki plik); gra reklamowa zostaje przy swoich dwóch ręcznie utrzymywanych
   plikach i nic się w niej nie zmienia. TypeScript jest nieoceniony przy
   kontraktach danych (patrz §4) — to tam tycoon najczęściej się sypie.

4. **Phaser nadal z CDN, ładowany leniwie** (obecna optymalizacja PageSpeed
   zostaje) — faza menedżerska to czysty DOM, więc gra może startować do inboxa
   **bez Phasera w ogóle**; silnik dociąga się dopiero przy pierwszym wyjeździe
   na wesele.

---

## 2. Zasady architektury

1. **Rdzeń symulacji bez silnika.** Katalog `core/` nie importuje ani Phasera,
   ani DOM — czysty TypeScript: stan gry, ekonomia, reputacja, generator opinii,
   negocjacje, logika kryzysów. Dzięki temu jest testowalny (`vitest`) i obie
   warstwy prezentacji (DOM-manager i Phaser-impreza) tylko go renderują.
2. **Jedno źródło prawdy: `GameState`.** Mutacje wyłącznie przez funkcje-akcje
   (`actions/`), które emitują zdarzenia na `EventBus`. UI subskrybuje zdarzenia,
   nigdy nie grzebie w stanie bezpośrednio.
3. **Treść jako dane.** Kryzysy, sprzęt, szkolenia, maile, fragmenty recenzji,
   tytuły — deklaratywne pliki w `data/`. Dodanie nowego kryzysu = nowy wpis
   w tabeli, nie nowy kod. (Prototyp już tak myśli: `evPlan`, `DPH`, `chars`.)
4. **Deterministyczny RNG z seedem** (mulberry32 wystarczy). Każde wesele
   generowane z seeda zapisanego w kontrakcie → błędy da się odtworzyć,
   a „to samo wesele" można przeżyć ponownie.
5. **Zapis wersjonowany.** `localStorage` + `saveVersion` + tablica migracji;
   dodatkowo eksport/import save'a jako plik JSON (gracz nie traci kariery przy
   czyszczeniu przeglądarki).
6. **i18n jak dotąd, tylko po modułach.** Klucze + `t()` zostają; słownik
   dzielimy na pliki per moduł (`i18n/manager.pl.ts`…). Uwaga: język interfejsu
   (PL/EN strony) to co innego niż **język wypowiedzi w grze** (mechanika z §6) —
   dwa niezależne systemy.

---

## 3. Struktura projektu

```
tycoon/                        # osobny projekt w repo (patrz §0)
├─ index.html                  # entry (i18n w runtime, PL-first)
├─ vite.config.ts
├─ package.json
├─ public/                     # favicon, og-image itp.
└─ src/
   ├─ main.ts                  # bootstrap: save → router faz (manager ⇄ impreza)
   │
   ├─ core/                    # ── CZYSTY TS, zero Phasera i DOM ──
   │  ├─ state.ts              # typ GameState + createNewGame()
   │  ├─ save.ts               # load/save, wersjonowanie, migracje, eksport pliku
   │  ├─ events.ts             # EventBus (emit/on, typowane zdarzenia)
   │  ├─ rng.ts                # seedowany RNG
   │  ├─ clock.ts              # kalendarz kariery (tygodnie, terminy wesel)
   │  ├─ economy.ts            # pieniądze, koszty, amortyzacja, podatki
   │  ├─ contracts.ts          # generator ofert, maszyna stanów negocjacji
   │  ├─ reputation.ts         # punkty reputacji, progi, tytuły
   │  ├─ reviews.ts            # proceduralny generator opinii gości
   │  └─ crisis/
   │     ├─ types.ts           # CrisisDef, CrisisOption, Outcome
   │     └─ resolve.ts         # rozstrzyganie wyboru gracza (ryzyko/nagroda)
   │
   ├─ data/                    # ── TREŚĆ JAKO DANE ──
   │  ├─ crises.ts             # definicje kryzysów (wujek, prąd, tort, spodnie…)
   │  ├─ gear.ts               # katalog sklepu: nagłośnienie, światła, gadżety
   │  ├─ trainings.ts          # szkolenia → odblokowywane zabawy/umiejętności
   │  ├─ mailTemplates.ts      # szablony wątków mailowych (negocjacje)
   │  ├─ reviewFragments.ts    # klocki tekstowe recenzji (PL/EN)
   │  ├─ titles.ts             # tytuły ("The Chaos Whisperer"…) + warunki
   │  └─ venues.ts             # sale weselne (rozmiar, prestiż, układ)
   │
   ├─ manager/                 # ── FAZA MENEDŻERSKA (DOM / Preact) ──
   │  ├─ ManagerApp.tsx        # layout: sidebar + ekran aktywny
   │  ├─ screens/
   │  │  ├─ Inbox.tsx          # skrzynka: oferty, negocjacje, playlisty, zakazy
   │  │  ├─ Shop.tsx           # sklep + magazyn sprzętu
   │  │  ├─ Trainings.tsx      # drzewko szkoleń
   │  │  ├─ Accounting.tsx     # księgowość, podatki, historia finansów
   │  │  ├─ Calendar.tsx       # terminarz wesel, przycisk "Jedź na wesele"
   │  │  └─ Reviews.tsx        # profil publiczny: gwiazdki, opinie, tytuły
   │  └─ components/           # MailThread, StarRating, MoneyLabel…
   │
   ├─ party/                   # ── FAZA IMPREZY (Phaser) ──
   │  ├─ loader.ts             # leniwe ładowanie Phasera z CDN (jak dziś)
   │  ├─ game.ts               # konfiguracja Phaser.Game
   │  ├─ scenes/
   │  │  ├─ Boot.ts            # genAssets (port z prototypu)
   │  │  ├─ Setup.ts           # load-in (port sceny Setup)
   │  │  ├─ Party.ts           # port sceny Dance + silnik kryzysów
   │  │  └─ Debrief.ts         # port Result: wynik → WeddingResult → core
   │  ├─ systems/
   │  │  ├─ crisisDirector.ts  # spawner: kiedy i który kryzys (waga, kontrakt)
   │  │  ├─ radialMenu.ts      # kołowe menu wyboru akcji (styl The Sims)
   │  │  ├─ speech.ts          # wypowiedzi: pasek+chmurka z flagą, dopasowanie języka
   │  │  ├─ npc.ts             # goście: profil (język, upojenie), ruch, reakcje
   │  │  └─ energy.ts          # energia parkietu (port + modyfikatory sprzętu)
   │  └─ gfx/
   │     ├─ genAssets.ts       # cały pipeline pixel-art (port)
   │     └─ isoRoom.ts         # iso(), tdepth(), drawPalaceRoom (port)
   │
   ├─ audio/audio.ts           # port IIFE Audio (sekwencer + sfx)
   ├─ i18n/                    # index.ts (t, detectLang) + słowniki per moduł
   └─ ui/hud.ts                # elementy wspólne obu faz (pieniądze, data, mute)
```

---

## 4. Model domeny i kontrakt integracji

Najważniejszy element całej architektury: **dwa typy spinające fazy**. Faza
menedżerska produkuje `WeddingContract`, faza imprezy konsumuje go i zwraca
`WeddingResult`. Dopóki ten kontrakt jest stabilny, obie fazy rozwijają się
niezależnie.

```ts
// core/state.ts
interface GameState {
  saveVersion: number;
  week: number;                    // zegar kariery
  money: number;
  reputation: number;              // 0–1000, progi odblokowują tier zleceń
  titles: string[];                // zdobyte tytuły-marki
  inventory: OwnedGear[];          // sprzęt + stan zużycia
  skills: string[];                // ukończone szkolenia (id z data/trainings)
  inbox: MailThread[];
  calendar: WeddingContract[];     // podpisane zlecenia z datami
  reviews: Review[];               // historia opinii (profil publiczny)
  ledger: LedgerEntry[];           // księgowość: każda transakcja
  stats: CareerStats;              // liczniki do tytułów i Legendy
}

// core/contracts.ts — WYJŚCIE fazy menedżerskiej
interface WeddingContract {
  id: string;
  seed: number;                    // determinizm generacji wesela
  week: number;                    // termin
  couple: { names: string; story: string };
  venue: string;                   // id z data/venues
  fee: number;                     // wynegocjowana stawka
  tier: 1 | 2 | 3 | 4;             // wiejska remiza → wesele międzynarodowe
  guestProfile: {
    count: number;
    langMix: { pl: number; en: number }; // odsetek gości PL/EN → mechanika języka
    rowdiness: number;             // 0–1: ryzyko pijanych wujków
  };
  playlist: { mustPlay: string[]; forbidden: string[] };  // np. zakaz disco polo
  specialRequests: string[];       // wynegocjowane obietnice (mnożnik ryzyka)
}

// core/… — WYJŚCIE fazy imprezy, WEJŚCIE dla reputacji/opinii/kasy
interface WeddingResult {
  contractId: string;
  score: number;
  avgEnergy: number;               // z istniejącego systemu energii
  crises: { id: string; outcome: 'brilliant' | 'ok' | 'failed' | 'panicked' }[];
  forbiddenPlayed: boolean;        // dał się przekupić wujkowi?
  bribesTaken: number;
  promisesKept: number;            // ile specialRequests zrealizowano
  tips: number;
}
```

Przepływ: `Calendar.tsx` → `startWedding(contract, loadout)` → sceny Phasera →
`Debrief` woła `core.finishWedding(result)` → ekonomia księguje `fee + tips`,
`reviews.ts` generuje opinie, `reputation.ts` przelicza punkty i tytuły → powrót
do fazy menedżerskiej z nowymi mailami w inboxie.

---

## 5. System kryzysów („Crisis Mode") — specyfikacja

Uogólnienie istniejącego `evPlan` z sceny `Dance` do silnika sterowanego danymi:

```ts
// core/crisis/types.ts
interface CrisisDef {
  id: string;                          // 'drunkUncle', 'powerOutage', 'lateCake', 'tornPants'
  icon: string;
  weight: (c: WeddingContract, s: PartySnapshot) => number;  // szansa wystąpienia
  site: 'dj' | 'tables' | 'entrance' | 'dancefloor' | 'random';
  timerSec: number;                    // presja czasu: tyle masz na dobiegnięcie
  escalation: CrisisStageId[];         // kryzys nierozwiązany → kolejne stadium
  options: CrisisOption[];             // pozycje kołowego menu
}

interface CrisisOption {
  id: string;
  labelKey: string;                    // klucz i18n
  requires?: { skill?: string; item?: string; lang?: 'pl' | 'en' };
  risk: number;                        // 0 = pewniak, 1 = hazard
  outcomes: WeightedOutcome[];         // efekty: energia, reputacja, kasa, follow-up
}
```

Pętla w `party/systems/crisisDirector.ts`:

1. Director losuje kryzysy wg wag (kontrakt podnosi szanse: wysoki `rowdiness`
   → częstszy wujek; tania sala → częstsze awarie prądu).
2. Kryzys spawnuje się **w konkretnym miejscu sali** + alarm na HUD i strzałka.
   Timer tyka — energia parkietu spada, dopóki gracz nie dobiegnie (fizycznie,
   istniejącym sterowaniem).
3. Po dobiegnięciu otwiera się **kołowe menu** (`radialMenu.ts`): 3–5 opcji,
   w tym zawsze jedna „panika" (najgorsza) i opcje warunkowe (wyszarzone, jeśli
   brak szkolenia/przedmiotu/złego języka).
4. `core/crisis/resolve.ts` rozstrzyga wynik (seedowany RNG × `risk`):
   - **brilliant** — wielki bonus energii + reputacji, wpada do `WeddingResult`
     i staje się materiałem na entuzjastyczną recenzję i tytuł,
   - **failed / panicked** — kara, eskalacja do następnego stadium kryzysu.

### Dwa pierwsze kryzysy (wzorcowe implementacje)

**Pijany wujek** (rozbudowa istniejącego eventu):
- Stadium 1: wujek macha stówą przy konsoli — chce zakazane disco polo.
  Opcje: *Spław go* (bezpieczne, mały minus energii) / *Oddeleguj do świadka*
  (wymaga szkolenia „Dyplomacja weselna", pewniak) / *Weź stówę i puść*
  (+100 zł, ale `forbiddenPlayed=true` → gwarantowana zła recenzja pary) /
  *Panika* (wujek wchodzi na scenę).
- Stadium 2 (nawrót): dochodzi opcja *Uciszyć wódką* (wymaga przedmiotu
  „butelka na czarną godzinę" ze sklepu; ryzykowna, ale efekt brilliant).
- Wujek rozumie **tylko polski** — wypowiedź po angielsku = ignoruje wodzireja.

**Awaria prądu**:
- Sala ciemnieje (istniejący system winiet + wyłączenie muzyki w `Audio`).
- Timer eskalacji: goście zaczynają wychodzić (energia leci w dół szybko).
- Opcje: *Świeczki + quiz o parze młodej* (wymaga szkolenia „Quizmaster";
  sekwencja: podbiegnij do stołów → poproś o świeczki → mini-quiz utrzymuje
  energię, aż obsługa odpali agregat → brilliant) / *Czekaj bezczynnie* /
  *Panika* (krzyk w ciemności, −reputacja).

---

## 6. Mechanika języka wypowiedzi (PL/EN w locie)

- HUD imprezy dostaje **przełącznik języka wypowiedzi** (klawisz Tab / przycisk
  mobilny) — niezależny od języka strony.
- Każdy NPC ma pole `lang: 'pl' | 'en' | 'both'` (rozkład z `guestProfile.langMix`).
- Wypowiedź to akcja z czasem: nad głową rośnie **pasek w chmurce z flagą**
  (`speech.ts`); przerwanie ruchu = przerwanie wypowiedzi.
- Zły język → NPC wyświetla „?" i ignoruje akcję (czas stracony — a timer
  kryzysu tyka). Wesela tier 4 (międzynarodowe) wymuszają żonglerkę językami.

---

## 7. Opinie, tytuły, progresja

**Generator recenzji** (`core/reviews.ts` + `data/reviewFragments.ts`):
- Wejście: `WeddingResult` + osobowości gości z seeda.
- Ocena bazowa z `score`/`avgEnergy`/kryzysów, po czym szum: ~10% recenzji jest
  **niesprawiedliwych** („nie podobał mi się kolor serwetek" — 1★ mimo świetnego
  wesela) — gracz uczy się, że pojedyncza opinia to nie wyrok.
- Tekst składany z klocków: [otwarcie][konkret z wesela][ocena wodzireja][absurd?].
  Konkrety odwołują się do faktów: *„Jak zgasło światło, ten człowiek zrobił quiz
  przy świeczkach — magia!"* (kryzys `powerOutage` = brilliant).

**Tytuły** (`data/titles.ts`): reguły na `CareerStats`, np.
- *The Chaos Whisperer* — 5 kryzysów z rzędu na brilliant,
- *The Wedding Savior* — wygrane wesele, w którym wystąpiły ≥3 kryzysy,
- *Nieprzekupny* — 10 wesel bez wzięcia łapówki od wujka.

**Progresja**: reputacja odblokowuje tiery kontraktów (wyższe stawki → budżet na
sprzęt i szkolenia → trudniejsze wesela z większą pulą kryzysów). **Legenda** =
ostatni tier reputacji, wymaga serii weseli-katastrof (wysoki `crisisCount`)
zakończonych oceną ≥4.5★.

---

## 8. Plan wdrożenia — kamienie milowe

Zasada: **po każdym kamieniu gra jest grywalna i wdrażalna**. Prototypowe sceny
to od M2 „faza imprezy", więc pełna pętla tycoona działa bardzo wcześnie.

> **Decyzje P1–P10 przyjęte 2026-07-09** (BIALE-PLAMY §5) — ustalenia wiążące
> dla planu: produkt z ambicją komercyjną walidowany darmową wersją web (P1);
> infrastruktura i18n od dnia 1, treść tylko PL do końca M8 (P2); cele balansu:
> **wesele 8–12 min, kariera do Legendy 25–35 wesel / ~6–8 h** (P3); obie fazy
> projektowane pod landscape, desktop-first w devie (P4); gracz tworzy własną
> postać z archetypem startowym (P5); ekipa/delegacja po 1.0, ale typy danych
> projektowane pod nią od razu (P6); rywale w wersji lekkiej w 1.0 → M9 (P7);
> rozbudowa syntezatora po M7 (P8); telemetria odroczona do publicznego
> wydania (P9); setup grywalny przy każdym weselu do czasu technika (P10).

### M0 — Port prototypu do `tycoon/` (fundament, zero nowych funkcji)
- Init Vite + TS + Preact w `tycoon/`; **skopiowanie** kodu z `index.html` do
  modułów wg §3 (na razie `party/` + `audio/` + `i18n/`; można stopniowo, plik
  po pliku, z `allowJs` — pełne typowanie później). Gra reklamowa w root
  repo pozostaje nietknięta.
- Aktualizacja workflow Pages: krok `npm ci && npm run build` w `tycoon/`;
  artefakt = root repo + zbudowany Tycoon pod ścieżką `/tycoon/`.
- **Definition of done:** `…/Wedding-MC-Poland-game/tycoon/` gra identycznie
  jak prototyp (Setup + Dance przechodzą się bez zmian) na desktopie i mobile;
  gra reklamowa działa bez żadnych zmian.

### M1 — Rdzeń symulacji
- `core/`: `GameState`, `EventBus`, `save.ts` (localStorage + wersja + eksport),
  `rng.ts`, `clock.ts`. Testy `vitest` dla save/migracji i RNG.
- **DoD:** `newGame() → save() → load()` odtwarza stan; testy zielone.

### M2 — Szkielet fazy menedżerskiej + pierwsza pełna pętla ⭐
- `ManagerApp` z nawigacją (Inbox/Sklep/Szkolenia/Księgowość/Terminarz — na
  razie placeholdery) + HUD (kasa, tydzień, reputacja).
- Nowa gra: własna postać — imię + archetyp startowy (Gadatliwy / Techniczny /
  Wyszkolony; na razie różnią się tylko stanem startowym: skill/sprzęt/kasa).
- `Calendar.tsx` z jednym wygenerowanym zleceniem → „Jedź na wesele" → leniwe
  ładowanie Phasera → istniejące sceny `Setup` + `Party(Dance)` → `Debrief`
  zwraca `WeddingResult` → wypłata, +tydzień, powrót do managera.
- **DoD:** pełny cykl manager → wesele → wypłata → manager, z zapisem stanu.
  To jest moment, w którym gra staje się tycoonem.

### M3 — Inbox, negocjacje i tydzień jako zasób
- **Sloty akcji tygodnia (2–3)** — BIALE-PLAMY §2.2: gracz wydaje je na
  szkolenie / serwis sprzętu / marketing / spotkanie z parą / odpoczynek /
  fuchę zastępczą. To rdzeń decyzyjny fazy menedżerskiej.
- **Lejek marketingowy** — §2.3: źródła leadów (word-of-mouth z recenzji,
  profil www, targi ślubne); oferty przestają spadać z nieba.
- Generator ofert (`contracts.ts`): tier wg reputacji, seed, profil gości.
- Wątek mailowy jako maszyna stanów: oferta → pytania/kontrpropozycja stawki
  (ryzyko odrzucenia) → ustalenie playlisty i **listy zakazanych utworów**
  (te dane zasilą kryzys wujka) → podpisanie → wpis do terminarza.
- **Red flags** — §2.4: maile zawierają ukryte sygnały ryzyka; dopytywanie /
  spotkanie z parą (slot akcji) odkrywa ukryte pola kontraktu. Wysoka
  wynegocjowana stawka podnosi próg oczekiwań (trudniej o 5★).
- **DoD:** można wynegocjować i zagrać 3 różne wesela; odrzucenie oferty ma koszt
  (pusty tydzień = opłaty stałe lecą); zignorowany red flag odpala się na weselu.

### M4 — Sklep i magazyn
- `data/gear.ts`: 3 kategorie (nagłośnienie / światła / gadżety), 3–4 tiery.
- Sprzęt ma **efekty w fazie imprezy**: lepsze głośniki = wolniejszy spadek
  energii (`decay` w istniejącym `DPH`), światła = bonus energii przy zmianie
  gatunku, gadżety = nowe opcje w kryzysach (butelka wódki!). Zużycie sprzętu →
  koszty serwisu w księgowości; stary sprzęt częściej się psuje (istniejący
  event `speaker` dostaje wagę zależną od stanu sprzętu).
- **DoD:** zakup w sklepie mierzalnie zmienia przebieg wesela.

### M5 — Szkolenia i umiejętności
- `data/trainings.ts`: drzewko (koszt + czas w tygodniach — szkolenie blokuje
  weekend, więc konkuruje z braniem zleceń: pierwsza prawdziwa decyzja
  strategiczna).
- Umiejętności odblokowują: nowe zabawy w fazie imprezy (nowe eventy podnoszące
  energię) i opcje w kryzysach (`requires.skill`).
- **Kondycja i głos wodzireja** — BIALE-PLAMY §2.9: dwa paski; wesela i fuchy
  je zużywają, odpoczynek (slot akcji) regeneruje; niska kondycja = wolniejszy
  bieg i słabsze skill-checki, stracony głos praktycznie uniemożliwia wesele.
  Koniec z darmowym overbookingiem.
- **DoD:** co najmniej 6 szkoleń, z czego 2 odblokowują opcje kryzysowe;
  granie co weekend bez odpoczynku ma odczuwalny koszt.

### M6 — Księgowość i podatki
- `economy.ts`: przychody, koszty stałe (leasing busa, ZUS 😉), amortyzacja,
  rozliczenie miesięczne; prosty wykres w `Accounting.tsx`.
- Bankructwo = koniec kariery (z opcją „nowa gra+" po zdobyciu tytułu).
- **DoD:** pieniądze domykają się księgowo; da się zbankrutować i to zobaczyć.

### M7 — Silnik kryzysów + język wypowiedzi (serce gry)
- Port `evPlan` → `crisisDirector` sterowany danymi; `radialMenu`; `speech.ts`
  z przełącznikiem PL/EN i chmurką z flagą.
- Implementacja dwóch wzorcowych kryzysów z §5 (wujek z eskalacją, awaria prądu
  z sekwencją świeczki→quiz), potem tort i spodnie jako czyste wpisy w `data/`.
- **Zabawy weselne jako mini-sekwencje** — BIALE-PLAMY §2.7: wybór z koła przy
  DJ-ce → zebranie chętnych (mechanika z bukietu) → skill-check (3 szablony:
  rytm / QTE / celowanie) → energia; cooldowny i „zużywanie się" zabaw; plan
  zabaw ustawiany przed weselem (FM-owy „skład").
- **DoD:** oba kryzysy grywalne we wszystkich wariantach rozwiązań; złe wyjście
  językowe faktycznie blokuje interakcję; min. 4 zabawy na 3 szablonach.

### M8 — Opinie, tytuły, Legenda
- Generator recenzji + ekran `Reviews.tsx` (profil ala Google Reviews),
  `titles.ts`, tiery reputacji, warunek Legendy; ekran końca kariery.
- **Recenzje przychodzą z opóźnieniem** (2–5 dni po weselu, do inboxa) —
  BIALE-PLAMY §2.8 — i zasilają word-of-mouth w lejku leadów z M3.
- **Publiczne odpowiedzi na recenzje** (dyplomatycznie / z humorem / pyskówka)
  — dobra odpowiedź neutralizuje niesprawiedliwą 1★ i buduje markę, pyskówka
  szkodzi; wpływ na reputację i dopływ leadów.
- Skryptowane **„wesele zerowe"** jako onboarding (§2.1 BIALE-PLAMY) — wymaga
  gotowych kryzysów i zabaw, stąd dopiero tutaj.
- **DoD:** po każdym weselu spływają w kolejnych dniach 3–6 spójnych
  z przebiegiem recenzji; odpowiedź gracza ma mierzalny skutek; tytuły wpadają
  zgodnie z regułami; Legenda osiągalna; nowy gracz przechodzi onboarding bez
  instrukcji zewnętrznej.

### M9 — Rywale (wersja lekka)
- 3–5 nazwanych rywali (BIALE-PLAMY §2.12) z reputacją liczoną tym samym kodem
  co gracza (dryf + kilka eventów, bez pełnej symulacji).
- Część ofert to **przetargi**: para porównuje stawkę i reputację dwóch
  wodzirejów; ranking regionalny jako stały cel pośredni w UI.
- **DoD:** można przegrać przetarg i widać dlaczego; ranking regionalny żyje.

Kolejność M3–M6 jest elastyczna (wszystkie wiszą na M2); M7 przed M8, bo
recenzje karmią się wynikami kryzysów; M9 po M8, bo przetargi używają
reputacji i lejka leadów.

---

## 9. Ryzyka i decyzje odroczone

- **Port M0 to największe pojedyncze ryzyko** (regresje przy porcie scen).
  Mitygacja: przenosić mechanicznie bez refaktorów, porównywać zachowanie z żywą
  grą reklamową (ona zostaje wzorcem — port to kopia) po każdym pliku;
  syntax-check jak dotąd + smoke-test Playwright (przeklikanie Setup do końca)
  w CI.
- **Gra reklamowa jest nietykalna** — Tycoon jej nie modyfikuje (§0), więc
  regresje w assecie marketingowym są niemożliwe z definicji.
- Odroczone decyzjami P1–P10 (2026-07-09): **ekipa i delegacja wesel** — po 1.0
  (P6; typy danych — `OwnedGear`, `WeddingContract`, staty postaci — projektować
  od razu tak, by NPC-pracownik się w nich zmieścił), **treść EN** — po M8 (P2),
  **rozbudowa syntezatora** (+2–3 patterny na gatunek) — po M7 (P8),
  **telemetria** — od pierwszego publicznego wydania (P9).
- Odroczone (świadomie poza zakresem): multiplayer/leaderboardy online (wymaga
  backendu — obecny hosting to statyki), zapis w chmurze, edytor własnych wesel.
