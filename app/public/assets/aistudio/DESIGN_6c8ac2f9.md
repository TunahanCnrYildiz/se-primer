# SE Primer — Tasarım

> Sürüm: 0.2 · Tarih: 26 Ekim 2026 · Kaynak: [spec.md](spec.md)
>
> Bu dosya Stitch'te üretilen ekranlarla **birleştirilmiş** tasarım kuralıdır. AI Studio'ya bu dosya verilir. Kaynak ile bu dosya çelişirse bu dosya geçerlidir.
>
> - Stitch projesi: https://stitch.withgoogle.com/projects/5913609131973401802
> - Ekran görüntüleri: [design/stitch/screens/](design/stitch/screens/)
> - Stitch'in HTML çıktısı: [design/stitch/code/](design/stitch/code/) (ekran başına bir klasör)
> - Stitch'in ham tasarım sistemi: [design/stitch/code/design-system/DESIGN.md](design/stitch/code/design-system/DESIGN.md)
> - Stitch'e verilen prompt'lar: [stitch-prompt.md](stitch-prompt.md)

| Ekran | Görüntü | HTML |
|---|---|---|
| Giriş | [01-giris.png](design/stitch/screens/01-giris.png) | [01-giris/code.html](design/stitch/code/01-giris/code.html) |
| Sahne · karar | [02-sahne.png](design/stitch/screens/02-sahne.png) | [02-sahne/code.html](design/stitch/code/02-sahne/code.html) |
| Sahne · açıklama paneli | [02a-sahne-aciklama.png](design/stitch/screens/02a-sahne-aciklama.png) | [02a-sahne-aciklama/code.html](design/stitch/code/02a-sahne-aciklama/code.html) |
| Sahne · tutor paneli | [02b-sahne-tutor.png](design/stitch/screens/02b-sahne-tutor.png) | [02b-sahne-tutor/code.html](design/stitch/code/02b-sahne-tutor/code.html) |
| Son A | [03-son-a.png](design/stitch/screens/03-son-a.png) | [03-son-a/code.html](design/stitch/code/03-son-a/code.html) |
| Son B | [03-son-b.png](design/stitch/screens/03-son-b.png) | [03-son-b/code.html](design/stitch/code/03-son-b/code.html) |

## 1. Tasarım yönü

**"Gece nöbetinde açılan resimli kitap."** Uygulama iki dili birleştirir:

- **Kitap yüzeyi:** Krem kâğıt zemin, serif başlıklar, sakin anlatım. Senaryo metni ve açıklamalar bu dille yazılır.
- **Konsol yüzeyi:** Lacivert kartlar, monospace saat ve log satırları, büyük harfli etiketler, turuncu vurgular. Saat, metrik ve durum bilgileri bu dille gösterilir.

Ton sakin ama gergin olmalı. Kırmızı alarm ekranları, yanıp sönen öğeler, rozet ve puan gibi oyunsu öğeler kullanılmaz. Gerilimi saat ve metin taşır.

**Temel ilkeler**

1. **Tek ekran, tek karar.** Ekranda aynı anda tek bir soru bulunur. Seçenekler başparmakla erişilen alt yarıdadır.
2. **Sonuç her zaman açıklanır.** Hiçbir seçim "doğru / yanlış" rozetiyle bitmez. Her seçimden sonra "Ne oldu / Neden oldu" gösterilir.
3. **Tutor bir arkadaş, cevap anahtarı değil.** Tutor sohbet balonlarıyla konuşur ve görsel olarak karar kartlarından ayrıdır.

## 2. Renkler

| Token | Değer | Kullanım |
|---|---|---|
| `--ink` | `#14213D` | Ana metin, konsol kartı zemini, birincil buton, oyuncu balonu |
| `--paper` | `#F7F4EE` | Sayfa zemini |
| `--card` | `#FFFDF8` | Seçenek kartı, panel, tutor balonu |
| `--card-sunk` | `#F2EEE6` | Kart içindeki gömük kutu: "Neden oldu", okuma önerisi |
| `--line` | `#D9D3C7` | Kart kenarı, ayırıcı |
| `--muted` | `#5B6275` | İkincil metin, zaman damgası |
| `--accent` | `#A34E12` | Açık zeminde etiket, vurgu metni, ipucu şeridi |
| `--accent-soft` | `#F0A35A` | Koyu zeminde etiket ve vurgu |
| `--good-bg` / `--good-ink` | `#D9E2FF` / `#1F4E8C` | Son A kartı (Stitch: `primary-fixed`) |
| `--bad-bg` / `--bad-ink` | `#FFDBC9` / `#8A3A10` | Son B kartı (Stitch: `secondary-fixed`) |
| `--bad-tint` | `#FDEEE6` | Son B'de ihlale yol açan karar satırı |

