import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

export function Card({ title, children, icon, headerRight }) {
  return (
    <View style={styles.card}>
      {title ? (
        <View style={styles.header}>
          <View style={styles.headerTitleGroup}>
            {icon}
            <Text style={styles.cardTitle}>{title}</Text>
          </View>
          {headerRight ? <View style={styles.headerRight}>{headerRight}</View> : null}
        </View>
      ) : null}
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
    shadowColor: colors.mossText,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.035,
    shadowRadius: 8,
    elevation: 1,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  headerTitleGroup: {
    alignItems: 'center',
    flexDirection: 'row',
    flexShrink: 1,
    gap: 8,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  cardTitle: {
    color: colors.onSurface,
    fontSize: 18,
    fontWeight: '800',
  },
});
