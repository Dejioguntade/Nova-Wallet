import { StyleSheet, Text, View } from 'react-native';
import { TimelineEvent } from '../types/wallet';
import { colors, spacing } from '../theme';
import { formatDisplayDate } from '../utils/date';

interface TimelineItemProps {
  event: TimelineEvent;
}

const categoryColors: Record<TimelineEvent['category'], string> = {
  'document-expiry': colors.warning,
  'trip-start': colors.accent,
  'trip-end': colors.accent,
  reservation: colors.highlight,
  'card-expiry': colors.warning,
  reminder: colors.positive,
};

export const TimelineItem = ({ event }: TimelineItemProps) => {
  return (
    <View style={styles.container}>
      <View style={[styles.indicator, { backgroundColor: categoryColors[event.category] }]}
      />
      <View style={styles.content}>
        <Text style={styles.date}>{formatDisplayDate(event.date, 'dd MMM, HH:mm')}</Text>
        <Text style={styles.title}>{event.title}</Text>
        {event.subtitle ? <Text style={styles.subtitle}>{event.subtitle}</Text> : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  indicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: spacing.xs,
  },
  content: {
    flex: 1,
    borderBottomColor: colors.overlay,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingBottom: spacing.sm,
  },
  date: {
    color: colors.textSecondary,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  subtitle: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
    fontSize: 14,
  },
});

export default TimelineItem;
