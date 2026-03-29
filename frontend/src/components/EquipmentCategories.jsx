import { useState, useEffect, useMemo } from 'react'
import { ChevronDown, ChevronRight, Plus, Edit, Trash2, Folder, FolderOpen, Search, Grid, List, Sparkles, AlertCircle } from 'lucide-react'

// Enhanced Card View Component for Category
const CategoryCard = ({
  category,
  level,
  expandedCategories,
  toggleCategory,
  onEdit,
  onDelete,
  onAddSubcategory,
  isEditing,
  editingName,
  setEditingName,
  onSaveEdit,
  onCancelEdit,
  editingCategory
}) => {
  const hasChildren = category.children && category.children.length > 0
  const isExpanded = expandedCategories.has(category.id)
  const levelGradients = [
    'from-indigo-500 to-blue-600',
    'from-emerald-500 to-teal-600',
    'from-violet-500 to-purple-600',
    'from-amber-500 to-orange-600'
  ]
  const levelLabels = ['Ana Kategori', 'Alt Kategori', 'Alt Kategori 2', 'Alt Kategori 3']

  return (
    <div className={`category-card ${level > 0 ? 'ml-4 sm:ml-8 mt-4' : 'mt-4'}`}>
      <div className={`bg-white dark:bg-gray-900 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-all duration-300 overflow-hidden group ${isExpanded ? 'ring-2 ring-primary-500/20 dark:ring-primary-500/10' : ''}`}>
        {/* Card Header with Modern Gradient */}
        <div className={`bg-gradient-to-r ${levelGradients[level % 4]} p-5 relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-16 -translate-y-16 blur-2xl pointer-events-none"></div>
          <div className="flex items-center justify-between text-white relative z-10">
            <div className="flex items-center gap-4 flex-1">
              {(hasChildren || level > 0) && (
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="p-2 hover:bg-white/20 rounded-xl transition-all"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-5 w-5" />
                  ) : (
                    <ChevronRight className="h-5 w-5" />
                  )}
                </button>
              )}
              <div className="flex items-center gap-4 flex-1">
                <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm shadow-inner">
                  {isExpanded ? (
                    <FolderOpen className="h-5 w-5 text-white" />
                  ) : (
                    <Folder className="h-5 w-5 text-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="bg-white/20 dark:bg-black/20 text-white placeholder-white/60 px-4 py-2 rounded-xl w-full font-black focus:outline-none focus:ring-2 focus:ring-white/50 shadow-inner border border-white/20"
                      placeholder="Kategori adı"
                      autoFocus
                    />
                  ) : (
                    <h3 className="font-black text-xl truncate drop-shadow-md tracking-tight">{category.name}</h3>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                {levelLabels[level % 4]}
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 px-3 py-1 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
                {hasChildren ? `${category.children.length} Alt Öğe` : 'Son Kategori'}
              </span>
            </div>
            
            <div className={`flex items-center gap-2 transition-all duration-300 ${!isEditing ? 'opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0' : 'opacity-100'}`}>
              {isEditing ? (
                <>
                  <button
                    onClick={() => onSaveEdit(category)}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/20"
                  >
                    <Sparkles className="h-3.5 w-3.5" /> Kaydet
                  </button>
                  <button
                    onClick={onCancelEdit}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest"
                  >
                    İptal
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => onAddSubcategory(category)}
                    className="p-2.5 text-primary-600 bg-primary-50 dark:bg-primary-900/30 dark:text-primary-400 rounded-xl transition-all hover:scale-110 shadow-sm border border-primary-100 dark:border-primary-800"
                    title="Alt Kategori Ekle"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => onEdit(category)}
                    className="p-2.5 text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400 rounded-xl transition-all hover:scale-110 shadow-sm border border-blue-100 dark:border-blue-800"
                    title="Düzenle"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => onDelete(category.id)}
                    className="p-2.5 text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400 rounded-xl transition-all hover:scale-110 shadow-sm border border-red-100 dark:border-red-800"
                    title="Sil"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Children Render */}
        {isExpanded && hasChildren && (
          <div className="px-5 pb-5 bg-gray-50/50 dark:bg-gray-950/30 border-t border-gray-100 dark:border-gray-800">
            {category.children.map(child => (
              <CategoryCard
                key={child.id}
                category={child}
                level={level + 1}
                expandedCategories={expandedCategories}
                toggleCategory={toggleCategory}
                onEdit={onEdit}
                onDelete={onDelete}
                onAddSubcategory={onAddSubcategory}
                isEditing={isEditing && editingCategory?.id === child.id}
                editingName={editingName}
                setEditingName={setEditingName}
                onSaveEdit={onSaveEdit}
                onCancelEdit={onCancelEdit}
                editingCategory={editingCategory}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Enhanced List View Component for Category
const CategoryListItem = ({
  category,
  level,
  expandedCategories,
  toggleCategory,
  onEdit,
  onDelete,
  onAddSubcategory,
  isEditing,
  editingName,
  setEditingName,
  onSaveEdit,
  onCancelEdit,
  editingCategory
}) => {
  const hasChildren = category.children && category.children.length > 0
  const isExpanded = expandedCategories.has(category.id)
  const levelColors = [
    'border-l-indigo-500',
    'border-l-emerald-500',
    'border-l-violet-500',
    'border-l-amber-500'
  ]
  const levelLabels = ['Ana Kategori', 'Alt Kategori', 'Alt Kategori 2', 'Alt Kategori 3']

  return (
    <div className={`category-list-item ${level > 0 ? 'ml-6 sm:ml-10 mt-3' : 'mt-4'}`}>
      <div className={`bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 border-l-4 ${levelColors[level % 4]} p-4 hover:shadow-xl hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-300 group`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {(hasChildren || level > 0) && (
              <button
                onClick={() => toggleCategory(category.id)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all text-gray-400 dark:text-gray-500 hover:text-primary-600 dark:hover:text-primary-400"
              >
                {isExpanded ? (
                  <ChevronDown className="h-5 w-5" />
                ) : (
                  <ChevronRight className="h-5 w-5" />
                )}
              </button>
            )}
            <div className={`p-2.5 rounded-xl transition-all shadow-sm ${isExpanded ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}>
              {isExpanded ? <FolderOpen className="h-5 w-5" /> : <Folder className="h-5 w-5" />}
            </div>
            <div className="flex-1 min-w-0 pr-4">
              {isEditing ? (
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="w-full px-4 py-2 border border-primary-200 dark:border-primary-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent font-black"
                  placeholder="Kategori adı"
                  autoFocus
                />
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <span className="font-black text-gray-900 dark:text-gray-100 truncate text-lg tracking-tight">
                    {category.name}
                  </span>
                  <span className="px-2.5 py-0.5 text-[9px] uppercase tracking-widest font-black rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 w-fit">
                    {levelLabels[level % 4]}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <div className={`flex items-center gap-2 transition-all duration-300 ${!isEditing ? 'opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0' : ''}`}>
            {isEditing ? (
              <>
                <button
                  onClick={() => onSaveEdit(category)}
                  className="p-2.5 text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-all shadow-lg shadow-emerald-500/20"
                  title="Kaydet"
                >
                  <Sparkles className="h-5 w-5" />
                </button>
                <button
                  onClick={onCancelEdit}
                  className="p-2.5 text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-all"
                  title="İptal"
                >
                  <X className="h-5 w-5" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onAddSubcategory(category)}
                  className="px-4 py-2 text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 hover:bg-primary-600 hover:text-white dark:hover:bg-primary-600 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-sm"
                >
                  <Plus className="h-4 w-4" /> <span className="hidden sm:inline">ALT KATEGORİ</span>
                </button>
                <button
                  onClick={() => onEdit(category)}
                  className="p-2.5 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-600 hover:text-white rounded-xl transition-all shadow-sm"
                  title="Düzenle"
                >
                  <Edit className="h-5 w-5" />
                </button>
                <button
                  onClick={() => onDelete(category.id)}
                  className="p-2.5 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 hover:bg-red-600 hover:text-white rounded-xl transition-all shadow-sm"
                  title="Sil"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Children List */}
      {isExpanded && hasChildren && (
        <div className="relative before:absolute before:inset-y-0 before:left-7 before:w-px before:bg-gray-200 dark:before:bg-gray-800 pt-3 pb-3">
          {category.children.map(child => (
            <CategoryListItem
              key={child.id}
              category={child}
              level={level + 1}
              expandedCategories={expandedCategories}
              toggleCategory={toggleCategory}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddSubcategory={onAddSubcategory}
              isEditing={isEditing && editingCategory?.id === child.id}
              editingName={editingName}
              setEditingName={setEditingName}
              onSaveEdit={onSaveEdit}
              onCancelEdit={onCancelEdit}
              editingCategory={editingCategory}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Main Equipment Categories Component
const EquipmentCategories = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [viewMode, setViewMode] = useState('card') // 'card' or 'list'
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedCategories, setExpandedCategories] = useState(new Set())
  
  const [editingCategory, setEditingCategory] = useState(null)
  const [editingName, setEditingName] = useState('')
  
  const [addingSubcategory, setAddingSubcategory] = useState(null)
  const [newSubcategoryName, setNewSubcategoryName] = useState('')
  
  const [showAddForm, setShowAddForm] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const res = await fetch('/api/eams/settings/equipment-categories', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setCategories(data || [])
      // Expand root categories by default
      if (data && data.length > 0) {
        setExpandedCategories(new Set(data.map(c => c.id)))
      }
    } catch (err) {
      console.error('Error fetching equipment categories', err)
      setError('Kategoriler yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  // Filter categories based on search
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories
    
    const filterRecursive = (items) => {
      return items.reduce((acc, item) => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
        const filteredChildren = item.children ? filterRecursive(item.children) : []
        
        if (matchesSearch || filteredChildren.length > 0) {
          acc.push({
            ...item,
            children: filteredChildren.length > 0 ? filteredChildren : item.children
          })
        }
        return acc
      }, [])
    }
    
    return filterRecursive(categories)
  }, [categories, searchQuery])

  // Toggle category expansion
  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId)
      } else {
        newSet.add(categoryId)
      }
      return newSet
    })
  }

  // Edit category
  const handleEdit = (category) => {
    setEditingCategory(category)
    setEditingName(category.name)
    setAddingSubcategory(null)
    setShowAddForm(false)
  }

  const handleSaveEdit = async (category) => {
    if (!editingName.trim()) return
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/eams/settings/equipment-categories/${category.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editingName,
          parent_id: category.parent_id,
          description: category.description
        })
      })
      if (res.ok) {
        setEditingCategory(null)
        setEditingName('')
        fetchCategories()
      }
    } catch (err) {
      console.error('Error updating category', err)
    }
  }

  const handleCancelEdit = () => {
    setEditingCategory(null)
    setEditingName('')
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Bu kategoriyi silmek istediğinize emin misiniz?')) return
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/eams/settings/equipment-categories/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        setExpandedCategories(prev => {
          const newSet = new Set(prev)
          newSet.delete(id)
          return newSet
        })
        fetchCategories()
      } else {
        alert('Kategori silinirken hata oluştu. Muhtemelen alt kategorileri var.')
      }
    } catch (err) {
      console.error('Error deleting category', err)
    }
  }

  const handleAddSubcategory = (parentCategory) => {
    setAddingSubcategory(parentCategory.id)
    setNewSubcategoryName('')
    setEditingCategory(null)
    setShowAddForm(false)
    // Expand the parent so we can see the addition
    setExpandedCategories(prev => new Set([...prev, parentCategory.id]))
  }

  const handleSubcategorySubmit = async (e, parentId) => {
    e.preventDefault()
    if (!newSubcategoryName.trim()) return
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/eams/settings/equipment-categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newSubcategoryName,
          parent_id: parentId
        })
      })
      if (res.ok) {
        setNewSubcategoryName('')
        setAddingSubcategory(null)
        fetchCategories()
      }
    } catch (err) {
      console.error('Error adding subcategory', err)
    }
  }

  const handleAddRootCategory = async (e) => {
    e.preventDefault()
    if (!newCategoryName.trim()) return
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/eams/settings/equipment-categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newCategoryName,
          parent_id: null
        })
      })
      if (res.ok) {
        setNewCategoryName('')
        setShowAddForm(false)
        fetchCategories()
      }
    } catch (err) {
      console.error('Error adding category', err)
    }
  }

  const isEditing = !!editingCategory;

  if (loading && categories.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-100 dark:border-primary-900/30 border-t-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-12">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-gray-900 dark:text-gray-100 tracking-tight">Ekipman Kategorileri</h2>
          <p className="text-lg text-gray-500 dark:text-gray-400 mt-2 font-medium">
            Varlıklarınızı hiyerarşik olarak sınıflayın ve yönetin.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setShowAddForm(!showAddForm)
              setAddingSubcategory(null)
              setEditingCategory(null)
            }}
            className="px-8 py-4 bg-primary-600 dark:bg-primary-500 text-white rounded-2xl hover:bg-primary-700 dark:hover:bg-primary-600 transition-all duration-300 flex items-center gap-3 font-black shadow-xl shadow-primary-500/20 dark:shadow-none uppercase tracking-widest text-xs hover:-translate-y-1"
          >
            <Plus className="h-5 w-5" />
            Yeni Kategori
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-400 rounded-xl flex items-center gap-3 transition-colors">
          <AlertCircle className="h-5 w-5" />
          <span className="font-bold">{error}</span>
        </div>
      )}

      {/* Filter Bar Grid */}
      <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-3 lg:p-4 sticky top-4 z-20">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Ağaç içinde ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all font-bold"
            />
          </div>
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 w-full sm:w-auto">
            <button
              onClick={() => setViewMode('card')}
              className={`flex-1 sm:flex-none p-2 rounded-lg transition-all flex items-center justify-center gap-2 ${
                viewMode === 'card' ? 'bg-white dark:bg-gray-700 shadow-sm text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              <Grid className="h-4 w-4" /> <span className="text-sm font-bold sm:hidden">Kart</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex-1 sm:flex-none p-2 rounded-lg transition-all flex items-center justify-center gap-2 ${
                viewMode === 'list' ? 'bg-white dark:bg-gray-700 shadow-sm text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              <List className="h-4 w-4" /> <span className="text-sm font-bold sm:hidden">Liste</span>
            </button>
          </div>
        </div>
      </div>

      {/* Root Addition Modal / Inline Block */}
      {showAddForm && (
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 shadow-xl animate-in zoom-in-95 duration-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
          <h3 className="text-xl font-bold text-white mb-4 relative z-10 flex items-center gap-2">
            <FolderOpen className="h-6 w-6" /> Yeni Ana Kategori
          </h3>
          <form onSubmit={handleAddRootCategory} className="flex flex-col sm:flex-row gap-4 relative z-10">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="flex-1 px-5 py-3.5 bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-xl text-white placeholder-white/60 focus:bg-white/20 focus:border-white focus:ring-0 transition-all font-bold"
              placeholder="Örn: İklimlendirme Sistemleri"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all font-black uppercase tracking-widest text-xs"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={!newCategoryName.trim()}
                className="px-8 py-3.5 bg-white text-primary-600 hover:bg-gray-50 rounded-xl transition-all font-black uppercase tracking-widest text-xs shadow-xl disabled:opacity-50"
              >
                Oluştur
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Adding Subcategory Block */}
      {addingSubcategory && (
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 shadow-xl animate-in zoom-in-95 duration-200">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Plus className="h-6 w-6" /> Yeni Alt Kategori
          </h3>
          <form onSubmit={(e) => handleSubcategorySubmit(e, addingSubcategory)} className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={newSubcategoryName}
              onChange={(e) => setNewSubcategoryName(e.target.value)}
              className="flex-1 px-5 py-3.5 bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-xl text-white placeholder-white/60 focus:bg-white/20 focus:border-white transition-all font-bold"
              placeholder="Alt kategori adı..."
              autoFocus
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setAddingSubcategory(null)}
                className="px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all font-black uppercase tracking-widest text-xs"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={!newSubcategoryName.trim()}
                className="px-8 py-3.5 bg-white text-teal-600 hover:bg-gray-50 rounded-xl transition-all font-black uppercase tracking-widest text-xs shadow-xl disabled:opacity-50"
              >
                Oluştur
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Hierarchy Render */}
      {filteredCategories.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-[32px] border border-dashed border-gray-300 dark:border-gray-800 p-20 text-center animate-in fade-in transition-colors">
          <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-3xl w-24 h-24 flex items-center justify-center mx-auto mb-6">
            <Folder className="h-12 w-12 text-gray-300 dark:text-gray-600" />
          </div>
          <h3 className="text-xl font-black text-gray-900 dark:text-gray-100 mb-2 tracking-tight">Kategori Bulunamadı</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto font-medium">
            Görüntülenecek ekipman kategorisi yok. Yeni kategoriler ekleyerek hiyerarşi kurmaya başlayabilirsiniz.
          </p>
        </div>
      ) : (
        <div className={viewMode === 'card' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 items-start' : 'space-y-4'}>
          {filteredCategories.map(category => (
            viewMode === 'card' ? (
              <CategoryCard
                key={category.id}
                category={category}
                level={0}
                expandedCategories={expandedCategories}
                toggleCategory={toggleCategory}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onAddSubcategory={handleAddSubcategory}
                isEditing={isEditing && editingCategory?.id === category.id}
                editingName={editingName}
                setEditingName={setEditingName}
                onSaveEdit={handleSaveEdit}
                onCancelEdit={handleCancelEdit}
                editingCategory={editingCategory}
              />
            ) : (
              <CategoryListItem
                key={category.id}
                category={category}
                level={0}
                expandedCategories={expandedCategories}
                toggleCategory={toggleCategory}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onAddSubcategory={handleAddSubcategory}
                isEditing={isEditing && editingCategory?.id === category.id}
                editingName={editingName}
                setEditingName={setEditingName}
                onSaveEdit={handleSaveEdit}
                onCancelEdit={handleCancelEdit}
                editingCategory={editingCategory}
              />
            )
          ))}
        </div>
      )}
    </div>
  )
}

export default EquipmentCategories
