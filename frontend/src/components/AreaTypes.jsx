import { useState, useEffect } from 'react'
import { FileText, Plus, Edit, Trash2, ArrowLeft, Folder, Settings, Search, LayoutGrid, ArrowRight } from 'lucide-react'

const AreaTypes = () => {
  const [areaTypes, setAreaTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form states
  const [areaTypeName, setAreaTypeName] = useState('')
  const [areaTypeCategory, setAreaTypeCategory] = useState('')
  const [editingAreaType, setEditingAreaType] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  
  // UI states
  const [showAddModal, setShowAddModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchAreaTypes()
  }, [])

  const fetchAreaTypes = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/eams/areas/types`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setAreaTypes(data || [])
    } catch (err) {
      console.error('Error fetching area types', err)
      setError('Alan türleri yüklenirken hata oluştu.')
    } finally {
      setLoading(false)
    }
  }

  const showMessage = (type, msg) => {
    if (type === 'error') setError(msg)
    if (type === 'success') setSuccess(msg)
    setTimeout(() => {
      setError('')
      setSuccess('')
    }, 3000)
  }

  const handleAreaTypeSubmit = async (e) => {
    e.preventDefault()
    
    const category = selectedCategory || areaTypeCategory
    if (!areaTypeName.trim() || !category.trim()) {
      showMessage('error', 'Kategori ve tür adı gereklidir.')
      return
    }

    try {
      const token = localStorage.getItem('token')
      const url = editingAreaType
        ? `/api/eams/areas/types/${editingAreaType.id}`
        : `/api/eams/areas/types`
      const method = editingAreaType ? 'PUT' : 'POST'
      const body = JSON.stringify({ name: areaTypeName, category })
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body
      })
      const data = await res.json()
      if (res.ok) {
        showMessage('success', editingAreaType ? 'Alan türü güncellendi.' : 'Alan türü eklendi.')
        setAreaTypeName('')
        if (!selectedCategory) setAreaTypeCategory('')
        setEditingAreaType(null)
        setShowAddModal(false)
        fetchAreaTypes()
      } else {
        showMessage('error', data.error || 'Alan türü kaydedilemedi.')
      }
    } catch (err) {
      console.error('Error saving area type', err)
      showMessage('error', 'Sunucuya bağlanılamadı.')
    }
  }

  const handleEditAreaType = (type) => {
    setEditingAreaType(type)
    setAreaTypeName(type.name)
    setAreaTypeCategory(type.category)
    if (type.category) setSelectedCategory(type.category)
    setShowAddModal(true)
  }

  const handleDeleteAreaType = async (id) => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/eams/areas/types/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (res.ok) {
        showMessage('success', 'Alan türü silindi.')
        fetchAreaTypes()
      } else {
        showMessage('error', data.error || 'Alan türü silinirken hata oluştu.')
      }
    } catch (err) {
      console.error('Error deleting area type', err)
      showMessage('error', 'Sunucuya bağlanılamadı.')
    }
  }

  // Get unique categories and filter by search
  const uniqueCategories = [...new Set(areaTypes.map(t => t.category))].filter(cat => 
    cat.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredTypes = areaTypes.filter(t => 
    t.category === selectedCategory && 
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading && areaTypes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-100 dark:border-gray-800 border-t-primary-600 rounded-full animate-spin"></div>
        </div>
        <p className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">VERİLER YÜKLENİYOR</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 transition-all duration-500 animate-in fade-in pb-12">
      {/* Notifications */}
      {(error || success) && (
        <div className="flex flex-col gap-4">
          {error && (
            <div className="p-5 rounded-[2rem] bg-rose-50 dark:bg-rose-900/20 border-2 border-rose-100 dark:border-rose-800 text-rose-800 dark:text-rose-400 flex items-center gap-4 shadow-xl">
              <span className="font-black uppercase tracking-widest text-xs">{error}</span>
            </div>
          )}
          {success && (
            <div className="p-5 rounded-[2rem] bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-100 dark:border-emerald-800 text-emerald-800 dark:text-emerald-400 flex items-center gap-4 shadow-xl">
              <span className="font-black uppercase tracking-widest text-xs">{success}</span>
            </div>
          )}
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 bg-white dark:bg-gray-950 p-10 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-900 transition-colors">
        <div className="flex items-center gap-6">
          <div className="p-5 bg-gradient-to-br from-primary-600 to-indigo-700 rounded-[2rem] shadow-2xl shadow-primary-500/20 transform -rotate-3 transition-transform hover:rotate-0 duration-500">
            <LayoutGrid className="h-10 w-10 text-white" />
          </div>
          <div>
            <h2 className="text-4xl font-black text-gray-950 dark:text-white tracking-tight uppercase tracking-widest leading-none">ALAN TÜRLERİ</h2>
            <p className="text-lg text-gray-500 dark:text-gray-400 mt-2 font-medium">
              Tesis mimarisindeki alan kategorilerini ve türlerini yönetin.
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setEditingAreaType(null)
            setAreaTypeName('')
            setAreaTypeCategory(selectedCategory || '')
            setShowAddModal(true)
          }}
          className="px-10 py-5 bg-gray-950 dark:bg-white text-white dark:text-gray-950 rounded-[1.5rem] hover:scale-105 transition-all font-black text-xs uppercase tracking-[0.2em] shadow-2xl active:scale-95 flex items-center gap-3"
        >
          <Plus className="h-5 w-5" /> YENİ TÜR EKLE
        </button>
      </div>

      {/* Main Content Area */}
      {!selectedCategory ? (
        /* Categories View */
        <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-700">
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
            <input
              type="text"
              placeholder="SİSTEMDE KATEGORİ ARA..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-16 pr-8 py-6 bg-white dark:bg-gray-950 border-2 border-transparent focus:border-primary-500 rounded-[2rem] text-gray-900 dark:text-white placeholder-gray-400 transition-all shadow-xl outline-none font-black text-sm uppercase tracking-widest"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {uniqueCategories.map(cat => {
              const count = areaTypes.filter(t => t.category === cat).length
              return (
                <div
                  key={cat}
                  onClick={() => { setSelectedCategory(cat); setSearchQuery(''); }}
                  className="group relative bg-white dark:bg-gray-900 rounded-[2.5rem] p-10 border-2 border-transparent hover:border-primary-500/20 shadow-xl hover:shadow-3xl transition-all duration-500 cursor-pointer overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
                    <Folder className="h-32 w-32 text-primary-500" />
                  </div>
                  
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-8">
                       <div className="p-4 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-2xl group-hover:bg-primary-600 group-hover:text-white transition-all duration-500">
                        <Folder className="h-8 w-8" />
                      </div>
                      <span className="px-4 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-xl text-[10px] font-black uppercase tracking-[0.2em]">
                        {count} TÜR TANIMLI
                      </span>
                    </div>
                    <h3 className="text-2xl font-black text-gray-950 dark:text-white uppercase tracking-tight mb-6 group-hover:translate-x-1 transition-transform">{cat || '(Kategorisiz)'}</h3>
                    <div className="mt-auto pt-6 border-t border-gray-50 dark:border-gray-800 flex items-center justify-between">
                       <span className="text-[10px] font-black text-primary-600 dark:text-primary-400 uppercase tracking-widest">DETAYLARI GÖRÜNTÜLE</span>
                       <ArrowRight className="h-5 w-5 text-gray-300 group-hover:translate-x-2 transition-transform group-hover:text-primary-500" />
                    </div>
                  </div>
                </div>
              )
            })}
            
            {uniqueCategories.length === 0 && (
              <div className="col-span-full py-32 text-center bg-white dark:bg-gray-950 rounded-[3rem] border-4 border-dashed border-gray-100 dark:border-gray-900 transition-all">
                <div className="p-10 bg-gray-50 dark:bg-gray-900 rounded-[2rem] w-32 h-32 flex items-center justify-center mx-auto mb-8 shadow-inner">
                  <Folder className="h-14 w-14 text-gray-300 dark:text-gray-700" />
                </div>
                <h3 className="text-3xl font-black text-gray-950 dark:text-white uppercase tracking-widest mb-4">VERİ BULUNAMADI</h3>
                <p className="text-gray-500 dark:text-gray-400 font-bold max-w-sm mx-auto">Sistemde henüz bir kategori tanımlanmamış.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Types Detail View */
        <div className="space-y-8 animate-in slide-in-from-right-12 duration-700">
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-white dark:bg-gray-950 p-8 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-900 transition-colors">
            <div className="flex items-center gap-6">
              <button
                onClick={() => { setSelectedCategory(''); setSearchQuery(''); }}
                className="p-4 bg-gray-50 dark:bg-gray-900 text-gray-400 dark:text-gray-500 hover:text-gray-950 dark:hover:text-white hover:scale-110 rounded-2xl transition-all shadow-sm"
              >
                <ArrowLeft className="h-7 w-7" />
              </button>
              <div className="h-12 w-1 bg-gray-100 dark:bg-gray-800 rounded-full"></div>
              <div>
                <h3 className="text-2xl font-black text-gray-950 dark:text-white uppercase tracking-widest">{selectedCategory}</h3>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.3em] mt-1">KATEGORİ İÇERİĞİ</p>
              </div>
            </div>
            <div className="relative w-full md:w-96 group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
              <input
                type="text"
                placeholder="BU KATEGORİDE ARA..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-primary-500 rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 transition-all font-black text-xs uppercase tracking-widest outline-none shadow-inner"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTypes.map(t => (
              <div
                key={t.id}
                className="relative group bg-white dark:bg-gray-900 rounded-[2rem] p-8 border-2 border-transparent hover:border-primary-500/20 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 overflow-hidden"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 text-gray-400 rounded-2xl group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 group-hover:text-primary-600 transition-all duration-500">
                    <FileText className="h-7 w-7" />
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                    <button
                      onClick={() => handleEditAreaType(t)}
                      className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white rounded-xl transition-all shadow-sm"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(t.id)}
                      className="p-3 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white rounded-xl transition-all shadow-sm"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <h4 className="text-xl font-black text-gray-950 dark:text-white uppercase tracking-tight">{t.name}</h4>
                <div className="mt-6 pt-4 border-t border-gray-50 dark:border-gray-800 flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                   ID: <span className="text-gray-950 dark:text-gray-500">{t.id}</span>
                </div>

                {/* Confirm Delete Overlay */}
                {confirmDeleteId === t.id && (
                  <div className="absolute inset-0 bg-gray-950/95 flex flex-col items-center justify-center p-6 text-center z-20 animate-in fade-in zoom-in-95 duration-300 rounded-[2rem]">
                    <div className="p-4 bg-rose-600 rounded-full mb-4 shadow-2xl shadow-rose-600/30">
                      <Trash2 className="h-8 w-8 text-white" />
                    </div>
                    <p className="text-white font-black uppercase tracking-widest text-sm mb-6">SİLMEK İSTEDİĞİNİZE EMİN MİSİNİZ?</p>
                    <div className="flex gap-4 w-full">
                      <button onClick={() => setConfirmDeleteId(null)} className="flex-1 py-3 bg-gray-800 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all hover:bg-gray-700">İPTAL</button>
                      <button onClick={() => handleDeleteAreaType(t.id)} className="flex-1 py-3 bg-rose-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all hover:bg-rose-700 shadow-xl shadow-rose-600/20">SİL</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal - Unified Design */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-950/80 backdrop-blur-xl flex items-center justify-center z-[100] p-6 animate-in fade-in duration-500">
          <div className="bg-white dark:bg-gray-900 rounded-[3rem] w-full max-w-xl shadow-3xl overflow-hidden animate-in slide-in-from-bottom-20 duration-500 border border-gray-100 dark:border-gray-800 relative">
            <div className={`h-3 w-full ${editingAreaType ? 'bg-blue-600' : 'bg-primary-600'}`}></div>
            <div className="p-10 md:p-14">
              <div className="flex items-center justify-between mb-12">
                <div>
                   <h3 className="text-3xl font-black text-gray-950 dark:text-white tracking-tighter uppercase tracking-widest">
                    {editingAreaType ? 'TÜR GÜNCELLEME' : 'YENİ ALAN TANIMI'}
                  </h3>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mt-2">ALAN MIMARİSİ YAPILANDIRMASI</p>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                   className="p-4 bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-gray-950 dark:hover:text-white rounded-[1.5rem] transition-all"
                >
                   <X className="h-7 w-7" />
                </button>
              </div>
              
              <form onSubmit={handleAreaTypeSubmit} className="space-y-10">
                {!selectedCategory && (
                  <div className="space-y-3 px-2">
                    <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] ml-2">ÜST KATEGORİ ADI *</label>
                    <input
                      type="text"
                      value={areaTypeCategory}
                      onChange={(e) => setAreaTypeCategory(e.target.value)}
                      className="w-full px-8 py-5 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary-500 rounded-2xl text-gray-950 dark:text-white placeholder-gray-400 transition-all shadow-inner outline-none font-black text-lg uppercase tracking-tight"
                      placeholder="ÖRN: KAPALI ALANLAR"
                    />
                  </div>
                )}
                <div className="space-y-3 px-2">
                  <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] ml-2">ALAN TÜR ADI *</label>
                  <input
                    type="text"
                    value={areaTypeName}
                    onChange={(e) => setAreaTypeName(e.target.value)}
                    className="w-full px-8 py-5 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary-500 rounded-2xl text-gray-950 dark:text-white placeholder-gray-400 transition-all shadow-inner outline-none font-black text-lg uppercase tracking-tight"
                    placeholder="ÖRN: KORİDOR VE HOL"
                    autoFocus
                  />
                </div>
                <div className="pt-8 flex flex-col sm:flex-row gap-6">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-5 bg-gray-100 dark:bg-gray-800 text-gray-400 font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-gray-200 transition-all"
                  >
                    İŞLEMİ İPTAL ET
                  </button>
                  <button
                    type="submit"
                    disabled={!areaTypeName.trim() || (!selectedCategory && !areaTypeCategory.trim())}
                    className="flex-1 py-5 bg-gray-950 dark:bg-white text-white dark:text-gray-950 font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:scale-105 transition-all shadow-2xl disabled:opacity-30 disabled:hover:scale-100 shadow-primary-500/20 active:scale-95"
                  >
                    {editingAreaType ? 'DEĞİŞİKLİKLERİ KAYDET' : 'HEDEFİ SİSTEME EKLE'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AreaTypes
