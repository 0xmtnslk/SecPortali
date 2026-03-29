-- Database Schema for Asset Management and Contractor Management System

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE IF NOT EXISTS core_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    oracle_id VARCHAR(50) UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    unit VARCHAR(255),
    position VARCHAR(255),
    employee_id VARCHAR(50),
    profile_photo TEXT,
    password_hash VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Roles Table
CREATE TABLE IF NOT EXISTS core_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    scope VARCHAR(50) DEFAULT 'FACILITY', -- SYSTEM, FACILITY, DEPARTMENT
    permissions JSONB DEFAULT '[]',
    is_system BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Facilities Table
CREATE TABLE IF NOT EXISTS core_facilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_code VARCHAR(50) UNIQUE,
    name VARCHAR(255) NOT NULL,
    short_name VARCHAR(100),
    facility_type VARCHAR(100) NOT NULL, -- Hastane, Depo, İdari Ofis, Çağrı Merkezi, Tıp Merkezi, Diyaliz Merkezi, Konuk Evi
    
    -- Contact Information
    address TEXT,
    city VARCHAR(100),
    district VARCHAR(100),
    website VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(255),
    
    -- Legal Information
    trade_name VARCHAR(255),
    tax_office VARCHAR(100),
    tax_number VARCHAR(50),
    sgk_registration_number VARCHAR(50),
    nace_code VARCHAR(50),
    workplace_hazard_class VARCHAR(50), -- Çok Tehlikeli, Tehlikeli, Az Tehlikeli
    
    -- Facility Information
    block_count INTEGER DEFAULT 1,
    building_construction_year INTEGER,
    building_height DECIMAL(10, 2),
    structure_height DECIMAL(10, 2),
    floor_count INTEGER,
    closed_area DECIMAL(15, 2),
    closed_parking_area DECIMAL(15, 2),
    
    -- Other Information
    bed_count INTEGER,
    employee_count INTEGER,
    contractor_employee_count INTEGER,
    facility_manager_id UUID REFERENCES core_users(id),
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Roles Junction Table (Many-to-Many)
CREATE TABLE IF NOT EXISTS core_user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES core_users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES core_roles(id) ON DELETE CASCADE,
    facility_id UUID REFERENCES core_facilities(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES core_users(id),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, role_id, facility_id)
);

