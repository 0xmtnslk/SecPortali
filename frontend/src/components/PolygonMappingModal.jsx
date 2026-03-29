import React, { useState } from 'react';
import { X, Save, MapPin, Grid3X3 } from 'lucide-react';
import axios from 'axios';

const PolygonMappingModal = ({ isOpen, onClose, dxfEntity, areas, onSave }) => {
  const [selectedAreaId, setSelectedAreaId] = useState('');
  const [loading, setLoading] = useState(false);
  const [mapColor, setMapColor] = useState('#3b82f6');

  if (!isOpen || !dxfEntity) return null;

  // normalize LINE exactly like POLYLINE
  let entityVertices = dxfEntity.vertices || [];
  if (dxfEntity.type === 'LINE' && dxfEntity.start && dxfEntity.end) {
    entityVertices = [dxfEntity.start, dxfEntity.end];
  }

  const entityId = dxfEntity.id || dxfEntity.handle || 'Bilinmiyor';
  const entityType = dxfEntity.type === 'LINE' ? 'Çizgi' : 'Poligon';
  const vertexCount = entityVertices.length;

  const handleSave = async () => {
    if (!selectedAreaId) {
      alert('Lütfen eşleştirmek için bir mahal seçin.');
      return;
    }
    
    try {
      setLoading(true);

      const geometry = {
        type: 'Polygon',
        vertices: entityVertices
      };

      let centerX = null, centerY = null;
      if (entityVertices.length > 0) {
        const sumX = entityVertices.reduce((sum, v) => sum + v.x, 0);
        const sumY = entityVertices.reduce((sum, v) => sum + v.y, 0);
        centerX = parseFloat((sumX / entityVertices.length).toFixed(2));
        centerY = parseFloat((sumY / entityVertices.length).toFixed(2));
      }

      await axios.put(`/api/eams/map/areas/${selectedAreaId}/map`, {
        geometry,
        center_x: centerX,
        center_y: centerY,
        dxf_entity_id: dxfEntity.id || dxfEntity.handle,
        map_color: mapColor
      });

      onSave?.();
      onClose();
    } catch (error) {
      console.error('Mapping save error:', error);
      alert('Eşleştirme kaydedilirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const unmappedAreas = areas?.filter(a => !a.is_mapped) || [];
  const mappedAreas = areas?.filter(a => a.is_mapped) || [];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-all animate-in fade-in duration-300">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col transition-colors duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 transition-colors">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              Mahal Eşleştir
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Seçilen {entityType}: {entityId}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500 dark:text-gray-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Eşleştirilecek Mahali Seçin
            </label>
            <select
              value={selectedAreaId}
              onChange={(e) => setSelectedAreaId(e.target.value)}
              className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-gray-100 text-sm transition-all"
            >
              <option value="">-- Mahal Seçin --</option>
              {unmappedAreas.length > 0 && (
                <optgroup label="Eşleşmemiş Mahaller">
                  {unmappedAreas.map(area => (
                    <option value={area.id} key={area.id}>{area.area_name} ({area.area_type_name})</option>
                  ))}
                </optgroup>
              )}
              {mappedAreas.length > 0 && (
                <optgroup label="Zaten Eşleştirilmiş Mahaller (Üzerine Yaz)">
                  {mappedAreas.map(area => (
                    <option value={area.id} key={area.id}>{area.area_name} ({area.area_type_name})</option>
                  ))}
                </optgroup>
              )}
            </select>
            {areas?.length === 0 && (
              <p className="text-xs text-red-500 dark:text-red-400 mt-2 flex items-center gap-1 font-medium bg-red-50 dark:bg-red-900/20 p-2 rounded-lg border border-red-100 dark:border-red-900/30">
                <Grid3X3 className="w-4 h-4" />
                Bu katta kayıtlı hiç mahal bulunmuyor.
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Harita Rengi
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={mapColor}
                onChange={(e) => setMapColor(e.target.value)}
                className="w-12 h-10 rounded-lg border border-gray-300 dark:border-gray-700 cursor-pointer bg-transparent shadow-sm"
              />
              <span className="text-[11px] text-gray-500 dark:text-gray-400 italic">Eşleşince bu renkte görünecek</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-5 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 transition-colors">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 font-medium text-sm transition-all"
          >
            İptal
          </button>
          <button
            onClick={handleSave}
            disabled={loading || !selectedAreaId}
            className="flex items-center gap-2 px-8 py-2 text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-sm shadow-lg shadow-blue-500/20 transition-all active:scale-95"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Kaydet
          </button>
        </div>
      </div>
    </div>
  );
};

export default PolygonMappingModal;
