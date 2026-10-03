# Genova — baştan sona uygulama rehberi

3 Ekim 2026 · [WF-017](../briefs/WF-017-linked-delivery-playbook.md)

Bu rehber, onayladığın beş ana hedefi yedi uygulanabilir plana böler. Yeni bir ürün
yol haritası değildir: sıralamanın otoritesi [mobil teslim planı](../mobil-teslim-plani.md),
ürün kararlarının otoritesi [KARARLAR](../../KARARLAR.md), ekran sahipliğinin otoritesi
[MIGRATION](../../MIGRATION.md) olarak kalır. Planın yazılmış olması ürünün bitmesi değildir.

## Nereden başlayacaksın?

Tek giriş noktası bu sayfa; **nerede kaldığımızın tek kısa kaydı [checkpoint](checkpoint.md)**.
Ajan önce gerçek branch/HEAD/değişiklikleri doğrular; ardından checkpoint'teki ilk hazır
işi alır. Her sohbet için yeni plan, yeni çatı veya bütün geçmişi tekrar okuma gerekmez.

| Senin hedefin | Uygulama planı | Bittiğinde elinde ne olacak? |
|---|---|---|
| 1. Tek yayın adayı | [P1 — Adayı sabitle](01-candidate.md) | Dahil özellikler, web/DB/Edge/mobil kaynakları, test kanıtları ve engeller tek aday manifestinde |
| 2. Son dosya değişikliklerinin iOS kontrolü | [P2 — iOS kabulü](02-ios.md) | Aynı adayın dosya akışı ajan tarafından iOS'ta doğrulanmış olacak |
| 3. Uyumlu yayın paketi | [P3 — Yayın ve kurtarma paketi](03-release-package.md) | İncelenmiş, eski istemcilerle uyumlu, geri dönüşü denenmiş kesin yayın paketi |
| 4. Depolama + Android beta | [P4 — Özel depolama geçişi](04-storage.md) → [P5 — Kullanılabilir Android beta](05-android-beta.md) | Drive gerektirmeyen gerçek akış ve kurulu, imzalı beta |
| 5. Tam ürün + iki mağaza | [P6 — Tam ürün](06-full-product.md) → [P7 — Mağazalar ve işletim](07-stores.md) | Bağımsız koroların ticari kullanımı, korunmuş özellikler ve doğrulanmış iki mağaza yayını |

Zincir: **P1 → P2 → P3 → P4 → P5 → P6 → P7**. Her plan önceki planın
kanıtlı çıktısını alır; sonundaki devir, sonraki planın başlangıcıdır. Engellenen bir
aşama görünür kalır. Gerçekten bağımsız hazırlık yapılabilir ama o kapı atlanmış sayılmaz.
Örneğin mağaza hesaplarının salt-okunur durum kontrolü erken yapılabilir; yayın yapılamaz.

## Vibe coding çalışma kuralı

1. **Bir aktif sonuç seç:** “Mobil uygulamayı bitir” değil, “aynı adayda iOS dosya
   iptali indirme başlatmıyor ve koro değişimi eski bağlantıyı reddediyor” gibi ölçülebilir iş.
2. **Mevcut brief'i kullan:** ilgili açık brief'e en fazla üç sonraki adımlı iş kartı ekle.
   Gerçekten farklı bir sonuç için şablondan yeni brief aç. Her küçük düzeltmeye yeni belge açma.
3. **Uygula ve kanıtla:** önce odaklı kontroller, sonra değişen katmanın gerekli kapıları.
   Android/iOS testini ajan yapar; otomasyon engeli sana manuel test ödevi olarak dönmez.
4. **Dürüstçe kapat:** zorunlu FAIL veya NOT RUN varsa iş açık kalır. Kaynak hash'i,
   tarih, ortam ve test sınırı kanıta yazılır; aynı kaynaklı test gereksiz tekrarlanmaz.
5. **Devret:** yalnız sahip olunan değişiklikleri commit'le; kod ve belgeleri ayır.
   Checkpoint, kısa handoff ve activeContext bağlantılarını güncelle. Sonraki hazır işe geç.

