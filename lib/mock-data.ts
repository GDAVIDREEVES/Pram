import { Mom, Post, Location, Match, Message, Badge } from './types';

const AVATAR_COLORS = ['#E8836B', '#6BB8A8', '#F5C469', '#5B9BD5', '#D4A0D0', '#E8B87A', '#7BC8A4', '#F08080'];

export function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export const CURRENT_USER_ID = 'user_current';

export const currentUser: Mom = {
  id: CURRENT_USER_ID,
  name: 'Sarah Chen',
  age: 32,
  neighborhood: 'Park Slope',
  bio: 'Brooklyn born & raised. Love discovering new coffee shops with my little ones. Always down for a playdate at Prospect Park!',
  interests: ['Coffee', 'Yoga', 'Reading', 'Cooking', 'Playgrounds'],
  kids: [
    { name: 'Mia', age: 3, gender: 'girl' },
    { name: 'Leo', age: 1, gender: 'boy' },
  ],
  avatar: '',
  photos: [],
  verified: true,
  hangNow: false,
  lastActive: 'now',
  prompts: [
    { question: 'My ideal playdate looks like...', answer: 'Coffee for me, sandbox for the kids, and great conversation about anything besides parenting tips we already know.' },
    { question: 'On weekends you\'ll find us at...', answer: 'Prospect Park in the morning, then a cozy cafe for lunch. We love exploring new spots!' },
  ],
};

export const discoveryMoms: Mom[] = [
  {
    id: 'mom_1',
    name: 'Jessica Park',
    age: 30,
    neighborhood: 'Carroll Gardens',
    bio: 'Former chef turned stay-at-home mom. I make the best snack bags for the playground. Looking for mom friends who appreciate good food and good company.',
    interests: ['Cooking', 'Baking', 'Wine Tasting', 'Playgrounds', 'Music'],
    kids: [{ name: 'Oliver', age: 2, gender: 'boy' }],
    avatar: '',
    photos: [],
    verified: true,
    hangNow: true,
    lastActive: '5m ago',
    prompts: [
      { question: 'The way to my heart is...', answer: 'A perfectly pulled espresso and someone who doesn\'t judge my toddler\'s outfit choices.' },
      { question: 'I geek out on...', answer: 'Fermentation, sourdough starters, and finding the best pizza slice in Brooklyn.' },
    ],
  },
  {
    id: 'mom_2',
    name: 'Amara Okafor',
    age: 34,
    neighborhood: 'Prospect Heights',
    bio: 'Graphic designer working from home. My daughter and I are always looking for creative activities and new friends in the neighborhood.',
    interests: ['Art', 'Design', 'Yoga', 'Museums', 'Coffee'],
    kids: [{ name: 'Zara', age: 4, gender: 'girl' }],
    avatar: '',
    photos: [],
    verified: true,
    hangNow: false,
    lastActive: '20m ago',
    prompts: [
      { question: 'My ideal playdate looks like...', answer: 'Art projects, paint everywhere, and coffee while the kids create masterpieces.' },
      { question: 'Something I\'m proud of...', answer: 'Teaching my daughter to mix colors before she could spell her name.' },
    ],
  },
  {
    id: 'mom_3',
    name: 'Rachel Kim',
    age: 29,
    neighborhood: 'Park Slope',
    bio: 'First-time mom navigating it all with humor and too much coffee. Looking for mom friends who keep it real.',
    interests: ['Running', 'Podcasts', 'Coffee', 'Dogs', 'Brunch'],
    kids: [{ name: 'Ethan', age: 1, gender: 'boy' }],
    avatar: '',
    photos: [],
    verified: true,
    hangNow: true,
    lastActive: '2m ago',
    prompts: [
      { question: 'A fun fact about me...', answer: 'I ran a half marathon at 6 months pregnant. My doctor said I was crazy. She was right.' },
      { question: 'On weekends you\'ll find us at...', answer: 'The farmer\'s market or any cafe with a stroller-friendly entrance.' },
    ],
  },
  {
    id: 'mom_4',
    name: 'Daniela Ruiz',
    age: 31,
    neighborhood: 'Cobble Hill',
    bio: 'Bilingual mama raising bilingual babies. Love organizing group outings and finding hidden gem restaurants in Brooklyn.',
    interests: ['Languages', 'Travel', 'Cooking', 'Reading', 'Dancing'],
    kids: [
      { name: 'Sofia', age: 3, gender: 'girl' },
      { name: 'Mateo', age: 5, gender: 'boy' },
    ],
    avatar: '',
    photos: [],
    verified: true,
    hangNow: false,
    lastActive: '1h ago',
    prompts: [
      { question: 'The way to my heart is...', answer: 'Speaking to my kids in Spanish and suggesting a spontaneous picnic.' },
      { question: 'I geek out on...', answer: 'Children\'s books in different languages and finding authentic tacos in Brooklyn.' },
    ],
  },
  {
    id: 'mom_5',
    name: 'Priya Sharma',
    age: 33,
    neighborhood: 'Boerum Hill',
    bio: 'Tech product manager by day, toddler wrangler by night. Passionate about creating meaningful connections for our little community.',
    interests: ['Technology', 'Meditation', 'Hiking', 'Board Games', 'Tea'],
    kids: [{ name: 'Arjun', age: 2, gender: 'boy' }],
    avatar: '',
    photos: [],
    verified: true,
    hangNow: false,
    lastActive: '45m ago',
    prompts: [
      { question: 'My ideal playdate looks like...', answer: 'A tech-free afternoon at the park with chai lattes and deep conversations.' },
      { question: 'Something I\'m proud of...', answer: 'Building an app while my toddler napped. It took 847 naps.' },
    ],
  },
  {
    id: 'mom_6',
    name: 'Emily Watson',
    age: 35,
    neighborhood: 'Windsor Terrace',
    bio: 'Elementary school teacher and mom of twins. I have infinite patience... most of the time. Love nature walks and storytime at the library.',
    interests: ['Reading', 'Nature', 'Crafts', 'Gardening', 'Photography'],
    kids: [
      { name: 'Lily', age: 4, gender: 'girl' },
      { name: 'Rose', age: 4, gender: 'girl' },
    ],
    avatar: '',
    photos: [],
    verified: true,
    hangNow: true,
    lastActive: '10m ago',
    prompts: [
      { question: 'A fun fact about me...', answer: 'I can tell my identical twins apart by their laughs. It took me 6 months.' },
      { question: 'On weekends you\'ll find us at...', answer: 'The Brooklyn Botanic Garden or the library for Saturday storytime.' },
    ],
  },
];

