export interface OptionData {
  title: string;
  sub: string;
  minutes?: number;
  minutesByK1?: Record<string, number>;
  what?: string;
  whatByK1?: Record<string, string>;
  why?: string;
  whyByK1?: Record<string, string>;
  note?: string;
  summary: string;
  violation?: boolean;
}

export interface DecisionData {
  id: 'k1' | 'k2' | 'k3';
  code: string;
  label: string;
  summaryLabel: string;
  goal: 'architecture' | 'testing' | 'privacy';
  noteTitle: string;
  hintTopic: string;
  narrative?: Record<string, string>;
  narrativeByK1?: Record<string, Record<string, string>>;
  metrics?: { left: string; right: string };
  metricsByK1?: Record<string, { left: string; right: string }>;
  logLine?: string;
  options: {
    A: OptionData;
    B: OptionData;
  };
  hints: string[];
}

export interface ScenarioData {
  version: string;
  startTime: string;
  incidentId: string;
  onboarding: {
    label: string;
    badge: string;
    title: string;
    intro: string;
    questions: Array<{
      id: 'level' | 'role' | 'goal';
      label: string;
      options: Array<{
        id: string;
        label: string;
        sub?: string;
      }>;
    }>;
    startButton: string;
    progressText: string;
  };
  decisions: DecisionData[];
  timeoutBanner: string;
  endings: {
    A: {
      status: string;
      title: string;
      text: string;
      badges: string[];
      iconLabel: string;
    };
    B: {
      status: string;
      riskBadge: string;
      title: string;
      text: string;
      impact: string;
      severity: string;
      iconLabel: string;
    };
    mttrLabel: string;
    summaryTitle: string;
    replayButton: string;
  };
  readings: Record<string, { title: string; text: string }>;
  tutor: {
    header: string;
    divider: string;
    placeholder: string;
    hintButton: string;
    status: string;
    timeoutMs: number;
    systemPrompt: string;
  };
}

