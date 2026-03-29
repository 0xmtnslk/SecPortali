import { useState, useEffect } from 'react'
import axios from 'axios'
import { Map, Plus, Filter, Search, Edit2, Eye, QrCode, Building2, MoreVertical, LayoutGrid, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import AreaModal from '../components/AreaModal'

const Areas = () => {
  const [areas, setAreas] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterFacility, setFilterFacility] = useState('')
  const [facilities, setFacilities] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingArea, setEditingArea] = useState(null)
  
  const navigate = useNavigate()

  useEffect(() => {
    fetchAreas()
    fetchFacilities()
  }, [])

  const fetchFacilities = async () => {
    try {
      const response = await axios.get('/api/eams/facilities')
      setFacilities(response.data.facilities || [])
    } catch (error) {
      console.error('Error fetching facilities:', error)
    }
  }

  const fetchAreas = async () => {
    try {
      const response = await axios.get('/api/eams/areas')
      setAreas(response.data.areas || [])
      setLoading(false)
    } catch (error) {
      console.error('Error fetching areas:', error)
      setLoading(false)
    }
  }

  const handleAddArea = () => {
    setEditingArea(null)
    setIsModalOpen(true)
  }

  const handleEditArea = (area) => {
    setEditingArea(area)
    setIsModalOpen(true)
  }

  const handleModalSuccess = () => {
    fetchAreas()
  }

  const getCategoryBadge = (category) => {
    const categoryMap = {
      'Klinik Alan': { text: 'Klinik Alan', className: 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 border border-primary-100 dark:border-primary-800/50' },
      'İdari Alan': { text: 'İdari Alan', className: 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-400 border border-gray-100 dark:border-gray-700' },
      'Teknik Alan': { text: 'Teknik Alan', className: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-800/50' },
      'Destek Alan': { text: 'Destek Alan', className: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-800/50' },
      'Ortak Alan': { text: 'Ortak Alan', className: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/50' }
    }
    return categoryMap[category] || { text: category, className: 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-400 border border-gray-100 dark:border-gray-700' }
  }

  const filteredAreas = areas.filter(area => {
    const matchesSearch = area.area_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         area.area_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         area.qr_barcode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         area.room_info?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         area.facility_name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !filterCategory || area.area_type_category === filterCategory
    const matchesFacility = !filterFacility || area.facility_id === filterFacility
    return matchesSearch && matchesCategory && matchesFacility
  })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-8 transition-colors duration-500 animate-in fade-in">
      <div className="max-w-[1600px] mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-500/20">
                <Map className="h-8 w-8" />
              </div>
              <h1 className="text-4xl font-black text-gray-950 dark:text-white tracking-tight uppercase tracking-widest">
                ALAN & MAHAL YÖNETİMİ
              </h1>
            </div>
            <p className="text-lg text-gray-500 dark:text-gray-400 font-medium">
              Tesis içindeki tüm kapalı ve açık alanları, poliklinikleri ve teknik birimleri koordine edin.
            </p>
          </div>
          <button
            onClick={handleAddArea}
            className="px-8 py-4 bg-primary-600 dark:bg-primary-500 text-white rounded-2xl hover:bg-primary-700 dark:hover:bg-primary-400 transition-all duration-300 flex items-center justify-center gap-3 font-black shadow-2xl shadow-primary-500/30 dark:shadow-none hover:-translate-y-1 group uppercase tracking-widest text-sm text-center"
          >
            <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
            YENİ ALAN EKLE
          </button>
        </div>

        {/* Filters & Search Card */}
        <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800 p-8 transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <LayoutGrid className="h-32 w-32 dark:text-white" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
            <div className="lg:col-span-6 relative group">
              <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
              <input
                type="text"
                placeholder="Alan adı, kod, QR kod veya oda bilgisi ile arama yapın..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-6 py-5 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary-500 dark:focus:border-primary-400 rounded-2xl text-gray-950 dark:text-white placeholder-gray-400 focus:bg-white dark:focus:bg-gray-800 transition-all duration-300 font-bold text-lg shadow-sm"
              />
            </div>
            <div className="lg:col-span-3 h-full">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-6 py-5 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary-500 dark:focus:border-primary-400 rounded-2xl text-gray-950 dark:text-white font-black uppercase tracking-widest text-[10px] focus:bg-white dark:focus:bg-gray-800 transition-all duration-300 cursor-pointer shadow-sm h-full"
              >
                <option value="">TÜM KATEGORİLER</option>
                <option value="Klinik Alan">🩺 KLİNİK ALAN</option>
                <option value="İdari Alan">💼 İDARİ ALAN</option>
                <option value="Teknik Alan">⚙️ TEKNİK ALAN</option>
                <option value="Destek Alan">🤝 DESTEK ALAN</option>
                <option value="Ortak Alan">🌍 ORTAK ALAN</option>
              </select>
            </div>
            <div className="lg:col-span-3 h-full">
              <select
                value={filterFacility}
                onChange={(e) => setFilterFacility(e.target.value)}
                className="w-full px-6 py-5 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary-500 dark:focus:border-primary-400 rounded-2xl text-gray-950 dark:text-white font-black uppercase tracking-widest text-[10px] focus:bg-white dark:focus:bg-gray-800 transition-all duration-300 cursor-pointer shadow-sm h-full"
              >
                <option value="">TÜM TESİSLER</option>
                {facilities.map(fac => (
                  <option key={fac.id} value={fac.id}>{fac.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Areas List Section */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-96 space-y-6">
            <div className="relative">
              <div className="h-20 w-20 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin"></div>
              <Map className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-indigo-500 animate-pulse" />
            </div>
            <p className="text-xl font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] animate-pulse text-center">Konum Verileri Yükleniyor...</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800 overflow-hidden transition-all duration-300">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800">
                <thead>
                  <tr className="bg-gray-50/50 dark:bg-gray-800/50">
                    <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase tracking-widest">ALAN KODU</th>
                    <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase tracking-widest">MAHAL BİLGİSİ</th>
                    <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase tracking-widest">QR / BARKOD</th>
                    <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase tracking-widest">KATEGORİ</th>
                    <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase tracking-widest">TESİS & KAT</th>
                    <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase tracking-widest">BOYUT</th>
                    <th className="px-8 py-6 text-right text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase tracking-widest">AKSİYONLAR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800 transition-colors">
                  {filteredAreas.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-8 py-32 text-center bg-gray-50/10 dark:bg-gray-800/10">
                        <div className="flex flex-col items-center justify-center space-y-4 opacity-30">
                          <Map className="h-16 w-16 text-gray-400" />
                          <p className="text-2xl font-black text-gray-400 uppercase tracking-widest text-center">Alan Bulunamadı</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredAreas.map((area) => (
                      <tr key={area.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-all duration-300 group">
                        <td className="px-8 py-6 whitespace-nowrap">
                          <span className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">#{area.area_code || '-'}</span>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-300">
                              <Map className="h-6 w-6" />
                            </div>
                            <div className="ml-5">
                              <div className="text-lg font-black text-gray-950 dark:text-white tracking-tight">{area.area_name}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">{area.room_info || 'Standart Birim'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="inline-flex items-center text-xs font-black text-gray-950 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 p-2 rounded-xl border border-gray-100 dark:border-gray-700">
                             <QrCode className="h-4 w-4 mr-2 text-primary-500" />
                             {area.qr_barcode || 'TANIMSIZ'}
                          </div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest w-fit shadow-sm ${getCategoryBadge(area.area_type_category).className}`}>
                            {getCategoryBadge(area.area_type_category).text}
                          </div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 font-medium">
                          <div className="font-black text-gray-950 dark:text-white tracking-tight">{area.facility_name || '-'}</div>
                          <div className="text-[11px] text-gray-500 dark:text-gray-400 uppercase tracking-widest font-black mt-1">
                            {area.floor_name || area.floor_number || 'Zemin Kat'}
                          </div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap text-right">
                          <div className="flex flex-col items-start">
                             <span className="text-lg font-black text-gray-950 dark:text-white tracking-tight">{area.area_size || '-'}</span>
                             <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">METREKARE</span>
                          </div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap text-right h-full">
                          <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 h-full">
                            <button
                              onClick={() => handleEditArea(area)}
                              className="p-2.5 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-400 dark:hover:text-white rounded-xl transition-all shadow-sm"
                              title="Düzenle"
                            >
                              <Edit2 className="h-5 w-5" />
                            </button>
                            <button 
                              onClick={() => navigate(`/eams/areas/${area.id}`)}
                              className="p-2.5 text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 hover:bg-gray-950 hover:text-white dark:hover:bg-white dark:hover:text-gray-950 rounded-xl transition-all shadow-sm"
                              title="Detay"
                            >
                              <Eye className="h-5 w-5" />
                            </button>
                            <button className="p-2.5 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                              <MoreVertical className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <AreaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
        editArea={editingArea}
      />
    </div>
  )
}

export default Areas
