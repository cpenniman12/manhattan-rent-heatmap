import { useState, useCallback, useEffect } from 'react';
import AppShell from './components/AppShell';
import RentMap from './components/RentMap';
import { Filters, TileResponse, TooltipData } from './types';
import { generateSampleData, generateManhattanGrid, assignListingsToTiles } from './utils';
import { fetchRentals, fetchRentalsByBedrooms, Rental } from './supabase';

function App() {
  const [filters] = useState<Filters>({ bedrooms: 0 }); // Default to Studios
  const [mapData, setMapData] = useState<TileResponse>(generateSampleData());
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Function to fetch data from Supabase and generate heat map tiles
  const fetchRentData = useCallback(async (bedrooms: number | null) => {
    try {
      setIsLoading(true);

      // Fetch real rentals from Supabase
      const rentals: Rental[] = bedrooms !== null
        ? await fetchRentalsByBedrooms(bedrooms)
        : await fetchRentals();

      console.log(`✅ Loaded ${rentals.length} rentals from Supabase`);
      console.log('Sample rentals:', rentals.slice(0, 3));

      // Generate Manhattan grid tiles
      const gridTiles = generateManhattanGrid();
      console.log(`📍 Generated ${gridTiles.length} grid tiles`);

      // Assign rentals to tiles and calculate average prices
      const tilesWithData = assignListingsToTiles(gridTiles, rentals);
      console.log(`🎨 Tiles with real data: ${tilesWithData.length}`);
      console.log('Sample tile data:', tilesWithData.slice(0, 3).map(t => ({
        neighborhood: t.properties.neighborhood,
        price: t.properties.price,
        count: t.properties.count
      })));

      setMapData({
        type: 'FeatureCollection',
        features: tilesWithData,
        meta: {
          total_listings: rentals.length,
          zoom: 11,
          cluster_count: tilesWithData.length,
          cluster_type: 'grid'
        }
      } as TileResponse);

    } catch (error) {
      console.error('Failed to fetch rent data from Supabase:', error);
      // Fallback to sample data if Supabase is not available
      setMapData(generateSampleData());
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleMapUpdate = useCallback(() => {
    // Map updates don't require re-fetching in grid-based approach
    // Data is already loaded and assigned to tiles
  }, []);

  // Load initial data
  useEffect(() => {
    fetchRentData(filters.bedrooms);
  }, []);

  return (
    <AppShell>
      <div className="h-full relative">
        {/* Map Container - Full Width */}
        <RentMap
          data={mapData}
          onMapUpdate={handleMapUpdate}
          onTooltip={setTooltip}
          tooltip={tooltip}
          isLoading={isLoading}
        />
      </div>
    </AppShell>
  );
}

export default App; 