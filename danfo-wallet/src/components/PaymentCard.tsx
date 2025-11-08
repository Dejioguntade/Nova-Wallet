import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import { PaymentCard } from '../types/wallet';
import { colors, spacing } from '../theme';
import { formatCardExpiry } from '../utils/date';

interface PaymentCardProps {
  card: PaymentCard;
}

export const PaymentCardView = ({ card }: PaymentCardProps) => {
  return (
    <LinearGradient
      colors={[card.color ?? colors.accent, colors.background]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <Text style={styles.brand}>{card.brand.toUpperCase()}</Text>
      <Text style={styles.number}>•••• {card.last4}</Text>
      <View style={styles.metaRow}>
        <View>
          <Text style={styles.label}>Card Holder</Text>
          <Text style={styles.value}>{card.holderName.toUpperCase()}</Text>
        </View>
        <View>
          <Text style={styles.label}>Expiry</Text>
          <Text style={styles.value}>{formatCardExpiry(card.expiryMonth, card.expiryYear)}</Text>
        </View>
      </View>
      <View style={styles.providerChip}>
        <Text style={styles.provider}>{card.provider}</Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: spacing.lg,
    marginBottom: spacing.md,
    minHeight: 180,
    justifyContent: 'space-between',
  },
  brand: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  number: {
    color: colors.textPrimary,
    fontSize: 26,
    letterSpacing: 2,
    marginTop: spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  value: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  providerChip: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  provider: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
});

export default PaymentCardView;
