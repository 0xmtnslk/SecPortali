import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { AlertTriangle, Plus, Filter, Search, X, Camera, Image as ImageIcon, MapPin, Check, MoreVertical, Clock, ShieldAlert, Wrench, ChevronDown } from 'lucide-react'
import { Html5QrcodeScanner } from 'html5-qrcode'

const FaultRequests = () => {
  const [faultRequests, setFaultRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterSeverity, setFilterSeverity] = useState('')
  
  // Create Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    facility_id: '',
    block_id: '',
    floor_id: '',
    area_id: '',
    asset_id: '',
    fault_type: '',
    severity: 'medium',
    priority: 'medium',
    title: '',
    description: '',
    attachments: null
  })
  
  // Options for Dropdowns
  const [facilities, setFacilities] = useState([])
  const [blocks, setBlocks] = useState([])
  const [floors, setFloors] = useState([])
  const [areas, setAreas] = useState([])
  const [assets, setAssets] = useState([])
  
  // QR Scanner State
  const [scannerOpen, setScannerOpen] = useState(false)
  const [manualQR, setManualQR] = useState('')
  
  // Auth Token
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchFaultRequests()
    fetchOptions()
    fetchAssets()
  }, [])

  const fetchFaultRequests = async () => {
    try {
      const response = await axios.get('/api/eams/fault-requests', { headers })
      setFaultRequests(response.data.fault_requests || [])
    } catch (error) {
      console.error('Error fetching fault requests:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const fetchOptions = async () => {
    try {
      const res = await axios.get('/api/eams/assets/form-options', { headers })
      setFacilities(res.data.facilities || [])
      setBlocks(res.data.blocks || [])
      setFloors(res.data.floors || [])
      setAreas(res.data.areas || [])
    } catch (err) {
      console.error(err)
    }
  }

  const fetchAssets = async () => {
    try {
      const res = await axios.get('/api/eams/assets?limit=1000', { headers })
      setAssets(res.data.assets || [])
    } catch (err) {
      console.error(err)
    }
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { text: 'Bekliyor', icon: Clock, className: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-800/50' },
      assigned: { text: 'Atandı', icon: ShieldAlert, className: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/50' },
      in_progress: { text: 'Devam Ediyor', icon: Wrench, className: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-800/50' },
      completed: { text: 'Tamamlandı', icon: Check, className: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/50' },
      cancelled: { text: 'İptal', icon: X, className: 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 border border-rose-100 dark:border-rose-800/50' }
    }
    const config = statusMap[status] || { text: status, icon: AlertTriangle, className: 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-400 border border-gray-100 dark:border-gray-700' }
    return config
  }

  const getSeverityBadge = (severity) => {
    const severityMap = {
      low: { text: 'Düşük', className: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' },
      medium: { text: 'Orta', className: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' },
      high: { text: 'Yüksek', className: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400' },
      critical: { text: 'Kritik', className: 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 shadow-sm shadow-rose-500/10 animate-pulse' }
    }
    return severityMap[severity] || { text: severity, className: 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-400' }
  }

  const filteredRequests = faultRequests.filter(request => {
    const matchesSearch = request.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.asset_name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !filterStatus || request.status === filterStatus
    const matchesSeverity = !filterSeverity || request.severity === filterSeverity
    return matchesSearch && matchesStatus && matchesSeverity
  })
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, attachments: e.target.files[0] })
    }
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post('/api/eams/fault-requests', formData, { headers })
      fetchFaultRequests()
      setIsModalOpen(false)
      setFormData({
        facility_id: '', block_id: '', floor_id: '', area_id: '', asset_id: '', 
        fault_type: '', severity: 'medium', priority: 'medium', title: '', description: '', attachments: null
      })
    } catch (err) {
      alert('Kayıt sırasında hata oluştu.')
    }
  }

  const performQRMatch = (code) => {
    const matchedAsset = assets.find(a => a.qr_barcode === code || a.asset_code === code);
    if (matchedAsset) {
      const matchedArea = areas.find(a => a.id === matchedAsset.area_id)
      const matchedFloor = floors.find(f => matchedArea && f.id === matchedArea.floor_id)
      const matchedBlock = blocks.find(b => matchedFloor && b.id === matchedFloor.block_id)

      setFormData(prev => ({
        ...prev,
        facility_id: matchedAsset.facility_id || (matchedBlock ? matchedBlock.facility_id : prev.facility_id),
        block_id: matchedBlock ? matchedBlock.id : prev.block_id,
        floor_id: matchedFloor ? matchedFloor.id : prev.floor_id,
        area_id: matchedAsset.area_id || prev.area_id,
        asset_id: matchedAsset.id
      }));
      return true;
    }
    const matchedArea = areas.find(a => a.area_code === code || a.id === code || a.qr_barcode === code);
    if (matchedArea) {
      const matchedFloor = floors.find(f => f.id === matchedArea.floor_id)
      const matchedBlock = blocks.find(b => matchedFloor && b.id === matchedFloor.block_id)
      
      setFormData(prev => ({
        ...prev,
        facility_id: matchedArea.facility_id || (matchedBlock ? matchedBlock.facility_id : prev.facility_id),
        block_id: matchedBlock ? matchedBlock.id : prev.block_id,
        floor_id: matchedFloor ? matchedFloor.id : prev.floor_id,
        area_id: matchedArea.id,
        asset_id: ''
      }));
      return true;
    }
    return false;
  }

  const handleManualQRSubmit = () => {
    if (!manualQR.trim()) return;
    const found = performQRMatch(manualQR.trim());
    if (found) {
      alert('QR ile konum / ekipman bulundu ve form dolduruldu!');
      setManualQR('');
    } else {
      alert('Bulunamadı: ' + manualQR);
    }
  }

  // QR Scanner Logic
  useEffect(() => {
    let scanner = null;
    if (scannerOpen) {
      scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: { width: 250, height: 250 } }, false);
      scanner.render(
        (decodedText) => {
          scanner.clear();
          setScannerOpen(false);
          const found = performQRMatch(decodedText);
          if (found) {
            alert('QR okundu, bilgiler otomatik dolduruldu.');
          } else {
            alert('Sistemde bulunamadı: ' + decodedText);
          }
        },
        (error) => { /* ignore */ }
      );
    }
    return () => {
      if (scanner) {
        scanner.clear().catch(e => console.error(e));
      }
    };
  }, [scannerOpen, assets, areas, floors, blocks]);

  const filteredBlocks = formData.facility_id ? blocks.filter(b => b.facility_id === formData.facility_id) : blocks
  const filteredFloors = formData.block_id ? floors.filter(f => f.block_id === formData.block_id) : floors
  const filteredAreas = formData.floor_id ? areas.filter(a => a.floor_id === formData.floor_id) : areas
  const filteredAssets = formData.area_id ? assets.filter(a => a.area_id === formData.area_id) : assets.filter(a => a.facility_id === formData.facility_id)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-8 transition-colors duration-500 animate-in fade-in">
      <div className="max-w-[1600px] mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-rose-600 text-white rounded-2xl shadow-xl shadow-rose-500/20">
                <AlertTriangle className="h-8 w-8" />
              </div>
              <h1 className="text-4xl font-black text-gray-950 dark:text-white tracking-tight uppercase tracking-widest">
                ARIZA TALEPLERİ
              </h1>
            </div>
            <p className="text-lg text-gray-500 dark:text-gray-400 font-medium">
              Sistem üzerindeki arıza bildirimlerini yönetin ve teknik servis sürecini takip edin.
            </p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="px-8 py-4 bg-primary-600 dark:bg-primary-500 text-white rounded-2xl hover:bg-primary-700 dark:hover:bg-primary-400 transition-all duration-300 flex items-center justify-center gap-3 font-black shadow-2xl shadow-primary-500/20 dark:shadow-none hover:-translate-y-1 group uppercase tracking-widest text-sm text-center">
            <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
            YENİ TALEP OLUŞTUR
          </button>
        </div>

        {/* Filters & Search Card */}
        <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800 p-8 transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Search className="h-32 w-32 dark:text-white" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
            <div className="lg:col-span-6 relative group">
              <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
              <input
                type="text"
                placeholder="Talep başlığı, ekipman veya mahal ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-6 py-5 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary-500 dark:focus:border-primary-400 rounded-2xl text-gray-950 dark:text-white placeholder-gray-400 focus:bg-white dark:focus:bg-gray-800 transition-all duration-300 font-bold text-lg shadow-sm"
              />
            </div>
            <div className="lg:col-span-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-6 py-5 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary-500 dark:focus:border-primary-400 rounded-2xl text-gray-950 dark:text-white font-black uppercase tracking-widest text-[10px] focus:bg-white dark:focus:bg-gray-800 transition-all duration-300 cursor-pointer shadow-sm"
              >
                <option value="">TÜM DURUMLAR</option>
                <option value="pending">⏳ BEKLEYENLER</option>
                <option value="assigned">🏷️ ATANANLAR</option>
                <option value="in_progress">⚙️ DEVAM EDENLER</option>
                <option value="completed">✅ TAMAMLANANLAR</option>
                <option value="cancelled">❌ İPTAL EDİLENLER</option>
              </select>
            </div>
            <div className="lg:col-span-3">
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="w-full px-6 py-5 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary-500 dark:focus:border-primary-400 rounded-2xl text-gray-950 dark:text-white font-black uppercase tracking-widest text-[10px] focus:bg-white dark:focus:bg-gray-800 transition-all duration-300 cursor-pointer shadow-sm"
              >
                <option value="">TÜM ÖNCELİKLER</option>
                <option value="low">🟢 DÜŞÜK</option>
                <option value="medium">🔵 ORTA</option>
                <option value="high">🟡 YÜKSEK</option>
                <option value="critical">🔴 KRİTİK</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data List Section */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-96 space-y-6">
            <div className="relative">
              <div className="h-20 w-20 rounded-full border-4 border-primary-500/20 border-t-primary-500 animate-spin"></div>
              <AlertTriangle className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-primary-500 animate-pulse" />
            </div>
            <p className="text-xl font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] animate-pulse text-center">Talep Verileri Yükleniyor...</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800 overflow-hidden transition-all duration-300">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800">
                <thead>
                  <tr className="bg-gray-50/50 dark:bg-gray-800/50">
                    <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase tracking-widest">TALEP NO</th>
                    <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase tracking-widest">BAŞLIK & KURUMSAL</th>
                    <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase tracking-widest">TESİS / VARLIK</th>
                    <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase tracking-widest">DURUM</th>
                    <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase tracking-widest">ÖNCELİK</th>
                    <th className="px-8 py-6 text-right text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase tracking-widest">TARİH</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800 transition-colors">
                  {filteredRequests.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-8 py-32 text-center bg-gray-50/10 dark:bg-gray-800/10">
                        <div className="flex flex-col items-center justify-center space-y-4 opacity-30">
                          <AlertTriangle className="h-16 w-16 text-gray-400" />
                          <p className="text-2xl font-black text-gray-400 uppercase tracking-widest text-center">Arıza Talebi Bulunamadı</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredRequests.map((request) => {
                      const statusConfig = getStatusBadge(request.status)
                      const StatusIcon = statusConfig.icon
                      const severityConfig = getSeverityBadge(request.severity)
                      return (
                        <tr key={request.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-all duration-300 group">
                          <td className="px-8 py-6 whitespace-nowrap">
                            <span className="text-sm font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider">#{request.request_number}</span>
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform duration-300">
                                <AlertTriangle className="h-6 w-6" />
                              </div>
                              <div className="ml-5">
                                <div className="text-lg font-black text-gray-950 dark:text-white tracking-tight">{request.title}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">{request.requested_by_name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 font-medium">
                            <div className="font-black text-gray-950 dark:text-white tracking-tight">{request.asset_name || '-'}</div>
                            <div className="text-[11px] text-gray-500 dark:text-gray-400 uppercase tracking-widest font-black mt-1">{request.facility_name}</div>
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap">
                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest ${statusConfig.className}`}>
                              <StatusIcon className="h-3.5 w-3.5" />
                              {statusConfig.text}
                            </div>
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap">
                            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${severityConfig.className}`}>
                              {severityConfig.text}
                            </div>
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap text-right h-full">
                            <div className="flex flex-col items-end">
                              <span className="text-sm font-black text-gray-950 dark:text-white tracking-tight">{new Date(request.created_at).toLocaleDateString('tr-TR')}</span>
                              <button className="mt-2 text-[10px] font-black text-primary-600 dark:text-primary-400 uppercase tracking-widest hover:underline opacity-0 group-hover:opacity-100 transition-opacity">
                                DETAYLARI GÖR
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

      {/* NEW REQUEST MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/60 backdrop-blur-md transition-all duration-300">
          <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl transition-all duration-300 transform scale-100 border border-white/50 dark:border-gray-800">
            <div className="flex items-center justify-between p-8 border-b border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/30">
              <div className="flex items-center gap-4">
                <div className="p-3.5 bg-rose-600 text-white rounded-2xl shadow-lg shadow-rose-500/20">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-gray-100 tracking-tight">Yeni Talep Oluştur</h3>
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-0.5">Arıza / Bakım Bildirim Formu</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-2xl transition-all text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 overflow-y-auto space-y-8">
              
              {/* QR Section */}
              <div className="bg-primary-50 dark:bg-primary-900/10 p-6 rounded-[2rem] border border-primary-100 dark:border-primary-900/30 transition-colors">
                 <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                   <h4 className="text-[10px] font-black text-primary-900 dark:text-primary-400 uppercase tracking-widest">Hızlı Konum / Ekipman Seçimi</h4>
                   <div className="flex items-center gap-3 w-full sm:w-auto">
                     <input 
                       type="text" 
                       placeholder="Manuel QR..." 
                       value={manualQR}
                       onChange={(e) => setManualQR(e.target.value)}
                       className="px-4 py-3 bg-white dark:bg-gray-800 border-2 border-transparent focus:border-primary-500 rounded-xl text-sm w-full sm:w-40 transition-all text-gray-900 dark:text-gray-100 font-bold placeholder-gray-400 shadow-sm"
                     />
                     <button type="button" onClick={handleManualQRSubmit} className="px-5 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-primary-500/20">
                       Bul
                     </button>
                     <button type="button" onClick={() => setScannerOpen(!scannerOpen)} className="px-5 py-3 bg-gray-950 dark:bg-gray-700 text-white rounded-xl hover:bg-gray-800 dark:hover:bg-gray-600 text-[10px] flex items-center whitespace-nowrap font-black uppercase tracking-widest transition-all shadow-lg">
                       <Camera className="h-4 w-4 mr-2"/> Okut
                     </button>
                   </div>
                 </div>
                 
                 {scannerOpen && (
                   <div className="mb-6 bg-white dark:bg-gray-950 p-4 rounded-2xl border-2 border-primary-100 dark:border-primary-900/30 overflow-hidden shadow-inner">
                     <div id="reader" className="w-full"></div>
                   </div>
                 )}
                 
                 {/* Hierarchical Location Section */}
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    <div className="col-span-1 lg:col-span-3">
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="h-4 w-4 text-primary-500" />
                        <h4 className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Konum & Ekipman Hiyerarşisi</h4>
                      </div>
                    </div>
                    <div>
                      <select required name="facility_id" value={formData.facility_id} onChange={handleChange} className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-gray-800 outline-none transition-all cursor-pointer">
                        <option value="">Tesis Seçiniz *</option>
                        {facilities.map(f => (<option key={f.id} value={f.id}>{f.name}</option>))}
                      </select>
                    </div>
                    <div>
                      <select name="block_id" value={formData.block_id} onChange={handleChange} className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-gray-800 outline-none transition-all disabled:opacity-50 cursor-pointer" disabled={!formData.facility_id}>
                        <option value="">Blok Seçiniz</option>
                        {filteredBlocks.map(b => (<option key={b.id} value={b.id}>{b.block_name}</option>))}
                      </select>
                    </div>
                    <div>
                      <select name="floor_id" value={formData.floor_id} onChange={handleChange} className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-gray-800 outline-none transition-all disabled:opacity-50 cursor-pointer" disabled={!formData.block_id}>
                        <option value="">Kat Seçiniz</option>
                        {filteredFloors.map(f => (<option key={f.id} value={f.id}>{f.floor_name}</option>))}
                      </select>
                    </div>
                    <div>
                      <select name="area_id" value={formData.area_id} onChange={handleChange} className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-gray-800 outline-none transition-all disabled:opacity-50 cursor-pointer" disabled={!formData.floor_id}>
                        <option value="">Mahal Seçiniz</option>
                        {filteredAreas.map(a => (<option key={a.id} value={a.id}>{a.area_name}</option>))}
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <select name="asset_id" value={formData.asset_id} onChange={handleChange} className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-gray-800 outline-none transition-all disabled:opacity-50 cursor-pointer" disabled={!formData.area_id && !formData.facility_id}>
                        <option value="">İlgili Ekipman (İsteğe Bağlı)</option>
                        {filteredAssets.map(a => (<option key={a.id} value={a.id}>{a.name} [{a.asset_code}]</option>))}
                      </select>
                    </div>
                 </div>
              </div>

              {/* Detail Section */}
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-1">Talep Tipi *</label>
                    <div className="relative">
                      <select required name="fault_type" value={formData.fault_type} onChange={handleChange} className="w-full px-4 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary-500 rounded-2xl text-gray-900 dark:text-white text-sm font-bold outline-none transition-all appearance-none cursor-pointer">
                        <option value="">(Seçiniz)</option>
                        <option value="Arıza">Arıza</option>
                        <option value="Bakım">Bakım</option>
                        <option value="Değişim">Değişim</option>
                        <option value="Yazılım Güncellemesi">Yazılım Güncellemesi</option>
                        <option value="Onarım">Onarım</option>
                        <option value="Diğer">Diğer</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-1">Öncelik Seviyesi *</label>
                    <div className="relative">
                      <select name="severity" value={formData.severity} onChange={handleChange} className="w-full px-4 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary-500 rounded-2xl text-gray-900 dark:text-white text-sm font-bold outline-none transition-all appearance-none cursor-pointer">
                        <option value="low">🟢 DÜŞÜK</option>
                        <option value="medium">🔵 ORTA</option>
                        <option value="high">🟡 YÜKSEK</option>
                        <option value="critical">🔴 KRİTİK (ACİL)</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 ml-1">Talep Başlığı *</label>
                  <input required name="title" value={formData.title} onChange={handleChange} className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary-500 rounded-2xl text-gray-950 dark:text-white text-lg font-black placeholder-gray-400 outline-none transition-all shadow-sm" placeholder="Arızayı tek cümlede özetleyin..." />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 ml-1">Detaylı Açıklama *</label>
                  <textarea required name="description" value={formData.description} onChange={handleChange} rows="3" className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary-500 rounded-2xl text-gray-950 dark:text-white text-sm font-bold outline-none transition-all placeholder-gray-400 resize-none shadow-sm" placeholder="Sorunu veya talebinizi detaylıca açıklayın..." />
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 ml-1">Fotoğraf / Ek Dosya</label>
                  <div className="mt-1 flex justify-center px-6 pt-10 pb-10 border-2 border-gray-200 dark:border-gray-800 border-dashed rounded-[2rem] bg-gray-50/30 dark:bg-gray-800/20 transition-all hover:bg-white dark:hover:bg-gray-800 group/upload">
                    <div className="space-y-3 text-center">
                      <div className="mx-auto h-20 w-20 bg-white dark:bg-gray-800 rounded-3xl shadow-sm flex items-center justify-center p-4 text-gray-400 group-hover/upload:text-primary-500 group-hover/upload:scale-110 transition-all duration-300 border border-gray-100 dark:border-gray-700">
                        <ImageIcon className="h-full w-full" />
                      </div>
                      <div className="flex text-sm text-gray-600 dark:text-gray-400 justify-center">
                        <label className="relative cursor-pointer bg-transparent rounded-md font-black text-primary-600 dark:text-primary-400 hover:text-primary-700 transition-colors">
                          <span>Dosya Seç</span>
                          <input type="file" className="sr-only" onChange={handleFileChange} />
                        </label>
                        <p className="pl-1 font-bold">veya sürükle bırak</p>
                      </div>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest font-black text-center">PNG, JPG, BMP max 10MB</p>
                    </div>
                  </div>
                  {formData.attachments && (
                    <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800 rounded-2xl text-xs text-emerald-700 dark:text-emerald-400 font-black uppercase tracking-widest flex items-center gap-3 animate-in fade-in zoom-in">
                       <Check className="h-4 w-4" />
                       Seçilen Dosya: {formData.attachments.name}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-10 flex flex-col sm:flex-row gap-4 pt-8 border-t border-gray-100 dark:border-gray-800">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-5 text-gray-700 dark:text-gray-300 font-black uppercase tracking-widest text-[10px] bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-2xl transition-all flex-1">
                  VAZGEÇ
                </button>
                <button type="submit" className="px-8 py-5 text-white font-black uppercase tracking-widest text-[10px] bg-primary-600 hover:bg-primary-700 rounded-2xl transition-all shadow-2xl shadow-primary-500/30 flex-[2]">
                  TALEBİ SİSTEME KAYDET
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default FaultRequests
