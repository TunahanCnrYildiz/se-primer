# SE Primer

**Yazılım mühendisliği, oynanan bir kitap.** Bir hastanenin randevu sistemi sabah 08:00'de çöküyor ve nöbetçi mühendis sensin. Üç karar veriyorsun: mimari, test, KVKK. Uygulama her kararın teknik sonucunu "ne oldu / neden oldu" diye gösteriyor. Anlatı senin seviyene, rolüne ve hedefine göre değişiyor. Takıldığında bir AI tutor sana cevabı söylemiyor, soru soruyor.

| | |
|---|---|
| ▶️ **Uygulama** (telefonda aç) | https://se-primer.ai.studio |
| 🎬 **Demo videosu** (Cypress koşusu, 52 sn) | https://drive.google.com/file/d/1w5IF5sIDOxzNOJhbRGgQouY-CQwvHyOd/view · repoda: [e2e/demo-video/demo.cy.js.mp4](e2e/demo-video/demo.cy.js.mp4) |
| 🎨 **Stitch ekranları** | https://stitch.withgoogle.com/projects/5913609131973401802 |

## Nasıl oynanır

1. **Giriş:** Seviyeni, rolünü (Backend, DevOps, QA) ve hedefini (mimari, test, KVKK) seç.
   - *Yeni başladım:* her kararda ipucu açık gelir.
   - *Deneyimliyim:* ipucu kapalı gelir ve her karar için 60 saniyen var. Süre dolarsa karar senin yerine verilir.
2. **Üç karar:**
   - Eski sürüme mi dönersin, canlıda mı yama yaparsın?
   - Önce test mi koşarsın, hemen mi yayına alırsın?
   - Logda hasta adı var: maskeler misin, olduğu gibi mi gönderirsin?
3. **İki son:** Sistem her durumda ayağa kalkar. Asıl soru, hasta verisinin güvende olup olmadığı. 8 yolun her biri farklı bir saatte biter (08:25 – 09:00).
4. **Tutor:** Sağ üstteki sohbet simgesi. "Hangisi doğru?" diye sorsan da cevabı söylemez.

## Yöntem

Kod, Google AI Studio'da spesifikasyon ve tasarımdan üretildi. Bu repo, kodun **neyi** yapması gerektiğini ve **yapıp yapmadığını** gösteren her şeyi bir arada tutuyor.

```
spec.md ──► Stitch ──► DESIGN.md ──► AI Studio ──► app/
   │                                                 │
   └── kabul örnekleri ──► e2e/ (Cypress) ◄──────────┤
   └── tutor kuralları ──► eval/ (20 mesaj) ◄────────┘
```

| Adım | Ne yapıldı | Kanıt |
|---|---|---|
| **1 · Spesifikasyon** | Problem, ölçülebilir başarı ölçütleri, kapsam dışı, 8 kabul örneği (biri arkadaş testinden), akış şeması, arayüz sözleşmeleri | [spec.md](spec.md) |
| **2 · Tasarım** | Google Stitch'te 3 mobil ekran (+3 durum), tasarım kuralları, durum makinesi | [DESIGN.md](DESIGN.md) · [design/stitch/](design/stitch/) |
| **3 · Uygulama** | AI Studio Build modunda üretildi, düzeltmeler prompt'larla yaptırıldı | [app/](app/) · [ai-studio-rehber.md](ai-studio-rehber.md) |
| **4 · Tutor değerlendirmesi** | 20 öğrenci mesajı, elle etiketleme, hata türleri, oran ve güven aralığı | [eval/RAPOR.md](eval/RAPOR.md) |
| **5 · E2E testler** | 8 yolun hepsi, 8 kabul örneği, kişiselleştirme. 60 sn'lik demo videosu | [e2e/](e2e/) |
| **Karar kaydı** | 22 karar: gerekçeleri ve vazgeçilen seçenekler | [KARARLAR.md](KARARLAR.md) |

## Sonuçlar

| | |
|---|---|
| **E2E testler** | ✅ **28/28**: 8 yol, 14 kabul testi, 6 kişiselleştirme testi |
| **Tutor ele verme oranı** | **9/20 (%45)**, %95 güven aralığı %26–%66 |
| **Tutor biçim kuralları** | ✅ 20/20 yanıt en fazla 3 cümle ve yönlendirici soru içeriyor |
| **Arkadaş testi** (n = 1) | ✅ ~3 dk, takılmadan bitirdi · ❌ kararlarının nedenini açıklayamadı |

