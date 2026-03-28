import React from 'react';
import {
  View, Text, StyleSheet, FlatList, Pressable, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import Avatar from '@/components/Avatar';
import { Match } from '@/lib/types';

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
  const { matches, getMomById } = useApp();

  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const activeMatches = matches.filter(m => m.matched);

  const handleOpenChat = (match: Match) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: '/chat', params: { matchId: match.id, momId: match.momId } });
  };

  const renderItem = ({ item }: { item: Match }) => {
    const mom = getMomById(item.momId);
    if (!mom) return null;
    const hasMessage = !!item.lastMessage;

    return (
      <Pressable
        onPress={() => handleOpenChat(item)}
        style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
      >
        <Avatar name={mom.name} size={52} verified={mom.verified} hangNow={mom.hangNow} />
        <View style={styles.rowInfo}>
          <View style={styles.rowHeader}>
            <Text style={styles.name}>{mom.name}</Text>
            <Text style={styles.time}>{timeAgo(item.timestamp)}</Text>
          </View>
          <View style={styles.rowPreview}>
            <Text
              style={[styles.preview, !hasMessage && styles.previewPlaceholder, item.unread && item.unread > 0 && styles.previewUnread]}
              numberOfLines={1}
            >
              {item.lastMessage ?? 'Say something...'}
            </Text>
            {item.unread && item.unread > 0 ? (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadCount}>{item.unread}</Text>
              </View>
            ) : null}
          </View>
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
        data={activeMatches}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={[styles.listContent, activeMatches.length === 0 && styles.listEmpty]}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>💬</Text>
            <Text style={styles.emptyTitle}>Say something...</Text>
            <Text style={styles.emptyText}>Match with moms nearby and start a conversation</Text>
          </View>
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
  rowPreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 3,
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
  previewUnread: {
    fontFamily: 'Nunito_600SemiBold',
    color: Colors.text,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginLeft: 86,
  },
  unreadBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadCount: {
    fontSize: 11,
    fontFamily: 'Nunito_700Bold',
    color: Colors.white,
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
