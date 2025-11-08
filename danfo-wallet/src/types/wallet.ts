export type DocumentCategory =
  | 'passport'
  | 'visa'
  | 'boarding_pass'
  | 'id_card'
  | 'vaccination'
  | 'other';

export interface WalletDocument {
  id: string;
  type: DocumentCategory;
  title: string;
  issuedBy: string;
  identifier: string;
  issuedAt: string;
  expiresAt?: string;
  traveler: string;
  notes?: string;
  tags?: string[];
  storageUri?: string;
}

export type ReservationCategory = 'flight' | 'hotel' | 'train' | 'car_rental' | 'event' | 'other';

export interface TravelReservation {
  id: string;
  type: ReservationCategory;
  title: string;
  referenceCode: string;
  provider: string;
  startDate: string;
  endDate?: string;
  location: string;
  travelers: string[];
  seatOrRoom?: string;
  notes?: string;
  documents?: string[];
}

export type CardCategory = 'debit' | 'credit' | 'virtual' | 'loyalty';

export interface PaymentCard {
  id: string;
  brand: string;
  cardType: CardCategory;
  holderName: string;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  currency: string;
  provider: string;
  color?: string;
  addedAt: string;
  notes?: string;
}

export type ReminderPriority = 'low' | 'medium' | 'high';
export type ReminderStatus = 'pending' | 'completed' | 'snoozed';

export interface Reminder {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  createdAt: string;
  priority: ReminderPriority;
  status: ReminderStatus;
  relatedEntity?: {
    type: 'document' | 'reservation' | 'card';
    id: string;
  };
  notificationId?: string;
}

export type TimelineCategory =
  | 'document-expiry'
  | 'trip-start'
  | 'trip-end'
  | 'reservation'
  | 'card-expiry'
  | 'reminder';

export interface TimelineEvent {
  id: string;
  title: string;
  subtitle?: string;
  date: string;
  category: TimelineCategory;
  relatedId?: string;
}

export interface WalletState {
  documents: WalletDocument[];
  reservations: TravelReservation[];
  cards: PaymentCard[];
  reminders: Reminder[];
  timeline: TimelineEvent[];
}

export type WalletAction =
  | { type: 'ADD_DOCUMENT'; payload: WalletDocument }
  | { type: 'UPDATE_DOCUMENT'; payload: WalletDocument }
  | { type: 'REMOVE_DOCUMENT'; payload: string }
  | { type: 'ADD_RESERVATION'; payload: TravelReservation }
  | { type: 'UPDATE_RESERVATION'; payload: TravelReservation }
  | { type: 'REMOVE_RESERVATION'; payload: string }
  | { type: 'ADD_CARD'; payload: PaymentCard }
  | { type: 'UPDATE_CARD'; payload: PaymentCard }
  | { type: 'REMOVE_CARD'; payload: string }
  | { type: 'ADD_REMINDER'; payload: Reminder }
  | { type: 'UPDATE_REMINDER'; payload: Reminder }
  | { type: 'REMOVE_REMINDER'; payload: string }
  | { type: 'SYNC_TIMELINE' };
