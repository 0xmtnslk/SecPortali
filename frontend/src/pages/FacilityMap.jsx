import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Map, Upload, Settings, Grid3X3, Plus, Edit2, Check, X } from 'lucide-react';
import FloorMap from '../components/FloorMap';
import FloorSelector from '../components/FloorSelector';
import AreaMappingModal from '../components/AreaMappingModal';
import PolygonMappingModal from '../components/PolygonMappingModal';
import AreaModal from '../components/AreaModal';
import FloorManagement from '../components/FloorManagement';
import axios from 'axios';

const calculateGlobalBounds = (entities) => {
  if (!entities || entities.length === 0) return null;
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  entities.forEach(entity => {
    let vertices = [];
    switch (entity.type) {
      case 'LWPOLYLINE':
      case 'POLYLINE':
        vertices = entity.vertices || [];
        break;
      case 'LINE':
        if (entity.start && entity.end) vertices = [entity.start, entity.end];
        break;
      case 'CIRCLE':
      case 'ARC':
        if (entity.center) vertices = [entity.center];
        break;
      case 'TEXT':
      case 'MTEXT':
        if (entity.position) vertices = [entity.position];
        break;
    }
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
  return { minX: minX - padding, maxX: maxX + padding, minY: minY - padding, maxY: maxY + padding };
};

const reverseTransformCoordinates = (latLngs, bounds, boundsToUse) => {
  if (!latLngs || latLngs.length === 0 || !boundsToUse) return [];
  const width = boundsToUse.maxX - boundsToUse.minX || 1;
  const height = boundsToUse.maxY - boundsToUse.minY || 1;

  return latLngs.map(ll => {
    const normalizedY = (bounds[1][0] - ll.lat) / (bounds[1][0] - bounds[0][0]);
    const normalizedX = (ll.lng - bounds[0][1]) / (bounds[1][1] - bounds[0][1]);

    const x = normalizedX * width + boundsToUse.minX;
    const y = normalizedY * height + boundsToUse.minY;
    return { x, y };
  });
};

const FacilityMapPage = () => {
  const { facilityId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/settings/facilities';
  
  const [facility, setFacility] = useState(null);
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [floorData, setFloorData] = useState(null);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMappingModal, setShowMappingModal] = useState(false);
  const [showAreaModal, setShowAreaModal] = useState(false);
  const [selectedArea, setSelectedArea] = useState(null);
  const [showPolygonMappingModal, setShowPolygonMappingModal] = useState(false);
  const [selectedDxfEntity, setSelectedDxfEntity] = useState(null);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingPoints, setDrawingPoints] = useState([]);
  
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleDxfEntityClick = (entity) => {
    if (isDrawing) return; // Çizim modundayken tıklamaları göz ardı et
    setSelectedDxfEntity(entity);
    setShowPolygonMappingModal(true);
  };
  const [showFloorManagement, setShowFloorManagement] = useState(false);
  const [activeTab, setActiveTab] = useState('map'); // 'map' | 'areas' | 'settings'

  useEffect(() => {
    const fetchFacility = async () => {
      if (!facilityId) {
        console.warn('FacilityMap: No facilityId provided');
        return;
      }

      try {
        console.log('FacilityMap: Fetching facility:', facilityId);
        const response = await axios.get(`/api/facilities/${facilityId}`);
        console.log('FacilityMap: Facility data:', response.data);
        setFacility(response.data.facility || response.data);
      } catch (error) {
        console.error('Facility fetch error:', error);
        console.error('Error details:', error.response?.data || error.message);
      }
    };

    fetchFacility();
  }, [facilityId]);

  useEffect(() => {
    const fetchFloorData = async () => {
      if (!selectedFloor) {
        setFloorData(null);
        setAreas([]);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(`/api/eams/map/floor/${selectedFloor.id}`);
        setFloorData(response.data);
        setAreas(response.data.areas || []);
      } catch (error) {
        console.error('Floor data fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFloorData();
  }, [selectedFloor]);

  const handleAreaClick = (area) => {
    setSelectedArea(area);
    if (activeTab === 'areas') {
      setShowMappingModal(true);
    }
  };

  const handleAssetClick = (asset) => {
    navigate(`/assets/${asset.id}`);
  };

  const handleMappingSave = () => {
    // Kat verilerini yenile
    if (selectedFloor) {
      axios.get(`/api/eams/map/floor/${selectedFloor.id}`).then(response => {
        setFloorData(response.data);
        setAreas(response.data.areas || []);
        setRefreshTrigger(prev => prev + 1);
      });
    }
  };

  const handleAreaSave = () => {
    handleMappingSave();
    setShowAreaModal(false);
    setSelectedArea(null);
  };

  const handleFinishDrawing = () => {
    if (drawingPoints.length < 3) {
      alert("Bir poligon oluşturmak için haritada en az 3 nokta işaretlemelisiniz.");
      return;
    }

    // Convert latlng -> DXF coords
    const globalBounds = calculateGlobalBounds(floorData?.dxf_data?.entities);
    const mapBounds = [[0, 0], [1000, 1000]];
    const dxfVertices = reverseTransformCoordinates(drawingPoints, mapBounds, globalBounds);

    const mockEntity = {
      type: 'DRAWN_POLYGON',
      id: 'Cizim_' + Math.floor(Math.random() * 10000),
      vertices: dxfVertices
    };

    setSelectedDxfEntity(mockEntity);
    setShowPolygonMappingModal(true);
    setIsDrawing(false); // Modal açıldığı için çizim modundan çık
    setDrawingPoints([]);
  };

  const handleCancelDrawing = () => {
    setIsDrawing(false);
    setDrawingPoints([]);
  };

  const handleNewArea = () => {
    setSelectedArea(null);
    setShowAreaModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(from)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {facility?.name || 'Tesis Haritası'}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  2B Görünüm ve Varlık Yönetimi
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <FloorSelector
                facilityId={facilityId}
                selectedFloorId={selectedFloor?.id}
                onFloorSelect={setSelectedFloor}
                onAddFloor={() => setShowFloorManagement(true)}
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-6 -mb-px">
            <button
              onClick={() => setActiveTab('map')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'map'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Map className="w-4 h-4" />
              Harita
            </button>
            <button
              onClick={() => setActiveTab('areas')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'areas'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
              Mahaller
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'settings'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Settings className="w-4 h-4" />
              Kat Yönetimi
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {console.log('FacilityMap: selectedFloor:', selectedFloor)}
        {console.log('FacilityMap: activeTab:', activeTab)}
        {!selectedFloor ? (
          <div className="flex flex-col items-center justify-center h-96 bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 transition-colors duration-200">
            <Map className="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">Görüntülemek için bir kat seçin</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm text-center max-w-md">
              Yukarıdaki "Kat Seçin" dropdown menüsünden bir blok ve kat seçerek
              harita görünümüne erişebilirsiniz.
            </p>
            <button
              onClick={() => setShowFloorManagement(true)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Yeni Kat Ekle
            </button>
          </div>
        ) : (
          <>
            {activeTab === 'map' && (
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 transition-colors duration-200">
                <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                      {selectedFloor.block_name} - {selectedFloor.floor_name}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {areas.length} mahal • {areas.filter(a => a.is_mapped).length} haritalandırılmış
                    </p>
                  </div>
                  <div>
                    {!isDrawing ? (
                      <button
                        onClick={() => { setIsDrawing(true); setDrawingPoints([]); }}
                        className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
                      >
                        <Edit2 className="w-4 h-4" />
                        Serbest Çizim
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-indigo-600 font-medium mr-2">Odanın köşelerine tıklayın ({drawingPoints.length} nokta)</span>
                        <button
                          onClick={handleCancelDrawing}
                          className="flex items-center gap-2 px-3 py-1.5 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 text-sm transition-colors"
                        >
                          <X className="w-4 h-4" />
                          İptal
                        </button>
                        <button
                          onClick={handleFinishDrawing}
                          className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                        >
                          <Check className="w-4 h-4" />
                          Çizimi Bitir
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <FloorMap
                  floorId={selectedFloor.id}
                  onAreaClick={handleAreaClick}
                  onAssetClick={handleAssetClick}
                  selectedAreaId={selectedArea?.id}
                  onDxfEntityClick={handleDxfEntityClick}
                  isDrawing={isDrawing}
                  drawingPoints={drawingPoints}
                  setDrawingPoints={setDrawingPoints}
                  refreshTrigger={refreshTrigger}
                />
              </div>
            )}

            {activeTab === 'areas' && (
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 transition-colors duration-200">
                <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Mahal Listesi</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Mahalleri DXF poligonları ile eşleştirin
                    </p>
                  </div>
                  <button
                    onClick={handleNewArea}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                    Yeni Alan Ekle
                  </button>
                </div>
                <div className="divide-y divide-gray-200 dark:divide-gray-800">
                  {areas.length === 0 ? (
                    <div className="p-8 text-center">
                      <Grid3X3 className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                      <p className="text-gray-500 dark:text-gray-400 mb-2">Henüz mahal eklenmemiş</p>
                      <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">
                        Bu kata ait mahalleri eklemek için "Yeni Alan Ekle" butonunu kullanın
                      </p>
                    </div>
                  ) : (
                    areas.map(area => (
                    <div
                      key={area.id}
                      className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: area.status_color || '#9ca3af' }}
                        />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">{area.area_name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{area.area_type_name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`text-xs px-2 py-1 rounded ${
                          area.is_mapped
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                        }`}>
                          {area.is_mapped ? 'Haritalandırılmış' : 'Eşleştirilmemiş'}
                        </span>
                        <button
                          onClick={() => handleAreaClick(area)}
                          className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <FloorManagement
                facilityId={facilityId}
                selectedFloor={selectedFloor}
                onFloorUpdate={() => {
                  // Kat listesini yenile
                  setSelectedFloor(null);
                }}
              />
            )}
          </>
        )}
      </div>

      {/* Area Mapping Modal */}
      <AreaMappingModal
        isOpen={showMappingModal}
        onClose={() => setShowMappingModal(false)}
        area={selectedArea}
        floorId={selectedFloor?.id}
        dxfEntities={floorData?.dxf_data?.entities}
        onSave={handleMappingSave}
      />

      {/* Polygon Mapping Modal */}
      <PolygonMappingModal
        isOpen={showPolygonMappingModal}
        onClose={() => setShowPolygonMappingModal(false)}
        dxfEntity={selectedDxfEntity}
        areas={areas}
        onSave={handleMappingSave}
      />

      {/* Area Creation/Edit Modal */}
      <AreaModal
        isOpen={showAreaModal}
        onClose={() => {
          setShowAreaModal(false);
          setSelectedArea(null);
        }}
        onSuccess={handleAreaSave}
        editArea={selectedArea}
        preSelectedFloorId={selectedFloor?.id}
      />

      {/* Floor Management Modal */}
      {showFloorManagement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold">Kat Yönetimi</h2>
              <button
                onClick={() => setShowFloorManagement(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                Kapat
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <FloorManagement
                facilityId={facilityId}
                onFloorUpdate={() => {
                  setShowFloorManagement(false);
                  setSelectedFloor(null);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacilityMapPage;