const { query } = require('../src/config/database');

const rolesToSeed = [
  {
    name: 'Sistem Admini',
    description: 'Tüm sistem üzerinde tam yetkili üst düzey yönetici.',
    scope: 'SYSTEM',
    permissions: ['*'], // Full access
    is_system: true
  },
  {
    name: 'Merkez Yöneticisi',
    description: 'Kurum genelinde kendi branşıyla ilgili tüm tesisleri yönetebilir.',
    scope: 'GLOBAL',
    permissions: ['VIEW_ALL_FACILITIES', 'MANAGE_INVENTORY_GLOBAL', 'VIEW_REPORTS_GLOBAL'],
    is_system: true
  },
  {
    name: 'Hastane Müdürü',
    description: 'Sadece kendi tesisine ait tam yetkili yönetici.',
    scope: 'FACILITY',
    permissions: ['MANAGE_FACILITY', 'MANAGE_USERS_FACILITY', 'VIEW_INVENTORY_FACILITY', 'MANAGE_ASSETS_FACILITY'],
    is_system: true
  },
  {
    name: 'Birim Müdürü',
    description: 'Sadece kendi tesisindeki kendi biriminden sorumlu yönetici.',
    scope: 'UNIT',
    permissions: ['MANAGE_UNIT', 'VIEW_INVENTORY_UNIT', 'MANAGE_ASSETS_UNIT', 'MANAGE_TASKS_UNIT'],
    is_system: true
  },
  {
    name: 'Birim Sorumlusu',
    description: 'Birim müdürüne bağlı, günlük operasyonları yürüten sorumlu.',
    scope: 'UNIT',
    permissions: ['OPERATIONAL_TASKS', 'VIEW_ASSETS_UNIT', 'CREATE_FAULT_REPORT'],
    is_system: true
  },
  {
    name: 'Personel',
    description: 'Sadece arıza talebi oluşturabilir ve kendi taleplerini takip edebilir.',
    scope: 'UNIT',
    permissions: ['CREATE_FAULT_REPORT', 'VIEW_OWN_REPORTS'],
    is_system: true
  }
];

async function seed() {
  console.log('Starting seeding for RBAC Roles...');
  try {
    for (const role of rolesToSeed) {
      await query(`
        INSERT INTO roles (name, description, scope, permissions, is_system)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (name) DO UPDATE 
        SET description = EXCLUDED.description, 
            scope = EXCLUDED.scope, 
            permissions = EXCLUDED.permissions,
            is_system = EXCLUDED.is_system;
      `, [role.name, role.description, role.scope, JSON.stringify(role.permissions), role.is_system]);
      console.log(`Seeded role: ${role.name}`);
    }
    console.log('Seeding completed successfully.');
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
