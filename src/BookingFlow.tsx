import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Scissors,
  UserRound,
} from 'lucide-react';
import {
  barbers,
  business,
  getBarber,
  getService,
  selectedServices,
  totalDuration,
  type Appointment,
  type BookingDraft,
} from './data';
import {
  addDays,
  availableBarbers,
  dateLabel,
  isClosed,
  nextOpen,
  slots,
  timeLabel,
  today,
  validDate,
  validateDetails,
  weekday,
} from './booking';
import { useAppointments } from './store';
import { ServicePicker } from './ServicePicker';
import { AppointmentSummary, Confirmation, Eyebrow } from './components';

export function Calendar({ date, onChange }: { date: string; onChange: (date: string) => void }) {
  const currentDay = today();
  const [month, setMonth] = useState((validDate(date) ? date : currentDay).slice(0, 7));
  const first = month + '-01';
  const end = new Date(first + 'T12:00:00Z');
  end.setUTCMonth(end.getUTCMonth() + 1, 0);
  const total = end.getUTCDate();
  const blanks = (weekday(first) + 6) % 7;
  const changeMonth = (direction: number) => {
    const d = new Date(first + 'T12:00:00Z');
    d.setUTCMonth(d.getUTCMonth() + direction);
    setMonth(d.toISOString().slice(0, 7));
  };
  const monthLabel = new Intl.DateTimeFormat('en-GB', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(first + 'T12:00:00Z'));
  return (
    <div className="calendar">
      <div className="calendar-heading">
        <h3 aria-live="polite">{monthLabel}</h3>
        <div>
          <button
            type="button"
            className="icon-button"
            aria-label="Previous month"
            disabled={month <= currentDay.slice(0, 7)}
            onClick={() => changeMonth(-1)}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            className="icon-button"
            aria-label="Next month"
            onClick={() => changeMonth(1)}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      <div className="calendar-grid">
        <div className="calendar-weekdays">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
            <span key={i} aria-hidden="true">
              {day}
            </span>
          ))}
        </div>
        <div className="calendar-days">
          {Array.from({ length: blanks }, (_, i) => (
            <span key={'blank' + i} />
          ))}
          {Array.from({ length: total }, (_, i) => {
            const value = `${month}-${String(i + 1).padStart(2, '0')}`;
            const closed = isClosed(value);
            return (
              <button
                type="button"
                key={value}
                aria-label={dateLabel(value) + (closed ? ', salon closed' : '')}
                aria-pressed={date === value}
                disabled={value < currentDay || closed}
                className={`${value === date ? 'selected' : ''} ${value === currentDay ? 'is-today' : ''}`}
                onClick={() => onChange(value)}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </div>
      <p className="calendar-note">
        <span /> Monday closed <span className="calendar-today-key" /> Today
      </p>
    </div>
  );
}

export function DateTimePicker({
  draft,
  onChange,
  ignoreId,
}: {
  draft: BookingDraft;
  onChange: (value: Partial<BookingDraft>) => void;
  ignoreId?: string;
}) {
  const { appointments } = useAppointments();
  const available = slots(
    draft.date,
    draft.serviceIds,
    draft.barberId,
    appointments,
    ignoreId,
  ).filter((slot) => slot.available);
  const duration = totalDuration(draft.serviceIds);
  const groups = [
    { label: 'Afternoon', start: 720, end: 1020 },
    { label: 'Evening', start: 1020, end: 1260 },
    { label: 'Late evening', start: 1260, end: 1440 },
  ]
    .map((group) => ({
      ...group,
      slots: available.filter((slot) => slot.time >= group.start && slot.time < group.end),
    }))
    .filter((group) => group.slots.length > 0);
  return (
    <div className="date-time-picker">
      <Calendar date={draft.date} onChange={(date) => onChange({ date, time: -1 })} />
      <div className="time-picker">
        <div className="time-heading">
          <h3>{dateLabel(draft.date, true)}</h3>
          <span>
            <Clock3 size={13} /> Pakistan time
          </span>
        </div>
        <p className="availability-note">
          {draft.barberId === 'any'
            ? `Only times with a barber free for your full ${duration}-minute visit are shown.`
            : `Only times when ${getBarber(draft.barberId)?.name} is free for your full ${duration}-minute visit are shown.`}
        </p>
        {!available.length && (
          <div className="empty-inline" role="status">
            {isClosed(draft.date)
              ? 'The salon is closed on Mondays.'
              : 'No times available for this selection.'}{' '}
            Please choose another date or barber.
          </div>
        )}
        {groups.map((group) => (
          <div className="time-group" key={group.label}>
            <span>{group.label}</span>
            <div className="time-grid">
              {group.slots.map((slot) => (
                <button
                  type="button"
                  className={draft.time === slot.time ? 'selected' : ''}
                  key={slot.time}
                  aria-pressed={draft.time === slot.time}
                  aria-label={timeLabel(slot.time)}
                  onClick={() => onChange({ time: slot.time })}
                >
                  {timeLabel(slot.time)}
                </button>
              ))}
            </div>
          </div>
        ))}
        {available.some((slot) => slot.time === draft.time) && (
          <p className="selected-time-summary" role="status">
            Your visit:{' '}
            <strong>
              {timeLabel(draft.time)}–{timeLabel(draft.time + duration)}
            </strong>
            <span>{duration} minutes total · Pakistan time</span>
          </p>
        )}
      </div>
    </div>
  );
}

export function CustomerFields({
  draft,
  onChange,
  errors = {},
}: {
  draft: BookingDraft;
  onChange: (value: Partial<BookingDraft>) => void;
  errors?: Record<string, string>;
}) {
  return (
    <div className="customer-fields">
      <div className="field">
        <label htmlFor="customer-name">
          Your name <span aria-hidden="true">*</span>
        </label>
        <input
          id="customer-name"
          name="name"
          autoComplete="name"
          required
          minLength={2}
          maxLength={80}
          value={draft.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="First and last name"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'name-error' : undefined}
        />
        {errors.name && (
          <span className="field-error" id="name-error">
            {errors.name}
          </span>
        )}
      </div>
      <div className="field">
        <label htmlFor="customer-phone">
          Phone number <span aria-hidden="true">*</span>
        </label>
        <input
          id="customer-phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          required
          maxLength={24}
          value={draft.phone}
          onChange={(e) => onChange({ phone: e.target.value })}
          placeholder="03XX XXXXXXX"
          aria-invalid={!!errors.phone}
          aria-describedby={errors.phone ? 'phone-error' : 'phone-hint'}
        />
        {errors.phone ? (
          <span className="field-error" id="phone-error">
            {errors.phone}
          </span>
        ) : (
          <span className="field-hint" id="phone-hint">
            Pakistani mobile or landline. +92 formats also work.
          </span>
        )}
      </div>
      <div className="field">
        <label htmlFor="customer-notes">
          Anything we should know? <span className="optional">Optional</span>
        </label>
        <textarea
          id="customer-notes"
          name="notes"
          rows={3}
          maxLength={500}
          value={draft.notes}
          onChange={(e) => onChange({ notes: e.target.value })}
          placeholder="A style in mind, or a note for your visit…"
          aria-invalid={!!errors.notes}
          aria-describedby={errors.notes ? 'notes-error' : undefined}
        />
        {errors.notes && (
          <span className="field-error" id="notes-error">
            {errors.notes}
          </span>
        )}
        <span className="field-hint align-right">{draft.notes.length}/500</span>
      </div>
    </div>
  );
}

export const blankDraft = (): BookingDraft => ({
  serviceIds: [],
  barberId: 'any',
  date: nextOpen(today()),
  time: -1,
  name: '',
  phone: '',
  notes: '',
});

export default function BookingFlow() {
  const [params] = useSearchParams();
  const [draft, setDraft] = useState<BookingDraft>(() => ({
    ...blankDraft(),
    serviceIds: getService(params.get('service') ?? '') ? [params.get('service')!] : [],
    barberId: getBarber(params.get('barber') ?? '')?.id ?? 'any',
  }));
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);
  const [confirmed, setConfirmed] = useState<Appointment | null>(null);
  const { appointments, add } = useAppointments();
  const heading = useRef<HTMLHeadingElement>(null);
  const previousStep = useRef(step);
  const steps = ['Services', 'Barber', 'Date & time', 'Your details', 'Review'];
  const title = [
    'What brings you in?',
    'Who’s your pick?',
    'Make time for yourself.',
    'A little about you.',
    'Looking good. All correct?',
  ];
  const text = [
    'Choose one or more services. We?ll book them together with your selected barber.',
    'Pick your preferred barber, or keep your options open.',
    'Choose a date and an available start time.',
    'Add your details so everything is ready for your visit.',
    'Take a moment to check your appointment details.',
  ];
  const chosenServices = selectedServices(draft.serviceIds);
  const duration = totalDuration(draft.serviceIds);
  const preferred = getBarber(draft.barberId);
  const assignment =
    draft.barberId === 'any'
      ? availableBarbers(draft.date, draft.time, draft.serviceIds, appointments)[0]
      : draft.barberId;
  useEffect(() => {
    if (previousStep.current !== step) {
      heading.current?.focus({ preventScroll: true });
      heading.current?.scrollIntoView({ block: 'start', behavior: 'instant' });
      previousStep.current = step;
    }
  }, [step]);
  const update = (value: Partial<BookingDraft>) => {
    setDraft((previous) => ({ ...previous, ...value }));
    setError('');
    setFieldErrors({});
  };
  const advance = () => {
    if (step === 0 && !chosenServices.length) {
      setError('Please choose at least one service to continue.');
      return;
    }
    if (step === 2) {
      const free = availableBarbers(draft.date, draft.time, draft.serviceIds, appointments);
      if (!free.length || (draft.barberId !== 'any' && !free.includes(draft.barberId))) {
        setError('Please select an available date and time.');
        return;
      }
    }
    if (step === 3) {
      const errors = validateDetails(draft);
      setFieldErrors(errors);
      if (Object.keys(errors).length) {
        setError('Please check the highlighted details.');
        document.getElementById(errors.name ? 'customer-name' : 'customer-phone')?.focus();
        return;
      }
    }
    setError('');
    setStep(step + 1);
  };
  const submit = async () => {
    if (pending) return;
    setPending(true);
    try {
      setConfirmed(await add(draft));
      window.scrollTo({ top: 0, behavior: 'instant' });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setPending(false);
    }
  };
  const review = {
    ...draft,
    barberId: assignment || draft.barberId,
    id: 'review',
    reference: '',
    status: 'Confirmed',
    source: 'Online',
    createdAt: '',
  } as Appointment;
  if (confirmed)
    return (
      <section className="container confirmation-page">
        <Confirmation appointment={confirmed} />
      </section>
    );
  return (
    <section className="container booking-page">
      <div className="booking-page-heading">
        <Eyebrow>A LITTLE TIME, JUST FOR YOU</Eyebrow>
        <h1>
          Take your <em>place.</em>
        </h1>
        <p>Your next visit, a few simple steps away.</p>
      </div>
      <ol className="progress-steps" aria-label="Booking progress">
        {steps.map((label, i) => (
          <li
            key={label}
            className={`${i === step ? 'current' : ''} ${i < step ? 'done' : ''}`}
            aria-current={i === step ? 'step' : undefined}
          >
            <span>{i < step ? <Check size={15} /> : i + 1}</span>
            <span>{label}</span>
          </li>
        ))}
      </ol>
      <div className="booking-layout">
        <div className="booking-form">
          <div className="booking-step-title">
            <span className="step-counter">STEP 0{step + 1} / 05</span>
            <h2 ref={heading} tabIndex={-1}>
              {title[step]}
            </h2>
            <p>{text[step]}</p>
          </div>
          {step === 0 && (
            <ServicePicker
              selectedIds={draft.serviceIds}
              onChange={(serviceIds) => update({ serviceIds, time: -1 })}
            />
          )}
          {step === 1 && (
            <>
              <div className="barber-options">
                <button
                  type="button"
                  className={`selection-card any-option${draft.barberId === 'any' ? ' selected' : ''}`}
                  aria-pressed={draft.barberId === 'any'}
                  onClick={() =>
                    update({ barberId: 'any', ...(draft.barberId !== 'any' ? { time: -1 } : {}) })
                  }
                >
                  <span className="avatar">
                    <UserRound size={25} strokeWidth={1.3} />
                  </span>
                  <span>
                    <strong>Any available barber</strong>
                    <span>More flexibility. We’ll find an open chair.</span>
                  </span>
                  <span className="selection-check">
                    {draft.barberId === 'any' && <Check size={14} />}
                  </span>
                </button>
                {barbers.map((b) => (
                  <button
                    type="button"
                    key={b.id}
                    className={`selection-card barber-option${draft.barberId === b.id ? ' selected' : ''}`}
                    aria-pressed={draft.barberId === b.id}
                    onClick={() =>
                      update({ barberId: b.id, ...(draft.barberId !== b.id ? { time: -1 } : {}) })
                    }
                  >
                    <span className="avatar">{b.initials}</span>
                    <span>
                      <strong>{b.name}</strong>
                      <span>{b.focus}</span>
                      <small>Sample profile</small>
                    </span>
                    <span className="selection-check">
                      {draft.barberId === b.id && <Check size={14} />}
                    </span>
                  </button>
                ))}
              </div>
              <p className="subtle-note">
                Profiles are samples for this demo. The salon’s team will be added here.
              </p>
            </>
          )}
          {step === 2 && <DateTimePicker draft={draft} onChange={update} />}
          {step === 3 && <CustomerFields draft={draft} onChange={update} errors={fieldErrors} />}
          {step === 4 && (
            <div className="review-panel">
              <div className="review-heading">
                <Scissors size={24} strokeWidth={1.2} />
                <span>YOUR VISIT AT GROOM & GLAM</span>
                <button
                  className="text-button"
                  onClick={() => {
                    setStep(0);
                    setError('');
                  }}
                >
                  Edit
                </button>
              </div>
              <AppointmentSummary appointment={review} />
              {draft.barberId === 'any' && (
                <p className="subtle-note">An available barber is assigned when you confirm.</p>
              )}
              <p className="demo-note">
                This is a demo. No real appointment or notification will be sent.
              </p>
            </div>
          )}
          {error && (
            <div className="error-message" role="alert">
              {error}
              {step === 4 && (
                <button
                  className="text-button"
                  onClick={() => {
                    setStep(2);
                    setError('');
                  }}
                >
                  Choose another time
                </button>
              )}
            </div>
          )}
          <div className="booking-controls">
            {step > 0 ? (
              <button
                className="text-link"
                onClick={() => {
                  setStep(step - 1);
                  setError('');
                }}
                disabled={pending}
              >
                <ArrowLeft size={17} /> Back
              </button>
            ) : (
              <Link className="text-link" to="/services">
                <ArrowLeft size={17} /> Services
              </Link>
            )}
            {step < 4 ? (
              <button className="button dark" onClick={advance}>
                Continue <ArrowRight size={17} />
              </button>
            ) : (
              <button className="button dark" onClick={submit} disabled={pending}>
                {pending ? 'Confirming…' : 'Confirm demo booking'} <Check size={17} />
              </button>
            )}
          </div>
        </div>
        <aside className="booking-aside">
          <div className="booking-aside-photo">
            <img
              src="/assets/salon-warm.webp"
              alt="The chairs at Groom & Glam"
              width="462"
              height="490"
            />
            <span>YOUR NEXT MOMENT OF ME-TIME.</span>
          </div>
          <div className="booking-aside-content">
            <h2>Your visit</h2>
            <dl>
              <div>
                <dt>Services</dt>
                <dd>
                  {chosenServices.length ? (
                    <>
                      <ul className="selected-service-list">
                        {chosenServices.map((service) => (
                          <li key={service.id}>{service.name}</li>
                        ))}
                      </ul>
                      <small>{duration} minutes total</small>
                    </>
                  ) : (
                    'Your choice awaits'
                  )}
                </dd>
              </div>
              <div>
                <dt>Barber</dt>
                <dd>{preferred?.name ?? 'Any available barber'}</dd>
              </div>
              <div>
                <dt>When</dt>
                <dd>
                  {draft.time >= 0 ? (
                    <>
                      {dateLabel(draft.date, true)}
                      <small>{timeLabel(draft.time)} · Pakistan time</small>
                    </>
                  ) : (
                    'Find your perfect time'
                  )}
                </dd>
              </div>
            </dl>
            <div className="aside-address">
              {business.name}
              <br />
              <span>Main GPO Chowk, Circular Road, Quetta.</span>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

export function nextBookableDate() {
  return nextOpen(addDays(today(), 1));
}
