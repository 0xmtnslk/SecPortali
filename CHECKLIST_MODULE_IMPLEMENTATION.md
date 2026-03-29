# Bakım Kontrol Ayarları Modülü - Uygulama Özeti

## Genel Bakış

Bu proje, "Bakım Kontrol Ayarları" adında yeni bir modül ekler. Bu modül, ekipmanlara ve kategorilere göre atanabilen, esnek ve dinamik kontrol listeleri oluşturmayı sağlar.

## Uygulanan Özellikler

### 1. Veritabanı Şeması

Aşağıdaki yeni tablolar oluşturuldu:

#### `checklist_templates`
- Kontrol listesi şablonlarını saklar
- İSG, BAKIM, GENEL gibi farklı tipleri destekler
- Aktif/pasif durumu yönetilir

#### `checklist_items`
- Şablon içindeki soruları/adımları saklar
- Farklı tipleri destekler: boolean, numeric, text, photo, select
- Sıralama ve zorunluluk özellikleri
- JSONB ile esnek seçenekler ve doğrulama kuralları

#### `checklist_assignment_rules`
- Şablonların hangi ekipmana/kategoriye/bakım tipine atanacağını tanımlar
- Üç kapsam tipi: ASSET, CATEGORY, GLOBAL
- Öncelik sistemi ile esnek atama
- CHECK constraint ile veri bütünlüğü

#### `work_order_checklists`
- İş emrine/bakım kaydına bağlanan checklist instanceları
- Snapshot ile şablon değişikliklerinden etkilenmez
- Durum takibi: PENDING, IN_PROGRESS, COMPLETED

#### `checklist_responses`
- Kullanıcı cevaplarını saklar
- Otomatik uyumluluk (is_compliant) hesaplaması
- JSONB ile esnek yanıt formatları

### 2. Backend Servisleri

#### `checklistService.js`
- `getApplicableChecklistsForWorkOrder()`: İş emri için uygun checklistleri bulur
- `generateWorkOrderChecklists()`: İş emri için checklist instanceları oluşturur
- `saveChecklistResponse()`: Kullanıcı cevaplarını kaydeder
- `getChecklistSummary()`: Checklist özeti ve istatistikleri
- `getWorkOrderChecklists()`: İş emri checklistlerini getirir
- `updateChecklistStatus()`: Checklist durumunu günceller
- `calculateCompliance()`: Otomatik uyumluluk hesaplaması

### 3. Backend API Endpoints

#### Checklist Şablonları (`/api/checklists/templates`)
- `GET /`: Tüm şablonları listeler (filtreleme desteği)
- `GET /:id`: Şablon detayını getirir
- `POST /`: Yeni şablon oluşturur
- `PUT /:id`: Şablonu günceller
- `DELETE /:id`: Şablonu siler (soft delete)

#### Checklist Kalemleri (`/api/checklists/templates/:id/items`)
- `POST /`: Şablona yeni kalem ekler
- `PUT /items/:itemId`: Kalemi günceller
- `DELETE /items/:itemId`: Kalemi siler
- `PUT /:id/items/reorder`: Kalemleri yeniden sıralar

#### Atama Kuralları (`/api/checklists/assignment-rules`)
- `GET /`: Tüm atama kurallarını listeler
- `POST /`: Yeni atama kuralı oluşturur
- `DELETE /:id`: Atama kuralını siler
- `GET /preview`: Önizleme için uygun checklistleri gösterir

#### İş Emri Checklistleri (`/api/checklists/work-orders/:id/checklists`)
- `POST /generate`: İş emri için checklistleri oluşturur
- `GET /`: İş emri checklistlerini getirir
- `GET /summary`: Checklist özetini ve istatistiklerini getirir
- `POST /:checklistId/responses`: Cevapları kaydeder
- `PUT /:checklistId/status`: Checklist durumunu günceller

### 4. Bakım Kayıtları ile Entegrasyon

`maintenanceController.js`'de `createMaintenanceRecord` fonksiyonu güncellendi:
- Yeni bakım kaydı oluşturulduğunda otomatik olarak checklistler oluşturulur
- `generateWorkOrderChecklists()` servisi çağrılır
- Hata durumunda bakım kaydı oluşturulmaya devam eder

