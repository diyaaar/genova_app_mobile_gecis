# Ticari çok-korolu SaaS denetimi — 28 Eylül 2026

**Mühendislik kararı:** Ürün gerçek bir çok-kiracılı temele doğru ilerliyor. Ancak bugün
bağımsız korolara güvenle açılmaya veya kendi kendine başlayan ticari SaaS olarak sunulmaya
hazır değil. Mevcut Supabase + Next.js + React Native yönünü korumak mantıklı; öncelik yeni
özelliklerden önce erişim iptali, dosya gizliliği, migration izinleri ve ikinci-koro kabulüdür.

Denetlenen kaynak: `main`, `0bdf8a0`. GitHub `main` salt-okuma ile yeniden doğrulandı:
`a13f696da8c731e9af2a2bce473d4f4ae4a81587`. Yerel kaynak bunun 213 commit / 565 dosya
önünde. Canlı web sürümü ve mevcut hosted katalog bu denetimde yeniden doğrulanmadı.
Dolayısıyla yerel bulguların tamamı bugün dağıtılmış uygulamada varmış gibi okunmamalıdır.

963 takipli dosyanın envanteri çıkarıldı; tüm takipli kaynak alanlarında tenant, provider,
Genova/Genesi Nova/CeneSnova, rol, yapılandırma ve test desenleri arandı. İlgili SQL,
kimlik, API, dosya, önbellek ve başlangıç yolları derinlemesine incelendi. Bu, her dosyanın
her satırının bağımsız güvenlik sertifikasyonu değildir. Gerçek hesap/veri/provider üzerinde
istismar denemesi yapılmadı. Ürün kodu ve test dosyaları değiştirilmedi.

Kapsam/yetki ve İngilizce kabul kaydı: [WF-012](../briefs/WF-012-commercial-multi-tenant-audit.md).

## 1. Mimari harita

| Katman | Gerçek sınır ve kaynak |
|---|---|
| Web | Next.js App Router; React Query, Zustand, bileşen durumu. Tarayıcı Supabase istemcisiyle RLS altında doğrudan okuma/yazma; ayrıca `app/api/` sunucu işlemleri. [İstemci](../../lib/supabase.ts), [AuthProvider](../../components/AuthProvider.tsx). |
| Mobil | `apps/mobile/`: React Native + Expo. Native Auth, repertuvar/PDF/ses ve kısmi sohbet; bazı ekranlar kalıcı WebView. [Ekran defteri](../../MIGRATION.md), [mobil Auth](../../apps/mobile/src/auth/auth-store.ts). |
| Ortak sözleşmeler | Platformdan bağımsız koro seçimi, anotasyon ve sohbet sözleşmeleri `lib/` altında. Aynı veriyi kullanan iki istemci; iki ayrı ürün veritabanı yok. [Koro sözleşmesi](../../lib/choir-context-core.ts), [anotasyon tipleri](../../lib/repertuvar/annotation-types.ts). |
| Kimlik | Supabase Auth hesabı → birden çok `choir_members` kaydı → koroya özgü `choir_member_roles`/`roles`. Aktif koro JWT `session_id` ile sunucuda çözülüyor; yerel tercih yetki sağlamıyor. [005](../../supabase/migrations/20260905003154_multi_membership_active_choir_005.sql). |
| Veritabanı | Ortak PostgreSQL şeması. 003, mevcut 34 tabloda zorunlu `choir_id`, indeks/FK, restrictive RLS ve tenant-link trigger ekliyor. Sonraki dosya/sohbet ilişkileri ayrı migration'larda. [003](../../supabase/migrations/20260903214901_tenant_schema_003.sql). |
| Sunucu yetkisi | Kullanıcı JWT'siyle tenant çözümü; ayrıcalıklı Next istemcisinde izinli tablo listesi ve `choir_id` filtresi/enjeksiyonu. Yeni Edge işlemleri ayrıca dar transaction RPC'leri kullanıyor. [tenant-client](../../lib/server/tenant-client.ts), [tenant-fetch](../../supabase/functions/_shared/tenant-fetch.ts). |
| Dosyalar | Eski Google Drive ve Supabase Storage yolları; yeni özel R2 yolu. Kısa ömürlü imzalı bilet, dosya/tenant konumu, MIME/Range ve bazı ailelerde aktörün yeniden yetkilendirilmesi. Kopyalama, mapping aktivasyonu ve istemci açılması farklı aşamalar. [repertoire-file](../../supabase/functions/repertoire-file/index.ts). |
| Yapılandırma | Web `NEXT_PUBLIC_*`/sunucu env, mobil `EXPO_PUBLIC_*`, Edge secrets, SQL planı henüz eksik. Storage modları/özellik bayrakları deployment düzeyinde. Bazı ürün referans verileri hâlâ kodda. |

Temel ilişki: `auth.users → choir_members(choir_id, auth_user_id) → choir_member_roles → roles`.
Koro verileri `choirs.id` ile; aktif seçim `genova_005.active_choir_sessions` ile bağlı.
Global platform operatörü koro şefinden ayrı bir yetkidir.

## 2. İyi tasarlanmış noktalar — GOOD

- 003:172–190 ve 491–493: zorunlu tenant alanı, tenant indeksi ve restrictive RLS.
  Yeni bir permissive politika tek başına koro sınırını aşamaz.
