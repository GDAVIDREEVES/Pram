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
  const newMatches = activeMatches.filter(m => !m.lastMessage);
  const conversations = activeMatches.filter(m => !!m.lastMessage);

  const handleOpenChat = (match: Match) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: '/chat', params: { matchId: match.id, momId: match.momId } });
  };

  const renderConversation = ({ item }: { item: Match }) => {
    const mom = getMomById(item.momId);
    if (!mom) return null;

    return (
      <Pressable
        onPress={() => handleOpenChat(item)}
        style={({ pressed }) => [styles.conversationItem, pressed && { opacity: 0.7 }]}
      >
        <Avatar name={mom.name} size={52} verified={mom.verified} hangNow={mom.hangNow} />
        <View style={styles.conversationInfo}>
          <View style={styles.conversationHeader}>
            <Text style={styles.conversationName}>{mom.name}</Text>
            <Text style={styles.conversationTime}>{timeAgo(item.timestamp)}</Text>
          </View>
          <View style={styles.conversationPreview}>
            <Text
              style={[styles.conversationMessage, item.unread && item.unread > 0 && styles.unreadMessage]}
              numberOfLines={1}
            >
              {item.lastMessage}
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
        <Text style={styles.title}>Messages</Text>
      </View>

      {newMatches.length > 0 && (
        <View style={styles.newMatchesSection}>
          <Text style={styles.sectionLabel}>New Matches</Text>
          <FlatList
            horizontal
            data={newMatches}
            keyExtractor={item => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.newMatchesList}
            renderItem={({ item }) => {
              const mom = getMomById(item.momId);
              if (!mom) return null;
              return (
                <Pressable
                  onPress={() => handleOpenChat(item)}
                  style={({ pressed }) => [styles.newMatchItem, pressed && { opacity: 0.7 }]}
                >
                  <Avatar name={mom.name} size={62} verified={mom.verified} />
                  <Text style={styles.newMatchName} numberOfLines={1}>{mom.name.split(' ')[0]}</Text>
                </Pressable>
              );
            }}
          />
        </View>
      )}

      <View style={styles.sectionLabelContainer}>
        <Text style={styles.sectionLabel}>Conversations</Text>
      </View>

      <FlatList
        data={conversations}
        renderItem={renderConversation}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="chatbubble-ellipses-outline" size={48} color={Colors.primaryLight} />
            <Text style={styles.emptyTitle}>No conversations yet</Text>
            <Text style={styles.emptyText}>Start by discovering and matching with moms nearby</Text>
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
  newMatchesSection: {
    marginBottom: 8,
  },
  newMatchesList: {
    paddingHorizontal: 16,
    gap: 16,
  },
  newMatchItem: {
    alignItems: 'center',
    gap: 6,
    width: 70,
  },
  newMatchName: {
    fontSize: 12,
    fontFamily: 'Nunito_600SemiBold',
    color: Colors.text,
    textAlign: 'center',
  },
  sectionLabelContainer: {
    paddingHorizontal: 20,
    marginTop: 8,
  },
  sectionLabel: {
    fontSize: 14,
    fontFamily: 'Nunito_600SemiBold',
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  listContent: {
    paddingBottom: 100,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  conversationInfo: {
    flex: 1,
    marginLeft: 14,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  conversationName: {
    fontSize: 16,
    fontFamily: 'Nunito_600SemiBold',
    color: Colors.text,
  },
  conversationTime: {
    fontSize: 12,
    fontFamily: 'Nunito_400Regular',
    color: Colors.textTertiary,
  },
  conversationPreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  conversationMessage: {
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    color: Colors.textSecondary,
    flex: 1,
    marginRight: 8,
  },
  unreadMessage: {
    fontFamily: 'Nunito_600SemiBold',
    color: Colors.text,
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
    alignItems: 'center',
    gap: 8,
    paddingTop: 80,
  },
  emptyTitle: {
    fontSize: 18,
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
