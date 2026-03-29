import { useState, useEffect } from 'react'
import axios from 'axios'
import { X, Building, Home, Layers, MapPin, Hash, QrCode, DoorOpen, Edit3 } from 'lucide-react'

const AreaModal = ({ isOpen, onClose, onSuccess, editArea = null, preSelectedFloorId = null }) => {
  const [formData, setFormData] = useState({
    area_code: '',
    area_name: '',
    qr_barcode: '',
    area_size: '',
    facility_id: '',
    block_id: '',
    floor_id: '',
    area_type_id: '',
    room_info: '',
    description: ''
  })

  const [facilities, setFacilities] = useState([])
  const [blocks, setBlocks] = useState([])
  const [floors, setFloors] = useState([])
  const [areaTypes, setAreaTypes] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [editingQrCode, setEditingQrCode] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchFacilities()
      fetchAreaTypes()
      if (editArea) {
        setFormData({
          area_code: editArea.area_code || '',
          area_name: editArea.area_name || '',
          qr_barcode: editArea.qr_barcode || '',
          area_size: editArea.area_size || '',
          facility_id: editArea.facility_id || '',
          block_id: editArea.block_id || '',
          floor_id: editArea.floor_id || '',
          area_type_id: editArea.area_type_id || '',
          room_info: editArea.room_info || '',
          description: editArea.description || ''
        })
        if (editArea.facility_id) fetchBlocks(editArea.facility_id)
        if (editArea.block_id) fetchFloors(editArea.block_id)
        if (editArea.area_type_category) setSelectedCategory(editArea.area_type_category)
      } else if (preSelectedFloorId) {
        fetchFloorDetails(preSelectedFloorId)
      }
    }
  }, [isOpen, editArea, preSelectedFloorId])

  const fetchFloorDetails = async (floorId) => {
    try {
      const response = await axios.get(`/api/eams/floors/${floorId}`)
      const floor = response.data
      setFormData(prev => ({
        ...prev,
        floor_id: floorId,
        facility_id: floor.facility_id || '',
        block_id: floor.block_id || ''
      }))
      if (floor.facility_id) {
        fetchBlocks(floor.facility_id)
      }
      if (floor.block_id) {
        fetchFloors(floor.block_id)
      }
    } catch (error) {
      console.error('Error fetching floor details:', error)
    }
  }

  const fetchFacilities = async () => {
    try {
      const response = await axios.get('/api/eams/facilities')
      setFacilities(response.data.facilities || [])
    } catch (error) {
      console.error('Error fetching facilities:', error)
    }
  }

  const fetchBlocks = async (facilityId) => {
    try {
      const response = await axios.get(`/api/eams/facilities/${facilityId}/blocks`)
      setBlocks(response.data.blocks || [])
    } catch (error) {
      console.error('Error fetching blocks:', error)
      setBlocks([])
    }
  }

  const fetchFloors = async (blockId) => {
    try {
      const response = await axios.get(`/api/eams/floors/block/${blockId}`)
      setFloors(response.data || [])
    } catch (error) {
      console.error('Error fetching floors:', error)
      setFloors([])
    }
  }

  const fetchFloorsByFacility = async (facilityId) => {
    try {
      const response = await axios.get(`/api/eams/floors/facility/${facilityId}`)
      setFloors(response.data || [])
    } catch (error) {
      console.error('Error fetching floors by facility:', error)
      setFloors([])
    }
  }

  const fetchAreaTypes = async () => {
    try {
      const response = await axios.get('/api/eams/areas/types')
      setAreaTypes(response.data || [])

      const uniqueCategories = [...new Set(response.data.map(type => type.category))]
      setCategories(uniqueCategories)
    } catch (error) {
      console.error('Error fetching area types:', error)
    }
  }

  const handleFacilityChange = (facilityId) => {
    setFormData(prev => ({
      ...prev,
      facility_id: facilityId,
      block_id: '',
      floor_id: ''
    }))
    setBlocks([])
    setFloors([])
    if (facilityId) {
      fetchBlocks(facilityId)
      fetchFloorsByFacility(facilityId)
    }
  }

  const handleBlockChange = (blockId) => {
    setFormData(prev => ({
      ...prev,
      block_id: blockId,
      floor_id: ''
    }))
    if (blockId) {
      fetchFloors(blockId)
    } else if (formData.facility_id) {
      fetchFloorsByFacility(formData.facility_id)
    } else {
      setFloors([])
    }
  }

  const handleCategoryChange = (category) => {
    setSelectedCategory(category)
    setFormData(prev => ({
      ...prev,
      area_type_id: ''
    }))
  }

  const filteredAreaTypes = areaTypes.filter(type => 
    !selectedCategory || type.category === selectedCategory
  )

  const validateForm = () => {
    const newErrors = {}
    if (!formData.area_name) newErrors.area_name = 'Alan adı gereklidir'
    if (!formData.facility_id) newErrors.facility_id = 'Tesis seçimi gereklidir'
    if (!formData.floor_id) newErrors.floor_id = 'Kat seçimi gereklidir'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)
    try {
      const submitData = { ...formData }

      if (!editArea) {
        delete submitData.area_code
        if (!editingQrCode) {
          delete submitData.qr_barcode
        }
      }

      if (editArea) {
        await axios.put(`/api/eams/areas/${editArea.id}`, submitData)
      } else {
        await axios.post('/api/eams/areas', submitData)
      }
      onSuccess()
      handleClose()
    } catch (error) {
      console.error('Error saving area:', error)
      setErrors({ submit: error.response?.data?.error || 'Alan kaydedilemedi' })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      area_code: '',
      area_name: '',
      qr_barcode: '',
      area_size: '',
      facility_id: '',
      block_id: '',
      floor_id: '',
      area_type_id: '',
      room_info: '',
      description: ''
    })
    setSelectedCategory('')
    setBlocks([])
    setFloors([])
    setErrors({})
    setEditingQrCode(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-950/60 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all animate-in fade-in duration-300">
      <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col transition-colors duration-200 border border-white/50 dark:border-gray-800">
        <div className="sticky top-0 bg-gray-50/30 dark:bg-gray-800/30 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800 px-8 py-6 flex items-center justify-between z-10 transition-colors">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-600 text-white rounded-2xl shadow-lg shadow-purple-500/20">
              <MapPin className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
                {editArea ? 'Alan Düzenle' : 'Yeni Alan Ekle'}
              </h2>
              <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-0.5">Konum ve mahal bilgileri</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-all p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8 overflow-y-auto">
          {errors.submit && (
            <div className="bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-900/20 text-rose-700 dark:text-rose-400 px-4 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest animate-in slide-in-from-top-2">
              {errors.submit}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 ml-1">
                <Hash className="inline h-3 w-3 mr-1 mt-[-2px]" />
                Alan Kodu (ID)
              </label>
              <input
                type="text"
                value={formData.area_code}
                disabled={!editArea}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-800/50 text-gray-400 dark:text-gray-500 cursor-not-allowed text-sm font-bold"
                placeholder={editArea ? formData.area_code : "Otomatik oluşturulacak"}
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 ml-1">
                Alan Adı *
              </label>
              <input
                type="text"
                value={formData.area_name}
                onChange={(e) => setFormData(prev => ({ ...prev, area_name: e.target.value }))}
                className={`w-full px-4 py-3 border rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100 text-sm font-bold transition-all ${
                  errors.area_name ? 'border-rose-300 dark:border-rose-900' : 'border-gray-200 dark:border-gray-700'
                }`}
                placeholder="Örn: UPS Odası-1"
                required
              />
              {errors.area_name && <p className="text-rose-600 dark:text-rose-400 text-[10px] font-bold mt-1 ml-1">{errors.area_name}</p>}
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 ml-1">
                <QrCode className="inline h-3 w-3 mr-1 mt-[-2px]" />
                QR / Barkod No
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.qr_barcode}
                  onChange={(e) => setFormData(prev => ({ ...prev, qr_barcode: e.target.value }))}
                  disabled={!editArea && !editingQrCode}
                  className={`flex-1 px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100 text-sm font-bold transition-all ${
                    !editArea && !editingQrCode ? 'bg-gray-50 dark:bg-gray-800/50 text-gray-400 dark:text-gray-500' : ''
                  }`}
                  placeholder={!editArea && !editingQrCode ? "Otomatik oluşturulacak" : "QR kod veya barkod numarası"}
                />
                {!editArea && (
                  <button
                    type="button"
                    onClick={() => setEditingQrCode(!editingQrCode)}
                    className={`px-4 py-3 rounded-2xl transition-all ${
                      editingQrCode
                        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 hover:bg-primary-200 dark:hover:bg-primary-900/50 shadow-md shadow-primary-500/10'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 ml-1">
                Net Alan (m²)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.area_size}
                onChange={(e) => setFormData(prev => ({ ...prev, area_size: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100 text-sm font-bold transition-all"
                placeholder="Alan büyüklüğü"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 ml-1">
                <Building className="inline h-3 w-3 mr-1 mt-[-2px]" />
                Tesis *
              </label>
              <select
                value={formData.facility_id}
                onChange={(e) => handleFacilityChange(e.target.value)}
                className={`w-full px-4 py-3 border rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100 text-sm font-bold transition-all ${
                  errors.facility_id ? 'border-rose-300 dark:border-rose-900' : 'border-gray-200 dark:border-gray-700'
                }`}
                required
                disabled={preSelectedFloorId}
              >
                <option value="">Tesis seçin</option>
                {facilities.map(facility => (
                  <option key={facility.id} value={facility.id}>
                    {facility.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 ml-1">
                <Home className="inline h-3 w-3 mr-1 mt-[-2px]" />
                Blok
              </label>
              <select
                value={formData.block_id}
                onChange={(e) => handleBlockChange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100 text-sm font-bold transition-all disabled:opacity-50"
                disabled={!formData.facility_id || preSelectedFloorId}
              >
                <option value="">Blok seçin (opsiyonel)</option>
                {blocks.map(block => (
                  <option key={block.id} value={block.id}>
                    {block.block_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 ml-1">
                <Layers className="inline h-3 w-3 mr-1 mt-[-2px]" />
                Kat *
              </label>
              <select
                value={formData.floor_id}
                onChange={(e) => setFormData(prev => ({ ...prev, floor_id: e.target.value }))}
                className={`w-full px-4 py-3 border rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100 text-sm font-bold transition-all disabled:opacity-50 ${
                  errors.floor_id ? 'border-rose-300 dark:border-rose-900' : 'border-gray-200 dark:border-gray-700'
                }`}
                disabled={!formData.facility_id || preSelectedFloorId}
                required
              >
                <option value="">Kat seçin</option>
                {floors.map(floor => (
                  <option key={floor.id} value={floor.id}>
                    {floor.block_name ? `${floor.block_name} - ${floor.floor_name}` : floor.floor_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 ml-1">
                Mahal Kategori
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100 text-sm font-bold transition-all"
              >
                <option value="">Kategori seçin</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 ml-1">
                Mahal Türü
              </label>
              <select
                value={formData.area_type_id}
                onChange={(e) => setFormData(prev => ({ ...prev, area_type_id: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100 text-sm font-bold transition-all disabled:opacity-50"
                disabled={!selectedCategory}
              >
                <option value="">Mahal türü seçin</option>
                {filteredAreaTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 ml-1">
                <DoorOpen className="inline h-3 w-3 mr-1 mt-[-2px]" />
                Oda Bilgisi
              </label>
              <input
                type="text"
                value={formData.room_info}
                onChange={(e) => setFormData(prev => ({ ...prev, room_info: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100 text-sm font-bold transition-all"
                placeholder="Örn: Poliklinik, Muayene Odası"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 ml-1">
              Açıklama
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows="3"
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100 text-sm font-bold transition-all resize-none"
              placeholder="Alan hakkında ek bilgiler"
            />
          </div>

          <div className="flex justify-end gap-3 pt-8 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-3.5 text-gray-700 dark:text-gray-300 font-black uppercase tracking-widest text-[10px] bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-2xl transition-all"
              disabled={loading}
            >
              İptal
            </button>
            <button
              type="submit"
              className="px-10 py-3.5 text-white font-black uppercase tracking-widest text-[10px] bg-primary-600 hover:bg-primary-700 rounded-2xl transition-all shadow-xl shadow-primary-500/20 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'İşleniyor...' : editArea ? 'Güncelle' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AreaModal
