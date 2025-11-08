import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import {
  PaymentCard,
  Reminder,
  TimelineEvent,
  TravelReservation,
  WalletAction,
  WalletDocument,
  WalletState,
} from '../types/wallet';
import { initialWalletState } from '../data/sampleData';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const WalletContext = createContext<WalletContextValue | undefined>(undefined);

const walletReducer = (state: WalletState, action: WalletAction): WalletState => {
  switch (action.type) {
    case 'ADD_DOCUMENT':
      return { ...state, documents: [action.payload, ...state.documents] };
    case 'UPDATE_DOCUMENT':
      return {
        ...state,
        documents: state.documents.map((doc) =>
          doc.id === action.payload.id ? action.payload : doc,
        ),
      };
    case 'REMOVE_DOCUMENT':
      return {
        ...state,
        documents: state.documents.filter((doc) => doc.id !== action.payload),
      };
    case 'ADD_RESERVATION':
      return { ...state, reservations: [action.payload, ...state.reservations] };
    case 'UPDATE_RESERVATION':
      return {
        ...state,
        reservations: state.reservations.map((reservation) =>
          reservation.id === action.payload.id ? action.payload : reservation,
        ),
      };
    case 'REMOVE_RESERVATION':
      return {
        ...state,
        reservations: state.reservations.filter((reservation) => reservation.id !== action.payload),
      };
    case 'ADD_CARD':
      return { ...state, cards: [action.payload, ...state.cards] };
    case 'UPDATE_CARD':
      return {
        ...state,
        cards: state.cards.map((card) => (card.id === action.payload.id ? action.payload : card)),
      };
    case 'REMOVE_CARD':
      return {
        ...state,
        cards: state.cards.filter((card) => card.id !== action.payload),
      };
    case 'ADD_REMINDER':
      return { ...state, reminders: [action.payload, ...state.reminders] };
    case 'UPDATE_REMINDER':
      return {
        ...state,
        reminders: state.reminders.map((reminder) =>
          reminder.id === action.payload.id ? action.payload : reminder,
        ),
      };
    case 'REMOVE_REMINDER':
      return {
        ...state,
        reminders: state.reminders.filter((reminder) => reminder.id !== action.payload),
      };
    case 'SYNC_TIMELINE':
      return { ...state, timeline: buildTimeline(state) };
    default:
      return state;
  }
};

const buildTimeline = (state: WalletState): TimelineEvent[] => {
  const events: TimelineEvent[] = [];
  const now = new Date();

  state.documents.forEach((doc) => {
    if (doc.expiresAt) {
      events.push({
        id: `timeline-doc-${doc.id}`,
        title: `${doc.title} expiry`,
        subtitle: doc.traveler,
        date: doc.expiresAt,
        category: 'document-expiry',
        relatedId: doc.id,
      });
    }
  });

  state.cards.forEach((card) => {
    const expiryDate = new Date(card.expiryYear, card.expiryMonth - 1, 1).toISOString();
    if (expiryDate > now.toISOString()) {
      events.push({
        id: `timeline-card-${card.id}`,
        title: `${card.brand} ••••${card.last4}`,
        subtitle: 'Card expiry',
        date: expiryDate,
        category: 'card-expiry',
        relatedId: card.id,
      });
    }
  });

  state.reservations.forEach((reservation) => {
    events.push({
      id: `timeline-res-start-${reservation.id}`,
      title: reservation.title,
      subtitle: `${reservation.location}`,
      date: reservation.startDate,
      category: 'trip-start',
      relatedId: reservation.id,
    });

    if (reservation.endDate) {
      events.push({
        id: `timeline-res-end-${reservation.id}`,
        title: `${reservation.title} return`,
        subtitle: `${reservation.location}`,
        date: reservation.endDate,
        category: 'trip-end',
        relatedId: reservation.id,
      });
    }
  });

  state.reminders.forEach((reminder) => {
    events.push({
      id: `timeline-rem-${reminder.id}`,
      title: reminder.title,
      subtitle: reminder.description,
      date: reminder.dueDate,
      category: 'reminder',
      relatedId: reminder.relatedEntity?.id,
    });
  });

  return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

const requestNotificationPermissions = async () => {
  if (!Platform.OS) return;
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    await Notifications.requestPermissionsAsync();
  }
};

