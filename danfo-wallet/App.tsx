import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';
import AuthNavigator from './src/navigation/AuthNavigator';
import { WalletProvider } from './src/context/WalletContext';
import { AuthProvider } from './src/context/AuthContext';
import useAuth from './src/hooks/useAuth';
import { colors } from './src/theme';

const AuthGate = () => {
  const { session, initializing } = useAuth();

  if (initializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={colors.textPrimary} />
      </View>
    );
  }

  if (!session) {
    return <AuthNavigator />;
  }

  return (
    <WalletProvider>
      <RootNavigator />
    </WalletProvider>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="light" backgroundColor={colors.background} />
        <AuthGate />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
