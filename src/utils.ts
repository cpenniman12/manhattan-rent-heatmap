import { MapBounds, MapSettings } from './types';

// App constants
export const MAP_SETTINGS: MapSettings = {
  MANHATTAN_CENTER: [-73.9712, 40.7831], // Manhattan center coordinates
  INITIAL_ZOOM: 11, // Start with block-level clustering
  MAX_ZOOM: 16,
  MIN_ZOOM: 8, // Allow zooming out to see borough level
};

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000',
  DEBOUNCE_MS: 300,
};

// Color scale for rent visualization - smooth gradient
export const createColorScale = (rentValues: number[]) => {
  const minRent = Math.min(...rentValues);
  const maxRent = Math.max(...rentValues);
  
  // Create a continuous color scale
  const scale = (rent: number): string => {
    // Normalize rent to 0-1 range
    const normalized = (rent - minRent) / (maxRent - minRent);
    
    // Create smooth gradient from cool to hot colors
    if (normalized <= 0.2) {
      // Very low rent: Deep blue to light blue
      const t = normalized / 0.2;
      return interpolateColor('#1a1a2e', '#16537e', t);
    } else if (normalized <= 0.4) {
      // Low rent: Light blue to teal
      const t = (normalized - 0.2) / 0.2;
      return interpolateColor('#16537e', '#0f9b8e', t);
    } else if (normalized <= 0.6) {
      // Medium rent: Teal to yellow-green
      const t = (normalized - 0.4) / 0.2;
      return interpolateColor('#0f9b8e', '#a2d5f2', t);
    } else if (normalized <= 0.8) {
      // High rent: Yellow-green to orange
      const t = (normalized - 0.6) / 0.2;
      return interpolateColor('#a2d5f2', '#ffa726', t);
    } else {
      // Very high rent: Orange to deep red
      const t = (normalized - 0.8) / 0.2;
      return interpolateColor('#ffa726', '#e53935', t);
    }
  };
  
  // Add domain and range properties for compatibility
  scale.domain = () => [minRent, maxRent];
  scale.range = () => ['#1a1a2e', '#16537e', '#0f9b8e', '#a2d5f2', '#ffa726', '#e53935'];
  scale.quantiles = () => {
    const step = (maxRent - minRent) / 6;
    return [
      minRent + step,
      minRent + step * 2,
      minRent + step * 3,
      minRent + step * 4,
      minRent + step * 5,
    ];
  };
  
  return scale;
};

// Helper function to interpolate between two colors
const interpolateColor = (color1: string, color2: string, t: number): string => {
  // Convert hex to RGB
  const hex2rgb = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b];
  };
  
  // Convert RGB to hex
  const rgb2hex = (r: number, g: number, b: number) => {
    return '#' + Math.round(r).toString(16).padStart(2, '0') + 
           Math.round(g).toString(16).padStart(2, '0') + 
           Math.round(b).toString(16).padStart(2, '0');
  };
  
  const [r1, g1, b1] = hex2rgb(color1);
  const [r2, g2, b2] = hex2rgb(color2);
  
  const r = r1 + (r2 - r1) * t;
  const g = g1 + (g2 - g1) * t;
  const b = b1 + (b2 - b1) * t;
  
  return rgb2hex(r, g, b);
};

// Format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format date for last updated stamp
export const formatLastUpdated = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  }).format(date);
};

// Calculate map bounds
export const calculateBounds = (lng: number, lat: number, zoom: number): MapBounds => {
  // Rough calculation - in production you'd use Mapbox's bounds calculation
  const latDelta = 0.5 / Math.pow(2, zoom - 10);
  const lngDelta = 0.5 / Math.pow(2, zoom - 10);
  
  return {
    minLon: lng - lngDelta,
    minLat: lat - latDelta,
    maxLon: lng + lngDelta,
    maxLat: lat + latDelta,
  };
};

// Debounce function
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
};

// Clamp value between min and max
export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

