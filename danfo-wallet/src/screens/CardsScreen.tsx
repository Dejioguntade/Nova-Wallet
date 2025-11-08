import { FlatList, StyleSheet, Text, View } from 'react-native';
import PaymentCardView from '../components/PaymentCard';
import SectionHeader from '../components/SectionHeader';
import useWallet from '../hooks/useWallet';
import { colors, spacing } from '../theme';

const CardsScreen = () => {
  const { state } = useWallet();

  return (
    <View style={styles.container}>
      <FlatList
        data={state.cards}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={() => (
          <View style={styles.header}>
            <SectionHeader title="Payment cards" subtitle="Securely tokenized on-device" />
          </View>
        )}
        renderItem={({ item }) => <PaymentCardView card={item} />}
        ListEmptyComponent={<Text style={styles.empty}>No cards yet.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  header: {
    marginBottom: spacing.lg,
  },
  empty: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});

export default CardsScreen;
