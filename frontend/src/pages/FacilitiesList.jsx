import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, Plus, Edit, Trash2, Download, Upload, Grid, List, Search, Map, ChevronRight, Activity, MapPin, Compass, LayoutGrid, Box, ArrowRight } from 'lucide-react'

const facilityTypes = [
  'Hastane',
  'Depo',
  'İdari Ofis',
  'Çağrı Merkezi',
  'Tıp Merkezi',
  'Diyaliz Merkezi',
  'Konuk Evi'
]

const FacilitiesList = () => {
  const navigate = useNavigate()
  const [facilities, setFacilities] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('card') // 'card' or 'list'
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('')
  const [importFile, setImportFile] = useState(null)
  const [importing, setImporting] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    fetchFacilities()
  }, [])

  const fetchFacilities = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/eams/facilities', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      setFacilities(data.facilities || [])
    } catch (error) {
      console.error('Error fetching facilities:', error)
      showMessage('error', 'Tesisler yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const showMessage = (type, text) => {
    setMessage({ type, text })
    setTimeout(() => setMessage({ type: '', text: '' }), 3000)
  }

  const handleDeleteFacility = async (id) => {
    if (!window.confirm('Bu tesisi silmek istediğinize emin misiniz?')) return
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/eams/facilities/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        showMessage('success', 'Tesis silindi')
        fetchFacilities()
      } else {
        showMessage('error', 'Silme işlemi başarısız')
      }
    } catch (error) {
      console.error('Error deleting facility:', error)
      showMessage('error', 'Silme sırasında hata oluştu')
    }
  }

  const handleExportCSV = async () => {
    setExporting(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/eams/facilities/export', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'tesisler_export.csv'
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        showMessage('success', 'CSV dosyası indirildi')
      } else {
        showMessage('error', 'Dışa aktarma başarısız')
      }
    } catch (error) {
      console.error('Error exporting CSV:', error)
      showMessage('error', 'Dışa aktarma sırasında hata oluştu')
    } finally {
      setExporting(false)
    }
  }

  const handleImportCSV = async () => {
    if (!importFile) {
      showMessage('error', 'Lütfen bir CSV dosyası seçin')
      return
    }
    
    setImporting(true)
    try {
      const token = localStorage.getItem('token')
      const formData = new FormData()
      formData.append('file', importFile)
      
      const response = await fetch('/api/eams/facilities/import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })
      
      if (response.ok) {
        const data = await response.json()
        showMessage('success', `${data.imported} tesis başarıyla içe aktarıldı`)
        setImportFile(null)
        fetchFacilities()
      } else {
        const error = await response.json()
        showMessage('error', error.error || 'İçe aktarma başarısız')
      }
    } catch (error) {
      console.error('Error importing CSV:', error)
      showMessage('error', 'İçe aktarma sırasında hata oluştu')
    } finally {
      setImporting(false)
    }
  }

  const downloadTemplate = () => {
    const headers = [
      'Tesis ID', 'Tesis Adı', 'Tesis Kısa Adı', 'Tesis Tipi', 'Adres', 'İl', 'İlçe',
      'Web Sitesi', 'Telefon', 'E-posta', 'Ticari Unvan', 'SGK Sicil Numarası',
      'Nace Kodu', 'İşyeri Tehlike Sınıfı', 'Blok Sayısı', 'Bina Yapım Yılı',
      'Bina Yüksekliği', 'Yapı Yüksekliği', 'Kat Sayısı', 'Kapalı Alan',
      'Kapalı Otopark Alanı', 'Yatak Sayısı', 'Çalışan Sayısı', 'Taşeron Çalışan Sayısı',
      'Tesis Yöneticisi', 'Blok Adı', 'Blok Numarası'
    ]
    
    const csvContent = '\uFEFF' + headers.join(',') + '\n'
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'tesisler_sablon.csv'
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
    }

  const filteredFacilities = facilities.filter(facility => {
    const matchesSearch = facility.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         facility.short_name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = !filterType || facility.facility_type === filterType
    return matchesSearch && matchesType
  })

  // Theme Gradients for Cards
  const getGradient = (index) => {
    const gradients = [
      'from-blue-500 to-indigo-600',
      'from-emerald-500 to-teal-600',
      'from-violet-500 to-purple-600',
      'from-amber-500 to-orange-600',
      'from-rose-500 to-pink-600',
    ]
    return gradients[index % gradients.length]
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12 min-h-screen transition-colors duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-2xl bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-[10px] font-black uppercase tracking-widest mb-4 border border-primary-100 dark:border-primary-800/50">
            <Activity className="h-4 w-4" /> Portföy Yönetimi
          </div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-gray-100 tracking-tight">Tesisler</h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 mt-2 max-w-xl font-medium">
            Tesislerinizi yönetin, harita üzerinden listeleyin ve yasal/teknik detaylarını takip edin.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/settings/facilities/new')}
            className="px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl transition-all duration-200 font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-primary-500/20 hover:-translate-y-0.5"
          >
            <Plus className="h-5 w-5" />
            Yeni Tesis Ekle
          </button>
        </div>
      </div>

      {/* Message Alert */}
      {message.text && (
        <div className={`p-4 rounded-xl border animate-in slide-in-from-top-4 flex items-center gap-3 ${
          message.type === 'success' 
            ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-400' 
            : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800 text-red-800 dark:text-red-400'
        }`}>
          <div className={`p-1.5 rounded-full ${message.type === 'success' ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
            {message.type === 'success' ? <Activity className="h-4 w-4" /> : <div className="h-4 w-4" />}
          </div>
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      {/* Control Panel (Glassmorphism) */}
      <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/20 dark:shadow-none border border-white/50 dark:border-gray-800/50 p-4 lg:p-6 sticky top-4 z-10 transition-all duration-200">
        <div className="flex flex-col lg:flex-row gap-5 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto flex-1">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
              <input
                type="text"
                placeholder="Tesis adı ile ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-white/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-2xl focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-primary-500 outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-gray-100 font-bold"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-6 py-3.5 bg-white/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-2xl focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-primary-500 outline-none transition-all text-gray-900 dark:text-gray-100 font-bold min-w-[200px]"
            >
              <option value="">Tüm Tipler</option>
              {facilityTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end">
            <div className="flex bg-gray-100/80 dark:bg-gray-800/80 p-1.5 rounded-2xl border border-gray-100/50 dark:border-gray-700/50">
              <button
                onClick={() => setViewMode('card')}
                className={`p-2.5 rounded-xl transition-all ${viewMode === 'card' ? 'bg-white dark:bg-gray-700 shadow-lg text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'}`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 shadow-lg text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
            
            <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 mx-2 hidden sm:block"></div>

            <button
              onClick={downloadTemplate}
              className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all text-xs font-black uppercase tracking-widest flex items-center gap-2"
            >
              <Download className="h-4 w-4" /> <span className="hidden xl:inline">Şablon</span>
            </button>
            
            <label className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all text-xs font-black uppercase tracking-widest flex items-center gap-2 cursor-pointer">
              <Upload className="h-4 w-4" />
              <span className="hidden xl:inline">{importing ? '...' : 'İçe Aktar'}</span>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setImportFile(e.target.files[0])}
                className="hidden"
                disabled={importing}
              />
            </label>
            
            {importFile && (
              <button
                onClick={handleImportCSV}
                disabled={importing}
                className="px-4 py-2.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-2xl hover:bg-primary-200 transition-all text-xs font-black uppercase tracking-widest animate-in zoom-in"
              >
                Onayla
              </button>
            )}
            
            <button
              onClick={handleExportCSV}
              disabled={exporting}
              className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all text-xs font-black uppercase tracking-widest flex items-center gap-2"
            >
              <Download className="h-4 w-4" /> <span className="hidden xl:inline">Dışa Aktar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Facilities Display */}
      {filteredFacilities.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-[3rem] shadow-xl shadow-gray-200/20 dark:shadow-none border border-gray-100 dark:border-gray-800 p-20 text-center animate-in zoom-in-95 duration-500">
          <div className="w-28 h-28 bg-primary-50 dark:bg-primary-900/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8 transform -rotate-6 border border-primary-100 dark:border-primary-900/30">
            <Building2 className="h-14 w-14 text-primary-500 dark:text-primary-600" />
          </div>
          <h3 className="text-3xl font-black text-gray-900 dark:text-gray-100 mb-3 tracking-tight">Tesis Bulunamadı</h3>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-10 font-medium">
            Arama kriterlerinize uyan tesis bulunamadı veya henüz bir tesis eklemediniz.
          </p>
          <button
            onClick={() => navigate('/settings/facilities/new')}
            className="px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl transition-all duration-200 font-black text-xs uppercase tracking-widest inline-flex items-center gap-3 shadow-xl shadow-primary-500/20"
          >
            <Plus className="h-5 w-5" /> İlk Tesisini Ekle
          </button>
        </div>
      ) : (
        <div className={viewMode === 'card' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8' : 'space-y-6'}>
          {filteredFacilities.map((facility, index) => {
            const hasLocation = facility.city || facility.district;
            
            return viewMode === 'card' ? (
              <div
                key={facility.id}
                onClick={() => navigate(`/settings/facilities/${facility.id}`)}
                className="group relative bg-white dark:bg-gray-900 rounded-[2.5rem] p-1 shadow-xl shadow-gray-200/30 dark:shadow-none border border-gray-100 dark:border-gray-800 hover:shadow-2xl hover:shadow-primary-500/10 hover:border-primary-100 dark:hover:border-primary-900/50 transition-all duration-500 cursor-pointer overflow-hidden transform hover:-translate-y-2"
              >
                {/* Top Banner Gradient */}
                <div className={`h-32 w-full rounded-[2.2rem] bg-gradient-to-r ${getGradient(index)} opacity-90 group-hover:opacity-100 transition-opacity`} />
                
                {/* Icon Circle overlapping */}
                <div className="absolute top-24 left-8 z-10 w-20 h-20 bg-white dark:bg-gray-800 rounded-[1.5rem] shadow-xl flex items-center justify-center rotate-3 group-hover:rotate-0 transition-transform duration-500 border-4 border-white dark:border-gray-900">
                  <Building2 className="h-10 w-10 text-primary-600 dark:text-primary-400" />
                </div>

                <div className="pt-20 px-8 pb-8 relative z-0">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight line-clamp-1">{facility.name}</h3>
                    <div className="flex bg-primary-100/50 dark:bg-primary-900/30 rounded-xl px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-primary-700 dark:text-primary-400 border border-primary-200 dark:border-primary-800/50">
                      {facility.facility_type}
                    </div>
                  </div>

                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 flex items-center gap-2 font-medium">
                    {hasLocation ? (
                      <>
                        <MapPin className="h-4 w-4 text-rose-500" />
                        {facility.city} {facility.district && `/ ${facility.district}`}
                      </>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-500 italic">Konum belirtilmemiş</span>
                    )}
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 border border-gray-100 dark:border-gray-800/50 group-hover:bg-white dark:group-hover:bg-gray-800 transition-colors">
                      <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest font-black">Tesis Kodu</span>
                      <p className="font-black text-gray-900 dark:text-gray-100 mt-1 truncate">{facility.facility_code || '-'}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 border border-gray-100 dark:border-gray-800/50 group-hover:bg-white dark:group-hover:bg-gray-800 transition-colors">
                      <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest font-black">Blok Sayısı</span>
                      <p className="font-black text-gray-900 dark:text-gray-100 mt-1">{facility.block_count || '1'}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-gray-800">
                    <div className="text-primary-600 dark:text-primary-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 group-hover:gap-3 transition-all">
                      Yönetime Git <ChevronRight className="h-4 w-4" />
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 duration-300">
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/facilities/${facility.id}/map`); }}
                        className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white rounded-xl transition-all shadow-lg shadow-emerald-500/10"
                      >
                        <Compass className="h-5 w-5" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/settings/facilities/${facility.id}/edit`); }}
                        className="p-3 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 hover:bg-primary-600 hover:text-white rounded-xl transition-all shadow-lg shadow-primary-500/10"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteFacility(facility.id); }}
                        className="p-3 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white rounded-xl transition-all shadow-lg shadow-rose-500/10"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div
                key={facility.id}
                onClick={() => navigate(`/settings/facilities/${facility.id}`)}
                className="flex items-center justify-between bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-xl shadow-gray-200/20 dark:shadow-none border border-gray-100 dark:border-gray-800 hover:shadow-2xl hover:border-primary-100 dark:hover:border-primary-900/50 transition-all cursor-pointer group hover:-translate-y-1"
              >
                <div className="flex items-center gap-8 flex-1 min-w-0">
                  <div className={`p-5 bg-gradient-to-br ${getGradient(index)} rounded-2xl text-white shadow-lg flex-shrink-0 group-hover:scale-110 transition-transform duration-500`}>
                    <Building2 className="h-8 w-8" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-2xl font-black text-gray-900 dark:text-gray-100 truncate tracking-tight">{facility.name}</h3>
                      <span className="px-4 py-1 text-[10px] font-black uppercase tracking-widest rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 flex-shrink-0">
                        {facility.facility_type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate flex items-center gap-4 font-medium">
                      <span className="font-black text-[10px] uppercase tracking-widest bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-xl text-gray-600 dark:text-gray-400">{facility.facility_code || '-'}</span>
                      {hasLocation && (
                        <span className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-rose-500" />
                          {facility.city} {facility.district ? `/ ${facility.district}` : ''}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-y-0">
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/facilities/${facility.id}/map`); }}
                    className="flex items-center gap-2 px-5 py-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/10"
                  >
                    <Compass className="h-4 w-4" /> Harita
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/settings/facilities/${facility.id}/edit`); }}
                    className="p-3.5 text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 hover:bg-primary-600 hover:text-white rounded-2xl transition-all shadow-lg shadow-primary-500/10"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteFacility(facility.id); }}
                    className="p-3.5 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30 hover:bg-rose-600 hover:text-white rounded-2xl transition-all shadow-lg shadow-rose-500/10"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default FacilitiesList
