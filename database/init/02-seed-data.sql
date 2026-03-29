-- Seed Data for Asset Management System

-- Insert Default Roles
INSERT INTO core_roles (name, description, scope, permissions, is_system) VALUES
('User', 'Standard user with basic access', 'FACILITY', '[]', true),
('Technical Responsible', 'Responsible for technical maintenance and repairs', 'FACILITY', '[]', true),
('Administrative Responsible', 'Responsible for administrative tasks', 'FACILITY', '[]', true),
('Biomedical Responsible', 'Responsible for biomedical equipment maintenance', 'FACILITY', '[]', true),
('Information Systems Responsible', 'Responsible for IT and information systems', 'FACILITY', '[]', true),
('Manager', 'Department manager or deputy manager', 'FACILITY', '[]', true),
('Hospital Manager', 'General Manager, Deputy General Manager, etc.', 'FACILITY', '[]', true),
('Central Manager', 'Central directorate managers', 'SYSTEM', '[]', true),
('Admin', 'System administrators with full access', 'SYSTEM', '["all"]', true)
ON CONFLICT (name) DO NOTHING;

-- Insert Area Types
INSERT INTO core_area_types (name, category, is_system) VALUES
-- Klinik Alan
('Klinik Alan', 'Klinik Alan', true),
('Laboratuvar', 'Klinik Alan', true),
('Radyoloji Birimi', 'Klinik Alan', true),
-- İdari Alan
('İdari Alan', 'İdari Alan', true),
('Ofis', 'İdari Alan', true),
('Kirli Deposu', 'İdari Alan', true),
-- Teknik Alan
('Teknik Alan', 'Teknik Alan', true),
('Elektrik Mahal', 'Teknik Alan', true),
('Mekanik Mahal', 'Teknik Alan', true),
-- Destek Alan
('Destek Alan', 'Destek Alan', true),
('Non-medikal Depo', 'Destek Alan', true),
('Sarf Depo', 'Destek Alan', true),
-- Ortak Alan
('Ortak Alan', 'Ortak Alan', true),
('Mutfak', 'Ortak Alan', true),
('Dinlenme Alanı', 'Ortak Alan', true)
ON CONFLICT (name) DO NOTHING;

-- Insert Asset Categories
INSERT INTO eams_asset_categories (name, category_type, description, is_system) VALUES
-- Elektrik
('Elektrik', 'Elektrik', 'Electrical equipment and systems', true),
('Güç Kaynağı & Dağıtım', 'Elektrik', 'Power source and distribution systems', true),
('Trafo', 'Elektrik', 'Transformers', true),
('Ana Pano', 'Elektrik', 'Main electrical panels', true),
('Tali Pano', 'Elektrik', 'Sub electrical panels', true),
-- Yedek Güç
('Yedek Güç', 'Elektrik', 'Backup power systems', true),
('Jeneratör', 'Elektrik', 'Generators', true),
('ATS', 'Elektrik', 'Automatic Transfer Switch', true),
('Yakıt Sistemi', 'Elektrik', 'Fuel systems', true),
-- Mekanik
('Mekanik', 'Mekanik', 'Mechanical equipment and systems', true),
('Havalandırma', 'Mekanik', 'Ventilation systems', true),
('Filtre', 'Mekanik', 'Filters', true),
-- Medikal
('Medikal', 'Medikal', 'Medical equipment', true),
-- Bilgi Sistemleri
('Bilgi Sistemleri', 'Bilgi Sistemleri', 'IT and information systems equipment', true)
ON CONFLICT (name) DO NOTHING;

-- Insert Measurement Units
INSERT INTO eams_measurement_units (name, symbol, unit_type, description, is_system) VALUES
('Watt', 'W', 'Electrical', 'Small device power consumption', true)
ON CONFLICT (name) DO NOTHING;

INSERT INTO eams_measurement_units (name, symbol, unit_type, description, is_system) VALUES
('Kilowatt', 'kW', 'Electrical', 'Generator, AC unit and large motor power', true)
ON CONFLICT (name) DO NOTHING;