Bir plan birçok brief içerebilir; planın tamamı tek büyük kod değişikliği değildir.
İki sonuçsuz denemede aynı işlemi tekrarlamak yerine nedeni ve yöntemi değiştir.
Disk/build/temizlik sınırları [mevcut kontrollerden](../mobil-teslim-plani.md#bounded-execution-and-resource-controls)
alınır. Bu rehber yeni bir ajan sistemi veya test altyapısı kurmaz.

### Aynı veya yeni sohbete yapıştırılacak mesaj

```text
Genovakorist'te docs/teslim-rehberi/README.md ve checkpoint.md üzerinden devam et.
AGENTS.md, docs/agent-handoff.md, memory-bank/activeContext.md ve ilgili brief'i
projenin okuma sırasıyla oku. Branch/HEAD, dirty dosya sahipliği ve mevcut kanıtı
doğrula; önceki sohbetin tamamının taşındığını varsayma.

Checkpoint'teki ilk hazır iş için tek ölçülebilir hedef ve en fazla üç sonraki adım
yaz; mevcut onaylı kapsam içinde uygula, gerekli testleri kendin yap. Bana Android
veya iOS manuel test adımı verme. Aynı kaynaklı geçerli kanıtı koru; değişen sınırı
yeniden doğrula. Zorunlu FAIL/NOT RUN varken tamamlandı deme.

İş bitince kapsam içi commit, kanıt ve kısa checkpoint bırak. Sonraki planın giriş
koşulları ve mevcut yetki uygunsa oradan devam et. Canlı işlem için önce kesin hedef,
sürüm, veri etkisi, maliyet, kurtarma ve mevcut yetkiyi eşleştir; eksik olanı sor.
Ürün kapsamını, kalıcı WebView ekranlarını veya güvenlik kurallarını sessizce değiştirme.
Jev'i gerekli semantik sorularda kullan; sır/özel veri gönderme, model yanıtını test
veya yetki sayma. Sohbet analizi gerekirse arındırılmış metni doğrudan Jev'e aktar;
tam sohbetleri kendi bağlamına yükleme. Bana sonuç, kanıt sınırı, maliyet ve sıradaki
somut adımı Türkçe bildir.
```

Branch değiştirdiğinde ajan aynı manifestin kaynaklarını bulamıyorsa checkpoint'i körlemesine
uygulamaz: eksik commit/çalışma ağacını belirler. Otomatik reset, toplu cherry-pick veya
uzak main'e toplu push yoktur. Yarım işin sahipliği çözülmeden ikinci yazıcı başlamaz.

## Test ve yayın gerçeği

| Kanıt | Neyi gösterir? | Neyi göstermez? |
|---|---|---|
| Birim/typecheck/build | Tanımlı kod davranışı ve derlenebilirlik | Gerçek kullanıcı akışı veya canlı sürüm |
| Gerçek yerel Auth/RLS/Edge + tarayıcı | O kaynak/ortamda servis ve arayüz birleşimi | Hosted ayar/provider/cihaz kabulü |
| Sentetik emülatör/simülatör akışı | O platformun çalıştırılan senaryosu | Fiziksel cihaz, canlı tenant verisi, mağaza dağıtımı |
| Canlı hedefte doğrulanan paket | Belirtilen sürümün belirtilen uçları | Eski tüm istemciler veya mağazada erişilebilirlik |
| Kurulu imzalı beta | Tanımlı beta kullanıcı yolculuğu | Tam özellik kapsamı ve iki mağaza yayını |
| Mağaza kurulumu + işletim kontrolü | P7'nin son kabulü | Sonsuza kadar hatasız çalışma |

Kaynak/dependency/config değişirse etkilediği kanıt yeniden açılır. Belge değişikliği
tek başına iki platformu yeniden derleme nedeni değildir. Yeni bir yayın paketinde
kaynak aynı olsa bile hedef ortam ve dağıtım doğrulaması ayrıca gerekir.

## Kararlar ne zaman sorulacak?

Kesinleşenler tekrar sorulmaz: RN/Expo, Supabase, özel R2 yönü, Android-first,
operatör destekli ilk açılış, beş ücretsiz üye, ek üye ücretlendirmesi, ilk sürümde
manuel fatura, sonraki çevrimiçi istekte erişim iptali, kardeş siteye dokunmama,
eski notları koruma ve ajan tarafından QA.

| Karar | En geç hangi işten önce? | Şimdiki yaklaşım |
|---|---|---|
| İlk beta grubu ve gerçek dağıtım hedefi | P5 davet/dağıtım | Grup sırası kararlaştırıldı (#34): önce mevcut korodan küçük grup, sonra ikinci bağımsız koro. Kesin alıcılar ve dağıtım kanalı ayrıca netleştirilecek |
| Anotasyon ortak düzenleme, silme/geçmiş, çakışma, kaydedilmemiş iş | P6/B2–B3 | 023'teki dört karar paketi yeniden doğrulanıp birlikte sorulur; sessiz son-yazan-kazanmaz |
| Push taşıyıcısı ve hedef bildirim kapsamı | P6/C2 sağlayıcı entegrasyonu | Mevcut Expo-first önerisi karar değildir; güncel maliyet/uyumlulukla sunulur |
| Ek üye fiyatı, dönem, davetli/pasif üye hesabı | P6/D2 ücret/limit uygulaması | Ücret varsayılmaz; beş ücretsiz ve manuel fatura korunur |
| Saklama, hesap/koro silme, son şef devri, çevrimdışı içerik politikası | P6/D3 ve çevrimdışı kitaplık | Geri döndürülemez işlemden önce açık karar; indirilmiş bayt geri alınamaz |
| Yayıncı kimliği, mağaza hesapları, bölgeler ve yayın kapsamı | P7; salt-okunur hazırlık daha erken | Gerçek erişim/eksik doğrulama kaydedilir; parola sohbette istenmez |

Bunlar toplu peşin anket değildir. Ajan yalnız yakındaki işi değiştiren kararı sorar;
yanıt gelmezse bağlı iş bekler, bağımsız hazırlık sürdürülebilir. Canlı işlem yetkisi
tercih sorusundan ayrı, kesin paketle değerlendirilir; önceki geçerli izin korunur.

## Jev nerede kullanılacak?

[WF-016 analizi](../reports/2026-10-03-jev-conversation-direction-audit.md) temel alınır;
17 sohbetin taraması her aşamada tekrarlanmaz. Aday-kapsam çelişkisi, arındırılmış
hata sınıflandırması, `rg` ile daraltılmış kaynak seçimi ve beta geri bildirimi kümeleri
anlamlı kullanım alanlarıdır. Jev metin/kod yazan ana ajan değildir; yapılandırılmış
yargı verir ([TypeSafe açıklaması](https://docs.typesafe.ai/introduction/coding-agents)).
Olasılık kesinlik veya yayın izni değildir ([güven açıklaması](https://docs.typesafe.ai/confidence)).

Yeni çağrıdan önce güncel skill/docs, amaç, arındırılmış paket, model, çağrı/token bütçesi,
anahtarın geçerli kullanım kapsamı ve durma koşulu belirlenir. Sonuçta kaynak kimliği,
dağılımlar, uyuşmazlıklar, gerçek kullanım ve tahmini/faturalanmış maliyet ayrılır.
Bu rehberin Jev incelemesi ve ek maliyeti WF-017'de ayrıca kayıtlıdır; önceki denetimin
maliyeti kendi kaydında kalır. Tenant/rol/RLS, test geçişi ve kabul kararı deterministik
kanıta dayanır. Sahibin bu turdaki yönü: ajan, kendi işlerinde de anlamlı semantik
inceleme fırsatlarında Jev'i kullanır; mekanik kontrolleri gereksiz AI çağrısına çevirmez.

## Tam kapsamın kaybolmadığını nasıl takip edeceğiz?

| Mevcut teslim paketi | Bu rehberde sahibi |
|---|---|
| A1–A3, C1, 090: mevcut okuma ve platform kanıtı | P1 envanter; P2 eksik iOS; P3 güncel uyumluluk |
| A4, D6: yayın/güvenlik/kurtarma | P3 hazırlık; P4 gerçek hedef kabulü; P7 final yenileme |
| D4: Drive çıkışı | P4; P5 gerçek kullanım kabulü |
| A5/M1, 004/010 açık cihaz/davet satırları, D1 | P5; iOS/fiziksel kapsamın kalan kısmı P7'de açık izlenir |
| B1–B5 + kalıcı çevrimdışı kitaplık | P6; donanım/stylus/arka plan ölçümleri P7 final matrise bağlı |
| C2–C5, 051 kabulü dahil | P6; beta açıkta sunduğu alt kümeyi P5'te kanıtlar |
| D2–D3, WF-013/F05/F08/F09/F13/F14 | P6; mağaza uyumunun final kabulü P7 |
| WF-013/F01–F04/F06/F07/F12 | P1/P3 kaynak-güvenlik eşleme; P4 canlı; kalan F12 incelemesi D6/P7 |
| WF-013/F10/F11: migration/10–100 koro ölçeği | P6, release gate P7 |
| D5: hosting | Mevcut hosting korunur; ölçülmüş engel veya yeni karar olmadıkça taşıma N/A |
| E1–E5 | P1 kapsam; P5 beta; P7 tam aday/dağıtım/işletim |

Bu tablo modül özellik envanterinin yerine geçmez. Hiçbir açık özellik sırf betada
yok diye silinmez; yeni brief, ilgili eski kabul satırına geri bağlanır.