export const allMoms: Mom[] = [currentUser, ...discoveryMoms];

export function getMomById(id: string): Mom | undefined {
  return allMoms.find(m => m.id === id);
}

export const initialMatches: Match[] = [
  {
    id: 'match_1',
    momId: 'mom_1',
    matched: true,
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    lastMessage: 'Would love to meet at that new cafe on Smith St!',
    unread: 1,
  },
  {
    id: 'match_2',
    momId: 'mom_3',
    matched: true,
    timestamp: new Date(Date.now() - 172800000).toISOString(),
    lastMessage: 'See you at the park tomorrow at 10am?',
    unread: 0,
  },
];

export const initialMessages: Message[] = [
  {
    id: 'msg_1',
    matchId: 'match_1',
    senderId: 'mom_1',
    content: 'Hi Sarah! I noticed we\'re both in the neighborhood. My Oliver loves the playground at Carroll Park.',
    timestamp: new Date(Date.now() - 90000000).toISOString(),
    read: true,
  },
  {
    id: 'msg_2',
    matchId: 'match_1',
    senderId: CURRENT_USER_ID,
    content: 'That\'s so close to us! We should definitely meet up there sometime.',
    timestamp: new Date(Date.now() - 89000000).toISOString(),
    read: true,
  },
  {
    id: 'msg_3',
    matchId: 'match_1',
    senderId: 'mom_1',
    content: 'Would love to meet at that new cafe on Smith St!',
    timestamp: new Date(Date.now() - 87000000).toISOString(),
    read: false,
  },
  {
    id: 'msg_4',
    matchId: 'match_2',
    senderId: 'mom_3',
    content: 'Hey! Fellow Park Slope mom here. Love your profile!',
    timestamp: new Date(Date.now() - 200000000).toISOString(),
    read: true,
  },
  {
    id: 'msg_5',
    matchId: 'match_2',
    senderId: CURRENT_USER_ID,
    content: 'Thanks Rachel! We should totally meet up. My kids love the Long Meadow.',
    timestamp: new Date(Date.now() - 190000000).toISOString(),
    read: true,
  },
  {
    id: 'msg_6',
    matchId: 'match_2',
    senderId: 'mom_3',
    content: 'See you at the park tomorrow at 10am?',
    timestamp: new Date(Date.now() - 180000000).toISOString(),
    read: true,
  },
];

