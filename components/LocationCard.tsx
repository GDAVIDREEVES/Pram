import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { Location } from '@/lib/types';

interface LocationCardProps {
  location: Location;
  onCheckIn: () => void;
  checkedIn?: boolean;
  fontFamily?: string;
  fontFamilyBold?: string;
}

const TYPE_ICONS: Record<string, string> = {
  cafe: 'cafe',
  park: 'leaf',
  playground: 'happy',
  restaurant: 'restaurant',
  library: 'book',
  class: 'school',
};

const TYPE_COLORS: Record<string, string> = {
  cafe: '#D4A574',
  park: '#6BB8A8',
  playground: '#F5C469',
  restaurant: '#E8836B',
  library: '#5B9BD5',
  class: '#C084FC',
};

export default function LocationCard({ location, onCheckIn, checkedIn, fontFamily, fontFamilyBold }: LocationCardProps) {
  const iconName = TYPE_ICONS[location.type] || 'location';
  const iconColor = TYPE_COLORS[location.type] || Colors.primary;

  const handleCheckIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onCheckIn();
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
          <Ionicons name={iconName as any} size={22} color={iconColor} />
        </View>
        <View style={styles.info}>
          <Text style={[styles.name, fontFamilyBold && { fontFamily: fontFamilyBold }]}>{location.name}</Text>
          <Text style={[styles.address, fontFamily && { fontFamily }]}>{location.address}</Text>
          <View style={styles.statsRow}>
            <Ionicons name="star" size={12} color={Colors.gold} />
            <Text style={[styles.stat, fontFamily && { fontFamily }]}>{location.rating}</Text>
            <Text style={[styles.statDivider, fontFamily && { fontFamily }]}>·</Text>
            <Ionicons name="location" size={12} color={Colors.textTertiary} />
            <Text style={[styles.stat, fontFamily && { fontFamily }]}>{location.checkins} check-ins</Text>
          </View>
        </View>
      </View>

      {location.classInfo ? (
        <View style={styles.amenities}>
          <View style={[styles.amenityTag, { backgroundColor: '#C084FC' + '15' }]}>
            <Text style={[styles.amenityText, fontFamily && { fontFamily }, { color: '#C084FC' }]}>
              {location.classInfo.venue}
            </Text>
          </View>
          {location.classInfo.daysOfWeek.slice(0, 3).map((day, i) => (
            <View key={i} style={styles.amenityTag}>
              <Text style={[styles.amenityText, fontFamily && { fontFamily }]}>{day}</Text>
            </View>
          ))}
          <View style={[styles.amenityTag, { backgroundColor: Colors.accentLight + '30' }]}>
            <Text style={[styles.amenityText, fontFamily && { fontFamily }, { color: Colors.accent }]}>
              {location.classInfo.ageRange}
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.amenities}>
          {location.amenities.slice(0, 3).map((amenity, i) => (
            <View key={i} style={styles.amenityTag}>
              <Text style={[styles.amenityText, fontFamily && { fontFamily }]}>{amenity}</Text>
            </View>
          ))}
          {location.amenities.length > 3 && (
            <View style={styles.amenityTag}>
              <Text style={[styles.amenityText, fontFamily && { fontFamily }]}>+{location.amenities.length - 3}</Text>
            </View>
          )}
        </View>
      )}

      <Pressable
        onPress={handleCheckIn}
        disabled={checkedIn}
        style={({ pressed }) => [
          styles.checkInButton,
          checkedIn && styles.checkInButtonDone,
          pressed && !checkedIn && { opacity: 0.8 },
        ]}
      >
        <Ionicons
          name={checkedIn ? 'checkmark-circle' : 'location'}
          size={16}
          color={checkedIn ? Colors.accent : Colors.white}
        />
        <Text style={[
          styles.checkInText,
          fontFamilyBold && { fontFamily: fontFamilyBold },
          checkedIn && styles.checkInTextDone,
        ]}>
          {checkedIn ? 'Checked In' : 'Check In'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    boxShadow: '0px 1px 8px rgba(0, 0, 0, 0.05)',
  },
  header: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  address: {
    fontSize: 13,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  stat: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  statDivider: {
    color: Colors.textTertiary,
    marginHorizontal: 2,
  },
  amenities: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  amenityTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: Colors.backgroundSecondary,
  },
  amenityText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  checkInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.primary,
  },
  checkInButtonDone: {
    backgroundColor: Colors.accentLight + '30',
  },
  checkInText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  checkInTextDone: {
    color: Colors.accent,
  },
});
