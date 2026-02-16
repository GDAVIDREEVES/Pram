import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, Pressable, TextInput, Platform, KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import PostCard from '@/components/PostCard';
import { Post } from '@/lib/types';

export default function FeedScreen() {
  const insets = useSafeAreaInsets();
  const { posts, addPost, likePost, addComment, user } = useApp();
  const [showCompose, setShowCompose] = useState(false);
  const [composeText, setComposeText] = useState('');
  const [postType, setPostType] = useState<Post['type']>('post');
  const [filter, setFilter] = useState<'all' | 'checkin' | 'meetup'>('all');

  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  const filteredPosts = filter === 'all'
    ? posts
    : posts.filter(p => p.type === filter);

  const handlePost = () => {
    if (!composeText.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addPost(composeText.trim(), postType);
    setComposeText('');
    setShowCompose(false);
    setPostType('post');
  };

  const renderPost = ({ item }: { item: Post }) => (
    <PostCard
      post={item}
      onLike={() => likePost(item.id)}
      onComment={(content) => addComment(item.id, content)}
      fontFamily="Nunito_400Regular"
      fontFamilyBold="Nunito_600SemiBold"
    />
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
      <View style={styles.topBar}>
        <Text style={styles.title}>Community</Text>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowCompose(true);
          }}
          style={styles.composeButton}
        >
          <Ionicons name="add" size={22} color={Colors.white} />
        </Pressable>
      </View>

      <View style={styles.filters}>
        {[
          { key: 'all', label: 'All' },
          { key: 'checkin', label: 'Check-ins' },
          { key: 'meetup', label: 'Meetups' },
        ].map(f => (
          <Pressable
            key={f.key}
            onPress={() => setFilter(f.key as any)}
            style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
          >
            <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>
              {f.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={filteredPosts}
        renderItem={renderPost}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={48} color={Colors.primaryLight} />
            <Text style={styles.emptyTitle}>No posts yet</Text>
            <Text style={styles.emptyText}>Be the first to share something with the community</Text>
          </View>
        }
      />

      {showCompose && (
        <View style={styles.composeOverlay}>
          <Pressable style={styles.composeBackdrop} onPress={() => setShowCompose(false)} />
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.composeContainer}
          >
            <View style={[styles.composeCard, { paddingBottom: insets.bottom + 16 }]}>
              <View style={styles.composeHeader}>
                <Pressable onPress={() => setShowCompose(false)}>
                  <Ionicons name="close" size={24} color={Colors.textSecondary} />
                </Pressable>
                <Text style={styles.composeTitle}>New Post</Text>
                <Pressable
                  onPress={handlePost}
                  disabled={!composeText.trim()}
                  style={[styles.postButton, !composeText.trim() && { opacity: 0.5 }]}
                >
                  <Text style={styles.postButtonText}>Share</Text>
                </Pressable>
              </View>

              <View style={styles.typeSelector}>
                {[
                  { key: 'post', icon: 'chatbubble', label: 'Post' },
                  { key: 'checkin', icon: 'location', label: 'Check-in' },
                  { key: 'meetup', icon: 'calendar', label: 'Meetup' },
                ].map(t => (
                  <Pressable
                    key={t.key}
                    onPress={() => setPostType(t.key as Post['type'])}
                    style={[styles.typeChip, postType === t.key && styles.typeChipActive]}
                  >
                    <Ionicons
                      name={t.icon as any}
                      size={14}
                      color={postType === t.key ? Colors.white : Colors.textSecondary}
                    />
                    <Text style={[styles.typeText, postType === t.key && styles.typeTextActive]}>
                      {t.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <TextInput
                style={styles.composeInput}
                placeholder="What's on your mind?"
                placeholderTextColor={Colors.textTertiary}
                multiline
                autoFocus
                value={composeText}
                onChangeText={setComposeText}
              />
            </View>
          </KeyboardAvoidingView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Nunito_700Bold',
    color: Colors.text,
  },
  composeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.white,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
  },
  filterText: {
    fontSize: 13,
    fontFamily: 'Nunito_600SemiBold',
    color: Colors.textSecondary,
  },
  filterTextActive: {
    color: Colors.white,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
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
  },
  composeOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 50,
  },
  composeBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  composeContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  composeCard: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  composeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  composeTitle: {
    fontSize: 17,
    fontFamily: 'Nunito_600SemiBold',
    color: Colors.text,
  },
  postButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  postButtonText: {
    fontSize: 14,
    fontFamily: 'Nunito_600SemiBold',
    color: Colors.white,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.backgroundSecondary,
  },
  typeChipActive: {
    backgroundColor: Colors.primary,
  },
  typeText: {
    fontSize: 13,
    fontFamily: 'Nunito_500Medium',
    color: Colors.textSecondary,
  },
  typeTextActive: {
    color: Colors.white,
  },
  composeInput: {
    fontSize: 16,
    fontFamily: 'Nunito_400Regular',
    color: Colors.text,
    minHeight: 120,
    textAlignVertical: 'top',
  },
});
