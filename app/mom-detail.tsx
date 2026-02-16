import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import Avatar from '@/components/Avatar';
import InterestTag from '@/components/InterestTag';

export default function MomDetailScreen() {
  const insets = useSafeAreaInsets();
  const { momId } = useLocalSearchParams<{ momId: string }>();
  const { getMomById } = useApp();

  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const mom = getMomById(momId || '');

  if (!mom) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </Pressable>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Profile not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileSection}>
          <Avatar name={mom.name} size={100} verified={mom.verified} hangNow={mom.hangNow} />
          <Text style={styles.name}>{mom.name}, {mom.age}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={16} color={Colors.primary} />
            <Text style={styles.neighborhood}>{mom.neighborhood}</Text>
          </View>
          {mom.hangNow && (
            <View style={styles.hangNowBadge}>
              <View style={styles.hangNowDot} />
              <Text style={styles.hangNowText}>Available to hang now</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.bio}>{mom.bio}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kids</Text>
          {mom.kids.map((kid, i) => (
            <View key={i} style={styles.kidRow}>
              <View style={styles.kidIcon}>
                <Ionicons name={kid.gender === 'girl' ? 'flower' : 'football'} size={16} color={Colors.primary} />
              </View>
              <Text style={styles.kidText}>{kid.name}, age {kid.age}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interests</Text>
          <View style={styles.interestsGrid}>
            {mom.interests.map(interest => (
              <InterestTag key={interest} label={interest} />
            ))}
          </View>
        </View>

        {mom.prompts.map((prompt, i) => (
          <View key={i} style={styles.promptCard}>
            <Text style={styles.promptQuestion}>{prompt.question}</Text>
            <Text style={styles.promptAnswer}>{prompt.answer}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  backButton: {
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
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundText: {
    fontSize: 16,
    fontFamily: 'Nunito_500Medium',
    color: Colors.textSecondary,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  name: {
    fontSize: 26,
    fontFamily: 'Nunito_700Bold',
    color: Colors.text,
    marginTop: 16,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  neighborhood: {
    fontSize: 15,
    fontFamily: 'Nunito_500Medium',
    color: Colors.textSecondary,
  },
  hangNowBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    backgroundColor: Colors.accentLight + '30',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  hangNowDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent,
  },
  hangNowText: {
    fontSize: 13,
    fontFamily: 'Nunito_600SemiBold',
    color: Colors.accent,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
    color: Colors.text,
    marginBottom: 10,
  },
  bio: {
    fontSize: 15,
    fontFamily: 'Nunito_400Regular',
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  kidRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  kidIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.blush,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kidText: {
    fontSize: 15,
    fontFamily: 'Nunito_500Medium',
    color: Colors.text,
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  promptCard: {
    backgroundColor: Colors.blush,
    borderRadius: 16,
    padding: 18,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  promptQuestion: {
    fontSize: 12,
    fontFamily: 'Nunito_600SemiBold',
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  promptAnswer: {
    fontSize: 15,
    fontFamily: 'Nunito_400Regular',
    color: Colors.text,
    lineHeight: 22,
  },
});
