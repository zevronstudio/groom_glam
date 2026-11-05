import {
  barbers,
  business,
  getBarber,
  totalDuration,
  validServiceIds,
  type Appointment,
  type BookingDraft,
} from './data';

export const STORAGE_KEY = 'groom-glam-appointments-v1';
export const now = () => new Date();
export function today(at = now()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: business.timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(at);
}
export function minutesNow(at = now()): number {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: business.timezone,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(at);
  return (
    Number(parts.find((p) => p.type === 'hour')?.value) * 60 +
    Number(parts.find((p) => p.type === 'minute')?.value)
  );
}
export function validDate(date: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const parsed = new Date(date + 'T12:00:00Z');
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === date;
}
export const weekday = (date: string) => new Date(date + 'T12:00:00Z').getUTCDay();
export const isClosed = (date: string) => business.closedDays.includes(weekday(date));
export function addDays(date: string, days: number): string {
  const result = new Date(date + 'T12:00:00Z');
  result.setUTCDate(result.getUTCDate() + days);
  return result.toISOString().slice(0, 10);
}
export const nextOpen = (date: string): string => (isClosed(date) ? addDays(date, 1) : date);
export function dateLabel(date: string, short = false): string {
  if (!validDate(date)) return 'Choose a date';
  return new Intl.DateTimeFormat('en-GB', {
    weekday: short ? 'short' : 'long',
    day: 'numeric',
    month: short ? 'short' : 'long',
    year: short ? undefined : 'numeric',
    timeZone: 'UTC',
  }).format(new Date(date + 'T12:00:00Z'));
}
export function timeLabel(minute: number): string {
  const hour = Math.floor(minute / 60) % 24;
  return `${hour % 12 || 12}:${String(minute % 60).padStart(2, '0')} ${hour >= 12 ? 'PM' : 'AM'}`;
}
export function validPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s()\-]/g, '');
  return (
    /^(?:\+92|0092|92|0)3\d{9}$/.test(cleaned) ||
    /^(?:\+92|0092|92|0)(?:21|42|51|61|81)\d{7,8}$/.test(cleaned)
  );
}

export function availableBarbers(
  date: string,
  time: number,
  selection: string | readonly string[],
  appointments: Appointment[],
  ignoreId?: string,
  at = now(),
): string[] {
  const serviceIds = typeof selection === 'string' ? [selection] : selection;
  const duration = validServiceIds(serviceIds) ? totalDuration(serviceIds) : 0;
  if (
    !duration ||
    !validDate(date) ||
    date < today(at) ||
    isClosed(date) ||
    !Number.isInteger(time) ||
    time % 15 !== 0
  )
    return [];
  if (date === today(at) && time <= minutesNow(at)) return [];
  if (time < business.openMinute || time + duration > business.closeMinute) return [];
  return barbers
    .filter((barber) => {
      if (
        !barber.days.includes(weekday(date)) ||
        time < barber.start ||
        time + duration > barber.end
      )
        return false;
      return !appointments.some(
        (a) =>
          a.id !== ignoreId &&
          a.status !== 'Cancelled' &&
          a.date === date &&
          a.barberId === barber.id &&
          time < a.time + totalDuration(a.serviceIds) &&
          time + duration > a.time,
      );
    })
    .map((b) => b.id);
}

export function slots(
  date: string,
  selection: string | readonly string[],
  barberId: string,
  appointments: Appointment[],
  ignoreId?: string,
  at = now(),
) {
  const result = [];
  for (let time = business.openMinute; time < business.closeMinute; time += 15) {
    const free = availableBarbers(date, time, selection, appointments, ignoreId, at);
    result.push({
      time,
      available: barberId === 'any' ? free.length > 0 : free.includes(barberId),
    });
  }
  return result;
}

export function validateDetails(draft: BookingDraft): Record<string, string> {
  const errors: Record<string, string> = {};
  if (draft.name.trim().length < 2 || draft.name.trim().length > 80)
    errors.name = 'Enter your name (2–80 characters).';
  if (!validPhone(draft.phone))
    errors.phone = 'Enter a valid Pakistani phone number, such as 03XX XXXXXXX.';
  if (draft.notes.length > 500) errors.notes = 'Keep notes within 500 characters.';
  return errors;
}

export function validateBooking(
  draft: BookingDraft,
  appointments: Appointment[],
  ignoreId?: string,
  at = now(),
): { error?: string; barberId?: string } {
  if (!validServiceIds(draft.serviceIds))
    return { error: 'Choose at least one valid service to continue.' };
  if (draft.barberId !== 'any' && !getBarber(draft.barberId))
    return { error: 'Choose a barber to continue.' };
  if (Object.keys(validateDetails(draft)).length)
    return { error: 'Check the customer name, phone number, and notes.' };
  const free = availableBarbers(
    draft.date,
    draft.time,
    draft.serviceIds,
    appointments,
    ignoreId,
    at,
  );
  const barberId = draft.barberId === 'any' ? free[0] : free.find((id) => id === draft.barberId);
  return barberId
    ? { barberId }
    : { error: 'This time is no longer available. Please choose another time.' };
}