**Kontrast** (WCAG AA, normal metin için ≥ 4.5:1):

- `--ink` / `--paper` ≈ 15:1
- `--accent` / `--paper` ≈ 5.2:1
- `--accent-soft` / `--ink` ≈ 7.6:1

**Kurallar**

- **Kırmızı yoktur.** Stitch'in token listesinde Material'dan gelen `error: #ba1a1a` rengi var. Ekranlarda kullanılmıyor ve kullanılmayacak. Uyarı ve ihlal durumları `--accent` ve `--bad-*` ile gösterilir.
- Açık zeminde turuncu metin için yalnızca `--accent` kullanılır. `--accent-soft` krem zeminde okunmaz.
- İyi ve kötü son, renk dışında **ikon ve başlık metniyle** de ayrılır.
- Tek tema (açık) vardır, karanlık mod kapsam dışıdır.

**Stitch token eşlemesi.** Stitch'in dosyasındaki Material token'ları bazı yerlerde yazılı açıklamasıyla çelişiyor. Örneğin token'larda `primary: #000a24` var, açıklamada `#14213D`. Ekranlarda görünen değerler esas alındı:

| Stitch token | Bu dosyada |
|---|---|
| `primary-container` `#14213D` | `--ink` |
| `secondary` `#994709`, açıklamada `#A34E12` | `--accent` = `#A34E12` |
| Açıklamadaki tertiary `#F0A35A` | `--accent-soft` |
| `background` `#fcf9f3`, açıklamada `#F7F4EE` | `--paper` = `#F7F4EE` |

## 3. Tipografi

| Rol | Yazı tipi | Boyut / satır | Ağırlık | Nerede |
|---|---|---|---|---|
| Ekran başlığı | Source Serif 4 | 28 / 34 px | 600 | "Nöbetçi sensin.", son başlığı |
| Anlatı | Source Serif 4 | 20 / 30 px | 400 | Konsol kartındaki sahne metni |
| Bölüm başlığı | Source Serif 4 | 20 / 28 px | 500 | "Ne oldu", "Neden oldu", "Kararların" |
| Gövde | Inter | 16 / 24 px | 400 | Açıklamalar, tutor balonları |
| Seçenek / satır başlığı | Inter | 16 / 24 px | 500 | Seçenek kartı, karar özet satırı |
| Etiket | JetBrains Mono | 11 / 16 px, büyük harf, +0.08em | 500 | "KARAR 1 · MİMARİ", "SEVİYEN", durum etiketleri |
| Saat, metrik, log | JetBrains Mono | 13–15 / 20 px | 500 | "08:15", "+15 dk", log satırı, sayaç |

- Etiketler Stitch'in ekranlarındaki gibi **JetBrains Mono**'dur. Taslak 0.1'de Inter yazıyordu, ekranlara göre düzeltildi.
- Karar özet satırlarının başlıkları **Inter** ile yazılır. Stitch'te Son A'da Inter, Son B'de serif çıkmıştı. İki son aynı kuralı izler.
- Yazı tipleri Türkçe karakterleri (ç, ğ, ı, İ, ö, ş, ü) desteklemelidir. Büyük harfe çevirmede `lang="tr"` kullanılır. "BEKLENİYOR", "KIDEMLİ" gibi etiketler noktalı İ ile yazılır.

## 4. Yerleşim ve ölçüler

- **Tasarım genişliği:** 390 px. En dar destek 360 px, yatay kaydırma olmaz. Geniş ekranda içerik 480 px'lik bir sütunda ortalanır. Stitch'in tasarım sistemindeki masaüstü ve tablet ızgaraları kapsam dışıdır.
- **Kenar boşluğu:** 20 px. Kart iç boşluğu 20 px. Ara boşluk ölçeği: 4 · 8 · 12 · 16 · 24 · 32.
- **Köşe yarıçapı:**
  - Kart 14 px, buton ve giriş kutusu 12 px
  - Alt panelin üst köşeleri 20 px
  - Rozet ve etiket 6 px, durum noktası tam yuvarlak
- **Dokunma hedefi:** En az 48 × 48 px. Seçenek kartları tam genişliktedir ve en az 64 px yüksekliğindedir.
- **Başparmak bölgesi:** Karar seçenekleri ve birincil buton ekranın alt yarısındadır.
- **Güvenli alan:** Alt eylemler `env(safe-area-inset-bottom)` kadar yukarıda durur.