// Generate sample grid tile data for development (remove when backend is connected)
export const generateSampleData = () => {
  const features = [];

  // Manhattan bounding box - extended to cover full island
  const minLat = 40.6950;  // Battery Park (southern tip)
  const maxLat = 40.8800;  // Inwood (northern tip)
  const minLng = -74.0200; // West side (Hudson River)
  const maxLng = -73.9100; // East side (East River)

  // Grid size - smaller for more detail and better coverage
  const gridSize = 0.008; // Bigger tiles for smoother colors

  // Overlap factor to ensure 100% coverage with no gaps
  const overlap = 0.08; // 8% overlap on each side for complete coverage
  const tileSize = gridSize * (1 + overlap);

  // Create grid tiles
  for (let lat = minLat; lat < maxLat; lat += gridSize) {
    for (let lng = minLng; lng < maxLng; lng += gridSize) {
      const tileCenterLat = lat + gridSize / 2;
      const tileCenterLng = lng + gridSize / 2;

      // Only create tiles over Manhattan land area
      if (!isLikelyLandArea(tileCenterLat, tileCenterLng)) {
        continue;
      }

      // Calculate realistic average rent for this tile
      const averageRent = calculateRealisticRent(tileCenterLat, tileCenterLng);

      // Random number of apartments in this tile (1-15)
      const apartmentCount = Math.floor(Math.random() * 15) + 1;

      // Get neighborhood name for this tile
      const neighborhood = getNeighborhood(tileCenterLat, tileCenterLng);

      // Create polygon coordinates for the grid square with overlap
      // Center the tile and extend it by the overlap amount
      const offset = (tileSize - gridSize) / 2;
      const tileCoordinates = [
        [
          [lng - offset, lat - offset],                    // Bottom-left
          [lng + gridSize + offset, lat - offset],         // Bottom-right
          [lng + gridSize + offset, lat + gridSize + offset], // Top-right
          [lng - offset, lat + gridSize + offset],         // Top-left
          [lng - offset, lat - offset]                     // Close the polygon
        ]
      ];

      features.push({
        type: 'Feature' as const,
        properties: {
          price: averageRent,
          count: apartmentCount,
          neighborhood: neighborhood,
          beds: 1,
          price_display: `$${averageRent.toLocaleString()}`,
          cluster_type: 'grid' as const
        },
        geometry: {
          type: 'Polygon' as const,
          coordinates: tileCoordinates,
        },
      });
    }
  }

  return {
    type: 'FeatureCollection' as const,
    features,
  };
};

// Get neighborhood name based on coordinates
const getNeighborhood = (lat: number, lng: number): string => {
  // Very simplified neighborhood mapping
  if (lat < 40.715) return 'Financial District';
  if (lat < 40.725) return 'Tribeca';
  if (lat < 40.735) return 'SoHo';
  if (lat < 40.745) return 'Greenwich Village';
  if (lat < 40.755) return 'Chelsea';
  if (lat < 40.765) return 'Midtown';
  if (lat < 40.775) return 'Midtown East';
  if (lat < 40.785) return lng < -73.96 ? 'Upper West Side' : 'Upper East Side';
  if (lat < 40.800) return lng < -73.96 ? 'Upper West Side' : 'Upper East Side';
  return 'Harlem';
};

// Manhattan island boundary polygon (lng, lat pairs tracing the coastline)
// This follows the actual shoreline more accurately than rectangular bands
const MANHATTAN_BOUNDARY: [number, number][] = [
  // Starting at Battery Park (southern tip), going clockwise
  [-74.0153, 40.7004],  // Battery Park south
  [-74.0189, 40.7032],  // Battery Park west
  [-74.0163, 40.7106],  // West side near World Trade Center
  [-74.0131, 40.7190],  // West side Tribeca
  [-74.0110, 40.7268],  // West side SoHo
  [-74.0095, 40.7330],  // West side Greenwich Village
  [-74.0085, 40.7420],  // West side Chelsea (14th St area)
  [-74.0070, 40.7525],  // West side Chelsea/Penn Station
  [-74.0055, 40.7620],  // West side Hell's Kitchen
  [-74.0035, 40.7720],  // West side Lincoln Center
  [-73.9970, 40.7810],  // West side Upper West Side (79th St)
  [-73.9920, 40.7920],  // West side Upper West Side (96th St)
  [-73.9685, 40.8030],  // West side Morningside Heights
  [-73.9625, 40.8125],  // West side Harlem
  [-73.9545, 40.8255],  // West side Washington Heights
  [-73.9385, 40.8505],  // West side Fort George
  [-73.9215, 40.8725],  // Inwood Hill Park (northern tip)
  [-73.9105, 40.8755],  // Spuyten Duyvil (very north)
  // Now going south along the East side (Harlem River / East River)
  [-73.9135, 40.8680],  // East side Inwood
  [-73.9275, 40.8450],  // East side Washington Heights
  [-73.9340, 40.8300],  // East side Hamilton Heights
  [-73.9360, 40.8150],  // East side Harlem
  [-73.9385, 40.8000],  // East side East Harlem (125th St)
  [-73.9420, 40.7900],  // East side East Harlem (110th St)
  [-73.9450, 40.7820],  // East side Upper East Side (96th St)
  [-73.9495, 40.7720],  // East side Upper East Side (79th St)
  [-73.9565, 40.7620],  // East side Upper East Side (66th St)
  [-73.9610, 40.7550],  // East side Midtown East (59th St)
  [-73.9650, 40.7480],  // East side Turtle Bay
  [-73.9685, 40.7400],  // East side Murray Hill
  [-73.9720, 40.7330],  // East side Gramercy
  [-73.9745, 40.7250],  // East side East Village
  [-73.9760, 40.7150],  // East side Lower East Side
  [-73.9985, 40.7070],  // East side near Brooklyn Bridge
  [-74.0025, 40.7020],  // South Street Seaport
  [-74.0153, 40.7004],  // Back to Battery Park (close polygon)
];

