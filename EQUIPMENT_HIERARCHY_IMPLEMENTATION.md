# Ekipman Cinsi Hiyerarşisi Modülü - Uygulama Özeti

## Genel Bakış

Bu modül, varlık yönetim sisteminize 4 seviyeli (Ekipman Cinsi → Kategori → Alt Kategori → Tür) bir ağaç yapısı ile ekipman sınıflandırma sistemi ekler.

## 📋 İçerik

### 1. Veritabanı Mimarisi

#### Tablo: `equipment_hierarchy`
- **id**: SERIAL PRIMARY KEY
- **name**: VARCHAR(255) NOT NULL - Düğüm adı
- **parent_id**: INTEGER REFERENCES equipment_hierarchy(id) ON DELETE CASCADE - Üst düğüm referansı (Adjacency List modeli)
- **level**: INTEGER NOT NULL CHECK (level >= 0 AND level <= 3) - Hiyerarşi seviyesi (0-3)
- **sort_order**: INTEGER DEFAULT 0 - Sıralama sırası
- **is_active**: BOOLEAN DEFAULT true - Aktiflik durumu
- **created_at**: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- **updated_at**: TIMESTAMP DEFAULT CURRENT_TIMESTAMP

#### Özellikler:
- **Cascade Silme**: Bir düğüm silindiğinde tüm alt dalları otomatik silinir
- **Seviye Doğrulama**: Tetikleyiciler (triggers) ile seviye ilişkileri otomatik doğrulanır
- **Performans İndeksleri**: parent_id ve level alanları için optimize edilmiş indeksler

### 2. Backend API

#### Endpoint'ler:

| Method | Endpoint | Açıklama | Yetkilendirme |
|--------|-----------|-----------|----------------|
| GET | `/api/settings/equipment-hierarchy` | Tüm hiyerarşiyi veya belirli bir dalı getirir | Tüm kullanıcılar |
| GET | `/api/settings/equipment-hierarchy/:id` | Belirli bir düğümü getirir | Tüm kullanıcılar |
| POST | `/api/settings/equipment-hierarchy` | Yeni bir düğüm ekler | Admin, Central Manager, Hospital Manager, Manager, Administrative Responsible, Technical Responsible |
| PUT | `/api/settings/equipment-hierarchy/:id` | Düğüm günceller veya taşır | Admin, Central Manager, Hospital Manager, Manager, Administrative Responsible, Technical Responsible |
| DELETE | `/api/settings/equipment-hierarchy/:id` | Düğümü siler | Admin, Central Manager, Hospital Manager, Manager, Administrative Responsible, Technical Responsible |
| PATCH | `/api/settings/equipment-hierarchy/:id/move` | Düğümü taşır | Admin, Central Manager, Hospital Manager, Manager, Administrative Responsible, Technical Responsible |

#### Özellikler:
- **Recursive Hiyerarşi**: Tüm ağacı hiyerarşik JSON olarak döndürür
- **Döngü Kontrolü**: Dairesel referansları önler
- **Seviye Doğrulama**: Parent-child ilişkilerini doğrular
- **Otomatik Sıralama**: Yeni düğümler için otomatik sort_order ataması

### 3. Frontend Bileşeni

#### Component: `EquipmentHierarchy.jsx`

**Özellikler:**
- **Ağaç Görünümü**: Genişletilebilir/daraltılabilir (collapsible) liste yapısı
- **4 Seviye Gösterimi**: Her seviye için farklı ikon ve renk şeması
  - Seviye 0 (Ekipman Cinsi): 📦 Paket ikonu, mor renk
  - Seviye 1 (Kategori): 📚 Katman ikonu, mavi renk
  - Seviye 2 (Alt Kategori): 📁 Klasör ikonu, yeşil renk
  - Seviye 3 (Tür): 🏷️ Etiket ikonu, turuncu renk
- **Etkileşimli Butonlar**: Her satırda Ekle (+), Düzenle (✎), Sil (🗑️) butonları
- **Akıllı Ekleme**: "Ekle" butonu, tıklandığı seviyenin altına otomatik olarak bir alt seviye türünde yeni kayıt açar
- **Modern UI**: Tailwind CSS ile temiz ve responsive tasarım
- **Hata Yönetimi**: Kullanıcı dostu hata mesajları ve onay diyalogları