## 5. Derinlik

Stitch'in yazılı açıklaması "gölge ve bulanıklık yok" diyor, ama ürettiği ekranlarda ikisi de var. Ekranlar esas alındı:

| Seviye | Öğe | Görünüm |
|---|---|---|
| 0 | Sayfa | `--paper` |
| 1 | Kart | `--card` + 1 px `--line` kenar + çok hafif gölge (`0 1px 2px rgb(20 33 61 / .06)`) |
| 1 | Konsol kartı | `--ink`, kenar yok |
| 2 | Alt panel | `--card` + belirgin gölge (`0 -8px 32px rgb(20 33 61 / .18)`) |
| — | Panel arkası | Arkadaki sahne `--ink` %40 ile karartılır ve 2 px bulanıklaştırılır |

Panel arkasında **o anki sahnenin kendisi** görünür. Stitch çıktısında arkada ilgisiz içerik vardı (ör. `orders_shard_03` logu); uygulamada bu olmaz.

## 6. Bileşenler

### Ortak

| Bileşen | Tanım |
|---|---|
| **Durum çubuğu** | Üstte, 48 px. Solda turuncu nokta ve monospace saat ("08:00"). Ortada "KARAR 1 / 3" ve altında üç ilerleme noktası (geçilenler `--ink`, kalanlar `--line`). Sağda kare çerçeveli sohbet ikonu (tutor). |
| **Durum etiketi** | Köşeli parantezli monospace etiket: "[ SEÇİLDİ ]", "[ BEKLENİYOR ]", "[ TAMAMLANDI ]", "[ İHLAL TESPİT EDİLDİ ]". Bekleyen ve ihlal durumları `--accent` renkte, diğerleri `--muted` renktedir. |
| **Rozet** | Monospace 11 px, 6 px köşe. **Nötr:** `--ink` %6 zemin, `--ink` metin. **Dikkat:** `--accent` %12 zemin, `--accent` metin. **Koyu kart içinde:** `--accent-soft` %15 zemin, `--accent-soft` metin. |
| **Birincil buton** | `--ink` zemin, `--card` metin, tam genişlik, 52 px. Yanında ok ya da ikon olabilir ("Başla →", "↻ Yeniden oyna"). Pasifken `--ink` %40 opaklık; Stitch gri göstermişti, gri kullanılmaz. Basılınca 1 px aşağı iner. |
| **Alt bilgi** | Ekranın en altında monospace, `--muted`: "SE PRIMER · POST-MORTEM DOSYASI INC-9402". |

### Giriş ekranı

| Bileşen | Tanım |
|---|---|
| **Üst satır** | Solda "SE PRIMER" etiketi, sağda nokta ile "08:00 NÖBET BAŞLANGICI" rozeti. |
| **Soru grubu** | Solda etiket ("SEVİYEN"), sağda durum etiketi ("[ SEÇİLDİ ]" / "[ BEKLENİYOR ]"). Altında dikey seçenek kartları. |
| **Profil seçenek kartı** | Başlık (Inter 16/500) ve isteğe bağlı açıklama (13 px, `--muted`). Sağda yuvarlak seçim göstergesi. **Seçili:** 2 px `--ink` kenar, gösterge `--ink` dolgulu ve beyaz onay işaretli. |
| **İlerleme yazısı** | Butonun üstünde monospace: "3 sorudan 2'si cevaplandı". |

### Sahne ekranı

| Bileşen | Tanım |
|---|---|
| **Sayaç** | Yalnızca "Deneyimliyim" seviyesinde görünür. Durum çubuğunun altında ince bir ilerleme çubuğu, sağında saat ikonu ve monospace "0:42". Son 10 saniyede çubuk `--accent` rengine döner ve metin kalınlaşır. Yanıp sönme yoktur. |
| **Konsol kartı** | `--ink` zemin. Üstte `--accent-soft` renkte etiket ("KARAR 1 · MİMARİ") ve sağda `--muted` olay numarası ("INC-9402"). Ortada serif anlatı. Altta ince bir ayırıcı ve metrik satırı: solda nokta ile "HTTP 500 Spike", sağda "ERR_RATE: 94.2%". Metrikler sahneye göre değişir. Karar 3'te metrik satırının yerine log satırı gelir. |
| **İpucu kartı** | `--card` zemin, solda 3 px `--accent` şerit. Başlık satırı: "İPUCU · Şema İncelemesi". Etiket `--accent` renkte, konu `--muted` renkte. Altında ipucu metni. "Yeni başladım" seviyesinde açık gelir, diğerlerinde başlık satırına dokununca açılır. |
| **Seçenek başlığı** | Seçeneklerin üstünde, solda "MÜDAHALE SEÇENEKLERİ" etiketi, sağda "Seçim yapınız" (`--muted`). |
| **Karar seçenek kartı** | Solda 32 px kare harf rozeti (A / B). Ortada başlık ("A · Eski sürüme geri dön") ve altında monospace teknik açıklama ("Rollback pipeline tetiklenir"). Sağda yuvarlak seçim göstergesi. Seçilince kenar 2 px `--ink` olur. **Doğru/yanlış rengi verilmez.** Teknik açıklama sonucu ele vermez, sadece eylemi tarif eder. |