-- Facility Blocks Table
CREATE TABLE IF NOT EXISTS core_facility_blocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_id UUID NOT NULL REFERENCES core_facilities(id) ON DELETE CASCADE,
    block_name VARCHAR(100) NOT NULL,
    block_number INTEGER,
    building_construction_year INTEGER,
    building_height DECIMAL(10, 2),
    structure_height DECIMAL(10, 2),
    floor_count INTEGER,
    closed_area DECIMAL(15, 2),
    closed_parking_area DECIMAL(15, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Floors Table (for 2D Mapping Module)
CREATE TABLE IF NOT EXISTS core_floors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    block_id UUID NOT NULL REFERENCES core_facility_blocks(id) ON DELETE CASCADE,
    floor_name VARCHAR(100) NOT NULL,
    floor_number INTEGER NOT NULL,
    sort_order INTEGER DEFAULT 0,
    dxf_file_path TEXT,
    dxf_parsed_data JSONB,
    dxf_uploaded_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_floors_block ON core_floors(block_id);
CREATE INDEX IF NOT EXISTS idx_floors_number ON core_floors(floor_number);

-- Area Types Table
CREATE TABLE IF NOT EXISTS core_area_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(100) NOT NULL, -- Klinik Alan, İdari Alan, Teknik Alan, Destek Alan, Ortak Alan
    is_system BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Areas (Mahal) Table
CREATE TABLE IF NOT EXISTS core_areas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_id UUID NOT NULL REFERENCES core_facilities(id) ON DELETE CASCADE,
    block_id UUID REFERENCES core_facility_blocks(id) ON DELETE CASCADE,
    floor_id UUID REFERENCES core_floors(id) ON DELETE CASCADE,
    area_type_id UUID REFERENCES core_area_types(id),
    floor_number INTEGER,
    area_name VARCHAR(255) NOT NULL,
    area_code VARCHAR(50),
    qr_barcode VARCHAR(100) UNIQUE,
    room_info TEXT,
    area_size DECIMAL(15, 2),
    description TEXT,
    geometry JSONB,
    dxf_entity_id VARCHAR(100),
    center_x DECIMAL(10, 2),
    center_y DECIMAL(10, 2),
    bounding_box JSONB,
    map_color VARCHAR(20) DEFAULT '#10B981',
    is_mapped BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_areas_floor ON core_areas(floor_id);
CREATE INDEX IF NOT EXISTS idx_areas_mapped ON core_areas(is_mapped);

-- Asset Categories Table
CREATE TABLE IF NOT EXISTS eams_asset_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    parent_id UUID REFERENCES eams_asset_categories(id),
    category_type VARCHAR(100), -- Elektrik, Mekanik, Medikal, Bilgi Sistemleri, vb.
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_system BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Equipment Hierarchy Table (4-level hierarchy: Ekipman Cinsi -> Kategori -> Alt Kategori -> Tür)
CREATE TABLE IF NOT EXISTS eams_equipment_hierarchy (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    parent_id UUID REFERENCES eams_equipment_hierarchy(id) ON DELETE CASCADE,
    level INTEGER NOT NULL CHECK (level >= 0 AND level <= 3), -- 0: Ekipman Cinsi, 1: Kategori, 2: Alt Kategori, 3: Tür
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_equipment_hierarchy_parent ON eams_equipment_hierarchy(parent_id);
CREATE INDEX IF NOT EXISTS idx_equipment_hierarchy_level ON eams_equipment_hierarchy(level);

-- Measurement Units Table
CREATE TABLE IF NOT EXISTS eams_measurement_units (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    unit_type VARCHAR(100) NOT NULL, -- Electrical, Weight, Volume, Heating, Digital, Medical
    description TEXT,
    is_system BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Energy Types Table
CREATE TABLE IF NOT EXISTS eams_energy_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_system BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Authorized Departments Table
CREATE TABLE IF NOT EXISTS core_authorized_departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_system BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contractors Table
CREATE TABLE IF NOT EXISTS cms_contractors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name VARCHAR(255) NOT NULL,
    company_code VARCHAR(50) UNIQUE,
    
    -- Contact Information
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    district VARCHAR(100),
    
    -- Legal Information
    tax_number VARCHAR(50),
    tax_office VARCHAR(100),
    trade_registration_number VARCHAR(50),
    
    -- Company Details
    company_type VARCHAR(100),
    specialization VARCHAR(255),
    employee_count INTEGER,
    
    -- Contract Information
    contract_start_date DATE,
    contract_end_date DATE,
    contract_value DECIMAL(15, 2),
    
    -- Status
    status VARCHAR(50) DEFAULT 'active', -- active, suspended, terminated
    
    -- Additional Info
    documents JSONB,
    certifications JSONB,
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contractor Facility Assignments Table
CREATE TABLE IF NOT EXISTS cms_contractor_facilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contractor_id UUID NOT NULL REFERENCES cms_contractors(id) ON DELETE CASCADE,
    facility_id UUID NOT NULL REFERENCES core_facilities(id) ON DELETE CASCADE,
    services JSONB,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(contractor_id, facility_id)
);

-- Contractor Employees Table
CREATE TABLE IF NOT EXISTS cms_contractor_employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contractor_id UUID NOT NULL REFERENCES cms_contractors(id) ON DELETE CASCADE,
    facility_id UUID REFERENCES core_facilities(id),
    
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    position VARCHAR(255),
    employee_id VARCHAR(50),
    
    specialization VARCHAR(255),
    certifications JSONB,
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Assets Table
CREATE TABLE IF NOT EXISTS eams_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    category_id UUID REFERENCES eams_asset_categories(id),
    equipment_id UUID REFERENCES eams_equipment_hierarchy(id),
    area_id UUID REFERENCES core_areas(id),
    facility_id UUID NOT NULL REFERENCES core_facilities(id) ON DELETE CASCADE,
    block_id UUID REFERENCES core_facility_blocks(id),
    floor_id UUID REFERENCES core_floors(id),
    room_detail VARCHAR(255),
    
    -- Technical Specifications
    brand VARCHAR(255),
    model VARCHAR(255),
    serial_number VARCHAR(100),
    purchase_date DATE,
    warranty_expiry_date DATE,
    installation_date DATE,
    
    -- Capacity/Measurement
    capacity_value DECIMAL(15, 2),
    capacity_unit_id UUID REFERENCES eams_measurement_units(id),
    
    -- Energy
    energy_type_id UUID REFERENCES eams_energy_types(id),
    power_consumption DECIMAL(15, 2),
    
    -- Status
    status VARCHAR(50) DEFAULT 'active', -- active, maintenance, broken, retired
    condition VARCHAR(50), -- excellent, good, fair, poor

    -- Phase 3 Additions - Section 1
    qr_barcode VARCHAR(100) UNIQUE,
    fixture_number VARCHAR(100),
    manufacturing_year INTEGER,
    has_warranty BOOLEAN DEFAULT false,

    -- Phase 3 Additions - Section 2
    energy_consumption_class VARCHAR(10),
    criticality_level VARCHAR(20),
    has_redundancy BOOLEAN DEFAULT false,
    alternative_equipment TEXT,

    -- Phase 3 Additions - Section 4
    depreciation_period_years INTEGER,
    economic_life_years INTEGER,
    planned_renewal_year INTEGER,
    annual_maintenance_cost DECIMAL(15, 2),
    total_cost_of_ownership DECIMAL(15, 2),

    -- Phase 3 Additions - Section 5
    maintenance_types_arr JSONB,
    maintenance_period VARCHAR(50),
    requires_periodic_control BOOLEAN DEFAULT false,
    periodic_control_period VARCHAR(50),
    last_periodic_control_date DATE,

    -- Phase 3 Additions - Section 6
    has_access_restriction BOOLEAN DEFAULT false,
    is_in_critical_area BOOLEAN DEFAULT false,
    
    -- Financial
    purchase_price DECIMAL(15, 2),
    current_value DECIMAL(15, 2),
    
    -- Responsibility
    responsible_department_id UUID REFERENCES core_authorized_departments(id),
    responsible_user_id UUID REFERENCES core_users(id),
    
    -- Additional Info
    manufacturer VARCHAR(255),
    supplier VARCHAR(255),
    technical_specs JSONB,
    documents JSONB,

    -- 2D Mapping Location Data
    location_x DECIMAL(10, 2),
    location_y DECIMAL(10, 2),
    map_marker_color VARCHAR(20) DEFAULT '#3B82F6',

    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Maintenance Types Table
CREATE TABLE IF NOT EXISTS eams_maintenance_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_periodic BOOLEAN DEFAULT false,
    is_system BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Maintenance Plans Table
CREATE TABLE IF NOT EXISTS eams_maintenance_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_id UUID NOT NULL REFERENCES eams_assets(id) ON DELETE CASCADE,
    maintenance_type_id UUID REFERENCES eams_maintenance_types(id),
    plan_name VARCHAR(255) NOT NULL,
    description TEXT,
    frequency VARCHAR(50), -- daily, weekly, monthly, quarterly, yearly, custom
    frequency_value INTEGER,
    duration_hours DECIMAL(5, 2),
    priority VARCHAR(20), -- low, medium, high, critical
    start_date DATE,
    end_date DATE,
    responsible_user_id UUID REFERENCES core_users(id),
    responsible_department_id UUID REFERENCES core_authorized_departments(id),
    contractor_id UUID REFERENCES cms_contractors(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Maintenance Records Table
CREATE TABLE IF NOT EXISTS eams_maintenance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    maintenance_plan_id UUID REFERENCES eams_maintenance_plans(id) ON DELETE SET NULL,
    asset_id UUID NOT NULL REFERENCES eams_assets(id) ON DELETE CASCADE,
    maintenance_type_id UUID REFERENCES eams_maintenance_types(id),
    
    scheduled_date DATE NOT NULL,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    
    performed_by UUID REFERENCES core_users(id),
    performed_by_contractor_id UUID REFERENCES cms_contractors(id),
    
    status VARCHAR(50) DEFAULT 'pending', -- pending, in_progress, completed, cancelled
    priority VARCHAR(20),
    
    description TEXT,
    work_performed TEXT,
    materials_used JSONB,
    cost DECIMAL(15, 2),
    
    findings TEXT,
    recommendations TEXT,
    
    next_maintenance_date DATE,
    
    attachments JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Fault Requests Table
CREATE TABLE IF NOT EXISTS eams_fault_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_number VARCHAR(50) UNIQUE NOT NULL,
    asset_id UUID REFERENCES eams_assets(id),
    area_id UUID REFERENCES core_areas(id),
    facility_id UUID NOT NULL REFERENCES core_facilities(id) ON DELETE CASCADE,
    
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    
    fault_type VARCHAR(100), -- electrical, mechanical, software, other
    severity VARCHAR(20), -- low, medium, high, critical
    
    requested_by UUID NOT NULL REFERENCES core_users(id),
    assigned_to UUID REFERENCES core_users(id),
    assigned_contractor_id UUID REFERENCES cms_contractors(id),
    
    status VARCHAR(50) DEFAULT 'pending', -- pending, assigned, in_progress, completed, cancelled
    
    priority VARCHAR(20),
    
    estimated_cost DECIMAL(15, 2),
    actual_cost DECIMAL(15, 2),
    
    resolution_notes TEXT,
    resolution_date TIMESTAMP,
    
    attachments JSONB,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Fault Request Comments Table
CREATE TABLE IF NOT EXISTS eams_fault_request_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fault_request_id UUID NOT NULL REFERENCES eams_fault_requests(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES core_users(id),
    comment TEXT NOT NULL,
    attachments JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS core_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES core_users(id) ON DELETE CASCADE,
    
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(100), -- maintenance, fault_request, system, contractor
    
    related_id UUID,
    related_type VARCHAR(100),
    
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    
    priority VARCHAR(20), -- low, medium, high
    
    action_url TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notification Settings Table
CREATE TABLE IF NOT EXISTS core_notification_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES core_users(id) ON DELETE CASCADE,
    
    email_notifications BOOLEAN DEFAULT true,
    sms_notifications BOOLEAN DEFAULT false,
    push_notifications BOOLEAN DEFAULT true,
    
    maintenance_reminders BOOLEAN DEFAULT true,
    fault_request_notifications BOOLEAN DEFAULT true,
    system_notifications BOOLEAN DEFAULT true,
    contractor_notifications BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- System Settings Table
CREATE TABLE IF NOT EXISTS core_system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(50) DEFAULT 'string', -- string, number, boolean, json
    description TEXT,
    is_system BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit Log Table
CREATE TABLE IF NOT EXISTS core_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES core_users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON core_users(email);
CREATE INDEX IF NOT EXISTS idx_users_oracle_id ON core_users(oracle_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON core_user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON core_user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_facilities_name ON core_facilities(name);
CREATE INDEX IF NOT EXISTS idx_facilities_type ON core_facilities(facility_type);
CREATE INDEX IF NOT EXISTS idx_areas_facility_id ON core_areas(facility_id);
CREATE INDEX IF NOT EXISTS idx_areas_area_type_id ON core_areas(area_type_id);
CREATE INDEX IF NOT EXISTS idx_assets_facility_id ON eams_assets(facility_id);
CREATE INDEX IF NOT EXISTS idx_assets_category_id ON eams_assets(category_id);
CREATE INDEX IF NOT EXISTS idx_assets_area_id ON eams_assets(area_id);
CREATE INDEX IF NOT EXISTS idx_assets_status ON eams_assets(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_plans_asset_id ON eams_maintenance_plans(asset_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_records_asset_id ON eams_maintenance_records(asset_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_records_status ON eams_maintenance_records(status);
CREATE INDEX IF NOT EXISTS idx_fault_requests_facility_id ON eams_fault_requests(facility_id);
CREATE INDEX IF NOT EXISTS idx_fault_requests_status ON eams_fault_requests(status);
CREATE INDEX IF NOT EXISTS idx_fault_requests_requested_by ON eams_fault_requests(requested_by);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON core_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON core_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON core_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON core_audit_logs(created_at);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_users_updated_at ON core_users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON core_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_roles_updated_at ON core_roles;
CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON core_roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_facilities_updated_at ON core_facilities;
CREATE TRIGGER update_facilities_updated_at BEFORE UPDATE ON core_facilities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_facility_blocks_updated_at ON core_facility_blocks;
CREATE TRIGGER update_facility_blocks_updated_at BEFORE UPDATE ON core_facility_blocks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_areas_updated_at ON core_areas;
CREATE TRIGGER update_areas_updated_at BEFORE UPDATE ON core_areas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_assets_updated_at ON eams_assets;
CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON eams_assets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_maintenance_plans_updated_at ON eams_maintenance_plans;
CREATE TRIGGER update_maintenance_plans_updated_at BEFORE UPDATE ON eams_maintenance_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_maintenance_records_updated_at ON eams_maintenance_records;
CREATE TRIGGER update_maintenance_records_updated_at BEFORE UPDATE ON eams_maintenance_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_fault_requests_updated_at ON eams_fault_requests;
CREATE TRIGGER update_fault_requests_updated_at BEFORE UPDATE ON eams_fault_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_contractors_updated_at ON cms_contractors;
CREATE TRIGGER update_contractors_updated_at BEFORE UPDATE ON cms_contractors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_contractor_employees_updated_at ON cms_contractor_employees;
CREATE TRIGGER update_contractor_employees_updated_at BEFORE UPDATE ON cms_contractor_employees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_notification_settings_updated_at ON core_notification_settings;
CREATE TRIGGER update_notification_settings_updated_at BEFORE UPDATE ON core_notification_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_system_settings_updated_at ON core_system_settings;
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON core_system_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Triggers for 2D Mapping Module
DROP TRIGGER IF EXISTS update_floors_updated_at ON core_floors;
CREATE TRIGGER update_floors_updated_at BEFORE UPDATE ON core_floors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- CHECKLIST MANAGEMENT MODULE
-- ============================================================================

-- Checklist Templates Table
-- Stores template definitions for checklists (ISG, BAKIM, GENEL, etc.)
CREATE TABLE IF NOT EXISTS cms_checklist_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    checklist_type VARCHAR(50) NOT NULL, -- 'ISG', 'BAKIM', 'GENEL', etc.
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Checklist Items Table
-- Stores individual questions/items within a checklist template
CREATE TABLE IF NOT EXISTS cms_checklist_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID NOT NULL REFERENCES cms_checklist_templates(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL DEFAULT 0,
    question TEXT NOT NULL,
    item_type VARCHAR(50) NOT NULL, -- 'boolean', 'numeric', 'text', 'photo', 'select'
    is_required BOOLEAN NOT NULL DEFAULT true,
    options JSONB, -- For select type: ["Uygun", "Uygun Değil", "N/A"]
    validation_rules JSONB, -- For numeric: {"min": 0, "max": 10, "unit": "bar"}
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Checklist Assignment Rules Table
-- Defines which templates apply to which eams_assets/categories/maintenance types
CREATE TABLE IF NOT EXISTS cms_checklist_assignment_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID NOT NULL REFERENCES cms_checklist_templates(id) ON DELETE CASCADE,
    priority INTEGER NOT NULL DEFAULT 1, -- Lower number = higher priority
    scope_type VARCHAR(50) NOT NULL, -- 'ASSET', 'CATEGORY', 'GLOBAL'
    asset_id UUID REFERENCES eams_assets(id) ON DELETE CASCADE,
    category_id UUID REFERENCES eams_asset_categories(id) ON DELETE CASCADE,
    maintenance_type VARCHAR(50) NOT NULL DEFAULT 'ALL', -- 'IC_BAKIM', 'DIS_BAKIM', 'ISG', 'ALL'
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_scope_asset CHECK (
        (scope_type = 'ASSET' AND asset_id IS NOT NULL AND category_id IS NULL) OR
        (scope_type = 'CATEGORY' AND category_id IS NOT NULL AND asset_id IS NULL) OR
        (scope_type = 'GLOBAL' AND asset_id IS NULL AND category_id IS NULL)
    )
);

-- Work Order Checklists Table
-- Stores checklist instances linked to maintenance records/work orders
CREATE TABLE IF NOT EXISTS cms_work_order_checklists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    work_order_id UUID NOT NULL REFERENCES eams_maintenance_records(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES cms_checklist_templates(id),
    asset_id UUID NOT NULL REFERENCES eams_assets(id),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'IN_PROGRESS', 'COMPLETED'
    snapshot JSONB NOT NULL, -- Snapshot of template and items at creation time
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Checklist Responses Table
-- Stores user responses to checklist items
CREATE TABLE IF NOT EXISTS cms_checklist_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    work_order_checklist_id UUID NOT NULL REFERENCES cms_work_order_checklists(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES cms_checklist_items(id),
    response_value JSONB NOT NULL, -- {"value": true/false/number/string} or {"urls": [...]}
    is_compliant BOOLEAN, -- Calculated based on validation rules
    notes TEXT,
    responded_by UUID NOT NULL REFERENCES core_users(id),
    responded_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for checklist tables
CREATE INDEX IF NOT EXISTS idx_checklist_templates_type ON cms_checklist_templates(checklist_type);
CREATE INDEX IF NOT EXISTS idx_checklist_templates_active ON cms_checklist_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_checklist_items_template ON cms_checklist_items(template_id);
CREATE INDEX IF NOT EXISTS idx_checklist_items_order ON cms_checklist_items(template_id, order_index);
CREATE INDEX IF NOT EXISTS idx_checklist_assignment_rules_template ON cms_checklist_assignment_rules(template_id);
CREATE INDEX IF NOT EXISTS idx_checklist_assignment_rules_asset ON cms_checklist_assignment_rules(asset_id);
CREATE INDEX IF NOT EXISTS idx_checklist_assignment_rules_category ON cms_checklist_assignment_rules(category_id);
CREATE INDEX IF NOT EXISTS idx_checklist_assignment_rules_type ON cms_checklist_assignment_rules(maintenance_type);
CREATE INDEX IF NOT EXISTS idx_checklist_assignment_rules_active ON cms_checklist_assignment_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_work_order_checklists_work_order ON cms_work_order_checklists(work_order_id);
CREATE INDEX IF NOT EXISTS idx_work_order_checklists_asset ON cms_work_order_checklists(asset_id);
CREATE INDEX IF NOT EXISTS idx_work_order_checklists_status ON cms_work_order_checklists(status);
CREATE INDEX IF NOT EXISTS idx_checklist_responses_checklist ON cms_checklist_responses(work_order_checklist_id);
CREATE INDEX IF NOT EXISTS idx_checklist_responses_item ON cms_checklist_responses(item_id);
CREATE INDEX IF NOT EXISTS idx_checklist_responses_responded_by ON cms_checklist_responses(responded_by);

-- Create triggers for updated_at timestamps on checklist tables
DROP TRIGGER IF EXISTS update_checklist_templates_updated_at ON cms_checklist_templates;
CREATE TRIGGER update_checklist_templates_updated_at BEFORE UPDATE ON cms_checklist_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_checklist_assignment_rules_updated_at ON cms_checklist_assignment_rules;
CREATE TRIGGER update_checklist_assignment_rules_updated_at BEFORE UPDATE ON cms_checklist_assignment_rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Phase 6: Multi-Tenant RBAC User Expansions
ALTER TABLE core_users ADD COLUMN IF NOT EXISTS facility_id UUID REFERENCES core_facilities(id);
ALTER TABLE core_users ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES core_authorized_departments(id);
