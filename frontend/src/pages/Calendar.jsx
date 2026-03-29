import { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import { 
  ChevronLeft, 
  ChevronRight, 
  Wrench, 
  AlertTriangle, 
  CalendarDays, 
  ClipboardCheck, 
  Settings, 
  Filter,
  ArrowRight,
  CheckCircle2,
  Clock,
  MoreVertical,
  Calendar as CalendarIcon,
  Search,
  LayoutGrid
} from 'lucide-react'

const Calendar = () => {
  const [events, setEvents] = useState([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState('month') // 'month', 'week', 'year'
  const [selectedDay, setSelectedDay] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState('all')

  const monthsList = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ]

  const weekDays = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']

  useEffect(() => {
    fetchEvents()
  }, [currentDate, viewMode])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      let start, end
      
      if (viewMode === 'month') {
        start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
        end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
      } else if (viewMode === 'week') {
        const curr = new Date(currentDate)
        const first = curr.getDate() - (curr.getDay() === 0 ? 6 : curr.getDay() - 1)
        start = new Date(curr.setDate(first))
        end = new Date(curr.setDate(first + 6))
      } else {
        start = new Date(currentDate.getFullYear(), 0, 1)
        end = new Date(currentDate.getFullYear(), 11, 31)
      }

      const response = await axios.get('/api/eams/calendar/range', {
        params: {
          start_date: start.toISOString().split('T')[0],
          end_date: end.toISOString().split('T')[0]
        }
      })

      setEvents(response.data || [])
      setLoading(false)
    } catch (error) {
      console.error('Error fetching calendar events:', error)
      setLoading(false)
    }
  }

  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  const getFirstDayOfMonth = (date) => {
    const day = new Date(date.getFullYear(), date.getMonth(), 1).getDay()
    return day === 0 ? 6 : day - 1
  }

  const navigateDate = (direction) => {
    const newDate = new Date(currentDate)
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + direction)
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction * 7))
    } else {
      newDate.setFullYear(newDate.getFullYear() + direction)
    }
    setCurrentDate(newDate)
    setSelectedDay(null)
  }

  const eventTypeConfig = {
    maintenance: {
      label: 'Bakım',
      bgColor: 'bg-blue-600',
      lightBgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-200',
      icon: Wrench
    },
    fault_request: {
      label: 'Arıza',
      bgColor: 'bg-rose-600',
      lightBgColor: 'bg-rose-50',
      textColor: 'text-rose-700',
      borderColor: 'border-rose-200',
      icon: AlertTriangle
    },
    periodic_check: {
      label: 'P. Kontrol',
      bgColor: 'bg-emerald-600',
      lightBgColor: 'bg-emerald-50',
      textColor: 'text-emerald-700',
      borderColor: 'border-emerald-200',
      icon: ClipboardCheck
    }
  }

  const filteredEvents = useMemo(() => {
    let result = events
    if (filterType !== 'all') {
      result = result.filter(e => e.type === filterType)
    }
    return result
  }, [events, filterType])

  const getDayEvents = (dateStr) => filteredEvents.filter(e => e.start_date === dateStr)

  const renderMonthView = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-40 bg-gray-50/50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800"></div>)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const dayEvents = getDayEvents(dateStr)
      const isToday = new Date().toISOString().split('T')[0] === dateStr
      const isSelected = selectedDay === day

      days.push(
        <div
          key={day}
          onClick={() => setSelectedDay(day)}
          className={`h-40 p-4 relative group transition-all duration-300 border cursor-pointer
            ${isSelected ? 'bg-primary-50/50 dark:bg-primary-900/10 ring-2 ring-primary-500 z-10 border-transparent shadow-xl' : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/60'}`}
        >
          <div className="flex justify-between items-start mb-3">
            <span className={`text-lg font-black w-10 h-10 flex items-center justify-center rounded-2xl transition-all
              ${isToday ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30 scale-110' : 'text-gray-950 dark:text-white group-hover:text-primary-600'}`}>
              {day}
            </span>
            {dayEvents.length > 0 && (
              <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-lg uppercase tracking-widest">
                {dayEvents.length} KAYIT
              </span>
            )}
          </div>
          
          <div className="space-y-1.5 overflow-hidden">
            {dayEvents.slice(0, 3).map((event, idx) => {
              const config = eventTypeConfig[event.type] || eventTypeConfig.maintenance
              return (
                <div key={idx} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-black truncate border shadow-sm ${config.lightBgColor} dark:bg-gray-800/80 ${config.textColor} dark:text-gray-200 ${config.borderColor} dark:border-gray-700/50`}>
                  <div className={`w-2 h-2 rounded-full ${config.bgColor}`}></div>
                  <span className="truncate uppercase tracking-tight">{event.title}</span>
                  {!event.is_planned && <Clock className="w-3.5 h-3.5 ml-auto text-amber-600 animate-pulse" />}
                </div>
              )
            })}
            {dayEvents.length > 3 && (
              <div className="text-[10px] text-gray-400 font-black pl-1 pt-1 italic uppercase tracking-widest">
                 + {dayEvents.length - 3} KAYIT DAHA...
              </div>
            )}
          </div>
        </div>
      )
    }
    return days
  }

  const renderWeekView = () => {
    const curr = new Date(currentDate)
    const first = curr.getDate() - (curr.getDay() === 0 ? 6 : curr.getDay() - 1)
    const weekDaysArr = []
    
    for (let i = 0; i < 7; i++) {
      const d = new Date(curr.setDate(first + i))
      weekDaysArr.push(new Date(d))
    }

    return (
      <div className="grid grid-cols-7 border-x border-gray-100 dark:border-gray-800">
        {weekDaysArr.map((date, idx) => {
          const dateStr = date.toISOString().split('T')[0]
          const dayEvents = getDayEvents(dateStr)
          const isToday = new Date().toISOString().split('T')[0] === dateStr

          return (
            <div key={idx} className={`min-h-[800px] border-r border-gray-100 dark:border-gray-800 last:border-r-0 ${isToday ? 'bg-primary-50/20 dark:bg-primary-900/10' : 'bg-white dark:bg-gray-900'}`}>
              <div className={`p-8 text-center border-b-2 transition-all duration-300
                ${isToday ? 'bg-primary-600 text-white border-primary-700 shadow-inner' : 'bg-gray-50/50 dark:bg-gray-850 text-gray-950 dark:text-white border-gray-100 dark:border-gray-800'}`}>
                <p className={`text-[10px] font-black uppercase tracking-[0.3em] ${isToday ? 'text-white/80' : 'text-gray-400 dark:text-gray-500'}`}>
                  {weekDays[idx]}
                </p>
                <p className="text-4xl font-black mt-2 leading-none tracking-tighter">{date.getDate()}</p>
              </div>
              
              <div className="p-4 space-y-4">
                {dayEvents.map((event, eIdx) => {
                  const config = eventTypeConfig[event.type] || eventTypeConfig.maintenance
                  const Icon = config.icon
                  return (
                    <div key={eIdx} className={`p-5 rounded-[2.5rem] border-2 bg-white dark:bg-gray-800 shadow-lg hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-500 group cursor-pointer
                      ${!event.is_planned ? 'border-amber-400 dark:border-amber-900/50 border-l-[8px]' : `border-gray-100 dark:border-gray-700 border-l-[8px] border-l-${config.bgColor.split('-')[1]}-600`}`}>
                      <div className="flex items-start justify-between">
                        <div className={`p-3 rounded-2xl ${config.lightBgColor} dark:bg-gray-700/50 border ${config.borderColor} dark:border-gray-600 shadow-sm transition-transform group-hover:scale-110`}>
                          <Icon className={`w-6 h-6 ${config.textColor} dark:text-gray-100`} />
                        </div>
                        <MoreVertical className="w-5 h-5 text-gray-300 dark:text-gray-600" />
                      </div>
                      <p className="text-lg font-black text-gray-950 dark:text-white mt-5 leading-tight uppercase tracking-tight">{event.title}</p>
                      <p className="text-[10px] font-black text-gray-500 dark:text-gray-400 mt-2 uppercase tracking-widest">{event.asset_code}</p>
                      
                      <div className="flex items-center gap-2 mt-5 pt-4 border-t border-gray-50 dark:border-gray-700/50">
                        {event.is_planned ? (
                          <span className="flex items-center gap-2 text-[9px] font-black text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-xl border border-emerald-100 dark:border-emerald-800/50 uppercase tracking-widest">
                             <CheckCircle2 className="w-3.5 h-3.5" /> PLANLI
                          </span>
                        ) : (
                          <span className="flex items-center gap-2 text-[9px] font-black text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-xl border border-amber-100 dark:border-amber-800/50 uppercase tracking-widest">
                             <Clock className="w-3.5 h-3.5 animate-spin-slow" /> PLAN BEKLİYOR
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-500 p-4 md:p-8">
      <div className="max-w-[1700px] mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 bg-gray-900 dark:bg-black rounded-[2.5rem] p-10 shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 right-0 p-12 opacity-5">
            <CalendarIcon className="h-64 w-64 text-white" />
          </div>
          <div className="flex items-center gap-8 relative z-10">
            <div className="p-6 bg-primary-600 rounded-[2.5rem] shadow-3xl shadow-primary-500/20 transform -rotate-3 border-4 border-gray-900 transition-transform hover:rotate-0 duration-500">
              <CalendarIcon className="w-14 h-14 text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-black text-white tracking-tighter mb-3 uppercase tracking-widest">VARLIK TAKVİMİ</h1>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-2 bg-emerald-500/20 text-emerald-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-emerald-500/30">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                  SİSTEM AKTİF
                </span>
                <span className="text-gray-400 text-sm font-bold opacity-80 border-l border-gray-700 pl-4">
                  Bakım ve periyodik kontrol yönetimi süreçleri kontrol altında.
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 relative z-10">
            <div className="bg-gray-800/50 backdrop-blur-md p-2 rounded-[2rem] flex border border-gray-700 shadow-2xl">
              {[
                { id: 'week', label: 'HAFTALIK' },
                { id: 'month', label: 'AYLIK' },
                { id: 'year', label: 'YILLIK' }
              ].map(mode => (
                <button
                  key={mode.id}
                  onClick={() => setViewMode(mode.id)}
                  className={`px-8 py-3.5 rounded-2xl text-[10px] font-black tracking-[0.2em] transition-all duration-300
                    ${viewMode === mode.id 
                      ? 'bg-primary-600 text-white shadow-xl shadow-primary-500/30 scale-105' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
            
            <button className="bg-gray-800/50 backdrop-blur-md hover:bg-gray-700 text-gray-400 hover:text-white p-5 rounded-[2rem] border border-gray-700 transition-all shadow-xl group">
              <Settings className="w-7 h-7 group-hover:rotate-90 transition-transform duration-500" />
            </button>
          </div>
        </div>

        {/* Stats & Filters Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-3 bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-800 flex items-center justify-between group hover:border-primary-500 transition-all duration-300">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-[10px] font-black uppercase tracking-widest mb-3">TOPLAM KAYIT</p>
              <h4 className="text-5xl font-black text-gray-950 dark:text-white leading-none tracking-tighter">{events.length}</h4>
            </div>
            <div className="w-20 h-20 bg-primary-50 dark:bg-primary-900/20 rounded-3xl flex items-center justify-center border border-primary-100 dark:border-primary-800 transition-transform group-hover:scale-110">
              <CalendarIcon className="w-10 h-10 text-primary-600" />
            </div>
          </div>
          
          <div className="lg:col-span-3 bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-800 flex items-center justify-between group hover:border-amber-500 transition-all duration-300">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-[10px] font-black uppercase tracking-widest mb-3">ATAMA BEKLEYEN</p>
              <h4 className="text-5xl font-black text-amber-600 dark:text-amber-500 leading-none tracking-tighter">{events.filter(e => !e.is_planned).length}</h4>
            </div>
            <div className="w-20 h-20 bg-amber-50 dark:bg-amber-900/20 rounded-3xl flex items-center justify-center border border-amber-100 dark:border-amber-800 transition-transform group-hover:scale-110">
              <Clock className="w-10 h-10 text-amber-600" />
            </div>
          </div>

          <div className="lg:col-span-6 bg-white dark:bg-gray-900 p-4 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center gap-6">
             <div className="flex-1 flex items-center gap-3 overflow-x-auto w-full scrollbar-hide px-4 py-2">
                {[
                  { id: 'all', label: 'TÜMÜ', bgColor: 'bg-gray-950 dark:bg-white', textColor: 'text-white dark:text-gray-950' },
                  { id: 'maintenance', label: 'BAKIMLAR', bgColor: 'bg-blue-600', textColor: 'text-white' },
                  { id: 'periodic_check', label: 'KONTROLLER', bgColor: 'bg-emerald-600', textColor: 'text-white' },
                  { id: 'fault_request', label: 'ARIZALAR', bgColor: 'bg-rose-600', textColor: 'text-white' }
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setFilterType(f.id)}
                    className={`px-8 py-4 rounded-[1.5rem] text-[10px] font-black whitespace-nowrap transition-all duration-300 border-2 uppercase tracking-[0.1em]
                      ${filterType === f.id 
                        ? `${f.bgColor} ${f.textColor} border-transparent shadow-xl scale-105` 
                        : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-750 border-gray-100 dark:border-gray-800'}`}
                  >
                    {f.label}
                  </button>
                ))}
             </div>
             <div className="hidden sm:block w-px h-16 bg-gray-100 dark:bg-gray-800"></div>
             <button className="w-full sm:w-auto flex items-center justify-center gap-4 px-10 py-5 bg-gray-950 dark:bg-white text-white dark:text-gray-950 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95 group">
               <Filter className="w-5 h-5 group-hover:scale-110 transition-transform" /> FİLTRELE
             </button>
          </div>
        </div>

        {/* Main Calendar Card */}
        <div className="bg-white dark:bg-gray-900 rounded-[3rem] shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden min-h-[900px] transition-all duration-500">
          {/* Calendar Controller */}
          <div className="px-10 py-12 bg-gray-50/50 dark:bg-gray-850 border-b border-gray-100 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-10">
            <div className="flex items-center gap-10">
              <h2 className="text-5xl font-black text-gray-950 dark:text-white tracking-tighter uppercase whitespace-nowrap">
                {viewMode === 'year' ? currentDate.getFullYear() : `${monthsList[currentDate.getUTCMonth()]} ${currentDate.getFullYear()}`}
              </h2>
              <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-2.5 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700">
                <button 
                   onClick={() => navigateDate(-1)} 
                   className="p-4 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-950 dark:text-white hover:text-primary-600 rounded-2xl transition-all">
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button 
                   onClick={() => setCurrentDate(new Date())}
                   className="px-10 py-3.5 text-[10px] font-black text-primary-700 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-600 hover:text-white rounded-xl transition-all uppercase tracking-[0.3em] border border-primary-100 dark:border-primary-900/30">
                   BUGÜN
                </button>
                <button 
                   onClick={() => navigateDate(1)} 
                   className="p-4 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-950 dark:text-white hover:text-primary-600 rounded-2xl transition-all">
                  <ChevronRight className="w-8 h-8" />
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-10 bg-white dark:bg-gray-800 px-10 py-5 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-6 h-6 rounded-xl bg-emerald-500 shadow-xl shadow-emerald-500/20 border-2 border-white dark:border-gray-900"></div>
                  <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">PLANLI SÜREÇLER</span>
                </div>
                <div className="w-px h-8 bg-gray-100 dark:border-gray-700"></div>
                <div className="flex items-center gap-4">
                  <div className="w-6 h-6 rounded-xl bg-amber-500 shadow-xl shadow-amber-500/20 border-2 border-white dark:border-gray-900"></div>
                  <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">AKSİYON BEKLEYEN</span>
                </div>
            </div>
          </div>

          {loading ? (
             <div className="flex flex-col items-center justify-center h-[700px] space-y-10">
                <div className="relative">
                  <div className="w-32 h-32 border-[10px] border-primary-50 dark:border-primary-900/20 border-t-primary-600 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <CalendarIcon className="w-12 h-12 text-primary-600 animate-pulse" />
                  </div>
                </div>
                <h3 className="text-2xl font-black text-gray-400 dark:text-gray-500 tracking-[0.5em] uppercase animate-pulse">VERİLER ANALİZ EDİLİYOR</h3>
             </div>
          ) : (
            <div className="animate-in fade-in duration-700">
              {viewMode === 'month' && (
                <div className="p-10">
                  <div className="grid grid-cols-7 mb-10 border-b-4 border-gray-100 dark:border-gray-800">
                    {weekDays.map((d, i) => (
                      <div key={d} className={`text-center py-6 text-[10px] font-black uppercase tracking-[0.4em] ${i >= 5 ? 'text-rose-500 bg-rose-50/30 dark:bg-rose-900/10' : 'text-gray-400 dark:text-gray-500'}`}>
                        {d}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 border-t border-l border-gray-100 dark:border-gray-800 shadow-3xl overflow-hidden rounded-[3rem]">
                    {renderMonthView()}
                  </div>
                </div>
              )}
              {viewMode === 'week' && renderWeekView()}
              {viewMode === 'year' && (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-10 p-12">
                  {monthsList.map((m, idx) => {
                    const monthEvents = events.filter(e => new Date(e.start_date).getMonth() === idx)
                    return (
                      <div 
                        key={m} 
                        onClick={() => { setViewMode('month'); setCurrentDate(new Date(currentDate.getFullYear(), idx, 1)); }}
                        className="p-12 rounded-[3.5rem] bg-gray-50/50 dark:bg-gray-850 border-4 border-gray-100 dark:border-gray-800 hover:border-primary-600 dark:hover:border-primary-500 hover:bg-white dark:hover:bg-gray-800 hover:shadow-3xl transition-all duration-500 cursor-pointer group flex flex-col items-center text-center"
                      >
                        <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-[2rem] shadow-xl flex items-center justify-center mb-8 border border-gray-100 dark:border-gray-700 group-hover:bg-primary-600 group-hover:scale-110 transition-all duration-500">
                           <span className="text-2xl font-black text-gray-400 dark:text-gray-500 group-hover:text-white uppercase tracking-tighter">{m.substring(0,3)}</span>
                        </div>
                        <h4 className="text-4xl font-black text-gray-950 dark:text-white uppercase tracking-tighter mb-8 tracking-widest">{m}</h4>
                        <div className="w-full space-y-5">
                          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 font-black text-[10px] uppercase tracking-widest">
                            <span>TOPLAM KAYIT</span>
                            <span className="text-gray-950 dark:text-white text-2xl">{monthEvents.length}</span>
                          </div>
                          <div className="w-full h-5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden p-1 border border-white dark:border-gray-700 shadow-inner">
                            <div 
                              className="h-full bg-primary-600 rounded-full shadow-lg transition-all duration-1000" 
                              style={{ width: `${Math.min(100, (monthEvents.length / 20) * 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Selected Day Details Panel */}
        {viewMode === 'month' && selectedDay && (
          <div className="bg-gray-950 dark:bg-black rounded-[4rem] p-12 shadow-3xl animate-in slide-in-from-bottom-10 duration-700 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-5">
              <LayoutGrid className="h-64 w-64 text-white" />
            </div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 mb-14 border-b border-gray-800 pb-12 relative z-10">
              <div className="flex items-center gap-8">
                <div className="w-28 h-28 bg-primary-600 rounded-[2.5rem] flex items-center justify-center text-5xl font-black text-white shadow-3xl shadow-primary-600/30 border-4 border-gray-900 group-hover:rotate-6 transition-transform">
                  {selectedDay}
                </div>
                <div>
                   <h3 className="text-6xl font-black text-white tracking-tighter uppercase whitespace-nowrap">
                    {monthsList[currentDate.getUTCMonth()]} {currentDate.getFullYear()}
                  </h3>
                  <p className="text-primary-400 font-black text-sm uppercase tracking-[0.6em] mt-3">GÜNLÜK PERSONEL VE SİSTEM AJANDASI</p>
                </div>
              </div>
              <button 
                 onClick={() => setSelectedDay(null)} 
                 className="self-start md:self-center bg-gray-800 hover:bg-gray-700 text-white p-6 rounded-[2rem] transition-all shadow-xl border border-gray-700 hover:scale-110 active:scale-95">
                <ChevronRight className="w-10 h-10 rotate-90" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 relative z-10">
              {getDayEvents(`${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`).map((event, idx) => {
                const config = eventTypeConfig[event.type] || eventTypeConfig.maintenance
                const Icon = config.icon
                return (
                  <div key={idx} className={`p-10 rounded-[3.5rem] transition-all duration-500 transform hover:-translate-y-3 border-2 
                    ${event.is_planned 
                      ? 'bg-gray-900 border-gray-800 shadow-3xl hover:bg-gray-800/80' 
                      : 'bg-gradient-to-br from-amber-600/20 to-amber-900/40 border-amber-600/30 shadow-3xl animate-pulse-custom'}`}>
                    
                    <div className="flex items-start justify-between mb-10">
                      <div className={`p-6 rounded-[2rem] ${config.bgColor} shadow-3xl shadow-black/60 transition-transform group-hover:scale-110`}>
                        <Icon className="w-12 h-12 text-white" />
                      </div>
                      {!event.is_planned && (
                        <div className="bg-white text-amber-600 px-8 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl flex items-center gap-2">
                           <AlertTriangle className="w-4 h-4" /> ATAMA GEREKLİ
                        </div>
                      )}
                    </div>
                    
                    <h5 className="text-3xl font-black text-white leading-[1.1] mb-5 uppercase tracking-tighter">{event.title}</h5>
                    <div className="flex flex-col gap-3 mb-12">
                       <span className="text-gray-400 font-black text-[10px] tracking-widest uppercase opacity-70 border-b border-gray-800 pb-2 w-fit">REF NO: {event.asset_code}</span>
                       <span className="text-gray-100 font-black text-xl uppercase tracking-tight">{event.asset_name}</span>
                    </div>
                    
                    <div className="flex items-center justify-between pt-10 border-t border-gray-800">
                       <div className="flex items-center gap-4">
                        <div className={`w-4 h-4 rounded-full ${config.bgColor} shadow-lg shadow-black/80 ring-4 ring-gray-900`}></div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">{config.label}</span>
                      </div>
                      <button className="flex items-center gap-3 bg-white text-gray-950 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-600 hover:text-white transition-all duration-300 shadow-3xl active:scale-95">
                        İNCELE <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )
              })}
              
              {getDayEvents(`${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`).length === 0 && (
                <div className="col-span-full py-40 bg-gray-900/40 rounded-[4rem] border-4 border-dashed border-gray-800 flex flex-col items-center">
                   <div className="w-40 h-40 bg-gray-900 shadow-3xl rounded-[3rem] flex items-center justify-center mb-10 border border-gray-800">
                      <Search className="w-16 h-16 text-gray-700" />
                   </div>
                   <p className="text-2xl font-black text-gray-600 uppercase tracking-[0.6em] text-center">BU TARİH İÇİN KAYITLI VERİ YOK</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        
        @keyframes pulse-custom {
          0%, 100% { border-color: rgba(245, 158, 11, 0.2); }
          50% { border-color: rgba(245, 158, 11, 0.6); box-shadow: 0 0 50px rgba(245, 158, 11, 0.15); }
        }

        .animate-pulse-custom {
          animation: pulse-custom 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default Calendar