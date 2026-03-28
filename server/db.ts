import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseKey) return null;
  if (!_client) _client = createClient(supabaseUrl, supabaseKey);
  return _client;
}

export interface EventRow {
  id: string;
  name: string;
  provider: string;
  venue: string;
  address: string;
  latitude: number;
  longitude: number;
  rating: number;
  checkins: number;
  categories: string[];
  days_of_week: string[];
  age_range: string;
  age_min_months: number;
  age_max_months: number;
  description: string;
  source_url: string;
  source_page: string;
  last_synced_at: string;
}

/**
 * Returns all events if the most recently synced batch is within maxAgeMs.
 * Returns null if the DB is empty or the data is stale (triggers a re-scrape).
 */
export async function queryFreshEvents(maxAgeMs: number): Promise<EventRow[] | null> {
  const client = getClient();
  if (!client) return null;

  // Check the most recent sync timestamp
  const { data: latest, error: tsError } = await client
    .from('events')
    .select('last_synced_at')
    .order('last_synced_at', { ascending: false })
    .limit(1)
    .single();

  if (tsError || !latest) return null;

  const age = Date.now() - new Date(latest.last_synced_at).getTime();
  if (age > maxAgeMs) return null;

  // Data is fresh — return all events
  const { data, error } = await client.from('events').select('*');
  if (error) {
    console.error('[db] queryFreshEvents error:', error.message);
    return null;
  }
  return data as EventRow[];
}

/**
 * Upserts a batch of events, stamping all rows with the current time.
 */
export async function upsertEvents(rows: EventRow[]): Promise<void> {
  const client = getClient();
  if (!client || rows.length === 0) return;

  const now = new Date().toISOString();
  const stamped = rows.map(r => ({ ...r, last_synced_at: now }));

  const { error } = await client
    .from('events')
    .upsert(stamped, { onConflict: 'id' });

  if (error) {
    console.error('[db] upsertEvents error:', error.message);
  } else {
    console.log(`[db] Upserted ${rows.length} events`);
  }
}
