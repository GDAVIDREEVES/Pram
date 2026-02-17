import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Platform, Modal, TextInput, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import Avatar from '@/components/Avatar';
import { Mom } from '@/lib/types';

function SafetyBadge({ icon, label }: { icon: string; label: string }) {
  return (
    <View style={badgeStyles.container}>
      <Ionicons name={icon as any} size={13} color={Colors.accent} />
      <Text style={badgeStyles.label}>{label}</Text>
    </View>
  );
}

const badgeStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.accentLight + '25',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  label: {
    fontSize: 12,
    fontFamily: 'Nunito_500Medium',
    color: Colors.accent,
  },
});

function SectionCard({ children, style }: { children: React.ReactNode; style?: any }) {
  return <View style={[sectionStyles.card, style]}>{children}</View>;
}

const sectionStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 18,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
});

function VibeChip({ label }: { label: string }) {
  return (
    <View style={chipStyles.container}>
      <Text style={chipStyles.label}>{label}</Text>
    </View>
  );
}

const chipStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.blush,
  },
  label: {
    fontSize: 13,
    fontFamily: 'Nunito_500Medium',
    color: Colors.primary,
  },
});

function SpotChip({ label }: { label: string }) {
  return (
    <View style={spotStyles.container}>
      <Ionicons name="location" size={12} color={Colors.primary} />
      <Text style={spotStyles.label}>{label}</Text>
    </View>
  );
}

const spotStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.backgroundSecondary,
  },
  label: {
    fontSize: 13,
    fontFamily: 'Nunito_500Medium',
    color: Colors.text,
  },
});

function MeetupStyleChip({ label, selected, onPress }: { label: string; selected?: boolean; onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={[meetupStyles.container, selected && meetupStyles.selected]}
    >
      <Text style={[meetupStyles.label, selected && meetupStyles.labelSelected]}>{label}</Text>
    </Pressable>
  );
}

const meetupStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  selected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.blush,
  },
  label: {
    fontSize: 13,
    fontFamily: 'Nunito_500Medium',
    color: Colors.textSecondary,
  },
  labelSelected: {
    color: Colors.primary,
    fontFamily: 'Nunito_600SemiBold',
  },
});

