import { useState, useEffect } from 'react'
import axios from 'axios'
import {
  Package,
  Wrench,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Calendar,
  Package2,
  ArrowRight,
  Activity,
  Clock
} from 'lucide-react'

const Dashboard = () => {
  const [stats, setStats] = useState({
    assets: 0,
    maintenance: 0,
    faultRequests: 0,
    completed: 0
  })
  const [recentActivities, setRecentActivities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [assetsRes, maintenanceRes, faultRes] = await Promise.all([
        axios.get('/api/eams/assets'),
        axios.get('/api/eams/maintenance/statistics'),
        axios.get('/api/eams/fault-requests/statistics/dashboard')
      ])

      setStats({
        assets: assetsRes.data.assets?.length || 0,
        maintenance: maintenanceRes.data.pending || 0,
        faultRequests: faultRes.data.pending || 0,
        completed: faultRes.data.completed || 0
      })

      setRecentActivities([
        {
          id: 1,
          type: 'maintenance',
          title: 'Periyodik Bakım Tamamlandı',
          description: 'Jeneratör bakımı başarıyla tamamlandı',
          time: '2 saat önce',
          status: 'completed'
        },
        {
          id: 2,
          type: 'fault',
          title: 'Yeni Arıza Talebi',
          description: 'Havalandırma sistemi arızası bildirildi',
          time: '4 saat önce',
          status: 'pending'
        },
        {
          id: 3,
          type: 'asset',
          title: 'Yeni Varlık Eklendi',
          description: 'Yeni klima santrali envantere eklendi',
          time: '1 gün önce',
          status: 'completed'
        }
      ])

      setLoading(false)
    } catch (error) {
      console.error('Dashboard data fetch error:', error)
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Toplam Varlık',
      value: stats.assets,
      icon: Package,
      gradient: 'from-blue-500 to-blue-600',
      lightBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      change: '+12%',
      changeType: 'increase',
      description: 'Kayıtlı varlık sayısı'
    },
    {
      title: 'Bekleyen Bakım',
      value: stats.maintenance,
      icon: Wrench,
      gradient: 'from-amber-500 to-orange-500',
      lightBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      change: '+5%',
      changeType: 'increase',
      description: 'Planlanmış bakım'
    },
    {
      title: 'Açık Arıza Talepleri',
      value: stats.faultRequests,
      icon: AlertTriangle,
      gradient: 'from-red-500 to-rose-600',
      lightBg: 'bg-red-50',
      iconColor: 'text-red-600',
      change: '-8%',
      changeType: 'decrease',
      description: 'Bekleyen arıza'
    },
    {
      title: 'Tamamlanan İşler',
      value: stats.completed,
      icon: CheckCircle,
      gradient: 'from-emerald-500 to-green-600',
      lightBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      change: '+15%',
      changeType: 'increase',
      description: 'Bu ay tamamlanan'
    }
  ]

  const quickActions = [
    {
      label: 'Arıza Bildir',
      description: 'Yeni arıza talebi oluştur',
      icon: AlertTriangle,
      gradient: 'from-red-500 to-rose-500',
      hoverBg: 'hover:bg-red-50',
      borderColor: 'border-red-100',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600'
    },
    {
      label: 'Bakım Planla',
      description: 'Periyodik bakım ekle',
      icon: Calendar,
      gradient: 'from-blue-500 to-indigo-500',
      hoverBg: 'hover:bg-blue-50',
      borderColor: 'border-blue-100',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      label: 'Varlık Ekle',
      description: 'Yeni varlık kaydı',
      icon: Package2,
      gradient: 'from-emerald-500 to-green-500',
      hoverBg: 'hover:bg-emerald-50',
      borderColor: 'border-emerald-100',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600'
    }
  ]

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-100 border-t-primary-600"></div>
        <p className="text-sm text-gray-500 animate-pulse">Veriler yükleniyor...</p>
      </div>
    )
  }

  const today = new Date().toLocaleDateString('tr-TR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  return (
    <div className="space-y-6 bg-gray-50 dark:bg-gray-950 min-h-screen transition-colors duration-200">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Genel Bakış</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {today}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2 shadow-sm">
          <Activity className="h-4 w-4 text-emerald-500 animate-pulse" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sistem Aktif</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((stat) => (
          <div
            key={stat.title}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-5 hover:shadow-md transition-all duration-300 group"
          >
            <div className="flex items-start justify-between">
              <div className={`p-3 rounded-xl ${stat.lightBg.replace('bg-', 'bg-').replace('50', '50')} dark:bg-opacity-10 group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
                stat.changeType === 'increase'
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                  : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              }`}>
                {stat.changeType === 'increase'
                  ? <TrendingUp className="h-3 w-3" />
                  : <TrendingDown className="h-3 w-3" />
                }
                {stat.change}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-1">{stat.title}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{stat.description}</p>
            </div>
            {/* Alt renkli çizgi */}
            <div className={`mt-4 h-1 rounded-full bg-gradient-to-r ${stat.gradient} opacity-60`}></div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Hızlı İşlemler</h2>
          <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">3 işlem</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.label}
              className={`group flex items-center justify-between p-4 border ${action.borderColor} dark:border-gray-800 rounded-xl ${action.hoverBg} dark:hover:bg-gray-800/50 transition-all duration-200 hover:shadow-sm hover:-translate-y-0.5`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${action.iconBg} group-hover:scale-110 transition-transform duration-200`}>
                  <action.icon className={`h-5 w-5 ${action.iconColor}`} />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{action.label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{action.description}</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 dark:text-gray-600 group-hover:translate-x-1 group-hover:text-gray-600 dark:group-hover:text-gray-400 transition-all duration-200" />
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Son Aktiviteler</h2>
          <button className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center gap-1 transition-colors">
            Tümünü Gör <ArrowRight className="h-3 w-3" />
          </button>
        </div>
        <div className="space-y-3">
          {recentActivities.map((activity, index) => (
            <div
              key={activity.id}
              className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200 group"
            >
              {/* İkon */}
              <div className={`p-2.5 rounded-xl flex-shrink-0 ${
                activity.type === 'maintenance' ? 'bg-blue-100 dark:bg-blue-900/30' :
                activity.type === 'fault' ? 'bg-red-100 dark:bg-red-900/30' :
                'bg-emerald-100 dark:bg-emerald-900/30'
              }`}>
                {activity.type === 'maintenance' && <Wrench className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
                {activity.type === 'fault' && <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />}
                {activity.type === 'asset' && <Package className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />}
              </div>

              {/* İçerik */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{activity.title}</p>
                  <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap flex items-center gap-1 flex-shrink-0">
                    <Clock className="h-3 w-3" />
                    {activity.time}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{activity.description}</p>
                <span className={`inline-flex items-center gap-1 mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  activity.status === 'completed'
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                    : 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    activity.status === 'completed' ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}></span>
                  {activity.status === 'completed' ? 'Tamamlandı' : 'Bekliyor'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}

export default Dashboard