export const initialPosts: Post[] = [
  {
    id: 'post_1',
    authorId: 'mom_1',
    content: 'Found the cutest little cafe on Court St with an actual play corner! The barista even made Oliver a "baby-ccino" with steamed milk and cinnamon.',
    locationName: 'Tiny Cup Cafe',
    likes: 12,
    comments: [
      { id: 'c1', authorId: 'mom_3', content: 'Oh I need to check this out!', timestamp: new Date(Date.now() - 3600000).toISOString() },
    ],
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    type: 'checkin',
    liked: false,
  },
  {
    id: 'post_2',
    authorId: 'mom_2',
    content: 'Art afternoon at Brooklyn Museum was a hit! Zara made friends with three other kids in the family workshop. Any moms want to join next Saturday?',
    likes: 8,
    comments: [],
    timestamp: new Date(Date.now() - 14400000).toISOString(),
    type: 'meetup',
    liked: true,
  },
  {
    id: 'post_3',
    authorId: 'mom_6',
    content: 'Prospect Park morning crew! The twins discovered ducks today and now they want to live at the lake. Beautiful day for a walk.',
    locationName: 'Prospect Park',
    likes: 15,
    comments: [
      { id: 'c2', authorId: 'mom_4', content: 'We were there too! Should have said hi!', timestamp: new Date(Date.now() - 10800000).toISOString() },
      { id: 'c3', authorId: 'mom_5', content: 'The ducks are the best part of the park honestly', timestamp: new Date(Date.now() - 9000000).toISOString() },
    ],
    timestamp: new Date(Date.now() - 21600000).toISOString(),
    type: 'checkin',
    liked: false,
  },
  {
    id: 'post_4',
    authorId: 'mom_5',
    content: 'Looking for 2-3 moms who want to start a weekly meditation + playdate group in Boerum Hill. Kids play, we zen out (or try to). Who\'s in?',
    likes: 22,
    comments: [
      { id: 'c4', authorId: 'mom_2', content: 'Count me in!', timestamp: new Date(Date.now() - 28800000).toISOString() },
    ],
    timestamp: new Date(Date.now() - 36000000).toISOString(),
    type: 'meetup',
    liked: true,
  },
];

export const locations: Location[] = [
  {
    id: 'loc_1',
    name: 'Tiny Cup Cafe',
    type: 'cafe',
    address: '234 Court St, Carroll Gardens',
    latitude: 40.6862,
    longitude: -73.9936,
    rating: 4.8,
    checkins: 47,
    kidFriendly: true,
    amenities: ['Play Corner', 'High Chairs', 'Changing Table', 'Stroller Parking'],
  },
  {
    id: 'loc_2',
    name: 'Prospect Park Playground',
    type: 'playground',
    address: 'Prospect Park, Park Slope',
    latitude: 40.6602,
    longitude: -73.9690,
    rating: 4.9,
    checkins: 156,
    kidFriendly: true,
    amenities: ['Swings', 'Sandbox', 'Water Feature', 'Shaded Areas'],
  },
  {
    id: 'loc_3',
    name: 'Brooklyn Roasting Co',
    type: 'cafe',
    address: '200 Flushing Ave, Navy Yard',
    latitude: 40.6975,
    longitude: -73.9765,
    rating: 4.6,
    checkins: 34,
    kidFriendly: true,
    amenities: ['Spacious', 'Stroller Friendly', 'Outdoor Seating'],
  },
  {
    id: 'loc_4',
    name: 'Carroll Park',
    type: 'park',
    address: 'Carroll St & Smith St, Carroll Gardens',
    latitude: 40.6808,
    longitude: -73.9934,
    rating: 4.7,
    checkins: 89,
    kidFriendly: true,
    amenities: ['Playground', 'Sprinklers', 'Basketball Court', 'Dog Area'],
  },
  {
    id: 'loc_5',
    name: 'BookCourt Kids',
    type: 'library',
    address: '163 Court St, Cobble Hill',
    latitude: 40.6880,
    longitude: -73.9935,
    rating: 4.5,
    checkins: 28,
    kidFriendly: true,
    amenities: ['Story Time', 'Kids Section', 'Reading Nook'],
  },
  {
    id: 'loc_6',
    name: 'Ample Hills Creamery',
    type: 'restaurant',
    address: '623 Vanderbilt Ave, Prospect Heights',
    latitude: 40.6780,
    longitude: -73.9685,
    rating: 4.8,
    checkins: 63,
    kidFriendly: true,
    amenities: ['Kid Sizes', 'Allergy Friendly', 'Indoor Seating'],
  },
];

export const badges: Badge[] = [
  { id: 'badge_1', name: 'First Steps', icon: 'footprints', description: 'Made your first connection', earned: true, earnedDate: '2025-01-15' },
  { id: 'badge_2', name: 'Cafe Explorer', icon: 'cafe', description: 'Checked in at 3 different cafes', earned: true, earnedDate: '2025-02-01' },
  { id: 'badge_3', name: 'Park Regular', icon: 'leaf', description: 'Visited a park 5 times', earned: false },
  { id: 'badge_4', name: 'Social Butterfly', icon: 'chatbubbles', description: 'Started 10 conversations', earned: false },
  { id: 'badge_5', name: 'Neighborhood Star', icon: 'star', description: 'Got 5 likes on a post', earned: true, earnedDate: '2025-02-10' },
];
