import { useState, useEffect } from 'react'
import { Building, Plus, Edit, Trash2, Search, ArrowLeft, Users } from 'lucide-react'

const AuthorizedDepartments = () => {
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form states
  const [showModal, setShowModal] = useState(false)
  const [editingDept, setEditingDept] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  })

  useEffect(() => {
    fetchDepartments()
  }, [])

  const fetchDepartments = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const res = await fetch('/api/eams/settings/departments', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setDepartments(data || [])
    } catch (err) {
      console.error('Error fetching departments', err)
      setError('Yetkili departmanlar yüklenirken hata oluştu.')
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
      showMessage('error', 'Departman adı gereklidir.')
      return
    }

    try {
      const token = localStorage.getItem('token')
      const url = editingDept
        ? `/api/eams/settings/departments/${editingDept.id}`
        : `/api/eams/settings/departments`
      const method = editingDept ? 'PUT' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        showMessage('success', editingDept ? 'Departman güncellendi.' : 'Yeni departman eklendi.')
        setShowModal(false)
        setEditingDept(null)
        setFormData({ name: '', description: '' })
        fetchDepartments()
      } else {
        const data = await res.json()
        showMessage('error', data.error || 'Departman kaydedilemedi.')
      }
    } catch (err) {
      console.error('Error saving department', err)
      showMessage('error', 'Sunucuya bağlanılamadı.')
    }
  }

  const handleEdit = (dept) => {
    setEditingDept(dept)
    setFormData({
      name: dept.name,
      description: dept.description || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Bu departmanı silmek istediğinize emin misiniz?')) return
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/eams/settings/departments/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        showMessage('success', 'Departman silindi.')
        fetchDepartments()
      } else {
        const data = await res.json()
        showMessage('error', data.error || 'Departman silinemedi.')
      }
    } catch (err) {
      console.error('Error deleting department', err)
      showMessage('error', 'Sunucuya bağlanılamadı.')
    }
  }

  const filteredDepts = departments.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (d.description && d.description.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  if (loading && departments.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-100 dark:border-primary-900/30 border-t-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Messages */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-800 dark:text-red-400 animate-in fade-in slide-in-from-top-2 font-medium">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-sm text-emerald-800 dark:text-emerald-400 animate-in fade-in slide-in-from-top-2 font-medium">
          {success}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight">Yetkili Departmanlar</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
            Varlık yönetiminden sorumlu departmanları yönetin
          </p>
        </div>
        <button
          onClick={() => {
            setEditingDept(null)
            setFormData({ name: '', description: '' })
            setShowModal(true)
          }}
          className="px-6 py-3 bg-primary-600 dark:bg-primary-500 text-white rounded-xl hover:bg-primary-700 dark:hover:bg-primary-600 transition-all duration-200 flex items-center gap-2 text-sm font-bold shadow-lg shadow-primary-100 dark:shadow-none uppercase tracking-widest"
        >
          <Plus className="h-5 w-5" />
          YENİ DEPARTMAN EKLE
        </button>
      </div>

      {/* List of Departments */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/20">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Departman ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 transition-all shadow-sm outline-none font-bold"
            />
          </div>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-gray-800 animate-in fade-in duration-500">
          {filteredDepts.map(dept => (
            <div key={dept.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className="p-3.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 transition-all duration-300 shadow-sm">
                    <Building className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-gray-100 tracking-tight">{dept.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium line-clamp-1 max-w-2xl mt-0.5">
                      {dept.description || 'Açıklama belirtilmemiş.'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                  <div className="hidden lg:flex items-center gap-2 text-[10px] font-black text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-xl uppercase tracking-widest border border-gray-200 dark:border-gray-700">
                    <Users className="h-4 w-4" /> YETKİLİ BİRİM
                  </div>
                  <button
                    onClick={() => handleEdit(dept)}
                    className="p-3 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-2xl transition-all shadow-sm bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(dept.id)}
                    className="p-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-2xl transition-all shadow-sm bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
                    disabled={dept.is_system}
                    title={dept.is_system ? 'Sistem departmanı silinemez' : ''}
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredDepts.length === 0 && (
            <div className="p-20 text-center bg-white dark:bg-gray-900 transition-colors">
              <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-3xl w-24 h-24 flex items-center justify-center mx-auto mb-6">
                <Building className="h-12 w-12 text-gray-300 dark:text-gray-600" />
              </div>
              <p className="font-black text-gray-900 dark:text-gray-100 text-lg tracking-tight">Departman bulunamadı</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium">Arama kriterlerinize uygun sonuç bulunamadı.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
          <div className="bg-white dark:bg-gray-900 rounded-[32px] w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden border border-gray-100 dark:border-gray-800 transition-colors">
            <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50 transition-colors">
              <h3 className="text-xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
                {editingDept ? 'DEPARTMANI DÜZENLE' : 'YENİ DEPARTMAN'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                <div className="p-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                  <ArrowLeft className="h-5 w-5 rotate-180" />
                </div>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-1">Departman Adı</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-5 py-4 border-2 border-transparent rounded-2xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:bg-white dark:focus:bg-gray-950 focus:border-primary-500 dark:focus:border-primary-400 transition-all shadow-sm outline-none font-bold"
                  placeholder="Örn: Teknik Hizmetler"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-1">Açıklama</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-5 py-4 border-2 border-transparent rounded-2xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:bg-white dark:focus:bg-gray-950 focus:border-primary-500 dark:focus:border-primary-400 transition-all shadow-sm outline-none h-32 resize-none font-medium"
                  placeholder="Departman görevleri hakkında bilgi..."
                />
              </div>
              <div className="pt-4 flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-4 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100 transition-all font-black text-xs uppercase tracking-widest"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-4 bg-primary-600 dark:bg-primary-500 text-white rounded-2xl hover:bg-primary-700 dark:hover:bg-primary-600 transition-all font-black text-xs uppercase tracking-widest shadow-xl shadow-primary-100 dark:shadow-none"
                >
                  {editingDept ? 'GÜNCELLE' : 'KAYDET'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AuthorizedDepartments 
