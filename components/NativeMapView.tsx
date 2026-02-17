import React from 'react';
import { View } from 'react-native';
import { Location } from '@/lib/types';

interface NativeMapProps {
  filteredLocations: Location[];
  selectedLocation: string | null;
  onSelectLocation: (id: string) => void;
}

export default function NativeMapViewComponent(_props: NativeMapProps) {
  return <View />;
}
