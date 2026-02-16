import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Switch, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import Avatar from '@/components/Avatar';
import InterestTag from '@/components/InterestTag';
import { badges as allBadges } from '@/lib/mock-data';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, hangNow, toggleHangNow, checkIns, matches } = useApp();
  const [activeSection, setActiveSection] = useState<'about' | 'badges' | 'settings'>('about');

  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  const earnedBadges = allBadges.filter(b => b.earned);
  const totalMatches = matches.filter(m => m.matched).length;

  const handleToggleHangNow = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggleHangNow();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        contentInsetAdjustmentBehavior="automatic"
      >
        <View style={styles.profileHeader}>
          <Avatar name={user.name} size={90} verified={user.verified} hangNow={hangNow} />
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.neighborhood}>{user.neighborhood}</Text>

        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{totalMatches}</Text>
            <Text style={styles.statLabel}>Matches</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{checkIns.length}</Text>
            <Text style={styles.statLabel}>Check-ins</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{earnedBadges.length}</Text>
            <Text style={styles.statLabel}>Badges</Text>
          </View>
        </View>

        <View style={styles.hangNowCard}>
          <View style={styles.hangNowInfo}>
            <View style={[styles.hangNowDot, hangNow && styles.hangNowDotActive]} />
            <View>
              <Text style={styles.hangNowTitle}>Available to Hang</Text>
              <Text style={styles.hangNowDesc}>Let nearby moms know you're free</Text>
            </View>
          </View>
          <Switch
            value={hangNow}
            onValueChange={handleToggleHangNow}
            trackColor={{ false: Colors.borderLight, true: Colors.accentLight }}
            thumbColor={hangNow ? Colors.accent : Colors.white}
          />
        </View>

        <View style={styles.sectionTabs}>
          {[
            { key: 'about', label: 'About' },
            { key: 'badges', label: 'Badges' },
            { key: 'settings', label: 'Settings' },
          ].map(tab => (
            <Pressable
              key={tab.key}
              onPress={() => setActiveSection(tab.key as any)}
              style={[styles.sectionTab, activeSection === tab.key && styles.sectionTabActive]}
            >
              <Text style={[styles.sectionTabText, activeSection === tab.key && styles.sectionTabTextActive]}>
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {activeSection === 'about' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bio</Text>
            <Text style={styles.bioText}>{user.bio}</Text>

            <Text style={styles.sectionTitle}>Kids</Text>
            {user.kids.map((kid, i) => (
              <View key={i} style={styles.kidRow}>
                <View style={styles.kidIcon}>
                  <Ionicons name={kid.gender === 'girl' ? 'flower' : 'football'} size={16} color={Colors.primary} />
                </View>
                <Text style={styles.kidText}>{kid.name}, age {kid.age}</Text>
              </View>
            ))}

            <Text style={styles.sectionTitle}>Interests</Text>
            <View style={styles.interestsGrid}>
              {user.interests.map(interest => (
                <InterestTag key={interest} label={interest} />
              ))}
            </View>

            {user.prompts.map((prompt, i) => (
              <View key={i} style={styles.promptCard}>
                <Text style={styles.promptQuestion}>{prompt.question}</Text>
                <Text style={styles.promptAnswer}>{prompt.answer}</Text>
              </View>
            ))}
          </View>
        )}

        {activeSection === 'badges' && (
          <View style={styles.section}>
            <Text style={styles.badgesSectionTitle}>Your Badges</Text>
            {allBadges.map(badge => (
              <View key={badge.id} style={[styles.badgeRow, !badge.earned && styles.badgeRowLocked]}>
                <View style={[styles.badgeIconContainer, badge.earned && styles.badgeIconEarned]}>
                  <Ionicons
                    name={badge.icon as any}
                    size={22}
                    color={badge.earned ? Colors.primary : Colors.textTertiary}
                  />
                </View>
                <View style={styles.badgeInfo}>
                  <Text style={[styles.badgeName, !badge.earned && styles.badgeNameLocked]}>{badge.name}</Text>
                  <Text style={styles.badgeDesc}>{badge.description}</Text>
                </View>
                {badge.earned && (
                  <Ionicons name="checkmark-circle" size={20} color={Colors.accent} />
                )}
              </View>
            ))}
          </View>
        )}

        {activeSection === 'settings' && (
          <View style={styles.section}>
            <View style={styles.settingsGroup}>
              <Text style={styles.settingsGroupTitle}>Privacy</Text>
              <SettingRow icon="eye-off" label="Hide Profile from Discover" />
              <SettingRow icon="location" label="Neighborhood Visibility Only" />
              <SettingRow icon="shield-checkmark" label="Verified Badge" active />
            </View>

            <View style={styles.settingsGroup}>
              <Text style={styles.settingsGroupTitle}>Notifications</Text>
              <SettingRow icon="chatbubble" label="New Messages" active />
              <SettingRow icon="heart" label="New Matches" active />
              <SettingRow icon="megaphone" label="Community Updates" />
            </View>

            <View style={styles.settingsGroup}>
              <Text style={styles.settingsGroupTitle}>Account</Text>
              <SettingRow icon="person" label="Edit Profile" />
              <SettingRow icon="help-circle" label="Help & Support" />
              <SettingRow icon="flag" label="Report a Problem" />
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function SettingRow({ icon, label, active }: { icon: string; label: string; active?: boolean }) {
  const [isOn, setIsOn] = useState(!!active);
  return (
    <View style={settingStyles.row}>
      <View style={settingStyles.left}>
        <Ionicons name={icon as any} size={20} color={Colors.textSecondary} />
        <Text style={settingStyles.label}>{label}</Text>
      </View>
      <Switch
        value={isOn}
        onValueChange={setIsOn}
        trackColor={{ false: Colors.borderLight, true: Colors.accentLight }}
        thumbColor={isOn ? Colors.accent : Colors.white}
      />
    </View>
  );
}

const settingStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  label: {
    fontSize: 15,
    fontFamily: 'Nunito_500Medium',
    color: Colors.text,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  profileHeader: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 24,
  },
  name: {
    fontSize: 24,
    fontFamily: 'Nunito_700Bold',
    color: Colors.text,
    marginTop: 14,
  },
  neighborhood: {
    fontSize: 14,
    fontFamily: 'Nunito_500Medium',
    color: Colors.textSecondary,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginHorizontal: 16,
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    minWidth: 0,
  },
  statNumber: {
    fontSize: 20,
    fontFamily: 'Nunito_700Bold',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: 'Nunito_500Medium',
    color: Colors.textTertiary,
    marginTop: 2,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: Colors.borderLight,
    marginHorizontal: 4,
  },
  hangNowCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  hangNowInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  hangNowDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.textTertiary,
  },
  hangNowDotActive: {
    backgroundColor: Colors.accent,
  },
  hangNowTitle: {
    fontSize: 15,
    fontFamily: 'Nunito_600SemiBold',
    color: Colors.text,
  },
  hangNowDesc: {
    fontSize: 12,
    fontFamily: 'Nunito_400Regular',
    color: Colors.textTertiary,
    marginTop: 2,
  },
  sectionTabs: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 20,
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 4,
  },
  sectionTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  sectionTabActive: {
    backgroundColor: Colors.primary,
  },
  sectionTabText: {
    fontSize: 14,
    fontFamily: 'Nunito_600SemiBold',
    color: Colors.textSecondary,
  },
  sectionTabTextActive: {
    color: Colors.white,
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
    color: Colors.text,
    marginBottom: 10,
    marginTop: 16,
  },
  bioText: {
    fontSize: 15,
    fontFamily: 'Nunito_400Regular',
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  kidRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
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
    borderRadius: 14,
    padding: 16,
    marginTop: 16,
  },
  promptQuestion: {
    fontSize: 12,
    fontFamily: 'Nunito_600SemiBold',
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  promptAnswer: {
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    color: Colors.text,
    lineHeight: 20,
  },
  badgesSectionTitle: {
    fontSize: 18,
    fontFamily: 'Nunito_700Bold',
    color: Colors.text,
    marginBottom: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  badgeRowLocked: {
    opacity: 0.5,
  },
  badgeIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeIconEarned: {
    backgroundColor: Colors.blush,
  },
  badgeInfo: {
    flex: 1,
    marginLeft: 12,
  },
  badgeName: {
    fontSize: 15,
    fontFamily: 'Nunito_600SemiBold',
    color: Colors.text,
  },
  badgeNameLocked: {
    color: Colors.textTertiary,
  },
  badgeDesc: {
    fontSize: 12,
    fontFamily: 'Nunito_400Regular',
    color: Colors.textTertiary,
    marginTop: 2,
  },
  settingsGroup: {
    marginBottom: 24,
  },
  settingsGroupTitle: {
    fontSize: 14,
    fontFamily: 'Nunito_600SemiBold',
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
});
