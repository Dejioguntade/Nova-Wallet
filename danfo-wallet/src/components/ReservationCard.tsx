import { StyleSheet, Text, View } from 'react-native';
import { TravelReservation } from '../types/wallet';
import { colors, spacing } from '../theme';
import { formatDisplayDate } from '../utils/date';

interface ReservationCardProps {
  reservation: TravelReservation;
}

export const ReservationCard = ({ reservation }: ReservationCardProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{reservation.title}</Text>
        <Text style={styles.tag}>{reservation.type.toUpperCase()}</Text>
      </View>
      <Text style={styles.provider}>{reservation.provider}</Text>
      <Text style={styles.location}>{reservation.location}</Text>
      <View style={styles.dateRow}>
        <View>
          <Text style={styles.label}>Start</Text>
          <Text style={styles.value}>{formatDisplayDate(reservation.startDate)}</Text>
        </View>
        <View>
          <Text style={styles.label}>End</Text>
          <Text style={styles.value}>{formatDisplayDate(reservation.endDate)}</Text>
        </View>
        <View>
          <Text style={styles.label}>Seat / Room</Text>
          <Text style={styles.value}>{reservation.seatOrRoom ?? 'TBD'}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  tag: {
    color: colors.textPrimary,
    backgroundColor: colors.overlay,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    fontSize: 12,
    letterSpacing: 1,
  },
  provider: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
    fontSize: 14,
  },
  location: {
    color: colors.textPrimary,
    marginTop: spacing.md,
    fontSize: 16,
    fontWeight: '500',
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  value: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
});

export default ReservationCard;