INSERT INTO eams_measurement_units (name, symbol, unit_type, description, is_system) VALUES
('Kilovolt-Amper', 'kVA', 'Electrical', 'Transformer and UPS capacities', true)
ON CONFLICT (name) DO NOTHING;

INSERT INTO eams_measurement_units (name, symbol, unit_type, description, is_system) VALUES
('Amper', 'A', 'Electrical', 'Current intensity (panel and fuse capacities)', true)
ON CONFLICT (name) DO NOTHING;

INSERT INTO eams_measurement_units (name, symbol, unit_type, description, is_system) VALUES
('Volt', 'V', 'Electrical', 'Operating voltage', true)
ON CONFLICT (name) DO NOTHING;

INSERT INTO eams_measurement_units (name, symbol, unit_type, description, is_system) VALUES
('Kilogram', 'kg', 'Weight', 'Device weight or laundry capacity', true)
ON CONFLICT (name) DO NOTHING;

INSERT INTO eams_measurement_units (name, symbol, unit_type, description, is_system) VALUES
('Ton', 't', 'Weight', 'Chiller groups or large construction materials', true)
ON CONFLICT (name) DO NOTHING;

INSERT INTO eams_measurement_units (name, symbol, unit_type, description, is_system) VALUES
('Litre', 'L', 'Volume', 'Water tanks, fuel tanks or autoclave volumes', true)
ON CONFLICT (name) DO NOTHING;

INSERT INTO eams_measurement_units (name, symbol, unit_type, description, is_system) VALUES
('Metrekup', 'm3', 'Volume', 'Air flow or large storage core_areas', true)
ON CONFLICT (name) DO NOTHING;

INSERT INTO eams_measurement_units (name, symbol, unit_type, description, is_system) VALUES
('BTU/h', 'BTU/h', 'Heating', 'AC and cooling capacity', true)
ON CONFLICT (name) DO NOTHING;

INSERT INTO eams_measurement_units (name, symbol, unit_type, description, is_system) VALUES
('Kilokalori/Saat', 'kcal/h', 'Heating', 'Heating boiler and heater capacity', true)
ON CONFLICT (name) DO NOTHING;

INSERT INTO eams_measurement_units (name, symbol, unit_type, description, is_system) VALUES
('Bar', 'bar', 'Pressure', 'Compressor, hydrophore and medical gas pressure', true)
ON CONFLICT (name) DO NOTHING;

INSERT INTO eams_measurement_units (name, symbol, unit_type, description, is_system) VALUES
('Psi', 'psi', 'Pressure', 'Tire or sensitive gas pressures', true)
ON CONFLICT (name) DO NOTHING;

INSERT INTO eams_measurement_units (name, symbol, unit_type, description, is_system) VALUES
('Gigabyte', 'GB', 'Digital', 'RAM and disk capacity', true)
ON CONFLICT (name) DO NOTHING;

INSERT INTO eams_measurement_units (name, symbol, unit_type, description, is_system) VALUES
('Terabyte', 'TB', 'Digital', 'Server and camera recording storage capacity', true)
ON CONFLICT (name) DO NOTHING;

INSERT INTO eams_measurement_units (name, symbol, unit_type, description, is_system) VALUES
('Gigahertz', 'GHz', 'Digital', 'Processor speed', true)
ON CONFLICT (name) DO NOTHING;

INSERT INTO eams_measurement_units (name, symbol, unit_type, description, is_system) VALUES
('Megabit/Saniye', 'Mbps', 'Digital', 'Internet and network speed', true)
ON CONFLICT (name) DO NOTHING;

INSERT INTO eams_measurement_units (name, symbol, unit_type, description, is_system) VALUES
('Megapiksel', 'MP', 'Digital', 'Camera resolution', true)
ON CONFLICT (name) DO NOTHING;

INSERT INTO eams_measurement_units (name, symbol, unit_type, description, is_system) VALUES
('Joule', 'J', 'Medical', 'Defibrillator energy level', true)
ON CONFLICT (name) DO NOTHING;

