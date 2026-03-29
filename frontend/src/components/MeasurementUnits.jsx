import { useState, useEffect } from 'react'
import { Scale, Plus, Edit, Trash2, Search, ArrowLeft, Ruler, Activity, Sparkles, X } from 'lucide-react'

const MeasurementUnits = () => {
  const [units, setUnits] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form states
  const [showModal, setShowModal] = useState(false)
  const [editingUnit, setEditingUnit] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    unit_type: 'Electrical',
    description: ''
  })

  const unitTypes = [
    'Electrical', 'Weight', 'Volume', 'Heating', 'Digital', 'Medical', 'Other'
  ]

  useEffect(() => {
    fetchUnits()
  }, [])

  const fetchUnits = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const res = await fetch('/api/eams/settings/measurement-units', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setUnits(data || [])
    } catch (err) {
      console.error('Error fetching units', err)
      setError('Ölçü birimleri yüklenirken hata oluştu.')
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
    if (!formData.name.trim() || !formData.symbol.trim() || !formData.unit_type) {
      showMessage('error', 'Ad, sembol ve tür gereklidir.')
      return
    }

    try {
      const token = localStorage.getItem('token')
      const url = editingUnit
        ? `/api/eams/settings/measurement-units/${editingUnit.id}`
        : `/api/eams/settings/measurement-units`
      const method = editingUnit ? 'PUT' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        showMessage('success', editingUnit ? 'Birim güncellendi.' : 'Yeni birim eklendi.')
        setShowModal(false)
        setEditingUnit(null)
        setFormData({ name: '', symbol: '', unit_type: 'Electrical', description: '' })
        fetchUnits()
      } else {
        const data = await res.json()
        showMessage('error', data.error || 'Birim kaydedilemedi.')
      }
    } catch (err) {
      console.error('Error saving unit', err)
      showMessage('error', 'Sunucuya bağlanılamadı.')
    }
  }

  const handleEdit = (unit) => {
    setEditingUnit(unit)
    setFormData({
      name: unit.name,
      symbol: unit.symbol,
      unit_type: unit.unit_type,
      description: unit.description || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Bu birimi silmek istediğinize emin misiniz?')) return
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/eams/settings/measurement-units/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        showMessage('success', 'Birim silindi.')
        fetchUnits()
      } else {
        const data = await res.json()
        showMessage('error', data.error || 'Birim silinemedi.')
      }
    } catch (err) {
      console.error('Error deleting unit', err)
      showMessage('error', 'Sunucuya bağlanılamadı.')
    }
  }

  const filteredUnits = units.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.unit_type.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading && units.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-8 animate-in fade-in duration-500">
        <div className="relative">
          <div className="w-20 h-20 border-8 border-gray-100 dark:border-gray-800 border-t-primary-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Scale className="h-6 w-6 text-primary-600 animate-pulse" />
          </div>
        </div>
        <p className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.5em] animate-pulse">BİRİMLER SENKRONİZE EDİLİYOR</p>
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
          <div className="p-5 bg-gradient-to-br from-primary-600 to-indigo-700 rounded-[2rem] shadow-2xl shadow-primary-500/20 transform -rotate-3 transition-transform hover:rotate-0 duration-500">
            <Scale className="h-10 w-10 text-white" />
          </div>
          <div>
            <h2 className="text-4xl font-black text-gray-950 dark:text-white tracking-tight uppercase tracking-widest leading-none">ÖLÇÜ BİRİMLERİ</h2>
            <p className="text-lg text-gray-500 dark:text-gray-400 mt-2 font-medium">
              Varlık teknik özellikleri ve değerleri için kullanılanevrensel birimler.
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setEditingUnit(null)
            setFormData({ name: '', symbol: '', unit_type: 'Electrical', description: '' })
            setShowModal(true)
          }}
          className="px-10 py-5 bg-gray-950 dark:bg-white text-white dark:text-gray-950 rounded-[1.5rem] hover:scale-105 transition-all font-black text-xs uppercase tracking-[0.2em] shadow-2xl active:scale-95 flex items-center gap-3"
        >
          <Plus className="h-5 w-5" /> YENİ BİRİM EKLE
        </button>
      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-gray-950 rounded-[3rem] shadow-2xl border border-gray-100 dark:border-gray-900 overflow-hidden transition-all duration-500">
        <div className="p-8 border-b border-gray-100 dark:border-gray-900 bg-gray-50/50 dark:bg-gray-900/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-600 rounded-xl">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-950 dark:text-white uppercase tracking-widest">SİSTEM BİRİM HAVUZU</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em] mt-1">Aktif Tanımlı Birimler</p>
            </div>
          </div>
          
          <div className="relative group w-full md:w-96">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
            <input
              type="text"
              placeholder="BİRİMLERDE ARA..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-white dark:bg-gray-800 border-2 border-transparent focus:border-primary-500 rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 transition-all font-black text-xs uppercase tracking-widest outline-none shadow-inner"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 dark:bg-gray-800/30 text-gray-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">
              <tr>
                <th className="px-10 py-6">BİRİM ADI</th>
                <th className="px-10 py-6">SEMBOL</th>
                <th className="px-10 py-6">KATEGORİ</th>
                <th className="px-10 py-6">AÇIKLAMA</th>
                <th className="px-10 py-6 text-right">AKSİYON</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 transition-colors">
              {filteredUnits.map(unit => (
                <tr key={unit.id} className="hover:bg-primary-50/10 dark:hover:bg-primary-900/10 transition-all duration-300 group">
                  <td className="px-10 py-7">
                    <div className="flex items-center gap-5">
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 rounded-xl group-hover:bg-primary-600 group-hover:text-white transition-all duration-500 shadow-sm border border-gray-100 dark:border-gray-700">
                        <Scale className="h-5 w-5" />
                      </div>
                      <span className="font-black text-gray-950 dark:text-white text-lg tracking-tight uppercase">{unit.name}</span>
                    </div>
                  </td>
                  <td className="px-10 py-7 text-center">
                    <span className="px-5 py-2.5 bg-gray-950 dark:bg-gray-800 text-white dark:text-primary-400 rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-lg border-2 border-white/10">
                      {unit.symbol}
                    </span>
                  </td>
                  <td className="px-10 py-7">
                    <span className="px-4 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-xl font-black text-[10px] uppercase tracking-widest border border-blue-100 dark:border-blue-800">
                      {unit.unit_type.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-10 py-7">
                    <span className="text-sm text-gray-500 dark:text-gray-400 font-bold italic line-clamp-1">{unit.description || 'NOT EKLENMEMİŞ'}</span>
                  </td>
                  <td className="px-10 py-7 text-right">
                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-2 group-hover:translate-x-0">
                      <button
                        onClick={() => handleEdit(unit)}
                        className="p-3 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-600 hover:text-white rounded-xl transition-all shadow-sm"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      {!unit.is_system && (
                        <button
                          onClick={() => handleDelete(unit.id)}
                          className="p-3 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30 hover:bg-rose-600 hover:text-white rounded-xl transition-all shadow-sm"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUnits.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-10 py-32 text-center bg-gray-50/20 dark:bg-gray-950/20">
                    <div className="flex flex-col items-center">
                      <div className="p-10 bg-gray-100 dark:bg-gray-800 rounded-[2.5rem] mb-8">
                         <Scale className="h-16 w-16 text-gray-300 dark:text-gray-600" />
                      </div>
                      <p className="font-black uppercase tracking-[0.4em] text-gray-400 text-lg">EŞLEŞEN BİRİM BULUNAMADI</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Design */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-950/80 backdrop-blur-xl flex items-center justify-center z-[100] p-6 animate-in fade-in duration-500">
          <div className="bg-white dark:bg-gray-900 rounded-[3rem] w-full max-w-xl shadow-3xl overflow-hidden animate-in slide-in-from-bottom-20 duration-500 border border-gray-100 dark:border-gray-800 relative">
            <div className={`h-3 w-full ${editingUnit ? 'bg-blue-600' : 'bg-primary-600'}`}></div>
            <div className="p-10 md:p-14">
              <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-5">
                   <div className={`p-4 rounded-2xl ${editingUnit ? 'bg-blue-600' : 'bg-primary-600'} shadow-2xl shadow-primary-500/20`}>
                    <Scale className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-gray-950 dark:text-white tracking-tighter uppercase tracking-widest leading-none">
                      {editingUnit ? 'BİRİM GÜNCELLE' : 'YENİ BİRİM'}
                    </h3>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mt-2">TECHNICAL UNIT PARAMETERS</p>
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
                  <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] ml-2">BİRİM ADI (FULL NAME) *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-8 py-5 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary-500 rounded-2xl text-gray-950 dark:text-white placeholder-gray-400 transition-all shadow-inner outline-none font-black text-lg uppercase tracking-tight"
                    placeholder="ÖRN: KILOWATT SAAT"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] ml-2">SEMBOL *</label>
                    <input
                      type="text"
                      required
                      value={formData.symbol}
                      onChange={(e) => setFormData({...formData, symbol: e.target.value})}
                      className="w-full px-8 py-5 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary-500 rounded-2xl text-gray-950 dark:text-white placeholder-gray-400 transition-all shadow-inner outline-none font-black text-lg text-center"
                      placeholder="kWh"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] ml-2">ÖLÇÜM KATEGORİSİ *</label>
                    <select
                      value={formData.unit_type}
                      onChange={(e) => setFormData({...formData, unit_type: e.target.value})}
                      className="w-full px-8 py-5 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary-500 rounded-2xl font-black text-xs text-gray-700 dark:text-gray-300 outline-none transition-all cursor-pointer shadow-inner uppercase tracking-widest"
                    >
                      {unitTypes.map(t => (
                        <option key={t} value={t}>{t.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] ml-2">OPSİYONEL AÇIKLAMA</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-8 py-5 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary-500 rounded-2xl font-bold text-gray-900 dark:text-white placeholder-gray-400 transition-all shadow-inner outline-none h-32 resize-none"
                    placeholder="Birim kullanım alanı veya teknik notlar..."
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
                    className="flex-1 py-5 bg-gray-950 dark:bg-white text-white dark:text-gray-950 font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:scale-105 transition-all shadow-2xl shadow-primary-500/20 active:scale-95 flex items-center justify-center gap-3"
                  >
                    <Sparkles className="h-4 w-4" />
                    {editingUnit ? 'VERİYİ GÜNCELLE' : 'BİRİMİ SİSTEME EKLE'}
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

export default MeasurementUnits
