import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MapContainer, Polygon, Popup, CircleMarker, useMap, Polyline, useMapEvents } from 'react-leaflet';
import { CRS } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, AlertCircle, Wrench, CheckCircle, Maximize2, Minimize2 } from 'lucide-react';
import axios from 'axios';
import { useTheme } from '../contexts/ThemeContext';

// Global bounds cache for all entities
let globalBounds = null;

// DXF'den koordinat dönüşümü (AutoCAD koordinatlarını Leaflet koordinatlarına)
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
        if (entity.start && entity.end) {
          vertices = [entity.start, entity.end];
        }
        break;
      case 'CIRCLE':
      case 'ARC':
        if (entity.center) {
          vertices = [entity.center];
        }
        break;
      case 'TEXT':
      case 'MTEXT':
        if (entity.position) {
          vertices = [entity.position];
        }
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

  // Add some padding
  const padding = Math.max(maxX - minX, maxY - minY) * 0.1 || 1;
  return {
    minX: minX - padding,
    maxX: maxX + padding,
    minY: minY - padding,
    maxY: maxY + padding
  };
};

const transformCoordinates = (vertices, bounds, globalBoundsOverride = null) => {
  if (!vertices || vertices.length === 0) return [];

  const boundsToUse = globalBoundsOverride || globalBounds;
  if (!boundsToUse) return [];

  const width = boundsToUse.maxX - boundsToUse.minX || 1;
  const height = boundsToUse.maxY - boundsToUse.minY || 1;

  console.log('transformCoordinates: boundsToUse:', boundsToUse, 'width:', width, 'height:', height);
  console.log('transformCoordinates: input vertices:', vertices);

  // Leaflet Simple CRS'de koordinatlar [y, x] formatında
  const result = vertices.map((v, i) => {
    // Handle both lowercase and uppercase property names
    const xVal = v.x !== undefined ? v.x : (v.X !== undefined ? v.X : 0);
    const yVal = v.y !== undefined ? v.y : (v.Y !== undefined ? v.Y : 0);

    const x = parseFloat(xVal);
    const y = parseFloat(yVal);

    if (isNaN(x) || isNaN(y)) {
      console.log(`transformCoordinates: Vertex ${i} has invalid coordinates:`, v, 'x:', x, 'y:', y);
      return null;
    }

    const normalizedX = (x - boundsToUse.minX) / width;
    const normalizedY = (y - boundsToUse.minY) / height;

    const transformed = [
      bounds[1][0] - normalizedY * (bounds[1][0] - bounds[0][0]), // Y koordinatı (ters çevir)
      bounds[0][1] + normalizedX * (bounds[1][1] - bounds[0][1])  // X koordinatı
    ];

    console.log(`transformCoordinates: Vertex ${i}: (${x}, ${y}) -> (${transformed[0]}, ${transformed[1]})`);

    return transformed;
  }).filter(v => v !== null);

  console.log('transformCoordinates: result:', result);
  return result;
};

const reverseTransformCoordinates = (latLngs, bounds, globalBoundsOverride = null) => {
  if (!latLngs || latLngs.length === 0) return [];
  const boundsToUse = globalBoundsOverride || globalBounds;
  if (!boundsToUse) return [];

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

// Varlık durumuna göre renk
const getStatusColor = (status) => {
  switch (status) {
    case 'active': return '#22c55e';
    case 'maintenance': return '#eab308';
    case 'fault': return '#ef4444';
    default: return '#6b7280';
  }
};

// Varlık durumuna göre ikon
const StatusIcon = ({ status }) => {
  const color = getStatusColor(status);
  switch (status) {
    case 'active':
      return <CheckCircle className="w-4 h-4" style={{ color }} />;
    case 'maintenance':
      return <Wrench className="w-4 h-4" style={{ color }} />;
    case 'fault':
      return <AlertCircle className="w-4 h-4" style={{ color }} />;
    default:
      return <MapPin className="w-4 h-4" style={{ color }} />;
  }
};

// Harita fit bounds
const MapFitter = ({ bounds }) => {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds);
    }
  }, [map, bounds]);
  return null;
};