export function createAppointment(
  draft: BookingDraft,
  appointments: Appointment[],
  source: Appointment['source'] = 'Online',
  at = now(),
): Appointment {
  const result = validateBooking(draft, appointments, undefined, at);
  if (!result.barberId) throw new Error(result.error);
  const id = crypto.randomUUID();
  return {
    ...draft,
    name: draft.name.trim(),
    phone: draft.phone.trim(),
    notes: draft.notes.trim(),
    barberId: result.barberId,
    id,
    reference: 'GG-' + id.slice(0, 8).toUpperCase(),
    status: 'Confirmed',
    source,
    createdAt: at.toISOString(),
  };
}

export function seedAppointments(at = now()): Appointment[] {
  const first = nextOpen(today(at));
  const next = nextOpen(addDays(first, 1));
  const make = (
    index: number,
    date: string,
    time: number,
    serviceId: string,
    barberId: string,
    status: Appointment['status'] = 'Confirmed',
  ): Appointment => ({
    id: `sample-${index}`,
    reference: `GG-DEMO${index}`,
    date,
    time,
    serviceIds: [serviceId],
    barberId,
    name: `Sample Guest ${String(index).padStart(2, '0')}`,
    phone: '0300 0000000',
    notes: 'Fictional sample appointment for the demo.',
    status,
    source: 'Sample',
    createdAt: at.toISOString(),
  });
  return [
    make(1, first, 780, 'haircut', 'barber-a'),
    make(2, first, 900, 'beard', 'barber-b'),
    make(3, first, 1020, 'keratin', 'barber-c'),
    make(4, first, 1140, 'fade', 'barber-a'),
    make(5, next, 840, 'groom', 'barber-a'),
    make(6, next, 960, 'facial', 'barber-c'),
    make(7, next, 1080, 'shave', 'barber-b', 'Cancelled'),
  ];
}

export function isAppointment(value: unknown): value is Appointment {
  if (!value || typeof value !== 'object') return false;
  const a = value as Appointment;
  const validServices = validServiceIds(a.serviceIds);
  const duration = validServices ? totalDuration(a.serviceIds) : 0;
  const barber = getBarber(a.barberId);
  return (
    typeof a.id === 'string' &&
    a.id.length > 0 &&
    typeof a.reference === 'string' &&
    validServices &&
    !!barber &&
    validDate(a.date) &&
    !isClosed(a.date) &&
    barber.days.includes(weekday(a.date)) &&
    Number.isInteger(a.time) &&
    a.time % 15 === 0 &&
    a.time >= Math.max(barber.start, business.openMinute) &&
    a.time + duration <= Math.min(barber.end, business.closeMinute) &&
    typeof a.name === 'string' &&
    a.name.trim().length >= 2 &&
    a.name.length <= 80 &&
    typeof a.phone === 'string' &&
    validPhone(a.phone) &&
    typeof a.notes === 'string' &&
    a.notes.length <= 500 &&
    ['Confirmed', 'Completed', 'Cancelled'].includes(a.status) &&
    ['Online', 'Walk-in', 'Sample'].includes(a.source) &&
    typeof a.createdAt === 'string' &&
    !Number.isNaN(Date.parse(a.createdAt))
  );
}

export function decodeAppointments(
  raw: string | null,
  at = now(),
): { appointments: Appointment[]; recovered: boolean } {
  if (raw === null) return { appointments: seedAppointments(at), recovered: false };
  try {
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data)) throw new Error('Invalid saved data');
    const clean: Appointment[] = [];
    for (const saved of data) {
      // Upgrade previously saved single-service bookings without resetting records.
      let item = saved;
      if (
        saved &&
        typeof saved === 'object' &&
        !Object.hasOwn(saved, 'serviceIds') &&
        typeof saved.serviceId === 'string'
      ) {
        const { serviceId, ...rest } = saved;
        item = { ...rest, serviceIds: [serviceId] };
      }
      if (!isAppointment(item) || clean.some((a) => a.id === item.id)) continue;
      const duration = totalDuration(item.serviceIds);
      if (
        item.status !== 'Cancelled' &&
        clean.some(
          (a) =>
            a.status !== 'Cancelled' &&
            a.date === item.date &&
            a.barberId === item.barberId &&
            item.time < a.time + totalDuration(a.serviceIds) &&
            item.time + duration > a.time,
        )
      )
        continue;
      clean.push(item);
    }
    return {
      appointments: data.length && !clean.length ? seedAppointments(at) : clean,
      recovered: clean.length !== data.length,
    };
  } catch {
    return { appointments: seedAppointments(at), recovered: true };
  }
}