interface WalletContextValue {
  state: WalletState;
  addDocument: (document: WalletDocument) => void;
  updateDocument: (document: WalletDocument) => void;
  removeDocument: (id: string) => void;
  addReservation: (reservation: TravelReservation) => void;
  updateReservation: (reservation: TravelReservation) => void;
  removeReservation: (id: string) => void;
  addCard: (card: PaymentCard) => void;
  updateCard: (card: PaymentCard) => void;
  removeCard: (id: string) => void;
  addReminder: (reminder: Reminder) => Promise<void>;
  updateReminder: (reminder: Reminder) => void;
  removeReminder: (id: string) => void;
  syncTimeline: () => void;
}

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(walletReducer, initialWalletState, (initialState) => ({
    ...initialState,
    timeline: buildTimeline(initialState),
  }));

  useEffect(() => {
    requestNotificationPermissions().catch(() => {
      // permissions optional for initial setup
    });
  }, []);

  useEffect(() => {
    dispatch({ type: 'SYNC_TIMELINE' });
  }, [state.documents, state.reservations, state.cards, state.reminders]);

  const addDocument = useCallback((document: WalletDocument) => {
    dispatch({ type: 'ADD_DOCUMENT', payload: document });
  }, []);

  const updateDocument = useCallback((document: WalletDocument) => {
    dispatch({ type: 'UPDATE_DOCUMENT', payload: document });
  }, []);

  const removeDocument = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_DOCUMENT', payload: id });
  }, []);

  const addReservation = useCallback((reservation: TravelReservation) => {
    dispatch({ type: 'ADD_RESERVATION', payload: reservation });
  }, []);

  const updateReservation = useCallback((reservation: TravelReservation) => {
    dispatch({ type: 'UPDATE_RESERVATION', payload: reservation });
  }, []);

  const removeReservation = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_RESERVATION', payload: id });
  }, []);

  const addCard = useCallback((card: PaymentCard) => {
    dispatch({ type: 'ADD_CARD', payload: card });
  }, []);

  const updateCard = useCallback((card: PaymentCard) => {
    dispatch({ type: 'UPDATE_CARD', payload: card });
  }, []);

  const removeCard = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_CARD', payload: id });
  }, []);

  const addReminder = useCallback(async (reminder: Reminder) => {
    dispatch({ type: 'ADD_REMINDER', payload: reminder });

    if (Platform.OS !== 'web') {
      const schedulingOptions = {
        content: {
          title: reminder.title,
          body: reminder.description,
          data: reminder.relatedEntity,
        },
        trigger: new Date(reminder.dueDate),
      } as Notifications.NotificationRequestInput;

      try {
        const notificationId = await Notifications.scheduleNotificationAsync(schedulingOptions);
        dispatch({
          type: 'UPDATE_REMINDER',
          payload: { ...reminder, notificationId },
        });
      } catch (error) {
        // Notification scheduling is best-effort during setup.
      }
    }
  }, []);

  const updateReminder = useCallback((reminder: Reminder) => {
    dispatch({ type: 'UPDATE_REMINDER', payload: reminder });
  }, []);

  const removeReminder = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_REMINDER', payload: id });
  }, []);

  const syncTimeline = useCallback(() => {
    dispatch({ type: 'SYNC_TIMELINE' });
  }, []);

  const value = useMemo<WalletContextValue>(
    () => ({
      state,
      addDocument,
      updateDocument,
      removeDocument,
      addReservation,
      updateReservation,
      removeReservation,
      addCard,
      updateCard,
      removeCard,
      addReminder,
      updateReminder,
      removeReminder,
      syncTimeline,
    }),
    [
      state,
      addDocument,
      updateDocument,
      removeDocument,
      addReservation,
      updateReservation,
      removeReservation,
      addCard,
      updateCard,
      removeCard,
      addReminder,
      updateReminder,
      removeReminder,
      syncTimeline,
    ],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};

interface WalletContextValue {
  state: WalletState;
  addDocument: (document: WalletDocument) => void;
  updateDocument: (document: WalletDocument) => void;
  removeDocument: (id: string) => void;
  addReservation: (reservation: TravelReservation) => void;
  updateReservation: (reservation: TravelReservation) => void;
  removeReservation: (id: string) => void;
  addCard: (card: PaymentCard) => void;
  updateCard: (card: PaymentCard) => void;
  removeCard: (id: string) => void;
  addReminder: (reminder: Reminder) => Promise<void>;
  updateReminder: (reminder: Reminder) => void;
  removeReminder: (id: string) => void;
  syncTimeline: () => void;
}

export default WalletContext;