### Açıklama paneli (Sahne ekranının durumu)

Alttan açılan panel. Yukarıdan aşağıya:

1. Tutma çubuğu
2. Başlık satırı: solda "KARAR ANALİZİ · K-01.A" etiketi, sağda olaydan bu yana geçen süre ("T+15m"). Süre, saat ile tutarlı olmalıdır.
3. **Ne oldu:** Serif başlık, altında monospace tek satır: "08:15 · Eski sürüm ayağa kalktı, randevular yeniden açılıyor."
4. **Neden oldu:** `--card-sunk` kutu içinde serif başlık ve 2–3 cümlelik gövde.
   - Kararın konusu oyuncunun hedefiyle eşleşiyorsa başlığın yanında "Senin hedefin" rozeti çıkar ve kutunun altına ikonlu bir **not** eklenir. Not monospace yazılır ve konuya göre başlık alır: "Mimari not", "Test notu", "KVKK notu". Bu, spec §3'teki genişletilmiş açıklamadır.
5. "Devam →" birincil butonu
6. Alt bilgi

**Süre doldu** durumunda başlık satırının üstüne `--bad-tint` zeminli bir şerit gelir: "Süre doldu, karar senin yerine verildi."

### Tutor paneli (Sahne ekranının durumu)

Alttan açılan, ekranın %70'ini kaplayan panel:

- **Başlık:** Turuncu nokta, "TUTOR · KIDEMLİ MÜHENDİS" etiketi, sağda kapatma (×) butonu.
- **Sistem ayırıcısı:** Ortalanmış hap: "08:01 · NÖBET DEVİR PROTOKOLÜ".
- **Oyuncu balonu:** Sağda, `--ink` zemin, beyaz metin. Altında monospace "08:01 · Sen".
- **Tutor balonu:** Solda, `--card` zemin, 1 px kenar. Altında `--accent` renkte monospace "08:01 · Tutor".
- **Yazıyor göstergesi:** Yanıt beklenirken tutor tarafında üç nokta.
- **Alt alan:** "İpucu iste" hap butonu (soru işareti ikonlu), sağda `--muted` "Konsol Aktif". Altında "Tutor'a sor…" giriş kutusu ve `--ink` kare gönder butonu.
- **Yedek ipucu:** LLM yanıt vermezse sabit ipucu normal bir tutor balonu olarak gelir, görünüm değişmez (spec KÖ-7).

### Son ekranı

| Bileşen | Tanım |
|---|---|
| **Üst satır** | Solda saat ve "SE PRIMER", sağda durum etiketi: Son A'da "[ TAMAMLANDI ]", Son B'de "[ İHLAL TESPİT EDİLDİ ]". |
| **Son kartı · A** | `--good-bg` zemin. Beyaz kare içinde kalkan ikonu, sağ üstte "08:25 · T+25m" rozeti. Serif başlık "Son A · Sistem ayakta, veri güvende" ve tek cümlelik sonuç. Altında ayırıcı ve metrik rozetleri ("KAYIP YOK", "VERİ GÜVENLİĞİ %100"), ardından "MTTR: 25 DAKİKA". |
| **Son kartı · B** | `--bad-bg` zemin. Üstte uyarı ikonlu "DÜZENLEYİCİ RİSK" rozeti ve sağda süre rozeti, ikisi de tek satır. Beyaz kare içinde uyarı ikonu, serif başlık "Son B · Sistem ayakta ama KVKK ihlali var" ve tek cümlelik sonuç. Altında etki kutusu: "ETKİLENEN KAPSAM: HASTA KİMLİK VERİSİ (PII)", sağda koyu "SEV-1" rozeti, altında ilerleme çubuğu. |
| **Karar özet satırı** | `--card` kart. Üstte nokta ile karar etiketi ("MİMARİ", "TEST", "KVKK & REGÜLASYON"), sağ üstte süre rozeti. Altında seçilen seçenek (Inter 16/500) ve "— " ile başlayan tek cümlelik gerekçe. **Süre rozeti:** süre > 0 ise dikkat rozeti, +0 dk ise nötr rozet. Son B'de ihlale yol açan satır `--bad-tint` zemin alır, başlığı `--accent` renktedir. |
| **Okuma önerisi** | `--card-sunk` kutu, solda 3 px `--accent` şerit. Kitap ikonlu "HEDEFİNE GÖRE OKUMA" etiketi, serif başlık ve 1–2 cümlelik açıklama. **Dış bağlantı yoktur.** Stitch Son A'ya "Mevzuat notunu incele →" eklemişti; uygulamada metin kartın içinde gösterilir. |

