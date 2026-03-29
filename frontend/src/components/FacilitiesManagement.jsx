import { useState, useEffect } from 'react'
import { Building2, Plus, Edit, Trash2, Download, Upload, X, ChevronDown, ChevronUp, Map, Eye } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'

const facilityTypes = [
  'Hastane',
  'Depo',
  'İdari Ofis',
  'Çağrı Merkezi',
  'Tıp Merkezi',
  'Diyaliz Merkezi',
  'Konuk Evi'
]

const hazardClasses = [
  'Çok Tehlikeli',
  'Tehlikeli',
  'Az Tehlikeli'
]

const FacilitiesManagement = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const isEAMS = location.pathname.startsWith('/eams')
  
  const [facilities, setFacilities] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingFacility, setEditingFacility] = useState(null)
  const [showBlockModal, setShowBlockModal] = useState(false)
  const [selectedFacility, setSelectedFacility] = useState(null)
  const [blocks, setBlocks] = useState([])
  const [expandedFacility, setExpandedFacility] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('')
  const [importFile, setImportFile] = useState(null)
  const [importing, setImporting] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  // Form state
  const [formData, setFormData] = useState({
    // Temel Bilgiler
    facility_code: '',
    name: '',
    short_name: '',
    facility_type: '',
    // İletişim Bilgileri
    address: '',
    city: '',
    district: '',
    website: '',
    phone: '',
    email: '',
    // Yasal Bilgiler
    trade_name: '',
    sgk_registration_number: '',
    nace_code: '',
    workplace_hazard_class: '',
    // Tesis Bilgileri
    block_count: 1,
    building_construction_year: '',
    building_height: '',
    structure_height: '',
    floor_count: '',
    closed_area: '',
    closed_parking_area: '',
    // Diğer Bilgiler
    bed_count: '',
    employee_count: '',
    contractor_employee_count: '',
    facility_manager_id: ''
  })

  // Block form state
  const [blockFormData, setBlockFormData] = useState({
    block_name: '',
    block_number: '',
    building_construction_year: '',
    building_height: '',
    structure_height: '',
    floor_count: '',
    closed_area: '',
    closed_parking_area: ''
  })

  const [editingBlock, setEditingBlock] = useState(null)

  useEffect(() => {
    fetchFacilities()
  }, [])

  const fetchFacilities = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/facilities', {
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

  const fetchBlocks = async (facilityId) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/facilities/${facilityId}/blocks`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      setBlocks(data || [])
    } catch (error) {
      console.error('Error fetching blocks:', error)
    }
  }

  const showMessage = (type, text) => {
    setMessage({ type, text })
    setTimeout(() => setMessage({ type: '', text: '' }), 3000)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleBlockInputChange = (e) => {
    const { name, value } = e.target
    setBlockFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const token = localStorage.getItem('token')
      const url = editingFacility
        ? `/api/facilities/${editingFacility.id}`
        : '/api/facilities'
      
      const method = editingFacility ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        showMessage('success', editingFacility ? 'Tesis güncellendi' : 'Tesis oluşturuldu')
        setShowModal(false)
        setEditingFacility(null)
        resetForm()
        fetchFacilities()
      } else {
        const error = await response.json()
        showMessage('error', error.error || 'İşlem başarısız')
      }
    } catch (error) {
      console.error('Error saving facility:', error)
      showMessage('error', 'İşlem sırasında hata oluştu')
    }
  }

  const handleBlockSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const token = localStorage.getItem('token')
      const url = editingBlock
        ? `/api/facilities/${selectedFacility.id}/blocks/${editingBlock.id}`
        : `/api/facilities/${selectedFacility.id}/blocks`
      
      const method = editingBlock ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(blockFormData)
      })
      
      if (response.ok) {
        showMessage('success', editingBlock ? 'Blok güncellendi' : 'Blok eklendi')
        setShowBlockModal(false)
        setEditingBlock(null)
        resetBlockForm()
        fetchBlocks(selectedFacility.id)
      } else {
        const error = await response.json()
        showMessage('error', error.error || 'İşlem başarısız')
      }
    } catch (error) {
      console.error('Error saving block:', error)
      showMessage('error', 'İşlem sırasında hata oluştu')
    }
  }

  const handleDeleteFacility = async (id) => {
    if (!window.confirm('Bu tesisi silmek istediğinize emin misiniz?')) return
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/facilities/${id}`, {
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

  const handleDeleteBlock = async (blockId) => {
    if (!window.confirm('Bu bloğu silmek istediğinize emin misiniz?')) return
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/facilities/${selectedFacility.id}/blocks/${blockId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        showMessage('success', 'Blok silindi')
        fetchBlocks(selectedFacility.id)
      } else {
        showMessage('error', 'Silme işlemi başarısız')
      }
    } catch (error) {
      console.error('Error deleting block:', error)
      showMessage('error', 'Silme sırasında hata oluştu')
    }
  }

  const handleEditFacility = (facility) => {
    navigate(`/settings/facilities/${facility.id}/edit`, { state: { from: location.pathname } })
  }

  const handleEditBlock = (block) => {
    setEditingBlock(block)
    setBlockFormData({
      block_name: block.block_name || '',
      block_number: block.block_number || '',
      building_construction_year: block.building_construction_year || '',
      building_height: block.building_height || '',
      structure_height: block.structure_height || '',
      floor_count: block.floor_count || '',
      closed_area: block.closed_area || '',
      closed_parking_area: block.closed_parking_area || ''
    })
    setShowBlockModal(true)
  }

  const resetForm = () => {
    setFormData({
      facility_code: '',
      name: '',
      short_name: '',
      facility_type: '',
      address: '',
      city: '',
      district: '',
      website: '',
      phone: '',
      email: '',
      trade_name: '',
      sgk_registration_number: '',
      nace_code: '',
      workplace_hazard_class: '',
      block_count: 1,
      building_construction_year: '',
      building_height: '',
      structure_height: '',
      floor_count: '',
      closed_area: '',
      closed_parking_area: '',
      bed_count: '',
      employee_count: '',
      contractor_employee_count: '',
      facility_manager_id: ''
    })
  }

  const resetBlockForm = () => {
    setBlockFormData({
      block_name: '',
      block_number: '',
      building_construction_year: '',
      building_height: '',
      structure_height: '',
      floor_count: '',
      closed_area: '',
      closed_parking_area: ''
    })
  }

  const handleOpenBlockModal = (facility) => {
    setSelectedFacility(facility)
    fetchBlocks(facility.id)
    setShowBlockModal(true)
  }

  const handleExportCSV = async () => {
    setExporting(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/facilities/export', {
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
      
      const response = await fetch('/api/facilities/import', {
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
      'Tesis ID',
      'Tesis Adı',
      'Tesis Kısa Adı',
      'Tesis Tipi',
      'Adres',
      'İl',
      'İlçe',
      'Web Sitesi',
      'Telefon',
      'E-posta',
      'Ticari Unvan',
      'SGK Sicil Numarası',
      'Nace Kodu',
      'İşyeri Tehlike Sınıfı',
      'Blok Sayısı',
      'Bina Yapım Yılı',
      'Bina Yüksekliği',
      'Yapı Yüksekliği',
      'Kat Sayısı',
      'Kapalı Alan',
      'Kapalı Otopark Alanı',
      'Yatak Sayısı',
      'Çalışan Sayısı',
      'Taşeron Çalışan Sayısı',
      'Tesis Yöneticisi',
      'Blok Adı',
      'Blok Numarası'
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Message Alert */}
      {message.text && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {message.text}
        </div>
      )}

      {/* Header Actions */}
      {!isEAMS && (
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-4 items-center">
            <div className="relative group">
              <input
                type="text"
                placeholder="Tesis ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 transition-all font-bold placeholder-gray-400 group-focus-within:bg-gray-50 dark:group-focus-within:bg-gray-750"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-5 py-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 transition-all font-bold"
            >
              <option value="">Tüm Tipler</option>
              {facilityTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={downloadTemplate}
              className="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all flex items-center gap-2 font-black uppercase tracking-widest text-xs"
            >
              <Download className="h-4 w-4" />
              Şablon
            </button>
            <label className="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all flex items-center gap-2 font-black uppercase tracking-widest text-xs cursor-pointer">
              <Upload className="h-4 w-4" />
              {importing ? 'İçe Aktarılıyor...' : 'CSV İçe Aktar'}
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
                className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all font-black uppercase tracking-widest text-xs shadow-lg shadow-primary-500/20"
              >
                {importing ? 'İçe Aktarılıyor...' : 'İçe Aktar'}
              </button>
            )}
            <button
              onClick={handleExportCSV}
              disabled={exporting}
              className="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all flex items-center gap-2 font-black uppercase tracking-widest text-xs"
            >
              <Download className="h-4 w-4" />
              CSV Dışa Aktar
            </button>
            <button
               onClick={() => navigate('/settings/facilities/new', { state: { from: location.pathname } })}
              className="px-8 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all flex items-center gap-2 font-black uppercase tracking-widest text-xs shadow-xl shadow-primary-500/20 hover:-translate-y-0.5"
            >
              <Plus className="h-4 w-4" />
              Yeni Tesis
            </button>
          </div>
        </div>
      )}

      {isEAMS && (
        <div className="flex gap-4 items-center">
          <input
            type="text"
            placeholder="Tesis ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-6 py-3.5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 transition-all font-bold placeholder-gray-400 w-full max-w-md shadow-sm"
          />
        </div>
      )}

      {/* Facilities List */}
      <div className="space-y-6">
        {filteredFacilities.length === 0 ? (
          <div className="text-center py-24 bg-gray-50 dark:bg-gray-850 rounded-[2.5rem] border border-dashed border-gray-200 dark:border-gray-800">
            <Building2 className="h-20 w-20 text-gray-300 dark:text-gray-700 mx-auto mb-6" />
            <p className="text-xl font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Henüz tesis eklenmemiş</p>
          </div>
        ) : (
          filteredFacilities.map(facility => (
            <div key={facility.id} className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 p-8 shadow-sm hover:shadow-xl transition-all duration-300 group">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center flex-wrap gap-4">
                    <h3 className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight">{facility.name}</h3>
                    <span className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-xl bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 border border-primary-100 dark:border-primary-800">
                      {facility.facility_type}
                    </span>
                  </div>
                  <p className="text-base text-gray-500 dark:text-gray-400 mt-2 font-medium">
                    {facility.short_name && <span className="text-primary-600 dark:text-primary-400 font-bold mr-2 uppercase tracking-widest text-xs bg-primary-50 dark:bg-primary-900/20 px-2 py-0.5 rounded-lg">{facility.short_name}</span>}
                    {facility.city && `${facility.city}`}
                    {facility.district && ` / ${facility.district}`}
                  </p>
                  <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Tesis ID', value: facility.facility_code || '-', icon: Building2 },
                      { label: 'Yatak', value: facility.bed_count || '-', icon: Building2 },
                      { label: 'Çalışan', value: facility.employee_count || '-', icon: Building2 },
                      { label: 'Blok', value: facility.block_count || '-', icon: Building2 }
                    ].map((stat, i) => (
                      <div key={i} className="bg-gray-50 dark:bg-gray-800/50 px-4 py-3 rounded-2xl border border-gray-100 dark:border-gray-700">
                        <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">{stat.label}</p>
                        <p className="text-sm font-black text-gray-900 dark:text-gray-100">{stat.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setExpandedFacility(expandedFacility === facility.id ? null : facility.id)}
                    className="p-3 text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-all bg-gray-50 dark:bg-gray-800 rounded-xl"
                  >
                    {expandedFacility === facility.id ? (
                      <ChevronUp className="h-6 w-6" />
                    ) : (
                      <ChevronDown className="h-6 w-6" />
                    )}
                  </button>
                  {isEAMS && (
                    <button
                      onClick={() => navigate(`/facilities/${facility.id}/map`, { state: { from: location.pathname } })}
                      className="flex items-center gap-2 px-5 py-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-all font-black uppercase tracking-widest text-[10px]"
                      title="Tesis Yerleşimi"
                    >
                      <Map className="h-4 w-4" /> <span className="hidden sm:inline">Harita</span>
                    </button>
                  )}
                  <button
                    onClick={() => navigate(`/settings/facilities/${facility.id}`, { state: { from: location.pathname } })}
                    className="p-3 text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 rounded-xl hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-all"
                    title="Görüntüle"
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleEditFacility(facility)}
                    className="p-3 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all"
                    title="Düzenle"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteFacility(facility.id)}
                    className="p-3 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/50 transition-all"
                    title="Sil"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedFacility === facility.id && (
                <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-800 animate-in slide-in-from-top-4 duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-sm">
                    {/* İletişim Bilgileri */}
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">İletişim Bilgileri</h4>
                      <div className="bg-gray-50/50 dark:bg-gray-800/30 p-5 rounded-[1.5rem] space-y-3">
                        {facility.address && <p className="text-gray-700 dark:text-gray-300 font-bold">{facility.address}</p>}
                        {facility.phone && <p className="text-gray-600 dark:text-gray-400">Telefon: <span className="text-gray-900 dark:text-gray-100">{facility.phone}</span></p>}
                        {facility.email && <p className="text-gray-600 dark:text-gray-400">E-posta: <span className="text-primary-600 dark:text-primary-400">{facility.email}</span></p>}
                        {facility.website && <p className="text-gray-600 dark:text-gray-400">Web: <span className="text-blue-600 dark:text-blue-400">{facility.website}</span></p>}
                      </div>
                    </div>

                    {/* Yasal Bilgiler */}
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Yasal Bilgiler</h4>
                      <div className="bg-gray-50/50 dark:bg-gray-800/30 p-5 rounded-[1.5rem] space-y-3">
                        {facility.trade_name && <p className="text-gray-700 dark:text-gray-300 font-bold">{facility.trade_name}</p>}
                        {facility.sgk_registration_number && (
                          <p className="text-gray-600 dark:text-gray-400">SGK Sicil: <span className="text-gray-900 dark:text-gray-100">{facility.sgk_registration_number}</span></p>
                        )}
                        {facility.nace_code && <p className="text-gray-600 dark:text-gray-400">Nace Kodu: <span className="text-gray-900 dark:text-gray-100">{facility.nace_code}</span></p>}
                        {facility.workplace_hazard_class && (
                          <p className="text-gray-600 dark:text-gray-400">Tehlike Sınıfı: <span className="text-amber-600 dark:text-amber-400 font-black">{facility.workplace_hazard_class}</span></p>
                        )}
                      </div>
                    </div>

                    {/* Tesis Bilgileri */}
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Yapı ve Kapasite</h4>
                      <div className="bg-gray-50/50 dark:bg-gray-800/30 p-5 rounded-[1.5rem] grid grid-cols-2 gap-4">
                        {[
                          { label: 'Yapım Yılı', value: facility.building_construction_year },
                          { label: 'Bina Yük.', value: `${facility.building_height}m` },
                          { label: 'Yapı Yük.', value: `${facility.structure_height}m` },
                          { label: 'Kat Sayısı', value: facility.floor_count },
                          { label: 'Kapalı Alan', value: `${facility.closed_area}m²` },
                          { label: 'Otopark', value: `${facility.closed_parking_area}m²` }
                        ].map(( yapı, j) => (
                          <div key={j}>
                             <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-tight">{yapı.label}</p>
                             <p className="text-sm font-black text-gray-900 dark:text-gray-100">{yapı.value || '-'}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Facility Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingFacility ? 'Tesis Düzenle' : 'Yeni Tesis Ekle'}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false)
                    setEditingFacility(null)
                    resetForm()
                  }}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Temel Bilgiler */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Temel Bilgiler</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tesis Adı <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tesis Kısa Adı
                    </label>
                    <input
                      type="text"
                      name="short_name"
                      value={formData.short_name}
                      onChange={handleInputChange}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tesis Tipi <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="facility_type"
                      value={formData.facility_type}
                      onChange={handleInputChange}
                      required
                      className="input"
                    >
                      <option value="">Seçin</option>
                      {facilityTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tesis ID
                    </label>
                    <input
                      type="text"
                      name="facility_code"
                      value={formData.facility_code}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="Otomatik oluşturulacak"
                    />
                  </div>
                </div>
              </div>

              {/* İletişim Bilgileri */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">İletişim Bilgileri</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Adres
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows={2}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      İl
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      İlçe
                    </label>
                    <input
                      type="text"
                      name="district"
                      value={formData.district}
                      onChange={handleInputChange}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Web Sitesi
                    </label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telefon
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="input"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      E-posta
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="input"
                    />
                  </div>
                </div>
              </div>

              {/* Yasal Bilgiler */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Yasal Bilgiler</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ticari Unvan
                    </label>
                    <input
                      type="text"
                      name="trade_name"
                      value={formData.trade_name}
                      onChange={handleInputChange}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SGK Sicil Numarası
                    </label>
                    <input
                      type="text"
                      name="sgk_registration_number"
                      value={formData.sgk_registration_number}
                      onChange={handleInputChange}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nace Kodu
                    </label>
                    <input
                      type="text"
                      name="nace_code"
                      value={formData.nace_code}
                      onChange={handleInputChange}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      İşyeri Tehlike Sınıfı
                    </label>
                    <select
                      name="workplace_hazard_class"
                      value={formData.workplace_hazard_class}
                      onChange={handleInputChange}
                      className="input"
                    >
                      <option value="">Seçin</option>
                      {hazardClasses.map(cls => (
                        <option key={cls} value={cls}>{cls}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Tesis Bilgileri */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tesis Bilgileri</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Blok Sayısı
                    </label>
                    <input
                      type="number"
                      name="block_count"
                      value={formData.block_count}
                      onChange={handleInputChange}
                      min="1"
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bina Yapım Yılı
                    </label>
                    <input
                      type="number"
                      name="building_construction_year"
                      value={formData.building_construction_year}
                      onChange={handleInputChange}
                      min="1900"
                      max="2100"
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bina Yüksekliği (m)
                    </label>
                    <input
                      type="number"
                      name="building_height"
                      value={formData.building_height}
                      onChange={handleInputChange}
                      step="0.01"
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Yapı Yüksekliği (m)
                    </label>
                    <input
                      type="number"
                      name="structure_height"
                      value={formData.structure_height}
                      onChange={handleInputChange}
                      step="0.01"
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kat Sayısı
                    </label>
                    <input
                      type="number"
                      name="floor_count"
                      value={formData.floor_count}
                      onChange={handleInputChange}
                      min="0"
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kapalı Alan (m²)
                    </label>
                    <input
                      type="number"
                      name="closed_area"
                      value={formData.closed_area}
                      onChange={handleInputChange}
                      step="0.01"
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kapalı Otopark Alanı (m²)
                    </label>
                    <input
                      type="number"
                      name="closed_parking_area"
                      value={formData.closed_parking_area}
                      onChange={handleInputChange}
                      step="0.01"
                      className="input"
                    />
                  </div>
                </div>
              </div>

              {/* Diğer Bilgiler */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Diğer Bilgiler</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Yatak Sayısı
                    </label>
                    <input
                      type="number"
                      name="bed_count"
                      value={formData.bed_count}
                      onChange={handleInputChange}
                      min="0"
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Çalışan Sayısı
                    </label>
                    <input
                      type="number"
                      name="employee_count"
                      value={formData.employee_count}
                      onChange={handleInputChange}
                      min="0"
                      className="input"
                      placeholder="Oracle'dan otomatik"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Taşeron Çalışan Sayısı
                    </label>
                    <input
                      type="number"
                      name="contractor_employee_count"
                      value={formData.contractor_employee_count}
                      onChange={handleInputChange}
                      min="0"
                      className="input"
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingFacility(null)
                    resetForm()
                  }}
                  className="btn btn-secondary"
                >
                  İptal
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingFacility ? 'Güncelle' : 'Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Block Modal */}
      {showBlockModal && selectedFacility && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedFacility.name} - Blok Yönetimi
                </h2>
                <button
                  onClick={() => {
                    setShowBlockModal(false)
                    setSelectedFacility(null)
                    setEditingBlock(null)
                    resetBlockForm()
                  }}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Add Block Form */}
              <form onSubmit={handleBlockSubmit} className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {editingBlock ? 'Blok Düzenle' : 'Yeni Blok Ekle'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Blok Adı <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="block_name"
                      value={blockFormData.block_name}
                      onChange={handleBlockInputChange}
                      required
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Blok Numarası
                    </label>
                    <input
                      type="number"
                      name="block_number"
                      value={blockFormData.block_number}
                      onChange={handleBlockInputChange}
                      min="1"
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Yapım Yılı
                    </label>
                    <input
                      type="number"
                      name="building_construction_year"
                      value={blockFormData.building_construction_year}
                      onChange={handleBlockInputChange}
                      min="1900"
                      max="2100"
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bina Yüksekliği (m)
                    </label>
                    <input
                      type="number"
                      name="building_height"
                      value={blockFormData.building_height}
                      onChange={handleBlockInputChange}
                      step="0.01"
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Yapı Yüksekliği (m)
                    </label>
                    <input
                      type="number"
                      name="structure_height"
                      value={blockFormData.structure_height}
                      onChange={handleBlockInputChange}
                      step="0.01"
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kat Sayısı
                    </label>
                    <input
                      type="number"
                      name="floor_count"
                      value={blockFormData.floor_count}
                      onChange={handleBlockInputChange}
                      min="0"
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kapalı Alan (m²)
                    </label>
                    <input
                      type="number"
                      name="closed_area"
                      value={blockFormData.closed_area}
                      onChange={handleBlockInputChange}
                      step="0.01"
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Otopark Alanı (m²)
                    </label>
                    <input
                      type="number"
                      name="closed_parking_area"
                      value={blockFormData.closed_parking_area}
                      onChange={handleBlockInputChange}
                      step="0.01"
                      className="input"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-4">
                  {editingBlock && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingBlock(null)
                        resetBlockForm()
                      }}
                      className="btn btn-secondary"
                    >
                      İptal
                    </button>
                  )}
                  <button type="submit" className="btn btn-primary">
                    {editingBlock ? 'Güncelle' : 'Ekle'}
                  </button>
                </div>
              </form>

              {/* Blocks List */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Mevcut Bloklar</h3>
                {blocks.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Henüz blok eklenmemiş</p>
                ) : (
                  <div className="space-y-3">
                    {blocks.map(block => (
                      <div key={block.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-gray-900">{block.block_name}</h4>
                              {block.block_number && (
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                                  #{block.block_number}
                                </span>
                              )}
                            </div>
                            <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                              {block.building_construction_year && (
                                <div>
                                  <span className="text-gray-500">Yapım Yılı:</span>
                                  <span className="ml-1">{block.building_construction_year}</span>
                                </div>
                              )}
                              {block.building_height && (
                                <div>
                                  <span className="text-gray-500">Bina Yüksekliği:</span>
                                  <span className="ml-1">{block.building_height}m</span>
                                </div>
                              )}
                              {block.floor_count && (
                                <div>
                                  <span className="text-gray-500">Kat Sayısı:</span>
                                  <span className="ml-1">{block.floor_count}</span>
                                </div>
                              )}
                              {block.closed_area && (
                                <div>
                                  <span className="text-gray-500">Kapalı Alan:</span>
                                  <span className="ml-1">{block.closed_area}m²</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditBlock(block)}
                              className="p-2 text-gray-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
                              title="Düzenle"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteBlock(block.id)}
                              className="p-2 text-gray-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                              title="Sil"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FacilitiesManagement
