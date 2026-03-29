-- Add is_active column to core_areas table if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='core_areas' AND column_name='is_active') THEN
        ALTER TABLE core_areas ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
END $$;

-- Add is_active column to core_facility_blocks table if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='core_facility_blocks' AND column_name='is_active') THEN
        ALTER TABLE core_facility_blocks ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
END $$;

-- Update existing records to be active
UPDATE core_areas SET is_active = true WHERE is_active IS NULL;
UPDATE core_facility_blocks SET is_active = true WHERE is_active IS NULL;
