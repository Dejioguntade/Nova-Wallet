import { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/AuthNavigator';
import { colors, spacing } from '../theme';
import useAuth from '../hooks/useAuth';

const VerifyEmailScreen = ({ route, navigation }: NativeStackScreenProps<AuthStackParamList, 'VerifyEmail'>) => {
  const { resendVerification } = useAuth();
  const { email } = route.params;
  const [sending, setSending] = useState(false);

  const handleResend = async () => {
    try {
      setSending(true);
      await resendVerification(email);
      Alert.alert('Verification email sent', 'Check your inbox and spam folder.');
    } catch (error: any) {
      Alert.alert('Unable to resend', error.message ?? 'Try again later.');
    } finally {
      setSending(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify your email</Text>
      <Text style={styles.subtitle}>
        We’ve sent a verification link to {email}. Open the link on your device to activate your account.
        Once verified, return here and sign in to access your wallet.
      </Text>

      <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('SignIn')}>
        <Text style={styles.primaryButtonText}>Back to sign in</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryButton} onPress={handleResend} disabled={sending}>
        {sending ? (
          <ActivityIndicator color={colors.textPrimary} />
        ) : (
          <Text style={styles.secondaryButtonText}>Resend verification email</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.xl,
    justifyContent: 'center',
    gap: spacing.lg,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 32,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 16,
    lineHeight: 24,
  },
  primaryButton: {
    backgroundColor: colors.highlight,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    borderRadius: 12,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.overlay,
  },
  secondaryButtonText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default VerifyEmailScreen;
