import { StyleSheet, Text, View } from 'react-native';
import { Reminder } from '../types/wallet';
import { colors, spacing } from '../theme';
import { formatDisplayDate } from '../utils/date';

interface ReminderCardProps {
  reminder: Reminder;
}

const priorityColors: Record<Reminder['priority'], string> = {
  high: colors.danger,
  medium: colors.warning,
  low: colors.positive,
};

export const ReminderCard = ({ reminder }: ReminderCardProps) => {
  return (
    <View style={styles.container}>
      <View style={[styles.priorityDot, { backgroundColor: priorityColors[reminder.priority] }]} />
      <View style={styles.content}>
        <Text style={styles.title}>{reminder.title}</Text>
        {reminder.description ? <Text style={styles.subtitle}>{reminder.description}</Text> : null}
        <Text style={styles.meta}>Due {formatDisplayDate(reminder.dueDate, 'dd MMM yyyy, HH:mm')}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: 16,
    marginBottom: spacing.sm,
    alignItems: 'flex-start',
  },
  priorityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.md,
    marginTop: spacing.sm,
  },
  content: {
    flex: 1,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  subtitle: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  meta: {
    color: colors.textSecondary,
    marginTop: spacing.sm,
    fontSize: 12,
  },
});

export default ReminderCard;