- 003:440–478: tenant kimliği değiştirilemiyor; yabancı koro ebeveynine bağlanan FK ve
  duyuru hedefleri reddediliyor. Bu koruma ayrıcalıklı yazılarda da çalışıyor.
- 003:195–227 ve 005:58–83: eser adı, rol, okul, bölüm, oda slug'ı gibi doğal anahtarlar
  koroya özgü; aynı Auth hesabı farklı korolarda farklı üyelik/rol taşıyabiliyor.
- 005:121–141, 194–219, 431–453: seçim olmayan çoklu üyelik kapalı kalıyor; roller
  seçili üyelikten geliyor. Başka hesaba/koroya seçim yapılamıyor.
- 006:25–57: istemcinin doğrudan kendine üyelik veya şef rolü vermesi engellenmiş.
- [007](../../supabase/migrations/20260905160539_operator_controlled_choir_creation_007.sql):137–201:
  koro, üç rol, kurucu üyeliği ve şef ataması atomik. Operatör allow-list'i ürün şefinden ayrı.
- [008](../../supabase/migrations/20260905210953_choir_invitations_008.sql):
  davet token hash'i, doğrulanmış alıcı, süre/iptal, aktif davetçi yetkisi, tek kullanım ve
  atomik üyelik/rol ekleme güçlü. Eşzamanlı kabul için ayrı test desteği de var.
- tenant-fetch:25–57: bilinmeyen REST kaynakları/schema profilleri reddediliyor;
  ayrıcalıklı mutasyonlar seçilmiş koroya zorlanıyor. Bu mekanizma RLS'nin yerine tek güvence olamaz.
- Yeni R2 yazma yolları: özel operasyon tabloları, dosya/tenant bağları, lease/retry kimliği,
  final commit öncesi yetki kontrolü ve temizleme/reconciliation tasarımı iyi.
  Örneğin [054](../../supabase/migrations/20260921185113_private_r2_repertoire_upload_054.sql):49–54
  aktif üyelik ve rol kaydını commit boyunca kilitliyor.
- Web/mobil koro değişiminde özel cache temizleme ve eski cevapları reddetme testleri var.
  Anotasyonun ortak TS sözleşmesi ve native SecureStore yaklaşımı korunmalı.

## 3. Sorunlar: önem, kanıt, etki ve öneri

KRİTİK: çok-korolu kullanımı genişletmeden çözülmeli. ÖNEMLİ: yakın ürün kabulünde çözülmeli.
TEKNİK BORÇ: ölçülü biçimde ertelenebilir. Kanıt seviyeleri ayrı yazıldı.

### F01 — KRİTİK: pasif üyelik gerçek erişim iptali sağlamıyor

**Kanıt:** 005:127–136, 154–158, 203–218 ve 431–436 temel tenant/üye/rol çözümünde
`is_active` aramıyor. tenant-client:14–25 yalnız üyeliğin varlığını doğruluyor.
AuthProvider:193–195 aktiflik denetimini yalnız embedded bağlamda yapıyor.

**Gerçek yerel yeniden üretim:** izole `genova_068_test_restore`, sentetik hesap/koro/şef/eser;
aktif koro seçildi, üyelik `is_active=false` yapıldı, `authenticated` rolüyle tekrar sorgulandı:
`tenant_retained=t`, `chef_role_retained=t`, `protected_rows_visible=1`; yeni repertuvar
INSERT'i de başarılı oldu. Transaction ROLLBACK ile geri alındı. Sonraki migration'lar 005'in
bu temel çözümleyicisini değiştirmiyor; bazı yeni yollar kendi aktiflik kontrolünü yapıyor.

**Etki:** pasifleştirilen kişi doğrudan API/DB çağrısıyla erişmeye devam edebilir.
Bu bulgu başka bir koronun yabancı kullanıcıya açıldığını göstermez; kendi korosunda iptal
edilmesi beklenen yetkinin sürmesidir.

**Düzeltme:** tek aktif-üyelik yetki kuralını DB ve ayrıcalıklı girişlerde uygula;
seçim/cache/bilet iptalini tanımla. Pasif üyeliğin seçim ekranında gösterilmesi ayrı UX kararı olsun.
Okuma/yazma/rol/RPC/Realtime/cache için pasifleştirme sonrası ret testleri ekle.

### F02 — KRİTİK: eski dosya yolu tenant RLS dışında herkese açık erişim yaratıyor

**Kanıt:** [drive-manager-v2](../../supabase/functions/drive-manager-v2/index.ts):89–94
`type: anyone`, `role: reader` veriyor; repertuvar :512, yorum/review :611/:772,
chat görseli :813 bunu çağırıyor; :820 doğrudan public URL döndürüyor.
[upload bayrağı](../../lib/repertuvar/upload.ts):8–9 yalnız açıkça `true` olduğunda özel yolu seçiyor.
Ortak `GOOGLE_DRIVE_ROOT_FOLDER_ID` :484–494 tüm koroların dosyalarını platform Google hesabında topluyor.

**Etki:** URL'yi bilen biri uygulamanın koro/rol kontrolünü kullanmadan dosyayı alabilir.
DB izolasyonu sağlayıcıda public yapılmış nesneyi korumaz. Mevcut nesnelerin bugün public olup
olmadığı yeniden sorgulanmadı; kanıt executable yükleme davranışıdır.

