import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

export function Card({ title, children, icon }) {
  return (
    <View style={styles.card}>
      {title && (
        <View style={styles.header}>
          {icon}
          <Text style={styles.cardTitle}>{title}</Text>
        </View>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceRice,
    borderColor: colors.softBorder,
    borderRadius: 16,
    borderWidth: 1,
    gap: 16,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    color: colors.onSurface,
    fontSize: 18,
    fontWeight: '700',
  },
});
