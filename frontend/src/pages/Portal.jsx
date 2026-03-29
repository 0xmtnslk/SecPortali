import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Users, 
  ClipboardCheck, 
  ShieldAlert, 
  HeartPulse, 
  Leaf, 
  BarChart3,
  ArrowRight,
  LogOut,
  Settings as SettingsIcon,
  User
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const modules = [
  {
    id: 'eams',
    title: 'EAMS',
    subtitle: 'Kurumsal Varlık Yönetimi',
    description: 'Kurumsal varlıkların, ekipmanların ve envanterin yaşam döngüsü takibi.',
    icon: Box,
    color: 'blue',
    path: '/eams/dashboard'
  },
  {
    id: 'cms',
    title: 'CMS',
    subtitle: 'Contractor Management System',
    description: 'Yüklenici firma kayıtları, sözleşme takibi ve performans değerlendirmeleri.',
    icon: Users,
    color: 'indigo',
    path: '/cms/dashboard'
  },
  {
    id: 'aums',
    title: 'AUMS',
    subtitle: 'Denetim Yönetim Sistemi',
    description: 'İç ve dış denetim planlaması, bulgu takibi ve DÖF süreçleri.',
    icon: ClipboardCheck,
    color: 'amber',
    path: '/aums/dashboard'
  },
  {
    id: 'ohs',
    title: 'İş Güvenliği Yönetimi',
    subtitle: 'Güvenlik Operasyonları',
    description: 'Olay bildirimleri, ramak kala raporları, risk analizleri ve KKD takibi.',
    icon: ShieldAlert,
    color: 'red',
    path: '/ohs/dashboard'
  },
  {
    id: 'health',
    title: 'İş Sağlığı Yönetimi',
    subtitle: 'Sağlık Operasyonları',
    description: 'Periyodik muayeneler, poliklinik kayıtları ve çalışan sağlık verileri.',
    icon: HeartPulse,
    color: 'pink',
    path: '/health/dashboard'
  },
  {
    id: 'env',
    title: 'Çevre Yönetimi',
    subtitle: 'Çevresel Uygunluk',
    description: 'Atık yönetimi, çevresel uygunluk ve yasal mevzuat raporları.',
    icon: Leaf,
    color: 'green',
    path: '/env/dashboard'
  },
  {
    id: 'sus',
    title: 'Sürdürülebilirlik Yönetimi',
    subtitle: 'Kurumsal Sürdürülebilirlik',
    description: 'Karbon ayak izi, ESG raporlaması ve hedefler.',
    icon: BarChart3,
    color: 'teal',
    path: '/sus/dashboard'
  }
];

const colorClasses = {
  blue: 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-900/50 text-blue-600 dark:text-blue-400 hover:border-blue-400 dark:hover:border-blue-700',
  indigo: 'bg-indigo-50 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-900/50 text-indigo-600 dark:text-indigo-400 hover:border-indigo-400 dark:hover:border-indigo-700',
  amber: 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-900/50 text-amber-600 dark:text-amber-400 hover:border-amber-400 dark:hover:border-amber-700',
  red: 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:border-red-400 dark:hover:border-red-700',
  pink: 'bg-pink-50 dark:bg-pink-900/10 border-pink-200 dark:border-pink-900/50 text-pink-600 dark:text-pink-400 hover:border-pink-400 dark:hover:border-pink-700',
  green: 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/50 text-green-600 dark:text-green-400 hover:border-green-400 dark:hover:border-green-700',
  teal: 'bg-teal-50 dark:bg-teal-900/10 border-teal-200 dark:border-teal-900/50 text-teal-600 dark:text-teal-400 hover:border-teal-400 dark:hover:border-teal-700',
};

const Portal = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col transition-colors duration-200">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm transition-colors duration-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-900 dark:bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
            K
          </div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">MLPCARE SEÇ Portalı</h1>
        </div>
        
        <div className="flex items-center space-x-6">
          <button
            onClick={toggleTheme}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors bg-gray-50 dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700"
            title={theme === 'light' ? 'Karanlık Moda Geç' : 'Aydınlık Moda Geç'}
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <span>Hoş geldin, <span className="font-bold text-gray-900 dark:text-gray-100">{user?.fullName || 'Yönetici'}</span></span>
          </div>
          
          <button 
            onClick={() => navigate('/settings')}
            className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
          >
            <SettingsIcon size={18} />
            <span>Admin Paneli</span>
          </button>
          
          <div className="h-4 w-px bg-gray-300 dark:bg-gray-700"></div>
          
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          >
            <LogOut size={18} />
            <span>Çıkış Yap</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12 transition-colors duration-200">
        <div className="mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 mb-2">Uygulamalar</h2>
          <p className="text-gray-500 dark:text-gray-400 text-lg">Lütfen işlem yapmak istediğiniz modülü seçin.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {modules.map((module) => (
            <div 
              key={module.id}
              onClick={() => navigate(module.path)}
              className={`group cursor-pointer p-8 rounded-2xl border-2 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl ${colorClasses[module.color]}`}
            >
              <div className="flex flex-col h-full">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 shadow-sm bg-white dark:bg-gray-800`}>
                  <module.icon size={28} />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">{module.title}</h3>
                <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-4 uppercase tracking-wider">{module.subtitle}</h4>
                <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed mb-8 flex-1">
                  {module.description}
                </p>
                
                <div className="flex items-center font-bold text-base group-hover:underline">
                  <span>Uygulamaya Git</span>
                  <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-gray-400 dark:text-gray-500 text-sm border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 transition-colors duration-200">
        © 2026 MLPCARE SEÇ Portalı • Tüm hakları saklıdır.
      </footer>
    </div>
  );
};

export default Portal;
