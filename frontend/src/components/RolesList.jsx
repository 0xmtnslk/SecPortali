import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, Plus, Edit, Trash2, X } from 'lucide-react';

const RolesList = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  
  // Minimal check to see if user is Admin from token
  const token = localStorage.getItem('token');
  const payload = token ? JSON.parse(atob(token.split('.')[1])) : {};
  const isAdmin = payload.roles && (payload.roles.includes('Admin') || payload.roles.includes('Sistem Yöneticisi') || payload.roles.includes('Central Manager'));

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    scope: 'FACILITY',
    permissions: []
  });

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/roles', { headers: { Authorization: `Bearer ${token}` } });
      setRoles(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (role = null) => {
    if (role) {
      setEditingRole(role);
      setFormData({ 
        name: role.name, 
        description: role.description || '',
        scope: role.scope || 'FACILITY',
        permissions: role.permissions || []
      });
    } else {
      setEditingRole(null);
      setFormData({ name: '', description: '', scope: 'FACILITY', permissions: [] });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRole(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const headers = { Authorization: `Bearer ${token}` };
      if (editingRole) {
        await axios.put(`/api/roles/${editingRole.id}`, formData, { headers });
      } else {
        await axios.post('/api/roles', formData, { headers });
      }
      fetchRoles();
      handleCloseModal();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Hata oluştu.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Rolü silmek istediğinize emin misiniz?')) return;
    try {
      await axios.delete(`/api/roles/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchRoles();
    } catch (err) {
      console.error(err);
      alert('Silme işlemi başarısız');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center p-20">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-100 dark:border-primary-900/30 border-t-primary-600"></div>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight">Sistem Rolleri</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">Kullanıcılara atanacak yetki gruplarını yönetin</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => handleOpenModal()} 
            className="px-6 py-3 bg-primary-600 dark:bg-primary-500 text-white rounded-xl hover:bg-primary-700 dark:hover:bg-primary-600 transition-all duration-200 flex items-center gap-2 font-bold shadow-lg shadow-primary-200 dark:shadow-none uppercase tracking-widest text-xs"
          >
            <Plus className="h-4 w-4" /> Yeni Rol Oluştur
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map(role => (
          <div key={role.id} className="bg-white dark:bg-gray-900 rounded-[2rem] shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800 p-6 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group">
            <div className="flex items-start justify-between mb-6">
              <div className="p-4 bg-primary-50 dark:bg-primary-900/30 rounded-2xl text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform duration-300">
                <Shield className="h-6 w-6" />
              </div>
              {role.is_system && (
                <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                  Sistem Rolü
                </span>
              )}
            </div>
            
            <h3 className="text-lg font-black text-gray-900 dark:text-gray-100 tracking-tight mb-2 uppercase">{role.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 min-h-[40px] font-medium leading-relaxed">
              {role.description || 'Bu rol için henüz bir açıklama girilmemiş.'}
            </p>
            
            <div className="mt-6 pt-6 border-t border-gray-50 dark:border-gray-800 flex items-center justify-between">
              <div className="text-xs font-black text-primary-600 dark:text-primary-400 uppercase tracking-widest px-2.5 py-1 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                {role.scope || 'FACILITY'}
              </div>
              {isAdmin && !role.is_system && (
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleOpenModal(role)} 
                    className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition-all"
                    title="Düzenle"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(role.id)} 
                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all"
                    title="Sil"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between p-8 border-b border-gray-50 dark:border-gray-800">
              <h3 className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
                {editingRole ? 'Rolü Düzenle' : 'Yeni Rol Oluştur'}
              </h3>
              <button 
                onClick={handleCloseModal} 
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 ml-1">Rol Adı *</label>
                <input required name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-gray-100 font-bold transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 ml-1">Açıklama</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows="3" className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-gray-100 font-bold transition-all resize-none"></textarea>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 ml-1">Erişim Kapsamı (Scope)</label>
                <select name="scope" value={formData.scope} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-gray-100 font-bold transition-all">
                  <option value="SYSTEM">SYSTEM (Tüm Sistem)</option>
                  <option value="GLOBAL">GLOBAL (Tüm Tesisler)</option>
                  <option value="FACILITY">FACILITY (Tek Tesis)</option>
                  <option value="UNIT">UNIT (Tek Birim)</option>
                </select>
              </div>
              
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 ml-1">Yetkiler (Permissions)</label>
                <div className="space-y-6 max-h-[400px] overflow-y-auto p-6 rounded-3xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                  {Object.entries({
                    'Dashboard': ['VIEW_DASHBOARD', 'VIEW_STATS'],
                    'Tesisler': ['VIEW_FACILITIES', 'MANAGE_FACILITIES'],
                    'Kullanıcılar': ['VIEW_USERS', 'MANAGE_USERS', 'MANAGE_ROLES'],
                    'Varlıklar': ['VIEW_ASSETS', 'MANAGE_ASSETS'],
                    'Bakım': ['VIEW_MAINTENANCE', 'MANAGE_MAINTENANCE'],
                    'Arıza': ['VIEW_FAULTS', 'MANAGE_FAULTS']
                  }).map(([category, perms]) => (
                    <div key={category} className="space-y-3">
                      <h4 className="text-[10px] font-black text-primary-600 dark:text-primary-400 uppercase tracking-widest">{category}</h4>
                      <div className="grid grid-cols-1 gap-2">
                        {perms.map(perm => (
                          <label key={perm} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 transition-all hover:border-primary-500 dark:hover:border-primary-400 cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={formData.permissions.includes(perm)}
                              onChange={(e) => {
                                const newPerms = e.target.checked
                                  ? [...formData.permissions, perm]
                                  : formData.permissions.filter(p => p !== perm);
                                setFormData({ ...formData, permissions: newPerms });
                              }}
                              className="w-5 h-5 rounded-lg border-gray-300 dark:border-gray-700 text-primary-600 focus:ring-primary-500 bg-gray-50 dark:bg-gray-800"
                            />
                            <span className="text-sm font-bold text-gray-700 dark:text-gray-200 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors uppercase tracking-tight">{perm.replace(/_/g, ' ')}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-gray-50 dark:border-gray-800 text-right">
                <button 
                  type="button" 
                  onClick={handleCloseModal} 
                  className="px-8 py-3.5 text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-all font-bold"
                >
                  İptal
                </button>
                <button 
                  type="submit" 
                  className="px-10 py-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl transition-all duration-200 text-xs font-black uppercase tracking-widest shadow-xl shadow-primary-500/20"
                >
                  {editingRole ? 'Güncelle' : 'Rolü Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RolesList;