**Durum Yönetimi:**
- React Hooks (useState, useEffect) ile state yönetimi
- LocalStorage'dan token alma
- API istekleri için fetch API

### 4. Seed Verileri

#### Başlangıç Verileri:

**Seviye 0 - Ekipman Cinsi (5 adet):**
1. Teknik Ekipman
2. Tıbbi Cihaz
3. Bilgi Teknolojileri
4. Mobilya
5. Demirbaş

**Seviye 1 - Kategoriler (19 adet):**
- Teknik Ekipman: Elektrik, Mekanik, HVAC, Medikal Gaz, Yangın Güvenliği, Taşıma Sistemleri
- Tıbbi Cihaz: Yaşam Destek, Hasta İzleme, Görüntüleme, Laboratuvar, Sterilizasyon, Diyaliz
- Bilgi Teknolojileri: Ağ Altyapısı, Sunucu Sistemleri, Son Kullanıcı Donanımı
- Mobilya: Hareketli Mobilya
- Demirbaş: Sabit İmalatlar

**Seviye 2 - Alt Kategoriler (50+ adet):**
- Elektrik: Ana Dağıtım Panoları, Alt Dağıtım Panoları, Jeneratörler, UPS Sistemleri, Aydınlatma Sistemleri, Topraklama Sistemleri
- Mekanik: Su Sistemleri, Kanalizasyon, Hidrofor Sistemleri, Basınçlandırma Sistemleri, Sızdırmazlık Sistemleri
- HVAC: Klima Santralleri, Soğutma Üniteleri, Isıtma Sistemleri, Havalandırma, Otomasyon Panoları
- ... ve daha fazlası

**Seviye 3 - Türler (100+ adet):**
- Her alt kategori için örnek türler (örn: Ana Pano Tip A, Dizel Jeneratör, Online UPS, vb.)

## 🚀 Kurulum ve Test

### 1. Veritabanı Migrasyonunu Çalıştırın

```bash
# Backend dizinine gidin
cd backend

# Migrasyonu çalıştırın
node database/migrations/004-create-equipment-hierarchy.js up
```

### 2. Seed Verilerini Yükleyin

```bash
# Docker container içinde PostgreSQL'e bağlanın
docker exec -i postgres psql -U asset_admin -d asset_management < database/init/03-seed-equipment-hierarchy.sql
```

### 3. Backend'i Başlatın

```bash
# Backend dizinine gidin
cd backend

# Bağımlılıkları yükleyin (yapılmadıysa)
npm install

# Backend'i başlatın
npm start
```

### 4. Frontend'i Başlatın

```bash
# Frontend dizinine gidin
cd frontend

# Bağımlılıkları yükleyin (yapılmadıysa)
npm install

# Frontend'i başlatın
npm run dev
```

### 5. Uygulamayı Test Edin

1. Tarayıcınızda `http://localhost:5173` adresine gidin
2. Giriş yapın (Admin veya yetkili bir kullanıcı ile)
3. Sol menüden **"Ekipman Cinsi Ayarları"** seçeneğine tıklayın
4. Hiyerarşiyi görüntüleyin, düzenleyin ve yeni düğümler ekleyin

## 📁 Dosya Yapısı

### Backend Dosyaları:
```
backend/
├── database/
│   └── migrations/
│       └── 004-create-equipment-hierarchy.js  # Veritabanı migrasyonu
├── src/
│   ├── controllers/
│   │   └── settingsController.js               # Controller fonksiyonları (eklendi)
│   └── routes/
│       └── settings.js                        # API rotaları (eklendi)
```

### Frontend Dosyaları:
```
frontend/
├── src/
│   ├── components/
│   │   └── EquipmentHierarchy.jsx             # Ana bileşen
│   ├── layouts/
│   │   └── Layout.jsx                        # Navigasyon menüsü (güncellendi)
│   └── pages/
│       └── Settings.jsx                       # Sayfa entegrasyonu (güncellendi)
```

### Veritabanı Dosyaları:
```
database/
└── init/
    └── 03-seed-equipment-hierarchy.sql       # Seed verileri
```

## 🔧 Teknik Özellikler

