# Przegląd krytyczny gry — płynność, czytelność, estetyka (2026-10-19)

Podstawa: zrzuty ekranu wszystkich trzech minigier (desktop 1280×720, telefon poziomo 844×390,
telefon pionowo 390×844) i przegląd kodu `index.html`. Priorytety: **P0** = szybkie, duży efekt;
**P1** = średni nakład, wyraźna poprawa; **P2** = większe projekty.

## Najważniejsze w skrócie

1. **Brak „pierwszych 10 sekund"** — gracz ląduje w sali bez wskazania, dokąd iść. Brakuje strzałki/ścieżki do celu i krótkiego wprowadzenia.
2. **Pusta, statyczna sala** — w minigrach 2–3 goście stoją „w próżni": nie ma stołów, krzeseł, stołu Pary Młodej, kwiatów. To największy pojedynczy zysk wizualny.
3. **Telefon w pionie** — gra zajmuje pasek ~1/4 ekranu, reszta jest czarna; podpowiedź „obróć telefon" znika po 8 s.
4. **Drobne, ciasne HUD-y** — etykiety 11–12 px, na telefonie praktycznie nieczytelne.
5. **Brak ciągłości między minigrami** — po wyniku jest tylko „Powtórz" i „Menu" (przeładowanie strony). Nie ma „Następna minigra →", a najlepsze wyniki znikają po odświeżeniu.

## Czytelność i prowadzenie gracza

| # | Problem | Propozycja | Prio |
|---|---------|-----------|------|
| 1 | Start minigry 1: Karol stoi daleko od busa, cel widoczny tylko jako napis. | Pulsująca strzałka/ścieżka z kropek do aktualnego celu (wszystkie 3 minigry; cel = to, co już zwraca `getContext`/faza). | P0 |
| 2 | Brak instrukcji przed startem — zasady poznaje się metodą prób. | Karta „Jak grać" (3 obrazki + 1 zdanie każdy) przed pierwszym uruchomieniem minigry; zapamiętana w `localStorage`. | P0 |
| 3 | Wynik w gwiazdkach bez wyjaśnienia, za co są. | Na ekranie wyniku: 3 wiersze kryteriów (✓/✗) zamiast samego „★★☆". | P1 |
| 4 | Komunikaty (`flashTip`) nadpisują się nawzajem i znikają po 1,6 s. | Kolejka komunikatów + ważne zdarzenia jako ikona przy krawędzi ekranu wskazująca kierunek. | P1 |
| 5 | Sygnały oparte tylko na kolorze (czerwony/zielony pasek). | Dodać ikony/kształt (np. ⚠ przy niskim pasku) — dostępność dla daltonistów. | P2 |

## Estetyka i spójność wizualna

| # | Problem | Propozycja | Prio |
|---|---------|-----------|------|
| 6 | Sala jest pusta: brak stołów, krzeseł, dekoracji; goście stoją na gołym parkiecie. | Proceduralne okrągłe stoły z obrusem i kwiatami, stół Pary Młodej pod ścianą, girlandy/świece; goście przy stołach, a nie w kępkach. | P1 |
| 7 | Modal przebierania: podtytuł zasłonięty kafelkami, ikony ubrań wychodzą poza kafelki, manekin w innej skali niż reszta grafiki. | Poprawić układ (podtytuł nad siatką, ikony wyśrodkowane w kafelkach, mniejszy manekin). | P0 |
| 8 | Okienka (menedżer, konsola DJ, zapowiedź) mają dużo pustego miejsca u dołu. | Dopasować wysokość paneli do treści. | P0 |
| 9 | Ekran wyniku: postać Karola zasłania środkową gwiazdkę. | Przesunąć Karola niżej/na bok. | P0 |
| 10 | Neon „WODZIREJ KAROL" krzywo nachodzi na obraz i kinkiet — słabo czytelny. | Przenieść na wolny odcinek ściany albo jako podświetlany szyld nad konsolą DJ. | P0 |
| 11 | Emoji (🎤🥂🙋, flagi) wyglądają różnie na każdym systemie i nie pasują do pixel-artu. | Zastąpić najczęstsze emoji małymi ikonami pixel-art z `genAssets`. | P1 |
| 12 | Czcionka „Segoe UI" istnieje tylko na Windows — na Androidzie/Macu wygląda inaczej. | Jedna czcionka webowa (np. Orbitron do nagłówków, już ładowany, + jedna czytelna do tekstów). | P1 |
| 13 | Napisy HUD 11–12 px. | Minimum 14 px; mniej elementów naraz na pasku górnym. | P0 |

