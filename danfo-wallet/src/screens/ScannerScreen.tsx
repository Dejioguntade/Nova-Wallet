import { useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { colors, spacing } from '../theme';
import useWallet from '../hooks/useWallet';
import { WalletDocument } from '../types/wallet';

const ScannerScreen = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraFacing, setCameraFacing] = useState<'front' | 'back'>('back');
  const cameraRef = useRef<CameraView>(null);
  const [processing, setProcessing] = useState(false);
  const { addDocument } = useWallet();

  const toggleCamera = useCallback(() => {
    setCameraFacing((prev) => (prev === 'back' ? 'front' : 'back'));
  }, []);

  const handleCapture = useCallback(async () => {
    if (!cameraRef.current) return;
    try {
      setProcessing(true);
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `doc-${Date.now()}`;
      const newDocument: WalletDocument = {
        id,
        type: 'other',
        title: 'Scanned document',
        issuedBy: 'Manual capture',
        identifier: id.slice(-8),
        issuedAt: new Date().toISOString(),
        traveler: 'Unassigned',
        storageUri: photo.uri,
        notes: 'Captured via device camera',
      };
      addDocument(newDocument);
      Alert.alert('Document saved', 'Your scan has been added to the wallet documents.');
    } catch (error: any) {
      Alert.alert('Scan failed', error.message ?? 'Unable to capture document.');
    } finally {
      setProcessing(false);
    }
  }, [addDocument, cameraRef]);

  const permissionContent = useMemo(() => {
    if (!permission) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.textPrimary} />
          <Text style={styles.permissionText}>Checking camera access…</Text>
        </View>
      );
    }

    if (!permission.granted) {
      return (
        <View style={styles.centered}>
          <Text style={styles.permissionText}>
            Danfo Wallet needs camera access to scan documents.
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant camera permission</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return null;
  }, [permission, requestPermission]);

  if (!permission?.granted) {
    return <View style={styles.container}>{permissionContent}</View>;
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} ref={cameraRef} facing={cameraFacing} mode="picture">
        <View style={styles.overlay}>
          <Text style={styles.instructions}>Align your document within the frame and tap capture.</Text>
        </View>
      </CameraView>
      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButton} onPress={toggleCamera}>
          <Text style={styles.controlText}>Flip</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.captureButton, processing ? styles.captureDisabled : undefined]}
          onPress={handleCapture}
          disabled={processing}
        >
          {processing ? <ActivityIndicator color={colors.textPrimary} /> : <Text style={styles.captureText}>Capture</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: spacing.lg,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  instructions: {
    color: colors.textPrimary,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
    backgroundColor: 'rgba(0,0,0,0.45)',
    padding: spacing.md,
    borderRadius: 12,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: spacing.lg,
    backgroundColor: colors.card,
  },
  controlButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.overlay,
  },
  controlText: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  captureButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 999,
    backgroundColor: colors.highlight,
    alignItems: 'center',
    minWidth: 140,
  },
  captureDisabled: {
    opacity: 0.6,
  },
  captureText: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 16,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    padding: spacing.lg,
  },
  permissionText: {
    color: colors.textPrimary,
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
  },
  permissionButton: {
    backgroundColor: colors.highlight,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 12,
  },
  permissionButtonText: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
});

export default ScannerScreen;
