import { fromByteArray } from 'base64-js';
import * as FileSystem from 'expo-file-system';
import { SkCanvas, SkPictureRecorder, Skia } from '@shopify/react-native-skia';
import {
  PaymentCard,
  TravelReservation,
  WalletDocument,
} from '../../types/wallet';
import { encryptBytes } from '../../utils/encryption';

interface RenderOptions {
  outputName: string;
  keyAlias?: string;
  watermark?: string;
}

interface RenderResult {
  encryptedUri: string;
  previewDataUri: string;
  metadata: Record<string, unknown>;
}

const createCanvas = (width: number, height: number) => {
  const recorder = Skia.PictureRecorder();
  const canvas = recorder.beginRecording({ x: 0, y: 0, width, height });
  return { canvas, recorder, width, height };
};

const persistEncryptedPayload = async (payload: string, outputName: string) => {
  const vaultDirectory = `${FileSystem.documentDirectory}vault/`;
  await FileSystem.makeDirectoryAsync(vaultDirectory, { intermediates: true });
  const targetUri = `${vaultDirectory}${outputName}.danfo`;
  await FileSystem.writeAsStringAsync(targetUri, payload, {
    encoding: FileSystem.EncodingType.UTF8,
  });
  return targetUri;
};

const renderToEncryptedPng = async (
  recorder: SkPictureRecorder,
  outputName: string,
  keyAlias?: string,
) => {
  const picture = recorder.finishRecordingAsPicture();
  const image = picture.makeImageSnapshot();
  const pngBytes = image.encodeToBytes();
  const encryptedPayload = await encryptBytes(pngBytes, { keyAlias });
  const previewDataUri = `data:image/png;base64,${fromByteArray(pngBytes)}`;
  const encryptedUri = await persistEncryptedPayload(encryptedPayload, outputName);
  return { encryptedUri, previewDataUri };
};

const applyWatermark = (canvas: SkCanvas, width: number, height: number, watermark?: string) => {
  if (!watermark) return;
  const paint = Skia.Paint();
  paint.setColor(Skia.Color('rgba(255,255,255,0.08)'));
  const font = Skia.Font(Skia.Typeface('Roboto'), 72);
  canvas.save();
  canvas.rotate(-25, width / 2, height / 2);
  canvas.drawText(watermark.toUpperCase(), width / 2 - 240, height / 2, paint, font);
  canvas.restore();
};

export const renderPassportTemplate = async (
  document: WalletDocument,
  options: RenderOptions,
): Promise<RenderResult> => {
  const { canvas, recorder, width, height } = createCanvas(1080, 1620);

  const backgroundPaint = Skia.Paint();
  backgroundPaint.setShader(
    Skia.Shader.MakeLinearGradient(
      { x: 0, y: 0 },
      { x: width, y: height },
      [Skia.Color('#101224'), Skia.Color('#23346B')],
      null,
      Skia.TileMode.Clamp,
    ),
  );
  canvas.drawRect({ x: 0, y: 0, width, height }, backgroundPaint);

  const headerPaint = Skia.Paint();
  headerPaint.setColor(Skia.Color('#F7B733'));
  canvas.drawRect({ x: 0, y: 0, width, height * 0.18 }, headerPaint);

  const fontPrimary = Skia.Font(Skia.Typeface('Roboto'), 72);
  const fontSecondary = Skia.Font(Skia.Typeface('Roboto'), 42);
  const fontMono = Skia.Font(Skia.Typeface('Courier New'), 44);
  const textPaint = Skia.Paint();
  textPaint.setColor(Skia.Color('#FFFFFF'));

  canvas.drawText('DANFO REPUBLIC OF TRAVEL', 72, 140, textPaint, fontPrimary);
  canvas.drawText(document.title.toUpperCase(), 72, 240, textPaint, fontSecondary);
  canvas.drawText(`Issued by ${document.issuedBy}`, 72, 320, textPaint, fontSecondary);
  canvas.drawText(`Holder: ${document.traveler}`, 72, 420, textPaint, fontSecondary);
  canvas.drawText(`ID: ${document.identifier}`, 72, 500, textPaint, fontSecondary);

  if (document.expiresAt) {
    canvas.drawText(`Expires: ${new Date(document.expiresAt).toDateString()}`, 72, 580, textPaint, fontSecondary);
  }

  const mrzZoneY = height - 280;
  canvas.drawRect({ x: 0, y: mrzZoneY - 40, width, height: 260 }, headerPaint);
  const mrzPaint = Skia.Paint();
  mrzPaint.setColor(Skia.Color('#0B0D17'));
  canvas.drawRect({ x: 24, y: mrzZoneY - 16, width: width - 48, height: 220 }, mrzPaint);

  const mrzTextPaint = Skia.Paint();
  mrzTextPaint.setColor(Skia.Color('#F7F7F7'));
  const cleanedName = document.traveler.replace(/\s+/g, '<').toUpperCase();
  const mrzLine1 = `P<NGA${cleanedName}<<${document.identifier}`;
  const mrzLine2 = `9876543210NGA${document.traveler.substring(0, 3).toUpperCase()}<<<<<<<<<`;
  canvas.drawText(mrzLine1.slice(0, 44), 48, mrzZoneY + 60, mrzTextPaint, fontMono);
  canvas.drawText(mrzLine2.slice(0, 44), 48, mrzZoneY + 140, mrzTextPaint, fontMono);

  applyWatermark(canvas, width, height, options.watermark);

  const { encryptedUri, previewDataUri } = await renderToEncryptedPng(
    recorder,
    options.outputName,
    options.keyAlias,
  );

  return {
    encryptedUri,
    previewDataUri,
    metadata: {
      type: 'passport',
      documentId: document.id,
      traveler: document.traveler,
    },
  };
};