### 5. Frontend Bileşenleri

#### `ChecklistSettings.jsx`
- İSG ve Bakım kontrol listeleri için iki sekme
- Şablon oluşturma/düzenleme/silme
- Kalem (soru) ekleme/düzenleme/silme
- Farklı kalem tipleri: boolean, numeric, text, select, photo
- Atama kuralı yönetimi
- Asset/Kategori/Global kapsam seçimi
- Bakım tipi ataması
- Öncelik ayarı

#### `Settings.jsx` güncellemeleri
- "Bakım Kontrol Ayarları" sekmesi eklendi
- `ChecklistSettings` bileşeni entegre edildi

#### `Layout.jsx` güncellemeleri
- "Bakım Kontrol Ayarları" menü öğesi eklendi
- RBAC ile rol bazlı erişim kontrolü

## Kullanım Talimatları

### 1. Veritabanını Güncelleme

```bash
# Docker kullanıyorsanız
docker-compose down
docker-compose up -d

# PostgreSQL konteynerine bağlanma
docker exec -it <postgres_container_name> psql -U postgres -d asset_management

# Schema ve seed verileri yükleme
\i /docker-entrypoint-initdb.d/01-init-schema.sql
\i /docker-entrypoint-initdb.d/02-seed-data.sql
```

### 2. Backend'i Başlatma

```bash
cd backend
npm install
npm start
```

Backend artık `/api/checklists` endpoint'lerini dinliyor olacak.

### 3. Frontend'i Başlatma

```bash
cd frontend
npm install
npm run dev
```

### 4. Erişim

1. Sisteme giriş yapın (Admin veya Manager rolü gereklidir)
2. Sol menüden "Ayarlar" > "Bakım Kontrol Ayarları" seçin
3. İSG veya Bakım Kontrol Listeleri sekmesine geçin
4. Yeni şablon oluşturun veya mevcutları düzenleyin

## Test Senaryoları

### Senaryo 1: Yeni İSG Kontrol Listesi Oluşturma

1. "Bakım Kontrol Ayarları" sayfasına gidin
2. "İSG Listeleri" sekmesini seçin
3. "Yeni İSG Kontrol Listesi Ekle" butonuna tıklayın
4. Şablon bilgilerini doldurun:
   - Ad: "Genel İSG Kontrol Listesi"
   - Açıklama: "Tüm ekipmanlar için genel İSG kontrolü"
   - Durum: Aktif
5. Sorular ekleyin:
   - Soru 1: "Kişisel koruyucu ekipmanlar kullanılıyor mu?" (boolean, zorunlu)
   - Soru 2: "Acil durum çıkışları engelsiz mi?" (boolean, zorunlu)
   - Soru 3: "Yangın söndürücüler erişilebilir durumda mı?" (select, seçenekler: "Evet", "Hayır", "Kısmen")
6. "Oluştur" butonuna tıklayın
7. Şablonun listeye eklendiğini doğrulayın

### Senaryo 2: Atama Kuralı Ekleme

1. Oluşturduğunuz şablonun yanındaki ok simgesine tıklayın
2. "Kural Ekle" butonuna tıklayın
3. Atama kuralı bilgilerini doldurun:
   - Kapsam: GLOBAL
   - Bakım Tipi: ISG
   - Öncelik: 1
4. "Kaydet" butonuna tıklayın
5. Kuralın listeye eklendiğini doğrulayın

### Senaryo 3: Bakım Kaydı Oluşturma ve Otomatik Checklist Oluşturma

1. "Bakım & Periyodik Kontrol" sayfasına gidin
2. Yeni bir bakım kaydı oluşturun:
   - Ekipman seçin
   - Bakım tipi: "İSG" veya "Günlük Kontrol"
   - Planlı tarih seçin
3. Kaydı oluşturun
4. Sistem otomatik olarak uygun checklistleri oluşturmalı
5. Kayıt detaylarında checklistlerin göründüğünü doğrulayın

### Senaryo 4: Checklist Cevaplama

