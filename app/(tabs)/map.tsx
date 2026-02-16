import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Platform, TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import LocationCard from '@/components/LocationCard';
import { locations } from '@/lib/mock-data';
import { Location } from '@/lib/types';

const TYPE_FILTERS = [
  { key: 'all', label: 'All', icon: 'grid' },
  { key: 'cafe', label: 'Cafes', icon: 'cafe' },
  { key: 'park', label: 'Parks', icon: 'leaf' },
  { key: 'playground', label: 'Playgrounds', icon: 'happy' },
  { key: 'restaurant', label: 'Eats', icon: 'restaurant' },
  { key: 'library', label: 'Library', icon: 'book' },
];

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const { checkIn, checkIns } = useApp();
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [checkedInLocations, setCheckedInLocations] = useState<Set<string>>(new Set());

  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  const filteredLocations = locations.filter(loc => {
    const matchesFilter = filter === 'all' || loc.type === filter;
    const matchesSearch = !searchQuery || loc.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleCheckIn = (locationId: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    checkIn(locationId);
    setCheckedInLocations(prev => new Set([...prev, locationId]));
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
      <View style={styles.topBar}>
        <Text style={styles.title}>Explore</Text>
        <Text style={styles.subtitle}>Kid-friendly spots nearby</Text>
      </View>

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

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        style={styles.filterScroll}
      >
        {TYPE_FILTERS.map(f => (
          <Pressable
            key={f.key}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setFilter(f.key);
            }}
            style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
          >
            <Ionicons
              name={f.icon as any}
              size={16}
              color={filter === f.key ? Colors.white : Colors.textSecondary}
            />
            <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>
              {f.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        contentInsetAdjustmentBehavior="automatic"
      >
        <View style={styles.mapPlaceholder}>
          <View style={styles.mapInner}>
            <Ionicons name="map" size={40} color={Colors.primaryLight} />
            <Text style={styles.mapText}>Brooklyn, NY</Text>
            <Text style={styles.mapSubtext}>{locations.length} spots nearby</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nearby Spots</Text>
          <Text style={styles.sectionCount}>{filteredLocations.length} locations</Text>
        </View>

        {filteredLocations.map(location => (
          <LocationCard
            key={location.id}
            location={location}
            onCheckIn={() => handleCheckIn(location.id)}
            checkedIn={checkedInLocations.has(location.id)}
            fontFamily="Nunito_400Regular"
            fontFamilyBold="Nunito_600SemiBold"
          />
        ))}

        {filteredLocations.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="location-outline" size={48} color={Colors.primaryLight} />
            <Text style={styles.emptyTitle}>No spots found</Text>
            <Text style={styles.emptyText}>Try a different filter or search term</Text>
          </View>
        )}
      </ScrollView>
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
  subtitle: {
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    color: Colors.textSecondary,
    marginTop: 2,
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
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
  filterScroll: {
    maxHeight: 50,
  },
  filterRow: {
    paddingHorizontal: 16,
    gap: 8,
    paddingVertical: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
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
  mapPlaceholder: {
    height: 160,
    borderRadius: 20,
    backgroundColor: Colors.accentLight + '30',
    marginBottom: 16,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapInner: {
    alignItems: 'center',
    gap: 6,
  },
  mapText: {
    fontSize: 18,
    fontFamily: 'Nunito_700Bold',
    color: Colors.text,
  },
  mapSubtext: {
    fontSize: 13,
    fontFamily: 'Nunito_400Regular',
    color: Colors.textSecondary,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Nunito_700Bold',
    color: Colors.text,
  },
  sectionCount: {
    fontSize: 13,
    fontFamily: 'Nunito_500Medium',
    color: Colors.textTertiary,
  },
  emptyState: {
    alignItems: 'center',
    gap: 8,
    paddingTop: 40,
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
  },
});
