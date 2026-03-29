-- Seed data for eams_equipment_hierarchy table
-- 4-level hierarchy: Level 0 (Ekipman Cinsi) -> Level 1 (Kategori) -> Level 2 (Alt Kategori) -> Level 3 (Tür)

-- Level 0: Ekipman Cinsi (Equipment Types)
INSERT INTO eams_equipment_hierarchy (name, parent_id, level, sort_order) VALUES
('Teknik Ekipman', NULL, 0, 1),
('Tıbbi Cihaz', NULL, 0, 2),
('Bilgi Teknolojileri', NULL, 0, 3),
('Mobilya', NULL, 0, 4),
('Demirbaş', NULL, 0, 5)
ON CONFLICT (name) DO NOTHING;

-- Level 1: Kategoriler (Categories) for Teknik Ekipman
INSERT INTO eams_equipment_hierarchy (name, parent_id, level, sort_order) VALUES
-- Teknik Ekipman Categories
('Elektrik', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Teknik Ekipman' AND level = 0), 1, 1),
('Mekanik', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Teknik Ekipman' AND level = 0), 1, 2),
('HVAC', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Teknik Ekipman' AND level = 0), 1, 3),
('Medikal Gaz', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Teknik Ekipman' AND level = 0), 1, 4),
('Yangın Güvenliği', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Teknik Ekipman' AND level = 0), 1, 5),
('Taşıma Sistemleri', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Teknik Ekipman' AND level = 0), 1, 6),

-- Tıbbi Cihaz Categories
('Yaşam Destek', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Tıbbi Cihaz' AND level = 0), 1, 1),
('Hasta İzleme', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Tıbbi Cihaz' AND level = 0), 1, 2),
('Görüntüleme', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Tıbbi Cihaz' AND level = 0), 1, 3),
('Laboratuvar', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Tıbbi Cihaz' AND level = 0), 1, 4),
('Sterilizasyon', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Tıbbi Cihaz' AND level = 0), 1, 5),
('Diyaliz', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Tıbbi Cihaz' AND level = 0), 1, 6),

-- Bilgi Teknolojileri Categories
('Ağ Altyapısı', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Bilgi Teknolojileri' AND level = 0), 1, 1),
('Sunucu Sistemleri', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Bilgi Teknolojileri' AND level = 0), 1, 2),
('Son Kullanıcı Donanımı', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Bilgi Teknolojileri' AND level = 0), 1, 3),

-- Mobilya Categories
('Hareketli Mobilya', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Mobilya' AND level = 0), 1, 1),

-- Demirbaş Categories
('Sabit İmalatlar', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Demirbaş' AND level = 0), 1, 1)
ON CONFLICT (name) DO NOTHING;

-- Level 2: Alt Kategoriler (Subcategories) for Elektrik
INSERT INTO eams_equipment_hierarchy (name, parent_id, level, sort_order) VALUES
-- Elektrik Subcategories
('Ana Dağıtım Panoları', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Elektrik' AND level = 1), 2, 1),
('Alt Dağıtım Panoları', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Elektrik' AND level = 1), 2, 2),
('Jeneratörler', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Elektrik' AND level = 1), 2, 3),
('UPS Sistemleri', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Elektrik' AND level = 1), 2, 4),
('Aydınlatma Sistemleri', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Elektrik' AND level = 1), 2, 5),
('Topraklama Sistemleri', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Elektrik' AND level = 1), 2, 6),

-- Mekanik Subcategories
('Su Sistemleri', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Mekanik' AND level = 1), 2, 1),
('Kanalizasyon', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Mekanik' AND level = 1), 2, 2),
('Hidrofor Sistemleri', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Mekanik' AND level = 1), 2, 3),
('Basınçlandırma Sistemleri', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Mekanik' AND level = 1), 2, 4),
('Sızdırmazlık Sistemleri', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Mekanik' AND level = 1), 2, 5),

-- HVAC Subcategories
('Klima Santralleri', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'HVAC' AND level = 1), 2, 1),
('Soğutma Üniteleri', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'HVAC' AND level = 1), 2, 2),
('Isıtma Sistemleri', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'HVAC' AND level = 1), 2, 3),
('Havalandırma', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'HVAC' AND level = 1), 2, 4),
('Otomasyon Panoları', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'HVAC' AND level = 1), 2, 5),

-- Medikal Gaz Subcategories
('Medikal Hava', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Medikal Gaz' AND level = 1), 2, 1),
('Oksijen', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Medikal Gaz' AND level = 1), 2, 2),
('Vakum', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Medikal Gaz' AND level = 1), 2, 3),
('Azot', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Medikal Gaz' AND level = 1), 2, 4),
('Karbondioksit', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Medikal Gaz' AND level = 1), 2, 5),

-- Yangın Güvenliği Subcategories
('Yangın Algılama', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Yangın Güvenliği' AND level = 1), 2, 1),
('Yangın Söndürme', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Yangın Güvenliği' AND level = 1), 2, 2),
('Duman Tahliye', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Yangın Güvenliği' AND level = 1), 2, 3),
('Acil Aydınlatma', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Yangın Güvenliği' AND level = 1), 2, 4),

-- Taşıma Sistemleri Subcategories
('Asansörler', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Taşıma Sistemleri' AND level = 1), 2, 1),
('Yürüyen Merdivenler', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Taşıma Sistemleri' AND level = 1), 2, 2),
('Platform Asansörler', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Taşıma Sistemleri' AND level = 1), 2, 3),

-- Yaşam Destek Subcategories
('Ventilatörler', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Yaşam Destek' AND level = 1), 2, 1),
('Oksijen Konsantratörleri', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Yaşam Destek' AND level = 1), 2, 2),
('CPAP Cihazları', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Yaşam Destek' AND level = 1), 2, 3),
('Anestezi Cihazları', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Yaşam Destek' AND level = 1), 2, 4),

-- Hasta İzleme Subcategories
('Hasta Monitörleri', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Hasta İzleme' AND level = 1), 2, 1),
('EKG Cihazları', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Hasta İzleme' AND level = 1), 2, 2),
('Telemetri Sistemleri', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Hasta İzleme' AND level = 1), 2, 3),

-- Görüntüleme Subcategories
('MR Cihazları', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Görüntüleme' AND level = 1), 2, 1),
('BT Cihazları', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Görüntüleme' AND level = 1), 2, 2),
('Ultrason', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Görüntüleme' AND level = 1), 2, 3),
('Röntgen', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Görüntüleme' AND level = 1), 2, 4),
('Anjiyografi', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Görüntüleme' AND level = 1), 2, 5),

-- Laboratuvar Subcategories
('Hematoloji Analizörleri', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Laboratuvar' AND level = 1), 2, 1),
('Biyokimya Analizörleri', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Laboratuvar' AND level = 1), 2, 2),
('Mikroskoplar', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Laboratuvar' AND level = 1), 2, 3),
('Santrifüjler', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Laboratuvar' AND level = 1), 2, 4),

-- Sterilizasyon Subcategories
('Otoklavlar', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Sterilizasyon' AND level = 1), 2, 1),
('Dezenfeksiyon Cihazları', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Sterilizasyon' AND level = 1), 2, 2),
('Plazma Sterilizatörleri', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Sterilizasyon' AND level = 1), 2, 3),

-- Diyaliz Subcategories
('Hemodiyaliz Cihazları', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Diyaliz' AND level = 1), 2, 1),
('Periton Diyaliz Cihazları', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Diyaliz' AND level = 1), 2, 2),
('Su Arıtma Sistemleri', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Diyaliz' AND level = 1), 2, 3),

-- Ağ Altyapısı Subcategories
('Routerlar', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Ağ Altyapısı' AND level = 1), 2, 1),
('Switchler', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Ağ Altyapısı' AND level = 1), 2, 2),
('Firewall', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Ağ Altyapısı' AND level = 1), 2, 3),
('Kablolama', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Ağ Altyapısı' AND level = 1), 2, 4),
('Kablosuz Erişim Noktaları', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Ağ Altyapısı' AND level = 1), 2, 5),

-- Sunucu Sistemleri Subcategories
('Fiziksel Sunucular', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Sunucu Sistemleri' AND level = 1), 2, 1),
('Sanal Sunucular', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Sunucu Sistemleri' AND level = 1), 2, 2),
('Depolama Sistemleri', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Sunucu Sistemleri' AND level = 1), 2, 3),
('Yedekleme Sistemleri', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Sunucu Sistemleri' AND level = 1), 2, 4),

-- Son Kullanıcı Donanımı Subcategories
('Masaüstü Bilgisayarlar', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Son Kullanıcı Donanımı' AND level = 1), 2, 1),
('Dizüstü Bilgisayarlar', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Son Kullanıcı Donanımı' AND level = 1), 2, 2),
('Yazıcılar', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Son Kullanıcı Donanımı' AND level = 1), 2, 3),
('Tarayıcılar', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Son Kullanıcı Donanımı' AND level = 1), 2, 4),

-- Hareketli Mobilya Subcategories
('Sandalyeler', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Hareketli Mobilya' AND level = 1), 2, 1),
('Masalar', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Hareketli Mobilya' AND level = 1), 2, 2),
('Dolaplar', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Hareketli Mobilya' AND level = 1), 2, 3),
('Raflar', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Hareketli Mobilya' AND level = 1), 2, 4),

-- Sabit İmalatlar Subcategories
('Binalar', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Sabit İmalatlar' AND level = 1), 2, 1),
('Tesisler', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Sabit İmalatlar' AND level = 1), 2, 2),
('Yapılar', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Sabit İmalatlar' AND level = 1), 2, 3)
ON CONFLICT (name) DO NOTHING;

-- Level 3: Türler (Types) - Sample entries for each subcategory
INSERT INTO eams_equipment_hierarchy (name, parent_id, level, sort_order) VALUES
-- Ana Dağıtım Panoları Types
('Ana Pano Tip A', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Ana Dağıtım Panoları' AND level = 2), 3, 1),
('Ana Pano Tip B', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Ana Dağıtım Panoları' AND level = 2), 3, 2),

-- Alt Dağıtım Panoları Types
('Alt Pano Tip A', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Alt Dağıtım Panoları' AND level = 2), 3, 1),
('Alt Pano Tip B', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Alt Dağıtım Panoları' AND level = 2), 3, 2),

-- Jeneratörler Types
('Dizel Jeneratör', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Jeneratörler' AND level = 2), 3, 1),
('Benzinli Jeneratör', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Jeneratörler' AND level = 2), 3, 2),
('Gazlı Jeneratör', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Jeneratörler' AND level = 2), 3, 3),

-- UPS Sistemleri Types
('Online UPS', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'UPS Sistemleri' AND level = 2), 3, 1),
('Line-Interactive UPS', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'UPS Sistemleri' AND level = 2), 3, 2),
('Standby UPS', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'UPS Sistemleri' AND level = 2), 3, 3),

-- Aydınlatma Sistemleri Types
('LED Aydınlatma', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Aydınlatma Sistemleri' AND level = 2), 3, 1),
('Fluoresan Aydınlatma', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Aydınlatma Sistemleri' AND level = 2), 3, 2),
('Acil Aydınlatma', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Aydınlatma Sistemleri' AND level = 2), 3, 3),

-- Topraklama Sistemleri Types
('Topraklama Barası', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Topraklama Sistemleri' AND level = 2), 3, 1),
('Topraklama Elektrodu', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Topraklama Sistemleri' AND level = 2), 3, 2),

-- Su Sistemleri Types
('Ana Su Hattı', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Su Sistemleri' AND level = 2), 3, 1),
('Sıcak Su Sistemi', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Su Sistemleri' AND level = 2), 3, 2),
('Soğuk Su Sistemi', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Su Sistemleri' AND level = 2), 3, 3),

-- Kanalizasyon Types
('Atık Su Hattı', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Kanalizasyon' AND level = 2), 3, 1),
('Yağmur Suyu Hattı', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Kanalizasyon' AND level = 2), 3, 2),

-- Hidrofor Sistemleri Types
('Hidrofor Tip A', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Hidrofor Sistemleri' AND level = 2), 3, 1),
('Hidrofor Tip B', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Hidrofor Sistemleri' AND level = 2), 3, 2),

-- Basınçlandırma Sistemleri Types
('Basınçlandırma Ünitesi', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Basınçlandırma Sistemleri' AND level = 2), 3, 1),

-- Sızdırmazlık Sistemleri Types
('Su Sızdırmazlık', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Sızdırmazlık Sistemleri' AND level = 2), 3, 1),
('Gaz Sızdırmazlık', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Sızdırmazlık Sistemleri' AND level = 2), 3, 2),

-- Klima Santralleri Types
('Klima Santrali Tip A', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Klima Santralleri' AND level = 2), 3, 1),
('Klima Santrali Tip B', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Klima Santralleri' AND level = 2), 3, 2),

-- Soğutma Üniteleri Types
('Chiller Tip A', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Soğutma Üniteleri' AND level = 2), 3, 1),
('Chiller Tip B', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Soğutma Üniteleri' AND level = 2), 3, 2),

-- Isıtma Sistemleri Types
('Kazan Sistemi', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Isıtma Sistemleri' AND level = 2), 3, 1),
('Radyatör Sistemi', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Isıtma Sistemleri' AND level = 2), 3, 2),

-- Havalandırma Types
('Mekanik Havalandırma', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Havalandırma' AND level = 2), 3, 1),
('Doğal Havalandırma', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Havalandırma' AND level = 2), 3, 2),

-- Otomasyon Panoları Types
('BMS Pano', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Otomasyon Panoları' AND level = 2), 3, 1),
('HVAC Otomasyon Pano', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Otomasyon Panoları' AND level = 2), 3, 2),

-- Medikal Hava Types
('Medikal Hava Ünitesi', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Medikal Hava' AND level = 2), 3, 1),

-- Oksijen Types
('Oksijen Ünitesi', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Oksijen' AND level = 2), 3, 1),
('Oksijen Tankı', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Oksijen' AND level = 2), 3, 2),

-- Vakum Types
('Vakum Ünitesi', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Vakum' AND level = 2), 3, 1),

-- Azot Types
('Azot Ünitesi', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Azot' AND level = 2), 3, 1),

-- Karbondioksit Types
('CO2 Ünitesi', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Karbondioksit' AND level = 2), 3, 1),

-- Yangın Algılama Types
('Yangın Dedektörü', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Yangın Algılama' AND level = 2), 3, 1),
('Duman Dedektörü', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Yangın Algılama' AND level = 2), 3, 2),
('Isı Dedektörü', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Yangın Algılama' AND level = 2), 3, 3),

-- Yangın Söndürme Types
('Sprinkler Sistemi', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Yangın Söndürme' AND level = 2), 3, 1),
('CO2 Söndürme Sistemi', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Yangın Söndürme' AND level = 2), 3, 2),
('Hidrant Sistemi', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Yangın Söndürme' AND level = 2), 3, 3),

-- Duman Tahliye Types
('Duman Tahliye Fanı', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Duman Tahliye' AND level = 2), 3, 1),

-- Acil Aydınlatma Types
('Acil Aydınlatma Armatürü', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Acil Aydınlatma' AND level = 2), 3, 1),
('Kaçış Yolu İşaretleme', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Acil Aydınlatma' AND level = 2), 3, 2),

-- Asansörler Types
('Yolcu Asansörü', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Asansörler' AND level = 2), 3, 1),
('Yük Asansörü', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Asansörler' AND level = 2), 3, 2),
('Hasta Asansörü', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Asansörler' AND level = 2), 3, 3),

-- Yürüyen Merdivenler Types
('Yürüyen Merdiven Tip A', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Yürüyen Merdivenler' AND level = 2), 3, 1),

-- Platform Asansörler Types
('Platform Asansör Tip A', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Platform Asansörler' AND level = 2), 3, 1),

-- Ventilatörler Types
('İnvasiv Ventilatör', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Ventilatörler' AND level = 2), 3, 1),
('Non-İnvasiv Ventilatör', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Ventilatörler' AND level = 2), 3, 2),

-- Oksijen Konsantratörleri Types
('Oksijen Konsantratör Tip A', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Oksijen Konsantratörleri' AND level = 2), 3, 1),

-- CPAP Cihazları Types
('CPAP Cihaz Tip A', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'CPAP Cihazları' AND level = 2), 3, 1),

-- Anestezi Cihazları Types
('Anestezi Cihaz Tip A', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Anestezi Cihazları' AND level = 2), 3, 1),

-- Hasta Monitörleri Types
('Hasta Monitör Tip A', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Hasta Monitörleri' AND level = 2), 3, 1),
('Hasta Monitör Tip B', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Hasta Monitörleri' AND level = 2), 3, 2),

-- EKG Cihazları Types
('EKG Cihaz Tip A', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'EKG Cihazları' AND level = 2), 3, 1),

-- Telemetri Sistemleri Types
('Telemetri Sistemi Tip A', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Telemetri Sistemleri' AND level = 2), 3, 1),

-- MR Cihazları Types
('MR Cihaz Tip A', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'MR Cihazları' AND level = 2), 3, 1),

-- BT Cihazları Types
('BT Cihaz Tip A', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'BT Cihazları' AND level = 2), 3, 1),

-- Ultrason Types
('Ultrason Cihaz Tip A', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Ultrason' AND level = 2), 3, 1),

-- Röntgen Types
('Röntgen Cihaz Tip A', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Röntgen' AND level = 2), 3, 1),

-- Anjiyografi Types
('Anjiyografi Cihaz Tip A', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Anjiyografi' AND level = 2), 3, 1),

-- Hematoloji Analizörleri Types
('Hematoloji Analizör Tip A', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Hematoloji Analizörleri' AND level = 2), 3, 1),

-- Biyokimya Analizörleri Types
('Biyokimya Analizör Tip A', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Biyokimya Analizörleri' AND level = 2), 3, 1),

-- Mikroskoplar Types
('Mikroskop Tip A', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Mikroskoplar' AND level = 2), 3, 1),

-- Santrifüjler Types
('Santrifüj Tip A', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Santrifüjler' AND level = 2), 3, 1),

-- Otoklavlar Types
('Otoklav Tip A', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Otoklavlar' AND level = 2), 3, 1),

-- Dezenfeksiyon Cihazları Types
('Dezenfeksiyon Cihaz Tip A', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Dezenfeksiyon Cihazları' AND level = 2), 3, 1),

-- Plazma Sterilizatörleri Types
('Plazma Sterilizatör Tip A', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Plazma Sterilizatörleri' AND level = 2), 3, 1),

-- Hemodiyaliz Cihazları Types
('Hemodiyaliz Cihaz Tip A', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Hemodiyaliz Cihazları' AND level = 2), 3, 1),

-- Periton Diyaliz Cihazları Types
('Periton Diyaliz Cihaz Tip A', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Periton Diyaliz Cihazları' AND level = 2), 3, 1),

-- Su Arıtma Sistemleri Types
('Su Arıtma Sistemi Tip A', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Su Arıtma Sistemleri' AND level = 2), 3, 1),

-- Routerlar Types
('Router Tip A', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Routerlar' AND level = 2), 3, 1),

-- Switchler Types
('Switch Tip A', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Switchler' AND level = 2), 3, 1),

-- Firewall Types
('Firewall Tip A', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Firewall' AND level = 2), 3, 1),

-- Kablolama Types
('Ethernet Kablosu', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Kablolama' AND level = 2), 3, 1),
('Fiber Optik Kablo', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Kablolama' AND level = 2), 3, 2),

-- Kablosuz Erişim Noktaları Types
('Kablosuz Erişim Noktası Tip A', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Kablosuz Erişim Noktaları' AND level = 2), 3, 1),

-- Fiziksel Sunucular Types
('Fiziksel Sunucu Tip A', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Fiziksel Sunucular' AND level = 2), 3, 1),

-- Sanal Sunucular Types
('Sanal Sunucu Tip A', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Sanal Sunucular' AND level = 2), 3, 1),

-- Depolama Sistemleri Types
('Depolama Sistemi Tip A', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Depolama Sistemleri' AND level = 2), 3, 1),

-- Yedekleme Sistemleri Types
('Yedekleme Sistemi Tip A', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Yedekleme Sistemleri' AND level = 2), 3, 1),

-- Masaüstü Bilgisayarlar Types
('Masaüstü Bilgisayar Tip A', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Masaüstü Bilgisayarlar' AND level = 2), 3, 1),

-- Dizüstü Bilgisayarlar Types
('Dizüstü Bilgisayar Tip A', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Dizüstü Bilgisayarlar' AND level = 2), 3, 1),

-- Yazıcılar Types
('Yazıcı Tip A', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Yazıcılar' AND level = 2), 3, 1),

-- Tarayıcılar Types
('Tarayıcı Tip A', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Tarayıcılar' AND level = 2), 3, 1),

-- Sandalyeler Types
('Sandalye Tip A', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Sandalyeler' AND level = 2), 3, 1),

-- Masalar Types
('Masa Tip A', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Masalar' AND level = 2), 3, 1),

-- Dolaplar Types
('Dolap Tip A', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Dolaplar' AND level = 2), 3, 1),

-- Raflar Types
('Raf Tip A', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Raflar' AND level = 2), 3, 1),

-- Binalar Types
('Bina Tip A', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Binalar' AND level = 2), 3, 1),

-- Tesisler Types
('Tesis Tip A', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Tesisler' AND level = 2), 3, 1),

-- Yapılar Types
('Yapı Tip A', (SELECT id FROM eams_equipment_hierarchy WHERE name = 'Yapılar' AND level = 2), 3, 1)
ON CONFLICT (name) DO NOTHING;
