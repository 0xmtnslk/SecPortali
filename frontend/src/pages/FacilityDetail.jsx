import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { Building2, Edit, Trash2, ArrowLeft, Plus, Map, Info, Phone, Mail, Globe, Scale, Activity, ArrowRight, X, Sparkles } from 'lucide-react'

const FacilityDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/settings/facilities'
  const [facility, setFacility] = useState(null)
  const [blocks, setBlocks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showBlockModal, setShowBlockModal] = useState(false)
  const [editingBlock, setEditingBlock] = useState(null)
  const [message, setMessage] = useState({ type: '', text: '' })

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

  useEffect(() => {
    fetchFacility()
    fetchBlocks()
  }, [id])

  const fetchFacility = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/facilities/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      setFacility(data.facility || data)
    } catch (error) {
      console.error('Error fetching facility:', error)
      showMessage('error', 'Tesis bilgileri yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const fetchBlocks = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/facilities/${id}/blocks`, {
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

  const handleDeleteFacility = async () => {
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
        navigate('/settings/facilities')
      } else {
        showMessage('error', 'Silme işlemi başarısız')
      }
    } catch (error) {
      console.error('Error deleting facility:', error)
      showMessage('error', 'Silme sırasında hata oluştu')
    }
  }

  const handleBlockSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const token = localStorage.getItem('token')
      const url = editingBlock
        ? `/api/facilities/${id}/blocks/${editingBlock.id}`
        : `/api/facilities/${id}/blocks`
      
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
        fetchBlocks()
      } else {
        const error = await response.json()
        showMessage('error', error.error || 'İşlem başarısız')
      }
    } catch (error) {
      console.error('Error saving block:', error)
      showMessage('error', 'İşlem sırasında hata oluştu')
    }
  }

  const handleDeleteBlock = async (blockId) => {
    if (!window.confirm('Bu bloğu silmek istediğinize emin misiniz?')) return
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/facilities/${id}/blocks/${blockId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        showMessage('success', 'Blok silindi')
        fetchBlocks()
      } else {
        showMessage('error', 'Silme işlemi başarısız')
      }
    } catch (error) {
      console.error('Error deleting block:', error)
      showMessage('error', 'Silme sırasında hata oluştu')
    }
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-8 transition-all animate-in fade-in">
        <div className="relative">
          <div className="w-20 h-20 border-8 border-gray-100 dark:border-gray-800 border-t-primary-600 rounded-full animate-spin"></div>
        </div>
        <p className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.5em] animate-pulse">TESİS ANALİZ EDİLİYOR</p>
      </div>
    )
  }

  if (!facility) {
    return (
      <div className="text-center py-40 animate-in fade-in">
        <div className="p-10 bg-gray-50 dark:bg-gray-900 rounded-[3rem] w-32 h-32 flex items-center justify-center mx-auto mb-8 shadow-inner">
          <Building2 className="h-14 w-14 text-gray-300 dark:text-gray-700" />
        </div>
        <h3 className="text-3xl font-black text-gray-950 dark:text-white uppercase tracking-widest mb-4">TESİS BULUNAMADI</h3>
        <button onClick={() => navigate(from)} className="text-primary-600 font-black uppercase tracking-widest text-xs hover:underline decoration-2 underline-offset-8">LİSTEYE GERİ DÖN</button>
      </div>
    )
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      {/* Notifications */}
      {message.text && (
        <div className={`p-6 rounded-[2rem] border-2 shadow-2xl animate-in slide-in-from-top-4 transition-all duration-300 ${message.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-800 dark:text-rose-400 border-rose-100 dark:border-rose-800'}`}>
          <span className="font-black uppercase tracking-[0.1em] text-sm">{message.text}</span>
        </div>
      )}

      {/* Hero Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10 bg-white dark:bg-gray-900 p-12 rounded-[3rem] shadow-2xl border border-gray-100 dark:border-gray-800 transition-all duration-500 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <Building2 className="h-64 w-64 text-primary-600" />
        </div>
        <div className="flex items-center gap-10 relative z-10 font-bold">
           <div className="p-6 bg-gradient-to-br from-primary-600 to-indigo-700 rounded-[2.5rem] shadow-3xl shadow-primary-500/20 transform -rotate-3 transition-transform hover:rotate-0 duration-500">
            <Building2 className="h-12 w-12 text-white" />
          </div>
          <div className="space-y-3">
             <button
              onClick={() => navigate(from)}
              className="group flex items-center gap-3 text-gray-400 hover:text-primary-600 transition-all font-black uppercase tracking-[0.2em] text-[10px]"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> TESİSLER HAVUZU
            </button>
            <h1 className="text-5xl font-black text-gray-950 dark:text-white tracking-tighter uppercase leading-none">{facility.name}</h1>
            <div className="flex items-center gap-4">
               <span className="px-4 py-1.5 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-gray-100 dark:border-gray-700">
                {facility.facility_type || 'TESİS TİPİ TANIMSIZ'}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">SİSTEMDE AKTİF</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 relative z-10 transition-all">
          <button
            onClick={() => navigate(`/facilities/${id}/map`, { state: { from } })}
            className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[1.5rem] transition-all font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-500/20 active:scale-95 flex items-center gap-3"
          >
            <Map className="h-5 w-5" /> HARİTA GÖRÜNÜMÜ
          </button>
          <button
            onClick={() => navigate(`/settings/facilities/${id}/edit`, { state: { from } })}
            className="px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-[1.5rem] transition-all font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary-500/20 active:scale-95 flex items-center gap-3"
          >
            <Edit className="h-5 w-5" /> DÜZENLE
          </button>
          <button
            onClick={handleDeleteFacility}
            className="px-8 py-4 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white rounded-[1.5rem] transition-all font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95 flex items-center gap-3 border border-rose-100 dark:border-rose-800"
          >
            <Trash2 className="h-5 w-5" /> SİL
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 transition-all font-bold">
        {/* Left Column - Main Details */}
        <div className="lg:col-span-8 space-y-10">
          {/* Identity & Technical */}
          <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-10 shadow-xl border border-gray-100 dark:border-gray-800 transition-colors">
            <div className="flex items-center gap-4 mb-10 pb-6 border-b border-gray-50 dark:border-gray-800">
               <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-2xl">
                <Info className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-xl font-black text-gray-950 dark:text-white uppercase tracking-widest">KİMLİK VE TEKNİK VERİLER</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="space-y-3">
                <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] block">TESİS KODU</span>
                <p className="text-xl font-black text-gray-950 dark:text-white tracking-widest leading-none bg-gray-50 dark:bg-gray-800 px-4 py-3 rounded-xl w-fit border border-gray-100 dark:border-gray-700">{facility.facility_code || '---'}</p>
              </div>
              <div className="space-y-3">
                <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] block">KISA AD (REF)</span>
                <p className="text-xl font-black text-gray-950 dark:text-white uppercase tracking-tight leading-none">{facility.short_name || '---'}</p>
              </div>
              <div className="space-y-3">
                <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] block">YAPIM YILI</span>
                <p className="text-xl font-black text-gray-950 dark:text-white tracking-tight leading-none">{facility.building_construction_year || '---'}</p>
              </div>
              <div className="space-y-3">
                <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] block">KAPALI ALAN (m²)</span>
                <p className="text-3xl font-black text-primary-600 dark:text-primary-400 tracking-tighter leading-none">{facility.closed_area?.toLocaleString() || '0'} <span className="text-xs text-gray-400">m²</span></p>
              </div>
              <div className="space-y-3">
                <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] block">KAT SAYISI</span>
                <p className="text-3xl font-black text-gray-950 dark:text-white tracking-tighter leading-none">{facility.floor_count || '0'}</p>
              </div>
              <div className="space-y-3">
                <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] block">BLOK ADEDİ</span>
                <p className="text-3xl font-black text-gray-950 dark:text-white tracking-tighter leading-none">{facility.block_count || '0'}</p>
              </div>
            </div>
          </div>

          {/* Legal / Institutional */}
          <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-10 shadow-xl border border-gray-100 dark:border-gray-800 transition-colors">
            <div className="flex items-center gap-4 mb-10 pb-6 border-b border-gray-50 dark:border-gray-800">
               <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl">
                <Scale className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-xl font-black text-gray-950 dark:text-white uppercase tracking-widest">KURUMSAL VE YASAL BİLGİLER</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-2">
                <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">TİCARİ UNVAN</span>
                <p className="text-lg font-black text-gray-950 dark:text-white leading-tight uppercase">{facility.trade_name || 'BELİRTİLMEMİŞ'}</p>
              </div>
              <div className="space-y-2">
                <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">SGK SİCİL NO</span>
                <p className="text-lg font-black text-gray-950 dark:text-white tracking-widest">{facility.sgk_registration_number || 'BELİRTİLMEMİŞ'}</p>
              </div>
              <div className="space-y-2">
                <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">NACE KODU</span>
                <p className="text-lg font-black text-gray-900 dark:text-gray-200">{facility.nace_code || '---'}</p>
              </div>
              <div className="space-y-2">
                <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">İŞYERİ TEHLİKE SINIFI</span>
                <p className="inline-flex px-4 py-1.5 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-xl font-black text-xs uppercase tracking-widest border border-rose-100 dark:border-rose-800">
                   {facility.workplace_hazard_class || 'TANIMSIZ'}
                </p>
              </div>
            </div>
          </div>

          {/* Blocks Grid */}
          <div className="bg-white dark:bg-gray-900 rounded-[3rem] shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors font-bold">
            <div className="flex items-center justify-between p-10 border-b border-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-gray-950 dark:bg-white rounded-2xl">
                  <Activity className="h-6 w-6 text-white dark:text-gray-950" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-950 dark:text-white uppercase tracking-widest">BLOKLAR ({blocks.length})</h3>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.3em] mt-1">TESİS YERLEŞKE MİMARİSİ</p>
                </div>
              </div>
              <button
                onClick={() => { resetBlockForm(); setEditingBlock(null); setShowBlockModal(true); }}
                className="px-8 py-4 bg-gray-950 dark:bg-white text-white dark:text-gray-950 rounded-[1.25rem] hover:scale-105 transition-all font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95 flex items-center gap-2"
              >
                <Plus className="h-4 w-4" /> YENİ BLOK
              </button>
            </div>
            
            <div className="p-10">
              {blocks.length === 0 ? (
                <div className="text-center py-24 bg-gray-50/50 dark:bg-gray-950/20 rounded-[3rem] border-4 border-dashed border-gray-100 dark:border-gray-800 transition-colors">
                  <div className="p-8 bg-white dark:bg-gray-900 rounded-[2rem] w-24 h-24 flex items-center justify-center mx-auto mb-6 shadow-xl">
                    <Building2 className="h-10 w-10 text-gray-200 dark:text-gray-800" />
                  </div>
                  <p className="font-black uppercase tracking-[0.4em] text-gray-400 text-sm">Henüz yerleşim bloğu tanımlanmamış</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {blocks.map(block => (
                    <div key={block.id} className="group relative bg-gray-50 dark:bg-gray-800/20 border-2 border-transparent hover:border-primary-500/20 rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl transition-all duration-500 group">
                      <div className="flex items-start justify-between mb-8">
                        <div className="flex items-center gap-5">
                          <div className="p-4 bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 rounded-2xl shadow-xl group-hover:bg-primary-600 group-hover:text-white transition-all duration-500">
                            <Building2 className="w-6 h-6" />
                          </div>
                          <div>
                             <h4 className="font-black text-gray-950 dark:text-white text-xl tracking-tighter uppercase leading-none">{block.block_name}</h4>
                             {block.block_number && (
                              <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mt-2 block">NO: {block.block_number}</span>
                             )}
                          </div>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                          <button onClick={() => handleEditBlock(block)} className="p-3 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white rounded-xl transition-all shadow-md">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleDeleteBlock(block.id)} className="p-3 bg-white dark:bg-gray-800 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white rounded-xl transition-all shadow-md">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-6 bg-white dark:bg-gray-900/50 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-inner">
                         <div className="space-y-1">
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">ÜST YAPI KATLARI</span>
                            <p className="text-xl font-black text-gray-950 dark:text-white tracking-tighter">{block.floor_count || '0'}</p>
                         </div>
                         <div className="space-y-1">
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">KAPALI ALAN</span>
                            <p className="text-xl font-black text-gray-950 dark:text-white tracking-tighter">{block.closed_area || '0'} <small className="text-xs">m²</small></p>
                         </div>
                      </div>
                      <div className="mt-8 flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-primary-600 dark:text-primary-400 group-hover:text-primary-500 transition-colors">
                         ÖZELLİKLERİ GÜNCELLE <ArrowRight className="h-4 w-4 group-hover:translate-x-2 transition-transform" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Side Details */}
        <div className="lg:col-span-4 space-y-10 font-bold transition-all">
          {/* Contact Details Card */}
          <div className="bg-gray-950 dark:bg-black rounded-[2.5rem] p-10 shadow-3xl text-white relative overflow-hidden transition-all duration-500">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Phone className="h-48 w-48 text-white" />
            </div>
            <div className="relative z-10 space-y-10">
              <h3 className="text-2xl font-black uppercase tracking-widest pb-6 border-b border-white/10">İLETİŞİM KANALLARI</h3>
              
              <div className="space-y-8">
                {facility.phone && (
                  <div className="flex items-start gap-5 group">
                    <div className="p-4 bg-white/10 rounded-2xl group-hover:bg-primary-600 transition-all duration-500">
                      <Phone className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-1">SANTRAL HATTI</span>
                      <a href={`tel:${facility.phone}`} className="text-lg font-black tracking-widest hover:text-primary-400 transition-colors">{facility.phone}</a>
                    </div>
                  </div>
                )}
                {facility.email && (
                  <div className="flex items-start gap-5 group transition-all">
                    <div className="p-4 bg-white/10 rounded-2xl group-hover:bg-primary-600 transition-all duration-500">
                      <Mail className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-1">E-POSTA ADRESİ</span>
                      <a href={`mailto:${facility.email}`} className="text-sm font-black truncate max-w-[200px] block hover:text-primary-400 transition-colors">{facility.email.toUpperCase()}</a>
                    </div>
                  </div>
                )}
                {facility.website && (
                  <div className="flex items-start gap-5 group">
                    <div className="p-4 bg-white/10 rounded-2xl group-hover:bg-primary-600 transition-all duration-500">
                      <Globe className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-1">KURUMSAL WEB SİTESİ</span>
                      <a href={facility.website} target="_blank" rel="noopener noreferrer" className="text-sm font-black truncate max-w-[200px] block hover:text-primary-400 transition-colors decoration-2 underline-offset-4">{facility.website.replace('https://', '').toUpperCase()}</a>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-10 border-t border-white/10">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-3">TESİS LOKASYONU</span>
                <p className="text-sm leading-relaxed font-bold opacity-80 uppercase">{facility.address || 'ADRES BİLGİSİ EKSİK'}</p>
                <div className="mt-4 flex items-center gap-2 text-primary-400 font-black text-xs uppercase tracking-widest">
                  {facility.city} {facility.district && `/ ${facility.district.toUpperCase()}`}
                </div>
              </div>
            </div>
          </div>

          {/* Operational Capacity Card */}
          <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-10 shadow-xl border border-gray-100 dark:border-gray-800 transition-all">
            <h3 className="text-xl font-black text-gray-950 dark:text-white uppercase tracking-widest mb-10 pb-6 border-b border-gray-50 dark:border-gray-800">OPERASYONEL KAPASİTE</h3>
            <div className="space-y-8">
               <div className="flex items-center justify-between group">
                  <div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">YATAK KAPASİTESİ</span>
                    <p className="text-3xl font-black text-gray-950 dark:text-white tracking-tighter">{facility.bed_count || '0'}</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl text-gray-400 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500">
                    <Activity className="h-6 w-6" />
                  </div>
               </div>
               <div className="flex items-center justify-between group">
                  <div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">ÖZ PERSONEL</span>
                    <p className="text-3xl font-black text-gray-950 dark:text-white tracking-tighter">{facility.employee_count || '0'}</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl text-gray-400 group-hover:bg-blue-500 group-hover:text-white transition-all duration-500">
                    <Activity className="h-6 w-6" />
                  </div>
               </div>
               <div className="flex items-center justify-between group">
                  <div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">DIŞ KAYNAK (TAŞERON)</span>
                    <p className="text-3xl font-black text-gray-950 dark:text-white tracking-tighter">{facility.contractor_employee_count || '0'}</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl text-gray-400 group-hover:bg-amber-500 group-hover:text-white transition-all duration-500">
                    <Activity className="h-6 w-6" />
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Block Modal Design */}
      {showBlockModal && (
        <div className="fixed inset-0 bg-gray-950/80 backdrop-blur-xl flex items-center justify-center z-[100] p-6 animate-in fade-in duration-500">
          <div className="bg-white dark:bg-gray-900 rounded-[3rem] w-full max-w-2xl shadow-3xl overflow-hidden animate-in slide-in-from-bottom-20 duration-500 border border-gray-100 dark:border-gray-800 relative max-h-[90vh] flex flex-col transition-all">
            <div className={`h-3 w-full ${editingBlock ? 'bg-blue-600' : 'bg-primary-600'}`}></div>
            
            <div className="p-10 md:p-14 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between shrink-0">
               <div className="flex items-center gap-5">
                  <div className={`p-4 rounded-2xl ${editingBlock ? 'bg-blue-600' : 'bg-primary-600'} shadow-2xl shadow-primary-500/20`}>
                    <Building2 className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-gray-950 dark:text-white tracking-tighter uppercase tracking-widest leading-none">
                      {editingBlock ? 'BLOK GÜNCELLE' : 'YENİ BLOK TANIMI'}
                    </h3>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mt-2">STRUCTURAL COMPONENT CONFIG</p>
                  </div>
                </div>
                <button
                  onClick={() => { setShowBlockModal(false); setEditingBlock(null); resetBlockForm(); }}
                   className="p-4 bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-gray-950 dark:hover:text-white rounded-[1.5rem] transition-all"
                >
                   <X className="h-7 w-7" />
                </button>
            </div>

            <form onSubmit={handleBlockSubmit} className="p-10 md:p-14 space-y-10 overflow-y-auto custom-scrollbar font-bold">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] ml-2">BLOK ADI (LABEL) *</label>
                  <input
                    type="text"
                    required
                    value={blockFormData.block_name}
                    onChange={(e) => setBlockFormData(prev => ({ ...prev, block_name: e.target.value }))}
                    className="w-full px-8 py-5 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary-500 rounded-2xl text-gray-950 dark:text-white placeholder-gray-400 transition-all shadow-inner outline-none font-black text-lg uppercase tracking-tight"
                    placeholder="ÖRN: A BLOK / POLİKLİNİK"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] ml-2">BLOK NUMARASI</label>
                  <input
                    type="number"
                    value={blockFormData.block_number}
                    onChange={(e) => setBlockFormData(prev => ({ ...prev, block_number: e.target.value }))}
                    className="w-full px-8 py-5 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary-500 rounded-2xl text-gray-950 dark:text-white placeholder-gray-400 transition-all shadow-inner outline-none font-black text-lg"
                    placeholder="1"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] ml-2">YAPIM YILI</label>
                  <input
                    type="number"
                    value={blockFormData.building_construction_year}
                    onChange={(e) => setBlockFormData(prev => ({ ...prev, building_construction_year: e.target.value }))}
                    className="w-full px-8 py-5 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary-500 rounded-2xl text-gray-950 dark:text-white placeholder-gray-400 transition-all shadow-inner outline-none font-black text-lg"
                    placeholder="2024"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] ml-2">BİNA YÜKSEKLİĞİ (METRE)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={blockFormData.building_height}
                    onChange={(e) => setBlockFormData(prev => ({ ...prev, building_height: e.target.value }))}
                    className="w-full px-8 py-5 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary-500 rounded-2xl text-gray-950 dark:text-white placeholder-gray-400 transition-all shadow-inner outline-none font-black text-lg text-center"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="pt-8 flex flex-col sm:flex-row gap-6 shrink-0 transition-all">
                <button
                  type="button"
                  onClick={() => { setShowBlockModal(false); setEditingBlock(null); resetBlockForm(); }}
                  className="flex-1 py-5 bg-gray-100 dark:bg-gray-800 text-gray-400 font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-gray-200 transition-all"
                >
                  VAZGEÇ
                </button>
                <button
                  type="submit"
                  className="flex-1 py-5 bg-gray-950 dark:bg-white text-white dark:text-gray-950 font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:scale-105 transition-all shadow-2xl shadow-primary-500/20 active:scale-95 flex items-center justify-center gap-3"
                >
                  <Sparkles className="h-4 w-4" />
                  {editingBlock ? 'VERİYİ GÜNCELLE' : 'BLOĞU KAYDET'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default FacilityDetail
