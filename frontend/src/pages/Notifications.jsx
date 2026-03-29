import { useState, useEffect } from 'react'
import axios from 'axios'
import { Bell, Check, Trash2, Filter } from 'lucide-react'

const Notifications = () => {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('/api/eams/notifications')
      setNotifications(response.data.notifications || [])
      setUnreadCount(response.data.unread_count || 0)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching notifications:', error)
      setLoading(false)
    }
  }

  const markAsRead = async (id) => {
    try {
      await axios.put(`/api/eams/notifications/${id}/read`)
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, is_read: true } : n
      ))
      setUnreadCount(Math.max(0, unreadCount - 1))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await axios.put('/api/eams/notifications/read-all')
      setNotifications(notifications.map(n => ({ ...n, is_read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const deleteNotification = async (id) => {
    try {
      await axios.delete(`/api/eams/notifications/${id}`)
      setNotifications(notifications.filter(n => n.id !== id))
      if (notifications.find(n => n.id === id)?.is_read === false) {
        setUnreadCount(Math.max(0, unreadCount - 1))
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  const getNotificationIcon = (type) => {
    const iconMap = {
      maintenance: 'bg-primary-100 text-primary-600',
      fault_request: 'bg-danger-100 text-danger-600',
      system: 'bg-secondary-100 text-secondary-600',
      contractor: 'bg-success-100 text-success-600'
    }
    return iconMap[type] || 'bg-gray-100 text-gray-600'
  }

  const getNotificationTypeText = (type) => {
    const typeMap = {
      maintenance: 'Bakım',
      fault_request: 'Arıza Talebi',
      system: 'Sistem',
      contractor: 'Taşeron'
    }
    return typeMap[type] || type
  }

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true
    if (filter === 'unread') return !n.is_read
    if (filter === 'read') return n.is_read
    return true
  })

  return (
    <div className="space-y-6 bg-gray-50 dark:bg-gray-950 min-h-screen transition-colors duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight flex items-center gap-3">
             <Bell className="h-8 w-8 text-primary-500" />
             Bildirimler
          </h1>
          <p className="text-base text-gray-500 dark:text-gray-400 mt-2 font-medium">
            {unreadCount > 0 ? `${unreadCount} okunmamış bildirim bulunuyor` : 'Tüm bildirimler okundu'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="px-6 py-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest shadow-lg shadow-primary-500/20 hover:-translate-y-0.5"
          >
            <Check className="h-4 w-4" />
            Tümünü Okundu İşaretle
          </button>
        )}
      </div>

      {/* Filter */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800 p-6 transition-colors duration-200">
        <div className="flex items-center gap-6">
          <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-2xl text-gray-400">
            <Filter className="h-5 w-5" />
          </div>
          <div className="flex gap-3">
            {[
              { id: 'all', label: 'Tümü' },
              { id: 'unread', label: 'Okunmamış' },
              { id: 'read', label: 'Okunmuş' }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setFilter(t.id)}
                className={`px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                  filter === t.id 
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20' 
                    : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-100 dark:border-primary-900/30 border-t-primary-600"></div>
          <p className="text-sm text-gray-500 dark:text-gray-400 animate-pulse">Veriler yükleniyor...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 text-center py-12 transition-colors duration-200">
              <Bell className="h-16 w-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Bildirim bulunamadı</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`group bg-white dark:bg-gray-900 rounded-3xl shadow-xl shadow-gray-200/30 dark:shadow-none border border-gray-100 dark:border-gray-800 p-8 hover:shadow-2xl transition-all duration-300 relative overflow-hidden ${
                  !notification.is_read ? 'border-l-4 border-l-primary-500 bg-primary-50/20 dark:bg-primary-900/10' : ''
                }`}
              >
                <div className="flex items-start gap-6">
                  <div className={`p-4 rounded-2xl shrink-0 shadow-lg ${
                    notification.notification_type === 'maintenance' ? 'bg-primary-500 text-white shadow-primary-500/20' :
                    notification.notification_type === 'fault_request' ? 'bg-rose-500 text-white shadow-rose-500/20' :
                    notification.notification_type === 'system' ? 'bg-amber-500 text-white shadow-amber-500/20' :
                    notification.notification_type === 'contractor' ? 'bg-emerald-500 text-white shadow-emerald-500/20' :
                    'bg-gray-500 text-white shadow-gray-500/20'
                  }`}>
                    <Bell className="h-7 w-7" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                           <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-xl ${
                             notification.notification_type === 'maintenance' ? 'bg-primary-100/50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' :
                             notification.notification_type === 'fault_request' ? 'bg-rose-100/50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400' :
                             notification.notification_type === 'system' ? 'bg-amber-100/50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' :
                             notification.notification_type === 'contractor' ? 'bg-emerald-100/50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' :
                             'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                           }`}>
                             {getNotificationTypeText(notification.notification_type)}
                           </span>
                           <span className="text-xs font-bold text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
                              <Activity className="h-3 w-3" />
                              {new Date(notification.created_at).toLocaleString('tr-TR')}
                           </span>
                        </div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-gray-100 tracking-tight leading-tight">
                          {notification.title}
                        </h3>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!notification.is_read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="p-3 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-2xl hover:bg-primary-600 hover:text-white transition-all shadow-lg shadow-primary-500/10"
                            title="Okundu işaretle"
                          >
                            <Check className="h-5 w-5" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="p-3 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-2xl hover:bg-rose-600 hover:text-white transition-all shadow-lg shadow-rose-500/10"
                          title="Sil"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-base text-gray-600 dark:text-gray-400 mt-4 font-medium leading-relaxed">
                      {notification.message}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default Notifications
