import { useState, useEffect, useMemo } from 'react'
import { ChevronDown, ChevronRight, Plus, Edit, Trash2, Package, Layers, Folder, Tag, Search, Grid, List, Sparkles, AlertCircle } from 'lucide-react'

// Enhanced Card View Component for Equipment Hierarchy Node
const HierarchyCard = ({
  node,
  level,
  expandedNodes,
  toggleNode,
  onAdd,
  onEdit,
  onDelete,
  isEditing,
  editingName,
  setEditingName,
  onSaveEdit,
  onCancelEdit,
  editingNode
}) => {
  const hasChildren = node.children && node.children.length > 0
  const isExpanded = expandedNodes.has(node.id)
  const canAddChild = level < 3

  const levelConfig = [
    { gradient: 'from-purple-500 to-indigo-600', icon: Package, label: 'Ekipman Cinsi' },
    { gradient: 'from-blue-500 to-cyan-600', icon: Layers, label: 'Kategori' },
    { gradient: 'from-emerald-500 to-teal-600', icon: Folder, label: 'Alt Kategori' },
    { gradient: 'from-orange-500 to-amber-600', icon: Tag, label: 'Tür' }
  ]

  const config = levelConfig[level % 4]
  const LevelIcon = config.icon

  return (
    <div className={`hierarchy-card ${level > 0 ? 'ml-4 sm:ml-8 mt-4' : 'mt-4'}`}>
      <div className={`bg-white dark:bg-gray-900 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-all duration-300 overflow-hidden group ${isExpanded ? 'ring-2 ring-purple-500/20 dark:ring-purple-500/10' : ''}`}>
        {/* Card Header with Modern Gradient */}
        <div className={`bg-gradient-to-r ${config.gradient} p-5 relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-16 -translate-y-16 blur-2xl pointer-events-none"></div>
          <div className="flex items-center justify-between text-white relative z-10">
            <div className="flex items-center gap-4 flex-1">
              {(hasChildren || level > 0) && (
                <button
                  onClick={() => toggleNode(node.id)}
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
                    <Folder className="h-5 w-5 text-white" />
                  ) : (
                    <LevelIcon className="h-5 w-5 text-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="bg-white/20 dark:bg-black/20 text-white placeholder-white/60 px-4 py-2 rounded-xl w-full font-black focus:outline-none focus:ring-2 focus:ring-white/50 shadow-inner border border-white/20"
                      placeholder="İsim girin..."
                      autoFocus
                    />
                  ) : (
                    <h3 className="font-black text-xl truncate drop-shadow-md tracking-tight">{node.name}</h3>
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
                {config.label}
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 px-3 py-1 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
                Sıra: {node.sort_order}
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 px-3 py-1 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800 hidden sm:inline-block">
                {hasChildren ? `${node.children.length} Alt Öğeler` : 'Alt Öğe Yok'}
              </span>
            </div>
            
            <div className={`flex items-center gap-2 transition-all duration-300 ${!isEditing ? 'opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0' : 'opacity-100'}`}>
              {isEditing ? (
                <>
                  <button
                    onClick={() => onSaveEdit(node)}
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
                  {canAddChild && (
                    <button
                      onClick={() => onAdd(node)}
                      className="p-2.5 text-purple-600 bg-purple-50 dark:bg-purple-900/30 dark:text-purple-400 rounded-xl transition-all hover:scale-110 shadow-sm border border-purple-100 dark:border-purple-800"
                      title="Alt Öğe Ekle"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  )}
                  <button
                    onClick={() => onEdit(node)}
                    className="p-2.5 text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400 rounded-xl transition-all hover:scale-110 shadow-sm border border-blue-100 dark:border-blue-800"
                    title="Düzenle"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => onDelete(node.id)}
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
            {node.children.map(child => (
              <HierarchyCard
                key={child.id}
                node={child}
                level={level + 1}
                expandedNodes={expandedNodes}
                toggleNode={toggleNode}
                onAdd={onAdd}
                onEdit={onEdit}
                onDelete={onDelete}
                isEditing={isEditing && editingNode?.id === child.id}
                editingName={editingName}
                setEditingName={setEditingName}
                onSaveEdit={onSaveEdit}
                onCancelEdit={onCancelEdit}
                editingNode={editingNode}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Enhanced List View Component for Equipment Hierarchy Node
const HierarchyListItem = ({
  node,
  level,
  expandedNodes,
  toggleNode,
  onAdd,
  onEdit,
  onDelete,
  isEditing,
  editingName,
  setEditingName,
  onSaveEdit,
  onCancelEdit,
  editingNode
}) => {
  const hasChildren = node.children && node.children.length > 0
  const isExpanded = expandedNodes.has(node.id)
  const canAddChild = level < 3

  const levelConfig = [
    { border: 'border-l-purple-500', icon: Package, label: 'Ekipman Cinsi', text: 'text-purple-600', bg: 'bg-purple-50' },
    { border: 'border-l-blue-500', icon: Layers, label: 'Kategori', text: 'text-blue-600', bg: 'bg-blue-50' },
    { border: 'border-l-emerald-500', icon: Folder, label: 'Alt Kategori', text: 'text-emerald-600', bg: 'bg-emerald-50' },
    { border: 'border-l-orange-500', icon: Tag, label: 'Tür', text: 'text-orange-600', bg: 'bg-orange-50' }
  ]

  const config = levelConfig[level % 4]
  const LevelIcon = config.icon

  return (
    <div className={`hierarchy-list-item ${level > 0 ? 'ml-6 sm:ml-10 mt-3' : 'mt-4'}`}>
      <div className={`bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 border-l-4 ${config.border} p-4 hover:shadow-xl hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-300 group`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {(hasChildren || level > 0) && (
              <button
                onClick={() => toggleNode(node.id)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all text-gray-400 dark:text-gray-500 hover:text-purple-600 dark:hover:text-purple-400"
              >
                {isExpanded ? (
                  <ChevronDown className="h-5 w-5" />
                ) : (
                  <ChevronRight className="h-5 w-5" />
                )}
              </button>
            )}
            <div className={`p-2.5 rounded-xl transition-all shadow-sm ${isExpanded ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' : config.bg + ' ' + config.text + ' dark:bg-opacity-20'}`}>
              {isExpanded ? <Folder className="h-5 w-5" /> : <LevelIcon className="h-5 w-5" />}
            </div>
            <div className="flex-1 min-w-0 pr-4">
              {isEditing ? (
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="w-full px-4 py-2 border border-purple-200 dark:border-purple-800 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent font-black"
                  placeholder="İsim girin..."
                  autoFocus
                />
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <span className="font-black text-gray-900 dark:text-gray-100 truncate text-lg tracking-tight">
                    {node.name}
                  </span>
                  <span className={`px-2.5 py-0.5 text-[9px] uppercase tracking-widest font-black rounded-lg ${config.bg} ${config.text} dark:bg-opacity-20 border border-current w-fit`}>
                    {config.label}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <div className={`flex items-center gap-2 transition-all duration-300 ${!isEditing ? 'opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0' : ''}`}>
             <div className="hidden sm:flex items-center mr-3 text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
               Sıra: {node.sort_order}
             </div>
            {isEditing ? (
              <>
                <button
                  onClick={() => onSaveEdit(node)}
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
                {canAddChild && (
                  <button
                    onClick={() => onAdd(node)}
                    className="px-4 py-2 text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-600 hover:text-white dark:hover:bg-purple-600 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-sm"
                    title="Alt Öğe Ekle"
                  >
                    <Plus className="h-4 w-4" /> <span className="hidden sm:inline">ALT ÖĞE</span>
                  </button>
                )}
                <button
                  onClick={() => onEdit(node)}
                  className="p-2.5 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-600 hover:text-white rounded-xl transition-all shadow-sm"
                  title="Düzenle"
                >
                  <Edit className="h-5 w-5" />
                </button>
                <button
                  onClick={() => onDelete(node.id)}
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
          {node.children.map(child => (
            <HierarchyListItem
              key={child.id}
              node={child}
              level={level + 1}
              expandedNodes={expandedNodes}
              toggleNode={toggleNode}
              onAdd={onAdd}
              onEdit={onEdit}
              onDelete={onDelete}
              isEditing={isEditing && editingNode?.id === child.id}
              editingName={editingName}
              setEditingName={setEditingName}
              onSaveEdit={onSaveEdit}
              onCancelEdit={onCancelEdit}
              editingNode={editingNode}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Main Equipment Hierarchy Component
const EquipmentHierarchy = () => {
  const [hierarchy, setHierarchy] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [viewMode, setViewMode] = useState('card') // 'card' or 'list'
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedNodes, setExpandedNodes] = useState(new Set())
  
  const [editingNode, setEditingNode] = useState(null)
  const [editingName, setEditingName] = useState('')
  
  const [addingNode, setAddingNode] = useState(null)
  const [newNodeName, setNewNodeName] = useState('')
  
  const [showAddForm, setShowAddForm] = useState(false)
  const [newRootName, setNewRootName] = useState('')

  // Fetch hierarchy
  const fetchHierarchy = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const res = await fetch('/api/eams/settings/equipment-hierarchy', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setHierarchy(data || [])
      // Expand root nodes by default
      if (data && data.length > 0) {
        setExpandedNodes(new Set(data.map(n => n.id)))
      }
    } catch (err) {
      console.error('Error fetching equipment hierarchy', err)
      setError('Hiyerarşi yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHierarchy()
  }, [])

  // Filter hierarchy based on search
  const filteredHierarchy = useMemo(() => {
    if (!searchQuery.trim()) return hierarchy
    
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
    
    return filterRecursive(hierarchy)
  }, [hierarchy, searchQuery])

  // Toggle node expansion
  const toggleNode = (nodeId) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev)
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId)
      } else {
        newSet.add(nodeId)
      }
      return newSet
    })
  }

  // Edit node
  const handleEdit = (node) => {
    setEditingNode(node)
    setEditingName(node.name)
    setAddingNode(null)
    setShowAddForm(false)
  }

  const handleSaveEdit = async (node) => {
    if (!editingName.trim()) return
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/eams/settings/equipment-hierarchy/${node.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editingName,
          parent_id: node.parent_id,
          sort_order: node.sort_order
        })
      })
      if (res.ok) {
        setEditingNode(null)
        setEditingName('')
        fetchHierarchy()
      }
    } catch (err) {
      console.error('Error updating node', err)
    }
  }

  const handleCancelEdit = () => {
    setEditingNode(null)
    setEditingName('')
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Bu öğeyi silmek istediğinize emin misiniz?')) return
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/eams/settings/equipment-hierarchy/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        setExpandedNodes(prev => {
          const newSet = new Set(prev)
          newSet.delete(id)
          return newSet
        })
        fetchHierarchy()
      } else {
        alert('Silme sırasında hata oluştu. Muhtemelen alt öğeleri var.')
      }
    } catch (err) {
      console.error('Error deleting node', err)
    }
  }

  const handleAdd = (parentNode) => {
    setAddingNode(parentNode.id)
    setNewNodeName('')
    setEditingNode(null)
    setShowAddForm(false)
    // Expand the parent so we can see the addition
    setExpandedNodes(prev => new Set([...prev, parentNode.id]))
  }

  const handleAddSubmit = async (e, parentId) => {
    e.preventDefault()
    if (!newNodeName.trim()) return
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/eams/settings/equipment-hierarchy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newNodeName,
          parent_id: parentId
        })
      })
      if (res.ok) {
        setNewNodeName('')
        setAddingNode(null)
        fetchHierarchy()
      }
    } catch (err) {
      console.error('Error adding node', err)
    }
  }

  const handleAddRoot = async (e) => {
    e.preventDefault()
    if (!newRootName.trim()) return
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/eams/settings/equipment-hierarchy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newRootName,
          parent_id: null
        })
      })
      if (res.ok) {
        setNewRootName('')
        setShowAddForm(false)
        fetchHierarchy()
      }
    } catch (err) {
      console.error('Error adding root node', err)
    }
  }

  const isEditing = !!editingNode;

  if (loading && hierarchy.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-100 dark:border-purple-900/30 border-t-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight">Ekipman Hiyerarşisi (Cins)</h2>
          <p className="text-base text-gray-500 dark:text-gray-400 mt-1 font-medium">
            Ekipman Cinsi → Kategori → Alt Kategori → Tür yapısında cihaz ağacınızı yönetin.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setShowAddForm(!showAddForm)
              setAddingNode(null)
              setEditingNode(null)
            }}
            className="px-6 py-3 bg-purple-600 dark:bg-purple-500 text-white rounded-xl hover:bg-purple-700 dark:hover:bg-purple-600 transition-all duration-200 flex items-center gap-2 font-bold shadow-lg shadow-purple-100 dark:shadow-none uppercase tracking-widest text-sm"
          >
            <Plus className="h-5 w-5" />
            Yeni Ekipman Cinsi
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
      <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-3 lg:p-4 sticky top-4 z-20 transition-colors">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-400" />
            <input
              type="text"
              placeholder="Ekipman hiyerarşisinde ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all font-bold"
            />
          </div>
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 w-full sm:w-auto">
            <button
              onClick={() => setViewMode('card')}
              className={`flex-1 sm:flex-none p-2 rounded-lg transition-all flex items-center justify-center gap-2 ${
                viewMode === 'card' ? 'bg-white dark:bg-gray-700 shadow-sm text-purple-600 dark:text-purple-400' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              <Grid className="h-4 w-4" /> <span className="text-sm font-bold sm:hidden">Kart</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex-1 sm:flex-none p-2 rounded-lg transition-all flex items-center justify-center gap-2 ${
                viewMode === 'list' ? 'bg-white dark:bg-gray-700 shadow-sm text-purple-600 dark:text-purple-400' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              <List className="h-4 w-4" /> <span className="text-sm font-bold sm:hidden">Liste</span>
            </button>
          </div>
        </div>
      </div>

      {/* Root Addition Modal / Inline Block */}
      {showAddForm && (
        <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl p-6 shadow-xl animate-in zoom-in-95 duration-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
          <h3 className="text-xl font-bold text-white mb-4 relative z-10 flex items-center gap-2">
            <Package className="h-6 w-6" /> Yeni Ekipman Cinsi
          </h3>
          <form onSubmit={handleAddRoot} className="flex flex-col sm:flex-row gap-4 relative z-10">
            <input
              type="text"
              value={newRootName}
              onChange={(e) => setNewRootName(e.target.value)}
              className="flex-1 px-5 py-3.5 bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-xl text-white placeholder-white/60 focus:bg-white/20 focus:border-white focus:ring-0 transition-all font-bold"
              placeholder="Örn: Medikal Cihazlar"
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
                disabled={!newRootName.trim()}
                className="px-8 py-3.5 bg-white text-purple-600 hover:bg-gray-50 rounded-xl transition-all font-black uppercase tracking-widest text-xs shadow-xl disabled:opacity-50"
              >
                Oluştur
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Adding Subitem Block */}
      {addingNode && (
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 shadow-xl animate-in zoom-in-95 duration-200">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Plus className="h-6 w-6" /> Yeni Alt Öğe Ekle
          </h3>
          <form onSubmit={(e) => handleAddSubmit(e, addingNode)} className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={newNodeName}
              onChange={(e) => setNewNodeName(e.target.value)}
              className="flex-1 px-5 py-3.5 bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-xl text-white placeholder-white/60 focus:bg-white/20 focus:border-white transition-all font-bold"
              placeholder="İsim girin..."
              autoFocus
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setAddingNode(null)}
                className="px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all font-black uppercase tracking-widest text-xs"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={!newNodeName.trim()}
                className="px-8 py-3.5 bg-white text-blue-600 hover:bg-gray-50 rounded-xl transition-all font-black uppercase tracking-widest text-xs shadow-xl disabled:opacity-50"
              >
                Oluştur
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Hierarchy Render */}
      {filteredHierarchy.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-[32px] border border-dashed border-gray-300 dark:border-gray-800 p-20 text-center animate-in fade-in transition-colors">
          <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-3xl w-24 h-24 flex items-center justify-center mx-auto mb-6">
            <Layers className="h-12 w-12 text-gray-300 dark:text-gray-600" />
          </div>
          <h3 className="text-xl font-black text-gray-900 dark:text-gray-100 mb-2 tracking-tight">Hiyerarşi Bulunamadı</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto font-medium">
            Görüntülenecek ekipman cinsi yok. Yeni öğeler ekleyerek hiyerarşi kurmaya başlayabilirsiniz.
          </p>
        </div>
      ) : (
        <div className={viewMode === 'card' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 items-start' : 'space-y-4'}>
          {filteredHierarchy.map(node => (
            viewMode === 'card' ? (
              <HierarchyCard
                key={node.id}
                node={node}
                level={0}
                expandedNodes={expandedNodes}
                toggleNode={toggleNode}
                onAdd={handleAdd}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isEditing={isEditing && editingNode?.id === node.id}
                editingName={editingName}
                setEditingName={setEditingName}
                onSaveEdit={handleSaveEdit}
                onCancelEdit={handleCancelEdit}
                editingNode={editingNode}
              />
            ) : (
              <HierarchyListItem
                key={node.id}
                node={node}
                level={0}
                expandedNodes={expandedNodes}
                toggleNode={toggleNode}
                onAdd={handleAdd}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isEditing={isEditing && editingNode?.id === node.id}
                editingName={editingName}
                setEditingName={setEditingName}
                onSaveEdit={handleSaveEdit}
                onCancelEdit={handleCancelEdit}
                editingNode={editingNode}
              />
            )
          ))}
        </div>
      )}
    </div>
  )
}

export default EquipmentHierarchy