// Map click handler for drawing
const DrawingHandler = ({ isDrawing, onMapClick }) => {
  useMapEvents({
    click: (e) => {
      if (isDrawing) {
        onMapClick(e.latlng);
      }
    }
  });
  return null;
};

const FloorMap = ({ floorId, onAreaClick, onAssetClick, selectedAreaId, onDxfEntityClick, isDrawing, onDrawnPolygonSubmit, drawingPoints, setDrawingPoints, refreshTrigger }) => {
  const [floorData, setFloorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const mapBounds = [[0, 0], [1000, 1000]];

  // Calculate global bounds from all entities
  const entityBounds = useMemo(() => {
    if (!floorData?.dxf_data?.entities) return null;
    return calculateGlobalBounds(floorData.dxf_data.entities);
  }, [floorData?.dxf_data?.entities]);

  // Update global bounds when entity bounds change
  useEffect(() => {
    if (entityBounds) {
      globalBounds = entityBounds;
    }
  }, [entityBounds]);

  useEffect(() => {
    const fetchFloorData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/eams/map/floor/${floorId}`);
        console.log('FloorMap: API response:', response.data);
        console.log('FloorMap: dxf_data:', response.data?.dxf_data);
        console.log('FloorMap: entities:', response.data?.dxf_data?.entities);
        console.log('FloorMap: areas:', response.data?.areas);
        setFloorData(response.data);
      } catch (err) {
        setError('Kat verisi yüklenirken hata oluştu');
        console.error('Floor map fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (floorId) {
      fetchFloorData();
    }
  }, [floorId, refreshTrigger]);

  const renderDxfEntities = useCallback(() => {
    if (!floorData?.dxf_data?.entities) {
      console.log('FloorMap: No DXF entities found');
      return null;
    }

    const currentBounds = entityBounds || globalBounds;
    if (!currentBounds) {
      console.log('FloorMap: No bounds calculated yet');
      return null;
    }

    console.log('FloorMap: Rendering', floorData.dxf_data.entities.length, 'DXF entities');
    console.log('FloorMap: Using bounds:', currentBounds);

    return floorData.dxf_data.entities.map((entity, index) => {
      const key = `${entity.type}-${index}`;

      switch (entity.type) {
        case 'LWPOLYLINE':
        case 'POLYLINE':
          console.log('FloorMap: Entity', index, 'vertices:', entity.vertices);

          if (!entity.vertices || entity.vertices.length < 2) {
            console.log('FloorMap: Skipping entity', index, '- insufficient vertices:', entity.vertices?.length);
            return null;
          }

          // Check if vertices have valid x,y values
          const hasValidVertices = entity.vertices.some(v => v.x !== undefined && v.y !== undefined);
          if (!hasValidVertices) {
            console.log('FloorMap: Entity', index, 'has no valid vertices with x,y values');
            return null;
          }

          const positions = transformCoordinates(entity.vertices, mapBounds, currentBounds);
          console.log('FloorMap: Entity', index, 'positions:', positions);

          if (!positions || positions.length === 0) {
            console.log('FloorMap: Entity', index, 'has empty positions after transform');
            return null;
          }

          // Close the polygon if it's closed and has enough vertices
          if (entity.isClosed && positions.length >= 3) {
            return (
              <Polygon
                key={key}
                positions={positions}
                pathOptions={{
                  color: isDark ? '#9ca3af' : '#374151',
                  weight: 2,
                  fillColor: isDark ? '#1f2937' : '#f3f4f6',
                  fillOpacity: 0.5,
                  interactive: true
                }}
                eventHandlers={{
                  click: (e) => {
                    // map tıklarını durdurmak için
                    e.originalEvent?.stopPropagation();
                    onDxfEntityClick?.(entity);
                  }
                }}
              />
            );
          } else {
            // Render as polyline if not closed
            return (
              <Polyline
                key={key}
                positions={positions}
                pathOptions={{
                  color: isDark ? '#6b7280' : '#374151',
                  weight: 2
                }}
              />
            );
          }

        case 'LINE':
          console.log('FloorMap: LINE entity', index, ':', entity);
          console.log('FloorMap: LINE start:', entity.start, 'end:', entity.end);

          if (!entity.start || !entity.end) {
            console.log('FloorMap: LINE entity missing start or end');
            return null;
          }

          if (entity.start.x === undefined || entity.start.y === undefined ||
              entity.end.x === undefined || entity.end.y === undefined) {
            console.log('FloorMap: LINE entity has undefined coordinates');
            return null;
          }

          const startTransformed = transformCoordinates([{x: entity.start.x, y: entity.start.y}], mapBounds, currentBounds);
          const endTransformed = transformCoordinates([{x: entity.end.x, y: entity.end.y}], mapBounds, currentBounds);

          console.log('FloorMap: LINE startTransformed:', startTransformed);
          console.log('FloorMap: LINE endTransformed:', endTransformed);

          if (!startTransformed || !endTransformed || startTransformed.length === 0 || endTransformed.length === 0) {
            // console.log('FloorMap: LINE transform returned empty arrays');
            return null;
          }

          const linePositions = [startTransformed[0], endTransformed[0]];
          // console.log('FloorMap: LINE final positions:', linePositions);

          if (!linePositions[0] || !linePositions[1]) {
            console.log('FloorMap: LINE has null positions');
            return null;
          }

          return (
            <Polyline
              key={key}
              positions={linePositions}
              pathOptions={{
                color: isDark ? '#9ca3af' : '#374151',
                weight: 4,     // Kalınlaştırıldı ki tıklanabilsin
                interactive: true
              }}
              eventHandlers={{
                click: (e) => {
                  e.originalEvent?.stopPropagation();
                  onDxfEntityClick?.(entity);
                }
              }}
            />
          );

        case 'CIRCLE':
          if (!entity.center || !entity.radius) return null;
          const center = transformCoordinates([{x: entity.center.x, y: entity.center.y}], mapBounds, currentBounds)[0];
          // Calculate radius in pixels based on bounds
          const width = currentBounds.maxX - currentBounds.minX;
          const radiusPixels = (entity.radius / width) * 1000;
          return (
            <CircleMarker
              key={key}
              center={center}
              radius={Math.max(radiusPixels, 5)}
              pathOptions={{
                color: isDark ? '#9ca3af' : '#374151',
                weight: 2,
                fillColor: isDark ? '#1f2937' : '#f3f4f6',
                fillOpacity: 0.3
              }}
            />
          );

        case 'ARC':
          // For now, render arc as a small circle marker at center
          if (!entity.center) return null;
          const arcCenter = transformCoordinates([{x: entity.center.x, y: entity.center.y}], mapBounds, currentBounds)[0];
          return (
            <CircleMarker
              key={key}
              center={arcCenter}
              radius={5}
              pathOptions={{
                color: isDark ? '#9ca3af' : '#374151',
                weight: 2,
                fillColor: isDark ? '#1f2937' : '#f3f4f6',
                fillOpacity: 0.3
              }}
            />
          );

        default:
          return null;
      }
    });
  }, [floorData, mapBounds, entityBounds]);

  const renderAreaPolygons = useCallback(() => {
    if (!floorData?.areas) return null;

    const currentBounds = entityBounds || globalBounds;

    return floorData.areas.map((area) => {
      if (!area.geometry || !area.is_mapped) return null;

      let positions;
      if (area.geometry.coordinates) {
        positions = area.geometry.coordinates;
      } else if (area.geometry.vertices && currentBounds) {
        positions = transformCoordinates(area.geometry.vertices, mapBounds, currentBounds);
      } else {
        return null;
      }

      if (!positions || positions.length < 3) return null;

      const isSelected = selectedAreaId === area.id;
      const statusColor = area.status_color || '#9ca3af';

      return (
        <Polygon
          key={area.id}
          positions={positions}
          pathOptions={{
            color: isSelected ? '#3b82f6' : statusColor,
            weight: isSelected ? 3 : 2,
            fillColor: statusColor,
            fillOpacity: isSelected ? 0.5 : 0.3
          }}
          eventHandlers={{
            click: () => onAreaClick?.(area)
          }}
        >
          <Popup>
            <div className="p-2 dark:bg-gray-800">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">{area.area_name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{area.area_type_name}</p>
            </div>
          </Popup>
        </Polygon>
      );
    });
  }, [floorData, selectedAreaId, onAreaClick, mapBounds, entityBounds]);

  const renderAssets = useCallback(() => {
    if (!floorData?.areas) return null;
    const currentBounds = entityBounds || globalBounds;

    return floorData.areas.map(area => {
      if (!area.assets || area.assets.length === 0) return null;
      if (selectedAreaId && selectedAreaId !== area.id) return null;

      return area.assets.map((asset, index) => {
        let locX = parseFloat(asset.location_x);
        let locY = parseFloat(asset.location_y);

        if (isNaN(locX) || isNaN(locY)) {
          if (!area.center_x || !area.center_y) return null;
          
          const radius = Math.min(parseFloat(area.area_size || 20) / 15, 3) + (index * 0.1);
          const angle = index * (Math.PI * 2 / Math.max(area.assets.length, 1));
          
          locX = parseFloat(area.center_x) + Math.cos(angle) * radius;
          locY = parseFloat(area.center_y) + Math.sin(angle) * radius;
        }

        const positions = transformCoordinates([{ x: locX, y: locY }], mapBounds, currentBounds);
        if (!positions || positions.length === 0) return null;

        const isSelectedArea = selectedAreaId === area.id;
        const statusColor = getStatusColor(asset.status);

        return (
          <CircleMarker
            key={`asset-${asset.id}`}
            center={positions[0]}
            radius={isSelectedArea ? 8 : 6}
            pathOptions={{
              color: '#ffffff',
              weight: 2,
              fillColor: statusColor,
              fillOpacity: 1
            }}
            eventHandlers={{
              click: (e) => {
                e.originalEvent?.stopPropagation();
                onAssetClick?.(asset);
              }
            }}
          >
            <Popup>
              <div className="p-2 dark:bg-gray-800">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">{asset.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">Durum: {asset.status}</p>
              </div>
            </Popup>
          </CircleMarker>
        );
      });
    });
  }, [floorData, selectedAreaId, onAssetClick, mapBounds, entityBounds]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 dark:bg-gray-900 rounded-lg transition-colors duration-200">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20 transition-colors duration-200">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-2" />
          <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  // DXF verisi yoksa bilgi mesajı göster
  const hasDxfData = floorData?.dxf_data?.entities && floorData.dxf_data.entities.length > 0;

  if (!hasDxfData) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-dashed border-gray-200 dark:border-gray-800 transition-colors duration-200">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-2" />
          <p className="text-gray-600 dark:text-gray-400 font-medium">DXF dosyası yüklenmemiş</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Kat yönetiminden DXF dosyası yükleyin</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      <div className="absolute top-4 right-4 z-[1000] flex gap-2">
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          {isFullscreen ? (
            <Minimize2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          ) : (
            <Maximize2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          )}
        </button>
      </div>

      <MapContainer
        center={[500, 500]}
        zoom={0}
        crs={CRS.Simple}
        className={`w-full ${isFullscreen ? 'h-screen' : 'h-[600px]'} rounded-lg transition-colors duration-200 ${isDark ? 'bg-[#111827]' : 'bg-gray-100'}`}
        minZoom={-3}
        maxZoom={4}
      >
        <MapFitter bounds={mapBounds} />
        <DrawingHandler isDrawing={isDrawing} onMapClick={(latlng) => setDrawingPoints([...drawingPoints, latlng])} />
        
        {/* Drawn Polygon During Drawing Mode */}
        {isDrawing && drawingPoints.length > 0 && (
          <Polyline 
            positions={drawingPoints.map(p => [p.lat, p.lng])} 
            pathOptions={{ color: '#ef4444', weight: 3, dashArray: '5, 10' }} 
          />
        )}
        {isDrawing && drawingPoints.length > 2 && (
          <Polygon 
            positions={drawingPoints.map(p => [p.lat, p.lng])}
            pathOptions={{ color: '#ef4444', weight: 0, fillOpacity: 0.2 }}
          />
        )}
        
        {/* DXF Katmanı */}
        {renderDxfEntities()}
        
        {/* Mahaller Katmanı */}
        {renderAreaPolygons()}
        
        {/* Varlıklar (Cihazlar) Katmanı */}
        {renderAssets()}
      </MapContainer>
    </div>
  );
};

export default FloorMap;