// Point-in-polygon algorithm (ray casting)
const pointInPolygon = (lat: number, lng: number, polygon: [number, number][]): boolean => {
  let inside = false;
  const n = polygon.length;

  for (let i = 0, j = n - 1; i < n; j = i++) {
    const [xi, yi] = polygon[i]; // lng, lat
    const [xj, yj] = polygon[j]; // lng, lat

    // Check if point's lat is between the edge's lat range
    // and if the point is to the left of the edge
    if (((yi > lat) !== (yj > lat)) &&
        (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }

  return inside;
};

// Helper function to determine if coordinates are over Manhattan land
const isLikelyLandArea = (lat: number, lng: number): boolean => {
  // Use point-in-polygon check against actual Manhattan boundary
  return pointInPolygon(lat, lng, MANHATTAN_BOUNDARY);
};

// Calculate realistic rent based on Manhattan location
const calculateRealisticRent = (lat: number, lng: number): number => {
  // Base rent
  let rent = 3000;
  
  // South of 14th St (Financial District, SoHo, Tribeca) - expensive
  if (lat < 40.7359) {
    rent += 2000;
  }
  // Midtown (14th - 59th) - very expensive
  else if (lat < 40.7831) {
    rent += 2500;
  }
  // Upper East/West Side (59th - 96th) - expensive
  else if (lat < 40.7956) {
    rent += 1500;
  }
  // Above 96th - more affordable
  else {
    rent += 500;
  }
  
  // West side premium (closer to Hudson River parks)
  if (lng < -73.99) {
    rent += 800;
  }
  // East side premium (closer to Central Park)
  else if (lng > -73.96) {
    rent += 600;
  }
  
  // Add some realistic variation
  const variation = (Math.random() - 0.5) * 1000;
  rent += variation;
  
  // Keep within realistic bounds
  return Math.max(1800, Math.min(8000, Math.round(rent)));
};

// Generate Manhattan grid tiles WITHOUT price data (for use with real listings)
export const generateManhattanGrid = () => {
  const features = [];

  // Manhattan bounding box
  const minLat = 40.6950;
  const maxLat = 40.8800;
  const minLng = -74.0200;
  const maxLng = -73.9100;
  const gridSize = 0.008; // Bigger tiles for smoother colors
  const overlap = 0.08;
  const tileSize = gridSize * (1 + overlap);

  for (let lat = minLat; lat < maxLat; lat += gridSize) {
    for (let lng = minLng; lng < maxLng; lng += gridSize) {
      const tileCenterLat = lat + gridSize / 2;
      const tileCenterLng = lng + gridSize / 2;

      if (!isLikelyLandArea(tileCenterLat, tileCenterLng)) {
        continue;
      }

      const offset = (tileSize - gridSize) / 2;
      const tileCoordinates = [
        [
          [lng - offset, lat - offset],
          [lng + gridSize + offset, lat - offset],
          [lng + gridSize + offset, lat + gridSize + offset],
          [lng - offset, lat + gridSize + offset],
          [lng - offset, lat - offset]
        ]
      ];

      const neighborhood = getNeighborhood(tileCenterLat, tileCenterLng);

      features.push({
        type: 'Feature' as const,
        properties: {
          price: 0,  // Will be filled in by assignListingsToTiles
          count: 0,
          neighborhood: neighborhood,
          beds: 0,
          price_display: '',
          cluster_type: 'grid' as const,
          center_lat: tileCenterLat,
          center_lng: tileCenterLng,
        },
        geometry: {
          type: 'Polygon' as const,
          coordinates: tileCoordinates,
        },
      });
    }
  }

  return features;
};

// Find which tile contains a given coordinate
const findTileForCoordinate = (tiles: any[], lat: number, lng: number): number | null => {
  const gridSize = 0.008;

  for (let i = 0; i < tiles.length; i++) {
    const tile = tiles[i];
    const centerLat = tile.properties.center_lat;
    const centerLng = tile.properties.center_lng;

    // Check if coordinate is within this tile's bounds (half gridSize in each direction)
    const halfGrid = gridSize / 2;
    if (lat >= centerLat - halfGrid && lat < centerLat + halfGrid &&
        lng >= centerLng - halfGrid && lng < centerLng + halfGrid) {
      return i;
    }
  }
  return null;
};

// Assign real rental listings to grid tiles and calculate average prices
export const assignListingsToTiles = (tiles: any[], rentals: any[]) => {
  // Create a map to track which rentals belong to which tile
  const tileListings = new Map<number, number[]>();

  // Group tiles by neighborhood for fallback (rentals without coordinates)
  const tilesByNeighborhood = new Map<string, number[]>();
  tiles.forEach((tile, index) => {
    const hood = tile.properties.neighborhood;
    if (!tilesByNeighborhood.has(hood)) {
      tilesByNeighborhood.set(hood, []);
    }
    tilesByNeighborhood.get(hood)!.push(index);
  });

  // Assign each rental to a tile
  rentals.forEach((rental) => {
    if (!rental.price || rental.price <= 0) return;

    let tileIndex: number | null = null;

    // First try: Use real geocoded coordinates if available
    if (rental.latitude != null && rental.longitude != null) {
      tileIndex = findTileForCoordinate(tiles, rental.latitude, rental.longitude);
    }

    // Fallback: Use address-based neighborhood guessing
    if (tileIndex === null) {
      const rentalNeighborhood = guessNeighborhoodFromAddress(rental.address);
      const tilesInNeighborhood = tilesByNeighborhood.get(rentalNeighborhood);

      if (tilesInNeighborhood && tilesInNeighborhood.length > 0) {
        // Pick a random tile in this neighborhood
        tileIndex = tilesInNeighborhood[Math.floor(Math.random() * tilesInNeighborhood.length)];
      }
    }

    if (tileIndex === null) return;

    if (!tileListings.has(tileIndex)) {
      tileListings.set(tileIndex, []);
    }
    tileListings.get(tileIndex)!.push(rental.price);
  });

  // Update tiles with actual data
  return tiles.map((tile, index) => {
    const prices = tileListings.get(index) || [];

    if (prices.length === 0) {
      // No data for this tile - don't display it
      return null;
    }

    const averagePrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);

    return {
      ...tile,
      properties: {
        ...tile.properties,
        price: averagePrice,
        count: prices.length,
        price_display: `$${averagePrice.toLocaleString()}/mo`,
      },
    };
  }).filter(tile => tile !== null);
};

// Guess neighborhood from address string by parsing street number to estimate latitude
const guessNeighborhoodFromAddress = (address: string): string => {
  const lowerAddress = address.toLowerCase();

  // Try to extract street number from address (e.g., "145 W 58th St" -> 58)
  // Patterns: "W 58th", "E 86th", "West 23rd", "East 110th"
  const streetMatch = lowerAddress.match(/\b([we]|west|east)\s+(\d+)(?:st|nd|rd|th)/);
  if (streetMatch) {
    const streetNum = parseInt(streetMatch[2]);
    const isWest = streetMatch[1][0] === 'w';

    // Estimate latitude based on street number
    // Houston St (0) ≈ 40.723, streets go up roughly 0.00136 degrees per block (1/73.5)
    const estimatedLat = 40.723 + (streetNum * 0.00136);
    const estimatedLng = isWest ? -73.98 : -73.95; // West side vs East side

    // Use the same getNeighborhood function that tiles use
    return getNeighborhood(estimatedLat, estimatedLng);
  }

  // Try to extract avenue addresses (e.g., "830 8th Ave" -> between 52nd-53rd St)
  const aveMatch = lowerAddress.match(/(\d+)\s+(\d+)(?:st|nd|rd|th)?\s+ave/);
  if (aveMatch) {
    const buildingNum = parseInt(aveMatch[1]);
    // Estimate cross street from building number (rough approximation)
    // 8th Ave: numbers go up ~100 per block, starts around 14th St
    const estimatedStreet = Math.floor(buildingNum / 100) + 14;
    const estimatedLat = 40.723 + (estimatedStreet * 0.00136);
    return getNeighborhood(estimatedLat, -73.98);
  }

  // Check for explicit neighborhood names
  if (lowerAddress.includes('harlem')) return 'Harlem';
  if (lowerAddress.includes('upper east')) return 'Upper East Side';
  if (lowerAddress.includes('upper west')) return 'Upper West Side';
  if (lowerAddress.includes('midtown')) return 'Midtown';
  if (lowerAddress.includes('chelsea')) return 'Chelsea';
  if (lowerAddress.includes('village')) return 'Greenwich Village';
  if (lowerAddress.includes('soho')) return 'SoHo';
  if (lowerAddress.includes('tribeca')) return 'Tribeca';
  if (lowerAddress.includes('financial')) return 'Financial District';

  // Default to Midtown for unparseable addresses
  return 'Midtown';
}; 