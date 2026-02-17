import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Platform, TextInput, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import LocationCard from '@/components/LocationCard';
import { locations } from '@/lib/mock-data';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const BROOKLYN_CENTER = {
  latitude: 40.6782,
  longitude: -73.9442,
  latitudeDelta: 0.06,
  longitudeDelta: 0.06,
};

const TYPE_FILTERS = [
  { key: 'all', label: 'All', icon: 'grid' },
  { key: 'cafe', label: 'Cafes', icon: 'cafe' },
  { key: 'park', label: 'Parks', icon: 'leaf' },
  { key: 'playground', label: 'Play', icon: 'happy' },
  { key: 'restaurant', label: 'Eats', icon: 'restaurant' },
  { key: 'library', label: 'Library', icon: 'book' },
];

const TYPE_ICONS: Record<string, string> = {
  cafe: 'cafe',
  park: 'leaf',
  playground: 'happy',
  restaurant: 'restaurant',
  library: 'book',
};

const TYPE_COLORS: Record<string, string> = {
  cafe: '#D4A574',
  park: '#6BB8A8',
  playground: '#F5C469',
  restaurant: '#E8836B',
  library: '#5B9BD5',
};

function MapPin({ location, onPress, isSelected }: { location: typeof locations[0]; onPress: () => void; isSelected: boolean }) {
  const color = TYPE_COLORS[location.type] || Colors.primary;
  const iconName = TYPE_ICONS[location.type] || 'location';

  return (
    <Pressable onPress={onPress} style={[mapPinStyles.container, isSelected && mapPinStyles.selected]}>
      <View style={[mapPinStyles.badge, { backgroundColor: color }]}>
        <Ionicons name={iconName as any} size={12} color="#fff" />
        <Text style={mapPinStyles.rating}>{location.rating}</Text>
      </View>
      <Text style={mapPinStyles.name} numberOfLines={1}>{location.name}</Text>
      <View style={[mapPinStyles.arrow, { borderTopColor: isSelected ? Colors.primary : Colors.white }]} />
    </Pressable>
  );
}

const mapPinStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    maxWidth: 140,
  },
  selected: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginBottom: 2,
  },
  rating: {
    fontSize: 11,
    fontFamily: 'Nunito_700Bold',
    color: '#fff',
  },
  name: {
    fontSize: 11,
    fontFamily: 'Nunito_600SemiBold',
    color: Colors.text,
  },
  arrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: Colors.white,
    position: 'absolute',
    bottom: -6,
  },
});

function WebMapView({ filteredLocations, selectedLocation, onSelectLocation }: {
  filteredLocations: typeof locations;
  selectedLocation: string | null;
  onSelectLocation: (id: string) => void;
}) {
  return (
    <View style={webMapStyles.container}>
      <View style={webMapStyles.grid}>
        {filteredLocations.map((loc) => {
          const normalizedLat = ((loc.latitude - 40.66) / 0.04);
          const normalizedLng = ((loc.longitude + 74.0) / 0.04);
          const top = Math.max(10, Math.min(85, (1 - normalizedLat) * 100));
          const left = Math.max(5, Math.min(90, normalizedLng * 100));

          return (
            <View
              key={loc.id}
              style={[webMapStyles.pinWrapper, { top: `${top}%` as any, left: `${left}%` as any }]}
            >
              <MapPin
                location={loc}
                onPress={() => onSelectLocation(loc.id)}
                isSelected={selectedLocation === loc.id}
              />
            </View>
          );
        })}
      </View>
      <View style={webMapStyles.gridLines}>
        {[0, 1, 2, 3, 4].map(i => (
          <View key={`h${i}`} style={[webMapStyles.hLine, { top: `${(i + 1) * 20}%` as any }]} />
        ))}
        {[0, 1, 2, 3, 4].map(i => (
          <View key={`v${i}`} style={[webMapStyles.vLine, { left: `${(i + 1) * 20}%` as any }]} />
        ))}
      </View>
      <View style={webMapStyles.centerDot}>
        <View style={webMapStyles.centerDotInner} />
        <View style={webMapStyles.centerDotPulse} />
      </View>
    </View>
  );
}

const webMapStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8E4DF',
    position: 'relative',
  },
  grid: {
    flex: 1,
    position: 'relative',
  },
  pinWrapper: {
    position: 'absolute',
    transform: [{ translateX: -40 }, { translateY: -20 }],
    zIndex: 10,
  },
  gridLines: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  hLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#D5D0CB',
  },
  vLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: '#D5D0CB',
  },
  centerDot: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -8 }, { translateY: -8 }],
    zIndex: 5,
  },
  centerDotInner: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    borderWidth: 3,
    borderColor: Colors.white,
  },
  centerDotPulse: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary + '20',
    top: -8,
    left: -8,
  },
});

let MapView: any = null;
let Marker: any = null;
let Callout: any = null;

if (Platform.OS !== 'web') {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
  Callout = Maps.Callout;
}

