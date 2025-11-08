import { StyleSheet, Text, View } from 'react-native';
import { WalletDocument } from '../types/wallet';
import { colors, spacing } from '../theme';
import { formatDisplayDate, daysUntil, isExpired } from '../utils/date';

interface DocumentCardProps {
  document: WalletDocument;
}

export const DocumentCard = ({ document }: DocumentCardProps) => {
  const expiresIn = daysUntil(document.expiresAt ?? undefined);
  const expired = isExpired(document.expiresAt ?? undefined);

  return (
    <View style={styles.container}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{document.type.toUpperCase()}</Text>
      </View>
      <Text style={styles.title}>{document.title}</Text>
      <Text style={styles.subtitle}>{document.traveler}</Text>
      <View style={styles.row}>
        <Text style={styles.meta}>Issued by {document.issuedBy}</Text>
        <Text style={styles.meta}>ID {document.identifier}</Text>
      </View>
      <View style={styles.footer}>
        <Text style={styles.expiryLabel}>Expires</Text>
        <Text style={[styles.expiryValue, expired ? styles.expired : undefined]}>
          {formatDisplayDate(document.expiresAt)}
        </Text>
        {expiresIn !== null && !expired ? (
          <Text style={styles.expiryMeta}>{expiresIn} days left</Text>
        ) : null}
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
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.accent,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginBottom: spacing.sm,
  },
  badgeText: {
    color: colors.textPrimary,
    fontSize: 12,
    letterSpacing: 1.2,
    fontWeight: '600',
  },
  title: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  meta: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  expiryLabel: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  expiryValue: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  expiryMeta: {
    color: colors.highlight,
    fontSize: 13,
  },
  expired: {
    color: colors.danger,
  },
});

export default DocumentCard;
