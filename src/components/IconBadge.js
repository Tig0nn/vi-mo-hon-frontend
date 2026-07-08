import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

export function IconBadge({ label, variant = 'muted', size = 'md' }) {
  return (
    <View style={[styles.badge, styles[variant], styles[size]]}>
      <Text style={[styles.label, styles[`${variant}Label`], styles[`${size}Label`]]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    borderRadius: 999,
    justifyContent: 'center',
  },
  md: {
    height: 32,
    width: 32,
  },
  lg: {
    height: 64,
    width: 64,
  },
  muted: {
    backgroundColor: colors.surfaceMist,
    borderColor: colors.softBorder,
    borderWidth: 1,
  },
  primary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    borderWidth: 1,
  },
  warm: {
    backgroundColor: colors.secondaryContainer,
    borderColor: colors.secondaryContainer,
    borderWidth: 1,
  },
  label: {
    fontWeight: '800',
    textAlign: 'center',
  },
  mdLabel: {
    fontSize: 12,
  },
  lgLabel: {
    fontSize: 22,
  },
  mutedLabel: {
    color: colors.mossText,
  },
  primaryLabel: {
    color: colors.surfaceRice,
  },
  warmLabel: {
    color: colors.onSurface,
  },
});
