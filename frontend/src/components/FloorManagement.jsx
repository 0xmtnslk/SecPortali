import React, { useState, useEffect } from 'react';
import { Plus, Upload, Trash2, Edit2, FileUp, X, Check, Building2 } from 'lucide-react';
import axios from 'axios';

const FloorManagement = ({ facilityId, selectedFloor, onFloorUpdate }) => {
  const [blocks, setBlocks] = useState([]);
  const [floors, setFloors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingFloor, setEditingFloor] = useState(null);
  const [uploadingFloor, setUploadingFloor] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    block_id: '',
    floor_name: '',
    floor_number: '',
    sort_order: 0
  });

  useEffect(() => {
    fetchData();
  }, [facilityId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Blokları al
      const blocksResponse = await axios.get(`/api/facilities/${facilityId}/blocks`);
      setBlocks(blocksResponse.data || []);

      // Tüm katları al
      const allFloors = [];
      for (const block of blocksResponse.data || []) {
        const floorsResponse = await axios.get(`/api/eams/floors/block/${block.id}`);
        allFloors.push(...(floorsResponse.data || []).map(f => ({
          ...f,
          block_name: block.block_name
        })));
      }
      allFloors.sort((a, b) => {
        if (a.block_name !== b.block_name) {
          return a.block_name.localeCompare(b.block_name);
        }
        return a.floor_number - b.floor_number;
      });
      setFloors(allFloors);
    } catch (error) {
      console.error('Floor management fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingFloor) {
        await axios.put(`/api/eams/floors/${editingFloor.id}`, formData);
      } else {
        await axios.post('/api/eams/floors', formData);
      }
      setShowAddForm(false);
      setEditingFloor(null);
      setFormData({ block_id: '', floor_name: '', floor_number: '', sort_order: 0 });
      fetchData();
      onFloorUpdate?.();
    } catch (error) {
      console.error('Floor save error:', error);
      alert('Kat kaydedilirken hata oluştu');
    }
  };

  const handleDelete = async (floorId) => {
    if (!confirm('Bu katı silmek istediğinize emin misiniz?')) return;
    
    try {
      await axios.delete(`/api/eams/floors/${floorId}`);
      fetchData();
      onFloorUpdate?.();
    } catch (error) {
      console.error('Floor delete error:', error);
      alert('Kat silinirken hata oluştu');
    }
  };

  const handleDxfUpload = async (floorId, file) => {
    try {
      setUploadingFloor(floorId);
      const formData = new FormData();
      formData.append('dxfFile', file);

      await axios.post(`/api/eams/floors/${floorId}/dxf`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      fetchData();
      alert('DXF dosyası başarıyla yüklendi');
    } catch (error) {
      console.error('DXF upload error:', error);
      alert('DXF dosyası yüklenirken hata oluştu');
    } finally {
      setUploadingFloor(null);
    }
  };

  const handleDxfDelete = async (floorId) => {
    if (!confirm('DXF dosyasını silmek istediğinize emin misiniz?')) return;

    try {
      await axios.delete(`/api/eams/floors/${floorId}/dxf`);
      fetchData();
    } catch (error) {
      console.error('DXF delete error:', error);
      alert('DXF dosyası silinirken hata oluştu');
    }
  };

  const startEdit = (floor) => {
    setEditingFloor(floor);
    setFormData({
      block_id: floor.block_id,
      floor_name: floor.floor_name,
      floor_number: floor.floor_number,
      sort_order: floor.sort_order || 0
    });
    setShowAddForm(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add Button */}
      {!showAddForm && (
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Yeni Kat Ekle
        </button>
      )}

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 transition-colors">
          <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
            <Edit2 className="w-4 h-4 text-primary-500" />
            {editingFloor ? 'Kat Düzenle' : 'Yeni Kat Ekle'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Blok</label>
              <select
                value={formData.block_id}
                onChange={(e) => setFormData({ ...formData, block_id: e.target.value })}
                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-gray-100 text-sm transition-all shadow-sm"
                required
              >
                <option value="">Blok Seçin</option>
                {blocks.map(block => (
                  <option key={block.id} value={block.id}>{block.block_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Kat Adı</label>
              <input
                type="text"
                value={formData.floor_name}
                onChange={(e) => setFormData({ ...formData, floor_name: e.target.value })}
                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-gray-100 text-sm transition-all shadow-sm"
                placeholder="örn: Zemin Kat"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Kat No</label>
              <input
                type="number"
                value={formData.floor_number}
                onChange={(e) => setFormData({ ...formData, floor_number: parseInt(e.target.value) })}
                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-gray-100 text-sm transition-all shadow-sm"
                placeholder="0"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Sıralama</label>
              <input
                type="number"
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) })}
                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-gray-100 text-sm transition-all shadow-sm"
                placeholder="0"
              />
            </div>
            <div className="col-span-4 flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingFloor(null);
                  setFormData({ block_id: '', floor_name: '', floor_number: '', sort_order: 0 });
                }}
                className="px-6 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 font-medium text-sm transition-all"
              >
                İptal
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-8 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold text-sm shadow-lg shadow-blue-500/20 transition-all active:scale-95"
              >
                <Check className="w-4 h-4" />
                Kaydet
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Floor List */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm transition-colors">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800/50">
            <tr>
              <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Blok</th>
              <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Kat</th>
              <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Kat No</th>
              <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">DXF Dosyası</th>
              <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {floors.map(floor => (
              <tr key={floor.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 last:border-0 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{floor.block_name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">{floor.floor_name}</td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{floor.floor_number}</td>
                <td className="px-6 py-4">
                  {floor.dxf_file_path ? (
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded border border-green-200 dark:border-green-800">
                        Yüklendi
                      </span>
                      <button
                        onClick={() => handleDxfDelete(floor.id)}
                        className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="file"
                        accept=".dxf"
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && handleDxfUpload(floor.id, e.target.files[0])}
                      />
                      <span className={`flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all ${
                        uploadingFloor === floor.id
                          ? 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                          : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 border border-blue-100 dark:border-blue-900/50'
                      }`}>
                        {uploadingFloor === floor.id ? (
                          <>
                            <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            Yükleniyor...
                          </>
                        ) : (
                          <>
                            <Upload className="w-3.5 h-3.5" />
                            DXF YÜKLE
                          </>
                        )}
                      </span>
                    </label>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => startEdit(floor)}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                      title="Düzenle"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(floor.id)}
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-colors"
                      title="Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {floors.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-800/30">
            <Building2 className="w-12 h-12 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
            <p className="font-medium text-sm">Henüz kat eklenmemiş</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FloorManagement;