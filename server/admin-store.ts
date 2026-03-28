import type { Mom, Post, Message, Match, MeetBroadcast, CheckIn, Badge } from '../lib/types';
import {
  allMoms,
  initialPosts,
  initialMessages,
  initialMatches,
  badges as initialBadges,
} from '../lib/mock-data';

const users: Mom[] = JSON.parse(JSON.stringify(allMoms));
const posts: Post[] = JSON.parse(JSON.stringify(initialPosts));
const messages: Message[] = JSON.parse(JSON.stringify(initialMessages));
const matches: Match[] = JSON.parse(JSON.stringify(initialMatches));
const broadcasts: MeetBroadcast[] = [];
const checkIns: CheckIn[] = [];
const badgeList: Badge[] = JSON.parse(JSON.stringify(initialBadges));

export function getUsers(search?: string): Mom[] {
  if (!search) return users;
  const q = search.toLowerCase();
  return users.filter(
    (u) =>
      u.name.toLowerCase().includes(q) ||
      u.neighborhood.toLowerCase().includes(q),
  );
}

export function getUserById(id: string): Mom | undefined {
  return users.find((u) => u.id === id);
}

export function updateUser(id: string, patch: Partial<Mom>): Mom | undefined {
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return undefined;
  users[idx] = { ...users[idx], ...patch, id };
  return users[idx];
}

export function deleteUser(id: string): boolean {
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return false;
  users.splice(idx, 1);
  return true;
}

export function getPosts(type?: string): Post[] {
  if (!type) return posts;
  return posts.filter((p) => p.type === type);
}

export function deletePost(id: string): boolean {
  const idx = posts.findIndex((p) => p.id === id);
  if (idx === -1) return false;
  posts.splice(idx, 1);
  return true;
}

export function getMessages(matchId?: string): Message[] {
  if (!matchId) return messages;
  return messages.filter((m) => m.matchId === matchId);
}

export function getMatches(): Match[] {
  return matches;
}

export function getBroadcasts(): MeetBroadcast[] {
  return broadcasts;
}

export function getCheckIns(): CheckIn[] {
  return checkIns;
}

export function getBadges(): Badge[] {
  return badgeList;
}

export function getStats() {
  const totalUsers = users.length;
  const totalPosts = posts.length;
  const totalMessages = messages.length;
  const totalMatches = matches.length;
  const activeUsers = users.filter((u) => u.hangNow).length;

  const postsByType: Record<string, number> = {};
  for (const p of posts) {
    postsByType[p.type] = (postsByType[p.type] || 0) + 1;
  }

  const neighborhoodCounts: Record<string, number> = {};
  for (const u of users) {
    neighborhoodCounts[u.neighborhood] =
      (neighborhoodCounts[u.neighborhood] || 0) + 1;
  }

  const interestCounts: Record<string, number> = {};
  for (const u of users) {
    for (const i of u.interests) {
      interestCounts[i] = (interestCounts[i] || 0) + 1;
    }
  }
  const topInterests = Object.entries(interestCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));

  const totalKids = users.reduce((sum, u) => sum + u.kids.length, 0);
  const avgKidsPerUser = totalUsers > 0 ? totalKids / totalUsers : 0;

  const totalComments = posts.reduce((sum, p) => sum + p.comments.length, 0);
  const totalLikes = posts.reduce((sum, p) => sum + p.likes, 0);

  return {
    totalUsers,
    totalPosts,
    totalMessages,
    totalMatches,
    activeUsers,
    totalBroadcasts: broadcasts.length,
    totalCheckIns: checkIns.length,
    postsByType,
    neighborhoodCounts,
    topInterests,
    avgKidsPerUser: Math.round(avgKidsPerUser * 10) / 10,
    totalComments,
    totalLikes,
  };
}
