import { useState, useEffect } from 'react'
import { Zap, Plus, Edit, Trash2, Search, ArrowLeft, Leaf, Sparkles, X, Activity } from 'lucide-react'

const EnergyTypes = () => {
  const [energyTypes, setEnergyTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form states
  const [showModal, setShowModal] = useState(false)
  const [editingType, setEditingType] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  })

  useEffect(() => {
    fetchEnergyTypes()
  }, [])

  const fetchEnergyTypes = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const res = await fetch('/api/eams/settings/energy-types', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setEnergyTypes(data || [])
    } catch (err) {
      console.error('Error fetching energy types', err)
      setError('Enerji türleri yüklenirken hata oluştu.')
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      showMessage('error', 'Enerji türü adı gereklidir.')
      return
    }

    try {
      const token = localStorage.getItem('token')
      const url = editingType
        ? `/api/eams/settings/energy-types/${editingType.id}`
        : `/api/eams/settings/energy-types`
      const method = editingType ? 'PUT' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        showMessage('success', editingType ? 'Enerji türü güncellendi.' : 'Yeni enerji türü eklendi.')
        setShowModal(false)
        setEditingType(null)
        setFormData({ name: '', description: '' })
        fetchEnergyTypes()
      } else {
        const data = await res.json()
        showMessage('error', data.error || 'Enerji türü kaydedilemedi.')
      }
    } catch (err) {
      console.error('Error saving energy type', err)
      showMessage('error', 'Sunucuya bağlanılamadı.')
    }
  }

  const handleEdit = (type) => {
    setEditingType(type)
    setFormData({
      name: type.name,
      description: type.description || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Bu enerji türünü silmek istediğinize emin misiniz?')) return
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/eams/settings/energy-types/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        showMessage('success', 'Enerji türü silindi.')
        fetchEnergyTypes()
      } else {
        const data = await res.json()
        showMessage('error', data.error || 'Enerji türü silinemedi.')
      }
    } catch (err) {
      console.error('Error deleting energy type', err)
      showMessage('error', 'Sunucuya bağlanılamadı.')
    }
  }

  const filteredTypes = energyTypes.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  if (loading && energyTypes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-8 animate-in fade-in duration-500">
        <div className="relative">
          <div className="w-20 h-20 border-8 border-gray-100 dark:border-gray-800 border-t-amber-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Zap className="h-6 w-6 text-amber-500 animate-pulse" />
          </div>
        </div>
        <p className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.5em] animate-pulse">ENERJİ PARAMETRELERİ YÜKLENİYOR</p>
      </div>
    )
  }

  return (
    <div className="space-y-10 transition-all duration-500 animate-in fade-in pb-20">
      {/* Notifications */}
      {(error || success) && (
        <div className="flex flex-col gap-4 animate-in slide-in-from-top-4 duration-500">
          {error && (
            <div className="p-6 rounded-[2rem] bg-rose-50 dark:bg-rose-900/20 border-2 border-rose-100 dark:border-rose-800 text-rose-800 dark:text-rose-400 flex items-center gap-4 shadow-xl">
              <span className="font-black uppercase tracking-widest text-xs">{error}</span>
            </div>
          )}
          {success && (
            <div className="p-6 rounded-[2rem] bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-100 dark:border-emerald-800 text-emerald-800 dark:text-emerald-400 flex items-center gap-4 shadow-xl">
              <span className="font-black uppercase tracking-widest text-xs">{success}</span>
            </div>
          )}
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 bg-white dark:bg-gray-950 p-10 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-900 transition-colors">
        <div className="flex items-center gap-6">
          <div className="p-5 bg-gradient-to-br from-amber-400 to-orange-600 rounded-[2rem] shadow-2xl shadow-amber-500/20 transform -rotate-3 transition-transform hover:rotate-0 duration-500">
            <Zap className="h-10 w-10 text-white" />
          </div>
          <div>
            <h2 className="text-4xl font-black text-gray-950 dark:text-white tracking-tight uppercase tracking-widest leading-none">ENERJİ TÜRLERİ</h2>
            <p className="text-lg text-gray-500 dark:text-gray-400 mt-2 font-medium">
              Tesis ve varlık operasyonlarında kullanılan enerji kaynaklarını yönetin.
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setEditingType(null)
            setFormData({ name: '', description: '' })
            setShowModal(true)
          }}
          className="px-10 py-5 bg-gray-950 dark:bg-white text-white dark:text-gray-950 rounded-[1.5rem] hover:scale-105 transition-all font-black text-xs uppercase tracking-[0.2em] shadow-2xl active:scale-95 flex items-center gap-3"
        >
          <Plus className="h-5 w-5" /> YENİ KAYNAK EKLE
        </button>
      </div>

      {/* Grid Section */}
      <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-700">
        <div className="relative group">
          <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400 group-focus-within:text-amber-500 transition-colors" />
          <input
            type="text"
            placeholder="ENERJİ KAYNAKLARIINDA ARA..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-16 pr-8 py-6 bg-white dark:bg-gray-950 border-2 border-transparent focus:border-amber-500 rounded-[2rem] text-gray-900 dark:text-white placeholder-gray-400 transition-all shadow-xl outline-none font-black text-sm uppercase tracking-widest"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTypes.map(type => (
            <div
              key={type.id}
              className="group relative bg-white dark:bg-gray-900 rounded-[2.5rem] p-10 border-2 border-transparent hover:border-amber-500/20 shadow-xl hover:shadow-3xl transition-all duration-500 overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
                <Zap className="h-32 w-32 text-amber-500" />
              </div>
              
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-start justify-between mb-8">
                  <div className="p-4 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-2xl group-hover:bg-amber-500 group-hover:text-white transition-all duration-500 shadow-sm border border-amber-100 dark:border-amber-800">
                    <Zap className="h-8 w-8" />
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0">
                    <button
                      onClick={() => handleEdit(type)}
                      className="p-3 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white rounded-xl transition-all shadow-md border border-gray-100 dark:border-gray-700"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    {!type.is_system && (
                      <button
                        onClick={() => handleDelete(type.id)}
                        className="p-3 bg-white dark:bg-gray-800 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white rounded-xl transition-all shadow-md border border-gray-100 dark:border-gray-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
                
                <h3 className="text-2xl font-black text-gray-950 dark:text-white uppercase tracking-tight mb-4 group-hover:translate-x-1 transition-transform">{type.name}</h3>
                <p className="text-gray-500 dark:text-gray-400 font-bold text-sm leading-relaxed line-clamp-2 min-h-[48px] italic">
                  {type.description || 'Bu kaynak henüz detaylandırılmamış.'}
                </p>
                
                <div className="mt-8 pt-6 border-t border-gray-50 dark:border-gray-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">AKTİF SİSTEM PARAMETRESİ</span>
                  </div>
                  <Leaf className="h-5 w-5 text-emerald-500 opacity-30 group-hover:opacity-100 group-hover:scale-125 transition-all duration-500" />
                </div>
              </div>
            </div>
          ))}

          {filteredTypes.length === 0 && (
            <div className="col-span-full py-32 text-center bg-white dark:bg-gray-950 rounded-[3rem] border-4 border-dashed border-gray-100 dark:border-gray-900 transition-all">
              <div className="p-10 bg-gray-50 dark:bg-gray-900 rounded-[2rem] w-32 h-32 flex items-center justify-center mx-auto mb-8 shadow-inner">
                <Zap className="h-14 w-14 text-gray-300 dark:text-gray-700" />
              </div>
              <h3 className="text-3xl font-black text-gray-950 dark:text-white uppercase tracking-widest mb-4">SONUÇ BULUNAMADI</h3>
              <p className="text-gray-500 dark:text-gray-400 font-bold max-w-sm mx-auto italic">Arama kriterlerinize uygun enerji kaynağı mevcut değil.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Design */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-950/80 backdrop-blur-xl flex items-center justify-center z-[100] p-6 animate-in fade-in duration-500">
          <div className="bg-white dark:bg-gray-900 rounded-[3rem] w-full max-w-xl shadow-3xl overflow-hidden animate-in slide-in-from-bottom-20 duration-500 border border-gray-100 dark:border-gray-800 relative">
            <div className={`h-3 w-full ${editingType ? 'bg-amber-500' : 'bg-orange-600'}`}></div>
            <div className="p-10 md:p-14">
              <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-5">
                   <div className={`p-4 rounded-2xl ${editingType ? 'bg-amber-500' : 'bg-orange-600'} shadow-2xl shadow-orange-500/20`}>
                    <Zap className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-gray-950 dark:text-white tracking-tighter uppercase tracking-widest leading-none">
                      {editingType ? 'KAYNAK GÜNCELLE' : 'YENİ KAYNAK'}
                    </h3>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mt-2">ENERGY SOURCE CONFIGURATION</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                   className="p-4 bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-gray-950 dark:hover:text-white rounded-[1.5rem] transition-all"
                >
                   <X className="h-7 w-7" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-10">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] ml-2">TÜR ADI (LABEL) *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-8 py-5 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-amber-500 rounded-2xl text-gray-950 dark:text-white placeholder-gray-400 transition-all shadow-inner outline-none font-black text-lg uppercase tracking-tight"
                    placeholder="ÖRN: GÜNEŞ ENERJİSİ / FOTOVOLTAİK"
                  />
                </div>
                
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] ml-2">OPSİYONEL AÇIKLAMA</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-8 py-5 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-amber-500 rounded-2xl font-bold text-gray-900 dark:text-white placeholder-gray-400 transition-all shadow-inner outline-none h-40 resize-none leading-relaxed"
                    placeholder="Enerji kaynağı hakkında teknik detaylar, kullanım yerleri veya notlar..."
                  />
                </div>

                <div className="pt-8 flex flex-col sm:flex-row gap-6">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-5 bg-gray-100 dark:bg-gray-800 text-gray-400 font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-gray-200 transition-all"
                  >
                    İŞLEMİ İPTAL ET
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-5 bg-gray-950 dark:bg-white text-white dark:text-gray-950 font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:scale-105 transition-all shadow-2xl shadow-orange-500/20 active:scale-95 flex items-center justify-center gap-3"
                  >
                    <Sparkles className="h-4 w-4" />
                    {editingType ? 'VERİYİ GÜNCELLE' : 'SİSTEME KAYDET'}
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

export default EnergyTypes
