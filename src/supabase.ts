import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface Rental {
  id: number;
  address: string;
  price: number;
  price_display: string;
  bedrooms: number | null;
  bedrooms_display: string;
  bathrooms: string | null;
  sqft: string | null;
  url: string;
  listing_source: string | null;
  source: string;
  scraped_date: string;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  updated_at: string;
}

// Fetch all rentals from Supabase
export async function fetchRentals() {
  const { data, error } = await supabase
    .from('rentals')
    .select('*')
    .order('price', { ascending: true });

  if (error) {
    console.error('Error fetching rentals:', error);
    throw error;
  }

  return data as Rental[];
}

// Fetch rentals by bedroom count
export async function fetchRentalsByBedrooms(bedrooms: number | null) {
  let query = supabase
    .from('rentals')
    .select('*');

  if (bedrooms !== null) {
    query = query.eq('bedrooms', bedrooms);
  }

  const { data, error } = await query
    .order('price', { ascending: true });

  if (error) {
    console.error('Error fetching rentals:', error);
    throw error;
  }

  return data as Rental[];
}

// Get price stats
export async function getPriceStats() {
  const { data, error } = await supabase
    .from('rentals')
    .select('price')
    .not('price', 'is', null);

  if (error) {
    console.error('Error fetching price stats:', error);
    return { min: 0, max: 0, avg: 0 };
  }

  if (!data || data.length === 0) {
    return { min: 0, max: 0, avg: 0 };
  }

  const prices = data.map(r => r.price).filter(p => p > 0);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const avg = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);

  return { min, max, avg };
}
