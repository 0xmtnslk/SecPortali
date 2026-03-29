import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, MapPin, Hash, Maximize, CheckCircle, Wrench, AlertTriangle, Package } from 'lucide-react';
import FloorMap from '../components/FloorMap';

const AreaDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [area, setArea] = useState(null);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [areaRes, assetsRes] = await Promise.all([
          axios.get(`/api/eams/areas/${id}`),
          axios.get(`/api/eams/assets?area_id=${id}&limit=100`)
        ]);
        setArea(areaRes.data);
        setAssets(assetsRes.data.assets || []);
      } catch (error) {
        console.error('Error fetching area details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4 bg-gray-50 dark:bg-gray-950 transition-colors">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-100 dark:border-primary-900/30 border-t-primary-600"></div>
        <p className="text-sm text-gray-500 dark:text-gray-400 animate-pulse font-medium">Mahal detayları yükleniyor...</p>
      </div>
    );
  }

  if (!area) {
    return (
      <div className="p-6 bg-gray-50 dark:bg-gray-950 min-h-screen transition-colors">
        <button onClick={() => navigate('/areas')} className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mb-4 font-bold transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Geri Dön
        </button>
        <div className="text-center text-gray-500 dark:text-gray-400 py-12 font-medium">Mahal bulunamadı.</div>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase flex items-center gap-1 shadow-sm"><CheckCircle className="w-3 h-3"/> Çalışıyor</span>;
      case 'maintenance':
        return <span className="bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase flex items-center gap-1 shadow-sm"><Wrench className="w-3 h-3"/> Bakımda</span>;
      case 'fault':
        return <span className="bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase flex items-center gap-1 shadow-sm"><AlertTriangle className="w-3 h-3"/> Arızalı</span>;
      default:
        return <span className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase">Bilinmiyor</span>;
    }
  };

  return (
    <div className="space-y-6 bg-gray-50 dark:bg-gray-950 min-h-screen pb-12 transition-colors duration-200">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/areas')} className="p-2.5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all shadow-sm">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                {area.area_name}
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-2.5 py-1 rounded-lg ml-2 border border-gray-200 dark:border-gray-700 uppercase tracking-tight">
                  {area.area_code}
                </span>
              </h1>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1.5 flex items-center gap-4 uppercase font-bold tracking-wider">
                <span className="flex items-center gap-1.5"><Hash className="w-3.5 h-3.5 text-primary-500"/> {area.facility_name}</span>
                <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-emerald-500"/> {area.block_name ? `${area.block_name} - ` : ''}{area.floor_name || area.floor_num}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Info Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 transition-colors">
              <h2 className="text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-6 flex items-center gap-2 uppercase tracking-widest">
                <Maximize className="w-4 h-4 text-indigo-500" />
                Mahal Özellikleri
              </h2>
              <dl className="space-y-4">
                <div>
                  <dt className="text-[10px] font-bold text-gray-500 dark:text-gray-500 uppercase tracking-wider mb-1">Kategori</dt>
                  <dd className="text-sm font-bold text-gray-900 dark:text-gray-100">{area.area_type_category || '-'}</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-bold text-gray-500 dark:text-gray-500 uppercase tracking-wider mb-1">Alan Türü / Oda Bilgisi</dt>
                  <dd className="text-sm font-bold text-gray-900 dark:text-gray-100">{area.area_type_name || '-'} / {area.room_info || '-'}</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-bold text-gray-500 dark:text-gray-500 uppercase tracking-wider mb-1">Büyüklük</dt>
                  <dd className="text-sm font-bold text-gray-900 dark:text-gray-100">{area.area_size ? `${area.area_size} m²` : '-'}</dd>
                </div>
                {area.description && (
                  <div>
                    <dt className="text-[10px] font-bold text-gray-500 dark:text-gray-500 uppercase tracking-wider mb-1">Açıklama</dt>
                    <dd className="text-sm font-medium text-gray-900 dark:text-gray-100 leading-relaxed">{area.description}</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Assets Summary */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 transition-colors">
              <h2 className="text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-6 flex items-center gap-2 uppercase tracking-widest">
                <Package className="w-4 h-4 text-emerald-500" />
                Varlık Envanteri ({assets.length})
              </h2>
              {assets.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Bu mahalde varlık bulunmamaktadır.</p>
              ) : (
                <ul className="space-y-3">
                  {assets.map(asset => (
                    <li key={asset.id} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800 transition-all hover:border-primary-200 dark:hover:border-primary-900/40">
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-gray-100 tracking-tight">{asset.name}</p>
                        <p className="text-[10px] font-bold text-gray-500 dark:text-gray-500 uppercase tracking-widest mt-0.5">{asset.asset_code}</p>
                      </div>
                      {getStatusBadge(asset.status)}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Map View */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-2 h-[700px] flex flex-col relative transition-colors">
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                <h2 className="text-[11px] font-bold text-gray-900 dark:text-gray-100 uppercase tracking-widest">Mahal Konumu & Varlık Dağılımı</h2>
              </div>
              <div className="flex-1 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-950/50 relative">
                {area.floor_id ? (
                  <FloorMap 
                    floorId={area.floor_id} 
                    selectedAreaId={area.id} 
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400 font-medium">
                    Bu mahal henüz bir kata tanımlanmamış.
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AreaDetails;
