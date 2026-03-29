import { useState, useMemo } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import {
  LayoutDashboard,
  Wrench,
  AlertTriangle,
  Package,
  Map,
  Calendar,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  Users,
  Building2,
  FileText,
  ClipboardCheck,
  Home,
  ShieldAlert,
  HeartPulse,
  Leaf,
  BarChart3,
  Scale,
  Zap,
  Building,
  Sun,
  Moon
} from 'lucide-react'

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()

  // Find active module from path
  const activeModule = useMemo(() => {
    const path = location.pathname
    if (path.startsWith('/eams')) return 'eams'
    if (path.startsWith('/cms')) return 'cms'
    if (path.startsWith('/aums')) return 'aums'
    if (path.startsWith('/ohs')) return 'ohs'
    if (path.startsWith('/health')) return 'health'
    if (path.startsWith('/env')) return 'env'
    if (path.startsWith('/sus')) return 'sus'
    if (path.startsWith('/settings')) return 'admin'
    return 'eams' // default
  }, [location.pathname])

  const moduleInfo = {
    eams: { name: 'Varlık Yönetimi', icon: Package, color: 'text-blue-600' },
    cms: { name: 'Taşeron Yönetimi', icon: Users, color: 'text-indigo-600' },
    aums: { name: 'Denetim Yönetimi', icon: ClipboardCheck, color: 'text-amber-600' },
    ohs: { name: 'İş Güvenliği', icon: ShieldAlert, color: 'text-red-600' },
    health: { name: 'İş Sağlığı', icon: HeartPulse, color: 'text-pink-600' },
    env: { name: 'Çevre Yönetimi', icon: Leaf, color: 'text-green-600' },
    sus: { name: 'Sürdürülebilirlik', icon: BarChart3, color: 'text-teal-600' },
    admin: { name: 'Sistem Yönetimi', icon: Settings, color: 'text-gray-700' },
  }

  const currentModule = moduleInfo[activeModule]

  const hasRole = (roles) => {
    if (!user?.roles) return false
    if (typeof roles === 'string') return user.roles.includes(roles)
    return roles.some(role => user.roles.includes(role))
  }

  const navigationItems = {
    eams: [
      { name: 'Dashboard', href: '/eams/dashboard', icon: LayoutDashboard, roles: ['Admin', 'Manager', 'User', 'Technical Responsible', 'Administrative Responsible', 'Biomedical Responsible', 'Information Systems Responsible', 'Hospital Manager', 'Central Manager'] },
      { name: 'Bakım & Periyodik Kontrol', href: '/eams/maintenance', icon: Wrench, roles: ['Admin', 'Technical Responsible', 'Administrative Responsible', 'Biomedical Responsible', 'Information Systems Responsible', 'Manager', 'Hospital Manager', 'Central Manager'] },
      { name: 'Arıza Talep', href: '/eams/fault-requests', icon: AlertTriangle, roles: ['Admin', 'User', 'Technical Responsible', 'Administrative Responsible', 'Biomedical Responsible', 'Information Systems Responsible', 'Manager', 'Hospital Manager', 'Central Manager'] },
      { name: 'Varlık Envanteri', href: '/eams/assets', icon: Package, roles: ['Admin', 'Technical Responsible', 'Administrative Responsible', 'Biomedical Responsible', 'Information Systems Responsible', 'Manager', 'Hospital Manager', 'Central Manager'] },
      { name: 'Alan-Mahal', href: '/eams/areas', icon: Map, roles: ['Admin', 'Technical Responsible', 'Administrative Responsible', 'Biomedical Responsible', 'Information Systems Responsible', 'Manager', 'Hospital Manager', 'Central Manager'] },
      { name: 'Takvim', href: '/eams/calendar', icon: Calendar, roles: ['Admin', 'Technical Responsible', 'Administrative Responsible', 'Biomedical Responsible', 'Information Systems Responsible', 'Manager', 'Hospital Manager', 'Central Manager'] },
      { name: 'Bildirimler', href: '/eams/notifications', icon: Bell, roles: ['Admin', 'User', 'Technical Responsible', 'Administrative Responsible', 'Biomedical Responsible', 'Information Systems Responsible', 'Manager', 'Hospital Manager', 'Central Manager'] },
    ],
    cms: [
      { name: 'Dashboard', href: '/cms/dashboard', icon: LayoutDashboard, roles: ['Admin', 'Manager'] },
      { name: 'Yükleniciler', href: '/cms/contractors', icon: Users, roles: ['Admin', 'Manager'] },
      { name: 'Kontrol Listeleri', href: '/cms/checklists', icon: ClipboardCheck, roles: ['Admin', 'Manager'] },
    ],
    // Placeholders for other modules
    aums: [
      { name: 'Denetim Dashboard', href: '/aums/dashboard', icon: LayoutDashboard, roles: ['Admin'] },
    ],
    ohs: [
      { name: 'Güvenlik Dashboard', href: '/ohs/dashboard', icon: LayoutDashboard, roles: ['Admin'] },
    ],
    health: [
      { name: 'Sağlık Dashboard', href: '/health/dashboard', icon: LayoutDashboard, roles: ['Admin'] },
    ],
    env: [
      { name: 'Çevre Dashboard', href: '/env/dashboard', icon: LayoutDashboard, roles: ['Admin'] },
    ],
    sus: [
      { name: 'Sürdürülebilirlik', href: '/sus/dashboard', icon: LayoutDashboard, roles: ['Admin'] },
    ],
    admin: [
      { name: 'Genel Ayarlar', href: '/settings/general', icon: Settings, roles: ['Admin', 'Central Manager'] },
      { name: 'Kullanıcılar', href: '/settings/users', icon: Users, roles: ['Admin', 'Central Manager'] },
      { name: 'Tesis Yönetimi', href: '/settings/facilities', icon: Building2, roles: ['Admin', 'Central Manager'] },
      { name: 'Rol Yönetimi', href: '/settings/roles', icon: ShieldAlert, roles: ['Admin', 'Central Manager'] },
      { name: 'Bildirim Ayarları', href: '/settings/notifications', icon: Bell, roles: ['Admin', 'Central Manager'] },
    ]
  }

  const settingsItems = {
    eams: [
      { name: 'Tesis Haritaları & Yerleşim', href: '/eams/settings/facilities', icon: Map, roles: ['Admin', 'Central Manager'] },
      { name: 'Ekipman Kategorileri', href: '/eams/settings/categories', icon: Package, roles: ['Admin', 'Central Manager'] },
      { name: 'Ekipman Cinsi Ayarları', href: '/eams/settings/equipment-hierarchy', icon: FileText, roles: ['Admin', 'Central Manager', 'Hospital Manager', 'Manager', 'Administrative Responsible', 'Technical Responsible'] },
      { name: 'Bakım Kontrol Ayarları', href: '/eams/settings/checklist-settings', icon: ClipboardCheck, roles: ['Admin', 'Manager', 'Hospital Manager', 'Central Manager', 'Technical Responsible'] },
      { name: 'Alan Türleri', href: '/eams/settings/area-types', icon: Map, roles: ['Admin', 'Central Manager'] },
      { name: 'Ölçü Birimleri', href: '/eams/settings/measurement-units', icon: Scale, roles: ['Admin', 'Central Manager'] },
      { name: 'Enerji Türleri', href: '/eams/settings/energy-types', icon: Zap, roles: ['Admin', 'Central Manager'] },
      { name: 'Yetkili Departmanlar', href: '/eams/settings/departments', icon: Building, roles: ['Admin', 'Central Manager'] },
      { name: 'Modül Ayarları', href: '/eams/settings/general', icon: Settings, roles: ['Admin'] },
    ],
    cms: [
      { name: 'Firma Kategorileri', href: '/cms/settings/categories', icon: Settings, roles: ['Admin'] },
    ],
    ohs: [],
    health: [],
    env: [],
    sus: [],
    aums: []
  }

  const filteredNavigation = (navigationItems[activeModule] || []).filter(item => hasRole(item.roles))
  const filteredSettings = (settingsItems[activeModule] || []).filter(item => hasRole(item.roles))

  const isActive = (href) => {
    return location.pathname === href || location.pathname.startsWith(href + '/')
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 uppercase-headings transition-colors duration-200">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } border-r border-gray-200 dark:border-gray-800`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
            <div className="flex items-center">
              <currentModule.icon className={`h-8 w-8 ${currentModule.color}`} />
              <span className="ml-2 text-xl font-bold text-gray-900 dark:text-gray-100 truncate">{currentModule.name}</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* User Info */}
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center truncate">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-semibold ring-2 ring-white dark:ring-gray-800 shadow-md ${activeModule === 'eams' ? 'bg-blue-600' : 'bg-primary-600'}`}>
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </div>
              <div className="ml-3 truncate">
                <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.position}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-3 py-4">
            <ul className="space-y-1">
              {filteredNavigation.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={`flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive(item.href)
                        ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400 shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>

            {filteredSettings.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
                <h3 className="px-3 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[2px] mb-4">
                  Ayarlar
                </h3>
                <ul className="space-y-1">
                  {filteredSettings.map((item) => (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className={`flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          isActive(item.href)
                            ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400 shadow-sm'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100'
                        }`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <item.icon className="h-5 w-5 mr-3" />
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </nav>

          {/* Home & Logout */}
          <div className="px-3 py-4 border-t border-gray-100 dark:border-gray-800 space-y-1">
            <Link
              to="/"
              className="flex items-center w-full px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-primary-600 dark:hover:text-primary-400 transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
            >
              <Home className="h-5 w-5 mr-3" />
              Portal Ana Sayfası
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-400 transition-all"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Çıkış Yap
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Bar */}
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30 transition-colors duration-200">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-500 hover:text-gray-700 p-2 -ml-2 rounded-md hover:bg-gray-100"
              >
                <Menu className="h-6 w-6" />
              </button>
              
              <div className="hidden lg:flex items-center text-sm text-gray-500 dark:text-gray-400 font-medium">
                <Link to="/" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Portal</Link>
                <span className="mx-2 text-gray-300 dark:text-gray-700">/</span>
                <span className="text-gray-900 dark:text-gray-100 font-bold">{currentModule.name}</span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors bg-gray-50 dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700"
                title={theme === 'light' ? 'Karanlık Moda Geç' : 'Aydınlık Moda Geç'}
              >
                {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </button>

              <Link
                to="/eams/notifications"
                className="relative p-2 text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors bg-gray-50 dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-900"></span>
              </Link>
              
              <div className="h-8 w-px bg-gray-200 dark:bg-gray-800 mx-2 hidden sm:block"></div>
              
              <div className="hidden sm:flex flex-col items-end mr-2">
                <span className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-tight">{user?.first_name} {user?.last_name}</span>
                <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">{user?.roles?.[0]}</span>
              </div>
              
              <div className="h-10 w-10 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-primary-700 dark:text-primary-400 font-bold shadow-sm">
                {user?.first_name?.[0]}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 md:p-8">
          <div className="max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout
