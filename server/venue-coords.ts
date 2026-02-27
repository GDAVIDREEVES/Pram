interface VenueInfo {
  latitude: number;
  longitude: number;
  address: string;
  neighborhood: string;
}

export const VENUE_COORDINATES: Record<string, VenueInfo> = {
  'The Canopy': {
    latitude: 40.6810,
    longitude: -73.9760,
    address: '472 Bergen St, Park Slope',
    neighborhood: 'Park Slope',
  },
  'Sparsa': {
    latitude: 40.6836,
    longitude: -73.9915,
    address: '260 Court St, Cobble Hill',
    neighborhood: 'Cobble Hill',
  },
  'The Play Lab': {
    latitude: 40.6769,
    longitude: -73.9787,
    address: '297 5th Ave, Park Slope',
    neighborhood: 'Park Slope',
  },
  'The Wild': {
    latitude: 40.6721,
    longitude: -73.9795,
    address: '361 7th Ave, Park Slope',
    neighborhood: 'Park Slope',
  },
  'Grind House': {
    latitude: 40.6830,
    longitude: -73.9940,
    address: '321 Court St, Carroll Gardens',
    neighborhood: 'Carroll Gardens',
  },
  'A Rosie Day': {
    latitude: 40.6862,
    longitude: -73.9754,
    address: '190 Flatbush Ave, Prospect Heights',
    neighborhood: 'Prospect Heights',
  },
  'Artudio': {
    latitude: 40.6890,
    longitude: -73.9680,
    address: '635 Vanderbilt Ave, Prospect Heights',
    neighborhood: 'Prospect Heights',
  },
  'Westville': {
    latitude: 40.6850,
    longitude: -73.9742,
    address: '680 Vanderbilt Ave, Prospect Heights',
    neighborhood: 'Prospect Heights',
  },
  'Embodied Mother': {
    latitude: 40.6721,
    longitude: -73.9795,
    address: '361 7th Ave, Park Slope',
    neighborhood: 'Park Slope',
  },
  'Prenatal Yoga Center': {
    latitude: 40.6855,
    longitude: -73.9778,
    address: '231 Flatbush Ave, Prospect Heights',
    neighborhood: 'Prospect Heights',
  },
  'Brooklyn Birth Collective': {
    latitude: 40.6769,
    longitude: -73.9787,
    address: '297 5th Ave, Park Slope',
    neighborhood: 'Park Slope',
  },
  'Intero Pilates': {
    latitude: 40.6721,
    longitude: -73.9795,
    address: '361 7th Ave, Park Slope',
    neighborhood: 'Park Slope',
  },
};

const BROOKLYN_CENTER: VenueInfo = {
  latitude: 40.6782,
  longitude: -73.9442,
  address: 'Brooklyn, NY',
  neighborhood: 'Brooklyn',
};

export function getVenueCoords(venueName: string): VenueInfo {
  const normalized = venueName.trim();
  if (VENUE_COORDINATES[normalized]) {
    return VENUE_COORDINATES[normalized];
  }
  // Try partial match
  for (const [key, info] of Object.entries(VENUE_COORDINATES)) {
    if (normalized.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(normalized.toLowerCase())) {
      return info;
    }
  }
  console.warn(`[scraper] Unknown venue: "${venueName}" — using Brooklyn center fallback`);
  return BROOKLYN_CENTER;
}
