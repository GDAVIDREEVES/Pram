export interface Mom {
  id: string;
  name: string;
  age: number;
  neighborhood: string;
  bio: string;
  interests: string[];
  kids: Kid[];
  avatar: string;
  photos: string[];
  verified: boolean;
  hangNow: boolean;
  lastActive: string;
  prompts: ProfilePrompt[];
  vibeTags?: string[];
  coffeeMeetupPreferences?: CoffeeMeetupPreferences;
  comfortSignals?: ComfortSignals;
  safety?: SafetyInfo;
  socialProof?: SocialProof;
  isAdmin?: boolean;
}

export interface Kid {
  name: string;
  age: number;
  ageLabel?: string;
  gender: 'boy' | 'girl';
}

export interface ProfilePrompt {
  question: string;
  answer: string;
}

export interface CoffeeMeetupPreferences {
  meetupStyle: string[];
  favoriteSpots: string[];
}

export interface ComfortSignals {
  strollerFriendlyOnly?: boolean;
  playgroundAndCafe?: 'Playground first' | 'Cafe first' | 'Either';
  indoorCafeComfort?: 'Yes' | 'Sometimes' | 'Prefer outdoors';
}

export interface SafetyInfo {
  phoneVerified: boolean;
  referredByMember: boolean;
  neighborhoodHost: boolean;
}

export interface SocialProof {
  mutualConnectionsCount: number;
  successfulMeetupsCount: number;
  ratingAverage?: number;
}

export interface Match {
  id: string;
  momId: string;
  matched: boolean;
  timestamp: string;
  lastMessage?: string;
  unread?: number;
}

export interface Post {
  id: string;
  authorId: string;
  content: string;
  image?: string;
  locationName?: string;
  likes: number;
  comments: Comment[];
  timestamp: string;
  type: 'post' | 'checkin' | 'meetup';
  liked: boolean;
}

export interface Comment {
  id: string;
  authorId: string;
  content: string;
  timestamp: string;
}

export type ClassCategory =
  | 'music'
  | 'movement'
  | 'art'
  | 'language'
  | 'yoga'
  | 'open-play'
  | 'puppetry'
  | 'storytime'
  | 'stem'
  | 'sports'
  | 'sensory'
  | 'wellness'
  | 'other';

export interface ClassInfo {
  provider: string;
  venue: string;
  category: ClassCategory;
  ageRange: string;
  ageMinMonths: number;
  ageMaxMonths: number;
  daysOfWeek: string[];
  description: string;
  sourceUrl: string;
  lastSyncedAt: string;
}

export interface Location {
  id: string;
  name: string;
  type: 'cafe' | 'park' | 'playground' | 'restaurant' | 'library' | 'class';
  address: string;
  latitude: number;
  longitude: number;
  rating: number;
  checkins: number;
  kidFriendly: boolean;
  amenities: string[];
  classInfo?: ClassInfo;
}

export type BroadcastAudience = 'friends' | 'nearby' | 'everyone';

export interface MeetBroadcast {
  id: string;
  userId: string;
  locationId: string;
  locationName: string;
  message: string;
  audience: BroadcastAudience;
  timestamp: string;
  responses: BroadcastResponse[];
}

export interface BroadcastResponse {
  id: string;
  userId: string;
  message: string;
  timestamp: string;
}

export interface CheckIn {
  id: string;
  userId: string;
  locationId: string;
  timestamp: string;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  earned: boolean;
  earnedDate?: string;
}

export interface MeetupAttachment {
  locationId: string;
  locationName: string;
  date: string;
  time: string;
  note?: string;
}

export interface Message {
  id: string;
  matchId: string;
  senderId: string;
  content: string;
  timestamp: string;
  read: boolean;
  meetup?: MeetupAttachment;
  gifUrl?: string;
  stickerId?: string;
}