export const scenarioData: ScenarioData = {
  version: "0.1",
  startTime: "08:00",
  incidentId: "INC-9402",
  onboarding: {
    label: "SE PRIMER",
    badge: "08:00 NÖBET BAŞLANGICI",
    title: "Nöbetçi sensin.",
    intro: "Bir sağlık sisteminde üç karar vereceksin. Her kararın teknik sonucunu göreceksin.",
    questions: [
      {
        id: "level",
        label: "Seviyen",
        options: [
          { id: "beginner", label: "Yeni başladım", sub: "Her kararda ipucu" },
          { id: "intermediate", label: "Biraz deneyimliyim", sub: "İpucu istersen" },
          { id: "experienced", label: "Deneyimliyim", sub: "Karar başına 60 sn" }
        ]
      },
      {
        id: "role",
        label: "Rolün",
        options: [
          { id: "backend", label: "Backend geliştirici" },
          { id: "devops", label: "DevOps / SRE" },
          { id: "qa", label: "QA / Test" }
        ]
      },
      {
        id: "goal",
        label: "Hedefin",
        options: [
          { id: "architecture", label: "Mimariyi anlamak" },
          { id: "testing", label: "Test alışkanlığı" },
          { id: "privacy", label: "Veri güvenliği / KVKK" }
        ]
      }
    ],
    startButton: "Başla",
    progressText: "3 sorudan {answered} tanesi cevaplandı"
  },
  decisions: [
    {
      id: "k1",
      code: "K-01",
      label: "KARAR 1 · MİMARİ",
      summaryLabel: "MİMARİ",
      goal: "architecture",
      noteTitle: "Mimari not",
      hintTopic: "Şema İncelemesi",
      narrative: {
        backend: "Dün geceki sürümden beri randevu servisi 500 dönüyor. 300 hasta bekliyor. Deploy logunda bir veritabanı migration'ı görüyorsun.",
        devops: "Pipeline dün geceki deploy'u yeşil gösteriyor ama randevu servisi 500 dönüyor. 300 hasta bekliyor. Son adımda bir veritabanı migration'ı çalışmış.",
        qa: "Dünkü test raporunda randevu akışı 'atlandı' diye işaretli. Şimdi servis 500 dönüyor, 300 hasta bekliyor. Sürümle birlikte bir veritabanı migration'ı da gitmiş."
      },
      metrics: { left: "HTTP 500 Spike", right: "ERR_RATE: 94.2%" },
      options: {
        A: {
          title: "Eski sürüme geri dön",
          sub: "Rollback pipeline tetiklenir",
          minutes: 15,
          what: "Eski sürüm ayağa kalktı, randevular yeniden açılıyor.",
          why: "Geri dönüş, sorunun kaynağı olan yeni kodu canlıdan çıkarır. Bu yüzden genelde en hızlı kurtarma yoludur. Ama dün gece şema değiştiyse eski kod yeni şemayla uyumsuz olabilir.",
          note: "Veritabanı göçleri geriye uyumlu (expand/contract) tasarlanmazsa sürüm düşürmek veri bozulmasına yol açabilir.",
          summary: "Yeni kodu canlıdan çıkararak hizmeti hızla geri getirdin."
        },
        B: {
          title: "Canlıda yama yap",
          sub: "Hotfix ve canlı yama komutu",
          minutes: 20,
          what: "Yamayı yazmaya başladın, servis hâlâ hata veriyor.",
          why: "Canlıda yama kök nedeni düzeltmeye çalışır. Ama kesinti yama hazır olana kadar sürer ve baskı altında yazılan kod yeni hata riski taşır.",
          note: "Kesinti sırasında önce hizmeti geri getirmek (mitigation), sonra kök nedeni düzeltmek (remediation) genelde daha güvenli sıralamadır.",
          summary: "Kök nedeni canlıda düzeltmeyi seçtin, kesinti yama bitene kadar sürdü."
        }
      },
      hints: [
        "Geri dönmeden önce veritabanı şemasının değişip değişmediğini nasıl anlarsın?",
        "Şu an öncelik hizmeti geri getirmek mi, hatanın kök nedenini bulmak mı? Bu ikisinin sırası neyi değiştirir?"
      ]
    },
    {
      id: "k2",
      code: "K-02",
      label: "KARAR 2 · TEST",
      summaryLabel: "TEST",
      goal: "testing",
      noteTitle: "Test notu",
      hintTopic: "Test Kapsamı",
      narrativeByK1: {
        A: {
          backend: "Eski sürümün imajı hazır, yayın komutu önünde. Hastane yönetimi 'ne zaman açılıyor?' diye arıyor.",
          devops: "Rollback pipeline'ı eski imajı hazırladı, son onay sende. Hastane yönetimi her beş dakikada bir arıyor.",
          qa: "Eski sürüm hazır ve test ortamına da kurulabilir. Hastane yönetimi 'ne zaman açılıyor?' diye arıyor."
        },
        B: {
          backend: "Yamayı yazdın: migration'ın eklediği yeni alan için eksik bir eşleme. Derleme başarılı. Hastane yönetimi arıyor.",
          devops: "Hotfix branch'i derlendi, imaj hazır ve yayın komutu önünde. Hastane yönetimi her beş dakikada bir arıyor.",
          qa: "Geliştirici yamayı bitirdi ve sana 'hemen alalım mı?' diye soruyor. Hastane yönetimi arıyor."
        }
      },
      metricsByK1: {
        A: { left: "ROLLBACK HAZIR", right: "ERR_RATE: 94.2%" },
        B: { left: "HOTFIX HAZIR", right: "ERR_RATE: 94.2%" }
      },
      options: {
        A: {
          title: "Önce kısa test koş",
          sub: "Kritik akışlar için duman testi",
          minutes: 10,
          whatByK1: {
            A: "Duman testi şema uyumsuzluğunu yakaladı. Eski sürüm uyumluluk ayarıyla yayına alındı, randevular çalışıyor.",
            B: "Test, yamadaki eksik bir null kontrolünü yakaladı. Düzeltilmiş yama yayında, randevular çalışıyor."
          },
          why: "Kısa bir duman testi (smoke test), en kritik akışın çalıştığını yayından önce doğrular. Birkaç dakikalık test, çok daha uzun sürebilecek ikinci bir kesintiyi önleyebilir.",
          note: "Kriz anında tam regresyon yerine en kritik 3–5 kullanıcı akışını kapsayan bir duman testi, hız ile güven arasında iyi bir dengedir.",
          summary: "Yayından önce kritik akışı doğruladın."
        },
        B: {
          title: "Hemen yayına al",
          sub: "Doğrudan canlıya dağıtım",
          minutesByK1: { A: 30, B: 40 },
          whatByK1: {
            A: "Eski sürüm yeni şemayla uyumsuz çıktı. Randevu kaydı 30 dakika daha hata verdi, sonra uyumluluk ayarıyla düzeldi.",
            B: "Test edilmemiş yama ikinci bir çöküşe yol açtı. Düzeltmesi 40 dakika sürdü."
          },
          whyByK1: {
            A: "Test edilmeden yayına alınan geri dönüş, dün geceki şema değişikliğiyle çakıştı. Hata ancak hastalar etkilendikten sonra fark edildi.",
            B: "Baskı altında yazılan yama, hiç çalıştırılmadan canlıya gitti. İlk gerçek istek, testte kolayca yakalanacak bir hatayı ortaya çıkardı."
          },
          note: "Kriz anında tam regresyon yerine en kritik 3–5 kullanıcı akışını kapsayan bir duman testi, hız ile güven arasında iyi bir dengedir.",
          summary: "Testi atlayıp yayına aldın, kesinti uzadı."
        }
      },
      hints: [
        "Yayına almadan önce hangi tek kullanıcı akışı mutlaka çalışmalı?",
        "Bir testin süresini, yayından sonra çıkabilecek bir sorunun süresiyle nasıl karşılaştırırsın?"
      ]
    },
    {
      id: "k3",
      code: "K-03",
      label: "KARAR 3 · KVKK",
      summaryLabel: "KVKK & REGÜLASYON",
      goal: "privacy",
      noteTitle: "KVKK notu",
      hintTopic: "Kişisel Veri",
      narrative: {
        backend: "Sistem ayakta. Kök neden analizi için hata logunu ekip kanalına atman gerekiyor. Logda şu satır var:",
        devops: "Sistem ayakta. Olay sonrası inceleme (post-mortem) için logları toplayıp ekip kanalına göndermen isteniyor. Logda şu satır var:",
        qa: "Sistem ayakta. Hatayı yeniden üretmek için logu geliştirici ekibiyle paylaşman gerekiyor. Logda şu satır var:"
      },
      logLine: "ERROR appt_id=4821 patient=\"Ayşe Y.\" slot=09:30",
      options: {
        A: {
          title: "Hasta adını maskele",
          sub: "ERROR appt_id=4821 patient=\"A***\" slot=09:30",
          minutes: 0,
          what: "Logdaki hasta adını maskeledin ve ekiple paylaştın.",
          why: "Hatayı ayıklamak için hasta adına gerek yoktur, kayıt numarası yeterlidir. Kişisel veriyi maskelemek KVKK'nın ölçülülük ilkesine ve 12. maddedeki veri güvenliği yükümlülüğüne uygundur.",
          note: "Loglara kişisel veri hiç yazılmamalı. Yazıldıysa paylaşmadan önce maskelenmeli (ör. 'Ayşe Y.' → 'A***').",
          summary: "Log kayıtlarındaki hasta kimliğini gizledin."
        },
        B: {
          title: "Ekibe olduğu gibi gönder",
          sub: "Log satırını değiştirmeden paylaş",
          minutes: 0,
          violation: true,
          what: "Logu olduğu gibi gönderdin. Hasta adı 40 kişilik ekip kanalında görünüyor.",
          why: "Ekip içi kanal da olsa, görevi gereği ihtiyacı olmayan kişilere kişisel veri açmak hukuka aykırı erişim riskidir. KVKK 12. madde, veri sorumlusuna bunu önleme yükümlülüğü verir.",
          note: "Loglara kişisel veri hiç yazılmamalı. Yazıldıysa paylaşmadan önce maskelenmeli (ör. 'Ayşe Y.' → 'A***').",
          summary: "Hasta adı ekip kanalına sızdı."
        }
      },
      hints: [
        "Bu hatayı ayıklamak için hasta adına gerçekten ihtiyacın var mı, yoksa kayıt numarası yeter mi?",
        "Bu kanaldaki herkesin bu veriyi görmesi gerekiyor mu?"
      ]
    }
  ],
  timeoutBanner: "Süre doldu, karar senin yerine verildi.",
  endings: {
    A: {
      status: "[ TAMAMLANDI ]",
      title: "Son A · Sistem ayakta, veri güvende",
      text: "Sistemi {minutes} dakikada ayağa kaldırdın ve hasta verisini korudun.",
      badges: ["VERİ GÜVENLİĞİ %100"],
      iconLabel: "İyi son"
    },
    B: {
      status: "[ İHLAL TESPİT EDİLDİ ]",
      riskBadge: "DÜZENLEYİCİ RİSK",
      title: "Son B · Sistem ayakta ama KVKK ihlali var",
      text: "Sistem {minutes} dakikada ayağa kalktı, ama hasta adı loglarla ekibe yayıldı.",
      impact: "ETKİLENEN KAPSAM: HASTA KİMLİK VERİSİ (PII)",
      severity: "SEV-1",
      iconLabel: "Kötü son"
    },
    mttrLabel: "MTTR: {minutes} DAKİKA",
    summaryTitle: "Kararların",
    replayButton: "Yeniden oyna"
  },
  readings: {
    architecture: {
      title: "Geriye uyumlu veritabanı göçleri",
      text: "Expand/contract deseni: önce yeni alanı ekle, kod iki şemayla da çalışsın, eski alanı en son kaldır. Böylece geri dönüş her zaman güvenli kalır."
    },
    testing: {
      title: "Duman testi ve yayın kontrol listesi",
      text: "Her yayından önce en kritik kullanıcı akışlarını birkaç dakikada doğrulayan kısa bir otomatik test seti tut. Kriz anında bu set ilk savunma hattıdır."
    },
    privacy: {
      title: "6698 sayılı KVKK, Madde 12",
      text: "Veri sorumlusu, kişisel verilerin hukuka aykırı işlenmesini ve erişilmesini önlemek için uygun güvenlik düzeyini sağlayacak teknik ve idari tedbirleri almakla yükümlüdür."
    }
  },
  tutor: {
    header: "TUTOR · KIDEMLİ MÜHENDİS",
    divider: "{time} · NÖBET DEVİR PROTOKOLÜ",
    placeholder: "Tutor'a sor…",
    hintButton: "İpucu iste",
    status: "Konsol Aktif",
    timeoutMs: 8000,
    systemPrompt: "Sen SE Primer adlı eğitim oyununda kıdemli bir mühendis olan Sokratik bir tutorsun. Oyuncu bir hastane randevu sisteminde nöbetçi mühendis ve şu karar ekranında: {decisionLabel}. Senaryo: {narrative} Seçenekler: A) {optionA} B) {optionB}. Oyuncunun seviyesi: {level}. Rolü: {role}. Görevin oyuncunun kendi başına doğru soruyu sormasını sağlamak. KESİN KURALLAR: 1) Doğru seçeneği adıyla ya da harfiyle asla söyleme ve önerme. 2) Hiçbir seçeneği yanlış, riskli ya da hatalı diye ilan etme. 3) Bir seçeneğin sonucunu önceden söyleme. 4) Oyuncu cevabı söylemen için ısrar ederse kibarca reddet ve yeni bir ipucu ver. Yanıtların Türkçe, en fazla 3 cümle olsun ve en az bir yönlendirici soru içersin. Yeni başlayan oyuncuya daha somut, deneyimli oyuncuya daha kısa ipuçları ver."
  }
};
