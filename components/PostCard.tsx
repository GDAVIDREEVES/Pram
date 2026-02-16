import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import Avatar from './Avatar';
import { Post } from '@/lib/types';
import { getMomById } from '@/lib/mock-data';

interface PostCardProps {
  post: Post;
  onLike: () => void;
  onComment: (content: string) => void;
  fontFamily?: string;
  fontFamilyBold?: string;
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export default function PostCard({ post, onLike, fontFamily, fontFamilyBold }: PostCardProps) {
  const author = getMomById(post.authorId);
  if (!author) return null;

  const typeIcon = post.type === 'checkin' ? 'location' : post.type === 'meetup' ? 'calendar' : 'chatbubble';
  const typeLabel = post.type === 'checkin' ? 'Checked in' : post.type === 'meetup' ? 'Meetup' : 'Post';

  const handleLike = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onLike();
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Avatar name={author.name} size={42} verified={author.verified} />
        <View style={styles.headerInfo}>
          <Text style={[styles.name, fontFamilyBold && { fontFamily: fontFamilyBold }]}>{author.name}</Text>
          <View style={styles.metaRow}>
            <Ionicons name={typeIcon as any} size={12} color={Colors.textTertiary} />
            <Text style={[styles.meta, fontFamily && { fontFamily }]}>
              {typeLabel}{post.locationName ? ` at ${post.locationName}` : ''} · {timeAgo(post.timestamp)}
            </Text>
          </View>
        </View>
      </View>

      <Text style={[styles.content, fontFamily && { fontFamily }]}>{post.content}</Text>

      <View style={styles.actions}>
        <Pressable onPress={handleLike} style={styles.actionButton}>
          <Ionicons
            name={post.liked ? 'heart' : 'heart-outline'}
            size={22}
            color={post.liked ? Colors.primary : Colors.textSecondary}
          />
          <Text style={[styles.actionCount, fontFamily && { fontFamily }, post.liked && { color: Colors.primary }]}>
            {post.likes}
          </Text>
        </Pressable>

        <View style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={20} color={Colors.textSecondary} />
          <Text style={[styles.actionCount, fontFamily && { fontFamily }]}>{post.comments.length}</Text>
        </View>
      </View>

      {post.comments.length > 0 && (
        <View style={styles.commentsSection}>
          {post.comments.slice(-2).map(comment => {
            const commenter = getMomById(comment.authorId);
            return (
              <View key={comment.id} style={styles.comment}>
                <Text style={[styles.commentName, fontFamilyBold && { fontFamily: fontFamilyBold }]}>
                  {commenter?.name || 'Unknown'}
                </Text>
                <Text style={[styles.commentText, fontFamily && { fontFamily }]}> {comment.content}</Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerInfo: {
    marginLeft: 12,
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  meta: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  content: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.text,
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 20,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  actionCount: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  commentsSection: {
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  comment: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  commentName: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  commentText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
});