INSERT INTO eams_measurement_units (name, symbol, unit_type, description, is_system) VALUES
('Litre/Dakika', 'L/min', 'Medical', 'Oxygen and flow meter capacity', true)
ON CONFLICT (name) DO NOTHING;

INSERT INTO eams_measurement_units (name, symbol, unit_type, description, is_system) VALUES
('Mililitre/Saat', 'ml/h', 'Medical', 'Infusion pump speed', true)
ON CONFLICT (name) DO NOTHING;

INSERT INTO eams_measurement_units (name, symbol, unit_type, description, is_system) VALUES
('Miliamper-saniye', 'mAs', 'Medical', 'X-ray beam power', true)
ON CONFLICT (name) DO NOTHING;

-- Insert Energy Types
INSERT INTO eams_energy_types (name, description, is_system) VALUES
('Elektrik', 'Electric energy', true),
('Doğalgaz', 'Natural gas', true),
('Fuel-oil', 'Fuel oil', true),
('LPG', 'LPG', true),
('Güneş Enerjisi', 'Solar energy', true),
('Rüzgar Enerjisi', 'Wind energy', true)
ON CONFLICT DO NOTHING;

-- Insert Authorized Departments
INSERT INTO core_authorized_departments (name, description, is_system) VALUES
('Teknik Hizmetler', 'Technical Services Department', true),
('Biyomedikal', 'Biomedical Department', true),
('İdari ve Destek Hizmetleri', 'Administrative and Support Services', true),
('Bilgi Sistemleri', 'Information Systems Department', true),
('Satınalma', 'Purchasing Department', true),
('Eczane', 'Pharmacy Department', true),
('Radyoloji', 'Radiology Department', true)
ON CONFLICT DO NOTHING;

-- Insert Maintenance Types
INSERT INTO eams_maintenance_types (name, description, is_periodic, is_system) VALUES
('Periyodik Bakım', 'Regular scheduled maintenance', true, true),
('Önleyici Bakım', 'Preventive maintenance', true, true),
('Düzeltici Bakım', 'Corrective maintenance', false, true),
('Acil Bakım', 'Emergency maintenance', false, true),
('Yıllık Bakım', 'Annual maintenance', true, true),
('Aylık Bakım', 'Monthly maintenance', true, true),
('Haftalık Bakım', 'Weekly maintenance', true, true),
('Günlük Kontrol', 'Daily inspection', true, true)
ON CONFLICT DO NOTHING;

-- Insert System Settings
INSERT INTO core_system_settings (setting_key, setting_value, setting_type, description, is_system) VALUES
('system_name', 'Varlık Yönetim Sistemi', 'string', 'System name', true),
('company_name', 'Şirket Adı', 'string', 'Company name', true),
('default_language', 'tr', 'string', 'Default language', true),
('timezone', 'Europe/Istanbul', 'string', 'System timezone', true),
('date_format', 'DD.MM.YYYY', 'string', 'Date format', true),
('time_format', 'HH:mm', 'string', 'Time format', true),
('maintenance_reminder_days', '7', 'number', 'Days before maintenance reminder', true),
('fault_request_auto_assign', 'false', 'boolean', 'Auto assign fault requests', true),
('oracle_sync_enabled', 'true', 'boolean', 'Oracle user sync enabled', true),
('oracle_sync_interval', '3600', 'number', 'Oracle sync interval in seconds', true)
ON CONFLICT (setting_key) DO NOTHING;

-- Insert Default Admin User (password: admin123 - should be changed in production)
-- Password hash for 'admin123' using bcrypt
INSERT INTO core_users (oracle_id, first_name, last_name, email, phone, unit, position, employee_id, password_hash, is_active) VALUES
('ADMIN001', 'System', 'Administrator', 'admin@assetmanagement.com', '+905555555555', 'IT', 'System Administrator', 'ADMIN001', '$2a$10$58cT7U0SX/MTGGF8IqChfOB6nfwDiFdclxn.lMteIlxBgLTVuXVL.', true)
ON CONFLICT (oracle_id) DO NOTHING;

