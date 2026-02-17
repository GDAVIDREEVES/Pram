import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, Dimensions, Pressable, Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming,
  runOnJS, interpolate, Extrapolation
} from 'react-native-reanimated';
import { PanResponder } from 'react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import Avatar from '@/components/Avatar';
import InterestTag from '@/components/InterestTag';
import { router } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

function SwipeCard({ mom, onSwipeLeft, onSwipeRight, isFirst }: {
  mom: any;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  isFirst: boolean;
}) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotation = useSharedValue(0);
  const scale = useSharedValue(isFirst ? 1 : 0.95);

  const handleSwipeComplete = useCallback((direction: 'left' | 'right') => {
    if (direction === 'right') {
      onSwipeRight();
    } else {
      onSwipeLeft();
    }
  }, [onSwipeLeft, onSwipeRight]);

  const handleViewProfile = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: '/mom-detail', params: { momId: mom.id } });
  }, [mom.id]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => isFirst,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return isFirst && (Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5);
      },
      onPanResponderMove: (_, gestureState) => {
        translateX.value = gestureState.dx;
        translateY.value = gestureState.dy * 0.5;
        rotation.value = gestureState.dx * 0.05;
      },
      onPanResponderRelease: (_, gestureState) => {
        if (Math.abs(gestureState.dx) < 5 && Math.abs(gestureState.dy) < 5) {
          runOnJS(handleViewProfile)();
          return;
        }
        if (gestureState.dx > SWIPE_THRESHOLD) {
          translateX.value = withTiming(SCREEN_WIDTH + 100, { duration: 300 });
          rotation.value = withTiming(15, { duration: 300 });
          runOnJS(handleSwipeComplete)('right');
        } else if (gestureState.dx < -SWIPE_THRESHOLD) {
          translateX.value = withTiming(-SCREEN_WIDTH - 100, { duration: 300 });
          rotation.value = withTiming(-15, { duration: 300 });
          runOnJS(handleSwipeComplete)('left');
        } else {
          translateX.value = withSpring(0, { damping: 15 });
          translateY.value = withSpring(0, { damping: 15 });
          rotation.value = withSpring(0, { damping: 15 });
        }
      },
    })
  ).current;

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotation.value}deg` },
      { scale: isFirst ? 1 : withSpring(scale.value) },
    ],
  }));

  const likeOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, SWIPE_THRESHOLD], [0, 1], Extrapolation.CLAMP),
  }));

  const nopeOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-SWIPE_THRESHOLD, 0], [1, 0], Extrapolation.CLAMP),
  }));

  return (
    <Animated.View
      style={[styles.card, cardStyle, !isFirst && styles.cardBehind]}
      {...(isFirst ? panResponder.panHandlers : {})}
    >
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Avatar name={mom.name} size={80} verified={mom.verified} hangNow={mom.hangNow} />
          <View style={styles.cardHeaderInfo}>
            <Text style={styles.cardName}>{mom.name}, {mom.age}</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location" size={14} color={Colors.primary} />
              <Text style={styles.cardNeighborhood}>{mom.neighborhood}</Text>
            </View>
            {mom.hangNow && (
              <View style={styles.hangNowBadge}>
                <View style={styles.hangNowDot} />
                <Text style={styles.hangNowText}>Available now</Text>
              </View>
            )}
          </View>
        </View>

        <Text style={styles.cardBio} numberOfLines={3}>{mom.bio}</Text>

        <View style={styles.kidsRow}>
          <Ionicons name="people" size={14} color={Colors.textSecondary} />
          <Text style={styles.kidsText}>
            {mom.kids.map((k: any) => `${k.name}, ${k.age}`).join(' · ')}
          </Text>
        </View>

        {mom.prompts.length > 0 && (
          <View style={styles.promptCard}>
            <Text style={styles.promptQuestion}>{mom.prompts[0].question}</Text>
            <Text style={styles.promptAnswer}>{mom.prompts[0].answer}</Text>
          </View>
        )}

        <View style={styles.interests}>
          {(mom.vibeTags || mom.interests).slice(0, 4).map((tag: string) => (
            <InterestTag key={tag} label={tag} />
          ))}
        </View>

        <Pressable
          onPress={handleViewProfile}
          style={styles.viewProfileLink}
        >
          <Text style={styles.viewProfileText}>View Full Profile</Text>
          <Ionicons name="chevron-forward" size={14} color={Colors.primary} />
        </Pressable>
      </View>

      <Animated.View style={[styles.likeStamp, likeOpacity]}>
        <Text style={styles.likeStampText}>LIKE</Text>
      </Animated.View>
      <Animated.View style={[styles.nopeStamp, nopeOpacity]}>
        <Text style={styles.nopeStampText}>PASS</Text>
      </Animated.View>
    </Animated.View>
  );
}

export default function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const { discoveryQueue, likeMom, skipMom } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matchAlert, setMatchAlert] = useState<string | null>(null);

  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  const handleSwipeRight = useCallback(() => {
    const mom = discoveryQueue[currentIndex];
    if (!mom) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    likeMom(mom.id);
    if (Math.random() > 0.3) {
      setMatchAlert(mom.name);
      setTimeout(() => setMatchAlert(null), 2500);
    }
    setTimeout(() => setCurrentIndex(prev => prev + 1), 350);
  }, [currentIndex, discoveryQueue, likeMom]);

  const handleSwipeLeft = useCallback(() => {
    const mom = discoveryQueue[currentIndex];
    if (!mom) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    skipMom(mom.id);
    setTimeout(() => setCurrentIndex(prev => prev + 1), 350);
  }, [currentIndex, discoveryQueue, skipMom]);

  const handleSkip = () => {
    handleSwipeLeft();
  };

  const handleLike = () => {
    handleSwipeRight();
  };

  const visibleCards = discoveryQueue.slice(currentIndex, currentIndex + 2);

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
      <View style={styles.topBar}>
        <View>
          <Text style={styles.title}>Discover</Text>
          <Text style={styles.subtitle}>Moms near you</Text>
        </View>
        <View style={styles.topBarActions}>
          <Pressable
            onPress={() => router.push('/feed')}
            style={styles.filterButton}
          >
            <Ionicons name="newspaper-outline" size={20} color={Colors.text} />
          </Pressable>
          <Pressable style={styles.filterButton}>
            <Ionicons name="options" size={22} color={Colors.text} />
          </Pressable>
        </View>
      </View>

      <View style={styles.cardStack}>
        {visibleCards.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="heart-circle-outline" size={64} color={Colors.primaryLight} />
            <Text style={styles.emptyTitle}>All caught up!</Text>
            <Text style={styles.emptyText}>Check back later for more moms in your area</Text>
          </View>
        ) : (
          visibleCards.reverse().map((mom, index) => (
            <SwipeCard
              key={mom.id}
              mom={mom}
              isFirst={index === visibleCards.length - 1}
              onSwipeRight={handleSwipeRight}
              onSwipeLeft={handleSwipeLeft}
            />
          ))
        )}
      </View>

      {visibleCards.length > 0 && (
        <View style={styles.buttonRow}>
          <Pressable
            onPress={handleSkip}
            style={({ pressed }) => [styles.actionCircle, styles.skipCircle, pressed && { transform: [{ scale: 0.9 }] }]}
          >
            <Ionicons name="close" size={28} color={Colors.textSecondary} />
          </Pressable>
          <Pressable
            onPress={handleLike}
            style={({ pressed }) => [styles.actionCircle, styles.likeCircle, pressed && { transform: [{ scale: 0.9 }] }]}
          >
            <Ionicons name="heart" size={28} color={Colors.white} />
          </Pressable>
        </View>
      )}

      {matchAlert && (
        <View style={styles.matchOverlay}>
          <View style={styles.matchCard}>
            <Ionicons name="heart-circle" size={48} color={Colors.primary} />
            <Text style={styles.matchTitle}>It's a Match!</Text>
            <Text style={styles.matchText}>You and {matchAlert} liked each other</Text>
            <Pressable
              onPress={() => setMatchAlert(null)}
              style={styles.matchButton}
            >
              <Text style={styles.matchButtonText}>Keep Discovering</Text>
            </Pressable>
          </View>
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
  topBarActions: {
    flexDirection: 'row',
    gap: 8,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Nunito_700Bold',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    color: Colors.textSecondary,
    marginTop: 2,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardStack: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  card: {
    position: 'absolute',
    width: SCREEN_WIDTH - 32,
    backgroundColor: Colors.white,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
  },
  cardBehind: {
    top: 10,
  },
  cardContent: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardHeaderInfo: {
    flex: 1,
    marginLeft: 16,
  },
  cardName: {
    fontSize: 22,
    fontFamily: 'Nunito_700Bold',
    color: Colors.text,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  cardNeighborhood: {
    fontSize: 14,
    fontFamily: 'Nunito_500Medium',
    color: Colors.textSecondary,
  },
  hangNowBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    backgroundColor: Colors.accentLight + '30',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  hangNowDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.accent,
  },
  hangNowText: {
    fontSize: 12,
    fontFamily: 'Nunito_600SemiBold',
    color: Colors.accent,
  },
  cardBio: {
    fontSize: 15,
    fontFamily: 'Nunito_400Regular',
    color: Colors.text,
    lineHeight: 22,
    marginBottom: 12,
  },
  kidsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
  },
  kidsText: {
    fontSize: 13,
    fontFamily: 'Nunito_500Medium',
    color: Colors.textSecondary,
  },
  promptCard: {
    backgroundColor: Colors.blush,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },
  promptQuestion: {
    fontSize: 12,
    fontFamily: 'Nunito_600SemiBold',
    color: Colors.primary,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  promptAnswer: {
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    color: Colors.text,
    lineHeight: 20,
  },
  interests: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  viewProfileLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  viewProfileText: {
    fontSize: 14,
    fontFamily: 'Nunito_600SemiBold',
    color: Colors.primary,
  },
  likeStamp: {
    position: 'absolute',
    top: 30,
    left: 20,
    borderWidth: 3,
    borderColor: Colors.accent,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    transform: [{ rotate: '-15deg' }],
  },
  likeStampText: {
    fontSize: 28,
    fontFamily: 'Nunito_700Bold',
    color: Colors.accent,
  },
  nopeStamp: {
    position: 'absolute',
    top: 30,
    right: 20,
    borderWidth: 3,
    borderColor: Colors.error,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    transform: [{ rotate: '15deg' }],
  },
  nopeStampText: {
    fontSize: 28,
    fontFamily: 'Nunito_700Bold',
    color: Colors.error,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    paddingBottom: 100,
    paddingTop: 16,
  },
  actionCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  skipCircle: {
    backgroundColor: Colors.white,
  },
  likeCircle: {
    backgroundColor: Colors.primary,
  },
  emptyState: {
    alignItems: 'center',
    gap: 12,
    padding: 40,
  },
  emptyTitle: {
    fontSize: 22,
    fontFamily: 'Nunito_700Bold',
    color: Colors.text,
  },
  emptyText: {
    fontSize: 15,
    fontFamily: 'Nunito_400Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  matchOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  matchCard: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: SCREEN_WIDTH - 64,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  matchTitle: {
    fontSize: 26,
    fontFamily: 'Nunito_700Bold',
    color: Colors.primary,
    marginTop: 12,
  },
  matchText: {
    fontSize: 15,
    fontFamily: 'Nunito_400Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  matchButton: {
    marginTop: 20,
    backgroundColor: Colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 24,
  },
  matchButtonText: {
    fontSize: 15,
    fontFamily: 'Nunito_600SemiBold',
    color: Colors.white,
  },
});