**Düzeltme:** özel dosya göçünü tamamla; yeni public izin yaratımını kapat; eski izinleri
envanter/yedek/geri dönüş ile ayrıca kaldır. Private PUT/GET ve yanlış tenant reddi her dosya
ailesinde kanıtlansın. Yalnız R2'ye kopyalamak eski public URL'yi iptal etmez.

### F03 — ÖNEMLİ, yayın engeli: migration izin kanıtı oluşturucu role göre değişiyor

**Kanıt:** [043](../../supabase/migrations/20260919194500_chat_message_status_authority_043.sql):136–137
yalnız `PUBLIC` EXECUTE iznini kaldırıyor; `anon` için ayrı revoke yok.
068 restore'daki `postgres/public/functions` default ACL, `anon`, `authenticated`,
`service_role` rollerine EXECUTE veriyor. `PGOPTIONS='-c role=postgres'` ile oluşturulan
güncel migration zincirinde `mark_chat_message_status` için `anon=true`, `authenticated=true`.
[043 SQL testi](../../supabase/tests/043_chat_message_status_authority.sql):29–33,
`043: RPC privilege boundary is wrong` ile **FAIL** verdi.

Normal 043 runner'ı farklı yerel oluşturucu rolle aynı gün **PASS** verdi. Bu fark gerçek;
yerel yeşil sonuç hosted izinlerinin eşdeğerliğini kanıtlamıyor. Fonksiyon gövdesi ayrıca
Auth/oda denetimi yapıyor; anonim veri okuma/yazma istismarı bu denetimde kanıtlanmadı.

**Düzeltme:** tüm yeni SECURITY DEFINER/RPC izinlerini açıkça rol bazında kapat/aç;
gerçek migration rolü/default ACL ile test et, hosted efektif izinleri salt-okuma doğrula.
Mevcut uygulanmış migration tarihçesini değiştirmek yerine kontrollü ileri düzeltme tasarla.

