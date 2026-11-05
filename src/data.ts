export const business = {
  name: 'Groom & Glam',
  descriptor: 'Salon & Spa',
  address: 'Main GPO Chowk, Circular Road, opposite P & T Colony, Quetta.',
  phone: '+92 312 2576653',
  phoneLink: 'tel:+923122576653',
  instagram: 'groomandglam.men',
  instagramLink: 'https://www.instagram.com/groomandglam.men/',
  mapsLink:
    'https://www.google.com/maps/search/?api=1&query=' +
    encodeURIComponent(
      'Groom & Glam Salon & Spa, Main GPO Chowk, Circular Road, opposite P & T Colony, Quetta, Pakistan',
    ),
  timezone: 'Asia/Karachi',
  openMinute: 12 * 60,
  closeMinute: 24 * 60,
  closedDays: [1],
  hours: 'Tuesday–Sunday, 12:00 PM–12:00 AM',
};

export const categories = [
  'Hair & styling',
  'Beard & shave',
  'Colour & highlights',
  'Hair treatments',
  'Groom preparation',
  'Spa & care',
] as const;
export type Category = (typeof categories)[number];
export type Service = {
  id: string;
  name: string;
  category: Category;
  duration: number;
  description: string;
};

// Services are supported by the supplied references. All durations are editable demo estimates.
export const services: Service[] = [
  {
    id: 'haircut',
    name: 'Signature haircut',
    category: 'Hair & styling',
    duration: 45,
    description: 'A fresh shape, a clean finish, and a style that feels like you.',
  },
  {
    id: 'fade',
    name: 'Fade & finish',
    category: 'Hair & styling',
    duration: 45,
    description: 'A carefully blended fade, finished with your preferred style.',
  },
  {
    id: 'styling',
    name: 'Wash & styling',
    category: 'Hair & styling',
    duration: 30,
    description: 'A fresh wash and a considered finish for the day ahead.',
  },
  {
    id: 'beard',
    name: 'Beard sculpting',
    category: 'Beard & shave',
    duration: 30,
    description: 'Shape, tidy, and define your beard with clean, balanced lines.',
  },
  {
    id: 'shave',
    name: 'Clean shave',
    category: 'Beard & shave',
    duration: 30,
    description: 'A close shave and a smooth finish, with time to sit back.',
  },
  {
    id: 'colour',
    name: 'Hair colour',
    category: 'Colour & highlights',
    duration: 90,
    description: 'Refresh your natural shade or explore a different look.',
  },
  {
    id: 'highlights',
    name: 'Highlights',
    category: 'Colour & highlights',
    duration: 120,
    description: 'Add subtle dimension or a more noticeable change of tone.',
  },
  {
    id: 'keratin',
    name: 'Keratin treatment',
    category: 'Hair treatments',
    duration: 150,
    description: 'A smoothing treatment for a softer, more manageable finish.',
  },
  {
    id: 'mask',
    name: 'Hair mask & care',
    category: 'Hair treatments',
    duration: 45,
    description: 'A little extra attention with a protein or repair hair mask.',
  },
  {
    id: 'groom',
    name: 'Groom preparation',
    category: 'Groom preparation',
    duration: 120,
    description: 'Make time for your haircut, beard, and finishing touches before the occasion.',
  },
  {
    id: 'facial',
    name: 'Facial care',
    category: 'Spa & care',
    duration: 60,
    description: 'A dedicated moment for a facial and a fresh start.',
  },
  {
    id: 'hands',
    name: 'Manicure & pedicure',
    category: 'Spa & care',
    duration: 60,
    description: 'Simple, attentive care for hands and feet.',
  },
];

export type Barber = {
  id: string;
  name: string;
  initials: string;
  focus: string;
  description: string;
  start: number;
  end: number;
  days: number[];
};
// Neutral sample identities and schedules, not actual employees or verified staffing.
export const barbers: Barber[] = [
  {
    id: 'barber-a',
    name: 'Barber A',
    initials: 'A',
    focus: 'Hair & styling',
    description: 'Explore a haircut, fade, or a fresh new style.',
    start: 720,
    end: 1440,
    days: [0, 2, 3, 4, 5, 6],
  },
  {
    id: 'barber-b',
    name: 'Barber B',
    initials: 'B',
    focus: 'Beard & grooming',
    description: 'Choose a beard tidy, a clean shave, or a complete refresh.',
    start: 780,
    end: 1380,
    days: [0, 2, 3, 4, 5, 6],
  },
  {
    id: 'barber-c',
    name: 'Barber C',
    initials: 'C',
    focus: 'Colour & care',
    description: 'Set aside time for colour, smoothing, and hair care.',
    start: 720,
    end: 1320,
    days: [0, 2, 3, 4, 5, 6],
  },
];

export type Status = 'Confirmed' | 'Completed' | 'Cancelled';
export type Appointment = {
  id: string;
  reference: string;
  serviceIds: string[];
  barberId: string;
  date: string;
  time: number;
  name: string;
  phone: string;
  notes: string;
  status: Status;
  source: 'Online' | 'Walk-in' | 'Sample';
  createdAt: string;
};

export type BookingDraft = Pick<
  Appointment,
  'serviceIds' | 'barberId' | 'date' | 'time' | 'name' | 'phone' | 'notes'
>;
export const getService = (id: string) => services.find((s) => s.id === id);
export const selectedServices = (ids: readonly string[]) =>
  ids.map(getService).filter((service): service is Service => !!service);
export const totalDuration = (ids: readonly string[]) =>
  selectedServices(ids).reduce((total, service) => total + service.duration, 0);
export const serviceNames = (ids: readonly string[]) =>
  selectedServices(ids)
    .map((service) => service.name)
    .join(' + ');
export function validServiceIds(ids: unknown): ids is string[] {
  return (
    Array.isArray(ids) &&
    ids.length > 0 &&
    new Set(ids).size === ids.length &&
    ids.every((id) => typeof id === 'string' && !!getService(id))
  );
}
export const getBarber = (id: string) => barbers.find((b) => b.id === id);
