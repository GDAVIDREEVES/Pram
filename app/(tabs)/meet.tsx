import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Platform, TextInput, Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeOut, SlideInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { locations } from '@/lib/mock-data';
import Avatar from '@/components/Avatar';
import { BroadcastAudience, Location, MeetBroadcast } from '@/lib/types';

const AUDIENCE_OPTIONS: { key: BroadcastAudience; label: string; icon: string; desc: string }[] = [
  { key: 'friends', label: 'Friends', icon: 'people', desc: 'Only moms you\'re connected with' },
  { key: 'nearby', label: 'Nearby Moms', icon: 'location', desc: 'Moms currently in the neighborhood' },
  { key: 'everyone', label: 'Everyone', icon: 'globe', desc: 'All moms on the app' },
];

const MOCK_NEARBY_BROADCASTS: MeetBroadcast[] = [
  {
    id: 'nearby_1',
    userId: 'mom_1',
    locationId: 'loc_1',
    locationName: 'Tiny Cup Cafe',
    message: 'At Tiny Cup with Oliver, come say hi! We\'ll be here for the next hour.',
    audience: 'nearby',
    timestamp: new Date(Date.now() - 1200000).toISOString(),
    responses: [
      { id: 'r1', userId: 'mom_3', message: 'On my way with Ethan!', timestamp: new Date(Date.now() - 600000).toISOString() },
    ],
  },
  {
    id: 'nearby_2',
    userId: 'mom_6',
    locationId: 'loc_2',
    locationName: 'Prospect Park Playground',
    message: 'The twins and I are at the playground. Perfect weather for the sandbox today!',
    audience: 'everyone',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    responses: [],
  },
];

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function AudienceBadge({ audience }: { audience: BroadcastAudience }) {
  const config = AUDIENCE_OPTIONS.find(a => a.key === audience);
  return (
    <View style={audienceStyles.badge}>
      <Ionicons name={config?.icon as any} size={11} color={Colors.textTertiary} />
      <Text style={audienceStyles.text}>{config?.label}</Text>
    </View>
  );
}

const audienceStyles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.backgroundSecondary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  text: {
    fontSize: 11,
    fontFamily: 'Nunito_500Medium',
    color: Colors.textTertiary,
  },
});

function BroadcastCard({ broadcast, getMomById }: { broadcast: MeetBroadcast; getMomById: (id: string) => any }) {
  const mom = getMomById(broadcast.userId);
  if (!mom) return null;

  return (
    <View style={cardStyles.container}>
      <View style={cardStyles.header}>
        <Avatar name={mom.name} size={44} verified={mom.verified} hangNow={true} />
        <View style={cardStyles.headerInfo}>
          <Text style={cardStyles.name}>{mom.name}</Text>
          <View style={cardStyles.metaRow}>
            <View style={cardStyles.locationTag}>
              <Ionicons name="location" size={12} color={Colors.primary} />
              <Text style={cardStyles.locationText}>{broadcast.locationName}</Text>
            </View>
            <AudienceBadge audience={broadcast.audience} />
          </View>
        </View>
        <Text style={cardStyles.time}>{timeAgo(broadcast.timestamp)}</Text>
      </View>

      <Text style={cardStyles.message}>{broadcast.message}</Text>

      {broadcast.responses.length > 0 && (
        <View style={cardStyles.responsesSection}>
          <View style={cardStyles.responsesDivider} />
          {broadcast.responses.map(resp => {
            const respMom = getMomById(resp.userId);
            return (
              <View key={resp.id} style={cardStyles.responseRow}>
                <Avatar name={respMom?.name || 'Unknown'} size={28} />
                <View style={cardStyles.responseContent}>
                  <Text style={cardStyles.responseName}>{respMom?.name?.split(' ')[0]}</Text>
                  <Text style={cardStyles.responseMessage}>{resp.message}</Text>
                </View>
                <Text style={cardStyles.responseTime}>{timeAgo(resp.timestamp)}</Text>
              </View>
            );
          })}
        </View>
      )}

      <View style={cardStyles.actions}>
        <Pressable style={cardStyles.actionButton}>
          <Ionicons name="chatbubble-outline" size={16} color={Colors.primary} />
          <Text style={cardStyles.actionText}>Respond</Text>
        </Pressable>
        <Pressable style={cardStyles.actionButton}>
          <Ionicons name="navigate-outline" size={16} color={Colors.accent} />
          <Text style={[cardStyles.actionText, { color: Colors.accent }]}>Directions</Text>
        </Pressable>
      </View>
    </View>
  );
}

