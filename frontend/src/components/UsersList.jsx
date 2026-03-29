import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Plus, Edit, Trash2, X } from 'lucide-react';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    unit: '',
    position: '',
    employee_id: '',
    password: '',
    facility_id: '',
    department_id: '',
    role_id: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [usersRes, rolesRes, facilitiesRes, depsRes] = await Promise.all([
        axios.get('/api/users', { headers }),
        axios.get('/api/roles', { headers }).catch(() => ({ data: [] })),
        axios.get('/api/eams/facilities', { headers }).catch(() => ({ data: [] })),
        axios.get('/api/eams/settings/departments', { headers }).catch(() => ({ data: [] }))
      ]);

      setUsers(usersRes.data.users || []);
      setRoles(Array.isArray(rolesRes.data) ? rolesRes.data : (rolesRes.data.roles || []));
      setFacilities(Array.isArray(facilitiesRes.data) ? facilitiesRes.data : (facilitiesRes.data.facilities || []));
      setDepartments(Array.isArray(depsRes.data) ? depsRes.data : (depsRes.data.departments || []));
    } catch (err) {
      console.error(err);
      alert('Veriler yüklenirken bir hata oluştu: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        unit: user.unit || '',
        position: user.position || '',
        employee_id: user.employee_id || '',
        password: '',
        facility_id: user.facilities?.[0] || '',
        department_id: user.department_id || '',
        role_id: user.roles?.[0] || ''
      });
    } else {
      setEditingUser(null);
      setFormData({
        first_name: '', last_name: '', email: '', phone: '', unit: '', position: '', employee_id: '', password: '', facility_id: '', department_id: '', role_id: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      if (editingUser) {
        await axios.put(`/api/users/${editingUser.id}`, formData, { headers });
      } else {
        await axios.post('/api/users', formData, { headers });
      }
      fetchData();
      handleCloseModal();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Kayıt sırasında hata oluştu.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Kullanıcıyı silmek istediğinize emin misiniz?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/users/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchData();
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
          <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight">Kullanıcı Yönetimi</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">Sistem kullanıcılarını ve yetkilerini yönetin</p>
        </div>
        <button 
          onClick={() => handleOpenModal()} 
          className="px-6 py-3 bg-primary-600 dark:bg-primary-500 text-white rounded-xl hover:bg-primary-700 dark:hover:bg-primary-600 transition-all duration-200 flex items-center gap-2 font-bold shadow-lg shadow-primary-200 dark:shadow-none uppercase tracking-widest text-xs"
        >
          <Plus className="h-4 w-4" /> Yeni Kullanıcı
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-[2rem] shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800 overflow-hidden transition-all duration-300">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800">
            <thead className="bg-gray-50/50 dark:bg-gray-800/50">
              <tr>
                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Ad Soyad</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Email / İletişim</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Rol / Görev</th>
                <th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors group">
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-400 font-black text-sm uppercase">
                        {user.first_name?.[0]}{user.last_name?.[0]}
                      </div>
                      <div className="font-bold text-gray-900 dark:text-gray-100">{user.first_name} {user.last_name}</div>
                    </div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-300">{user.email}</div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{user.phone || '-'}</div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800">
                      {Array.isArray(user.roles) ? user.roles[0] : (user.role || '-')}
                    </span>
                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-1.5 font-medium">{user.position}</div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleOpenModal(user)} 
                        className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition-all"
                        title="Düzenle"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(user.id)} 
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all"
                        title="Sil"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-8 py-20 text-center">
                    <Users className="h-12 w-12 text-gray-200 dark:text-gray-800 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 font-medium tracking-tight">Kullanıcı bulunamadı</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between p-8 border-b border-gray-50 dark:border-gray-800">
              <h3 className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
                {editingUser ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı Oluştur'}
              </h3>
              <button 
                type="button" 
                onClick={handleCloseModal} 
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 ml-1">Ad *</label>
                  <input required name="first_name" value={formData.first_name} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-gray-100 font-bold transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 ml-1">Soyad *</label>
                  <input required name="last_name" value={formData.last_name} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-gray-100 font-bold transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 ml-1">Email *</label>
                  <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-gray-100 font-bold transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 ml-1">Telefon</label>
                  <input name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-gray-100 font-bold transition-all" />
                </div>
                {!editingUser && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 ml-1">Şifre (Varsayılan: 123456)</label>
                    <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-gray-100 font-bold transition-all" />
                  </div>
                )}
                
                <div className="md:col-span-2 py-4"><div className="h-px bg-gray-50 dark:bg-gray-800 w-full"></div></div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 ml-1">Bağlı Olduğu Tesis</label>
                  <select name="facility_id" value={formData.facility_id} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-gray-100 font-bold transition-all">
                    <option value="">(Seçiniz)</option>
                    {facilities.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 ml-1">Departman</label>
                  <select name="department_id" value={formData.department_id} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-gray-100 font-bold transition-all">
                    <option value="">(Seçiniz)</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 ml-1">Birim</label>
                  <input name="unit" value={formData.unit} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-gray-100 font-bold transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 ml-1">Görevi</label>
                  <input name="position" value={formData.position} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-gray-100 font-bold transition-all" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 ml-1">Sistem Rolü *</label>
                  <select required name="role_id" value={formData.role_id} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-gray-100 font-bold transition-all">
                    <option value="">(Seçiniz)</option>
                    {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="mt-10 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={handleCloseModal} 
                  className="px-8 py-3.5 text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-all"
                >
                  İptal
                </button>
                <button 
                  type="submit" 
                  className="px-10 py-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl transition-all duration-200 text-xs font-black uppercase tracking-widest shadow-xl shadow-primary-500/20"
                >
                  {editingUser ? 'Güncelle' : 'Kullanıcı Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersList;