-- Assign Admin role to default admin user
INSERT INTO core_user_roles (user_id, role_id, assigned_by, assigned_at)
SELECT u.id, r.id, u.id, CURRENT_TIMESTAMP
FROM core_users u, core_roles r
WHERE u.oracle_id = 'ADMIN001' AND r.name = 'Admin'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- CHECKLIST MODULE SEED DATA
-- ============================================================================

-- Insert Default Checklist Templates
-- 1. General ISG Checklist (Global scope)
INSERT INTO cms_checklist_templates (name, description, checklist_type, is_active) VALUES
('Genel İSG Kontrol Listesi', 'Tüm ekipmanlar için genel iş sağlığı ve güvenliği kontrolü', 'ISG', true)
ON CONFLICT DO NOTHING;

-- 2. Monthly Maintenance Checklist for Compressors
INSERT INTO cms_checklist_templates (name, description, checklist_type, is_active) VALUES
('Kompresör Aylık Bakım Kontrol Listesi', 'Kompresörler için aylık bakım kontrolü', 'BAKIM', true)
ON CONFLICT DO NOTHING;

-- 3. General Daily Inspection Checklist
INSERT INTO cms_checklist_templates (name, description, checklist_type, is_active) VALUES
('Günlük Gözetim Kontrol Listesi', 'Tüm kritik ekipmanlar için günlük gözetim', 'GENEL', true)
ON CONFLICT DO NOTHING;

