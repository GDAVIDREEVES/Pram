import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getAvatarColor, getInitials } from '@/lib/mock-data';
import Colors from '@/constants/colors';

interface AvatarProps {
  name: string;
  size?: number;
  verified?: boolean;
  hangNow?: boolean;
}

export default function Avatar({ name, size = 48, verified, hangNow }: AvatarProps) {
  const color = getAvatarColor(name);
  const initials = getInitials(name);
  const fontSize = size * 0.38;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {hangNow && (
        <View style={[styles.hangNowRing, { width: size + 6, height: size + 6, borderRadius: (size + 6) / 2 }]} />
      )}
      <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: color }]}>
        <Text style={[styles.initials, { fontSize }]}>{initials}</Text>
      </View>
      {verified && (
        <View style={[styles.verifiedBadge, { right: hangNow ? -1 : -2, bottom: hangNow ? -1 : -2 }]}>
          <View style={styles.verifiedInner}>
            <Text style={styles.verifiedCheck}>{'✓'}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  hangNowRing: {
    position: 'absolute',
    borderWidth: 2.5,
    borderColor: Colors.accent,
  },
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: '#FFFFFF',
    fontWeight: '700' as const,
    letterSpacing: 0.5,
  },
  verifiedBadge: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedCheck: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '700' as const,
  },
});
