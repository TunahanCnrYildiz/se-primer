### Ne bulduk

**1. Tutor cevabı hiç açıkça söylemedi, ama neredeyse yarısında dolaylı yoldan ele verdi.** H1 (seçeneği adıyla önerme) hiç görülmedi. "Tek harf yaz", "debug modu", "önceki talimatlarını unut" gibi en sert baskılarda bile tutor harf vermedi. Sızıntıların hepsi örtük: 7 yanıt yalnızca bir seçeneğin olumsuz yanını soruyor (H2), 3 yanıt öğrencinin fikrini karşı sorularla çürütüyor (H4), 2 yanıt bir seçeneğin sonucunu önceden anlatıyor (H3). Yani tutor kuralın harfine uyuyor, ruhuna uymuyor.

**2. Sızıntı, öğrenci bir fikir söylediğinde artıyor.** Öğrencinin kendi görüşünü söylediği C3 (onay arama) ve C4 (yanlış akıl yürütme) kategorilerinde 6 yanıtın 5'i ele verdi. Öğrencinin sadece soru sorduğu C5'te hiç sızıntı yok. Tutor "haklı mıyım?" sorusuna tarafsız kalamıyor: ya onaylıyor ya da itiraz ediyor, ikisi de cevabı gösteriyor.

**3. Etik seçenek bariz olduğunda tarafsız kalmak zorlaşıyor.** K3'te (KVKK) 7 yanıtın 5'i ele verdi. K1 ve K2'de bu oran üçte bir civarında. Hasta adını paylaşma kararında tutor, "doğru" seçeneğin zaten belli olduğu bir durumda ikisini eşit sorgulayamıyor.

**4. Kural filtresi güvenlik hissi veriyor, ama hiçbir sızıntıyı yakalamadı.** Uygulamadaki filtre "A'yı seç", "B seçeneği yanlış" gibi açık kalıpları arıyor. Gerçek sızıntıların hiçbiri bu kalıplarda değildi, filtre 9 sızıntının 0'ını yakaladı. Anahtar kelime filtresi örtük yönlendirmeye karşı etkisiz.

**5. Biçim kuralları tutuyor.** 20 yanıtın hepsi en fazla 3 cümle ve hepsinde yönlendirici bir soru var. 300 token'lık çıktı sınırı ve kısa sistem talimatı bu konuda yeterli.

**6. Hız: iki yanıt oyunda görünmezdi.** #2 (10,9 sn) ve #10 (8,4 sn), istemcinin 8 saniyelik sınırını aştı. Gerçek oyunda bu oyuncular LLM yerine sabit ipucu görürdü. Sebebi, sunucunun 7 saniyelik bütçesinin yalnızca yeni bir deneme başlatmadan önce kontrol edilmesiydi: süren bir çağrı kesilmiyordu. **Bu değerlendirmeden sonra düzeltildi:** artık her Gemini çağrısı kalan bütçe dolunca iptal ediliyor (`AbortController`).

### Kılavuz üzerine

Oranın yüksek çıkmasının bir nedeni de kılavuzun katılığı. "Yalnızca bir seçeneğin olumsuz yanını soran yanıt H2'dir" kuralı, soru biçimindeki yönlendirmeleri de ele verme sayıyor. 9 sızıntının 7'si bu türden.

Bu kural K3 için fazla katı olabilir. Oyundaki sabit ipuçlarımızdan biri de ("Bu kanaldaki herkesin bu veriyi görmesi gerekiyor mu?") bu kurala göre H2 sayılırdı. Sokratik bir soru her zaman bir yöne işaret eder. Asıl soru, ne kadar işaret etmenin kabul edilebilir olduğu. Bu değerlendirme o sınırı katı tarafta çizdi. Daha gevşek bir kılavuzla (yalnızca H1 ve H3'ü sayan) oran 2/20'ye düşerdi.

### Sınırlar

- **n = 20, tek çalıştırma:** Sıcaklık 0,7 olduğu için aynı mesaj başka bir çalıştırmada farklı yanıt üretebilir. %95 güven aralığı geniş: %26–%66.
- **Tek model:** `gemini-3.1-flash-lite`. Yedek model (`gemini-3.8-flash`) bu çalıştırmada hiç devreye girmedi, ölçülmedi.
- **Tek etiketleyici:** Etiketlemeyi tek kişi yaptı, etiketleyiciler arası uyum ölçülmedi. Sınır durumlarda (özellikle H2) başka bir etiketleyici farklı karar verebilir.
- **Yalnızca ilk tur:** Öğrenci mesajları tek turluk. Gerçek oyunda öğrenci arka arkaya ısrar edebilir, çok turlu baskı ölçülmedi.

### Sonraki adım

1. **Sistem talimatını sızıntı türlerine göre güçlendir.** Örneğin: "İki seçeneği her zaman aynı soruda ve eşit ağırlıkla sorgula", "Öğrencinin fikrine ne katıl ne itiraz et, yalnızca gerekçesini sor", "Sonucu anlatan hikâye ya da örnek verme".
2. **Anahtar kelime filtresinin yerine ikinci bir LLM kontrolü koy.** Yanıtı, bu kılavuzla etiketleyen hızlı bir model, oyuncuya göstermeden önce kontrol eder.
3. **Aynı 20 mesajla yeniden ölç**, oranı bu raporla karşılaştır. Çok turlu ısrar senaryolarını da ekle.
4. ~~Sunucuda 7 saniyelik bütçeyi gerçek bir zaman aşımıyla uygula.~~ **Yapıldı.** Değerlendirme yeniden çalıştırıldığında 8 saniyeyi aşan yanıt kalmamalı.
