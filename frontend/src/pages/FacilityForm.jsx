import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { 
  Building2, MapPin, Briefcase, Ruler, Users, Info, Plus, Trash2, 
  ChevronRight, ChevronLeft, Save, Check, Activity 
} from 'lucide-react'
import { IL_ILCE_DATA } from '../data/il-ilce'

const facilityTypes = [
  'Hastane',
  'Depo',
  'İdari Ofis',
  'Çağrı Merkezi',
  'Tıp Merkezi',
  'Diyaliz Merkezi',
  'Konuk Evi'
]

const dangerClasses = [
  'Az Tehlikeli',
  'Tehlikeli',
  'Çok Tehlikeli'
]

const steps = [
  { id: 1, title: 'Temel Bilgiler', icon: Building2 },
  { id: 2, title: 'Konum & İletişim', icon: MapPin },
  { id: 3, title: 'Kurumsal', icon: Briefcase },
  { id: 4, title: 'Fiziksel Özellikler', icon: Ruler },
  { id: 5, title: 'Diğer Veriler', icon: Users }
]

const initialFormData = {
  facility_type: '',
  name: '',
  short_name: '',
  facility_code: null,
  address: '',
  city: '',
  district: '',
  website: '',
  phone: '',
  email: '',
  tax_office: '',
  tax_number: '',
  trade_name: '', // matched with backend trade_name
  sgk_registration_number: '',
  nace_code: '',
  workplace_hazard_class: '', // matched with backend workplace_hazard_class
  block_count: 1,
  bed_count: '',
  employee_count: '',
  contractor_employee_count: '',
  facility_manager_id: '' // matched with backend facility_manager_id
}

const FacilityForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = !!id

  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState(initialFormData)
  const [blocks, setBlocks] = useState([{
    block_name: 'A Blok',
    block_number: 1,
    building_construction_year: '',
    building_height: '',
    structure_height: '',
    floor_count: '',
    closed_area: '',
    closed_parking_area: ''
  }])
  
  const [loading, setLoading] = useState(isEditing)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [generatedFacilityCode, setGeneratedFacilityCode] = useState(null)
  const [users, setUsers] = useState([])

  useEffect(() => {
    if (id) {
      fetchFacility()
    } else {
      // Auto-generate facility_code for new facility
      const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase()
      const autoCode = `FAC-${randomSuffix}`
      setFormData(prev => ({ ...prev, facility_code: autoCode }))
    }
    fetchManagers()
  }, [id])

  const fetchManagers = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      }
    } catch (err) {
      console.error('Error fetching users:', err)
    }
  }

  const fetchFacility = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/facilities/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      const data = await response.json()
      if (response.ok) {
        setFormData({
          facility_type: data.facility.facility_type || '',
          name: data.facility.name || '',
          short_name: data.facility.short_name || '',
          facility_code: data.facility.facility_code || '',
          address: data.facility.address || '',
          city: data.facility.city || '',
          district: data.facility.district || '',
          website: data.facility.website || '',
          phone: data.facility.phone || '',
          email: data.facility.email || '',
          tax_office: data.facility.tax_office || '',
          tax_number: data.facility.tax_number || '',
          trade_name: data.facility.trade_name || '',
          sgk_registration_number: data.facility.sgk_registration_number || '',
          nace_code: data.facility.nace_code || '',
          workplace_hazard_class: data.facility.workplace_hazard_class || '',
          block_count: data.facility.block_count || 1,
          bed_count: data.facility.bed_count || '',
          employee_count: data.facility.employee_count || '',
          contractor_employee_count: data.facility.contractor_employee_count || '',
          facility_manager_id: data.facility.facility_manager_id || ''
        })
        
        if (data.blocks && data.blocks.length > 0) {
          setBlocks(data.blocks)
        }
      } else {
        setError('Tesis bilgileri alınamadı')
      }
    } catch (err) {
      console.error('Error fetching facility:', err)
      setError('Tesis bilgileri yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleBlockChange = (index, field, value) => {
    const newBlocks = [...blocks]
    newBlocks[index] = { ...newBlocks[index], [field]: value }
    setBlocks(newBlocks)
  }

  const addBlock = () => {
    const newBlocks = [...blocks, {
      block_name: `${String.fromCharCode(65 + blocks.length)} Blok`,
      block_number: blocks.length + 1,
      building_construction_year: '',
      building_height: '',
      structure_height: '',
      floor_count: '',
      closed_area: '',
      closed_parking_area: ''
    }]
    setBlocks(newBlocks)
    setFormData(prev => ({ ...prev, block_count: newBlocks.length }))
  }

  const removeBlock = (index) => {
    if (blocks.length === 1) return // Keep at least one block
    const newBlocks = blocks.filter((_, i) => i !== index)
    // Renumber blocks
    const renumberedBlocks = newBlocks.map((b, i) => ({
      ...b,
      block_number: i + 1
    }))
    setBlocks(renumberedBlocks)
    setFormData(prev => ({ ...prev, block_count: renumberedBlocks.length }))
  }

  const validateStep = (stepNumber = currentStep) => {
    // Basic validation required for saving or moving from Step 1
    if (stepNumber === 1 || stepNumber === 'all') {
      if (!formData.facility_type) return 'Tesis tipi seçilmesi zorunludur'
      if (!formData.name.trim()) return 'Tesis adı zorunludur'
    }
    return null
  }

  const handleNextStep = () => {
    const errorMsg = validateStep()
    if (errorMsg) {
      setError(errorMsg)
      window.scrollTo(0, 0)
      return
    }
    setError('')
    setCurrentStep(prev => Math.min(prev + 1, steps.length))
    window.scrollTo(0, 0)
  }

  const handlePreviousStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
    window.scrollTo(0, 0)
  }

  const handleStepClick = (stepId) => {
    // Only allow jumping forward if Step 1 is valid (if moving away from Step 1)
    if (stepId > currentStep && currentStep === 1) {
      const errorMsg = validateStep(1)
      if (errorMsg) {
        setError(errorMsg)
        window.scrollTo(0, 0)
        return
      }
    }
    setError('')
    setCurrentStep(stepId)
    window.scrollTo(0, 0)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Check if user hit enter while not on the last step
    if (currentStep !== steps.length) {
      handleNextStep()
      return
    }
    
    // Validate required fields (always validate Step 1 fields on submit)
    const errorMsg = validateStep('all')
    if (errorMsg) {
      setError(errorMsg)
      setCurrentStep(1) // Go to Step 1 to show the error
      window.scrollTo(0, 0)
      return
    }
    
    setSaving(true)
    setError('')
    
    try {
      const token = localStorage.getItem('token')
      const payload = {
        facility: formData,
        blocks: blocks
      }
      
      const url = isEditing ? `/api/facilities/${id}` : '/api/facilities'
      const method = isEditing ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })
      
      const data = await response.json()
      
      if (response.ok) {
        navigate('/settings/facilities', { 
          state: { message: isEditing ? 'Tesis güncellendi' : 'Tesis oluşturuldu' } 
        })
      } else {
        setError(data.error || 'Tesis kaydedilirken bir hata oluştu')
        window.scrollTo(0, 0)
      }
    } catch (err) {
      console.error('Error saving facility:', err)
      setError('Sunucu bağlantı hatası')
      window.scrollTo(0, 0)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      
      {/* Header Area */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-sm font-medium mb-3">
          <Activity className="h-4 w-4" /> Portföy Yönetimi
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          {isEditing ? 'Tesisi Düzenle' : 'Yeni Tesis Ekle'}
        </h1>
        <p className="text-base text-gray-500 mt-1">
          {isEditing ? 'Tesis bilgilerini ve blok yapılarını güncelleyin.' : 'Sisteme yeni bir tesis tanımlayın ve özelliklerini belirleyin.'}
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 flex items-center gap-3 shadow-sm animate-in slide-in-from-top-4">
          <Info className="h-5 w-5 flex-shrink-0" />
          <span className="font-medium text-sm">{error}</span>
        </div>
      )}

      {/* Modern Stepper Header */}
      <div className="relative">
        {/* Connection Line */}
        <div className="absolute top-7 left-0 w-full h-1 bg-gray-100 rounded-full hidden sm:block">
          <div 
            className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />
        </div>

        <div className="relative flex justify-between sm:justify-between items-start z-10 overflow-x-auto sm:overflow-visible hide-scrollbar pb-4 sm:pb-0">
          {steps.map((step) => {
            const Icon = step.icon
            const isCompleted = step.id < currentStep
            const isCurrent = step.id === currentStep
            
            return (
              <div 
                key={step.id} 
                onClick={() => handleStepClick(step.id)}
                className={`flex flex-col items-center gap-2 min-w-[80px] sm:min-w-0 transition-all duration-300 cursor-pointer ${
                  isCurrent ? 'opacity-100 scale-110' : isCompleted ? 'opacity-100' : 'opacity-50 grayscale'
                }`}
              >
                <div 
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm border-2 transition-all duration-300 ${
                    isCurrent 
                      ? 'bg-gradient-to-br from-primary-500 to-primary-600 border-white text-white shadow-primary-500/30 shadow-lg' 
                      : isCompleted 
                        ? 'bg-white border-primary-500 text-primary-600' 
                        : 'bg-white border-gray-200 text-gray-400'
                  }`}
                >
                  {isCompleted ? <Check className="h-6 w-6" /> : <Icon className="h-6 w-6" />}
                </div>
                <span className={`text-xs font-bold text-center ${isCurrent ? 'text-primary-700' : 'text-gray-500'}`}>
                  {step.title}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Main Form Box */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative">
        {/* Subtle decorative background gradient */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary-50/50 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        
        <form onSubmit={handleSubmit} className="p-6 md:p-10 relative z-10">
          
          {/* STEP 1: Temel Bilgiler */}
          <div className={`transition-all duration-500 ${currentStep === 1 ? 'block animate-in fade-in slide-in-from-right-4' : 'hidden'}`}>
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-100">
              <div className="p-2.5 bg-primary-50 text-primary-600 rounded-xl">
                <Building2 className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Temel Bilgiler</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Tesis Tipi <span className="text-red-500">*</span>
                </label>
                <select
                  name="facility_type"
                  value={formData.facility_type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all shadow-sm"
                  required
                >
                  <option value="">Seçiniz</option>
                  {facilityTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Tesis Adı <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all shadow-sm"
                  placeholder="Örn: Merkez Hastane"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Tesis Kısa Adı</label>
                <input
                  type="text"
                  name="short_name"
                  value={formData.short_name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all shadow-sm"
                  placeholder="Örn: MH"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Tesis Kodu</label>
                <input
                  type="text"
                  name="facility_code"
                  value={formData.facility_code || generatedFacilityCode || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 transition-all shadow-sm cursor-not-allowed"
                  placeholder="Sistem tarafından otomatik oluşturulur"
                  disabled
                />
                <p className="text-xs text-gray-400">Bu alan sistem tarafından otomatik beslenir.</p>
              </div>
            </div>
          </div>

          {/* STEP 2: Konum & İletişim */}
          <div className={`transition-all duration-500 ${currentStep === 2 ? 'block animate-in fade-in slide-in-from-right-4' : 'hidden'}`}>
             <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-100">
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                <MapPin className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Konum & İletişim</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-semibold text-gray-700">Tam Adres</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all shadow-sm resize-none"
                  placeholder="Açık adresi buraya giriniz..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">İl</label>
                <select
                  name="city"
                  value={formData.city}
                  onChange={(e) => {
                    handleInputChange(e);
                    setFormData(prev => ({ ...prev, district: '' })); // Reset district on city change
                  }}
                  className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all shadow-sm"
                >
                  <option value="">İl Seçiniz</option>
                  {Object.keys(IL_ILCE_DATA).sort((a, b) => a.localeCompare(b, 'tr')).map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">İlçe</label>
                <select
                  name="district"
                  value={formData.district}
                  onChange={handleInputChange}
                  disabled={!formData.city}
                  className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all shadow-sm disabled:opacity-50"
                >
                  <option value="">İlçe Seçiniz</option>
                  {formData.city && IL_ILCE_DATA[formData.city]?.map(district => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Telefon</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all shadow-sm"
                  placeholder="+90 (___) ____ __"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">E-posta</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all shadow-sm"
                  placeholder="ornek@sirket.com"
                />
              </div>
              
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-semibold text-gray-700">Web Sitesi</label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all shadow-sm"
                  placeholder="https://www.ornek.com"
                />
              </div>
            </div>
          </div>

          {/* STEP 3: Kurumsal Bilgiler */}
          <div className={`transition-all duration-500 ${currentStep === 3 ? 'block animate-in fade-in slide-in-from-right-4' : 'hidden'}`}>
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-100">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                <Briefcase className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Kurumsal Bilgiler</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-semibold text-gray-700">Ticari Unvan</label>
                <input
                  type="text"
                  name="trade_name"
                  value={formData.trade_name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all shadow-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Vergi Dairesi</label>
                <input
                  type="text"
                  name="tax_office"
                  value={formData.tax_office}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all shadow-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Vergi Numarası</label>
                <input
                  type="text"
                  name="tax_number"
                  value={formData.tax_number}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all shadow-sm"
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-semibold text-gray-700">SGK Sicil Numarası</label>
                <input
                  type="text"
                  name="sgk_registration_number"
                  value={formData.sgk_registration_number}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all shadow-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">NACE Kodu</label>
                <input
                  type="text"
                  name="nace_code"
                  value={formData.nace_code}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all shadow-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">İşyeri Tehlike Sınıfı</label>
                <select
                  name="workplace_hazard_class"
                  value={formData.workplace_hazard_class}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all shadow-sm"
                >
                  <option value="">Seçiniz</option>
                  {dangerClasses.map(dc => (
                    <option key={dc} value={dc}>{dc}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* STEP 4: Fiziksel Özellikler & Bloklar */}
          <div className={`transition-all duration-500 ${currentStep === 4 ? 'block animate-in fade-in slide-in-from-right-4' : 'hidden'}`}>
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                  <Ruler className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Fiziksel Özellikler</h2>
              </div>
              <button
                type="button"
                onClick={addBlock}
                className="px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all font-medium text-sm flex items-center gap-2 shadow-sm"
              >
                <Plus className="h-4 w-4" />
                Blok Ekle ({blocks.length})
              </button>
            </div>

            <div className="space-y-6">
              {blocks.map((block, index) => (
                <div key={index} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 relative group transition-all hover:border-gray-300">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600">
                        {index + 1}
                      </div>
                      {block.block_name || `Blok ${index + 1}`}
                    </h3>
                    {blocks.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeBlock(index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        title="Bloğu Sil"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Blok Adı</label>
                      <input
                        type="text"
                        value={block.block_name}
                        onChange={(e) => handleBlockChange(index, 'block_name', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-primary-500 font-medium text-sm transition-all"
                        placeholder="A Blok"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Yapım Yılı</label>
                      <input
                        type="number"
                        value={block.building_construction_year}
                        onChange={(e) => handleBlockChange(index, 'building_construction_year', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-primary-500 font-medium text-sm transition-all"
                        placeholder="YYYY"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Bina Yüksekliği (m)</label>
                      <input
                        type="number"
                        value={block.building_height}
                        onChange={(e) => handleBlockChange(index, 'building_height', e.target.value)}
                        step="0.01"
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-primary-500 font-medium text-sm transition-all"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Yapı Yüksekliği (m)</label>
                      <input
                        type="number"
                        value={block.structure_height}
                        onChange={(e) => handleBlockChange(index, 'structure_height', e.target.value)}
                        step="0.01"
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-primary-500 font-medium text-sm transition-all"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Kat Sayısı</label>
                      <input
                        type="number"
                        value={block.floor_count}
                        onChange={(e) => handleBlockChange(index, 'floor_count', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-primary-500 font-medium text-sm transition-all"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Kapalı Alan (m²)</label>
                      <input
                        type="number"
                        value={block.closed_area}
                        onChange={(e) => handleBlockChange(index, 'closed_area', e.target.value)}
                        step="0.01"
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-primary-500 font-medium text-sm transition-all"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Otopark Alanı (m²)</label>
                      <input
                        type="number"
                        value={block.closed_parking_area}
                        onChange={(e) => handleBlockChange(index, 'closed_parking_area', e.target.value)}
                        step="0.01"
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-primary-500 font-medium text-sm transition-all"
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Dashed placeholder for visual hint */}
              <button 
                type="button"
                onClick={addBlock}
                className="w-full py-6 border-2 border-dashed border-gray-200 rounded-2xl text-gray-500 hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50/50 transition-all font-medium flex flex-col items-center justify-center gap-2"
              >
                <div className="p-2 bg-white rounded-full shadow-sm">
                  <Plus className="h-5 w-5" />
                </div>
                <span>Yeni Blok Ekle</span>
              </button>
            </div>
          </div>

          {/* STEP 5: Diğer Bilgiler */}
          <div className={`transition-all duration-500 ${currentStep === 5 ? 'block animate-in fade-in slide-in-from-right-4' : 'hidden'}`}>
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-100">
              <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
                <Users className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Kapasite ve Personel Verileri</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Yatak Sayısı</label>
                <input
                  type="number"
                  name="bed_count"
                  value={formData.bed_count}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all shadow-sm"
                  placeholder="0"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Çalışan Sayısı</label>
                <input
                  type="number"
                  name="employee_count"
                  value={formData.employee_count}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all shadow-sm"
                  placeholder="Oracle'dan otomatik"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Taşeron Çalışan Sayısı</label>
                <input
                  type="number"
                  name="contractor_employee_count"
                  value={formData.contractor_employee_count}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all shadow-sm"
                  placeholder="0"
                />
              </div>

              <div className="md:col-span-3 space-y-2">
                <label className="text-sm font-semibold text-gray-700">Tesis Sorumlusu / Yöneticisi</label>
                <select
                  name="facility_manager_id"
                  value={formData.facility_manager_id}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all shadow-sm"
                >
                  <option value="">Seçiniz</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.first_name} {user.last_name} ({user.email || user.oracle_id})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="mt-12 pt-6 border-t border-gray-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate('/settings/facilities')}
              className="px-6 py-3 bg-white text-gray-600 font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 hover:text-gray-900 transition-all shadow-sm"
            >
              İptal
            </button>
            <div className="flex items-center gap-3">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePreviousStep}
                  className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all flex items-center gap-2"
                >
                  <ChevronLeft className="h-5 w-5" /> Geri
                </button>
              )}
              {currentStep < steps.length ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-bold rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all flex items-center gap-2 shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50"
                >
                  Sonraki <ChevronRight className="h-5 w-5" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={saving}
                  className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    'Kaydediliyor...'
                  ) : (
                    <>
                      <Save className="h-5 w-5" /> 
                      {isEditing ? 'Değişiklikleri Güncelle' : 'Tesisi Kaydet'}
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
          
        </form>
      </div>
    </div>
  )
}

export default FacilityForm
