import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import {
  createAppointment,
  decodeAppointments,
  seedAppointments,
  STORAGE_KEY,
  validateBooking,
  validateDetails,
} from './booking';
import { validServiceIds, type Appointment, type BookingDraft } from './data';

type Store = {
  appointments: Appointment[];
  notice: string;
  add: (draft: BookingDraft, source?: Appointment['source']) => Promise<Appointment>;
  edit: (id: string, draft: BookingDraft) => Promise<Appointment>;
  setStatus: (id: string, status: 'Completed' | 'Cancelled') => Promise<void>;
  reset: () => Promise<void>;
};
const Context = createContext<Store | null>(null);

export function AppointmentProvider({ children }: { children: ReactNode }) {
  const [initial] = useState(() => {
    try {
      return { ...decodeAppointments(localStorage.getItem(STORAGE_KEY)), unavailable: false };
    } catch {
      return { appointments: seedAppointments(), recovered: false, unavailable: true };
    }
  });
  const [appointments, setAppointments] = useState(initial.appointments);
  const [notice, setNotice] = useState(
    initial.unavailable
      ? 'Browser storage is unavailable. Changes will last for this visit only.'
      : initial.recovered
        ? 'Some saved demo data could not be read. Valid records were recovered.'
        : '',
  );
  const current = useRef(appointments);
  const volatile = useRef(initial.unavailable);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(current.current));
    } catch {
      volatile.current = true;
      setNotice('Browser storage is unavailable. Changes will last for this visit only.');
    }
    const sync = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY || event.key === null) {
        const decoded = decodeAppointments(event.newValue);
        current.current = decoded.appointments;
        setAppointments(decoded.appointments);
        if (decoded.recovered)
          setNotice('Some saved demo data could not be read. Valid records were recovered.');
      }
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  async function transaction<T>(
    change: (records: Appointment[]) => { records: Appointment[]; result: T },
  ): Promise<T> {
    const run = () => {
      let latest = current.current;
      if (!volatile.current) {
        try {
          latest = decodeAppointments(localStorage.getItem(STORAGE_KEY)).appointments;
        } catch {
          volatile.current = true;
        }
      }
      const { records, result } = change(latest);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
        volatile.current = false;
      } catch {
        volatile.current = true;
        setNotice('Browser storage is unavailable. Changes will last for this visit only.');
      }
      current.current = records;
      setAppointments(records);
      return result;
    };
    return navigator.locks ? navigator.locks.request(STORAGE_KEY, run) : run();
  }

  const add: Store['add'] = (draft, source = 'Online') =>
    transaction((records) => {
      const result = createAppointment(draft, records, source);
      return { records: [...records, result], result };
    });

  const edit: Store['edit'] = (id, draft) =>
    transaction((records) => {
      const original = records.find((a) => a.id === id);
      if (!original || original.status !== 'Confirmed')
        throw new Error('This appointment is no longer editable. Refresh the list and try again.');
      if (Object.keys(validateDetails(draft)).length)
        throw new Error('Check the customer name, phone number, and notes.');
      if (!validServiceIds(draft.serviceIds))
        throw new Error('Choose at least one valid service to continue.');
      const scheduleChanged =
        draft.serviceIds.length !== original.serviceIds.length ||
        draft.serviceIds.some((id) => !original.serviceIds.includes(id)) ||
        draft.barberId !== original.barberId ||
        draft.date !== original.date ||
        draft.time !== original.time;
      const check = scheduleChanged
        ? validateBooking(draft, records, id)
        : { barberId: original.barberId };
      if (!check.barberId) throw new Error(check.error);
      const result = {
        ...original,
        ...draft,
        barberId: check.barberId,
        name: draft.name.trim(),
        phone: draft.phone.trim(),
        notes: draft.notes.trim(),
      };
      return { records: records.map((a) => (a.id === id ? result : a)), result };
    });

  const setStatus: Store['setStatus'] = (id, status) =>
    transaction((records) => {
      const original = records.find((a) => a.id === id);
      if (!original || original.status !== 'Confirmed')
        throw new Error('This appointment has already been updated.');
      return {
        records: records.map((a) => (a.id === id ? { ...a, status } : a)),
        result: undefined,
      };
    });

  return (
    <Context.Provider
      value={{
        appointments,
        notice,
        add,
        edit,
        setStatus,
        reset: () => transaction(() => ({ records: seedAppointments(), result: undefined })),
      }}
    >
      {children}
    </Context.Provider>
  );
}

export function useAppointments() {
  const store = useContext(Context);
  if (!store) throw new Error('Appointment provider is missing.');
  return store;
}
