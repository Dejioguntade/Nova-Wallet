import { formatISO, addDays } from 'date-fns';
import {
  PaymentCard,
  Reminder,
  TimelineEvent,
  TravelReservation,
  WalletDocument,
  WalletState,
} from '../types/wallet';

const now = new Date();

const documents: WalletDocument[] = [
  {
    id: 'doc-passport-1',
    type: 'passport',
    title: 'Nigerian Passport',
    issuedBy: 'Nigeria Immigration Service',
    identifier: 'A12345678',
    issuedAt: formatISO(addDays(now, -365 * 4)),
    expiresAt: formatISO(addDays(now, 180)),
    traveler: 'Oluwaseun Danfo',
    notes: 'ECOWAS compliant biometric passport.',
    tags: ['primary', 'international'],
  },
  {
    id: 'doc-boarding-1',
    type: 'boarding_pass',
    title: 'Flight BP - LOS to LHR',
    issuedBy: 'Danfo Air',
    identifier: 'BP-LOS-LHR-2402',
    issuedAt: formatISO(addDays(now, -2)),
    traveler: 'Oluwaseun Danfo',
    notes: 'Seat 12A, Group 3 boarding.',
    tags: ['upcoming-trip'],
  },
];

const reservations: TravelReservation[] = [
  {
    id: 'res-flight-1',
    type: 'flight',
    title: 'Danfo Air LOS → LHR',
    referenceCode: 'DNF123',
    provider: 'Danfo Air',
    startDate: formatISO(addDays(now, 3)),
    endDate: formatISO(addDays(now, 3)),
    location: 'Lagos → London',
    travelers: ['Oluwaseun Danfo'],
    seatOrRoom: '12A',
    notes: 'Arrive 3 hours before departure.',
    documents: ['doc-boarding-1'],
  },
  {
    id: 'res-hotel-1',
    type: 'hotel',
    title: 'Shoreditch Stay',
    referenceCode: 'HOTEL567',
    provider: 'Danfo Hotels',
    startDate: formatISO(addDays(now, 3)),
    endDate: formatISO(addDays(now, 6)),
    location: 'Shoreditch, London',
    travelers: ['Oluwaseun Danfo'],
    notes: 'Check-in 3 PM, includes breakfast.',
  },
];

const cards: PaymentCard[] = [
  {
    id: 'card-debit-1',
    brand: 'Visa',
    cardType: 'debit',
    holderName: 'Oluwaseun Danfo',
    last4: '7421',
    expiryMonth: 8,
    expiryYear: 2027,
    currency: 'NGN',
    provider: 'Danfo Bank',
    color: '#3C7FD6',
    addedAt: formatISO(addDays(now, -120)),
  },
  {
    id: 'card-virtual-1',
    brand: 'Mastercard',
    cardType: 'virtual',
    holderName: 'Oluwaseun Danfo',
    last4: '9984',
    expiryMonth: 1,
    expiryYear: 2026,
    currency: 'USD',
    provider: 'Danfo FX',
    color: '#F7B733',
    addedAt: formatISO(addDays(now, -45)),
    notes: 'Use for international subscriptions.',
  },
];

const reminders: Reminder[] = [
  {
    id: 'rem-passport-expiry',
    title: 'Passport renewal window',
    description: 'Start renewal process to avoid travel disruptions.',
    dueDate: formatISO(addDays(now, 120)),
    createdAt: formatISO(now),
    priority: 'high',
    status: 'pending',
    relatedEntity: { type: 'document', id: 'doc-passport-1' },
  },
  {
    id: 'rem-flight-checkin',
    title: 'Flight online check-in',
    description: 'Online check-in opens 48 hours before departure.',
    dueDate: formatISO(addDays(now, 1)),
    createdAt: formatISO(now),
    priority: 'medium',
    status: 'pending',
    relatedEntity: { type: 'reservation', id: 'res-flight-1' },
  },
];

const timeline: TimelineEvent[] = [
  {
    id: 'timeline-flight',
    title: 'Danfo Air LOS → LHR',
    subtitle: 'Departure in 3 days',
    date: formatISO(addDays(now, 3)),
    category: 'trip-start',
    relatedId: 'res-flight-1',
  },
  {
    id: 'timeline-passport-expiry',
    title: 'Passport renewal',
    subtitle: '120 days remaining',
    date: formatISO(addDays(now, 120)),
    category: 'document-expiry',
    relatedId: 'doc-passport-1',
  },
];

export const initialWalletState: WalletState = {
  documents,
  reservations,
  cards,
  reminders,
  timeline,
};