1. Bakım kaydı detaylarına gidin
2. Checklist bölümünde cevapları doldurun
3. Boolean sorular için Evet/Hayır seçin
4. Numeric sorular için değer girin
5. Select sorular için seçenekten seçim yapın
6. Cevapları kaydedin
7. Sistem otomatik olarak uyumluluk durumunu hesaplamalı

## Teknik Detaylar

### Atama Mantığı

Checklist ataması şu öncelik sırasına göre yapılır:

1. **ASSET scope**: Belirli bir ekipman için özel atama
2. **CATEGORY scope**: Bir kategoriye ait tüm ekipmanlar için atama
3. **GLOBAL scope**: Tüm ekipmanlar için genel atama

Her seviyede `maintenance_type` parametresi kontrol edilir:
- Eşleşen bakım tipi
- 'ALL' (tüm bakım tipleri)

### Uyumluluk Hesaplama

`calculateCompliance()` fonksiyonu şu mantığı kullanır:

- **Boolean**: `true` = uyumlu, `false` = uyumsuz
- **Numeric**: `validation_rules.min` ve `validation_rules.max` aralığında mı?
- **Select**: `validation_rules.non_compliant_values` listesinde değil mi?
- **Text/Photo**: Otomatik hesaplama yok (NULL)

### Snapshot Mekanizması

Checklist instanceları oluşturulurken:
1. Şablon ve kalemlerin o anki durumu JSON olarak kopyalanır
2. `work_order_checklists.snapshot` alanında saklanır
3. Şablon sonradan değişse bile geçmiş kayıtlar bozulmaz

## Güvenlik

### RBAC (Rol Bazlı Erişim Kontrolü)

- **Admin**: Tüm işlemler
- **Manager**: Tüm işlemler
- **Central Manager**: Tüm işlemler
- **Technical Responsible**: Okuma ve cevaplama
- **Diğer roller**: Sadece okuma (kısıtlı)

### Middleware Kullanımı

```javascript
// Ayarlar endpoint'leri (Admin/Manager)
router.get('/templates', auth, authorize('Admin', 'Manager'), ...)

// İş emri endpoint'leri (Daha geniş erişim)
router.post('/work-orders/:id/checklists/generate', auth, authorize('Admin', 'Manager', 'Technical Responsible'), ...)
```

## Performans Optimizasyonları

1. **Indexler**: Tüm foreign key ve sıklıkla sorgulanan alanlara index eklendi
2. **JOIN Optimizasyonu**: Sorgularda gerekli alanlar seçili olarak getiriliyor
3. **Pagination**: Listeleme endpoint'lerinde pagination desteği
4. **Caching**: Frontend tarafında state management ile gereksiz API çağrıları önleniyor

## Gelecek Geliştirmeler

1. **Checklist Şablon Kopyalama**: Mevcut şablonlardan yeni şablon oluşturma
2. **Checklist Versiyonlama**: Şablon versiyon takibi
3. **Gelişmiş Raporlama**: Checklist tamamlanma oranları ve trend analizi
4. **Mobil Uygulama Entegrasyonu**: Mobil cihazlardan checklist doldurma
5. **Otomatik Hatırlatmalar**: Checklist tamamlanma hatırlatmaları
6. **Fotoğraf Yükleme**: Checklist cevaplarına fotoğraf ekleme
7. **İmza**: Checklist tamamlama onayı için imza desteği

## Sorun Giderme

### Checklistler Oluşturulmuyor

1. Bakım tipi doğru ayarlanmış mı?
2. Atama kuralları aktif mi?
3. Ekipman kategorisi doğru mu?
4. Backend loglarını kontrol edin

### Uyumluluk Hesaplanmıyor

1. `validation_rules` doğru JSON formatında mı?
2. `item_type` doğru ayarlanmış mı?
3. Cevap değeri doğru formatta mı?

### Frontend Hataları

1. Tarayıcı konsolunu kontrol edin
2. API endpoint'leri doğru mu?
3. Token geçerli mi?
4. RBAC rolleri doğru ayarlanmış mı?

## İletişim ve Destek

Sorularınız için lütfen proje GitHub sayfasını kullanın veya geliştirici ekibiyle iletişime geçin.

## Lisans

Bu modül, ana projenin lisansı altında dağıtılmaktadır.
