import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { 
  Save, X, Info, Settings, MapPin, 
  DollarSign, Wrench, Shield, AlertCircle, ChevronRight, Camera
} from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const TABS = [
  { id: 'identity', label: '1. Kimlik ve Temel Bilgiler', icon: Info, required: true },
  { id: 'technical', label: '2. Teknik Özellikler', icon: Settings, required: false },
  { id: 'location', label: '3. Konum Bilgileri', icon: MapPin, required: true },
  { id: 'financial', label: '4. Finansal', icon: DollarSign, required: false },
  { id: 'maintenance', label: '5. Bakım ve Kontrol', icon: Wrench, required: true },
  { id: 'security', label: '6. Güvenlik', icon: Shield, required: false },
];

const AssetForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [activeTab, setActiveTab] = useState('identity');
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState(null);
  
  // Custom states for cascading dropdowns
  const [selectedFacility, setSelectedFacility] = useState('');
  const [selectedBlock, setSelectedBlock] = useState('');
  const [selectedFloor, setSelectedFloor] = useState('');
  const [areaQrInput, setAreaQrInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  // Hierarchy selections
  const [selLevel0, setSelLevel0] = useState('');
  const [selLevel1, setSelLevel1] = useState('');
  const [selLevel2, setSelLevel2] = useState('');
  const [selLevel3, setSelLevel3] = useState('');

  const [formData, setFormData] = useState({
    // Section 1: Kimlik
    asset_code: '',
    name: '',
    description: '',
    qr_barcode: '',
    fixture_number: '',
    brand: '',
    model: '',
    serial_number: '',
    manufacturing_year: '',
    has_warranty: false,
    warranty_expiry_date: '',
    
    // Section 2: Teknik
    category_id: '',
    equipment_id: '',
    energy_type_id: '',
    energy_consumption_class: '',
    capacity_value: '',
    capacity_unit_id: '',
    power_consumption: '',
    criticality_level: 'Düşük',
    has_redundancy: false,
    alternative_equipment: '',
    installation_date: '',

    // Section 3: Konum
    facility_id: '',
    block_id: '',
    floor_id: '',
    area_id: '',
    room_detail: '',

    // Section 4: Finansal
    purchase_date: '',
    purchase_price: '',
    current_value: '',
    depreciation_period_years: '',
    economic_life_years: '',
    planned_renewal_year: '',
    annual_maintenance_cost: '',
    total_cost_of_ownership: '',

    // Section 5: Bakım
    status: 'active',
    condition: 'good',
    has_internal_maintenance: false,
    internal_maintenance_period: '',
    has_external_maintenance: false,
    external_maintenance_period: '',
    requires_periodic_control: false,
    periodic_control_period: '',
    last_periodic_control_date: '',

    // Section 6: Güvenlik
    responsible_department_id: '',
    has_access_restriction: false,
    is_in_critical_area: false,
  });

  useEffect(() => {
    fetchOptions();
    if (isEdit) fetchAssetData();
  }, [id]);

  useEffect(() => {
    let scanner = null;
    if (isScanning) {
      scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: {width: 250, height: 250} }, false);
      scanner.render((decodedText) => {
        handleAreaQrChange({ target: { value: decodedText }});
        scanner.clear();
        setIsScanning(false);
      }, (error) => {
        // Ignored, triggers every frame
      });
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(e => console.error("Failed to clear scanner", e));
      }
    };
  }, [isScanning, options]);

  const fetchOptions = async () => {
    try {
      const res = await axios.get('/api/eams/assets/form-options');
      setOptions(res.data);
    } catch (err) {
      console.error('Options error:', err);
    }
  };

  const fetchAssetData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/eams/assets/${id}`);
      const data = res.data;

      // Unpack nulls to empty strings
      const unpacked = Object.keys(data).reduce((acc, key) => {
        acc[key] = data[key] === null ? '' : data[key];
        return acc;
      }, {});

      // For dates, slice to YYYY-MM-DD
      const dateFields = ['warranty_expiry_date', 'installation_date', 'purchase_date', 'last_periodic_control_date'];
      dateFields.forEach(f => {
        if (unpacked[f]) unpacked[f] = unpacked[f].split('T')[0];
      });

      setFormData(unpacked);
      setSelectedFacility(unpacked.facility_id || '');
      setSelectedBlock(unpacked.block_id || '');
      setSelectedFloor(unpacked.floor_id || '');

      // To properly render hierarchy, we need to trace back from equipment_id. 
      // (Skipping deep logic here for brevity, usually done via a recursive lookup in options)
      
    } catch (err) {
      console.error(err);
      alert('Varlık bilgileri yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Hierarchy Filtering logic
  const getHierarchyChildren = (parentId, level) => {
    if (!options?.equipment_hierarchy) return [];
    return options.equipment_hierarchy.filter(item => 
      item.level === level && 
      (parentId ? item.parent_id === parentId : item.parent_id === null)
    );
  };

  // Location Filtering logic
  const filteredBlocks = options?.blocks?.filter(b => b.facility_id === selectedFacility) || [];
  const filteredFloors = options?.floors?.filter(f => f.block_id === selectedBlock) || [];
  const filteredAreas = options?.areas?.filter(a => {
    if (selectedFloor) return a.floor_id === selectedFloor;
    if (selectedFacility) return a.facility_id === selectedFacility;
    return false;
  }) || [];

  const handleLocationChange = (level, value) => {
    if (level === 'facility') {
      setSelectedFacility(value);
      setSelectedBlock('');
      setSelectedFloor('');
      setFormData(prev => ({ ...prev, facility_id: value, block_id: '', floor_id: '', area_id: '' }));
    } else if (level === 'block') {
      setSelectedBlock(value);
      setSelectedFloor('');
      setFormData(prev => ({ ...prev, block_id: value, floor_id: '', area_id: '' }));
    } else if (level === 'floor') {
      setSelectedFloor(value);
      setFormData(prev => ({ ...prev, floor_id: value, area_id: '' }));
    }
  };

  const handleHierarchyChange = (level, value) => {
    if (level === 0) {
      setSelLevel0(value);
      setSelLevel1(''); setSelLevel2(''); setSelLevel3('');
      setFormData(prev => ({ ...prev, equipment_id: value })); // Lowest selected
    } else if (level === 1) {
      setSelLevel1(value);
      setSelLevel2(''); setSelLevel3('');
      setFormData(prev => ({ ...prev, equipment_id: value }));
    } else if (level === 2) {
      setSelLevel2(value);
      setSelLevel3('');
      setFormData(prev => ({ ...prev, equipment_id: value }));
    } else if (level === 3) {
      setSelLevel3(value);
      setFormData(prev => ({ ...prev, equipment_id: value }));
    }
  };

  const handleAreaQrChange = (e) => {
    const val = e.target.value;
    setAreaQrInput(val);
    
    if (!val || !options?.areas) return;

    // Search for matching area
    const matchedArea = options.areas.find(a => 
      (a.qr_barcode && a.qr_barcode.toLowerCase() === val.toLowerCase()) || 
      (a.area_code && a.area_code.toLowerCase() === val.toLowerCase())
    );

    if (matchedArea) {
      const p_facility_id = matchedArea.facility_id || '';
      let p_block_id = matchedArea.block_id || '';
      const p_floor_id = matchedArea.floor_id || '';

      // If area doesn't have block_id directly, get it from floor
      if (!p_block_id && p_floor_id && options.floors) {
        const matchingFloor = options.floors.find(f => f.id === p_floor_id);
        if (matchingFloor) p_block_id = matchingFloor.block_id;
      }

      setSelectedFacility(p_facility_id);
      setSelectedBlock(p_block_id);
      setSelectedFloor(p_floor_id);
      
      setFormData(prev => ({ 
        ...prev, 
        facility_id: p_facility_id, 
        block_id: p_block_id, 
        floor_id: p_floor_id, 
        area_id: matchedArea.id 
      }));
    }
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      
      // Blank out empty strings to null for integers
      ['manufacturing_year', 'depreciation_period_years', 'economic_life_years', 'planned_renewal_year'].forEach(field => {
        if (!payload[field]) payload[field] = null;
      });

      if (isEdit) {
        await axios.put(`/api/eams/assets/${id}`, payload);
      } else {
        await axios.post('/api/eams/assets', payload);
      }
      navigate('/assets');
    } catch (err) {
      console.error(err);
      alert('Kayıt sırasında bir hata oluştu');
    }
  };

  const renderIdentityTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900 border-b pb-2">1. Kimlik ve Temel Tanımlama Bilgileri</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div><label className="block text-sm font-medium text-gray-700">Ekipman Kodu (ID) *</label><input required type="text" name="asset_code" value={formData.asset_code} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" /></div>
        <div><label className="block text-sm font-medium text-gray-700">Ekipman Adı *</label><input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" /></div>
        <div><label className="block text-sm font-medium text-gray-700">QR / Barkod No</label><input type="text" name="qr_barcode" value={formData.qr_barcode} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" /></div>
        <div><label className="block text-sm font-medium text-gray-700">Demirbaş No</label><input type="text" name="fixture_number" value={formData.fixture_number} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" /></div>
        <div><label className="block text-sm font-medium text-gray-700">Marka</label><input type="text" name="brand" value={formData.brand} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" /></div>
        <div><label className="block text-sm font-medium text-gray-700">Model</label><input type="text" name="model" value={formData.model} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" /></div>
        <div><label className="block text-sm font-medium text-gray-700">Seri No</label><input type="text" name="serial_number" value={formData.serial_number} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" /></div>
        <div><label className="block text-sm font-medium text-gray-700">Üretim Yılı</label><input type="number" name="manufacturing_year" value={formData.manufacturing_year} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" /></div>
        <div className="flex items-center space-x-3 pt-6"><input type="checkbox" id="has_warranty" name="has_warranty" checked={formData.has_warranty} onChange={handleInputChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" /><label htmlFor="has_warranty" className="text-sm font-medium text-gray-700">Garanti Durumu (Var mı?)</label></div>
        {formData.has_warranty && (
          <div><label className="block text-sm font-medium text-gray-700">Garanti Bitiş Tarihi</label><input type="date" name="warranty_expiry_date" value={formData.warranty_expiry_date} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" /></div>
        )}
      </div>
    </div>
  );

  const renderTechnicalTab = () => {
    const l1 = getHierarchyChildren(selLevel0, 1);
    const l2 = getHierarchyChildren(selLevel1, 2);
    const l3 = getHierarchyChildren(selLevel2, 3);

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">2. Teknik ve Operasyonel Özellikler</h3>
        
        <div className="bg-gray-50 p-4 rounded-lg space-y-4 mb-6">
          <h4 className="font-medium text-gray-700">Ekipman Hiyerarşisi</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Ekipman Cinsi</label>
              <select value={selLevel0} onChange={(e) => handleHierarchyChange(0, e.target.value)} className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                <option value="">Seçiniz...</option>
                {getHierarchyChildren(null, 0).map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
              </select>
            </div>
            {l1.length > 0 && (
              <div>
                <label className="block text-xs text-gray-500 mb-1">Kategori</label>
                <select value={selLevel1} onChange={(e) => handleHierarchyChange(1, e.target.value)} className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                  <option value="">Seçiniz...</option>
                  {l1.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                </select>
              </div>
            )}
            {l2.length > 0 && (
              <div>
                <label className="block text-xs text-gray-500 mb-1">Alt Kategori</label>
                <select value={selLevel2} onChange={(e) => handleHierarchyChange(2, e.target.value)} className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                  <option value="">Seçiniz...</option>
                  {l2.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                </select>
              </div>
            )}
            {l3.length > 0 && (
              <div>
                <label className="block text-xs text-gray-500 mb-1">Tür</label>
                <select value={selLevel3} onChange={(e) => handleHierarchyChange(3, e.target.value)} className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                  <option value="">Seçiniz...</option>
                  {l3.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                </select>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Enerji Türü</label>
            <select name="energy_type_id" value={formData.energy_type_id} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
              <option value="">Yok / Belirtilmedi</option>
              {options?.energy_types?.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Enerji Tüketim Sınıfı</label>
            <select name="energy_consumption_class" value={formData.energy_consumption_class} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
              <option value="">Seçiniz...</option>
              {['A+++','A++','A+','A','B','C','D','E','F','G'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Teknik Kapasite Değeri</label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <input type="number" name="capacity_value" value={formData.capacity_value} onChange={handleInputChange} className="flex-1 rounded-l-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
              <select name="capacity_unit_id" value={formData.capacity_unit_id} onChange={handleInputChange} className="inline-flex items-center rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                <option value="">Birim</option>
                {options?.measurement_units?.map(u => <option key={u.id} value={u.id}>{u.symbol} - {u.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Kritiklik Seviyesi</label>
            <select name="criticality_level" value={formData.criticality_level} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
              <option value="Düşük">Düşük</option>
              <option value="Orta">Orta</option>
              <option value="Yüksek">Yüksek</option>
              <option value="Kritik">Kritik</option>
            </select>
          </div>
          <div className="flex items-center space-x-3 pt-6">
            <input type="checkbox" id="has_redundancy" name="has_redundancy" checked={formData.has_redundancy} onChange={handleInputChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
            <label htmlFor="has_redundancy" className="text-sm font-medium text-gray-700">Yedeklilik Durumu (Var mı?)</label>
          </div>
          <div><label className="block text-sm font-medium text-gray-700">Devreye / Kullanıma Alma Tarihi</label><input type="date" name="installation_date" value={formData.installation_date} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" /></div>
          <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700">Alternatif Sistem/Ekipman var mı?</label><input type="text" name="alternative_equipment" value={formData.alternative_equipment} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" /></div>
        </div>
      </div>
    );
  };

  const renderLocationTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-2">
        <h3 className="text-lg font-medium text-gray-900">3. Konum Bilgileri</h3>
      </div>
      
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-center space-x-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-blue-900 mb-1">Hızlı Seçim: Mahal QR / Barkod Okutun</label>
          <div className="flex w-full xl:w-1/2 rounded-md shadow-sm">
            <input 
              type="text" 
              placeholder="Kodu yazın veya kamerayla okutun..." 
              value={areaQrInput}
              onChange={handleAreaQrChange}
              className="flex-1 rounded-l-md border-blue-300 focus:border-blue-500 focus:ring-blue-500" 
            />
            <button 
              type="button" 
              onClick={() => setIsScanning(true)} 
              className="inline-flex items-center px-4 py-2 border border-l-0 border-blue-300 rounded-r-md bg-blue-100 hover:bg-blue-200 text-blue-800 transition-colors focus:outline-none"
            >
              <Camera className="h-5 w-5 mr-1" />
              Okut
            </button>
          </div>
          <p className="text-xs text-blue-600 mt-2">Eşleşen mahal bulunduğunda tüm konum bilgileri (Tesis, Blok, vb.) otomatik doldurulur.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Tesis *</label>
          <select required value={selectedFacility} onChange={(e) => handleLocationChange('facility', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
            <option value="">Seçiniz</option>
            {options?.facilities?.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Blok</label>
          <select value={selectedBlock} onChange={(e) => handleLocationChange('block', e.target.value)} disabled={!selectedFacility} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100">
            <option value="">Seçiniz</option>
            {filteredBlocks.map(b => <option key={b.id} value={b.id}>{b.block_name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Kat</label>
          <select value={selectedFloor} onChange={(e) => handleLocationChange('floor', e.target.value)} disabled={!selectedBlock} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100">
            <option value="">Seçiniz</option>
            {filteredFloors.map(f => <option key={f.id} value={f.id}>{f.floor_name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Mahal *</label>
          <select required name="area_id" value={formData.area_id} onChange={handleInputChange} disabled={!selectedFacility} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100">
            <option value="">Seçiniz</option>
            {filteredAreas.map(a => <option key={a.id} value={a.id}>{a.area_name}</option>)}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Oda Detayı / Ek Açıklama</label>
          <input type="text" name="room_detail" value={formData.room_detail} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
        </div>
      </div>
    </div>
  );

  const renderFinancialTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900 border-b pb-2">4. Finansal ve Yaşam Döngüsü</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div><label className="block text-sm font-medium text-gray-700">Satın Alma Tarihi</label><input type="date" name="purchase_date" value={formData.purchase_date} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" /></div>
        <div><label className="block text-sm font-medium text-gray-700">Satın Alma Bedeli (₺)</label><input type="number" step="0.01" name="purchase_price" value={formData.purchase_price} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" /></div>
        <div><label className="block text-sm font-medium text-gray-700">Amortisman Süresi (Yıl)</label><input type="number" name="depreciation_period_years" value={formData.depreciation_period_years} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" /></div>
        <div><label className="block text-sm font-medium text-gray-700">Ekonomik Ömür (Yıl)</label><input type="number" name="economic_life_years" value={formData.economic_life_years} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" /></div>
        <div><label className="block text-sm font-medium text-gray-700">Planlanan Yenileme Yılı</label><input type="number" name="planned_renewal_year" value={formData.planned_renewal_year} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" /></div>
        <div><label className="block text-sm font-medium text-gray-700">Yıllık Ortalama Bakım Maliyeti (₺)</label><input type="number" step="0.01" name="annual_maintenance_cost" value={formData.annual_maintenance_cost} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" /></div>
        <div><label className="block text-sm font-medium text-gray-700">Toplam Sahip Olma Maliyeti (TCO)</label><input type="number" step="0.01" name="total_cost_of_ownership" value={formData.total_cost_of_ownership} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" /></div>
      </div>
    </div>
  );

  const renderMaintenanceTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900 border-b pb-2">5. Bakım, Kontrol ve Performans</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-5 border rounded-lg shadow-sm">
          <h4 className="font-semibold text-gray-900 mb-4 border-b pb-2">- Bakım Tipi ve Periyotları</h4>
          
          <div className="space-y-6">
            <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
              <div className="flex items-center space-x-3 mb-3">
                <input type="checkbox" id="has_internal_maintenance" name="has_internal_maintenance" checked={formData.has_internal_maintenance} onChange={handleInputChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                <label htmlFor="has_internal_maintenance" className="text-sm font-medium text-gray-900">İç Bakım Gerekli</label>
              </div>
              {formData.has_internal_maintenance && (
                <div className="ml-7">
                  <label className="block text-xs text-gray-500 mb-1">İç Bakım Periyodu</label>
                  <select name="internal_maintenance_period" value={formData.internal_maintenance_period} onChange={handleInputChange} className="mt-1 block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                    <option value="">Seçiniz</option>
                    {['Günlük', 'Haftalık', 'Aylık', '3 Aylık', '6 Aylık', 'Yıllık', 'İki Yıllık', 'Beş Yıllık', 'On Yıllık'].map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              )}
            </div>

            <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
              <div className="flex items-center space-x-3 mb-3">
                <input type="checkbox" id="has_external_maintenance" name="has_external_maintenance" checked={formData.has_external_maintenance} onChange={handleInputChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                <label htmlFor="has_external_maintenance" className="text-sm font-medium text-gray-900">Dış Bakım Gerekli (Firma / Taşeron)</label>
              </div>
              {formData.has_external_maintenance && (
                <div className="ml-7">
                  <label className="block text-xs text-gray-500 mb-1">Dış Bakım Periyodu</label>
                  <select name="external_maintenance_period" value={formData.external_maintenance_period} onChange={handleInputChange} className="mt-1 block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                    <option value="">Seçiniz</option>
                    {['Günlük', 'Haftalık', 'Aylık', '3 Aylık', '6 Aylık', 'Yıllık', 'İki Yıllık', 'Beş Yıllık', 'On Yıllık'].map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white p-5 border rounded-lg shadow-sm">
          <h4 className="font-semibold text-gray-900 mb-4 border-b pb-2">- Periyodik Kontrol</h4>
          <div className="flex items-center space-x-3 mb-4">
            <input type="checkbox" id="requires_periodic_control" name="requires_periodic_control" checked={formData.requires_periodic_control} onChange={handleInputChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
            <label htmlFor="requires_periodic_control" className="text-sm font-medium text-gray-700">Yasal/Periyodik Kontrol Gerekliliği Var</label>
          </div>
          {formData.requires_periodic_control && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Kontrol Periyodu</label>
                <select name="periodic_control_period" value={formData.periodic_control_period} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                  <option value="">Seçiniz</option>
                  {['Aylık', '3 Aylık', '6 Aylık', 'Yıllık', 'İki Yıllık', 'Beş Yıllık', 'On Yıllık'].map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Son Periyodik Kontrol Tarihi</label>
                <input type="date" name="last_periodic_control_date" value={formData.last_periodic_control_date} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900 border-b pb-2">6. Güvenlik ve Erişim</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex items-center space-x-3 pt-6">
          <input type="checkbox" id="has_access_restriction" name="has_access_restriction" checked={formData.has_access_restriction} onChange={handleInputChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
          <label htmlFor="has_access_restriction" className="text-sm font-medium text-gray-700">Erişim Kısıtı Var mı?</label>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Yetkili Departman/Birim (Ekipman Cinsi)</label>
          <select name="responsible_department_id" value={formData.responsible_department_id} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
            <option value="">Seçiniz</option>
            {options?.equipment_hierarchy?.filter(e => e.level === 0).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div className="flex items-center space-x-3 pt-6">
          <input type="checkbox" id="is_in_critical_area" name="is_in_critical_area" checked={formData.is_in_critical_area} onChange={handleInputChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
          <label htmlFor="is_in_critical_area" className="text-sm font-medium text-gray-700">Kritik Alan İçinde mi?</label>
        </div>
      </div>
    </div>
  );

  if (loading || !options) {
    return <div className="p-8 text-center text-gray-500">Yükleniyor...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8 relative">
      {isScanning && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-75">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">QR Kod Okuyucu</h3>
              <button onClick={() => setIsScanning(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div id="reader" className="w-full overflow-hidden rounded-lg bg-black"></div>
            <p className="mt-4 text-sm text-gray-500 text-center">
              Kameranızı QR koda veya barkoda doğru tutun.
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? 'Varlık Düzenle' : 'Yeni Varlık Ekle'}
        </h1>
        <div className="flex space-x-3">
          <button type="button" onClick={() => navigate('/assets')} className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none">
            İptal
          </button>
          <button type="submit" form="asset-form" className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <Save className="h-4 w-4 mr-2" />
            Kaydet
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 bg-gray-50 border-r border-gray-200 p-4">
          <nav className="space-y-1">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-3 py-3 text-sm font-medium rounded-md transition-colors ${
                    isActive ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 border border-transparent'
                  }`}
                >
                  <div className="flex items-center">
                    <Icon className={`flex-shrink-0 -ml-1 mr-3 h-5 w-5 ${isActive ? 'text-blue-500' : 'text-gray-400'}`} />
                    <span className="truncate">{tab.label}</span>
                  </div>
                  {tab.required && <span className="text-red-500 ml-2" title="Zorunlu Alan">*</span>}
                </button>
              );
            })}
          </nav>

          <div className="mt-8 p-4 bg-yellow-50 rounded-md border border-yellow-100">
            <h4 className="flex items-center text-sm font-medium text-yellow-800">
              <AlertCircle className="h-4 w-4 mr-2 text-yellow-600" /> Bilgi
            </h4>
            <p className="mt-2 text-xs text-yellow-700">
              1, 3 ve 5. kısımlar minimum varlık kaydı için doldurulması gereken zorunlu alanlar içerir. 
              Diğer kısımları sonradan güncelleyebilirsiniz.
            </p>
          </div>
        </div>

        {/* Form Content Area */}
        <div className="flex-1 p-8">
          <form id="asset-form" onSubmit={handleSubmit}>
            {activeTab === 'identity' && renderIdentityTab()}
            {activeTab === 'technical' && renderTechnicalTab()}
            {activeTab === 'location' && renderLocationTab()}
            {activeTab === 'financial' && renderFinancialTab()}
            {activeTab === 'maintenance' && renderMaintenanceTab()}
            {activeTab === 'security' && renderSecurityTab()}
          </form>
        </div>
      </div>
    </div>
  );
};

export default AssetForm;