## Płynność i technika

| # | Problem | Propozycja | Prio |
|---|---------|-----------|------|
| 14 | Muzyka sekwencerem na `setInterval` — przy obciążeniu słychać „rwanie" rytmu. | Planowanie z wyprzedzeniem (lookahead scheduler) na zegarze `AudioContext`. | P1 |
| 15 | Muzyka gra dalej po przełączeniu karty (gra stoi). | Pauza audio przy `visibilitychange`. | P0 |
| 16 | Brak pauzy w grze. | Przycisk ⏸ obok 🔊 (zatrzymuje zegar, muzykę, otwiera menu pauzy). | P1 |
| 17 | „Menu" przeładowuje stronę; rekordy giną po odświeżeniu. | Powrót do menu bez przeładowania; rekordy i gwiazdki w `localStorage`. | P1 |
| 18 | Telefon pionowo: gra w małym pasku. | Pełnoekranowa nakładka „obróć telefon" (bez auto-znikania) + próba `screen.orientation.lock` po wejściu w fullscreen. | P0 |
| 19 | Trzy minigry duplikują HUD, sterowanie i oś czasu (minigra 3 pożycza metody z 2). | Wspólna klasa bazowa sceny — spójne zachowanie i łatwiejsze poprawki. | P2 |
| 20 | Martwy kod sceny `Hub`. | Usunąć. | P2 |

## Atrakcyjność i marketing

| # | Problem | Propozycja | Prio |
|---|---------|-----------|------|
| 21 | Po wyniku brak przejścia dalej. | Przycisk „Następna minigra →" (1→2→3) i podsumowanie „Cały wieczór" po trzeciej. | P0 |
| 22 | Menu nie pokazuje, czym różnią się gry; podtytuł „Profesjonalna logistyka wesela" pasuje tylko do minigry 1. | Miniatury/ikony na kartach, czas gry (~3 min), zdobyte gwiazdki; nowy podtytuł o całym wieczorze. | P1 |
| 23 | SEO: opis i dane strukturalne mówią tylko o rozstawianiu sprzętu. | Uzupełnić `meta description`, `og:*` i `ld+json` o parkiet i wesele międzynarodowe (EN: „English-speaking wedding MC in Poland"). | P0 |
| 24 | Brak udostępniania wyniku. | „Udostępnij wynik" (Web Share API / kopiuj link) — darmowy zasięg. | P1 |
| 25 | Syntetyczna muzyka brzmi „chiptune'owo" i cienko. | Wygenerowane pętle (np. ACE-Step przez ComfyUI — licencja Apache 2.0) jako pliki OGG ładowane leniwie po starcie gry; synteza zostaje jako zapas. Wymaga konektora ComfyUI MCP. | P2 |

## Proponowana kolejność

1. **Pakiet P0 (jeden PR):** strzałka do celu, karta „Jak grać", poprawki modali i ekranu wyniku, neon, większe napisy HUD, pauza audio w tle, nakładka „obróć telefon", „Następna minigra →", SEO.
2. **Wystrój sali** (stoły, stół Pary Młodej, dekoracje) + ikony pixel-art zamiast emoji.
3. **Pauza, rekordy w `localStorage`, lepszy sekwencer muzyki, nowa czcionka.**
4. **Muzyka z ComfyUI** po podłączeniu konektora.