Bu rol farkının temeli [PostgreSQL 17 default privilege belgesinde](https://www.postgresql.org/docs/17/sql-alterdefaultprivileges.html)
doğrulanıyor: yeni nesnenin varsayılan izinlerini onu oluşturan mevcut rol belirler.

### F04 — ÖNEMLİ: şarkı atama kaydı atomik değil; mevcut atamalar kaybolabilir

**Kanıt:** [assignment update route](../../app/api/repertoire/assignments/update/route.ts):184–211
eski atamaları DELETE, sonra ayrı istekle UPSERT yapıyor. İkinci işlem başarısızsa 500 dönüyor;
ilk işlem geri alınmıyor. [SongAssignmentModal](../../components/SongAssignmentModal.tsx):73–84
Supabase'in `error` alanlarını kontrol etmeden başarısız okumayı boş listeye dönüştürüyor.

**Etki:** ağ/constraint hatası veya eşzamanlı iki şef işlemi kalıcı atama kaybı/karışıklık yaratabilir.
Bu source-level işlem sırası kanıtıdır; gerçek kullanıcı ataması değiştirilmedi.

**Düzeltme:** aktör/tenant kontrolü olan tek transaction RPC; beklenen revision veya aynı kapsam
kilidi. İlk yazma sonrası zorlanan hata, iki eşzamanlı save ve başarısız yükleme ekranı testleri.

### F05 — ÖNEMLİ: ikinci koronun profil formu birinci koronun kimliklerini sunuyor

**Kanıt:** [profil editörü](../../app/(main)/profil/duzenle/page.tsx):17–41 dört okul ve
15 bölüm UUID'sini sabit içeriyor; :75–76 dropdown'a bağlıyor. 003:82–100 bunları eski
koroya atıyor. Tenant-link trigger 003:456–471 başka koroya referansı reddediyor.
[profil onayı](../../app/api/profile-change-requests/review/route.ts):191–209 bu durumda hata alıyor.

**Etki:** ikinci koro kullanıcıya sunulmuş seçenekle profilini güncelleyemiyor. Trigger'ın
reddetmesi iyi izolasyondur; arayüzün yanlış veri sunması gerçek ürün kusurudur.

**Düzeltme:** tenant-authorized referans verisini yükle; yeni koro başlangıç/veri yönetimini tanımla.
Global okul kataloğu seçilecekse tenant sözleşmesinden bilinçli biçimde ayrılmalı.
İki tamamen yeni koroda profil talebi/onayı kabul testi yap.

### F06 — ÖNEMLİ: bağlantı önizlemesinde SSRF ve sınırsız gövde riski

**Kanıt:** [link-preview](../../supabase/functions/link-preview/index.ts):32–57 yalnız
http/https ve basit hostname şekli denetliyor; :147 redirect takip ediyor.
Gerçek fonksiyonun yalnız parser kısmı ağsız çalıştırıldı: localhost, 127.0.0.1,
10.0.0.1, 169.254.169.254 kabul edildi. :207 tüm `response.text()` gövdesini aldıktan
sonra :208 300.000 karaktere kesiyor. :150 timeout header fetch tamamlanınca temizleniyor.

**Etki:** sunucuya kullanıcı kontrollü özel/hedef adres isteği yaptırma, redirect/DNS kaçışı ve
büyük/yavaş body ile kaynak tüketimi olasılığı. Sağlayıcının iç ağına erişim veya sır çalma
kanıtlanmadı; hiçbir gerçek iç-adres probu yapılmadı.

**Düzeltme:** IP/DNS/redirect adımlarında dış-ağ politikası, body boyunca byte/deadline sınırı,
tenant/aktör bazlı kota. Loopback sentetik HTTP sunucusunda ret/redirect/büyük-body testi.

### F07 — ÖNEMLİ: dosya erişim iptali aileler arasında tutarlı değil

**Kanıt:** [repertuvar bileti](../../supabase/functions/repertoire-file/ticket.ts):3–7, 46–56
aktör taşımıyor; varsayılan ömür bir saat. repertoire-file/index.ts:69–77 GET aşamasında
service client dosya/tenant varlığını okuyor, güncel kullanıcı yetkisini tekrar okumuyor.
[eski web token route](../../app/api/drive-file-token/route.ts):12 ve
[token](../../lib/server/drive-file-token.ts):5–6 aynı saatlik capability yaklaşımında.
Buna karşılık [review audio](../../supabase/functions/assignment-review-file/index.ts):20–23
aktörlü bilet ve yeniden `can_read_assignment_review_audio_058` kontrolü kullanıyor.

**Etki:** repertuvar ataması/üyelik/rol değişince verilmiş bilet süre bitimine kadar kullanılabilir.
İmzalı bearer URL taşınabilirliği bir tasarım tercihidir; anlık revocation garantisi henüz yok.

**Düzeltme:** aileler için ortak iptal politikası; uygun aktör/oturum/izin sürümü bağlama,
GET sırasında güncel kontrol ve kısa TTL. Anahtarın service-role anahtarından ayrılmasıyla
credential ve file-ticket rotasyonlarını bağımsızlaştır. Eski istemci uyumunu gözet.

### F08 — ÖNEMLİ: yeni koro başlangıcı ve üyelik yönetimi operatöre bağımlı

**Kanıt:** [login](../../app/login/page.tsx):84–157 giriş sunuyor;
[invite](../../app/invite/page.tsx):43–51 kayıt yolunu davet içinde açıyor.
[ChoirSelectionGate](../../components/ChoirSelectionGate.tsx):54–72 sıfır üyeliğe yalnız
yenile/çıkış sunuyor. 007:87–93 allow-list operatör, :117–129 önceden var olan Auth kurucu
istiyor. Executable create-choir yönetim arayüzü ve rol yükseltme/pasifleştirme/kurucu devir
akışı bulunmadı. 006 doğrudan istemci master-data yazılarını haklı olarak engelliyor.

**Etki:** yeni bağımsız koro kendi başına başlayamıyor; destek kişi sayısıyla büyüyor.
Bu #18'deki bilinçli operatör kararıdır; güvenlik denetimini kaldırarak çözülmemeli.

**Düzeltme:** önce ölçülebilir operatör destekli v1 başlangıç arayüzü ve koro içi dar yönetim
RPC'leri. Son şefi kaldırmama, kendi yetkisini yükseltememe, rol/aktiflik audit kaydı ve
eşzamanlı değişim kuralları. Self-service başlangıcı ayrı ürün kararıyla sonraya alınabilir.

### F09 — ÖNEMLİ: ticari haklar ve yaşam döngüsü uygulanmış değil

**Kanıt:** [kararlar](../../KARARLAR.md) #10–11, #30–31: ilk beş üye ücretsiz,
ek üyeler ücretli, v1 manuel fatura. Kaynakta bunu uygulayan plan/entitlement/seat ledger,
fatura yönetimi, hesap/koro silme orkestrasyonu bulunmadı. [teslim planı](../mobil-teslim-plani.md)
bu işleri hâlâ gelecek iş olarak tutuyor. 003:182 choir FK'sinde otomatik tenant silme yok;
Auth hesabı birden fazla koroda kullanılabiliyor.

**Etki:** ücretli üye sayısı, borç/plan değişimi, son şef, silme/retention, dosya ve yedek
temizliği tutarlı işletilemiyor. Koro silmek global hesabı yanlışlıkla silmemeli.

**Düzeltme:** fiyat/dönem/ücretli üye tanımını belirle; sunucuya ait plan ve üyelik ölçümünü
transaction içinde uygula. Manuel fatura v1 için yeterli olabilir. Koro ve hesap silme,
üyelikten ayrılma, sahiplik devri ve medya retention için ayrı, idempotent işler tanımla.

### F10 — ÖNEMLİ: repo tek başına boş veritabanını yeniden kuramıyor

**Kanıt:** en eski [anotasyon migration'ı](../../supabase/migrations/20260416_repertoire_pdf_annotations.sql):11,53–58
zaten `choir_members`, `repertoire`, `repertoire_files` bekliyor. 003:86–87 mevcut tabloları
zorunlu tutuyor. Temel tablo CREATE DDL'si takipli migration'larda bulunmadı.
[061 runner](../../supabase/test-support/061_private_r2_release_chain_runner.sh):33–51 restore kopyasından başlıyor.
Aynı tarih/version ön ekini kullanan eski dosyalar ve sürümsüz SQL'ler var.
[delete_bulk_songs_keep_zartzurt.sql](../../supabase/migrations/delete_bulk_songs_keep_zartzurt.sql):10–23
tenant kapsamı olmadan eser/dosya/atama siliyor; otomatik migration dizininde duruyor.

**Etki:** yeni test ortamı, disaster recovery ve yeni geliştiricinin kurulumu özel eski dump'a
bağımlı. Manuel temizlik SQL'sinin migration keşfine karışması veri kaybı riski.
Bu dosya denetimde çalıştırılmadı; canlı ledger'a uygulandığı iddia edilmiyor.

**Düzeltme:** hosted ledger'ı koruyan reviewed schema-only baseline; boş bootstrap ve
incremental upgrade/down/reapply ayrı kabul. Manuel/destructive araçları migration keşfinden
ayır. Uygulanmış eski migration'ları körlemesine yeniden numaralandırma.

### F11 — ÖNEMLİ: tenant ölçeği ve maliyet sınırları kanıtlanmış değil

**Kanıt:** [web katalog](../../lib/repertuvar/queries.ts):53–102 ve
[native katalog](../../apps/mobile/src/repertoire/supabase-source.ts):39–69 tüm eser/tag/atamaları
sayfalama olmadan istiyor. [ödev ekranı](../../app/(main)/odevler/page.tsx):238–273,496–520
tüm listeden kimlik çıkarıp ek sorgular yapıyor. [profil foto](../../app/api/profile-photo/route.ts):17–34,87–99
süreç içi Map ile rate-limit tutuyor; :119–136 hesabın altında public URL üretiyor,
aktif koro üyeliği/quota doğrulamıyor.

**Etki:** çok korodan çok, büyük koro/katalog, ortak backend kotası, response sınırı ve
aynı anda çalışan instance'lar baskı yaratır. Bellek Map'i instance'lar arasında kota sağlamaz.
Fotoğrafın global public avatar mı, koro içi özel veri mi olduğu açık ürün sözleşmesi olmalı.
10 veya 100 koroda throughput/maliyet ölçümü yapılmadı; kapasite garantisi yok.

**Düzeltme:** server paging/search ve iş yüküne uygun bileşik indeks; sentetik 10/100 tenant
ve büyük tek-tenant veri seti ile query-plan/gecikme ölçümü. Paylaşılan rate-limit,
tenant storage/egress bütçesi, quota ve reconciliation gözlemlenebilirliği.

### F12 — ÖNEMLİ: yerel sır dosyalarının izinleri gereğinden geniş

**Kanıt:** güncel stat: `.env` ve `.env.local.github` `0666`; `.env.local` `0600`;
mobil `.env` ve iki yerel schema dump'ı `0644`. Değerler okunup rapora basılmadı.
Takipli `.env`/dump yok; seçilmiş token/private-key desenlerinde 963 takipli dosyada sıfır
eşleşme. Bu sınırlı tarama Git tarihinin veya tüm sır türlerinin temizliğini kanıtlamaz.

**Etki:** diğer yerel kullanıcı/prosesler bazı yapılandırmaları değiştirebilir/okuyabilir.
Mobil public anahtarın kendisi sır değildir; sunucu dosyaları ayrı değerlendirilmelidir.

**Düzeltme:** dosya sahipliği ve en az izin; CI secret scan, erişim/rotasyon politikası.
Bu denetimde dosya izinleri veya credential değerleri değiştirilmedi.

### F13 — ÖNEMLİ, doğrulama açığı: aynı oturumlu sekmelerde yanlış koro işlemi

**Kanıt:** 005:440–450 seçimi `session_id` bazında değiştiriyor; tenant-client:14–28
istek başında o anda seçili koroyu alıyor. API mutasyonlarında tutarlı expected-choir
önkoşulu yok. Mevcut 005 testleri farklı iki oturumu sınar, aynı session'lı iki sekmeyi değil.

**Etki:** iki koroya yetkili kullanıcının eski ekrandan geciken, yalnız yeni kayıt bilgisi
taşıyan isteği yeni seçili koroya yazabilir. FK'lar pek çok eski-ID isteğini zaten reddeder.
Bu doğrulanmış yabancı-tenant sızıntısı değil; henüz yeniden üretilmemiş yanlış-koro işlem riski.

**Düzeltme:** istemcinin beklediği tenant'ı server-resolved tenant ile karşılaştır;
uyuşmazlığı reddet. Shared-session sekme, gecikmiş save, seçili üyelik silinmesi ve
tek kalan koroya otomatik fallback davranışını entegre test et.

### F14 — TEKNİK BORÇ / kullanıcı akışı: belirsiz yazmayı koruyan draft çıkışsız kalabiliyor

**Kanıt:** [create-song](../../lib/repertuvar/create-song.ts):44–64 draft'ı insert öncesi
saklıyor; her insert hatasında tutuyor; farklı isim/dosya ile yeni işlem reddediliyor.
[AddSongModal](../../components/AddSongModal.tsx):37,185,200 draft'ı yükleyip alanları kilitliyor.
Duplicate-title gibi kesin retlerden sonra safe reconcile/discard yolu bulunmadı.

**Etki:** tab içinde yeni eser oluşturma manuel storage temizliği/yeni sekme gerektirebilir.
Belirsiz commit'i yanlışlıkla silmeme tasarımı iyi; kalıcı hatayı ayırmak gerekiyor.

**Düzeltme:** kesin ret ile sonucu belirsiz yazmayı ayır; server reconciliation sonrası
güvenli vazgeç/düzelt eylemi ve duplicate-title regresyonu.

## 4. Çok-kiracılı hazırlık değerlendirmesi

| Ölçüt | Karar |
|---|---|
| Tenant veri modeli, çoklu üyelik, koroya özgü roller | Gerçek ve büyük ölçüde doğru temel; mevcut testler anlamlı. |
| Yabancı tenant okuma/yazma reddi | Yerel SQL'de kanıt var; bütün yüzey/canlı sürüm için genel garanti yok. |
| Aktiflik/izin iptali | Hazır değil; F01 yeniden üretildi, F07 politikası farklı. |
| Özel dosya sınırı | Yeni yol iyi; eski public provider yolu ve cutover tamamlanmadığı için hazır değil. |
| Yeni bağımsız koro | Operatör kurabilir; uçtan uca self-service ve bağımsız yönetim hazır değil. |
| Ücretli SaaS işletimi | Plan/seat/lifecycle/operasyon eksikleri nedeniyle hazır değil. |
| 10 koro | Düzeltilmiş güvenlik ve operatör destekli pilotla makul hedef; mevcut hali kabul edilmiş kapasite değil. |
| 100 koro | Self-service veya ölçekli destek, sayfalama, kota, gözlem ve yük kanıtı gerekir. |

Koro adı/domain/package ID/cache prefix'inde Genova geçmesi tek başına tenant bağımlılığı değildir.
003'ün eski koro backfill'i de migration bağlamında normaldir. Gerçek runtime bağımlılıkları
sabit okul/bölüm UUID'leri ve eski provider hesabıdır. Platform markası ile müşteri verisi karıştırılmamalı.

## 5. Gerçek test çalıştırma ve kapsama değerlendirmesi

Tüm yeni sonuçlar 28 Eylül 2026, `0bdf8a0`, yerel ortam. SQL senaryoları gerçek PostgreSQL
RLS/rol işlemleri; JWT claim'leri sentetik. Bunlar hosted Auth/HTTP/gerçek provider kabulü değildir.

| Kontrol | Sonuç | Kanıt sınırı |
|---|---|---|
| `pnpm check`, sentetik Supabase/build env | PASS: lint, TS, 90 dosya / 797 test, SW syntax, Next build | Üretim/DB/Edge/runtime kabulü değil. |
| `apps/mobile`: typecheck + Jest `--runInBand` | PASS: 49 suite / 288 test | Mock/component sözleşmeleri; cihaz testi değil. SafeAreaView/punycode uyarıları var. |
| SQL 003,005,006,007,008,012 | PASS, altı paket; mevcut izole PG17 restore, transaction rollback | A/B kapsamı, seçim, farklı oturum, üyelik yazma kilidi, davet/kuruluş. |
| Güncel 19 migration'lı disposable clone + 19 SQL paketi | 17 PASS; 043 FAIL; 058 ilk koşuda fixture nedeniyle çalışamadı | Migration rolü `postgres`, restore default ACL korunuyor; Realtime minimal sözleşme fixture'ı. |
| 058 kendi runner'ı, `setup_only=true` önkoşuluyla | PASS: review yetki/tenant/visibility, catalog, down/refusal | İlk 058 hatası eksik fixture: 057 normal test sonunda rollback ediyor. Ürün kusuru diye sayılmadı. |
| Normal 043 runner'ı | PASS; postgres/default-ACL zincirinde aynı test FAIL | Oluşturucu role bağlı test kanıtı farkı; F03. |
| 046 kendi runner'ı | PASS: topic/oda/üye ret, publication, down/reapply | Minimal SQL Realtime yüzeyi; gerçek socket teslimi değil. |
| 065 kendi runner'ı | PASS: altı aile aktivasyon/refusal, down/reapply, source unchanged | Provider PUT veya hosted cutover değil. |
| Pasif üye negatif senaryosu | Beklenen güvenlik davranışı FAIL; erişim/yazma devamı yeniden üretildi | Sentetik/rollback; F01. |
| `pnpm test:e2e` | Komut FAIL: 4 API PASS, 26 browser launch engeli | Chromium headless shell yok; 26 UI senaryosu NOT RUN, ürün davranışı FAIL denemez. |
| `pnpm audit --prod --audit-level high` | PASS eşiği; 1 low `@babel/core`, high/critical 0 | Tüm güvenlik problemlerini/dependency tarihçesini kapsamaz. |
| Hosted RLS/grants, gerçek üyeli browser A/B, dosya revoke, cihaz, 10/100 tenant load | NOT RUN | Bu rapor bunlara yeni PASS atamıyor. |

25 mevcut SQL paketinin hepsi denendi; 24'ü uygun önkoşullarla geçti. 043, Supabase restore
varsayılan izinleri ve `postgres` oluşturucu rolle başarısız kaldı; farklı oluşturucu rolle
geçmesini güvenlik kabulü saymıyorum.

İlk geniş SQL zinciri, restore'da Supabase Realtime yüzeyi olmadığı için 046 preflight'ında;
onu çıkaran deneme ise 048'in 046 gereksiniminde durdu. Minimal Realtime fixture'ı
`postgres` sahipliğiyle eşlenmeden schema permission hatası verdi. Nedenler source/catalog
ile ayrıştırıldı; product fix veya global PostgreSQL ayarı yapılmadı. `wal_level` uyarısı nedeniyle
SQL publication/policy sonuçları gerçek Realtime servis kanıtı olarak sunulmuyor.

Kapsam kalitesi:

- 003/005 A kullanıcısının B verisini görmemesi ve çoklu üyede seçilen koronun rolünü kullanması
  için anlamlı DB testleri içeriyor. Tabloların her biri için dolu karşı-tenant fixture kapsamı eşit değil.
- 008 yanlış hesap, doğrulanmamış hesap, süre/iptal/reuse, davetçi yetki kaybı ve atomik retleri sınar.
- [mobil birleşik akış](../../apps/mobile/src/ui/__tests__/ProductReadFlow.acceptance.test.tsx):144–209
  temizleyicilerin koro RPC'sinden önce çalışması, A eserinin B katalogda kalmaması ve çıkış için güçlü
  sentetik test. Gerçek DB/file/cihaz yerine injected doubles kullanır.
- [browser A/B](../../tests/e2e/app.spec.ts):105–194 REST'i intercept eder; picker/UI kanıtıdır,
  gerçek tenant izolasyonu değildir. API E2E anonymous 401 ağırlıklıdır.
- [coverage ayarı](../../vitest.config.ts):19–37 yalnız seçili dosyaları ölçer.
  %90,37 statement / %97,1 line **uygulamanın tamamının** coverage oranı değildir.
- [CI](../../.github/workflows/ci.yml) web, browser ve mobile ayrı işler içerir;
  SQL/RLS paketlerini çalıştırmaz. Genel yeşil CI F01/F03 gibi DB sorunlarını kaçırabilir.

## 6. Yeni koronun baştan sona ürün yolculuğu

| Adım | Bugünkü durum |
|---|---|
| Uygulamayı keşfet | Ana ürün korumalı/giriş odaklı; bağımsız satış/onboarding/fiyat yolu bulunmadı. Ayrı pazarlama sitesi bu denetimin kapsamı değil. |
| Kurucu hesap aç | Davetsiz kayıt yolu eksik. Davet içinde signup var; yeni kurucu için operatör bootstrap gerekiyor. |
| Koro oluştur | Önceden var olan Auth kurucuyla allow-list operatör atomik oluşturabilir. Kullanıcı UI'sı yok. |
| İlk giriş ve seçim | Üyelik varsa server-confirmed tek/çok koro seçimi var; sıfır üyelikte başlangıç çıkışı yok. |
| Üye davet et | Şef recipient-bound link oluşturup manuel paylaşabiliyor. Bu akışta otomatik davet e-postası gönderimi yok. |
| Üye kabulü | Kayıt/giriş/email confirmation/acceptance sözleşmesi var; DB atomik Korist atıyor. Gerçek e-posta uçtan uca bu turda sınanmadı. |
| Rol/aktiflik yönet | Şef/partisyon şefi yükseltme, pasifleştirme/geri açma, son şef ve sahiplik devri ürün akışı eksik. |
| İlk eser ve dosya | Mevcut şef akışı var; eski provider yolu varsayılan olabilir, özel yol release bayrağına bağlı. |
| Profil/düzenli kullanım | İkinci-koro sabit referans hatası var; native ürün özellikleri henüz tam değil. |
| Altıncı üye/ücret | Ticari seat/plan/fatura takibi uygulanmış değil. Davet abuse limiti ticari plan değildir. |
| Ayrıl/kapat/sil | Çoklu üyelik, sahiplik ve dosya/backup retention'ı kapsayan tamamlanmış yaşam döngüsü yok. |

## 7. Güvenlik ve veri izolasyonu hükmü

Tenant RLS/FK/role temelini yeniden yazmak için neden yok. Buna rağmen koro sınırının
doğru olması, public URL gizliliğini, üyelik iptalini ve ayrıcalıklı işlemin güvenliğini tek başına
kanıtlamaz. F01 ve F03 yeni runtime/DB kanıtlarıdır. F02 executable provider davranışı;
F06 ağsız parser kanıtı; F07/F13 açık politika/entegre test boşluklarıdır.

[Supabase RLS belgesi](https://supabase.com/docs/guides/database/postgres/row-level-security)
de kullanıcı access token'ı taşımayan service-role işlemlerinin RLS'yi bypass ettiğini doğrular.
Bu nedenle ayrıcalıklı istemcinin tenant filtresi ve dar RPC yetkisi ayrıca denetlenmiştir.

Hassas veriyi çapraz koro göstermeyen negatif testler korunmalı; daha geniş commercial kabul
için üyelik/rol değişimi, token/cache kalıntısı, shared-session gecikmesi ve her dosya ailesi de
aynı matriste olmalı. Mevcut güvenlik problemleri çözülmeden yeni bağımsız koro pilotu genişletilmemeli.

## 8. Teknik borç ve sürdürülebilirlik

| Borç | Somut kaynak | Öneri |
|---|---|---|
| İş mantığı/authorization tekrarı | Birçok Next route'ta `normalizeRoleName`; reviewer-auth, drive-file-access ve Edge varyantları | Test edilmiş canonical role/capability sözleşmesi; UI rol etiketini yetki anahtarından ayır. |
| Büyük UI ve veri modülleri | RepertoireWorkspace 3.351, chat lib 1.686, ödev page 1.547, ChatRoom 1.161 satır | Akış bazında veri/işlem/platform/UI ayır. Boyut tek başına rewrite gerekçesi değil. |
| Karışık veri erişimi | Browser PostgREST, Next service wrapper ve yeni Edge transaction yolları | Yeni native akışın sunucu işlemini Edge/RPC'de ortaklaştır; tüm read'leri gereksiz proxy'ye taşıma. |
| Hata→boş veri davranışı | SongAssignmentModal; web/native katalog tag error → [] | Boş sonuç, yetkisizlik ve ağ hatasını ayır; stale veriyle destructive save'i kilitle. |
| Eski/manual araçlar | `scratch/`, kökte tanı/cleanup script'leri, migration içi destructive SQL | Çalıştırılabilir araçların target/tenant/dry-run guard'ı ve ayrı ops konumu. |
| Paket/model isimleri, markalama | ai-studio-applet, Genova prefix/domain/package, npm/pnpm ayrı workspace lock'ları | Ürün/config envanteri; tenant-specific veriyle platform markasını ayrı sınıflandır. |
| Mobil uyarılar | SafeAreaView/punycode | Uygun küçük bakım işinde düzelt; güvenlik kuyruğunun önüne alma. |
| Yayın farkı | Yerel HEAD ile remote main 213 commit fark | Şema→Edge→web/mobile sırası ve exact candidate kabulü; denetim nedeniyle toplu push yapma. |

## 9. Önerilen mimari değişiklikler

1. Mevcut ortak-schema Supabase modelini koru. Tenant kimliği ve aktif üyelik sunucunun
   tek yetki kaynağı; ayrıcalıklı erişim dar, testli sınırlarla çalışsın.
2. Çok-adımlı kalıcı mutasyonları transaction RPC'lerine taşı; shared expected-choir,
   revision/idempotency ve audit sözleşmesi kullan. Yeni native sunucu akışlarında ortak Edge sınırını sürdür.
3. Platform yapılandırması, tenant ayarları/referans verisi ve kişisel profil alanlarını ayır.
   Önce gerçekten kırılan sabit UUID'leri gider; geniş config framework kurma.
4. Tüm özel medya için tenant/object sözleşmesi ve tutarlı revocation politikası.
   Provider migration'ı kopya sayısı yerine authenticated read/write/revoke sonucu ile kabul et.
5. Migration/default ACL ve test baseline'ını reproducible hale getir. SQL güvenlik paketi
   sentetik bağımsız tenant'larla CI'da doğru owner/default privileges altında çalışsın.
6. Üyelik yönetimi ve manuel ticari yönetim backend'e ait olsun. Tenant kotası, sayfalama,
   idempotent silme/temizleme ve izlenebilir iş kuyruğu yalnız somut akış gereksinimleriyle eklenmeli.

Mikroservis, ayrı tenant başına veritabanı veya Railway rewrite önerilmiyor. Bugünkü açıklar
seçilmiş teknolojiden çok erişim/yaşam döngüsü/kanıt tutarsızlıklarında.

## 10. Öncelikli uygulama planı — bu denetimde uygulanmadı

| Sıra | Doğrulanabilir çıktı | Kabul ölçütü / bağımlılık |
|---|---|---|
| 1 | Aktif üyelik ve DB izinleri güvenlik paketi: F01/F03 | Pasif kullanıcı SELECT/INSERT/RPC/role erişimi reddedilir. Migration `postgres` ve Supabase default ACL ile geçer; hosted efektif izin doğrulaması ayrı katman. İki proje DB etkisi/yedek/restore ve rollout sırası korunur. |
| 2 | Private dosya ve erişim iptali kabulü: F02/F07 | Yetkili kullanıcı okur; yabancı koro, pasif/demoted kişi ve iptal edilmiş bilet reddedilir. Eski public izin kapanışı ve her aile read/write/Range kanıtı; mevcut copy checkpoint'leri korunur. |
| 3 | Dış URL/body ve kaynak sınırı: F06/F11/F12 | SSRF/redirect/body retleri sentetik testte geçer; rate-limit instance bağımsız; yerel sır dosyaları uygun sahiplik/izinle; gerçek sırlar loga girmez. |
| 4 | Atomik atama ve hata davranışı: F04 | İkinci adım hatasında eski atamalar korunur; eşzamanlı kaydetme deterministik; UI load failure ile boş veri karışmaz. |
| 5 | Genesi Nova'sız iki-koro ürün kabulü: F05/F13/F14 | İki yeni sentetik koro için kuruluş, davet, farklı roller, profil, eser/dosya/atama/okuma ve koro değişimi. Sabit eski kimlik yok; gecikmiş yanlış-koro save reddi ve draft çıkışı kanıtlı. |
| 6 | Operatör destekli başlangıç ve üyelik yönetimi: F08 | Kurucu bootstrap, koro oluşturma, role/active değişimi, son şef ve devir; dar yetki/audit ve kullanıcıya anlaşılır hata. Self-service, #18'i değiştiren ayrı karar ister. |
| 7 | Manuel ticari v1 ve silme yaşam döngüsü: F09 | Beş ücretsiz üye ve ek koltuk hesabı server transaction'da; fiyat/dönem/counting kararı; manuel plan/fatura izi. Koro silme global Auth hesabını diğer korolardan silmez; media retention/cleanup tekrar çalıştırılabilir. |
| 8 | 10→100 tenant kapasite ve yayın kabulü | Paging/search, sentetik veri, query plans, gecikme/kota/maliyet; gerçek browser/device ve exact source rollout. Tam native kapsam ve iki mağaza hedefi korunur. |

En sağlıklı ilk yeni uygulama checkpoint'i **erişim iptali + gerçek migration izinleri**.
077 dosya kopyalama önerisi denetim boyunca uygulanmadı. Bu rapor, kod düzeltmesi veya
canlı migration/deploy/provider yetkisi değildir.