## 7. Ekran metinleri

- Arayüz Türkçedir. Sektörde yerleşik teknik terimler olduğu gibi kalabilir: HTTP 500, ERR_RATE, MTTR, SEV-1, PII, T+15m, migration, rollback, hotfix.
- Bunların dışındaki İngilizce süs metinleri kaldırılır. Stitch çıktısındaki "ARCHIVE VOL. 04", "CHECKSUM" ve "LOG ARCHIVED" kullanılmaz.
- Tüm hasta adları ve kayıt numaraları uydurmadır (spec §2).

## 8. Ekranlar ve durumlar

Ödev 3 ekran istiyor. Açıklama paneli, tutor paneli, sayaç ve "süre doldu" şeridi ayrı ekran değil, **Sahne ekranının durumlarıdır**.

| Ekran | Durumlar |
|---|---|
| **Giriş** | Eksik cevap ("Başla" pasif) · tüm cevaplar seçili · yeniden oynarken önceki cevaplar seçili gelir (spec KÖ-6) |
| **Sahne** | Karar bekleniyor · seçim yapıldı (300 ms sonra açıklama paneli) · açıklama paneli · süre doldu · tutor açık · tutor yedeğe düştü |
| **Son** | Son A · Son B |

**Sahneye göre değişen içerik**

| Karar | Konsol kartı | İpucu konusu |
|---|---|---|
| K1 · Mimari | Rol metni + "HTTP 500 Spike / ERR_RATE" | Şema incelemesi |
| K2 · Test | Rol metni + K1 sonucuna göre metrik | Test kapsamı |
| K3 · KVKK | Rol metni + log satırı: `ERROR appt_id=4821 patient="Ayşe Y." slot=09:30` | Kişisel veri |

## 9. Hareket

- Panel açılışı: 240 ms, ease-out, alttan kayarak.
- Sahneler arası geçiş: 200 ms çapraz solma.
- `prefers-reduced-motion` açıksa tüm geçişler anlık olur.
- Sayaç dışında sürekli hareket eden öğe yoktur.

## 10. Erişilebilirlik

- Tüm dokunma hedefleri ≥ 48 px. Odak halkası 2 px `--ink`, 2 px boşlukla.
- Seçenekler `radio` olarak işaretlenir. Ekran okuyucu "A, Eski sürüme geri dön, 2 seçenekten 1." okur.
- Sayaç her saniye okunmaz. 30 sn ve 10 sn kala `aria-live="polite"` ile duyurulur.
- Paneller açılınca odak panelin başlığına taşınır. Panel kapanınca odak tetikleyen öğeye döner.
- İkonların metin karşılığı vardır (ör. kalkan ikonu: "İyi son", uyarı ikonu: "Kötü son").

## 11. Test için seçiciler

Cypress testleri metne değil, sabit `data-cy` özniteliklerine bağlanır:

- **Giriş:** `level-*`, `role-*`, `goal-*`, `start`
- **Sahne:** `clock`, `progress`, `timer`, `hint`, `choice-a`, `choice-b`, `explain-what`, `explain-why`, `goal-note`, `timeout-banner`, `continue`
- **Tutor:** `tutor-open`, `tutor-input`, `tutor-send`, `tutor-hint`, `tutor-msg`
- **Son:** `ending`, `ending-time`, `summary-row`, `replay`

`ending` öğesi `data-ending="A"` ya da `data-ending="B"` taşır.

## Sürüm notları

- **0.2:** Stitch ekranları ve tasarım sistemiyle birleştirildi.
  - Etiketler JetBrains Mono'ya çevrildi.
  - Konsol kartı metrikleri, "Mimari not" kutusu, son ekranı rozetleri ve etki kutusu eklendi.
  - Gölge, bulanıklık ve kırmızı renk çelişkileri tek kurala bağlandı.
  - Dış bağlantı ve İngilizce süs metinleri kaldırıldı.
- **0.1:** Stitch öncesi ilk taslak.
