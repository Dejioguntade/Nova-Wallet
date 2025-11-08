import { FlatList, StyleSheet, Text, View } from 'react-native';
import TimelineItem from '../components/TimelineItem';
import SectionHeader from '../components/SectionHeader';
import useWallet from '../hooks/useWallet';
import { colors, spacing } from '../theme';

const TimelineScreen = () => {
  const { state } = useWallet();

  return (
    <View style={styles.container}>
      <FlatList
        data={state.timeline}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={() => (
          <View style={styles.header}>
            <SectionHeader title="Timeline" subtitle="All upcoming events" />
          </View>
        )}
        renderItem={({ item }) => <TimelineItem event={item} />}
        ListEmptyComponent={<Text style={styles.empty}>No upcoming events.</Text>}
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
    paddingHorizontal: spacing.lg,
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

export default TimelineScreen;
