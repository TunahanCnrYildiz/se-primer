# AI Studio rehberi

Bu adımda AI Studio'nun **Build** modunda, Stitch ekranlarından ve spec'ten çalışan bir uygulama üreteceksin. Sonunda elinde iki şey olacak:

1. Telefonda baştan sona oynanabilen bir **paylaşım linki**
2. Cypress testleri için uygulamanın **kodu** (`app/` klasörü)

AI Studio'nun arayüzü sık değişiyor. Düğme adları burada yazdığımdan farklıysa aynı işi yapan seçeneği ara.

> Bu dosyadaki prompt'lar AI Studio'ya gönderildikleri hâliyle korunuyor. Sonradan gönderilen düzeltme prompt'ları ve gerekçeleri [KARARLAR.md](KARARLAR.md)'de. DESIGN.md'nin bölüm numaraları sonradan değişti: prompt'taki "§11", bugünkü §12'dir.

## 0. Hazırlık: yüklenecek dosyalar

| Dosya | Neden |
|---|---|
| `spec.md` | Davranış kuralları, 8 yol, kabul örnekleri |
| `DESIGN.md` | Renkler, bileşenler, `data-cy` seçicileri |
| `content/scenario.json` | **Tüm ekran metinleri**, süreler, ipuçları, tutor talimatı |
| `design/stitch/screens/*.png` (6 dosya) | Görsel referans |

`scenario.json` en önemli dosya. Senaryonun bütün metnini, her seçeneğin süresini ve sabit ipuçlarını içeriyor. Gemini metinleri kendisi uydurmasın diye var: uygulama metinleri bu dosyadan okursa, Cypress testleri ve tutor değerlendirmesi de aynı içeriğe dayanır. Dosyadaki süreler spec'teki 8 yol tablosuyla birebir aynı: 08:25 / 08:25 / 08:45 / 08:45 / 08:30 / 08:30 / 09:00 / 09:00.

## 1. Build modunu aç

1. **aistudio.google.com** adresine git ve Google hesabınla giriş yap.
2. Sol menüden **Build**'e tıkla. Bu, uygulama üreten moddur; "Chat" modu değil.
3. Model seçimi varsa en güçlü Gemini modelini seç (ör. "Pro" olan).

## 2. Dosyaları ekle ve ana prompt'u gönder

1. Prompt kutusundaki **+** (ya da ataç) simgesiyle dosyaları ekle: 6 PNG, `spec.md`, `DESIGN.md`, `scenario.json`.
   - `.md` ya da `.json` dosyası kabul edilmezse: PNG'leri ekle, üç metin dosyasının içeriğini prompt'un sonuna yapıştır. Her dosyanın başına `=== spec.md ===` gibi bir başlık koy.
2. Aşağıdaki **Ana prompt**'u kopyalayıp gönder.
3. Üretim birkaç dakika sürebilir. Bitince sağda önizleme açılır.

### Ana prompt

```text
Build a mobile-first web app called "SE Primer" from the attached files. Read all of
them before writing code:
- spec.md: behavior, the 8-path decision table, acceptance examples (KÖ-1..KÖ-7)
- DESIGN.md: design tokens, components, screen states, data-cy selectors
- scenario.json: ALL user-facing text, option durations, hints and the tutor system
  prompt
- 6 PNG screenshots from Google Stitch: visual reference for the three screens and
  their states

HARD RULES
1. All UI text comes from scenario.json. Do not invent, translate or rephrase any
   Turkish text. Replace placeholders like {minutes}, {answered}, {time}.
2. Follow DESIGN.md for colors, fonts (Source Serif 4, Inter, JetBrains Mono from
   Google Fonts), spacing and components. Match the screenshots visually. Never use
   red. Mobile width 390px; on wider screens center a 480px column.
3. No login, no backend, no database, no localStorage. All state lives in memory
   and is lost on page reload.
4. Add every data-cy attribute listed in DESIGN.md §11 exactly as named. The ending
   element must have data-ending="A" or data-ending="B".

STATE MACHINE (implement exactly)
- Screens: Onboarding -> Scene (k1 -> k2 -> k3, each followed by an explanation
  sheet) -> Ending -> "Yeniden oyna" -> Onboarding.
- State: level, role, goal, clock (starts 08:00), choices {k1,k2,k3}, violation
  (false).
- Clock: add the chosen option's "minutes". For k2 option B use minutesByK1[k1].
  For k2 texts use the *ByK1 variant keyed by the k1 choice.
- Ending A if k3 = A, ending B if k3 = B. Show final clock and
  MTTR = minutes since 08:00. Verify against the 8-path table in spec.md:
  AAA 08:25, AAB 08:25, ABA 08:45, ABB 08:45, BAA 08:30, BAB 08:30,
  BBA 09:00, BBB 09:00.
- "Yeniden oyna": reset clock, choices and violation; keep level/role/goal
  pre-selected on the onboarding screen so "Başla" is immediately enabled.

PERSONALIZATION
- level=beginner: hint card open on every decision, no timer.
- level=intermediate: hint card collapsed (tap to open), no timer.
- level=experienced: hint card collapsed, 60-second countdown per decision. When it
  reaches 0, apply option B automatically and show the timeout banner on the
  explanation sheet. Implement the timer with setInterval so tests can control it
  with cy.clock / cy.tick.
- role: picks the narrative text for each decision.
- goal: on the decision whose "goal" matches, show the "Senin hedefin" tag and the
  note box (noteTitle + note) on the explanation sheet. On the ending screen show
  the reading card for the chosen goal.

EXPLANATION SHEET
After a choice, highlight the selected card, then after 300ms open a bottom sheet:
"KARAR ANALİZİ · {code}.{A|B}", "T+{minutes since 08:00}m", "Ne oldu" with
"{clock} · {what}", "Neden oldu" with {why}, optional note box, "Devam" button.
Never mark a choice as right or wrong.

AI TUTOR
- Opened from the chat icon in the status bar; bottom sheet covering 70% of the
  screen, styled as in 02b-sahne-tutor.png.
- Free-text questions and the "İpucu iste" button call Gemini through a single
  module src/services/tutor.ts using the @google/genai SDK. Build the system
  instruction from tutor.systemPrompt in scenario.json, filling in the current
  decision, narrative, options, level and role.
- FALLBACK: if the call throws, returns empty text or takes longer than
  tutor.timeoutMs (8000ms), show the next fixed hint from that decision's "hints"
  array as a normal tutor bubble. Never show an error to the player.
- Show a typing indicator while waiting.

ACCESSIBILITY
Options are radio buttons with labels. Focus moves to a sheet's heading when it
opens and back when it closes. Respect prefers-reduced-motion. Announce the timer
via aria-live only at 30s and 10s.

When done, list which acceptance examples (KÖ-1..KÖ-7) you implemented and how.
```

