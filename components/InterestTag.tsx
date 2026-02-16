import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '@/constants/colors';

interface InterestTagProps {
  label: string;
  small?: boolean;
  active?: boolean;
}

export default function InterestTag({ label, small, active }: InterestTagProps) {
  return (
    <View style={[
      styles.tag,
      small && styles.tagSmall,
      active && styles.tagActive,
    ]}>
      <Text style={[
        styles.label,
        small && styles.labelSmall,
        active && styles.labelActive,
      ]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.blush,
  },
  tagSmall: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  tagActive: {
    backgroundColor: Colors.primary,
  },
  label: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: Colors.primary,
  },
  labelSmall: {
    fontSize: 11,
  },
  labelActive: {
    color: Colors.white,
  },
});