export default function MomDetailScreen() {
  const insets = useSafeAreaInsets();
  const { momId } = useLocalSearchParams<{ momId: string }>();
  const { getMomById, likeMom } = useApp();
  const [showInvite, setShowInvite] = useState(false);
  const [inviteMessage, setInviteMessage] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('');
  const [selectedSpot, setSelectedSpot] = useState('');
  const [showMenu, setShowMenu] = useState(false);

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

  const firstName = mom.name.split(' ')[0];
  const defaultMessage = `Hey ${firstName}! I'd love to grab coffee sometime. Are you free this week?`;

  const handleOpenInvite = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setInviteMessage(defaultMessage);
    setSelectedStyle(mom.coffeeMeetupPreferences?.meetupStyle?.[0] || '');
    setSelectedSpot(mom.coffeeMeetupPreferences?.favoriteSpots?.[0] || '');
    setShowInvite(true);
  };

  const handleSendInvite = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowInvite(false);
    setInviteMessage('');
    Alert.alert('Invite Sent', `Your coffee invite was sent to ${firstName}! You'll get a notification when they respond.`);
  };

  const handleLike = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    likeMom(mom.id);
    router.back();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </Pressable>
        <Pressable onPress={() => setShowMenu(true)} style={styles.menuButton}>
          <Ionicons name="ellipsis-horizontal" size={20} color={Colors.textSecondary} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.heroSection}>
          <Avatar name={mom.name} size={110} verified={mom.verified} hangNow={mom.hangNow} />
          <Text style={styles.name}>{mom.name}, {mom.age}</Text>
          <View style={styles.neighborhoodRow}>
            <Ionicons name="location" size={16} color={Colors.primary} />
            <Text style={styles.neighborhood}>{mom.neighborhood}</Text>
          </View>

          <View style={styles.kidsSnapshot}>
            {mom.kids.map((kid, i) => (
              <View key={i} style={styles.kidChip}>
                <View style={styles.kidIconSmall}>
                  <Ionicons
                    name={kid.gender === 'girl' ? 'flower' : 'football'}
                    size={12}
                    color={Colors.primary}
                  />
                </View>
                <Text style={styles.kidLabel}>
                  {kid.name ? `${kid.name}, ` : ''}{kid.ageLabel || `${kid.age} yrs`}
                </Text>
              </View>
            ))}
          </View>

          {mom.hangNow && (
            <View style={styles.availableBadge}>
              <View style={styles.availableDot} />
              <Text style={styles.availableText}>Available now</Text>
            </View>
          )}

          <View style={styles.safetyRow}>
            {mom.safety?.phoneVerified && <SafetyBadge icon="shield-checkmark" label="Verified" />}
            {mom.safety?.referredByMember && <SafetyBadge icon="people" label="Referred" />}
            {mom.safety?.neighborhoodHost && <SafetyBadge icon="star" label="Neighborhood Host" />}
          </View>
        </View>

        {mom.vibeTags && mom.vibeTags.length > 0 && (
          <SectionCard>
            <Text style={styles.sectionLabel}>Vibe</Text>
            <View style={styles.chipGrid}>
              {mom.vibeTags.map(tag => (
                <VibeChip key={tag} label={tag} />
              ))}
            </View>
          </SectionCard>
        )}

        {mom.prompts.length > 0 && (
          <View style={styles.promptsContainer}>
            {mom.prompts.map((prompt, i) => (
              <View key={i} style={styles.promptCard}>
                <Text style={styles.promptQuestion}>{prompt.question}</Text>
                <Text style={styles.promptAnswer}>{prompt.answer}</Text>
              </View>
            ))}
          </View>
        )}

        {mom.coffeeMeetupPreferences && (
          <SectionCard>
            <Text style={styles.sectionLabel}>Coffee & Meetup Preferences</Text>
            {mom.coffeeMeetupPreferences.favoriteSpots.length > 0 && (
              <>
                <Text style={styles.subsectionLabel}>Favorite Spots</Text>
                <View style={styles.chipGrid}>
                  {mom.coffeeMeetupPreferences.favoriteSpots.map(spot => (
                    <SpotChip key={spot} label={spot} />
                  ))}
                </View>
              </>
            )}
            {mom.coffeeMeetupPreferences.meetupStyle.length > 0 && (
              <>
                <Text style={[styles.subsectionLabel, { marginTop: 14 }]}>Meetup Style</Text>
                <View style={styles.chipGrid}>
                  {mom.coffeeMeetupPreferences.meetupStyle.map(style => (
                    <MeetupStyleChip key={style} label={style} />
                  ))}
                </View>
              </>
            )}
          </SectionCard>
        )}

        {mom.comfortSignals && (
          <SectionCard>
            <Text style={styles.sectionLabel}>Comfort Preferences</Text>
            <View style={styles.comfortList}>
              {mom.comfortSignals.strollerFriendlyOnly && (
                <View style={styles.comfortRow}>
                  <Ionicons name="checkmark-circle" size={16} color={Colors.accent} />
                  <Text style={styles.comfortText}>Stroller-friendly spaces only</Text>
                </View>
              )}
              {mom.comfortSignals.playgroundAndCafe && (
                <View style={styles.comfortRow}>
                  <Ionicons name="swap-horizontal" size={16} color={Colors.accent} />
                  <Text style={styles.comfortText}>Playground & cafe: {mom.comfortSignals.playgroundAndCafe}</Text>
                </View>
              )}
              {mom.comfortSignals.indoorCafeComfort && (
                <View style={styles.comfortRow}>
                  <Ionicons name="cafe" size={16} color={Colors.accent} />
                  <Text style={styles.comfortText}>Indoor cafes: {mom.comfortSignals.indoorCafeComfort}</Text>
                </View>
              )}
            </View>
          </SectionCard>
        )}

        {mom.socialProof && (
          <SectionCard>
            <Text style={styles.sectionLabel}>Community Trust</Text>
            <View style={styles.trustRow}>
              <View style={styles.trustItem}>
                <Text style={styles.trustNumber}>{mom.socialProof.mutualConnectionsCount}</Text>
                <Text style={styles.trustLabel}>Mutual{'\n'}Connections</Text>
              </View>
              <View style={styles.trustDivider} />
              <View style={styles.trustItem}>
                <Text style={styles.trustNumber}>{mom.socialProof.successfulMeetupsCount}</Text>
                <Text style={styles.trustLabel}>Successful{'\n'}Meetups</Text>
              </View>
              {mom.socialProof.ratingAverage && (
                <>
                  <View style={styles.trustDivider} />
                  <View style={styles.trustItem}>
                    <View style={styles.ratingRow}>
                      <Text style={styles.trustNumber}>{mom.socialProof.ratingAverage}</Text>
                      <Ionicons name="star" size={14} color={Colors.secondary} />
                    </View>
                    <Text style={styles.trustLabel}>Rating</Text>
                  </View>
                </>
              )}
            </View>
          </SectionCard>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={[styles.stickyBar, { paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 8) }]}>
        <Pressable
          onPress={handleOpenInvite}
          style={({ pressed }) => [styles.inviteButton, pressed && { transform: [{ scale: 0.97 }] }]}
        >
          <Ionicons name="cafe" size={18} color={Colors.white} />
          <Text style={styles.inviteButtonText}>Invite for Coffee</Text>
        </Pressable>
        <Pressable
          onPress={handleLike}
          style={({ pressed }) => [styles.likeButton, pressed && { transform: [{ scale: 0.92 }] }]}
        >
          <Ionicons name="heart" size={22} color={Colors.primary} />
        </Pressable>
      </View>

      <Modal
        visible={showInvite}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowInvite(false)}
      >
        <View style={[styles.modalContainer, { paddingTop: Platform.OS === 'web' ? 20 : insets.top }]}>
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setShowInvite(false)}>
              <Ionicons name="close" size={24} color={Colors.textSecondary} />
            </Pressable>
            <Text style={styles.modalTitle}>Invite for Coffee</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.inviteRecipient}>
              <Avatar name={mom.name} size={48} verified={mom.verified} />
              <View style={styles.inviteRecipientInfo}>
                <Text style={styles.inviteRecipientName}>{mom.name}</Text>
                <Text style={styles.inviteRecipientNeighborhood}>{mom.neighborhood}</Text>
              </View>
            </View>

            <Text style={styles.modalLabel}>Your message</Text>
            <TextInput
              style={styles.inviteInput}
              multiline
              value={inviteMessage}
              onChangeText={setInviteMessage}
              placeholder="Write a friendly message..."
              placeholderTextColor={Colors.textTertiary}
            />

            {mom.coffeeMeetupPreferences?.favoriteSpots && mom.coffeeMeetupPreferences.favoriteSpots.length > 0 && (
              <>
                <Text style={styles.modalLabel}>Suggested Spots</Text>
                <View style={styles.chipGrid}>
                  {mom.coffeeMeetupPreferences.favoriteSpots.map(spot => (
                    <Pressable
                      key={spot}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setSelectedSpot(spot);
                      }}
                    >
                      <View style={[
                        spotStyles.container,
                        selectedSpot === spot && { borderWidth: 1.5, borderColor: Colors.primary, backgroundColor: Colors.blush },
                      ]}>
                        <Ionicons name="location" size={12} color={selectedSpot === spot ? Colors.primary : Colors.textSecondary} />
                        <Text style={[spotStyles.label, selectedSpot === spot && { color: Colors.primary }]}>{spot}</Text>
                      </View>
                    </Pressable>
                  ))}
                </View>
              </>
            )}

            {mom.coffeeMeetupPreferences?.meetupStyle && mom.coffeeMeetupPreferences.meetupStyle.length > 0 && (
              <>
                <Text style={[styles.modalLabel, { marginTop: 20 }]}>Meetup Style</Text>
                <View style={styles.chipGrid}>
                  {mom.coffeeMeetupPreferences.meetupStyle.map(style => (
                    <MeetupStyleChip
                      key={style}
                      label={style}
                      selected={selectedStyle === style}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setSelectedStyle(style);
                      }}
                    />
                  ))}
                </View>
              </>
            )}

            <View style={styles.safetyNote}>
              <Ionicons name="shield-checkmark" size={14} color={Colors.accent} />
              <Text style={styles.safetyNoteText}>
                Meet in public places. You control who can message you.
              </Text>
            </View>

            <Pressable
              onPress={handleSendInvite}
              disabled={!inviteMessage.trim()}
              style={[
                styles.sendButton,
                !inviteMessage.trim() && { opacity: 0.5 },
              ]}
            >
              <Text style={styles.sendButtonText}>Send Invite</Text>
            </Pressable>
          </ScrollView>
        </View>
      </Modal>

      <Modal
        visible={showMenu}
        animationType="fade"
        transparent
        onRequestClose={() => setShowMenu(false)}
      >
        <Pressable style={styles.menuOverlay} onPress={() => setShowMenu(false)}>
          <View style={[styles.menuSheet, { paddingBottom: insets.bottom + 16 }]}>
            <Pressable
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
                Alert.alert('Reported', 'Thank you for helping keep our community safe.');
              }}
            >
              <Ionicons name="flag-outline" size={20} color={Colors.error} />
              <Text style={[styles.menuItemText, { color: Colors.error }]}>Report</Text>
            </Pressable>
            <Pressable
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
                Alert.alert('Blocked', `${firstName} has been blocked.`);
              }}
            >
              <Ionicons name="ban-outline" size={20} color={Colors.error} />
              <Text style={[styles.menuItemText, { color: Colors.error }]}>Block</Text>
            </Pressable>
            <Pressable
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
                Alert.alert('Share', 'Profile link copied to clipboard.');
              }}
            >
              <Ionicons name="share-outline" size={20} color={Colors.text} />
              <Text style={styles.menuItemText}>Share Profile</Text>
            </Pressable>
            <Pressable
              style={[styles.menuItem, styles.menuCancel]}
              onPress={() => setShowMenu(false)}
            >
              <Text style={[styles.menuItemText, { color: Colors.textSecondary, textAlign: 'center' as const }]}>Cancel</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
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
  menuButton: {
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
  heroSection: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  name: {
    fontSize: 26,
    fontFamily: 'Nunito_700Bold',
    color: Colors.text,
    marginTop: 14,
  },
  neighborhoodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 6,
  },
  neighborhood: {
    fontSize: 16,
    fontFamily: 'Nunito_600SemiBold',
    color: Colors.primary,
  },
  kidsSnapshot: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 14,
  },
  kidChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.white,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  kidIconSmall: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.blush,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kidLabel: {
    fontSize: 13,
    fontFamily: 'Nunito_500Medium',
    color: Colors.text,
  },
  availableBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    backgroundColor: Colors.accentLight + '30',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  availableDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent,
  },
  availableText: {
    fontSize: 13,
    fontFamily: 'Nunito_600SemiBold',
    color: Colors.accent,
  },
  safetyRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 14,
  },
  sectionLabel: {
    fontSize: 15,
    fontFamily: 'Nunito_700Bold',
    color: Colors.text,
    marginBottom: 12,
  },
  subsectionLabel: {
    fontSize: 12,
    fontFamily: 'Nunito_600SemiBold',
    color: Colors.textTertiary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  promptsContainer: {
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  promptCard: {
    backgroundColor: Colors.blush,
    borderRadius: 18,
    padding: 18,
    marginBottom: 10,
  },
  promptQuestion: {
    fontSize: 12,
    fontFamily: 'Nunito_600SemiBold',
    color: Colors.primary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  promptAnswer: {
    fontSize: 15,
    fontFamily: 'Nunito_400Regular',
    color: Colors.text,
    lineHeight: 22,
  },
  comfortList: {
    gap: 10,
  },
  comfortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  comfortText: {
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    color: Colors.text,
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trustItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  trustDivider: {
    width: 1,
    height: 36,
    backgroundColor: Colors.borderLight,
  },
  trustNumber: {
    fontSize: 22,
    fontFamily: 'Nunito_700Bold',
    color: Colors.text,
  },
  trustLabel: {
    fontSize: 11,
    fontFamily: 'Nunito_400Regular',
    color: Colors.textTertiary,
    textAlign: 'center' as const,
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  stickyBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    gap: 10,
  },
  inviteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    borderRadius: 28,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  inviteButtonText: {
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
    color: Colors.white,
  },
  likeButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.blush,
    alignItems: 'center',
    justifyContent: 'center',
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
  modalLabel: {
    fontSize: 14,
    fontFamily: 'Nunito_600SemiBold',
    color: Colors.textSecondary,
    marginBottom: 10,
  },
  inviteRecipient: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
  },
  inviteRecipientInfo: {
    marginLeft: 12,
  },
  inviteRecipientName: {
    fontSize: 16,
    fontFamily: 'Nunito_600SemiBold',
    color: Colors.text,
  },
  inviteRecipientNeighborhood: {
    fontSize: 13,
    fontFamily: 'Nunito_400Regular',
    color: Colors.textSecondary,
    marginTop: 2,
  },
  inviteInput: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    fontSize: 15,
    fontFamily: 'Nunito_400Regular',
    color: Colors.text,
    minHeight: 100,
    textAlignVertical: 'top' as const,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  safetyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.accentLight + '20',
    borderRadius: 12,
    padding: 12,
    marginTop: 24,
  },
  safetyNoteText: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Nunito_400Regular',
    color: Colors.accent,
    lineHeight: 17,
  },
  sendButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  sendButtonText: {
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
    color: Colors.white,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  menuSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingHorizontal: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  menuCancel: {
    justifyContent: 'center',
    borderBottomWidth: 0,
  },
  menuItemText: {
    fontSize: 16,
    fontFamily: 'Nunito_500Medium',
    color: Colors.text,
  },
});
