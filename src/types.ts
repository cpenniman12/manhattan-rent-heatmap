export interface RentData {
  price: number;
  address: string;
  neighborhood: string;
  building_name?: string;
  beds: number;
  price_display: string;
  count?: number;
  cluster_type?: 'individual' | 'block' | 'neighborhood' | 'borough';
}

export interface ListingFeature {
  type: 'Feature';
  properties: RentData;
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
}

export interface TileResponse {
  type: 'FeatureCollection';
  features: ListingFeature[];
  meta?: {
    zoom: number;
    total_listings: number;
    cluster_count: number;
    cluster_type: string;
  };
}

export interface MapBounds {
  minLon: number;
  minLat: number;
  maxLon: number;
  maxLat: number;
}

export interface Filters {
  bedrooms: number;
}

export interface TooltipData {
  x: number;
  y: number;
  price: number;
  address: string;
  neighborhood: string;
  building_name?: string;
  beds: number;
  count?: number;
  cluster_type?: string;
}

export interface MapSettings {
  MANHATTAN_CENTER: [number, number];
  INITIAL_ZOOM: number;
  MAX_ZOOM: number;
  MIN_ZOOM: number;
} 