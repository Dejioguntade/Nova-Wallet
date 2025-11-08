import { Feather } from '@expo/vector-icons';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { TouchableOpacity } from 'react-native';
import ReminderCard from '../components/ReminderCard';
import SectionHeader from '../components/SectionHeader';
import TimelineItem from '../components/TimelineItem';
import PaymentCardView from '../components/PaymentCard';
import ReservationCard from '../components/ReservationCard';
import { colors, spacing } from '../theme';
import useWallet from '../hooks/useWallet';
import useAuth from '../hooks/useAuth';

const HomeScreen = () => {
  const { state } = useWallet();
  const { user, signOut } = useAuth();

  const nextReservation = useMemo(
    () =>
      [...state.reservations]
        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
        .find((reservation) => new Date(reservation.startDate).getTime() >= Date.now()),
    [state.reservations],
  );

  const upcomingReminders = useMemo(
    () =>
      state.reminders
        .filter((reminder) => reminder.status === 'pending')
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
        .slice(0, 3),
    [state.reminders],
  );

  const timelineSlice = useMemo(
    () => state.timeline.slice(0, 5),
    [state.timeline],
  );

  const primaryCard = state.cards[0];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.user}>{user?.user_metadata?.firstName ?? 'Traveler'}</Text>
        </View>
        <View style={styles.heroActions}>
          <View style={styles.heroBadge}>
            <Feather name="globe" size={18} color={colors.textPrimary} />
            <Text style={styles.heroBadgeText}>Trip ready</Text>
          </View>
          <TouchableOpacity onPress={signOut}>
            <Text style={styles.signOut}>Sign out</Text>
          </TouchableOpacity>
        </View>
      </View>

      {nextReservation ? (
        <View style={styles.section}>
          <SectionHeader title="Next trip" subtitle="Details for your upcoming travel" />
          <ReservationCard reservation={nextReservation} />
        </View>
      ) : null}

      {primaryCard ? (
        <View style={styles.section}>
          <SectionHeader title="Primary card" subtitle="Quick access to your travel card" />
          <PaymentCardView card={primaryCard} />
        </View>
      ) : null}

      <View style={styles.section}>
        <SectionHeader title="Reminders" subtitle="Keep ahead of deadlines" />
        {upcomingReminders.length > 0 ? (
          upcomingReminders.map((reminder) => <ReminderCard key={reminder.id} reminder={reminder} />)
        ) : (
          <Text style={styles.emptyText}>No reminders scheduled.</Text>
        )}
      </View>

      <View style={styles.section}>
        <SectionHeader title="Timeline" subtitle="What’s happening next" />
        {timelineSlice.map((event) => (
          <TimelineItem key={event.id} event={event} />
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    paddingTop: spacing.xl,
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  greeting: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  user: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '700',
  },
  heroActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  heroBadge: {
    backgroundColor: colors.overlay,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  heroBadgeText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  section: {
    marginTop: spacing.xl,
  },
  signOut: {
    color: colors.textSecondary,
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  emptyText: {
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
});

export default HomeScreen;
