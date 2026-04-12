import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Platform, TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import LocationCard from '@/components/LocationCard';
import NativeMapViewComponent from '@/components/NativeMapView';
import { locations } from '@/lib/mock-data';
import { Location } from '@/lib/types';
import { useClasses } from '@/lib/use-classes';

const TYPE_FILTERS = [
  { key: 'all', label: 'All', icon: 'grid' },
  { key: 'cafe', label: 'Cafes', icon: 'cafe' },
  { key: 'park', label: 'Parks', icon: 'leaf' },
  { key: 'playground', label: 'Play', icon: 'happy' },
  { key: 'restaurant', label: 'Eats', icon: 'restaurant' },
  { key: 'library', label: 'Library', icon: 'book' },
  { key: 'class', label: 'Classes', icon: 'school' },
];

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

function WebMapPin({ location, onPress, isSelected }: { location: Location; onPress: () => void; isSelected: boolean }) {
  const color = TYPE_COLORS[location.type] || Colors.primary;
  const iconName = TYPE_ICONS[location.type] || 'location';

  return (
    <Pressable onPress={onPress} style={[pinStyles.container, isSelected && pinStyles.selected]}>
      <View style={[pinStyles.badge, { backgroundColor: color }]}>
        <Ionicons name={iconName as any} size={12} color="#fff" />
        <Text style={pinStyles.rating}>{location.rating}</Text>
      </View>
      <Text style={pinStyles.name} numberOfLines={1}>{location.name}</Text>
    </Pressable>
  );
}

const pinStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 5,
    boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.15)',
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
});

let mapboxgl: typeof import('mapbox-gl') | null = null;
if (Platform.OS === 'web') {
  mapboxgl = require('mapbox-gl');
  require('mapbox-gl/dist/mapbox-gl.css');
}

const MAPBOX_TOKEN = (process.env.EXPO_PUBLIC_MAPBOX_TOKEN ?? '').trim();

function createPinHTML(location: Location, isSelected: boolean): string {
  const color = TYPE_COLORS[location.type] || '#D4A574';
  const iconMap: Record<string, string> = {
    cafe: '\u2615', park: '\ud83c\udf3f', playground: '\ud83d\ude04',
    restaurant: '\ud83c\udf7d', library: '\ud83d\udcda', class: '\ud83c\udf93',
  };
  const icon = iconMap[location.type] || '\ud83d\udccd';
  const border = isSelected ? `border: 2px solid ${Colors.primary};` : '';
  return `<div style="display:flex;flex-direction:column;align-items:center;background:#fff;border-radius:10px;padding:5px 8px;box-shadow:0 2px 6px rgba(0,0,0,0.15);max-width:140px;cursor:pointer;${border}">
    <div style="display:flex;align-items:center;gap:4px;background:${color};padding:2px 6px;border-radius:8px;margin-bottom:2px;">
      <span style="font-size:10px">${icon}</span>
      <span style="font-size:11px;font-weight:700;color:#fff;font-family:Nunito,sans-serif">${location.rating}</span>
    </div>
    <span style="font-size:11px;font-weight:600;color:#3D3A36;font-family:Nunito,sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:120px">${location.name}</span>
  </div>`;
}

function WebMapView({ filteredLocations, selectedLocation, onSelectLocation }: {
  filteredLocations: Location[];
  selectedLocation: string | null;
  onSelectLocation: (id: string) => void;
}) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  // Initialize map once
  useEffect(() => {
    if (!MAPBOX_TOKEN || !mapboxgl || !mapContainerRef.current || mapRef.current) return;
    mapboxgl.accessToken = MAPBOX_TOKEN;
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [-73.9800, 40.6800],
      zoom: 13.5,
    });
    map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, [MAPBOX_TOKEN]);

  // Update markers when filteredLocations or selectedLocation changes
  useEffect(() => {
    if (!MAPBOX_TOKEN || !mapboxgl || !mapRef.current) return;
    // Remove old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    // Add new markers
    filteredLocations.forEach(loc => {
      const el = document.createElement('div');
      el.innerHTML = createPinHTML(loc, selectedLocation === loc.id);
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        onSelectLocation(loc.id);
      });
      const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([loc.longitude, loc.latitude])
        .addTo(mapRef.current!);
      markersRef.current.push(marker);
    });
  }, [filteredLocations, selectedLocation, onSelectLocation, MAPBOX_TOKEN]);

  if (!MAPBOX_TOKEN) {
    return (
      <View style={styles.mapMissingToken}>
        <Ionicons name="map-outline" size={48} color={Colors.textTertiary} />
        <Text style={styles.mapMissingTokenTitle}>Map not configured</Text>
        <Text style={styles.mapMissingTokenText}>
          Set EXPO_PUBLIC_MAPBOX_TOKEN in your .env to load Mapbox on web (see README).
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <div ref={mapContainerRef as any} style={{ width: '100%', height: '100%' }} />
    </View>
  );
}

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const { checkIn } = useApp();
  const { classes } = useClasses();
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [checkedInLocations, setCheckedInLocations] = useState<Set<string>>(new Set());
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  // Merge locations with server classes (dedup by id)
  const allLocations = React.useMemo(() => {
    const seen = new Set(locations.map(l => l.id));
    const merged = [...locations];
    for (const cls of classes) {
      if (!seen.has(cls.id)) {
        merged.push(cls);
        seen.add(cls.id);
      }
    }
    return merged;
  }, [classes]);

  const filteredLocations = allLocations.filter(loc => {
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

  const selectedLoc = selectedLocation ? allLocations.find(l => l.id === selectedLocation) : null;

  const renderSearchAndFilters = () => (
    <>
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
    </>
  );

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
            <NativeMapViewComponent
              filteredLocations={filteredLocations}
              selectedLocation={selectedLocation}
              onSelectLocation={(id: string) => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedLocation(id);
              }}
            />
          )}

          <View style={[styles.searchOverlay, { paddingTop: insets.top + webTopInset + 8 }]}>
            {renderSearchAndFilters()}
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
            {renderSearchAndFilters()}
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
        {viewMode === 'map' && filteredLocations.length > 0 && (
          <View style={styles.countPill}>
            <Ionicons name="location" size={11} color={Colors.primary} />
            <Text style={styles.countPillText}>{filteredLocations.length} showing</Text>
          </View>
        )}
        <Pressable
          onPress={handleToggleView}
          style={({ pressed }) => [styles.toggleButton, pressed && { transform: [{ scale: 0.95 }] }]}
          testID="view-toggle"
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
  mapMissingToken: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    backgroundColor: Colors.backgroundSecondary,
    gap: 8,
  },
  mapMissingTokenTitle: {
    fontSize: 18,
    fontFamily: 'Nunito_700Bold',
    color: Colors.text,
    textAlign: 'center',
  },
  mapMissingTokenText: {
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
    maxWidth: 320,
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
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
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
    boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.06)',
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
    alignItems: 'center',
    gap: 6,
    zIndex: 20,
  },
  countPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.white,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  countPillText: {
    fontSize: 12,
    fontFamily: 'Nunito_600SemiBold',
    color: Colors.textSecondary,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.white,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 28,
    boxShadow: '0px 3px 10px rgba(0, 0, 0, 0.15)',
  },
  toggleText: {
    fontSize: 15,
    fontFamily: 'Nunito_700Bold',
    color: Colors.text,
  },
});
