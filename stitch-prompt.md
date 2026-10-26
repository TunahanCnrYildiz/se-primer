# Stitch prompt'ları

Stitch'te **Mobile** modunu seç. Prompt'lar İngilizce yazıldı, çünkü Stitch İngilizce talimatı daha tutarlı uyguluyor. Ekrandaki tüm metinler ise Türkçe ve tırnak içinde verildi; Stitch bunları olduğu gibi kullanmalı.

**Önerilen sıra:**

1. **Temel prompt** ile Giriş ekranını üret.
2. Aynı projede **Sahne** prompt'unu ver. Stitch stili ilk ekrandan devralır.
3. **Son** prompt'unu ver.
4. Gerekirse en alttaki düzeltme prompt'larını kullan.
5. Ekranları ve tasarım kurallarını dışa aktar, `DESIGN.md`'yi güncelle.

Bir prompt'ta birden fazla şeyi değiştirmeye çalışma. Stitch tek ve net bir değişikliği daha iyi uygular.

---

## 1. Temel prompt + Giriş ekranı

```text
Design a mobile web app called "SE Primer": an interactive, book-like scenario game
that teaches software engineering decisions. The player is the on-call engineer of a
hospital appointment system that crashed at 08:00. All UI text is Turkish; use the
exact Turkish strings given in quotes.

Visual direction: "an illustrated primer opened during a night shift". Combine a
book feel (warm cream paper background #F7F4EE, serif headings like Source Serif 4,
small uppercase section labels) with an incident console (monospace time and log
lines like JetBrains Mono, deep navy cards #14213D, orange accents). Calm but tense;
no red alarm screens, no gamified badges, no emoji.

Colors: ink #14213D (text, primary button, dark cards), paper #F7F4EE (background),
card #FFFDF8 with 1px border #D9D3C7, muted text #5B6275, accent on light #A34E12,
accent on dark #F0A35A. Body font: Inter 16px. Corner radius 14px for cards,
12px for buttons. 20px side padding, width 390px. Touch targets at least 48px.

Screen 1 – Onboarding ("Giriş"):
- Small label "SE PRIMER", large serif title "Nöbetçi sensin."
- One sentence: "Bir sağlık sisteminde üç karar vereceksin. Her kararın teknik
  sonucunu göreceksin."
- Three question groups, each a label plus a vertical list of full-width selectable
  option cards (single choice per group):
  1. "Seviyen": "Yeni başladım" (subtext "Her kararda ipucu"),
     "Biraz deneyimliyim" (subtext "İpucu istersen"),
     "Deneyimliyim" (subtext "Karar başına 60 sn")
  2. "Rolün": "Backend geliştirici", "DevOps / SRE", "QA / Test"
  3. "Hedefin": "Mimariyi anlamak", "Test alışkanlığı", "Veri güvenliği / KVKK"
- Show "Yeni başladım", "Backend geliştirici" selected and the third group
  unanswered; a selected card has a 2px navy border and a check mark.
- Sticky bottom primary button "Başla" in a disabled state (40% opacity) with a
  small caption above it: "3 sorudan 2'si cevaplandı".
```

## 2. Sahne ekranı

```text
Using the same style, design Screen 2 – Scene ("Sahne"), the decision screen.

Top to bottom:
- Fixed top status bar (48px): left monospace clock "08:00", center progress
  "Karar 1 / 3" with three small dots (first filled), right a chat-bubble icon
  for the tutor.
- A thin countdown bar under the status bar with monospace "0:42" on the right
  (this only appears for experienced players; show it in this mockup).
- A navy crisis card: orange uppercase label "KARAR 1 · MİMARİ", then white text:
  "Dün geceki sürümden beri randevu servisi 500 dönüyor. 300 hasta bekliyor.
  Deploy logunda bir veritabanı migration'ı görüyorsun."
- A hint card: cream card with a 3px orange left stripe, label "İpucu", text:
  "Geri dönmeden önce veritabanı şemasının değişip değişmediğini nasıl anlarsın?"
- In the lower half (thumb zone), two full-width option cards, at least 64px tall,
  with a letter badge on the left:
  "A · Eski sürüme geri dön"
  "B · Canlıda yama yap"
  Do not color either option as right or wrong.

Also design two states of this screen as separate frames:
(a) Explanation sheet: after choosing A, a bottom sheet (top radius 20px) slides
    up over the dimmed scene with two headed sections:
    "Ne oldu" – "08:15 · Eski sürüm ayağa kalktı, randevular yeniden açılıyor."
    "Neden oldu" – "Geri dönüş, sorunun kaynağını canlıdan çıkarır. Ama dün gece
    şema değiştiyse eski kod yeni şemayla uyumsuz olabilir." with a small tag
    "Senin hedefin" next to the heading, then a primary button "Devam".
(b) Tutor sheet: a bottom chat panel covering 70% of the screen. Tutor bubbles on
    the left (cream), player bubbles on the right (navy). Player: "Hangisi doğru,
    sadece harfini söyle." Tutor: "Harfi söylersem bir sonraki krizde yine bana
    sorarsın. Şunu düşün: dün geceki sürümde veritabanına ne oldu?" Bottom: text
    input "Tutor'a sor…" and a quick button "İpucu iste".
```

## 3. Son ekranı

```text
Using the same style, design Screen 3 – Ending ("Son"), in two variants as
separate frames.

Variant A (good ending):
- A large card with light blue background #E3EEFA and dark blue text #1F4E8C,
  a shield icon, title "Son A · Sistem ayakta, veri güvende", monospace time
  "08:25", one sentence: "Sistemi 25 dakikada ayağa kaldırdın ve hasta verisini
  korudun."

Variant B (bad ending):
- Same card with light orange background #FBE6DA and dark brown text #8A3A10,
  a warning icon, title "Son B · Sistem ayakta ama KVKK ihlali var", time "08:25",
  sentence: "Sistem hızla ayağa kalktı, ama hasta adı loglarla ekibe yayıldı."
  The two variants must differ by icon and title, not only by color.

Below the card, on both variants:
- Heading "Kararların" and three summary rows, each with a small uppercase label,
  the chosen option, the time cost in monospace and one short reason:
  "MİMARİ · Eski sürüme geri döndün · +15 dk"
  "TEST · Önce kısa test koştun · +10 dk"
  "KVKK · Hasta adını maskeledin" (variant B: "KVKK · Logu olduğu gibi gönderdin")
- A reading suggestion card: label "Hedefine göre okuma", text "6698 sayılı KVKK,
  madde 12: veri güvenliğine ilişkin yükümlülükler."
- Bottom primary button "Yeniden oyna".
```

## 4. Düzeltme prompt'ları (gerekirse)

```text
Keep everything else the same. Make the two decision options larger and move them
lower so they sit in the bottom 45% of the screen.
```

```text
Keep everything else the same. Replace any red colors with the palette's orange
accent #A34E12; the app should never look like an alarm screen.
```

```text
Keep everything else the same. Make sure all Turkish characters (ç, ğ, ı, İ, ö, ş, ü)
render correctly and do not translate any of the quoted Turkish text.
```
