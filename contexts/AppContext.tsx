import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Mom, Match, Post, Message, MeetupAttachment, CheckIn, Badge, MeetBroadcast, BroadcastAudience, BroadcastResponse } from '@/lib/types';
import {
  currentUser,
  discoveryMoms,
  initialMatches,
  initialMessages,
  initialPosts,
  badges as initialBadges,
  CURRENT_USER_ID,
} from '@/lib/mock-data';
import * as Crypto from 'expo-crypto';

interface AppContextValue {
  user: Mom;
  updateUser: (updates: Partial<Mom>) => void;
  discoveryQueue: Mom[];
  likeMom: (momId: string) => void;
  skipMom: (momId: string) => void;
  matches: Match[];
  posts: Post[];
  addPost: (content: string, type: Post['type'], locationName?: string) => void;
  likePost: (postId: string) => void;
  addComment: (postId: string, content: string) => void;
  messages: Record<string, Message[]>;
  sendMessage: (matchId: string, content: string) => void;
  sendMeetupMessage: (matchId: string, meetup: MeetupAttachment) => void;
  sendGifMessage: (matchId: string, gifUrl: string) => void;
  sendStickerMessage: (matchId: string, stickerId: string) => void;
  checkIns: CheckIn[];
  checkIn: (locationId: string) => void;
  broadcasts: MeetBroadcast[];
  createBroadcast: (locationId: string, locationName: string, message: string, audience: BroadcastAudience) => void;
  respondToBroadcast: (broadcastId: string, message: string) => void;
  badges: Badge[];
  hangNow: boolean;
  toggleHangNow: () => void;
  getMomById: (id: string) => Mom | undefined;
  isLoading: boolean;
}

const AppContext = createContext<AppContextValue | null>(null);

