import React, { useState, useEffect } from 'react';
import { ChevronDown, Building2, Layers, Plus, AlertCircle } from 'lucide-react';
import axios from 'axios';

const FloorSelector = ({ facilityId, selectedFloorId, onFloorSelect, onAddFloor }) => {
  const [blocks, setBlocks] = useState([]);
  const [floors, setFloors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!facilityId) {
        console.warn('FloorSelector: No facilityId provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log('FloorSelector: Fetching blocks for facility:', facilityId);

        // Blokları al
        const blocksResponse = await axios.get(`/api/facilities/${facilityId}/blocks`);
        console.log('FloorSelector: Blocks response:', blocksResponse.data);
        const blocksData = blocksResponse.data || [];
        setBlocks(blocksData);

        // Eğer blok yoksa, kullanıcıyı bilgilendir
        if (blocksData.length === 0) {
          console.log('FloorSelector: No blocks found for this facility');
          setFloors([]);
          setLoading(false);
          return;
        }

        // Tüm katları al
        const allFloors = [];
        for (const block of blocksData) {
          console.log('FloorSelector: Fetching floors for block:', block.id, block.block_name);
          try {
            const floorsResponse = await axios.get(`/api/eams/floors/block/${block.id}`);
            console.log('FloorSelector: Floors response for block', block.id, ':', floorsResponse.data);
            const blockFloors = (floorsResponse.data || []).map(f => ({
              ...f,
              block_id: block.id,
              block_name: block.block_name
            }));
            allFloors.push(...blockFloors);
          } catch (floorError) {
            console.error(`FloorSelector: Error fetching floors for block ${block.id}:`, floorError);
          }
        }

        // Kat numarasına göre sırala
        allFloors.sort((a, b) => {
          if (a.block_name !== b.block_name) {
            return a.block_name.localeCompare(b.block_name);
          }
          return (a.floor_number || 0) - (b.floor_number || 0);
        });
        console.log('FloorSelector: All floors:', allFloors);
        setFloors(allFloors);
      } catch (error) {
        console.error('Floor selector fetch error:', error);
        console.error('Error details:', error.response?.data || error.message);
        setError(error.response?.data?.error || error.message || 'Veri yüklenirken hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [facilityId]);

  const selectedFloor = floors.find(f => f.id === selectedFloorId);

  const handleSelect = (floor) => {
    onFloorSelect?.(floor);
    setIsOpen(false);
  };

  if (loading) {
    return (
      <div className="w-64 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"></div>
    );
  }

  if (error) {
    return (
      <div className="w-64 px-4 py-2 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/20 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
        <AlertCircle className="w-4 h-4" />
        <span>Yüklenemedi</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-64 flex items-center justify-between px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg hover:border-gray-400 dark:hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <span className="text-gray-900 dark:text-gray-100 font-medium">
            {selectedFloor
              ? `${selectedFloor.block_name} - ${selectedFloor.floor_name}`
              : 'Kat Seçin'
            }
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg z-50 max-h-80 overflow-auto transition-colors">
            {blocks.length === 0 ? (
              <div className="p-4 text-gray-500 dark:text-gray-400 text-center">
                <Building2 className="w-8 h-8 mx-auto mb-2 text-gray-400 dark:text-gray-600" />
                <p className="font-medium text-gray-900 dark:text-gray-100">Henüz blok tanımlanmamış</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  Tesis ayarlarından blok ekleyin
                </p>
              </div>
            ) : (
              <>
                {blocks.map(block => {
                  const blockFloors = floors.filter(f => f.block_id === block.id);

                  return (
                    <div key={block.id} className="border-b border-gray-100 dark:border-gray-800 last:border-0">
                      <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800/50 flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        <span className="font-medium text-gray-700 dark:text-gray-300">{block.block_name}</span>
                      </div>
                      {blockFloors.length === 0 ? (
                        <div className="px-4 py-2 text-sm text-gray-400 dark:text-gray-500 italic">
                          Bu blokta kat bulunmuyor
                        </div>
                      ) : (
                        blockFloors.map(floor => (
                          <button
                            key={floor.id}
                            onClick={() => handleSelect(floor)}
                            className={`w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-between transition-colors ${
                              selectedFloorId === floor.id ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            <span className="text-sm font-medium">{floor.floor_name}</span>
                            {floor.dxf_file_path && (
                              <span className="text-[10px] font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded border border-green-200 dark:border-green-800">
                                DXF
                              </span>
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  );
                })}
              </>
            )}

            {onAddFloor && (
                <button
                onClick={() => {
                  onAddFloor();
                  setIsOpen(false);
                }}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2 text-blue-600 dark:text-blue-400 border-t border-gray-100 dark:border-gray-800 transition-colors font-medium text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Yeni Kat Ekle</span>
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default FloorSelector;