function NativeMapView({ filteredLocations, selectedLocation, onSelectLocation, onCheckIn, checkedInLocations }: {
  filteredLocations: typeof locations;
  selectedLocation: string | null;
  onSelectLocation: (id: string) => void;
  onCheckIn: (id: string) => void;
  checkedInLocations: Set<string>;
}) {
  if (!MapView) return null;

  return (
    <MapView
      style={StyleSheet.absoluteFillObject}
      initialRegion={BROOKLYN_CENTER}
      showsUserLocation
      showsMyLocationButton={false}
    >
      {filteredLocations.map(loc => (
        <Marker
          key={loc.id}
          coordinate={{ latitude: loc.latitude, longitude: loc.longitude }}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSelectLocation(loc.id);
          }}
        >
          <MapPin
            location={loc}
            onPress={() => onSelectLocation(loc.id)}
            isSelected={selectedLocation === loc.id}
          />
        </Marker>
      ))}
    </MapView>
  );
}

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const { checkIn } = useApp();
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [checkedInLocations, setCheckedInLocations] = useState<Set<string>>(new Set());
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

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

  const handleToggleView = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setViewMode(prev => prev === 'map' ? 'list' : 'map');
  };

  const selectedLoc = selectedLocation ? locations.find(l => l.id === selectedLocation) : null;

  return (
    <View style={styles.container}>
      {viewMode === 'map' ? (
        <View style={styles.mapContainer}>
          {Platform.OS === 'web' ? (
            <WebMapView
              filteredLocations={filteredLocations}
              selectedLocation={selectedLocation}
              onSelectLocation={setSelectedLocation}
            />
          ) : (
            <NativeMapView
              filteredLocations={filteredLocations}
              selectedLocation={selectedLocation}
              onSelectLocation={setSelectedLocation}
              onCheckIn={handleCheckIn}
              checkedInLocations={checkedInLocations}
            />
          )}

          <View style={[styles.searchOverlay, { paddingTop: insets.top + webTopInset + 8 }]}>
            <View style={styles.searchBox}>
              <Ionicons name="search" size={18} color={Colors.textTertiary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Find a place"
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

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterRow}
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
                    size={14}
                    color={filter === f.key ? Colors.white : Colors.text}
                  />
                  <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>
                    {f.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {selectedLoc && (
            <View style={[styles.selectedCard, { bottom: 90 + (Platform.OS === 'web' ? 34 : insets.bottom) }]}>
              <Pressable onPress={() => setSelectedLocation(null)} style={styles.selectedCardClose}>
                <Ionicons name="close" size={18} color={Colors.textSecondary} />
              </Pressable>
              <LocationCard
                location={selectedLoc}
                onCheckIn={() => handleCheckIn(selectedLoc.id)}
                checkedIn={checkedInLocations.has(selectedLoc.id)}
                fontFamily="Nunito_400Regular"
                fontFamilyBold="Nunito_600SemiBold"
              />
            </View>
          )}
        </View>
      ) : (
        <View style={styles.listContainer}>
          <View style={[styles.listHeader, { paddingTop: insets.top + webTopInset + 8 }]}>
            <View style={styles.searchBox}>
              <Ionicons name="search" size={18} color={Colors.textTertiary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Find a place"
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

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterRow}
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
                    size={14}
                    color={filter === f.key ? Colors.white : Colors.text}
                  />
                  <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>
                    {f.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          >
            <View style={styles.listHeaderRow}>
              <Text style={styles.listTitle}>{filteredLocations.length} spots nearby</Text>
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

            <View style={{ height: 120 }} />
          </ScrollView>
        </View>
      )}

      <View style={[styles.toggleContainer, { bottom: (Platform.OS === 'web' ? 84 + 16 : 90 + insets.bottom) }]}>
        <Pressable
          onPress={handleToggleView}
          style={({ pressed }) => [styles.toggleButton, pressed && { transform: [{ scale: 0.95 }] }]}
        >
          <Ionicons
            name={viewMode === 'map' ? 'list' : 'map'}
            size={18}
            color={Colors.text}
          />
          <Text style={styles.toggleText}>
            {viewMode === 'map' ? 'List' : 'Map'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  searchOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 28,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Nunito_400Regular',
    color: Colors.text,
  },
  filterRow: {
    gap: 8,
    paddingVertical: 10,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
  },
  filterText: {
    fontSize: 13,
    fontFamily: 'Nunito_600SemiBold',
    color: Colors.text,
  },
  filterTextActive: {
    color: Colors.white,
  },
  selectedCard: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 10,
  },
  selectedCardClose: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 11,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContainer: {
    flex: 1,
  },
  listHeader: {
    paddingHorizontal: 16,
    backgroundColor: Colors.background,
    zIndex: 10,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 4,
  },
  listTitle: {
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
    color: Colors.text,
  },
  emptyState: {
    alignItems: 'center',
    gap: 8,
    paddingTop: 60,
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
  toggleContainer: {
    position: 'absolute',
    alignSelf: 'center',
    zIndex: 20,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.white,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  toggleText: {
    fontSize: 15,
    fontFamily: 'Nunito_700Bold',
    color: Colors.text,
  },
});