const STORAGE_KEYS = {
  matches: 'momconnect_matches',
  posts: 'momconnect_posts',
  messages: 'momconnect_messages',
  checkIns: 'momconnect_checkins',
  liked: 'momconnect_liked',
  skipped: 'momconnect_skipped',
  user: 'momconnect_user',
  hangNow: 'momconnect_hangnow',
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Mom>(currentUser);
  const [matches, setMatches] = useState<Match[]>(initialMatches);
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [messagesMap, setMessagesMap] = useState<Record<string, Message[]>>({});
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [broadcasts, setBroadcasts] = useState<MeetBroadcast[]>([]);
  const [userBadges, setBadges] = useState<Badge[]>(initialBadges);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [skippedIds, setSkippedIds] = useState<Set<string>>(new Set());
  const [hangNow, setHangNow] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const grouped: Record<string, Message[]> = {};
    initialMessages.forEach(msg => {
      if (!grouped[msg.matchId]) grouped[msg.matchId] = [];
      grouped[msg.matchId].push(msg);
    });
    setMessagesMap(prev => {
      const merged = { ...grouped };
      Object.keys(prev).forEach(key => {
        if (merged[key]) {
          const existingIds = new Set(merged[key].map(m => m.id));
          prev[key].forEach(m => {
            if (!existingIds.has(m.id)) merged[key].push(m);
          });
        } else {
          merged[key] = prev[key];
        }
      });
      return merged;
    });
  }, []);

  const loadData = async () => {
    try {
      const [savedUser, savedLiked, savedSkipped] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.user),
        AsyncStorage.getItem(STORAGE_KEYS.liked),
        AsyncStorage.getItem(STORAGE_KEYS.skipped),
      ]);
      if (savedUser) setUser(JSON.parse(savedUser));
      if (savedLiked) setLikedIds(new Set(JSON.parse(savedLiked)));
      if (savedSkipped) setSkippedIds(new Set(JSON.parse(savedSkipped)));
    } catch (e) {
      console.error('Failed to load data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const allMoms = useMemo(() => [currentUser, ...discoveryMoms], []);

  const getMomById = useCallback((id: string): Mom | undefined => {
    return allMoms.find(m => m.id === id);
  }, [allMoms]);

  const discoveryQueue = useMemo(() => {
    return discoveryMoms.filter(m => !likedIds.has(m.id) && !skippedIds.has(m.id));
  }, [likedIds, skippedIds]);

  const likeMom = useCallback(async (momId: string) => {
    setLikedIds(prev => {
      const next = new Set(prev);
      next.add(momId);
      AsyncStorage.setItem(STORAGE_KEYS.liked, JSON.stringify([...next]));
      return next;
    });

    const isMatch = Math.random() > 0.3;
    if (isMatch) {
      const newMatch: Match = {
        id: `match_${Date.now()}`,
        momId,
        matched: true,
        timestamp: new Date().toISOString(),
        unread: 0,
      };
      setMatches(prev => [...prev, newMatch]);
    }
  }, []);

  const skipMom = useCallback(async (momId: string) => {
    setSkippedIds(prev => {
      const next = new Set(prev);
      next.add(momId);
      AsyncStorage.setItem(STORAGE_KEYS.skipped, JSON.stringify([...next]));
      return next;
    });
  }, []);

  const updateUser = useCallback((updates: Partial<Mom>) => {
    setUser(prev => {
      const updated = { ...prev, ...updates };
      AsyncStorage.setItem(STORAGE_KEYS.user, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const addPost = useCallback((content: string, type: Post['type'], locationName?: string) => {
    const newPost: Post = {
      id: `post_${Date.now()}_${Crypto.randomUUID().slice(0, 8)}`,
      authorId: CURRENT_USER_ID,
      content,
      locationName,
      likes: 0,
      comments: [],
      timestamp: new Date().toISOString(),
      type,
      liked: false,
    };
    setPosts(prev => [newPost, ...prev]);
  }, []);

  const likePost = useCallback((postId: string) => {
    setPosts(prev => prev.map(p =>
      p.id === postId
        ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
        : p
    ));
  }, []);

  const addComment = useCallback((postId: string, content: string) => {
    const newComment = {
      id: `comment_${Date.now()}`,
      authorId: CURRENT_USER_ID,
      content,
      timestamp: new Date().toISOString(),
    };
    setPosts(prev => prev.map(p =>
      p.id === postId
        ? { ...p, comments: [...p.comments, newComment] }
        : p
    ));
  }, []);

  const sendMessage = useCallback((matchId: string, content: string) => {
    const newMsg: Message = {
      id: `msg_${Date.now()}`,
      matchId,
      senderId: CURRENT_USER_ID,
      content,
      timestamp: new Date().toISOString(),
      read: true,
    };
    setMessagesMap(prev => ({
      ...prev,
      [matchId]: [...(prev[matchId] || []), newMsg],
    }));
    setMatches(prev => prev.map(m =>
      m.id === matchId ? { ...m, lastMessage: content, unread: 0 } : m
    ));
  }, []);

  const sendMeetupMessage = useCallback((matchId: string, meetup: MeetupAttachment) => {
    const summary = `Meetup at ${meetup.locationName}`;
    const newMsg: Message = {
      id: `msg_${Date.now()}`,
      matchId,
      senderId: CURRENT_USER_ID,
      content: summary,
      timestamp: new Date().toISOString(),
      read: true,
      meetup,
    };
    setMessagesMap(prev => ({
      ...prev,
      [matchId]: [...(prev[matchId] || []), newMsg],
    }));
    setMatches(prev => prev.map(m =>
      m.id === matchId ? { ...m, lastMessage: summary, unread: 0 } : m
    ));
  }, []);

  const sendGifMessage = useCallback((matchId: string, gifUrl: string) => {
    const newMsg: Message = {
      id: `msg_${Date.now()}`,
      matchId,
      senderId: CURRENT_USER_ID,
      content: 'GIF',
      timestamp: new Date().toISOString(),
      read: true,
      gifUrl,
    };
    setMessagesMap(prev => ({
      ...prev,
      [matchId]: [...(prev[matchId] || []), newMsg],
    }));
    setMatches(prev => prev.map(m =>
      m.id === matchId ? { ...m, lastMessage: 'Sent a GIF', unread: 0 } : m
    ));
  }, []);

  const sendStickerMessage = useCallback((matchId: string, stickerId: string) => {
    const newMsg: Message = {
      id: `msg_${Date.now()}`,
      matchId,
      senderId: CURRENT_USER_ID,
      content: 'Sticker',
      timestamp: new Date().toISOString(),
      read: true,
      stickerId,
    };
    setMessagesMap(prev => ({
      ...prev,
      [matchId]: [...(prev[matchId] || []), newMsg],
    }));
    setMatches(prev => prev.map(m =>
      m.id === matchId ? { ...m, lastMessage: 'Sent a sticker', unread: 0 } : m
    ));
  }, []);

  const checkIn = useCallback((locationId: string) => {
    const newCheckIn: CheckIn = {
      id: `checkin_${Date.now()}`,
      userId: CURRENT_USER_ID,
      locationId,
      timestamp: new Date().toISOString(),
    };
    setCheckIns(prev => [...prev, newCheckIn]);
  }, []);

  const createBroadcast = useCallback((locationId: string, locationName: string, message: string, audience: BroadcastAudience) => {
    const newBroadcast: MeetBroadcast = {
      id: `broadcast_${Date.now()}_${Crypto.randomUUID().slice(0, 8)}`,
      userId: CURRENT_USER_ID,
      locationId,
      locationName,
      message,
      audience,
      timestamp: new Date().toISOString(),
      responses: [],
    };
    setBroadcasts(prev => [newBroadcast, ...prev]);

    const newCheckIn: CheckIn = {
      id: `checkin_${Date.now()}`,
      userId: CURRENT_USER_ID,
      locationId,
      timestamp: new Date().toISOString(),
    };
    setCheckIns(prev => [...prev, newCheckIn]);
  }, []);

  const respondToBroadcast = useCallback((broadcastId: string, message: string) => {
    const response: BroadcastResponse = {
      id: `resp_${Date.now()}`,
      userId: CURRENT_USER_ID,
      message,
      timestamp: new Date().toISOString(),
    };
    setBroadcasts(prev => prev.map(b =>
      b.id === broadcastId ? { ...b, responses: [...b.responses, response] } : b
    ));
  }, []);

  const toggleHangNow = useCallback(() => {
    setHangNow(prev => !prev);
  }, []);

  const value = useMemo(() => ({
    user,
    updateUser,
    discoveryQueue,
    likeMom,
    skipMom,
    matches,
    posts,
    addPost,
    likePost,
    addComment,
    messages: messagesMap,
    sendMessage,
    sendMeetupMessage,
    sendGifMessage,
    sendStickerMessage,
    checkIns,
    checkIn,
    broadcasts,
    createBroadcast,
    respondToBroadcast,
    badges: userBadges,
    hangNow,
    toggleHangNow,
    getMomById,
    isLoading,
  }), [user, updateUser, discoveryQueue, likeMom, skipMom, matches, posts, addPost, likePost, addComment, messagesMap, sendMessage, sendMeetupMessage, sendGifMessage, sendStickerMessage, checkIns, checkIn, broadcasts, createBroadcast, respondToBroadcast, userBadges, hangNow, toggleHangNow, getMomById, isLoading]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