-- Insert Checklist Items for General ISG Checklist
-- Get the template ID first (we'll use a subquery in the inserts)
WITH isg_template AS (
    SELECT id FROM cms_checklist_templates WHERE name = 'Genel İSG Kontrol Listesi' LIMIT 1
)
INSERT INTO cms_checklist_items (template_id, order_index, question, item_type, is_required, options, validation_rules)
SELECT 
    t.id, 
    1, 
    'Kişisel koruyucu ekipmanlar (KKE) kullanılıyor mu?', 
    'boolean', 
    true, 
    NULL, 
    NULL
FROM isg_template t
ON CONFLICT DO NOTHING;

WITH isg_template AS (
    SELECT id FROM cms_checklist_templates WHERE name = 'Genel İSG Kontrol Listesi' LIMIT 1
)
INSERT INTO cms_checklist_items (template_id, order_index, question, item_type, is_required, options, validation_rules)
SELECT 
    t.id, 
    2, 
    'Ekipman çevresinde güvenlik uyarıları işaretli mi?', 
    'boolean', 
    true, 
    NULL, 
    NULL
FROM isg_template t
ON CONFLICT DO NOTHING;

WITH isg_template AS (
    SELECT id FROM cms_checklist_templates WHERE name = 'Genel İSG Kontrol Listesi' LIMIT 1
)
INSERT INTO cms_checklist_items (template_id, order_index, question, item_type, is_required, options, validation_rules)
SELECT 
    t.id, 
    3, 
    'Acil durum çıkışları engelsiz mi?', 
    'boolean', 
    true, 
    NULL, 
    NULL
FROM isg_template t
ON CONFLICT DO NOTHING;

WITH isg_template AS (
    SELECT id FROM cms_checklist_templates WHERE name = 'Genel İSG Kontrol Listesi' LIMIT 1
)
INSERT INTO cms_checklist_items (template_id, order_index, question, item_type, is_required, options, validation_rules)
SELECT 
    t.id, 
    4, 
    'Yangın söndürücüler erişilebilir durumda ve son kullanma tarihi geçerli mi?', 
    'select', 
    true, 
    '["Evet", "Hayır", "Kısmen"]'::jsonb,
    '{"non_compliant_values": ["Hayır"]}'::jsonb
FROM isg_template t
ON CONFLICT DO NOTHING;

WITH isg_template AS (
    SELECT id FROM cms_checklist_templates WHERE name = 'Genel İSG Kontrol Listesi' LIMIT 1
)
INSERT INTO cms_checklist_items (template_id, order_index, question, item_type, is_required, options, validation_rules)
SELECT 
    t.id, 
    5, 
    'Güvenlik talimatları görülebilir yerlerde asılı mı?', 
    'boolean', 
    true, 
    NULL, 
    NULL
FROM isg_template t
ON CONFLICT DO NOTHING;

-- Insert Checklist Items for Compressor Monthly Maintenance Checklist
WITH compressor_template AS (
    SELECT id FROM cms_checklist_templates WHERE name = 'Kompresör Aylık Bakım Kontrol Listesi' LIMIT 1
)
INSERT INTO cms_checklist_items (template_id, order_index, question, item_type, is_required, options, validation_rules)
SELECT 
    t.id, 
    1, 
    'Yağ seviyesi normal aralıkta mı?', 
    'boolean', 
    true, 
    NULL, 
    NULL
FROM compressor_template t
ON CONFLICT DO NOTHING;

WITH compressor_template AS (
    SELECT id FROM cms_checklist_templates WHERE name = 'Kompresör Aylık Bakım Kontrol Listesi' LIMIT 1
)
INSERT INTO cms_checklist_items (template_id, order_index, question, item_type, is_required, options, validation_rules)
SELECT 
    t.id, 
    2, 
    'Hava filtresi temiz mi?', 
    'boolean', 
    true, 
    NULL, 
    NULL
FROM compressor_template t
ON CONFLICT DO NOTHING;

WITH compressor_template AS (
    SELECT id FROM cms_checklist_templates WHERE name = 'Kompresör Aylık Bakım Kontrol Listesi' LIMIT 1
)
INSERT INTO cms_checklist_items (template_id, order_index, question, item_type, is_required, options, validation_rules)
SELECT 
    t.id, 
    3, 
    'Çalışma basıncı (bar)', 
    'numeric', 
    true, 
    NULL, 
    '{"min": 6, "max": 8, "unit": "bar"}'::jsonb
FROM compressor_template t
ON CONFLICT DO NOTHING;

WITH compressor_template AS (
    SELECT id FROM cms_checklist_templates WHERE name = 'Kompresör Aylık Bakım Kontrol Listesi' LIMIT 1
)
INSERT INTO cms_checklist_items (template_id, order_index, question, item_type, is_required, options, validation_rules)
SELECT 
    t.id, 
    4, 
    'Sıcaklık (°C)', 
    'numeric', 
    true, 
    NULL, 
    '{"min": 60, "max": 90, "unit": "°C"}'::jsonb
FROM compressor_template t
ON CONFLICT DO NOTHING;

WITH compressor_template AS (
    SELECT id FROM cms_checklist_templates WHERE name = 'Kompresör Aylık Bakım Kontrol Listesi' LIMIT 1
)
INSERT INTO cms_checklist_items (template_id, order_index, question, item_type, is_required, options, validation_rules)
SELECT 
    t.id, 
    5, 
    'Vibrasyon seviyesi normal mi?', 
    'boolean', 
    true, 
    NULL, 
    NULL
FROM compressor_template t
ON CONFLICT DO NOTHING;

WITH compressor_template AS (
    SELECT id FROM cms_checklist_templates WHERE name = 'Kompresör Aylık Bakım Kontrol Listesi' LIMIT 1
)
INSERT INTO cms_checklist_items (template_id, order_index, question, item_type, is_required, options, validation_rules)
SELECT 
    t.id, 
    6, 
    'Sızıntı tespit edildi mi?', 
    'boolean', 
    true, 
    NULL, 
    NULL
FROM compressor_template t
ON CONFLICT DO NOTHING;

WITH compressor_template AS (
    SELECT id FROM cms_checklist_templates WHERE name = 'Kompresör Aylık Bakım Kontrol Listesi' LIMIT 1
)
INSERT INTO cms_checklist_items (template_id, order_index, question, item_type, is_required, options, validation_rules)
SELECT 
    t.id, 
    7, 
    'Emniyet valfi çalışıyor mu?', 
    'boolean', 
    true, 
    NULL, 
    NULL
FROM compressor_template t
ON CONFLICT DO NOTHING;

WITH compressor_template AS (
    SELECT id FROM cms_checklist_templates WHERE name = 'Kompresör Aylık Bakım Kontrol Listesi' LIMIT 1
)
INSERT INTO cms_checklist_items (template_id, order_index, question, item_type, is_required, options, validation_rules)
SELECT 
    t.id, 
    8, 
    'Bakım notları', 
    'text', 
    false, 
    NULL, 
    NULL
FROM compressor_template t
ON CONFLICT DO NOTHING;

-- Insert Checklist Items for General Daily Inspection Checklist
WITH daily_template AS (
    SELECT id FROM cms_checklist_templates WHERE name = 'Günlük Gözetim Kontrol Listesi' LIMIT 1
)
INSERT INTO cms_checklist_items (template_id, order_index, question, item_type, is_required, options, validation_rules)
SELECT 
    t.id, 
    1, 
    'Ekipman genel durumu', 
    'select', 
    true, 
    '["Mükemmel", "İyi", "Orta", "Kötü"]'::jsonb,
    '{"non_compliant_values": ["Kötü"]}'::jsonb
FROM daily_template t
ON CONFLICT DO NOTHING;

WITH daily_template AS (
    SELECT id FROM cms_checklist_templates WHERE name = 'Günlük Gözetim Kontrol Listesi' LIMIT 1
)
INSERT INTO cms_checklist_items (template_id, order_index, question, item_type, is_required, options, validation_rules)
SELECT 
    t.id, 
    2, 
    'Anormal ses veya vibrasyon var mı?', 
    'boolean', 
    true, 
    NULL, 
    NULL
FROM daily_template t
ON CONFLICT DO NOTHING;

WITH daily_template AS (
    SELECT id FROM cms_checklist_templates WHERE name = 'Günlük Gözetim Kontrol Listesi' LIMIT 1
)
INSERT INTO cms_checklist_items (template_id, order_index, question, item_type, is_required, options, validation_rules)
SELECT 
    t.id, 
    3, 
    'Kontrol fotoğrafı', 
    'photo', 
    false, 
    NULL, 
    NULL
FROM daily_template t
ON CONFLICT DO NOTHING;

-- Insert Checklist Assignment Rules
-- 1. Global ISG rule (applies to all eams_assets for ISG maintenance type)
WITH isg_template AS (
    SELECT id FROM cms_checklist_templates WHERE name = 'Genel İSG Kontrol Listesi' LIMIT 1
)
INSERT INTO cms_checklist_assignment_rules (template_id, priority, scope_type, asset_id, category_id, maintenance_type, is_active)
SELECT 
    t.id, 
    1, 
    'GLOBAL', 
    NULL, 
    NULL, 
    'ISG', 
    true
FROM isg_template t
ON CONFLICT DO NOTHING;

-- 2. Compressor category rule for monthly maintenance
WITH compressor_template AS (
    SELECT id FROM cms_checklist_templates WHERE name = 'Kompresör Aylık Bakım Kontrol Listesi' LIMIT 1
),
compressor_category AS (
    SELECT id FROM eams_asset_categories WHERE name = 'Jeneratör' LIMIT 1
)
INSERT INTO cms_checklist_assignment_rules (template_id, priority, scope_type, asset_id, category_id, maintenance_type, is_active)
SELECT 
    t.id, 
    1, 
    'CATEGORY', 
    NULL, 
    c.id, 
    'Aylık Bakım', 
    true
FROM compressor_template t, compressor_category c
ON CONFLICT DO NOTHING;

-- 3. Global daily inspection rule
WITH daily_template AS (
    SELECT id FROM cms_checklist_templates WHERE name = 'Günlük Gözetim Kontrol Listesi' LIMIT 1
)
INSERT INTO cms_checklist_assignment_rules (template_id, priority, scope_type, asset_id, category_id, maintenance_type, is_active)
SELECT 
    t.id, 
    1, 
    'GLOBAL', 
    NULL, 
    NULL, 
    'Günlük Kontrol', 
    true
FROM daily_template t
ON CONFLICT DO NOTHING;
