import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';
import { WalletProvider } from './src/context/WalletContext';
import { colors } from './src/theme';

export default function App() {
  return (
    <SafeAreaProvider>
      <WalletProvider>
        <StatusBar style="light" backgroundColor={colors.background} />
        <RootNavigator />
      </WalletProvider>
    </SafeAreaProvider>
  );
}
