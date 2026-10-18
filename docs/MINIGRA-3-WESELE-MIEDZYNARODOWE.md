# Minigra 3 — „Wesele międzynarodowe PL/EN" (propozycja)

> Status: **koncepcja do akceptacji**. Nic z tego nie jest jeszcze zaimplementowane.
> Karta w menu już istnieje (`task3title` / `task3desc`, zablokowana 🔒) — ta minigra ją odblokowuje.

## 1. Pomysł w jednym zdaniu

Polka wychodzi za Brytyjczyka (lub odwrotnie): połowa sali to polska rodzina, połowa to goście z zagranicy,
a Karol z mikrofonem jest **mostem między dwiema kulturami**. Gracz prowadzi wieczór tak, żeby obie strony
wszystko rozumiały, bawiły się razem i nikt się nie nudził podczas tłumaczenia.

**Po co (marketing/SEO):** to najmocniejszy wyróżnik oferty — dwujęzyczny wodzirej. Wersja EN
(`index-en.html`) trafia dokładnie do grupy docelowej: obcokrajowców, którzy biorą ślub w Polsce i szukają
„English speaking wedding MC / DJ in Poland". Gra pokazuje im, *dlaczego* zwykły DJ z tłumaczem z Google
tego nie ogarnie.

## 2. Główna mechanika: dwa paski zamiast jednego

Minigra 2 miała jeden pasek energii. Tu są **dwie strony sali**:

| Strona | Pasek | Spada, gdy… |
|--------|-------|-------------|
| 🇵🇱 Rodzina (stoły po lewej) | **Zaangażowanie** | za długo mówisz po angielsku, nic się nie dzieje, tradycja pominięta |
| 🇬🇧 Goście z zagranicy (stoły po prawej) | **Zrozumienie** | zapowiedź tylko po polsku, tradycja bez wyjaśnienia, dosłowne tłumaczenie |