const cardStyles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 16,
    fontFamily: 'Nunito_600SemiBold',
    color: Colors.text,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  locationTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  locationText: {
    fontSize: 12,
    fontFamily: 'Nunito_500Medium',
    color: Colors.primary,
  },
  time: {
    fontSize: 12,
    fontFamily: 'Nunito_400Regular',
    color: Colors.textTertiary,
  },
  message: {
    fontSize: 15,
    fontFamily: 'Nunito_400Regular',
    color: Colors.text,
    lineHeight: 22,
    marginTop: 12,
  },
  responsesSection: {
    marginTop: 12,
  },
  responsesDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginBottom: 10,
  },
  responseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  responseContent: {
    flex: 1,
    marginLeft: 10,
  },
  responseName: {
    fontSize: 13,
    fontFamily: 'Nunito_600SemiBold',
    color: Colors.text,
  },
  responseMessage: {
    fontSize: 13,
    fontFamily: 'Nunito_400Regular',
    color: Colors.textSecondary,
  },
  responseTime: {
    fontSize: 11,
    fontFamily: 'Nunito_400Regular',
    color: Colors.textTertiary,
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    fontSize: 13,
    fontFamily: 'Nunito_600SemiBold',
    color: Colors.primary,
  },
});

export default function MeetScreen() {
  const insets = useSafeAreaInsets();
  const { broadcasts, createBroadcast, getMomById, matches } = useApp();
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [selectedAudience, setSelectedAudience] = useState<BroadcastAudience>('nearby');
  const [searchQuery, setSearchQuery] = useState('');
  const [step, setStep] = useState<'location' | 'compose'>('location');

  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  const allBroadcasts = [...broadcasts, ...MOCK_NEARBY_BROADCASTS].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const filteredLocations = locations.filter(loc =>
    !searchQuery || loc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectLocation = (location: Location) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedLocation(location);
    setStep('compose');
  };

  const handleBroadcast = () => {
    if (!selectedLocation || !broadcastMessage.trim()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    createBroadcast(
      selectedLocation.id,
      selectedLocation.name,
      broadcastMessage.trim(),
      selectedAudience
    );
    setShowCheckIn(false);
    setBroadcastMessage('');
    setSelectedLocation(null);
    setStep('location');
    setSelectedAudience('nearby');
  };

  const handleCloseModal = () => {
    setShowCheckIn(false);
    setBroadcastMessage('');
    setSelectedLocation(null);
    setStep('location');
    setSearchQuery('');
    setSelectedAudience('nearby');
  };

  const friendCount = matches.filter(m => m.matched).length;

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
      <View style={styles.topBar}>
        <View>
          <Text style={styles.title}>Meet Up</Text>
          <Text style={styles.subtitle}>Check in & find moms nearby</Text>
        </View>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setShowCheckIn(true);
          }}
          style={styles.checkInButton}
        >
          <Ionicons name="radio" size={18} color={Colors.white} />
          <Text style={styles.checkInButtonText}>Check In</Text>
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {allBroadcasts.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="radio-outline" size={52} color={Colors.primaryLight} />
            </View>
            <Text style={styles.emptyTitle}>No meetups nearby</Text>
            <Text style={styles.emptyText}>
              Be the first to check in and let moms nearby know you're available to hang out
            </Text>
            <Pressable
              onPress={() => setShowCheckIn(true)}
              style={styles.emptyButton}
            >
              <Ionicons name="radio" size={16} color={Colors.white} />
              <Text style={styles.emptyButtonText}>Check In Now</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={styles.activeHeader}>
              <View style={styles.activePulse} />
              <Text style={styles.activeText}>
                {allBroadcasts.length} active nearby
              </Text>
            </View>

            {allBroadcasts.map(broadcast => (
              <BroadcastCard
                key={broadcast.id}
                broadcast={broadcast}
                getMomById={getMomById}
              />
            ))}
          </>
        )}
      </ScrollView>

      <Modal
        visible={showCheckIn}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseModal}
      >
        <View style={[styles.modalContainer, { paddingTop: Platform.OS === 'web' ? 20 : insets.top }]}>
          <View style={styles.modalHeader}>
            <Pressable onPress={handleCloseModal}>
              <Ionicons name="close" size={24} color={Colors.textSecondary} />
            </Pressable>
            <Text style={styles.modalTitle}>
              {step === 'location' ? 'Where are you?' : 'Broadcast'}
            </Text>
            <View style={{ width: 24 }} />
          </View>

          {step === 'location' ? (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScrollContent}>
              <View style={styles.searchContainer}>
                <View style={styles.searchBox}>
                  <Ionicons name="search" size={18} color={Colors.textTertiary} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search locations..."
                    placeholderTextColor={Colors.textTertiary}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                  {searchQuery.length > 0 && (
                    <Pressable onPress={() => setSearchQuery('')}>
                      <Ionicons name="close-circle" size={18} color={Colors.textTertiary} />
                    </Pressable>
                  )}
                </View>
              </View>

              <Text style={styles.locationSectionTitle}>Popular Spots Nearby</Text>
              {filteredLocations.map(location => (
                <Pressable
                  key={location.id}
                  onPress={() => handleSelectLocation(location)}
                  style={({ pressed }) => [
                    styles.locationItem,
                    pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] },
                  ]}
                >
                  <View style={styles.locationIcon}>
                    <Ionicons
                      name={
                        location.type === 'cafe' ? 'cafe' :
                        location.type === 'park' ? 'leaf' :
                        location.type === 'playground' ? 'happy' :
                        location.type === 'restaurant' ? 'restaurant' :
                        'book'
                      }
                      size={20}
                      color={Colors.primary}
                    />
                  </View>
                  <View style={styles.locationInfo}>
                    <Text style={styles.locationName}>{location.name}</Text>
                    <Text style={styles.locationAddress}>{location.address}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
                </Pressable>
              ))}
            </ScrollView>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScrollContent}>
              <View style={styles.selectedLocationBanner}>
                <Ionicons name="location" size={18} color={Colors.primary} />
                <Text style={styles.selectedLocationName}>{selectedLocation?.name}</Text>
                <Pressable onPress={() => setStep('location')}>
                  <Text style={styles.changeText}>Change</Text>
                </Pressable>
              </View>

              <Text style={styles.composeLabel}>Your message</Text>
              <TextInput
                style={styles.composeInput}
                placeholder="Let moms know what you're up to..."
                placeholderTextColor={Colors.textTertiary}
                multiline
                autoFocus
                value={broadcastMessage}
                onChangeText={setBroadcastMessage}
              />

              <Text style={styles.audienceLabel}>Who can see this?</Text>
              {AUDIENCE_OPTIONS.map(option => (
                <Pressable
                  key={option.key}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedAudience(option.key);
                  }}
                  style={[
                    styles.audienceOption,
                    selectedAudience === option.key && styles.audienceOptionSelected,
                  ]}
                >
                  <View style={[
                    styles.audienceIconContainer,
                    selectedAudience === option.key && styles.audienceIconSelected,
                  ]}>
                    <Ionicons
                      name={option.icon as any}
                      size={20}
                      color={selectedAudience === option.key ? Colors.white : Colors.textSecondary}
                    />
                  </View>
                  <View style={styles.audienceInfo}>
                    <Text style={[
                      styles.audienceOptionLabel,
                      selectedAudience === option.key && styles.audienceOptionLabelSelected,
                    ]}>
                      {option.label}
                      {option.key === 'friends' ? ` (${friendCount})` : ''}
                    </Text>
                    <Text style={styles.audienceOptionDesc}>{option.desc}</Text>
                  </View>
                  <View style={[
                    styles.radioOuter,
                    selectedAudience === option.key && styles.radioOuterSelected,
                  ]}>
                    {selectedAudience === option.key && <View style={styles.radioInner} />}
                  </View>
                </Pressable>
              ))}

              <Pressable
                onPress={handleBroadcast}
                disabled={!broadcastMessage.trim()}
                style={[
                  styles.broadcastButton,
                  !broadcastMessage.trim() && { opacity: 0.5 },
                ]}
              >
                <Ionicons name="radio" size={18} color={Colors.white} />
                <Text style={styles.broadcastButtonText}>Broadcast Check-in</Text>
              </Pressable>
            </ScrollView>
          )}
        </View>
      </Modal>
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
  subtitle: {
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    color: Colors.textSecondary,
    marginTop: 2,
  },
  checkInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  checkInButtonText: {
    fontSize: 14,
    fontFamily: 'Nunito_600SemiBold',
    color: Colors.white,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  activeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  activePulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent,
  },
  activeText: {
    fontSize: 14,
    fontFamily: 'Nunito_600SemiBold',
    color: Colors.accent,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.blush,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontFamily: 'Nunito_700Bold',
    color: Colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    fontFamily: 'Nunito_400Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 28,
  },
  emptyButtonText: {
    fontSize: 16,
    fontFamily: 'Nunito_600SemiBold',
    color: Colors.white,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Nunito_600SemiBold',
    color: Colors.text,
  },
  modalScrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  searchContainer: {
    marginBottom: 20,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Nunito_400Regular',
    color: Colors.text,
  },
  locationSectionTitle: {
    fontSize: 14,
    fontFamily: 'Nunito_600SemiBold',
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  locationIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.blush,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationInfo: {
    flex: 1,
    marginLeft: 12,
  },
  locationName: {
    fontSize: 15,
    fontFamily: 'Nunito_600SemiBold',
    color: Colors.text,
  },
  locationAddress: {
    fontSize: 12,
    fontFamily: 'Nunito_400Regular',
    color: Colors.textTertiary,
    marginTop: 2,
  },
  selectedLocationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.blush,
    borderRadius: 14,
    padding: 14,
    marginBottom: 24,
  },
  selectedLocationName: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Nunito_600SemiBold',
    color: Colors.text,
  },
  changeText: {
    fontSize: 13,
    fontFamily: 'Nunito_600SemiBold',
    color: Colors.primary,
  },
  composeLabel: {
    fontSize: 14,
    fontFamily: 'Nunito_600SemiBold',
    color: Colors.textSecondary,
    marginBottom: 10,
  },
  composeInput: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    fontSize: 15,
    fontFamily: 'Nunito_400Regular',
    color: Colors.text,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  audienceLabel: {
    fontSize: 14,
    fontFamily: 'Nunito_600SemiBold',
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  audienceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  audienceOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.blush,
  },
  audienceIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  audienceIconSelected: {
    backgroundColor: Colors.primary,
  },
  audienceInfo: {
    flex: 1,
    marginLeft: 12,
  },
  audienceOptionLabel: {
    fontSize: 15,
    fontFamily: 'Nunito_600SemiBold',
    color: Colors.text,
  },
  audienceOptionLabelSelected: {
    color: Colors.primary,
  },
  audienceOptionDesc: {
    fontSize: 12,
    fontFamily: 'Nunito_400Regular',
    color: Colors.textTertiary,
    marginTop: 2,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: Colors.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  broadcastButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 28,
    marginTop: 24,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  broadcastButtonText: {
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
    color: Colors.white,
  },
});
