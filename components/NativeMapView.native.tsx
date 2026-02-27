import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { Location } from '@/lib/types';

const BROOKLYN_CENTER = {
  latitude: 40.6782,
  longitude: -73.9442,
  latitudeDelta: 0.06,
  longitudeDelta: 0.06,
};

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

function MapPinNative({ location, isSelected }: { location: Location; isSelected: boolean }) {
  const color = TYPE_COLORS[location.type] || Colors.primary;
  const iconName = TYPE_ICONS[location.type] || 'location';

  return (
    <View style={[pinStyles.container, isSelected && pinStyles.selected]}>
      <View style={[pinStyles.badge, { backgroundColor: color }]}>
        <Ionicons name={iconName as any} size={12} color="#fff" />
        <Text style={pinStyles.rating}>{location.rating}</Text>
      </View>
      <Text style={pinStyles.name} numberOfLines={1}>{location.name}</Text>
    </View>
  );
}

const pinStyles = StyleSheet.create({
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
});

interface NativeMapProps {
  filteredLocations: Location[];
  selectedLocation: string | null;
  onSelectLocation: (id: string) => void;
}

export default function NativeMapViewComponent({ filteredLocations, selectedLocation, onSelectLocation }: NativeMapProps) {
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
          <MapPinNative location={loc} isSelected={selectedLocation === loc.id} />
        </Marker>
      ))}
    </MapView>
  );
}