### Veritabanı:
- **PostgreSQL**: Güvenilir ve ölçeklenebilir ilişkisel veritabanı
- **Adjacency List Modeli**: Esnek hiyerarşi yönetimi
- **Triggers**: Otomatik veri bütünlüğü kontrolü
- **Cascade Delete**: Referans bütünlüğü

### Backend:
- **Node.js**: Hızlı ve ölçeklenebilir sunucu tarafı
- **Express.js**: Web framework
- **pg**: PostgreSQL client
- **JWT Authentication**: Güvenli API erişimi

### Frontend:
- **React**: Modern UI kütüphanesi
- **Vite**: Hızlı build tool
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: İkon kütüphanesi
- **React Router**: Sayfa yönlendirme

## 🎯 Kullanım Senaryoları

### 1. Yeni Ekipman Cinsi Ekleme:
1. Sayfanın üst kısmındaki "Yeni Ekipman Cinsi Ekle" butonuna tıklayın
2. İsim girin (örn: "Gıda Ekipmanları")
3. "Ekle" butonuna tıklayın

### 2. Kategori Ekleme:
1. Bir ekipman cinsinin yanındaki "+" butonuna tıklayın
2. Kategori adı girin (örn: "Soğutma")
3. "Ekle" butonuna tıklayın

### 3. Düğüm Düzenleme:
1. Herhangi bir düğümün yanındaki "✎" butonuna tıklayın
2. İsmi güncelleyin
3. "Kaydet" butonuna tıklayın

### 4. Düğüm Silme:
1. Bir düğümün yanındaki "🗑️" butonuna tıklayın
2. Onay diyalogunda "Sil" butonuna tıklayın
3. **Not**: Alt dalları olan düğümler silinemez

### 5. Hiyerarşi Genişletme/Daraltma:
1. Bir düğümün yanındaki ok ikonuna tıklayın
2. Alt dalları genişletilir veya daraltılır

## 🔒 Güvenlik

- **Rol Bazlı Erişim Kontrolü**: Sadece yetkili kullanıcılar düzenleme yapabilir
- **JWT Authentication**: Tüm API istekleri doğrulanır
- **Input Validation**: Kullanıcı girdileri doğrulanır
- **SQL Injection Koruması**: Parameterized queries kullanılır
- **XSS Koruması**: React'in otomatik XSS koruması

## 📊 Performans

- **Optimize Edilmiş Sorgular**: İndeksler kullanılır
- **Lazy Loading**: Sadece gerekli veriler yüklenir
- **Recursive Caching**: Hiyerarşi verileri önbelleğe alınabilir
- **Efficient State Management**: React hooks ile optimize edilmiş state yönetimi

## 🐛 Hata Ayıklama

### Yaygın Sorunlar:

1. **"Parent node not found" hatası:**
   - Parent ID geçersiz olabilir
   - Parent düğüm önce silinmiş olabilir

2. **"Level must be parent level + 1" hatası:**
   - Seviye ilişkisi yanlış olabilir
   - Parent düğümün seviyesini kontrol edin

3. **"Cannot delete node with children" hatası:**
   - Alt dalları olan düğümler silinemez
   - Önce alt dalları silin veya taşıyın

4. **"Circular reference detected" hatası:**
   - Döngüsel parent-child ilişkisi tespit edildi
   - Hiyerarşiyi düzeltin

## 🔄 Gelecek Geliştirmeler

- **Drag & Drop**: Sürükle-bırak ile sıralama değiştirme
- **Bulk Operations**: Toplu düzenleme ve silme
- **Import/Export**: Excel/CSV ile veri içe/dışa aktarma
- **Search & Filter**: Hızlı arama ve filtreleme
- **Version History**: Değişiklik geçmişi
- **Audit Log**: Kullanıcı aktivite logları
- **Multi-language**: Çok dil desteği

## 📞 Destek

Sorunlarınız veya sorularınız için:
- Proje dokümantasyonunu inceleyin
- GitHub issues bölümünü kontrol edin
- Geliştirici ekibi ile iletişime geçin

---

**Not**: Bu modül, Docker üzerinde çalışan, PostgreSQL veritabanına sahip, Node.js backend ve React frontend mimarili mevcut uygulamanıza tam entegre edilmiştir.
