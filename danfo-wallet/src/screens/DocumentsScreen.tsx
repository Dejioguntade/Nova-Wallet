import { FlatList, StyleSheet, Text, View } from 'react-native';
import DocumentCard from '../components/DocumentCard';
import SectionHeader from '../components/SectionHeader';
import useWallet from '../hooks/useWallet';
import { colors, spacing } from '../theme';

const DocumentsScreen = () => {
  const { state } = useWallet();

  return (
    <View style={styles.container}>
      <FlatList
        data={state.documents}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={() => (
          <View style={styles.header}>
            <SectionHeader title="Travel documents" subtitle="Passports, visas, boarding passes" />
          </View>
        )}
        renderItem={({ item }) => <DocumentCard document={item} />}
        ListEmptyComponent={<Text style={styles.empty}>No documents yet.</Text>}
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

export default DocumentsScreen;