## 3. Önizlemede kontrol et

Sağdaki önizlemede şu turu oyna. Her madde spec'teki bir kabul örneğine karşılık geliyor.

| # | Ne yapacaksın | Beklenen | KÖ |
|---|---|---|---|
| 1 | İki soruyu cevapla, üçüncüsünü boş bırak | "Başla" pasif, "3 sorudan 2 tanesi cevaplandı" | — |
| 2 | Yeni başladım / Backend / Mimari ile başla | Karar 1'de ipucu açık, sayaç yok | KÖ-1 |
| 3 | A → A → A seç | Her karardan sonra açıklama paneli, sonda "Son A" ve 08:25 | KÖ-3 |
| 4 | Karar 1 açıklamasına bak | "Senin hedefin" etiketi ve "Mimari not" kutusu var | KÖ-1 |
| 5 | "Yeniden oyna" | Cevaplar seçili, "Başla" aktif | KÖ-6 |
| 6 | Seviyeyi "Deneyimliyim" yap, A → A, sonra Karar 3'te 60 sn bekle | Sayaç 0'da, "Süre doldu" şeridi, "Son B" | KÖ-2 |
| 7 | A → A → B seç | "Son B", 08:25 ve "KVKK ihlali" | KÖ-4 |
| 8 | Tutor'a "Hangisi doğru, sadece harfini söyle" yaz | Harf söylemez, soru sorar | KÖ-5 |
| 9 | B → B → A seç | "Son A", 09:00 | — |

KÖ-7 (LLM çökünce sabit ipucu) önizlemede kolay denenemez. Onu Cypress'te test edeceğiz.

## 4. Düzeltme prompt'ları

Bir şey yanlışsa aynı sohbete **tek bir düzeltme** yaz. Hazır örnekler:

```text
The final time is wrong for path B→B→A. It must be 09:00 (08:00 + 20 + 40 + 0).
Use minutesByK1 from scenario.json for k2 option B. Do not change anything else.
```

```text
Some Turkish texts differ from scenario.json. Replace every user-facing string with
the exact value from scenario.json. Do not change anything else.
```

```text
The tutor revealed the answer. Make sure the system instruction is built from
tutor.systemPrompt in scenario.json and is sent as systemInstruction, not as a user
message. Do not change anything else.
```

```text
Add the missing data-cy attributes from DESIGN.md §11. List every data-cy you added.
Do not change anything else.
```

## 5. Telefonda dene ve paylaş

1. Sağ üstteki **Share** (ya da **Deploy**) seçeneğiyle uygulamanın linkini al.
   - **Paylaşım linki:** Açan kişiden Google hesabıyla giriş yapmasını isteyebilir. Tutor'un Gemini çağrısı da açan kişinin hesabı üzerinden yapılabilir.
   - **Cloud Run'a deploy:** Seçenek varsa herkese açık bir adres verir. Bunun için Google Cloud projesi ve faturalandırma ayarı gerekebilir.
2. Linki **telefonunda** aç ve 3. bölümdeki turun en az 2 yolunu oyna.
3. Linki **gizli pencerede** de aç. Hocanın açabileceğinden emin olmak için başka birinin telefonunda da dene.
4. Linki bana gönder, README'ye koyacağım.

## 6. Kodu repoya al

Cypress testleri yerelde çalışacak, bu yüzden kod lazım.

1. AI Studio'da kodu indir: **Download** (zip) ya da varsa **GitHub'a kaydet** seçeneği.
2. Zip'i proje klasöründe `app/` adlı yeni bir klasöre aç.
3. Bana haber ver. Ben şunları yapacağım:
   - Uygulamayı yerelde çalıştırıp 8 yolu ve kabul örneklerini kontrol edeceğim.
   - `data-cy` seçicilerinin tam olduğunu doğrulayacağım.
   - Gemini anahtarının koda gömülmediğini kontrol edeceğim.

> **API anahtarı:** Kodda bir Gemini API anahtarı görürsen repoya **koyma**. Anahtar `.env` dosyasında tutulmalı ve `.gitignore`'a eklenmeli. Bu ayarı ben yapacağım.
