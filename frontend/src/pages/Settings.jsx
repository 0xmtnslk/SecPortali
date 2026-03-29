import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Users, Bell, FileText, Settings as SettingsIcon, ClipboardCheck, Wrench, AlertCircle, Check } from 'lucide-react'
import EquipmentHierarchy from '../components/EquipmentHierarchy'
import EquipmentCategories from '../components/EquipmentCategories'
import ChecklistSettings from '../components/ChecklistSettings'
import UsersList from '../components/UsersList'
import RolesList from '../components/RolesList'
import AreaTypes from '../components/AreaTypes'
import MeasurementUnits from '../components/MeasurementUnits'
import EnergyTypes from '../components/EnergyTypes'
import AuthorizedDepartments from '../components/AuthorizedDepartments'
import FacilitiesManagement from '../components/FacilitiesManagement'

const SettingsPage = () => {
  const { tab } = useParams()
  const activeTab = tab || 'general'

  const getTabTitle = () => {
    switch (activeTab) {
      case 'general':
        return 'Genel Ayarlar'
      case 'notifications':
        return 'Bildirim Ayarları'
      case 'users':
        return 'Kullanıcılar'
      case 'roles':
        return 'Rol Yönetimi'
      case 'categories':
        return 'Ekipman Kategorileri'
      case 'area-types':
        return 'Alan Türleri'
      case 'equipment-hierarchy':
        return 'Ekipman Cinsi Ayarları'
      case 'checklist-settings':
        return 'Bakım Kontrol Ayarları'
      case 'measurement-units':
        return 'Ölçü Birimleri'
      case 'energy-types':
        return 'Enerji Türleri'
      case 'departments':
        return 'Yetkili Departmanlar'
      case 'facilities':
        return 'Tesis Yönetimi'
      default:
        return 'Ayarlar'
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12 min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-gray-100 tracking-tight flex items-center gap-3">
            <SettingsIcon className="h-10 w-10 text-primary-500" />
            {getTabTitle()}
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 mt-2 font-medium">Sistem ayarları ve altyapı yapılandırması</p>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800 p-8 transition-all duration-300">
        {activeTab === 'general' && (
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-10 pb-6 border-b border-gray-100 dark:border-gray-800">
               <div className="p-3 bg-primary-50 dark:bg-primary-900/30 rounded-2xl">
                 <SettingsIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
               </div>
               <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight">Genel Ayarlar</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 ml-1">
                  Sistem Adı
                </label>
                <input
                  type="text"
                  className="w-full px-5 py-4 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-gray-100 focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-primary-500 transition-all font-bold placeholder-gray-400"
                  defaultValue="Varlık Yönetim Sistemi"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 ml-1">
                  Şirket Adı
                </label>
                <input
                  type="text"
                  className="w-full px-5 py-4 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-gray-100 focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-primary-500 transition-all font-bold placeholder-gray-400"
                  placeholder="Şirket adını girin"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 ml-1">
                  Varsayılan Dil
                </label>
                <select className="w-full px-5 py-4 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-gray-100 focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-primary-500 transition-all font-bold">
                  <option value="tr">Türkçe</option>
                  <option value="en">English</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 ml-1">
                  Saat Dilimi
                </label>
                <select className="w-full px-5 py-4 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-gray-100 focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-primary-500 transition-all font-bold">
                  <option value="Europe/Istanbul">Europe/Istanbul (UTC+3)</option>
                  <option value="UTC">UTC (UTC+0)</option>
                </select>
              </div>
            </div>

            <button className="px-10 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl transition-all duration-200 text-xs font-black uppercase tracking-widest shadow-xl shadow-primary-500/20 flex items-center gap-3 hover:-translate-y-1">
              <Check className="h-5 w-5" />
              Ayarları Kaydet
            </button>
          </div>
        )}

        {activeTab === 'categories' && (
          <EquipmentCategories />
        )}

        {activeTab === 'area-types' && (
          <AreaTypes />
        )}
        {activeTab === 'equipment-hierarchy' && (
          <EquipmentHierarchy />
        )}
        {activeTab === 'checklist-settings' && (
          <ChecklistSettings />
        )}
        {activeTab === 'notifications' && (
          <div className="max-w-4xl animate-in slide-in-from-bottom-5 duration-500">
            <div className="flex items-center gap-3 mb-10 pb-6 border-b border-gray-100 dark:border-gray-800">
               <div className="p-3 bg-amber-50 dark:bg-amber-900/30 rounded-2xl">
                 <Bell className="h-6 w-6 text-amber-600 dark:text-amber-400" />
               </div>
               <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight">Bildirim Ayarları</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {[
                { id: 'email', label: 'E-posta', desc: 'Sistem güncellemeleri ve raporlar', checked: true },
                { id: 'sms', label: 'SMS', desc: 'Acil arıza bildirimleri ve onaylar', checked: false },
                { id: 'push', label: 'Anlık Bildirim', desc: 'Tarayıcı üzerinden hızlı uyarılar', checked: true }
              ].map((item) => (
                <div key={item.id} className="p-6 bg-gray-50/50 dark:bg-gray-800/50 rounded-3xl border border-gray-100 dark:border-gray-700 hover:border-primary-500 transition-all group">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div className="p-2.5 bg-white dark:bg-gray-700 rounded-xl shadow-sm group-hover:bg-primary-500 group-hover:text-white transition-all">
                        <Bell className="h-5 w-5" />
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked={item.checked} />
                        <div className="w-12 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-gray-900 dark:text-gray-100 uppercase tracking-widest">{item.label}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gray-50/50 dark:bg-gray-800/50 rounded-[2rem] p-8 border border-gray-100 dark:border-gray-700">
              <h3 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-8">Bildirim Tercihleri</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { id: 'maint', label: 'Bakım hatırlatıcıları', icon: Wrench },
                  { id: 'fault', label: 'Arıza talep bildirimleri', icon: AlertCircle },
                  { id: 'sys', label: 'Sistem güncellemeleri', icon: SettingsIcon },
                  { id: 'cont', label: 'Taşeron aktiviteleri', icon: Users }
                ].map((pref) => (
                  <label key={pref.id} className="flex items-center gap-4 bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 hover:border-primary-500 dark:hover:border-primary-400 transition-all cursor-pointer shadow-sm group">
                    <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-xl group-hover:bg-primary-50 dark:group-hover:bg-primary-900/30 transition-colors">
                      <pref.icon className="h-4 w-4 text-gray-400 dark:text-gray-500 group-hover:text-primary-600 dark:group-hover:text-primary-400" />
                    </div>
                    <input type="checkbox" className="w-5 h-5 text-primary-600 rounded-lg border-gray-300 dark:border-gray-700 focus:ring-primary-500 bg-gray-50 dark:bg-gray-800" defaultChecked />
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{pref.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <button className="w-full mt-8 px-10 py-5 bg-primary-600 hover:bg-primary-700 text-white rounded-[1.5rem] transition-all duration-200 text-xs font-black shadow-xl shadow-primary-500/20 uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:-translate-y-1">
              <Check className="h-5 w-5" />
              Tüm Bildirim Ayarlarını Uygula
            </button>
          </div>
        )}

        {activeTab === 'users' && (
          <UsersList />
        )}

        {activeTab === 'roles' && (
          <RolesList />
        )}
        
        {activeTab === 'measurement-units' && (
          <MeasurementUnits />
        )}
        
        {activeTab === 'energy-types' && (
          <EnergyTypes />
        )}
        
        {activeTab === 'departments' && (
          <AuthorizedDepartments />
        )}

        {activeTab === 'facilities' && (
          <FacilitiesManagement />
        )}
      </div>
    </div>
  )
}

export default SettingsPage