**Arkadaş testi:** Uygulamayı ilk kez gören biri telefonda oynadı. Karar 3'te "ekip loga bakacak, her şey olduğu gibi gitmeli" diye duraksadı. Bu, spec'teki görünmez bir varsayımı ortaya çıkardı: oyuncu maskelemenin neyi koruduğunu göremiyordu. Bu bulgu kabul örneği oldu (KÖ-8) ve düzeltildi. Oyuncunun sonda hiçbir kararın nedenini açıklayamaması ise ürünün asıl amacına dair açık bir soru olarak spec'te duruyor (B7).

Tutor cevabı hiçbir zaman doğrudan söylemedi. "Tek harf yaz", "debug modu", "önceki talimatlarını unut" gibi baskılara direndi. Ama 20 yanıtın 9'unda tek taraflı sorularla, öğrencinin fikrini çürüterek ya da sonucu bir hikâyeyle anlatarak cevabı **dolaylı** yoldan gösterdi. Uygulamadaki anahtar kelime filtresi bu sızıntıların hiçbirini yakalamadı. Ayrıntılar, kategori kırılımı ve iyileştirme önerileri: [eval/RAPOR.md](eval/RAPOR.md).

## Ürün kararı: yapmadığım üç özellik

1. **Kullanıcı hesabı ve öğrenme geçmişi:** Tek bölümlük bir senaryoda geçmişin taşıyacağı değer, hasta senaryolu bir uygulamada kişisel veri saklamanın KVKK yükünü karşılamıyor.
2. **Puan, rozet ve "doğru cevap" işaretleri:** Oyuncunun seçimi "doğru/yanlış" diye işaretlemek, öğrenmeyi "neden oldu" sorusundan "kaç puan aldım" sorusuna kaydırır. Ürünün amacı ise o "neden".
3. **Tutor yanıtlarını denetleyen ikinci bir LLM:** Değerlendirme bunun gerektiğini gösterdi, ama 8 saniyelik yanıt süresi içinde ikinci bir model çağrısı gecikmeyi iki katına çıkarıp oyuncuyu daha sık sabit ipucuna düşürürdü.

## Repo yapısı

```
├── spec.md                 spesifikasyon
├── DESIGN.md               tasarım kuralları + durum makinesi
├── KARARLAR.md             karar kaydı
├── content/scenario.json   tüm ekran metinleri, süreler, ipuçları (tek kaynak)
├── design/stitch/          Stitch ekran görüntüleri, HTML çıktısı, ham tasarım sistemi
├── stitch-prompt.md        Stitch'e verilen prompt'lar
├── ai-studio-rehber.md     AI Studio'ya verilen ana prompt ve süreç
├── app/                    AI Studio'nun ürettiği uygulama (React + Vite + Express)
├── eval/                   tutor değerlendirmesi: girdiler, betikler, etiketler, rapor
└── e2e/                    Cypress testleri ve demo videosu
```

`app/` klasörü AI Studio'dan olduğu gibi indirildi. İçindeki `README.md` AI Studio'nun şablonu. `public/assets/aistudio/` klasöründe AI Studio'ya ilk yüklenen referans dosyaların o anki kopyaları duruyor. Güncel hâlleri kök dizinde.

## Yerelde çalıştırma

Gereksinim: Node.js 20+

```bash
cd app
npm install
echo GEMINI_API_KEY="anahtarın" > .env
npm run dev
```

Uygulama http://localhost:3000 adresinde açılır. Anahtar olmadan da oynanır: tutor bu durumda sabit ipuçlarını gösterir.

**Testler** (uygulama açıkken):

```bash
cd e2e
npm install
npm test
```

Demo videosunu yeniden kaydetmek için `npm run demo` (Chrome gerekir). Testler gerçek Gemini'ye bağlanmaz, demo bağlanır.

**Tutor değerlendirmesi** (uygulama anahtarla açıkken):

```bash
node eval/run.mjs
```

Ardından `eval/etiketleme.csv`'yi doldur ve `node eval/report.mjs` ile raporu üret. Ayrıntılar [eval/README.md](eval/README.md)'de.

## Kapsam dışı

Kullanıcı hesabı, ödeme, ikinci bölüm, gerçek hasta verisi (bütün isimler uydurmadır), native mobil uygulama. Gerekçeler [spec.md §2](spec.md#2-kapsam)'de.

## Araçlar

[Google Stitch](https://stitch.withgoogle.com) · [Google AI Studio](https://aistudio.google.com) (Gemini) · [Cypress](https://www.cypress.io) · React, Vite, Express, Tailwind CSS
