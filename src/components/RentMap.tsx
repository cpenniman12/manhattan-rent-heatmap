import { useCallback, useState } from 'react';
import Map, { Layer, Source, MapLayerMouseEvent } from 'react-map-gl';
import { TileResponse, TooltipData } from '../types';
import { MAP_SETTINGS, debounce } from '../utils';
// import Tooltip from './Tooltip';
import { Loader2 } from 'lucide-react';

interface RentMapProps {
  data: TileResponse;
  onMapUpdate: (bounds: any, zoom: number) => void;
  onTooltip: (tooltip: TooltipData | null) => void;
  tooltip: TooltipData | null;
  isLoading: boolean;
}

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

const RentMap = ({
  data,
  onMapUpdate,
  onTooltip,
  tooltip,
  isLoading,
}: RentMapProps) => {
  const [viewState, setViewState] = useState({
    longitude: MAP_SETTINGS.MANHATTAN_CENTER[0],
    latitude: MAP_SETTINGS.MANHATTAN_CENTER[1],
    zoom: MAP_SETTINGS.INITIAL_ZOOM,
  });



  // Get rent values for color calculation
  const rentValues = data.features.map(f => f.properties.price);

  // Debounced map update handler
  const debouncedMapUpdate = useCallback(
    debounce((bounds: any, zoom: number) => {
      onMapUpdate(bounds, zoom);
    }, 300),
    [onMapUpdate]
  );

  const handleMove = useCallback((evt: any) => {
    setViewState(evt.viewState);
    debouncedMapUpdate(evt.viewState.bounds, evt.viewState.zoom);
  }, [debouncedMapUpdate]);

  const handleMouseEnter = useCallback((event: MapLayerMouseEvent) => {
    if (event.features && event.features[0] && event.features[0].layer.id === 'rent-grid') {
      const feature = event.features[0];
      const properties = feature.properties as any;

      onTooltip({
        x: event.point.x,
        y: event.point.y,
        price: properties.price,
        address: properties.neighborhood, // Use neighborhood as address for grid tiles
        neighborhood: properties.neighborhood,
        beds: properties.beds,
        count: properties.count || 1,
        cluster_type: properties.cluster_type || 'grid'
      });
    } else {
      onTooltip(null);
    }
  }, [onTooltip]);

  const handleMouseLeave = useCallback(() => {
    onTooltip(null);
  }, [onTooltip]);

  // Create high-granularity color scale with strictly ascending breakpoints
  const createGridColorExpression = () => {
    if (rentValues.length === 0) return '#3b82f6';

    const minRent = Math.min(...rentValues);
    const maxRent = Math.max(...rentValues);

    console.log('🎨 Color Scale Info:');
    console.log(`  Min Rent: $${minRent}`);
    console.log(`  Max Rent: $${maxRent}`);
    console.log(`  Total tiles: ${rentValues.length}`);

    // Get unique sorted prices for proper breakpoints
    const uniquePrices = [...new Set(rentValues)].sort((a, b) => a - b);

    // If very few unique values, use simple linear scale
    if (uniquePrices.length < 5) {
      return [
        'interpolate',
        ['linear'],
        ['get', 'price'],
        minRent, '#1e3a8a',
        maxRent, '#dc2626'
      ];
    }

    // Build breakpoints ensuring strictly ascending order
    const colors = [
      '#1e3a8a', '#2563eb', '#0891b2', '#0d9488', '#059669',
      '#65a30d', '#ca8a04', '#ea580c', '#dc2626', '#991b1b', '#450a0a'
    ];

    const numStops = Math.min(colors.length, uniquePrices.length);
    const expression: any[] = ['interpolate', ['linear'], ['get', 'price']];

    for (let i = 0; i < numStops; i++) {
      const idx = Math.floor(i * (uniquePrices.length - 1) / (numStops - 1));
      const price = uniquePrices[idx];
      expression.push(price, colors[i]);
    }

    console.log(`  Using ${numStops} color stops`);
    return expression;
  };

  // Grid tile layer styles with smooth transitions
  const gridLayerStyle: any = {
    'fill-color': createGridColorExpression(),
    'fill-opacity': [
      'case',
      ['boolean', ['feature-state', 'hover'], false],
      0.95,  // Full opacity on hover
      0.75   // Default opacity
    ],
  };

  // Grid outline layer styles - subtle borders
  const gridOutlineStyle: any = {
    'line-color': '#ffffff',
    'line-width': [
      'case',
      ['boolean', ['feature-state', 'hover'], false],
      2,     // Thicker border on hover
      0.5    // Thin border normally
    ],
    'line-opacity': 0.4,
  };

  return (
    <div className="relative w-full h-full"
         style={{ minHeight: '400px' }}>

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 z-10 flex items-center justify-center">
          <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-lg">
            <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
            <span className="text-sm font-medium text-gray-700">Loading data...</span>
          </div>
        </div>
      )}

      <Map
        {...viewState}
        onMove={handleMove}
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/light-v10"
        interactiveLayerIds={['rent-grid']}
        onMouseMove={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        minZoom={MAP_SETTINGS.MIN_ZOOM}
        maxZoom={MAP_SETTINGS.MAX_ZOOM}
        scrollZoom={{ around: 'center' }}
      >
        <Source
          id="rent-data"
          type="geojson"
          data={data}
        >
          {/* Grid fill layer - the heat map tiles */}
          <Layer
            id="rent-grid"
            type="fill"
            paint={gridLayerStyle}
            beforeId="waterway-label"
          />
          {/* Grid outline layer - borders around tiles */}
          <Layer
            id="rent-grid-outline"
            type="line"
            paint={gridOutlineStyle}
            beforeId="waterway-label"
          />
        </Source>
      </Map>

      {/* Modern Tooltip */}
      {tooltip && (
        <div
          className="absolute z-50 pointer-events-none"
          style={{
            left: tooltip.x + 15,
            top: tooltip.y - 15,
            transform: 'translateY(-100%)',
          }}
        >
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white px-4 py-3 rounded-xl shadow-2xl border border-gray-700 backdrop-blur-sm">
            {/* Price - Large and prominent */}
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                ${tooltip.price.toLocaleString()}
              </span>
              <span className="text-xs text-gray-400 font-medium">/ month</span>
            </div>

            {/* Details */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm">
                <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-gray-300">{tooltip.neighborhood}</span>
              </div>

              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span>{tooltip.count} listing{tooltip.count !== 1 ? 's' : ''}</span>
                <span>•</span>
                <span>{tooltip.beds} bed</span>
              </div>
            </div>

            {/* Small arrow pointing to tile */}
            <div className="absolute bottom-0 left-4 transform translate-y-1/2 rotate-45 w-2 h-2 bg-gray-800 border-r border-b border-gray-700"></div>
          </div>
        </div>
      )}

      {/* Elegant info card with gradient legend */}
      <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-4 text-xs max-w-xs border border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <p className="font-semibold text-gray-800">Rent Heat Map</p>
        </div>
        {/* Gradient bar */}
        <div className="mb-2">
          <div className="h-3 rounded-full" style={{
            background: 'linear-gradient(to right, #1e3a8a, #2563eb, #0891b2, #0d9488, #059669, #65a30d, #ca8a04, #ea580c, #dc2626, #991b1b, #450a0a)'
          }}></div>
          <div className="flex justify-between mt-1 text-[10px] text-gray-500">
            <span>Affordable</span>
            <span>Moderate</span>
            <span>Premium</span>
          </div>
        </div>
        <p className="text-gray-500 text-[10px]">Colors based on actual price distribution</p>
        <p className="text-cyan-600 mt-2 text-[11px] font-medium">💡 Hover over tiles for pricing details</p>
      </div>

      {/* Mapbox attribution - required by terms */}
      <div className="absolute bottom-2 right-2 text-xs text-gray-500">
        <a 
          href="https://www.mapbox.com/about/maps/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:underline"
        >
          © Mapbox
        </a>
      </div>
    </div>
  );
};

export default RentMap; 