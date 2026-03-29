import { useState, useEffect } from 'react'
import axios from 'axios'
import { Wrench, Calendar, Plus, Filter, Search, MoreVertical, Clock, CheckCircle2, AlertCircle } from 'lucide-react'

const Maintenance = () => {
  const [maintenanceRecords, setMaintenanceRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  useEffect(() => {
    fetchMaintenanceRecords()
  }, [])

  const fetchMaintenanceRecords = async () => {
    try {
      const response = await axios.get('/api/eams/maintenance/records')
      setMaintenanceRecords(response.data.maintenance_records || [])
      setLoading(false)
    } catch (error) {
      console.error('Error fetching maintenance records:', error)
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { text: 'Bekliyor', icon: Clock, className: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-800/50' },
      in_progress: { text: 'Devam Ediyor', icon: Wrench, className: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-800/50' },
      completed: { text: 'Tamamlandı', icon: CheckCircle2, className: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/50' },
      cancelled: { text: 'İptal', icon: AlertCircle, className: 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 border border-rose-100 dark:border-rose-800/50' }
    }
    const config = statusMap[status] || { text: status, icon: AlertCircle, className: 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-400 border border-gray-100 dark:border-gray-700' }
    return config
  }

  const filteredRecords = maintenanceRecords.filter(record => {
    const matchesSearch = record.asset_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.maintenance_type_name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !filterStatus || record.status === filterStatus
    return matchesSearch && matchesStatus
  })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-8 transition-colors duration-500 animate-in fade-in">
      <div className="max-w-[1600px] mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-primary-600 text-white rounded-2xl shadow-xl shadow-primary-500/20">
                <Wrench className="h-8 w-8" />
              </div>
              <h1 className="text-4xl font-black text-gray-950 dark:text-white tracking-tight uppercase tracking-widest">
                BAKIM YÖNETİMİ
              </h1>
            </div>
            <p className="text-lg text-gray-500 dark:text-gray-400 font-medium">
              Varlıkların periyodik bakımlarını ve teknik servis kayıtlarını takip edin.
            </p>
          </div>
          <button className="px-8 py-4 bg-primary-600 dark:bg-primary-500 text-white rounded-2xl hover:bg-primary-700 dark:hover:bg-primary-400 transition-all duration-300 flex items-center justify-center gap-3 font-black shadow-2xl shadow-primary-500/20 dark:shadow-none hover:-translate-y-1 group">
            <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
            YENİ BAKIM PLANI OLUŞTUR
          </button>
        </div>

        {/* Filters & Search Card */}
        <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800 p-8 transition-all duration-300 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Filter className="h-32 w-32 dark:text-white" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
            <div className="lg:col-span-8 relative group">
              <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
              <input
                type="text"
                placeholder="Varlık adı, kodu veya bakım türü ile arama yapın..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-6 py-5 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary-500 dark:focus:border-primary-400 rounded-2xl text-gray-950 dark:text-white placeholder-gray-400 focus:bg-white dark:focus:bg-gray-800 transition-all duration-300 font-bold text-lg shadow-sm"
              />
            </div>
            <div className="lg:col-span-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-6 py-5 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary-500 dark:focus:border-primary-400 rounded-2xl text-gray-950 dark:text-white font-black uppercase tracking-widest text-xs focus:bg-white dark:focus:bg-gray-800 transition-all duration-300 cursor-pointer shadow-sm"
              >
                <option value="">TÜM DURUMLAR</option>
                <option value="pending">⏳ BEKLEYENLER</option>
                <option value="in_progress">⚙️ DEVAM EDENLER</option>
                <option value="completed">✅ TAMAMLANANLAR</option>
                <option value="cancelled">❌ İPTAL EDİLENLER</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data List Section */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-96 space-y-6">
            <div className="relative">
              <div className="h-20 w-20 rounded-full border-4 border-primary-500/20 border-t-primary-500 animate-spin"></div>
              <Wrench className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-primary-500 animate-pulse" />
            </div>
            <p className="text-xl font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] animate-pulse">Bakım Verileri Yükleniyor...</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800 overflow-hidden transition-all duration-300">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800">
                <thead>
                  <tr className="bg-gray-50/50 dark:bg-gray-800/50">
                    <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                      VARLIK & EKİPMAN BİLGİSİ
                    </th>
                    <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                      BAKIM OPERASYONU
                    </th>
                    <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                      PLANLANAN TARİH
                    </th>
                    <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                      GÜNCEL DURUM
                    </th>
                    <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                      ÖNCELİK
                    </th>
                    <th className="px-8 py-6 text-right text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                      AKSİYONLAR
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800 transition-colors">
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-8 py-32 text-center bg-gray-50/10 dark:bg-gray-800/10">
                        <div className="flex flex-col items-center justify-center space-y-4 opacity-30">
                          <Wrench className="h-16 w-16 text-gray-400" />
                          <p className="text-2xl font-black text-gray-400 uppercase tracking-widest">Kayıt Bulunamadı</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((record) => {
                      const status = getStatusBadge(record.status)
                      const StatusIcon = status.icon
                      return (
                        <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-all duration-300 group">
                          <td className="px-8 py-6 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="relative">
                                <div className="p-3.5 rounded-2xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform duration-300">
                                  <Wrench className="h-6 w-6" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
                              </div>
                              <div className="ml-5">
                                <div className="text-lg font-black text-gray-950 dark:text-white tracking-tight">{record.asset_name}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">{record.asset_code}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap">
                           <div className="text-sm font-bold text-gray-900 dark:text-gray-200 bg-gray-50 dark:bg-gray-800/50 px-3 py-1.5 rounded-xl border border-gray-100 dark:border-gray-700 w-fit">
                            {record.maintenance_type_name}
                           </div>
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap">
                            <div className="flex items-center text-sm font-black text-gray-950 dark:text-white tracking-tight bg-gray-50 dark:bg-gray-800/30 px-3 py-2 rounded-xl w-fit">
                              <Calendar className="h-4 w-4 text-primary-500 mr-2.5" />
                              {record.scheduled_date}
                            </div>
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap">
                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest ${status.className}`}>
                              <StatusIcon className="h-3.5 w-3.5" />
                              {status.text}
                            </div>
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              {[1, 2, 3].map((star) => (
                                <div 
                                  key={star} 
                                  className={`h-2.5 w-2.5 rounded-full ${star <= (record.priority === 'High' ? 3 : record.priority === 'Medium' ? 2 : 1) ? 'bg-primary-500 shadow-sm shadow-primary-500/50' : 'bg-gray-200 dark:bg-gray-700'}`}
                                ></div>
                              ))}
                              <span className="ml-2 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">{record.priority}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                              <button className="p-2.5 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-400 dark:hover:text-white rounded-xl transition-all shadow-sm">
                                <MoreVertical className="h-5 w-5" />
                              </button>
                              <button className="px-6 py-2.5 bg-gray-950 dark:bg-white text-white dark:text-gray-950 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-gray-200 dark:shadow-none">
                                DETAYLI İNCELE
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Maintenance