Nad nimi **Most** — wskaźnik integracji: rośnie, gdy obie strony robią coś *razem* (wspólny taniec,
wspólne „Sto lat", mieszane stoły na parkiecie). Most to główny mnożnik wyniku.
Kara za ignorowanie jednej strony jest asymetryczna i czytelna: chmurki „❓" nad Brytyjczykami,
„😴 / ziew" nad babcią.

## 3. Pętla rozgrywki

Karol chodzi po sali (sterowanie i kamera jak w minigrach 1–2). Trzy rodzaje akcji:

### A. Zapowiedź przy mikrofonie (rdzeń, ~60% czasu)
Przy statywie z mikrofonem pojawia się zapowiedź z harmonogramu (np. „Za chwilę oczepiny!").
Otwiera się modal (wzorzec `modalObjs` / `closeModal()` jak w `openManagerModal`):

1. **Wybór tłumaczenia** — 3 karty. Jedna dosłowna i śmieszna, jedna poprawna gramatycznie ale
   „drewniana", jedna **wodzirejska** (kulturowo trafna). Przykłady:
   - „Gorzko, gorzko!" → ❌ *„Bitter, bitter!"* · 😐 *„Please kiss now."* · ✅ *„In Poland, when the vodka tastes bitter, only a kiss can sweeten it — so let's shout GORZKO!"*
   - „Oczepiny" → ❌ *„The un-capping"* · 😐 *„Veil ceremony"* · ✅ *„Oczepiny — the moment the bride becomes a wife, with games for everyone"*
   - „Sto lat" → ❌ *„One hundred years"* · ✅ *„Our birthday-and-everything song — wishing them 100 years together. Sing along: Sto lat, sto lat!"*
2. **Kolejność i długość** — krótki suwak „PL ↔ EN": za długo po angielsku = polska strona traci,
   tylko po polsku = angielska strona traci. Idealnie: krótko w obu językach.
3. **Timing** — nie można zostawić „martwej ciszy": zapowiedź ma licznik; spóźnienie obniża oba paski.

Kluczowe dla i18n: karty mają **tekst w języku docelowym + mały dopisek w języku interfejsu**
(np. w wersji PL pod angielską kartą widać „(dosłownie: gorzki, gorzki)"). Dzięki temu gra jest grywalna
dla Polaka słabo znającego angielski i dla Anglika nieznającego polskiego — wybór dotyczy *kultury*,
nie znajomości gramatyki.

### B. Krążenie po sali (side-taski, jak NPC w minigrze 1)
Zdarzenia pojawiają się nad stołami, Karol podchodzi i wciska Akcję:
- **Zdezorientowany gość** 🇬🇧 „Why is everyone shouting?" → krótkie wyjaśnienie, gość dołącza do „Gorzko!".
- **Wujek z wódką** 🇵🇱 częstuje Anglika trzecią kolejką → Karol podsuwa zakąskę/wodę (humor, bez moralizowania).
- **Babcia chce dedykację** po polsku, a **świadek** chce piosenkę z UK → zagraj jedną, zapowiedz drugą
  „za chwilę" (obietnica musi zostać spełniona w ciągu X sekund).
- **Mieszany stolik** — posadź/przyprowadź gości z dwóch stron na parkiet razem → duży bonus do Mostu.

### C. Momenty specjalne (QTE, wyzwalane fazą wieczoru)
- **Tłumaczenie przemowy świadka (Best Man Speech)** — świadek mówi dowcipy po angielsku w dymkach,
  gracz na bieżąco wybiera, jak przekazać puentę po polsku (3 opcje, krótki limit czasu). Dosłownie =
  cisza na polskiej stronie; trafnie = śmiech obu stron. To „boss" minigry.
- **„Gorzko!" w rytmie** — sala skanduje, gracz trzyma rytm (Spacja w takt), Anglicy dołączają tylko
  jeśli wcześniej wyjaśniono zwyczaj.
- **Pociąg / „Jedzie pociąg z daleka"** — reuse węża conga z minigry 2: wagony dołączają naprzemiennie
  z obu stron sali; tylko pociąg mieszany daje pełne punkty.

## 4. Harmonogram wieczoru (fazy, jak `this.DPH` w `Dance`)

| # | Faza | Co jest wyzwaniem |
|---|------|-------------------|
| 0 | Powitanie chlebem i solą 🍞 | Wyjaśnij zwyczaj gościom z UK zanim para wejdzie |
| 1 | Toast i „Sto lat" 🥂 | Zapowiedź dwujęzyczna; obie strony mają zaśpiewać |
| 2 | Pierwszy taniec 💑 | Krótka, elegancka zapowiedź — nie przegadaj |
| 3 | Best Man Speech 🎤 | Boss: tłumaczenie dowcipów na żywo |
| 4 | Oczepiny 💐 | Wyjaśnij zabawy; gry muszą łączyć obie strony |
| 5 | Impreza 🎉 | Side-taski, dedykacje z obu krajów, pociąg |
| 6 | Tort i podziękowania 🎂 | Finał: podziękowania rodzicom w obu językach |

Całość ~3 minuty, jak minigra 2.

## 5. Wynik i ekran końcowy

- Gwiazdki za: średnie Zrozumienie, średnie Zaangażowanie, poziom Mostu, liczba „trafnych" tłumaczeń.
- Tytuły zależne od wyniku, np. „Most między narodami" / „Google Translate z mikrofonem" (śmieszna porażka).
- CTA dopasowane do minigry:
  PL: „Wesele z gośćmi z zagranicy? Karol poprowadzi je płynnie po polsku i angielsku →"
  EN: „Marrying in Poland with guests from abroad? Karol hosts fluently in English and Polish →"

## 6. Wdrożenie techniczne (szacunek)

- Nowa scena `Intl` (po `Dance`, przed `Result`), w `Hub` karta 3 `on:true`, w HTML `task-card active`.
- Reuse: `drawPalaceRoom`, sprzęt ze sceny `Dance` (już rozstawiony), postacie gości, sterowanie,
  `getContext()`-podobny system akcji, wzorzec modali, conga.
- Nowe tekstury proceduralne w `genAssets`: statyw z mikrofonem, małe flagi PL/UK nad stołami,
  świadek w garniturze (nowy config w `chars`), chleb i sól, tort.
- Audio: nowy mood (np. `'intl'`) + krótki motyw „Sto lat" w sekwencerze; reuse istniejących `sfx`.
- i18n: wszystkie teksty do `I18N.pl` i `I18N.en` (karty tłumaczeń jako pary `{target, gloss}`),
  potem regeneracja `index-en.html`. Szacunkowo **+700–900 linii** w `index.html`.
- Zmiana nie dotyka `tycoon/`.

Proponowane etapy (każdy jako osobny PR, testowany na Pages):
1. Szkielet sceny + dwa paski + fazy + odblokowana karta w menu.
2. Modal zapowiedzi (karty tłumaczeń + suwak PL↔EN + timing).
3. Side-taski przy stołach + Most.
4. Best Man Speech + „Gorzko!" w rytmie + pociąg.
5. Ekran wyniku, CTA, balans trudności, szlif grafiki/audio.

## 7. Otwarte pytania do decyzji

1. **Narodowość drugiej strony** — Brytyjczycy (najprostsze, najszerszy rynek) czy rotacja
   UK / Irlandia / USA / Niemcy przy każdym podejściu?
2. **Prawdziwe teksty Karola** — czy użyć jego autentycznych formułek zapowiedzi (lepszy marketing)?
3. **Wódka i humor alkoholowy** — zostawić lekkie żarty z „trzecią kolejką", czy całkiem wyciąć?
4. **Długość** — trzymać ~3 min jak minigra 2, czy dać krótszą (~2 min) bo modale są wolniejsze?

## 8. Alternatywy (gdyby ten kierunek nie pasował)

- **„Kryzys na sali"** — wieczór pełen awarii (prąd, spóźniony zespół, deszcz przy plenerze) — pokazuje
  profesjonalizm, ale nie wykorzystuje przygotowanej karty PL/EN.
- **„Spotkanie z parą"** — rozmowa przed weselem, układanie scenariusza i playlisty pod parę — bardziej
  sprzedażowa, mniej zręcznościowa.