export const renderTicketTemplate = async (
  reservation: TravelReservation,
  options: RenderOptions,
): Promise<RenderResult> => {
  const { canvas, recorder, width, height } = createCanvas(1400, 560);

  const bgPaint = Skia.Paint();
  bgPaint.setColor(Skia.Color('#111429'));
  canvas.drawRect({ x: 0, y: 0, width, height }, bgPaint);

  const accentPaint = Skia.Paint();
  accentPaint.setColor(Skia.Color('#3C7FD6'));
  canvas.drawRect({ x: 0, y: 0, width: width * 0.32, height }, accentPaint);

  const dashedPaint = Skia.Paint();
  dashedPaint.setColor(Skia.Color('#F7B733'));
  dashedPaint.setPathEffect(Skia.PathEffect.MakeDash([12, 18], 0));
  canvas.drawLine(width * 0.32, 20, width * 0.32, height - 20, dashedPaint);

  const fontTitle = Skia.Font(Skia.Typeface('Roboto'), 60);
  const fontBody = Skia.Font(Skia.Typeface('Roboto'), 38);
  const fontSmall = Skia.Font(Skia.Typeface('Roboto'), 32);
  const textPaint = Skia.Paint();
  textPaint.setColor(Skia.Color('#FFFFFF'));

  canvas.drawText(reservation.title, width * 0.36, 120, textPaint, fontTitle);
  canvas.drawText(`PNR ${reservation.referenceCode}`, width * 0.36, 200, textPaint, fontBody);
  canvas.drawText(reservation.provider, width * 0.36, 260, textPaint, fontBody);
  canvas.drawText(reservation.location, width * 0.36, 320, textPaint, fontBody);
  canvas.drawText(
    `Depart ${new Date(reservation.startDate).toUTCString()}`,
    width * 0.36,
    380,
    textPaint,
    fontSmall,
  );

  if (reservation.endDate) {
    canvas.drawText(
      `Return ${new Date(reservation.endDate).toUTCString()}`,
      width * 0.36,
      430,
      textPaint,
      fontSmall,
    );
  }

  canvas.drawText(
    `Seat/Room: ${reservation.seatOrRoom ?? 'TBD'}`,
    width * 0.36,
    480,
    textPaint,
    fontSmall,
  );

  const qrPaint = Skia.Paint();
  qrPaint.setColor(Skia.Color('#FFFFFF'));
  const qrSize = 260;
  const qrX = 80;
  const qrY = 140;
  canvas.drawRect({ x: qrX, y: qrY, width: qrSize, height: qrSize }, qrPaint);
  const qrInnerPaint = Skia.Paint();
  qrInnerPaint.setColor(Skia.Color('#111429'));
  canvas.drawRect({ x: qrX + 20, y: qrY + 20, width: qrSize - 40, height: qrSize - 40 }, qrInnerPaint);

  applyWatermark(canvas, width, height, options.watermark);

  const { encryptedUri, previewDataUri } = await renderToEncryptedPng(
    recorder,
    options.outputName,
    options.keyAlias,
  );

  return {
    encryptedUri,
    previewDataUri,
    metadata: {
      type: 'reservation',
      reservationId: reservation.id,
      provider: reservation.provider,
    },
  };
};

export const renderPaymentCardTemplate = async (
  card: PaymentCard,
  options: RenderOptions,
): Promise<RenderResult> => {
  const { canvas, recorder, width, height } = createCanvas(1400, 880);

  const bgPaint = Skia.Paint();
  bgPaint.setShader(
    Skia.Shader.MakeLinearGradient(
      { x: 0, y: 0 },
      { x: width, y: height },
      [Skia.Color(card.color ?? '#3C7FD6'), Skia.Color('#0B0D17')],
      null,
      Skia.TileMode.Clamp,
    ),
  );
  canvas.drawRect({ x: 0, y: 0, width, height }, bgPaint);

  const fontBrand = Skia.Font(Skia.Typeface('Roboto'), 72);
  const fontNumber = Skia.Font(Skia.Typeface('Roboto'), 64);
  const fontMeta = Skia.Font(Skia.Typeface('Roboto'), 40);
  const textPaint = Skia.Paint();
  textPaint.setColor(Skia.Color('#FFFFFF'));

  canvas.drawText(card.brand.toUpperCase(), 120, 200, textPaint, fontBrand);
  canvas.drawText(`•••• ${card.last4}`, 120, 360, textPaint, fontNumber);
  canvas.drawText(
    `Exp ${card.expiryMonth.toString().padStart(2, '0')}/${card.expiryYear.toString().slice(-2)}`,
    120,
    440,
    textPaint,
    fontMeta,
  );
  canvas.drawText(card.holderName.toUpperCase(), 120, 520, textPaint, fontMeta);
  canvas.drawText(card.provider, 120, 600, textPaint, fontMeta);

  const nfcPaint = Skia.Paint();
  nfcPaint.setColor(Skia.Color('rgba(255,255,255,0.35)'));
  canvas.drawCircle(width - 200, 260, 40, nfcPaint);
  canvas.drawCircle(width - 130, 260, 60, nfcPaint);

  applyWatermark(canvas, width, height, options.watermark);

  const { encryptedUri, previewDataUri } = await renderToEncryptedPng(
    recorder,
    options.outputName,
    options.keyAlias,
  );

  return {
    encryptedUri,
    previewDataUri,
    metadata: {
      type: 'card',
      cardId: card.id,
      brand: card.brand,
    },
  };
};

