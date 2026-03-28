import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, Pressable, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { useFriends, Friend } from '@/lib/use-profile';
import { isSupabaseConfigured } from '@/lib/supabase';
import { fetchLastMessages } from '@/lib/use-messages';
import Avatar from '@/components/Avatar';
import type { Message } from '@/lib/types';

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'now';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export default function MessagesScreen() {
  const insets = useSafeAreaInsets();
  const { messages } = useApp();
  const { friends, isLoading } = useFriends();
  const [lastMessages, setLastMessages] = useState<Record<string, Message>>({});

  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  // Fetch last message for each friendship from Supabase
  useEffect(() => {
    if (!isSupabaseConfigured || !friends?.length) return;
    const ids = friends.map(f => f.friendshipId);
    fetchLastMessages(ids).then(setLastMessages);
  }, [friends]);

  const handleOpenChat = (friend: Friend) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: '/chat', params: { matchId: friend.friendshipId, momId: friend.profile.id } });
  };

  const renderItem = ({ item }: { item: Friend }) => {
    // Use Supabase last message when available, else fall back to local AppContext thread
    const lastMsg: Message | undefined = isSupabaseConfigured
      ? lastMessages[item.friendshipId]
      : (messages[item.friendshipId] ?? [])[messages[item.friendshipId]?.length - 1];

    return (
      <Pressable
        onPress={() => handleOpenChat(item)}
        style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
      >
        <Avatar name={item.profile.name} size={52} verified={item.profile.verified} hangNow={item.profile.hangNow} />
        <View style={styles.rowInfo}>
          <View style={styles.rowHeader}>
            <Text style={styles.name}>{item.profile.name}</Text>
            <Text style={styles.time}>{timeAgo(lastMsg?.timestamp ?? item.since)}</Text>
          </View>
          <Text
            style={[styles.preview, !lastMsg && styles.previewPlaceholder]}
            numberOfLines={1}
          >
            {lastMsg?.content ?? 'Say something...'}
          </Text>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
      <View style={styles.topBar}>
        <Text style={styles.title}>Chats</Text>
      </View>

      <FlatList
        data={friends ?? []}
        renderItem={renderItem}
        keyExtractor={item => item.friendshipId}
        contentContainerStyle={[styles.listContent, !friends?.length && styles.listEmpty]}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>💬</Text>
              <Text style={styles.emptyTitle}>Say something...</Text>
              <Text style={styles.emptyText}>Match with moms nearby and start a conversation</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topBar: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Nunito_700Bold',
    color: Colors.text,
  },
  listContent: {
    paddingBottom: 100,
  },
  listEmpty: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.background,
  },
  rowInfo: {
    flex: 1,
    marginLeft: 14,
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: 16,
    fontFamily: 'Nunito_600SemiBold',
    color: Colors.text,
  },
  time: {
    fontSize: 12,
    fontFamily: 'Nunito_400Regular',
    color: Colors.textTertiary,
  },
  preview: {
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    color: Colors.textSecondary,
    flex: 1,
    marginRight: 8,
  },
  previewPlaceholder: {
    color: Colors.textTertiary,
    fontStyle: 'italic',
  },
  separator: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginLeft: 86,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingBottom: 80,
  },
  emptyEmoji: {
    fontSize: 52,
  },
  emptyTitle: {
    fontSize: 22,
    fontFamily: 'Nunito_700Bold',
    color: Colors.text,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
