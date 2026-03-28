import * as cheerio from 'cheerio';
import { getVenueCoords, VENUE_COORDINATES } from './venue-coords';

const DAYS_OF_WEEK = new Set([
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
]);

const CATEGORY_MAP: Record<string, string> = {
  'Dance & Music': 'music',
  'Dance and Music': 'music',
  'Art & Drama': 'art',
  'Art and Drama': 'art',
  'Health & Wellbeing': 'wellness',
  'Health and Wellbeing': 'wellness',
  'Sports & Fitness': 'sports',
  'Sports and Fitness': 'sports',
  'Literacy & Language': 'language',
  'Literacy and Language': 'language',
  'Play & Games': 'open-play',
  'Play and Games': 'open-play',
  'Community & Environment': 'wellness',
  'Community and Environment': 'wellness',
  'STEAM': 'stem',
  'PLAY': 'open-play',
};

const DAY_SHORT: Record<string, string> = {
  Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed',
  Thursday: 'Thu', Friday: 'Fri', Saturday: 'Sat', Sunday: 'Sun',
};

export interface ScrapedClass {
  name: string;
  provider: string;
  venues: string[];
  categories: string[];
  daysOfWeek: string[];
  description: string;
  sourcePage: string;
  sourceUrl: string;
}

function classifyTag(tag: string): 'day' | 'venue' | 'category' | 'provider' {
  if (DAYS_OF_WEEK.has(tag)) return 'day';
  if (VENUE_COORDINATES[tag]) return 'venue';
  if (CATEGORY_MAP[tag]) return 'category';
  return 'provider';
}

function parseProgramsFromHtml(html: string, sourcePage: string): ScrapedClass[] {
  const $ = cheerio.load(html);
  const classes: ScrapedClass[] = [];
  const seen = new Set<string>();

  // Find the Programs summary block
  const programSections = $('span.summary-collection-title').filter(function () {
    return $(this).text().trim() === 'Programs';
  });

  if (programSections.length === 0) {
    console.warn(`[scraper] No "Programs" section found on /${sourcePage}`);
    return classes;
  }

  // Get the summary block containing the Programs
  const summaryBlock = programSections.first().closest('.sqs-block-summary-v2');
  if (!summaryBlock.length) return classes;

  // Each program is a summary-item
  summaryBlock.find('.summary-item').each(function () {
    const item = $(this);

    // Get title
    const titleEl = item.find('.summary-title-link').first();
    const name = titleEl.text().trim();
    if (!name || seen.has(name)) return;
    seen.add(name);

    // Get categories from the first metadata container only (avoid duplicates)
    const catSpan = item.find('.summary-metadata-item--cats').first();
    const tags: string[] = [];
    catSpan.find('a').each(function () {
      tags.push($(this).text().trim());
    });

    // Classify tags
    const days: string[] = [];
    const venues: string[] = [];
    const categories: string[] = [];
    let provider = '';

    for (const tag of tags) {
      const type = classifyTag(tag);
      switch (type) {
        case 'day':
          days.push(DAY_SHORT[tag] ?? tag);
          break;
        case 'venue':
          venues.push(tag);
          break;
        case 'category':
          categories.push(CATEGORY_MAP[tag] ?? tag);
          break;
        case 'provider':
          if (!provider) provider = tag;
          break;
      }
    }

    // Get description/excerpt
    const excerptEl = item.find('.summary-excerpt').first();
    const description = excerptEl.text().trim();

    const sourceUrl = `https://www.thewriggle.com/${sourcePage}`;

    classes.push({
      name,
      provider,
      venues,
      categories,
      daysOfWeek: days,
      description,
      sourcePage,
      sourceUrl,
    });
  });

  return classes;
}

function getAgeRange(sourcePage: string): { ageRange: string; ageMinMonths: number; ageMaxMonths: number } {
  switch (sourcePage) {
    case 'babies':
      return { ageRange: '0 to 12 months', ageMinMonths: 0, ageMaxMonths: 12 };
    case 'toddlers':
      return { ageRange: '1 to 3 years', ageMinMonths: 12, ageMaxMonths: 36 };
    case 'kids':
      return { ageRange: '4 to 10 years', ageMinMonths: 48, ageMaxMonths: 120 };
    default:
      return { ageRange: 'All ages', ageMinMonths: 0, ageMaxMonths: 120 };
  }
}

interface LocationLike {
  id: string;
  name: string;
  type: 'class';
  address: string;
  latitude: number;
  longitude: number;
  rating: number;
  checkins: number;
  kidFriendly: boolean;
  amenities: string[];
  classInfo: {
    provider: string;
    venue: string;
    category: string;
    ageRange: string;
    ageMinMonths: number;
    ageMaxMonths: number;
    daysOfWeek: string[];
    description: string;
    sourceUrl: string;
    lastSyncedAt: string;
  };
}

export async function scrapeWriggleClasses(): Promise<LocationLike[]> {
  const pages = ['babies', 'toddlers', 'kids'] as const;
  const allRaw: ScrapedClass[] = [];

  for (const page of pages) {
    try {
      const url = `https://www.thewriggle.com/${page}`;
      console.log(`[scraper] Fetching ${url}...`);
      const response = await fetch(url, {
        headers: { 'User-Agent': 'Wriggle-App/1.0 (class sync)' },
      });
      if (!response.ok) {
        console.warn(`[scraper] Failed to fetch ${url}: ${response.status}`);
        continue;
      }
      const html = await response.text();
      const parsed = parseProgramsFromHtml(html, page);
      console.log(`[scraper] Found ${parsed.length} programs on /${page}`);
      allRaw.push(...parsed);
    } catch (err) {
      console.error(`[scraper] Error scraping /${page}:`, err);
    }
  }

  // Deduplicate by name (same class may appear on multiple age pages)
  const deduped = new Map<string, ScrapedClass>();
  for (const cls of allRaw) {
    if (!deduped.has(cls.name)) {
      deduped.set(cls.name, cls);
    }
  }

  const now = new Date().toISOString();
  const locations: LocationLike[] = [];
  let idx = 0;

  for (const cls of deduped.values()) {
    const venueName = cls.venues[0] ?? cls.provider;
    const coords = getVenueCoords(venueName);
    const ages = getAgeRange(cls.sourcePage);
    const category = cls.categories[0] ?? 'other';

    locations.push({
      id: `wriggle_${idx++}`,
      name: cls.name,
      type: 'class',
      address: coords.address,
      latitude: coords.latitude,
      longitude: coords.longitude,
      rating: Math.round((4.7 + Math.random() * 0.3) * 10) / 10,
      checkins: Math.floor(Math.random() * 30) + 5,
      kidFriendly: true,
      amenities: [
        ...cls.categories.map(c => c.charAt(0).toUpperCase() + c.slice(1)),
        ...cls.daysOfWeek,
        ages.ageRange,
      ],
      classInfo: {
        provider: cls.provider || venueName,
        venue: venueName,
        category,
        ageRange: ages.ageRange,
        ageMinMonths: ages.ageMinMonths,
        ageMaxMonths: ages.ageMaxMonths,
        daysOfWeek: cls.daysOfWeek,
        description: cls.description,
        sourceUrl: cls.sourceUrl,
        lastSyncedAt: now,
      },
    });
  }

  console.log(`[scraper] Total unique classes: ${locations.length}`);
  return locations;
}
