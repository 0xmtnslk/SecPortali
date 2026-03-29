import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, Edit, MapPin, Package, Settings, DollarSign, 
  Wrench, Shield, Calendar, FileText, AlertCircle, Clock
} from 'lucide-react';

const InfoRow = ({ label, value }) => (
  <div className="py-2.5 flex justify-between border-b border-gray-100 dark:border-gray-800 last:border-0 transition-colors">
    <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">{label}:</span>
    <span className="text-gray-900 dark:text-gray-100 font-bold text-sm text-right max-w-[60%]">{value || '-'}</span>
  </div>
);

const AssetDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [asset, setAsset] = useState(null);
  const [maintenanceHistory, setMaintenanceHistory] = useState([]);
  const [faultHistory, setFaultHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssetData();
  }, [id]);

  const fetchAssetData = async () => {
    try {
      setLoading(true);
      const [assetRes, maintRes, faultRes] = await Promise.all([
        axios.get(`/api/eams/assets/${id}`),
        axios.get(`/api/eams/assets/${id}/maintenance-history`),
        axios.get(`/api/eams/assets/${id}/fault-history`),
      ]);
      setAsset(assetRes.data);
      setMaintenanceHistory(maintRes.data);
      setFaultHistory(faultRes.data);
    } catch (err) {
      console.error(err);
      alert('Varlık bilgileri yüklenirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !asset) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center transition-colors">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-100 dark:border-blue-900/30 border-t-blue-600"></div>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const map = {
      active: 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400',
      maintenance: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400',
      broken: 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400',
      retired: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300'
    };
    return map[status] || 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400';
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6 bg-transparent">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
        <div className="flex items-center space-x-4 mb-4 sm:mb-0">
          <button onClick={() => navigate('/assets')} className="p-2.5 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 rounded-xl transition-all shadow-sm">
            <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
              {asset.name}
              <span className={`ml-3 px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusBadge(asset.status)} transition-colors`}>
                {asset.status === 'active' ? 'Aktif' : asset.status === 'maintenance' ? 'Bakımda' : asset.status === 'broken' ? 'Bozuk' : 'Emekli'}
              </span>
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Kod: <span className="font-mono bg-gray-50 dark:bg-gray-800 px-2 py-0.5 rounded text-xs font-semibold">{asset.asset_code}</span></p>
          </div>
        </div>
        <Link to={`/assets/${asset.id}/edit`} className="inline-flex items-center px-5 py-2.5 border-2 border-primary-600 dark:border-primary-500 rounded-xl text-sm font-bold text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all shadow-sm active:scale-95">
          <Edit className="h-4 w-4 mr-2" />
          Düzenle
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Core Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Identity Card */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 overflow-hidden relative transition-colors">
              <div className="flex items-center mb-6 text-blue-600 dark:text-blue-400 uppercase tracking-widest text-[10px] font-bold">
                <Package className="h-4 w-4 mr-2" />
                <h3>Kimlik Bilgileri</h3>
              </div>
              <InfoRow label="Marka / Model" value={`${asset.brand || ''} ${asset.model || ''}`} />
              <InfoRow label="Seri No" value={asset.serial_number} />
              <InfoRow label="Demirbaş No" value={asset.fixture_number} />
              <InfoRow label="Kategori" value={asset.category_name} />
              <InfoRow label="Üretim Yılı" value={asset.manufacturing_year} />
            </div>

            {/* Location Card */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 transition-colors">
              <div className="flex items-center mb-6 text-emerald-600 dark:text-emerald-400 uppercase tracking-widest text-[10px] font-bold">
                <MapPin className="h-4 w-4 mr-2" />
                <h3>Konum Bilgileri</h3>
              </div>
              <InfoRow label="Tesis" value={asset.facility_name} />
              <InfoRow label="Mahal" value={asset.area_name} />
              <InfoRow label="QR / Barkod" value={asset.qr_barcode} />
              <InfoRow label="Oda Detayı" value={asset.room_detail} />
              <InfoRow label="Kritik Alan" value={asset.is_in_critical_area ? 'Evet' : 'Hayır'} />
            </div>

            {/* Technical & Energy */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 transition-colors">
              <div className="flex items-center mb-6 text-purple-600 dark:text-purple-400 uppercase tracking-widest text-[10px] font-bold">
                <Settings className="h-4 w-4 mr-2" />
                <h3>Teknik & Enerji</h3>
              </div>
              <InfoRow label="Enerji Türü" value={asset.energy_type_name} />
              <InfoRow label="Tüketim Sınıfı" value={asset.energy_consumption_class} />
              <InfoRow label="Kapasite" value={asset.capacity_value ? `${asset.capacity_value} ${asset.capacity_unit_symbol}` : '-'} />
              <InfoRow label="Kurulum Tarihi" value={asset.installation_date ? new Date(asset.installation_date).toLocaleDateString('tr-TR') : '-'} />
              <InfoRow label="Alternatif Cihaz" value={asset.alternative_equipment} />
            </div>

            {/* Financial & Warranty */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 transition-colors">
              <div className="flex items-center mb-6 text-amber-600 dark:text-amber-400 uppercase tracking-widest text-[10px] font-bold">
                <DollarSign className="h-4 w-4 mr-2" />
                <h3>Finans ve Garanti</h3>
              </div>
              <InfoRow label="Garanti Durumu" value={asset.has_warranty ? `Var (Bitiş: ${asset.warranty_expiry_date ? new Date(asset.warranty_expiry_date).toLocaleDateString('tr-TR') : '-'})` : 'Yok'} />
              <InfoRow label="Satın Alma Tarihi" value={asset.purchase_date ? new Date(asset.purchase_date).toLocaleDateString('tr-TR') : '-'} />
              <InfoRow label="Alış Bedeli (₺)" value={asset.purchase_price} />
              <InfoRow label="Ekonomik Ömür" value={asset.economic_life_years ? `${asset.economic_life_years} Yıl` : '-'} />
              <InfoRow label="Yıllık Bakım Mly." value={asset.annual_maintenance_cost ? `₺${asset.annual_maintenance_cost}` : '-'} />
            </div>
          </div>
        </div>

        {/* Right Column - Maintenance & Security */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 dark:from-gray-900 dark:to-black rounded-2xl shadow-sm p-6 text-white relative overflow-hidden transition-colors">
            <Shield className="absolute -bottom-4 -right-4 h-32 w-32 text-gray-700 dark:text-gray-800 opacity-30" />
            <div className="relative z-10">
              <div className="flex items-center mb-4 text-slate-200">
                <Shield className="h-5 w-5 mr-2" />
                <h3 className="font-semibold">Güvenlik ve Sorumluluk</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-slate-400 text-xs">Sorumlu Departman / Ekipman Cinsi</p>
                  <p className="font-medium">{asset.responsible_department_name || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-400 dark:text-gray-500 text-[10px] uppercase font-bold tracking-wider mb-1">Sorumlu Kullanıcı</p>
                  <p className="font-bold text-sm text-gray-100">{asset.responsible_user_name || '-'}</p>
                </div>
                <div className="flex justify-between items-center py-2 border-t border-slate-700 mt-2">
                  <span className="text-sm">Erişim Kısıtı</span>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${asset.has_access_restriction ? 'bg-red-500 text-white' : 'bg-slate-700 text-slate-300'}`}>
                    {asset.has_access_restriction ? 'VAR' : 'YOK'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 transition-colors">
            <div className="flex items-center mb-6 text-cyan-600 dark:text-cyan-400 uppercase tracking-widest text-[10px] font-bold">
              <Wrench className="h-4 w-4 mr-2" />
              <h3>Bakım ve Kontrol Planı</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">İç Bakım</span>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${asset.has_internal_maintenance ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-500'}`}>
                  {asset.has_internal_maintenance ? asset.internal_maintenance_period : 'YOK'}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl transition-colors">
                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Dış Bakım (Taşeron)</span>
                <span className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase ${asset.has_external_maintenance ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-500'}`}>
                  {asset.has_external_maintenance ? asset.external_maintenance_period : 'YOK'}
                </span>
              </div>

              {asset.requires_periodic_control && (
                <div className="p-4 border-2 border-orange-100 dark:border-orange-900/30 bg-orange-50/50 dark:bg-orange-900/10 rounded-xl transition-colors">
                  <div className="flex items-center mb-3">
                    <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400 mr-2" />
                    <span className="text-sm font-bold text-orange-900 dark:text-orange-400 uppercase tracking-tight">Yasal Periyodik Kontrol</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] text-orange-800 dark:text-orange-300 font-medium">Periyot: <b className="font-bold">{asset.periodic_control_period}</b></p>
                    <p className="text-[11px] text-orange-800 dark:text-orange-300 font-medium">Son Kontrol: <b className="font-bold">{asset.last_periodic_control_date ? new Date(asset.last_periodic_control_date).toLocaleDateString('tr-TR') : '-'}</b></p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Histories Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Maintenance History */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm uppercase tracking-wider flex items-center">
              <FileText className="h-4 w-4 mr-2 text-blue-600" />
              Geçmiş Bakım Kayıtları
            </h3>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 uppercase">
              {maintenanceHistory.length} Kayıt
            </span>
          </div>
          <div className="p-0 max-h-[300px] overflow-y-auto">
            {maintenanceHistory.length > 0 ? (
              <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                {maintenanceHistory.map(record => (
                  <li key={record.id} className="p-5 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-bold text-sm text-gray-900 dark:text-gray-100 tracking-tight">{record.title || record.maintenance_type_name}</p>
                      <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded uppercase">{new Date(record.created_at).toLocaleDateString('tr-TR')}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3 font-medium leading-relaxed">{record.description}</p>
                    <div className="flex items-center text-[10px] text-gray-500 dark:text-gray-500 font-bold uppercase tracking-wider">
                      <Clock className="h-3 w-3 mr-1.5" /> Gerçekleştiren: <span className="text-gray-700 dark:text-gray-300 ml-1">{record.performed_by_name || '-'}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-8 text-center text-gray-500 text-sm">Hiç bakım kaydı bulunmuyor.</div>
            )}
          </div>
        </div>

        {/* Faults History */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-red-50/30 dark:bg-red-900/10 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm uppercase tracking-wider flex items-center">
              <AlertCircle className="h-4 w-4 mr-2 text-red-600" />
              Arıza ve Arıza Talepleri
            </h3>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 uppercase">
              {faultHistory.length} Kayıt
            </span>
          </div>
          <div className="p-0 max-h-[300px] overflow-y-auto">
            {faultHistory.length > 0 ? (
              <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                {faultHistory.map(fault => (
                  <li key={fault.id} className="p-5 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-bold text-sm text-gray-900 dark:text-gray-100 tracking-tight">{fault.title}</p>
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase shadow-sm ${fault.status === 'open' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}`}>
                        {fault.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3 font-medium leading-relaxed">{fault.description}</p>
                    <div className="flex items-center text-[10px] text-gray-500 dark:text-gray-500 font-bold uppercase tracking-wider justify-between">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1.5" /> {new Date(fault.created_at).toLocaleDateString('tr-TR')}
                      </div>
                      <div className="text-gray-700 dark:text-gray-300">{fault.requested_by_name || '-'}</div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-8 text-center text-gray-500 text-sm">Hiç arıza kaydı bulunmuyor.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetDetails;
