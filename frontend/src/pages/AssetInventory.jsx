import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { Package, Plus, Filter, Search, MoreVertical, ChevronRight, Building2 } from 'lucide-react'

const AssetInventory = () => {
  const [assets, setAssets] = useState([])
  const [loading, setLoading] = useState(true);
  const [options, setOptions] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterHierarchy, setFilterHierarchy] = useState('all');

  useEffect(() => {
    fetchOptions();
    fetchAssets();
  }, []);

  const fetchOptions = async () => {
    try {
      const res = await axios.get('/api/eams/assets/form-options');
      setOptions(res.data);
    } catch (err) {
      console.error('Options error:', err);
    }
  };

  const fetchAssets = async () => {
    try {
      const response = await axios.get('/api/eams/assets')
      setAssets(response.data.assets || [])
      setLoading(false)
    } catch (error) {
      console.error('Error fetching assets:', error)
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      active: { text: 'Aktif', className: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/50' },
      maintenance: { text: 'Bakımda', className: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-800/50' },
      broken: { text: 'Bozuk', className: 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 border border-rose-100 dark:border-rose-800/50' },
      retired: { text: 'Emekli', className: 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-400 border border-gray-100 dark:border-gray-700' }
    }
    return statusMap[status] || { text: status, className: 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-400 border border-gray-100 dark:border-gray-700' }
  }

  const getTopLevelEquipmentId = (equipId) => {
    if (!equipId || !options?.equipment_hierarchy) return null;
    let current = options.equipment_hierarchy.find(e => e.id === equipId);
    while (current && current.level > 0 && current.parent_id) {
      current = options.equipment_hierarchy.find(e => e.id === current.parent_id);
    }
    return current ? current.id : null;
  };

  const getEquipmentName = (equipId) => {
    if (!equipId || !options?.equipment_hierarchy) return '-';
    return options.equipment_hierarchy.find(e => e.id === equipId)?.name || '-';
  };

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.asset_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.brand?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || asset.status === filterStatus;
    const matchesHierarchy = filterHierarchy === 'all' || getTopLevelEquipmentId(asset.equipment_id) === filterHierarchy;
    return matchesSearch && matchesStatus && matchesHierarchy;
  });

  const level0Categories = options?.equipment_hierarchy?.filter(e => e.level === 0) || [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-8 transition-colors duration-500 animate-in fade-in">
      <div className="max-w-[1600px] mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-xl shadow-emerald-500/20">
                <Package className="h-8 w-8" />
              </div>
              <h1 className="text-4xl font-black text-gray-950 dark:text-white tracking-tight uppercase tracking-widest">
                VARLIK ENVANTERİ
              </h1>
            </div>
            <p className="text-lg text-gray-500 dark:text-gray-400 font-medium">
              Tüm kurum varlıklarını, ekipmanları ve teknik sarf malzemelerini tek merkezden yönetin.
            </p>
          </div>
          <Link to="/eams/assets/new" className="px-8 py-4 bg-primary-600 dark:bg-primary-500 text-white rounded-2xl hover:bg-primary-700 dark:hover:bg-primary-400 transition-all duration-300 flex items-center justify-center gap-3 font-black shadow-2xl shadow-primary-500/30 dark:shadow-none hover:-translate-y-1 group uppercase tracking-widest text-sm text-center">
            <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
            YENİ VARLIK EKLE
          </Link>
        </div>

        {/* Categories Tabs */}
        <div className="flex overflow-x-auto pb-4 gap-3 scrollbar-hide">
          <button
            onClick={() => setFilterHierarchy('all')}
            className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] whitespace-nowrap transition-all duration-300 border-2 ${
              filterHierarchy === 'all' 
                ? 'bg-primary-600 text-white border-primary-600 shadow-xl shadow-primary-500/20 translate-y-[-2px]' 
                : 'bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 border-transparent hover:border-gray-200 dark:hover:border-gray-700 shadow-sm'
            }`}
          >
            TÜM VARLIKLAR
          </button>
          {level0Categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setFilterHierarchy(cat.id)}
              className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] whitespace-nowrap transition-all duration-300 border-2 ${
                filterHierarchy === cat.id
                  ? 'bg-primary-600 text-white border-primary-600 shadow-xl shadow-primary-500/20 translate-y-[-2px]' 
                  : 'bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 border-transparent hover:border-gray-200 dark:hover:border-gray-700 shadow-sm'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Filters & Search Card */}
        <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800 p-8 transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Search className="h-32 w-32 dark:text-white" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
            <div className="lg:col-span-8 relative group">
              <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
              <input
                type="text"
                placeholder="Varlık kodu, adı, marka veya model ile arama yapın..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-6 py-5 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary-500 dark:focus:border-primary-400 rounded-2xl text-gray-950 dark:text-white placeholder-gray-400 focus:bg-white dark:focus:bg-gray-800 transition-all duration-300 font-bold text-lg shadow-sm"
              />
            </div>
            <div className="lg:col-span-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-6 py-5 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary-500 dark:focus:border-primary-400 rounded-2xl text-gray-950 dark:text-white font-black uppercase tracking-widest text-[10px] focus:bg-white dark:focus:bg-gray-800 transition-all duration-300 cursor-pointer shadow-sm"
              >
                <option value="">TÜM DURUMLAR</option>
                <option value="active">🟢 AKTİF</option>
                <option value="maintenance">🟠 BAKIMDA</option>
                <option value="broken">🔴 BOZUK</option>
                <option value="retired">⚪ EMEKLİ</option>
              </select>
            </div>
          </div>
        </div>

        {/* Assets List Section */}
        {loading || !options ? (
          <div className="flex flex-col items-center justify-center h-96 space-y-6">
            <div className="relative">
              <div className="h-20 w-20 rounded-full border-4 border-primary-500/20 border-t-primary-500 animate-spin"></div>
              <Package className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-primary-500 animate-pulse" />
            </div>
            <p className="text-xl font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] animate-pulse text-center">Envanter Verileri Yükleniyor...</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800 overflow-hidden transition-all duration-300">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800">
                <thead>
                  <tr className="bg-gray-50/50 dark:bg-gray-800/50">
                    <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase tracking-widest">KOD</th>
                    <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase tracking-widest">VARLIK & EKİPMAN</th>
                    <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase tracking-widest">KATEGORİ</th>
                    <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase tracking-widest">MARKA / MODEL</th>
                    <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase tracking-widest">KONUM</th>
                    <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase tracking-widest">DURUM</th>
                    <th className="px-8 py-6 text-right text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase tracking-widest">AKSİYONLAR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800 transition-colors">
                  {filteredRequests.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-8 py-32 text-center bg-gray-50/10 dark:bg-gray-800/10">
                        <div className="flex flex-col items-center justify-center space-y-4 opacity-30">
                          <Package className="h-16 w-16 text-gray-400" />
                          <p className="text-2xl font-black text-gray-400 uppercase tracking-widest text-center">Varlık Bulunamadı</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredAssets.map((asset) => {
                      const status = getStatusBadge(asset.status)
                      return (
                        <tr key={asset.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-all duration-300 group">
                          <td className="px-8 py-6 whitespace-nowrap">
                            <span className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">#{asset.asset_code}</span>
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform duration-300">
                                <Package className="h-6 w-6" />
                              </div>
                              <div className="ml-5">
                                <div className="text-lg font-black text-gray-950 dark:text-white tracking-tight">{asset.name}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">{asset.brand}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 font-medium">
                            <div className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 text-[11px] font-black uppercase tracking-widest w-fit">
                              {getEquipmentName(asset.equipment_id)}
                            </div>
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                           <div className="font-black text-gray-950 dark:text-white tracking-tight">
                            {asset.brand && asset.model ? `${asset.brand} ${asset.model}` : asset.brand || asset.model || '-'}
                           </div>
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap">
                            <div className="flex items-center text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                              <Building2 className="h-4 w-4 mr-2 text-primary-500" />
                              {asset.area_name || asset.facility_name || '-'}
                            </div>
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap">
                            <div className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest w-fit ${status.className}`}>
                              {status.text}
                            </div>
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap text-right h-full">
                            <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                               <Link to={`/eams/assets/${asset.id}`} className="p-2.5 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-400 dark:hover:text-white rounded-xl transition-all shadow-sm">
                                <ChevronRight className="h-5 w-5" />
                              </Link>
                              <Link to={`/eams/assets/${asset.id}/edit`} className="px-6 py-2.5 bg-gray-950 dark:bg-white text-white dark:text-gray-950 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-gray-200 dark:shadow-none">
                                DÜZENLE
                              </Link>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AssetInventory
