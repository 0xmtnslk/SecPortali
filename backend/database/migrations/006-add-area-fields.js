exports.up = async (db) => {
  await db.query(`
    ALTER TABLE areas
    ADD COLUMN IF NOT EXISTS qr_barcode VARCHAR(100),
    ADD COLUMN IF NOT EXISTS room_info VARCHAR(255);

    CREATE INDEX IF NOT EXISTS idx_areas_qr_barcode ON areas(qr_barcode);
  `);
};

exports.down = async (db) => {
  await db.query(`
    DROP INDEX IF EXISTS idx_areas_qr_barcode;
    ALTER TABLE areas
    DROP COLUMN IF EXISTS qr_barcode,
    DROP COLUMN IF EXISTS room_info;
  `);
};
