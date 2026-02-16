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
}

export interface Kid {
  name: string;
  age: number;
  gender: 'boy' | 'girl';
}

export interface ProfilePrompt {
  question: string;
  answer: string;
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

export interface Location {
  id: string;
  name: string;
  type: 'cafe' | 'park' | 'playground' | 'restaurant' | 'library';
  address: string;
  latitude: number;
  longitude: number;
  rating: number;
  checkins: number;
  kidFriendly: boolean;
  amenities: string[];
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

export interface Message {
  id: string;
  matchId: string;
  senderId: string;
  content: string;
  timestamp: string;
  read: boolean;
}
