import { useState, useEffect } from 'react'
import { 
  FileText, 
  Plus, 
  Edit2, 
  Trash2, 
  Check, 
  X, 
  ChevronDown, 
  ChevronUp,
  Settings,
  AlertCircle,
  ShieldAlert,
  Wrench,
  Layers,
  Sparkles,
  ClipboardList,
  Target,
  ArrowRight
} from 'lucide-react'

const ChecklistSettings = () => {
  const [activeTab, setActiveTab] = useState('isg') // 'isg' or 'general'
  const [templates, setTemplates] = useState([])
  const [assignmentRules, setAssignmentRules] = useState([])
  const [assets, setAssets] = useState([])
  const [categories, setCategories] = useState([])
  const [maintenanceTypes, setMaintenanceTypes] = useState([])
  
  // Form states
  const [showTemplateForm, setShowTemplateForm] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState(null)
  const [showAssignmentForm, setShowAssignmentForm] = useState(false)
  const [selectedTemplateForAssignment, setSelectedTemplateForAssignment] = useState(null)
  
  // Template form state
  const [templateForm, setTemplateForm] = useState({
    name: '',
    description: '',
    checklist_type: 'ISG',
    is_active: true,
    items: []
  })
  
  // Item form state
  const [itemForm, setItemForm] = useState({
    question: '',
    item_type: 'boolean',
    is_required: true,
    options: '',
    validation_rules: ''
  })
  
  // Assignment form state
  const [assignmentForm, setAssignmentForm] = useState({
    template_id: '',
    priority: 1,
    scope_type: 'GLOBAL',
    asset_id: '',
    category_id: '',
    maintenance_type: 'ALL',
    is_active: true
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [expandedTemplate, setExpandedTemplate] = useState(null)

  useEffect(() => {
    fetchTemplates()
    fetchAssets()
    fetchCategories()
    fetchMaintenanceTypes()
  }, [activeTab])

  const fetchTemplates = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const checklistType = activeTab === 'isg' ? 'ISG' : 'BAKIM'
      const res = await fetch(`/api/cms/checklists/templates?checklist_type=${checklistType}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setTemplates(data.templates || [])
    } catch (err) {
      console.error('Error fetching templates:', err)
      setError('Şablonlar yüklenirken hata oluştu.')
    } finally {
      setLoading(false)
    }
  }

  const fetchAssets = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/eams/assets', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setAssets(data.assets || data || [])
    } catch (err) {
      console.error('Error fetching assets:', err)
    }
  }

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/eams/settings/categories', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setCategories(data.categories || data || [])
    } catch (err) {
      console.error('Error fetching categories:', err)
    }
  }

  const fetchMaintenanceTypes = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/eams/settings/maintenance-types', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setMaintenanceTypes(data.maintenance_types || data || [])
    } catch (err) {
      console.error('Error fetching maintenance types:', err)
    }
  }

  const fetchAssignmentRules = async (templateId) => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/cms/checklists/assignment-rules?template_id=${templateId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setAssignmentRules(data.rules || [])
    } catch (err) {
      console.error('Error fetching assignment rules:', err)
    }
  }

  const handleTemplateSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    
    try {
      const token = localStorage.getItem('token')
      const url = editingTemplate 
        ? `/api/cms/checklists/templates/${editingTemplate.id}`
        : '/api/cms/checklists/templates'
      const method = editingTemplate ? 'PUT' : 'POST'
      
      const body = {
        ...templateForm,
        checklist_type: activeTab === 'isg' ? 'ISG' : 'BAKIM'
      }
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      })
      
      const data = await res.json()
      if (res.ok) {
        setSuccess(editingTemplate ? 'Şablon güncellendi.' : 'Şablon oluşturuldu.')
        resetTemplateForm()
        fetchTemplates()
      } else {
        setError(data.error || 'Şablon kaydedilemedi.')
      }
    } catch (err) {
      console.error('Error saving template:', err)
      setError('Sunucuya bağlanılamadı.')
    }
  }

  const handleAddItem = () => {
    if (!itemForm.question) {
      setError('Soru metni gereklidir.')
      setTimeout(() => setError(''), 3000)
      return
    }
    
    const newItem = {
      ...itemForm,
      order_index: templateForm.items.length
    }
    
    setTemplateForm({
      ...templateForm,
      items: [...templateForm.items, newItem]
    })
    
    setItemForm({
      question: '',
      item_type: 'boolean',
      is_required: true,
      options: '',
      validation_rules: ''
    })
  }

  const handleRemoveItem = (index) => {
    setTemplateForm({
      ...templateForm,
      items: templateForm.items.filter((_, i) => i !== index)
    })
  }

  const handleEditTemplate = async (template) => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/cms/checklists/templates/${template.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      
      if (res.ok) {
        setEditingTemplate(data)
        setTemplateForm({
          name: data.name,
          description: data.description || '',
          checklist_type: data.checklist_type,
          is_active: data.is_active,
          items: data.items || []
        })
        setShowTemplateForm(true)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    } catch (err) {
      console.error('Error fetching template details:', err)
    }
  }

  const handleDeleteTemplate = async (templateId) => {
    if (!window.confirm('Bu şablonu silmek istediğinize emin misiniz?')) return
    
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/cms/checklists/templates/${templateId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (res.ok) {
        setSuccess('Şablon silindi.')
        fetchTemplates()
      } else {
        setError('Şablon silinirken hata oluştu.')
      }
    } catch (err) {
      console.error('Error deleting template:', err)
      setError('Sunucuya bağlanılamadı.')
    }
  }

  const handleAssignmentSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/cms/checklists/assignment-rules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(assignmentForm)
      })
      
      const data = await res.json()
      if (res.ok) {
        setSuccess('Atama kuralı oluşturuldu.')
        setShowAssignmentForm(false)
        if (selectedTemplateForAssignment) {
          fetchAssignmentRules(selectedTemplateForAssignment.id)
        }
      } else {
        setError(data.error || 'Atama kuralı oluşturulamadı.')
      }
    } catch (err) {
      console.error('Error creating assignment rule:', err)
      setError('Sunucuya bağlanılamadı.')
    }
  }

  const handleDeleteAssignmentRule = async (ruleId) => {
    if (!window.confirm('Bu atama kuralını silmek istediğinize emin misiniz?')) return
    
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/cms/checklists/assignment-rules/${ruleId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (res.ok) {
        setSuccess('Atama kuralı silindi.')
        if (selectedTemplateForAssignment) {
          fetchAssignmentRules(selectedTemplateForAssignment.id)
        }
      } else {
        setError('Atama kuralı silinirken hata oluştu.')
      }
    } catch (err) {
      console.error('Error deleting assignment rule:', err)
      setError('Sunucuya bağlanılamadı.')
    }
  }

  const resetTemplateForm = () => {
    setTemplateForm({
      name: '',
      description: '',
      checklist_type: activeTab === 'isg' ? 'ISG' : 'BAKIM',
      is_active: true,
      items: []
    })
    setEditingTemplate(null)
    setShowTemplateForm(false)
  }

  const toggleTemplateExpansion = async (templateId) => {
    if (expandedTemplate === templateId) {
      setExpandedTemplate(null)
      setAssignmentRules([])
    } else {
      setExpandedTemplate(templateId)
      await fetchAssignmentRules(templateId)
    }
  }

  const getDayEvents = (dateStr) => [] // Placeholder for compatibility if needed

  return (
    <div className="space-y-10 transition-all duration-500 animate-in fade-in pb-20">
      {/* Header & Tabs Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 bg-white dark:bg-gray-900 p-10 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-800 transition-colors">
        <div className="flex items-center gap-6">
          <div className={`p-5 rounded-[2rem] shadow-2xl transition-all duration-500 ${activeTab === 'isg' ? 'bg-rose-600 shadow-rose-500/20' : 'bg-blue-600 shadow-blue-500/30'}`}>
            {activeTab === 'isg' ? <ShieldAlert className="h-10 w-10 text-white" /> : <Wrench className="h-10 w-10 text-white" />}
          </div>
          <div>
            <h2 className="text-4xl font-black text-gray-950 dark:text-white tracking-tight uppercase tracking-widest leading-none">
              {activeTab === 'isg' ? 'İSG KONTROL LİSTELERİ' : 'BAKIM KONTROL LİSTELERİ'}
            </h2>
            <p className="text-lg text-gray-500 dark:text-gray-400 mt-2 font-medium">
              {activeTab === 'isg' 
                ? 'İş sağlığı ve güvenliği denetimleri için dijital kontrol şablonları.'
                : 'Ekipmanlar için periyodik teknik kontrol ve bakım listeleri.'}
            </p>
          </div>
        </div>
        
        <div className="flex bg-gray-50 dark:bg-gray-800 p-2 rounded-[2rem] shadow-inner border border-gray-100 dark:border-gray-700">
          <button
            onClick={() => { setActiveTab('isg'); setShowTemplateForm(false); setExpandedTemplate(null); }}
            className={`flex items-center gap-3 px-8 py-4 rounded-[1.5rem] text-xs font-black transition-all duration-300 uppercase tracking-widest ${
              activeTab === 'isg'
                ? 'bg-white dark:bg-gray-900 text-rose-600 dark:text-rose-400 shadow-xl scale-105'
                : 'text-gray-400 dark:text-gray-500 hover:text-gray-950 dark:hover:text-white'
            }`}
          >
            <ShieldAlert className="h-4 w-4" /> İSG
          </button>
          <button
            onClick={() => { setActiveTab('general'); setShowTemplateForm(false); setExpandedTemplate(null); }}
            className={`flex items-center gap-3 px-8 py-4 rounded-[1.5rem] text-xs font-black transition-all duration-300 uppercase tracking-widest ${
              activeTab === 'general'
                ? 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-xl scale-105'
                : 'text-gray-400 dark:text-gray-500 hover:text-gray-950 dark:hover:text-white'
            }`}
          >
            <Wrench className="h-4 w-4" /> BAKIM
          </button>
        </div>
      </div>

      {/* Notifications */}
      {(error || success) && (
        <div className="flex flex-col gap-4 animate-in slide-in-from-top-4 duration-500">
          {error && (
            <div className="p-6 rounded-[2rem] bg-rose-50 dark:bg-rose-900/20 border-2 border-rose-100 dark:border-rose-800 text-rose-800 dark:text-rose-400 flex items-center gap-4 shadow-xl">
              <AlertCircle className="h-6 w-6 shrink-0" />
              <span className="font-bold text-lg">{error}</span>
            </div>
          )}
          {success && (
            <div className="p-6 rounded-[2rem] bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-100 dark:border-emerald-800 text-emerald-800 dark:text-emerald-400 flex items-center gap-4 shadow-xl">
              <Check className="h-6 w-6 shrink-0" />
              <span className="font-bold text-lg">{success}</span>
            </div>
          )}
        </div>
      )}

      {/* Primary Action */}
      {!showTemplateForm && (
        <button
          onClick={() => setShowTemplateForm(true)}
          className={`w-full group px-10 py-6 bg-gray-950 dark:bg-white text-white dark:text-gray-950 rounded-[2.5rem] hover:scale-[1.01] active:scale-[0.99] transition-all font-black shadow-2xl flex items-center justify-center gap-4 overflow-hidden relative uppercase tracking-[0.2em] text-sm`}
        >
          <Plus className="h-6 w-6 group-hover:rotate-90 transition-transform duration-500" />
          YENİ {activeTab === 'isg' ? 'İSG' : 'BAKIM'} ŞABLONU OLUŞTUR
        </button>
      )}

      {/* Template Form Builder */}
      {showTemplateForm && (
        <div className="bg-white dark:bg-gray-900 rounded-[3rem] shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-in zoom-in-95 duration-500 relative transition-colors">
          <div className={`h-3 w-full ${activeTab === 'isg' ? 'bg-rose-600' : 'bg-blue-600'}`}></div>
          <div className="p-10 md:p-12">
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-2xl ${activeTab === 'isg' ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'}`}>
                  {editingTemplate ? <Edit2 className="h-8 w-8" /> : <ClipboardList className="h-8 w-8" />}
                </div>
                <div>
                  <h3 className="text-3xl font-black text-gray-950 dark:text-white tracking-tight uppercase tracking-widest">
                    {editingTemplate ? 'ŞABLONU DÜZENLE' : 'YENİ ŞABLON TASARIMI'}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-xs mt-1">Checklist Yapılandırma Sihirbazı</p>
                </div>
              </div>
              <button onClick={resetTemplateForm} className="p-4 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-[1.5rem] transition-all group">
                <X className="h-8 w-8 text-gray-400 group-hover:text-gray-950 dark:group-hover:text-white" />
              </button>
            </div>

            <form onSubmit={handleTemplateSubmit} className="space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] mb-3 ml-2">ŞABLON KİMLİĞİ VE ADI *</label>
                  <input
                    type="text"
                    className="w-full px-8 py-5 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary-500 rounded-2xl text-xl font-black text-gray-950 dark:text-white placeholder-gray-400 transition-all shadow-inner outline-none"
                    placeholder="Örn: Aylık Jeneratör Bakımı"
                    value={templateForm.name}
                    onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] mb-3 ml-2">UYGULAMA TALİMATLARI</label>
                  <textarea
                    className="w-full px-8 py-5 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary-500 rounded-2xl font-bold text-gray-900 dark:text-white placeholder-gray-400 transition-all shadow-inner outline-none resize-none"
                    placeholder="Bu şablonun genel amacı nedir? Ne zaman uygulanır? Saha ekiplerine notunuz..."
                    rows={3}
                    value={templateForm.description}
                    onChange={(e) => setTemplateForm({ ...templateForm, description: e.target.value })}
                  />
                </div>

                <div className="md:col-span-2 flex items-center gap-6 bg-gray-50 dark:bg-gray-800/50 p-8 rounded-[2rem] border-2 border-transparent hover:border-gray-100 dark:hover:border-gray-700 transition-all">
                  <div className="flex-1">
                    <h4 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">YAYIN DURUMU</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-bold mt-1">Kullanıma açmak için aktif edin. Pasif şablonlar sahadan seçilemez.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={templateForm.is_active}
                      onChange={(e) => setTemplateForm({ ...templateForm, is_active: e.target.checked })}
                    />
                    <div className="w-16 h-8 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 dark:border-gray-600 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>
              </div>

              {/* Items / Questions Editor */}
              <div className="bg-gray-50 dark:bg-gray-800/20 rounded-[3rem] p-10 border border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-4 mb-10">
                  <div className="p-3 bg-gray-950 dark:bg-white rounded-2xl">
                    <Layers className="h-6 w-6 text-white dark:text-gray-950" />
                  </div>
                  <h4 className="text-2xl font-black text-gray-950 dark:text-white uppercase tracking-widest">SORU VE ADIMLAR</h4>
                </div>
                
                {/* Item Builder Box */}
                <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-8 shadow-xl border border-gray-100 dark:border-gray-800 mb-10 relative overflow-hidden transition-colors">
                  <div className={`absolute top-0 left-0 w-2 h-full ${activeTab === 'isg' ? 'bg-rose-500' : 'bg-blue-500'}`}></div>
                  <h5 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-6 ml-2">YENİ SORU TANIMLA</h5>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pl-2">
                    <div className="md:col-span-12 lg:col-span-8">
                      <label className="block text-[9px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">SORU METNİ *</label>
                      <input
                        type="text"
                        className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary-500 rounded-xl font-bold text-gray-900 dark:text-white outline-none transition-all shadow-inner"
                        placeholder="Kontrol edilecek parçayı veya soruyu belirtiniz..."
                        value={itemForm.question}
                        onChange={(e) => setItemForm({ ...itemForm, question: e.target.value })}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddItem())}
                      />
                    </div>
                    
                    <div className="md:col-span-6 lg:col-span-4">
                      <label className="block text-[9px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">CEVAP TİPİ</label>
                      <select
                        className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary-500 rounded-xl font-black text-xs text-gray-700 dark:text-gray-300 outline-none transition-all cursor-pointer shadow-inner uppercase tracking-widest"
                        value={itemForm.item_type}
                        onChange={(e) => setItemForm({ ...itemForm, item_type: e.target.value })}
                      >
                        <option value="boolean">✅ EVET / HAYIR</option>
                        <option value="numeric">🔢 SAYISAL DEĞER</option>
                        <option value="text">📝 SERBEST METİN</option>
                        <option value="select">🎯 SEÇENEK LİSTESİ</option>
                        <option value="photo">📸 FOTOĞRAF KANITI</option>
                      </select>
                    </div>

                    <div className="md:col-span-6 lg:col-span-4">
                      <label className="block text-[9px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3">ZORUNLULUK</label>
                      <label className="flex items-center gap-4 cursor-pointer w-fit group">
                        <input
                          type="checkbox"
                          className="w-7 h-7 text-primary-600 rounded-xl bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:ring-primary-500 transition-all cursor-pointer"
                          checked={itemForm.is_required}
                          onChange={(e) => setItemForm({ ...itemForm, is_required: e.target.checked })}
                        />
                        <span className="text-sm font-black text-gray-700 dark:text-white uppercase tracking-widest group-hover:text-primary-500 transition-colors">CEVAP ZORUNLU</span>
                      </label>
                    </div>

                    <div className="md:col-span-12 lg:col-span-8 flex items-end justify-end">
                       <button
                        type="button"
                        onClick={handleAddItem}
                        className="w-full px-10 py-4 bg-gray-950 dark:bg-gray-700 text-white rounded-xl hover:scale-[1.02] shadow-xl transition-all text-xs font-black uppercase tracking-[0.2em] whitespace-nowrap active:scale-95"
                      >
                        LİSTEYE EKLE
                      </button>
                    </div>

                    {(itemForm.item_type === 'select') && (
                      <div className="md:col-span-12 mt-4 animate-in slide-in-from-top-4 duration-300">
                        <label className="block text-[9px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">SEÇENEKLER (VİRGÜLLE AYIRIN)</label>
                        <input
                          type="text"
                          className="w-full px-6 py-4 bg-blue-50/50 dark:bg-primary-900/10 border-2 border-transparent focus:border-primary-500 rounded-xl font-bold text-gray-950 dark:text-white placeholder-gray-400 shadow-inner"
                          placeholder="Örn: Uygun, Riskli, Hasarlı, N/A"
                          value={itemForm.options}
                          onChange={(e) => setItemForm({ ...itemForm, options: e.target.value })}
                        />
                      </div>
                    )}

                    {(itemForm.item_type === 'numeric') && (
                      <div className="md:col-span-12 mt-4 animate-in slide-in-from-top-4 duration-300">
                        <label className="block text-[9px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">VALIDASYON KURALLARI (JSON)</label>
                        <input
                          type="text"
                          className="w-full px-6 py-4 bg-indigo-50/50 dark:bg-indigo-900/10 border-2 border-transparent focus:border-primary-500 rounded-xl font-mono text-sm text-gray-950 dark:text-white placeholder-gray-400 shadow-inner"
                          placeholder='{"min": 1, "max": 100, "unit": "bar"}'
                          value={itemForm.validation_rules}
                          onChange={(e) => setItemForm({ ...itemForm, validation_rules: e.target.value })}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Items Re-orderable List */}
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {templateForm.items.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-[2.5rem] border-4 border-dashed border-gray-100 dark:border-gray-800 transition-colors">
                      <p className="text-lg font-black text-gray-300 dark:text-gray-700 uppercase tracking-widest">Henüz kontrol kalemi eklenmedi.</p>
                    </div>
                  ) : (
                    templateForm.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-white dark:bg-gray-900 border-2 border-transparent hover:border-gray-100 dark:hover:border-gray-800 rounded-2xl p-6 shadow-lg shadow-gray-100/50 dark:shadow-none transition-all group group-hover:-translate-x-1"
                      >
                        <div className="flex items-center gap-6">
                          <div className={`flex items-center justify-center w-12 h-12 rounded-[1.25rem] font-black text-lg shadow-inner ${activeTab === 'isg' ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400' : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'}`}>
                            {index + 1}
                          </div>
                          <div>
                            <p className="text-xl font-black text-gray-950 dark:text-white tracking-tight leading-tight">{item.question}</p>
                            <div className="flex items-center gap-3 mt-2">
                              <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg text-[9px] font-black uppercase tracking-[0.2em]">{item.item_type}</span>
                              {item.is_required && <span className="px-3 py-1 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-lg text-[9px] font-black uppercase tracking-[0.2em]">ZORUNLU</span>}
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="p-4 text-gray-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-2xl transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                        >
                          <Trash2 className="h-6 w-6" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Form Footer */}
              <div className="flex flex-col-reverse sm:flex-row gap-6 pt-10 border-t-4 border-gray-50 dark:border-gray-800 transition-colors">
                <button
                  type="button"
                  onClick={resetTemplateForm}
                  className="px-10 py-5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all font-black uppercase tracking-widest text-[10px] sm:w-auto text-center"
                >
                  TASLAĞI İPTAL ET
                </button>
                <div className="flex-1"></div>
                <button
                  type="submit"
                  className={`px-12 py-5 bg-primary-600 text-white rounded-2xl hover:scale-105 transition-all font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-primary-500/30 flex justify-center items-center gap-3 w-full sm:w-auto`}
                >
                  <Check className="h-5 w-5" />
                  {editingTemplate ? 'GÜNCELLEMELERİ KAYDET' : 'ŞABLONU SİSTEME EKLE'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main List Section */}
      {!showTemplateForm && (
        <div className="space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-40 bg-white dark:bg-gray-900 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-2xl transition-colors">
              <div className="relative">
                <div className="animate-spin rounded-full h-24 w-24 border-8 border-gray-100 border-t-primary-600"></div>
                <div className="absolute inset-0 flex items-center justify-center"><Sparkles className="h-8 w-8 text-primary-500 animate-pulse" /></div>
              </div>
              <p className="text-gray-400 dark:text-gray-500 font-black uppercase tracking-[0.5em] text-xs mt-10">ŞABLON HAVUZU YÜKLENİYOR...</p>
            </div>
          ) : templates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-40 bg-white dark:bg-gray-900 rounded-[3rem] border-4 border-dashed border-gray-100 dark:border-gray-800 transition-colors px-10 text-center">
              <div className="p-10 bg-gray-50 dark:bg-gray-800 rounded-[3rem] mb-10 shadow-inner">
                <FileText className="h-20 w-20 text-gray-300 dark:text-gray-600" />
              </div>
              <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-4 tracking-tighter uppercase tracking-widest">HENÜZ ŞABLON TANIMLANMAMIŞ</h3>
              <p className="text-gray-500 dark:text-gray-400 font-bold max-w-lg text-lg leading-relaxed">
                Operasyonlarınızı dijitalleştirmek için ilk kontrol listesini hemen oluşturun.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className={`bg-white dark:bg-gray-900 rounded-[2.5rem] border transition-all duration-500 overflow-hidden ${
                    expandedTemplate === template.id 
                      ? 'shadow-3xl shadow-gray-200/50 dark:shadow-none border-primary-500/30' 
                      : 'shadow-xl shadow-gray-100 border-gray-50 dark:border-gray-800 hover:border-primary-500/20'
                  }`}
                >
                  {/* ListItem Header */}
                  <div className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer group" onClick={() => toggleTemplateExpansion(template.id)}>
                    <div className="flex items-center gap-8 flex-1">
                      <div className={`p-5 rounded-[2rem] flex items-center justify-center shrink-0 shadow-inner transition-transform group-hover:scale-110 duration-500 ${activeTab === 'isg' ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/30' : 'bg-blue-50 text-blue-600 dark:bg-blue-900/30'}`}>
                         <FileText className="h-8 w-8" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-4 mb-2">
                          <h3 className="text-2xl font-black text-gray-950 dark:text-white truncate tracking-tight uppercase tracking-widest">{template.name}</h3>
                          <span className={`px-4 py-1.5 text-[10px] uppercase font-black rounded-xl tracking-widest shadow-sm ${template.is_active ? 'bg-emerald-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                            {template.is_active ? 'AKTİF' : 'PASİF'}
                          </span>
                        </div>
                        <div className="flex items-center gap-6">
                           <span className="flex items-center gap-2 text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                             <Layers className="h-4 w-4" /> {template.item_count || 0} ADIM
                           </span>
                           <span className="hidden sm:inline w-1 h-1 bg-gray-300 dark:bg-gray-700 rounded-full"></span>
                           <span className="text-sm font-bold text-gray-400 truncate max-w-md italic">{template.description || 'Açıklama girilmemiş.'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
                      <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleEditTemplate(template); }}
                          className="p-4 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-400 dark:hover:text-white rounded-2xl transition-all shadow-sm"
                        >
                          <Edit2 className="h-5 w-5" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteTemplate(template.id); }}
                          className="p-4 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 hover:bg-rose-600 hover:text-white dark:hover:bg-rose-400 dark:hover:text-white rounded-2xl transition-all shadow-sm"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                      <div className={`p-4 rounded-2xl transition-all duration-500 ${expandedTemplate === template.id ? 'bg-gray-950 text-white rotate-180' : 'bg-gray-50 dark:bg-gray-800 text-gray-400 group-hover:bg-gray-950 dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-gray-900'}`}>
                        {expandedTemplate === template.id ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded: Rules Area */}
                  {expandedTemplate === template.id && (
                    <div className="border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 p-8 md:p-12 animate-in slide-in-from-top-6 duration-700">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
                        <div className="flex items-center gap-4">
                           <div className="p-3 bg-gray-950 dark:bg-white rounded-xl">
                             <Target className="h-5 w-5 text-white dark:text-gray-950" />
                           </div>
                           <div>
                             <h4 className="text-xl font-black text-gray-950 dark:text-white uppercase tracking-widest">ATAMA KURALLARI</h4>
                             <p className="text-xs text-gray-500 dark:text-gray-400 font-bold mt-1">Bu şablon hangi ekipmanlara ne zaman otomatik atanacak?</p>
                           </div>
                        </div>
                        {!showAssignmentForm && (
                          <button
                            onClick={() => {
                              setSelectedTemplateForAssignment(template)
                              setAssignmentForm({ ...assignmentForm, template_id: template.id })
                              setShowAssignmentForm(true)
                            }}
                            className="px-8 py-4 bg-gray-950 dark:bg-white text-white dark:text-gray-950 rounded-2xl hover:scale-105 transition-all font-black uppercase tracking-widest text-[10px] flex items-center gap-3 shadow-2xl active:scale-95"
                          >
                            <Plus className="h-4 w-4" /> YENİ HEDEF EKLE
                          </button>
                        )}
                      </div>

                      {/* Add Assignment Sub-Form */}
                      {showAssignmentForm && selectedTemplateForAssignment?.id === template.id && (
                        <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-10 mb-10 border-2 border-primary-500/20 shadow-2xl relative overflow-hidden animate-in slide-in-from-bottom-10 duration-500 transition-colors">
                          <div className="flex items-center justify-between mb-8">
                            <h5 className="text-lg font-black text-gray-950 dark:text-white uppercase tracking-widest flex items-center gap-3">
                              <Sparkles className="h-5 w-5 text-primary-500" /> OTOMATIK ATAMA MOTORU
                            </h5>
                            <button onClick={() => setShowAssignmentForm(false)} className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all text-gray-400"><X className="h-6 w-6" /></button>
                          </div>
                          
                          <form onSubmit={handleAssignmentSubmit} className="space-y-8">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                              <div>
                                <label className="block text-[9px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3">HEDEF KAPSAMI</label>
                                <select
                                  className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary-500 rounded-xl text-xs font-black text-gray-950 dark:text-white uppercase tracking-widest transition-all cursor-pointer shadow-inner"
                                  value={assignmentForm.scope_type}
                                  onChange={(e) => setAssignmentForm({ ...assignmentForm, scope_type: e.target.value })}
                                >
                                  <option value="GLOBAL">🌏 TÜM KURUM ENVANTERİ</option>
                                  <option value="CATEGORY">📁 ÖZEL BİR KATEGORİ</option>
                                  <option value="ASSET">🔧 TEKİL BİR DEMİRBAŞ</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-[9px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3">İŞLEM TİPİ</label>
                                <select
                                  className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary-500 rounded-xl text-xs font-black text-gray-950 dark:text-white uppercase tracking-widest transition-all cursor-pointer shadow-inner"
                                  value={assignmentForm.maintenance_type}
                                  onChange={(e) => setAssignmentForm({ ...assignmentForm, maintenance_type: e.target.value })}
                                >
                                  <option value="ALL">TÜM BAKIM TÜRLERİ İÇİN</option>
                                  {maintenanceTypes.map((mt) => (
                                    <option key={mt.id} value={mt.name}>{mt.name.toUpperCase()}</option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="block text-[9px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3">UYGULAMA ÖNCELİĞİ</label>
                                <input
                                  type="number"
                                  min="1"
                                  className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary-500 rounded-xl font-black text-gray-950 dark:text-white shadow-inner"
                                  value={assignmentForm.priority}
                                  onChange={(e) => setAssignmentForm({ ...assignmentForm, priority: parseInt(e.target.value) })}
                                />
                              </div>

                              {assignmentForm.scope_type === 'ASSET' && (
                                <div className="lg:col-span-3 animate-in fade-in slide-in-from-top-2">
                                  <label className="block text-[9px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3">HEDEF DEMİRBAŞ SEÇİN</label>
                                  <select
                                    className="w-full px-8 py-5 bg-primary-50 dark:bg-primary-900/10 border-2 border-primary-100 dark:border-primary-800 rounded-2xl text-xs font-black text-gray-950 dark:text-white uppercase tracking-widest transition-all cursor-pointer shadow-inner"
                                    value={assignmentForm.asset_id}
                                    onChange={(e) => setAssignmentForm({ ...assignmentForm, asset_id: e.target.value })}
                                    required
                                  >
                                    <option value="">LÜTFEN LİSTEDEN SEÇİM YAPIN...</option>
                                    {assets.map((asset) => (
                                      <option key={asset.id} value={asset.id}>{asset.name} [{asset.asset_code}]</option>
                                    ))}
                                  </select>
                                </div>
                              )}

                              {assignmentForm.scope_type === 'CATEGORY' && (
                                <div className="lg:col-span-3 animate-in fade-in slide-in-from-top-2">
                                  <label className="block text-[9px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3">HEDEF KATEGORİ SEÇİN</label>
                                  <select
                                    className="w-full px-8 py-5 bg-primary-50 dark:bg-primary-900/10 border-2 border-primary-100 dark:border-primary-800 rounded-2xl text-xs font-black text-gray-950 dark:text-white uppercase tracking-widest transition-all cursor-pointer shadow-inner"
                                    value={assignmentForm.category_id}
                                    onChange={(e) => setAssignmentForm({ ...assignmentForm, category_id: e.target.value })}
                                    required
                                  >
                                    <option value="">LÜTFEN ÜST KATEGORİ SEÇİN...</option>
                                    {categories.map((cat) => (
                                      <option key={cat.id} value={cat.id}>{cat.name.toUpperCase()}</option>
                                    ))}
                                  </select>
                                </div>
                              )}
                            </div>

                            <div className="flex gap-4 justify-end items-center pt-6 border-t border-gray-100 dark:border-gray-800">
                               <button type="button" onClick={() => setShowAssignmentForm(false)} className="px-10 py-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-gray-200 transition-all">İPTAL</button>
                               <button type="submit" className="px-12 py-4 bg-primary-600 text-white rounded-xl font-black uppercase tracking-widest text-[9px] shadow-xl hover:scale-105 transition-all">KURALI OLUŞTUR VE AKTİFLEŞTİR</button>
                            </div>
                          </form>
                        </div>
                      )}

                      {/* rules listed in grid */}
                      {assignmentRules.length === 0 ? (
                        <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-16 text-center border-4 border-dashed border-gray-200 dark:border-gray-800 transition-colors">
                          <p className="text-gray-400 dark:text-gray-600 font-black uppercase tracking-[0.3em] text-sm">OTOMATİK ATAMA KURALI BULUNMUYOR</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                          {assignmentRules.map((rule) => (
                            <div key={rule.id} className="bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 rounded-[2rem] p-8 flex flex-col hover:border-primary-500/30 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group relative">
                               <div className="flex items-start justify-between mb-6">
                                  <div className="px-4 py-1.5 bg-gray-950 dark:bg-white text-white dark:text-gray-950 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-lg">
                                    SIRA: {rule.priority}
                                  </div>
                                  <button
                                    onClick={() => handleDeleteAssignmentRule(rule.id)}
                                    className="p-3 text-gray-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                  >
                                    <Trash2 className="h-5 w-5" />
                                  </button>
                               </div>
                               <div className="flex items-center gap-4 mb-3">
                                  <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-[1.25rem]">
                                    <Target className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                                  </div>
                                  <h5 className="text-lg font-black text-gray-950 dark:text-white uppercase tracking-tight leading-tight">
                                    {rule.scope_type === 'GLOBAL' && 'TÜM ENVANTER'}
                                    {rule.scope_type === 'CATEGORY' && rule.category_name}
                                    {rule.scope_type === 'ASSET' && rule.asset_name}
                                  </h5>
                               </div>
                               <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest pl-2">
                                 <ArrowRight className="h-3 w-3 text-primary-500" />
                                 {rule.maintenance_type === 'ALL' ? 'TÜM OPERASYONLAR' : rule.maintenance_type}
                               </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ChecklistSettings
