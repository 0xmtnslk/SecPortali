import React, { useState, useEffect, useMemo } from 'react';
import { X, MapPin, Save, MousePointer, Map as MapIcon } from 'lucide-react';
import { MapContainer, Polygon, useMap } from 'react-leaflet';
import { CRS } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { useTheme } from '../contexts/ThemeContext';

const MapFitter = ({ bounds }) => {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds);
    }
  }, [map, bounds]);
  return null;
};

const AreaMappingModal = ({ isOpen, onClose, area, floorId, dxfEntities, onSave }) => {
  const [selectedEntityId, setSelectedEntityId] = useState(null);
  const [centerX, setCenterX] = useState('');
  const [centerY, setCenterY] = useState('');
  const [mapColor, setMapColor] = useState('#3b82f6');
  const [viewMode, setViewMode] = useState('map');
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    if (area) {
      setSelectedEntityId(area.dxf_entity_id || null);
      setCenterX(area.center_x || '');
      setCenterY(area.center_y || '');
      setMapColor(area.map_color || '#3b82f6');
    }
  }, [area]);

  // Convert LINE entities to vertices format to be handled like POLYLINEs
  const processedEntities = (dxfEntities || []).map(e => {
    if (e.type === 'LINE' && e.start && e.end) {
      return { ...e, vertices: [e.start, e.end] };
    }
    return e;
  });

  const polygonEntities = processedEntities.filter(e =>
    e.type === 'LWPOLYLINE' || e.type === 'POLYLINE' || e.type === 'LINE'
  );

  const calculateGlobalBounds = (entities) => {
    if (!entities || entities.length === 0) return null;

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

    entities.forEach(entity => {
      const vertices = entity.vertices || [];
      vertices.forEach(v => {
        if (v.x !== undefined && v.y !== undefined) {
          minX = Math.min(minX, v.x);
          maxX = Math.max(maxX, v.x);
          minY = Math.min(minY, v.y);
          maxY = Math.max(maxY, v.y);
        }
      });
    });

    if (minX === Infinity) return null;

    const padding = Math.max(maxX - minX, maxY - minY) * 0.1 || 1;
    return {
      minX: minX - padding,
      maxX: maxX + padding,
      minY: minY - padding,
      maxY: maxY + padding
    };
  };

  const transformCoordinates = (vertices, mapBounds, globalBounds) => {
    if (!vertices || vertices.length === 0 || !globalBounds) return [];

    const width = globalBounds.maxX - globalBounds.minX || 1;
    const height = globalBounds.maxY - globalBounds.minY || 1;

    return vertices.map(v => {
      const x = parseFloat(v.x);
      const y = parseFloat(v.y);

      if (isNaN(x) || isNaN(y)) return null;

      const normalizedX = (x - globalBounds.minX) / width;
      const normalizedY = (y - globalBounds.minY) / height;

      return [
        mapBounds[1][0] - normalizedY * (mapBounds[1][0] - mapBounds[0][0]),
        mapBounds[0][1] + normalizedX * (mapBounds[1][1] - mapBounds[0][1])
      ];
    }).filter(v => v !== null);
  };

  const globalBounds = useMemo(() => calculateGlobalBounds(polygonEntities), [polygonEntities]);
  const mapBounds = [[0, 0], [1000, 1000]];



  const handleEntitySelect = (entity) => {
    const entityId = entity.id || entity.handle;
    setSelectedEntityId(entityId);

    if (entity.vertices && entity.vertices.length > 0) {
      const sumX = entity.vertices.reduce((sum, v) => sum + v.x, 0);
      const sumY = entity.vertices.reduce((sum, v) => sum + v.y, 0);
      setCenterX((sumX / entity.vertices.length).toFixed(2));
      setCenterY((sumY / entity.vertices.length).toFixed(2));
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      const selectedEntity = polygonEntities.find(e =>
        (e.id || e.handle) === selectedEntityId
      );

      const geometry = selectedEntity ? {
        type: 'Polygon',
        vertices: selectedEntity.vertices
      } : null;

      await axios.put(`/api/eams/map/areas/${area.id}/map`, {
        geometry,
        center_x: centerX ? parseFloat(centerX) : null,
        center_y: centerY ? parseFloat(centerY) : null,
        dxf_entity_id: selectedEntityId,
        map_color: mapColor
      });

      onSave?.();
      onClose();
    } catch (error) {
      console.error('Area mapping save error:', error);
      alert('Mahal eşleştirme kaydedilirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !area) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-all animate-in fade-in duration-300">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col transition-colors duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 transition-colors">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              Mahal Eşleştirme
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{area.area_name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500 dark:text-gray-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex">
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Harita Rengi
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={mapColor}
                  onChange={(e) => setMapColor(e.target.value)}
                  className="w-12 h-10 rounded-lg border border-gray-300 dark:border-gray-700 cursor-pointer bg-transparent"
                />
                <span className="text-sm font-mono text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded border border-gray-200 dark:border-gray-700">{mapColor}</span>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  <MapIcon className="w-4 h-4 inline mr-1 text-primary-500" />
                  Poligon Seçimi
                </label>
                <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                  <button
                    onClick={() => setViewMode('map')}
                    className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      viewMode === 'map'
                        ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    Harita
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      viewMode === 'list'
                        ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    Liste
                  </button>
                </div>
              </div>

              {polygonEntities.length === 0 ? (
                <div className="p-8 text-center bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                  <MapIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    DXF dosyasında poligon bulunamadı.
                  </p>
                </div>
              ) : (
                <>
                  {viewMode === 'map' && globalBounds && (
                    <div className="border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden transition-colors" style={{ height: '400px' }}>
                      <MapContainer
                        center={[500, 500]}
                        zoom={0}
                        crs={CRS.Simple}
                        className={`w-full h-full transition-colors ${isDark ? 'bg-[#111827]' : 'bg-gray-100'}`}
                        minZoom={-2}
                        maxZoom={3}
                      >
                        <MapFitter bounds={mapBounds} />
                        {polygonEntities.map((entity, index) => {
                          const entityId = entity.id || entity.handle || `entity-${index}`;
                          const isSelected = selectedEntityId === entityId;
                          const positions = transformCoordinates(entity.vertices, mapBounds, globalBounds);

                          if (!positions || positions.length < 3) return null;

                          return (
                            <Polygon
                              key={entityId}
                              positions={positions}
                              pathOptions={{
                                color: isSelected ? '#3b82f6' : (isDark ? '#4b5563' : '#6b7280'),
                                weight: isSelected ? 3 : 1,
                                fillColor: isSelected ? mapColor : (isDark ? '#1f2937' : '#f3f4f6'),
                                fillOpacity: isSelected ? 0.6 : 0.3
                              }}
                              eventHandlers={{
                                click: () => handleEntitySelect(entity)
                              }}
                            />
                          );
                        })}
                      </MapContainer>
                    </div>
                  )}

                  {viewMode === 'list' && (
                    <div className="space-y-2 max-h-96 overflow-y-auto border border-gray-200 dark:border-gray-800 rounded-2xl p-3 transition-colors">
                      {polygonEntities.map((entity, index) => {
                        const entityId = entity.id || entity.handle || `entity-${index}`;
                        const isSelected = selectedEntityId === entityId;
                        const vertexCount = entity.vertices?.length || 0;

                        return (
                          <button
                            key={entityId}
                            onClick={() => handleEntitySelect(entity)}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                              isSelected
                                ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 ring-1 ring-blue-100 dark:ring-blue-900 shadow-sm'
                                : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 border border-gray-100 dark:border-gray-700'
                            }`}
                          >
                            <MousePointer className={`w-4 h-4 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`} />
                            <div className="flex-1">
                              <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                {entity.type === 'LINE' ? 'Çizgi' : 'Poligon'} #{index + 1}
                              </p>
                              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                {vertexCount} köşe noktası
                              </p>
                            </div>
                            {isSelected && (
                              <span className="text-xs text-blue-600 font-medium">
                                Seçili
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {selectedEntityId && (
                    <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                      <MousePointer className="w-3 h-3" />
                      {viewMode === 'map' ? 'Haritada bir poligon seçildi' : 'Listeden bir poligon seçildi'}
                    </p>
                  )}
                </>
              )}
            </div>

            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                <MapPin className="w-4 h-4 inline mr-1 text-primary-500" />
                Merkez Koordinatları
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-gray-500 dark:text-gray-400 mb-1 font-bold uppercase tracking-wider">X Koordinatı</label>
                  <input
                    type="number"
                    step="0.01"
                    value={centerX}
                    onChange={(e) => setCenterX(e.target.value)}
                    className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-gray-100 text-sm transition-all shadow-sm"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 dark:text-gray-400 mb-1 font-bold uppercase tracking-wider">Y Koordinatı</label>
                  <input
                    type="number"
                    step="0.01"
                    value={centerY}
                    onChange={(e) => setCenterY(e.target.value)}
                    className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-gray-100 text-sm transition-all shadow-sm"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-2 italic">
                Poligon seçildiğinde koordinatlar otomatik hesaplanır.
              </p>
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
            disabled={loading || !selectedEntityId}
            className="flex items-center gap-2 px-8 py-2 text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-sm shadow-lg shadow-blue-500/20 transition-all active:scale-95"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Seçimi Kaydet
          </button>
        </div>
      </div>
    </div>
  );
};

export default AreaMappingModal;