import { useMemo, useState } from 'react';
import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Plus,
  RotateCcw,
  Search,
  UserRound,
  X,
  ArrowUpRight,
} from 'lucide-react';
import { AppointmentSummary, Eyebrow, Modal, StatusBadge } from './components';
import { blankDraft, CustomerFields, DateTimePicker } from './BookingFlow';
import {
  addDays,
  availableBarbers,
  dateLabel,
  minutesNow,
  timeLabel,
  today,
  validateDetails,
  weekday,
} from './booking';
import {
  barbers,
  getBarber,
  serviceNames,
  totalDuration,
  services,
  type Appointment,
  type BookingDraft,
} from './data';
import { useAppointments } from './store';
import { ServicePicker } from './ServicePicker';

function AppointmentEditor({
  appointment,
  scheduleFirst = false,
  onClose,
  onSaved,
}: {
  appointment?: Appointment;
  scheduleFirst?: boolean;
  onClose: () => void;
  onSaved: (appointment: Appointment) => void;
}) {
  const [draft, setDraft] = useState<BookingDraft>(
    appointment ?? { ...blankDraft(), serviceIds: [services[0].id] },
  );
  const [stage, setStage] = useState(scheduleFirst ? 'schedule' : 'details');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);
  const { add, edit } = useAppointments();
  const update = (values: Partial<BookingDraft>) => {
    setDraft((d) => ({ ...d, ...values }));
    setError('');
    setFieldErrors({});
  };
  const save = async () => {
    const errors = validateDetails(draft);
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      setStage('details');
      setError('Check the highlighted customer details.');
      return;
    }
    if (!appointment && stage === 'details') {
      setStage('schedule');
      return;
    }
    if (pending) return;
    setPending(true);
    try {
      onSaved(appointment ? await edit(appointment.id, draft) : await add(draft, 'Walk-in'));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setPending(false);
    }
  };
  return (
    <Modal wide title={appointment ? 'Edit appointment' : 'Add a walk-in'} onClose={onClose}>
      <div className="editor-tabs">
        <button className={stage === 'details' ? 'active' : ''} onClick={() => setStage('details')}>
          1. Customer details
        </button>
        <button
          className={stage === 'schedule' ? 'active' : ''}
          onClick={() => setStage('schedule')}
        >
          2. Appointment time
        </button>
      </div>
      <div className="modal-content">
        {stage === 'details' ? (
          <CustomerFields draft={draft} onChange={update} errors={fieldErrors} />
        ) : (
          <>
            <div className="owner-services-picker">
              <h3>Services</h3>
              <p className="subtle-note">Choose one or more services for the same barber.</p>
              <ServicePicker
                compact
                selectedIds={draft.serviceIds}
                onChange={(serviceIds) => update({ serviceIds, time: -1 })}
              />
            </div>
            <div className="form-two-columns">
              <div className="field">
                <label htmlFor="edit-barber">Barber</label>
                <select
                  id="edit-barber"
                  value={draft.barberId}
                  onChange={(e) => update({ barberId: e.target.value, time: -1 })}
                >
                  <option value="any">Any available barber</option>
                  {barbers.map((barber) => (
                    <option key={barber.id} value={barber.id}>
                      {barber.name} (sample)
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <DateTimePicker draft={draft} onChange={update} ignoreId={appointment?.id} />
          </>
        )}
        {error && (
          <p className="error-message" role="alert">
            {error}
          </p>
        )}
        <p className="demo-note">Local demo only. No real booking or notification is sent.</p>
      </div>
      <div className="modal-actions">
        <button className="button outline" onClick={onClose} disabled={pending}>
          Close
        </button>
        <button className="button dark" onClick={save} disabled={pending}>
          {pending
            ? 'Saving…'
            : !appointment && stage === 'details'
              ? 'Next: appointment time'
              : appointment
                ? 'Save changes'
                : 'Add walk-in'}{' '}
          <Check size={16} />
        </button>
      </div>
    </Modal>
  );
}

type ConfirmationAction = { type: 'reset' } | { type: 'cancel'; appointment: Appointment };
export default function OwnerDashboard() {
  const { appointments, setStatus, reset } = useAppointments();
  const [date, setDate] = useState(today());
  const [barber, setBarber] = useState('all');
  const [status, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = appointments.find((a) => a.id === selectedId);
  const [editor, setEditor] = useState<{
    appointment?: Appointment;
    scheduleFirst?: boolean;
  } | null>(null);
  const [confirm, setConfirm] = useState<ConfirmationAction | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const currentDate = today();
  const currentMinute = minutesNow();
  const list = useMemo(
    () =>
      appointments
        .filter(
          (a) =>
            (!date || a.date === date) &&
            (barber === 'all' || a.barberId === barber) &&
            (status === 'all' || a.status === status) &&
            (a.name.toLowerCase().includes(search.toLowerCase().trim()) ||
              a.phone.replace(/[\s()-]/g, '').includes(search.replace(/[\s()-]/g, '').trim()) ||
              a.reference.toLowerCase().includes(search.toLowerCase().trim())),
        )
        .sort((a, b) => a.date.localeCompare(b.date) || a.time - b.time),
    [appointments, date, barber, status, search],
  );
  const todayCount = appointments.filter(
    (a) => a.date === currentDate && a.status !== 'Cancelled',
  ).length;
  const upcomingCount = appointments.filter(
    (a) =>
      a.status === 'Confirmed' &&
      (a.date > currentDate || (a.date === currentDate && a.time > currentMinute)),
  ).length;
  const availableAt = Math.max(720, Math.ceil((currentMinute + 1) / 15) * 15);
  const availableCount = availableBarbers(currentDate, availableAt, 'haircut', appointments).length;
  const scheduledCount = barbers.filter((b) => b.days.includes(weekday(currentDate))).length;
  const clearFilters = () => {
    setDate('');
    setBarber('all');
    setFilterStatus('all');
    setSearch('');
  };
  const updateStatus = async (appointment: Appointment, newStatus: 'Completed' | 'Cancelled') => {
    if (pending) return;
    setPending(true);
    setError('');
    try {
      await setStatus(appointment.id, newStatus);
      setMessage(`${appointment.reference} marked ${newStatus.toLowerCase()}.`);
      setConfirm(null);
      setSelectedId(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setPending(false);
    }
  };
  const confirmAction = async () => {
    if (!confirm || pending) return;
    if (confirm.type === 'cancel') {
      await updateStatus(confirm.appointment, 'Cancelled');
      return;
    }
    setPending(true);
    try {
      await reset();
      setConfirm(null);
      setSelectedId(null);
      setDate(today());
      setBarber('all');
      setSearch('');
      setFilterStatus('all');
      setMessage('Demo data reset. The original sample appointments are ready.');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setPending(false);
    }
  };
  return (
    <section className="owner-page">
      <div className="container">
        <div className="owner-topline">
          <Eyebrow>THE SALON DESK</Eyebrow>
          <span className="owner-demo-label">OWNER DEMO</span>
        </div>
        <div className="owner-heading">
          <div>
            <h1>
              Your day, <em>at a glance.</em>
            </h1>
            <p>Appointments, arrivals, and the next fresh start.</p>
          </div>
          <button
            className="button dark"
            onClick={() => {
              setEditor({});
              setError('');
            }}
          >
            <Plus size={18} /> Add walk-in
          </button>
        </div>
        <div className="owner-demo-notice">
          <span className="demo-dot" />
          <p>
            Local demo · sample customers and barbers. No secure login or live appointments. Records
            stay in this browser.
          </p>
        </div>
        <div className="dashboard-stats">
          <div>
            <span>
              TODAY’S APPOINTMENTS <CalendarDays size={19} strokeWidth={1.4} />
            </span>
            <strong>{String(todayCount).padStart(2, '0')}</strong>
            <small>{dateLabel(currentDate, true)}</small>
          </div>
          <div>
            <span>
              UPCOMING APPOINTMENTS <Clock3 size={19} strokeWidth={1.4} />
            </span>
            <strong>{String(upcomingCount).padStart(2, '0')}</strong>
            <small>Confirmed visits from now onwards</small>
          </div>
          <div>
            <span>
              AVAILABLE BARBERS <UserRound size={19} strokeWidth={1.4} />
            </span>
            <strong>
              {String(availableCount).padStart(2, '0')}
              <em> / {scheduledCount}</em>
            </strong>
            <small>
              {availableAt < 1440
                ? `For a 45-min visit at ${timeLabel(availableAt)}`
                : 'The salon is closed for today'}
            </small>
          </div>
        </div>
        <section className="appointments-panel">
          <div className="appointments-heading">
            <div>
              <h2>Appointment book</h2>
              <span>
                {list.length} {list.length === 1 ? 'appointment' : 'appointments'}
              </span>
            </div>
            <div className="date-controls">
              <button
                className="icon-button"
                aria-label="Previous day"
                onClick={() => setDate(addDays(date || currentDate, -1))}
              >
                <ChevronLeft size={18} />
              </button>
              <button className="text-button" onClick={() => setDate(currentDate)}>
                Today
              </button>
              <button
                className="icon-button"
                aria-label="Next day"
                onClick={() => setDate(addDays(date || currentDate, 1))}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
          <div className="dashboard-filters">
            <div className="field search-field">
              <label htmlFor="appointment-search">Search appointments</label>
              <div>
                <Search size={17} />
                <input
                  id="appointment-search"
                  type="search"
                  placeholder="Name, phone, or reference"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="field">
              <label htmlFor="filter-date">Date</label>
              <input
                id="filter-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="filter-barber">Barber</label>
              <select id="filter-barber" value={barber} onChange={(e) => setBarber(e.target.value)}>
                <option value="all">All barbers</option>
                {barbers.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="filter-status">Status</label>
              <select
                id="filter-status"
                value={status}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All statuses</option>
                {['Confirmed', 'Completed', 'Cancelled'].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="active-filter-line">
            <span>{date ? dateLabel(date) : 'All dates'} · Pakistan time</span>
            <button className="text-button" onClick={clearFilters}>
              Clear filters
            </button>
          </div>
          <div aria-live="polite" className="dashboard-message">
            {message && (
              <p className="success-message">
                <Check size={16} /> {message}
                <button
                  className="icon-button"
                  onClick={() => setMessage('')}
                  aria-label="Dismiss message"
                >
                  <X size={15} />
                </button>
              </p>
            )}
            {error && !confirm && (
              <p className="error-message" role="alert">
                {error}
              </p>
            )}
          </div>
          {list.length ? (
            <div className="table-wrap">
              <table className="appointment-table">
                <thead>
                  <tr>
                    <th>TIME</th>
                    <th>CUSTOMER</th>
                    <th>SERVICES</th>
                    <th>BARBER</th>
                    <th>STATUS</th>
                    <th>
                      <span className="sr-only">Details</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((a) => (
                    <tr key={a.id}>
                      <td data-label="Time">
                        <strong>{timeLabel(a.time)}</strong>
                        <small>{dateLabel(a.date, true)}</small>
                      </td>
                      <td data-label="Customer">
                        <button
                          className="customer-button"
                          onClick={() => {
                            setSelectedId(a.id);
                            setError('');
                          }}
                        >
                          {a.name}
                        </button>
                        <small>{a.phone}</small>
                      </td>
                      <td data-label="Services">
                        <span>{serviceNames(a.serviceIds)}</span>
                        <small>
                          {totalDuration(a.serviceIds)} min · {a.source}
                        </small>
                      </td>
                      <td data-label="Barber">{getBarber(a.barberId)?.name}</td>
                      <td data-label="Status">
                        <StatusBadge status={a.status} />
                      </td>
                      <td>
                        <button
                          className="table-view"
                          aria-label={`View ${a.name}, ${a.reference}`}
                          onClick={() => {
                            setSelectedId(a.id);
                            setError('');
                          }}
                        >
                          Details <ArrowUpRight size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="dashboard-empty">
              <CalendarDays size={34} strokeWidth={1.1} />
              <h3>A little room in the day.</h3>
              <p>No appointments match these filters.</p>
              <button className="button outline" onClick={clearFilters}>
                Show all appointments
              </button>
            </div>
          )}
        </section>
        <div className="owner-bottom">
          <span>Demo records are shared with the customer booking flow.</span>
          <button
            className="text-link"
            onClick={() => {
              setConfirm({ type: 'reset' });
              setError('');
            }}
          >
            <RotateCcw size={15} /> Reset Demo Data
          </button>
        </div>
      </div>
      {selected && !editor && !confirm && (
        <Modal title="Appointment details" onClose={() => setSelectedId(null)}>
          <div className="modal-content">
            <div className="detail-reference">
              <span>{selected.reference}</span>
              <StatusBadge status={selected.status} />
            </div>
            <AppointmentSummary appointment={selected} />
            <div className="detail-origin">
              {selected.source} booking ·{' '}
              {selected.source === 'Sample' ? 'Fictional demo customer' : 'Saved in this browser'}
            </div>
            {selected.status === 'Confirmed' && (
              <div className="detail-actions">
                <button
                  className="button dark"
                  onClick={() => {
                    setEditor({ appointment: selected });
                    setSelectedId(null);
                  }}
                >
                  Edit details
                </button>
                <button
                  className="button outline"
                  onClick={() => {
                    setEditor({ appointment: selected, scheduleFirst: true });
                    setSelectedId(null);
                  }}
                >
                  Reschedule
                </button>
                <button
                  className="button outline"
                  disabled={pending}
                  onClick={() => updateStatus(selected, 'Completed')}
                >
                  <Check size={16} /> Mark completed
                </button>
                <button
                  className="button danger-outline"
                  onClick={() => {
                    setConfirm({ type: 'cancel', appointment: selected });
                    setSelectedId(null);
                  }}
                >
                  Cancel appointment
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}
      {editor && (
        <AppointmentEditor
          appointment={editor.appointment}
          scheduleFirst={editor.scheduleFirst}
          onClose={() => setEditor(null)}
          onSaved={(saved) => {
            setEditor(null);
            setDate(saved.date);
            setBarber('all');
            setFilterStatus('all');
            setSearch('');
            setMessage(
              `${saved.reference} ${editor.appointment ? 'updated' : 'added as a walk-in'}.`,
            );
            setError('');
          }}
        />
      )}
      {confirm && (
        <Modal
          title={confirm.type === 'reset' ? 'Reset the demo?' : 'Cancel this appointment?'}
          onClose={() => setConfirm(null)}
        >
          <div className="modal-content">
            <p>
              {confirm.type === 'reset'
                ? 'This removes bookings added in this browser and restores the fictional sample appointments. This cannot be undone.'
                : `Cancel ${confirm.appointment.reference} for ${confirm.appointment.name}? The appointment will remain in the records and its time will become available again.`}
            </p>
            {error && (
              <p className="error-message" role="alert">
                {error}
              </p>
            )}
          </div>
          <div className="modal-actions">
            <button
              autoFocus
              className="button outline"
              onClick={() => setConfirm(null)}
              disabled={pending}
            >
              {confirm.type === 'reset' ? 'Keep my data' : 'Keep appointment'}
            </button>
            <button className="button danger" onClick={confirmAction} disabled={pending}>
              {pending
                ? 'Updating…'
                : confirm.type === 'reset'
                  ? 'Reset demo data'
                  : 'Yes, cancel appointment'}
            </button>
          </div>
        </Modal>
      )}
    </section>
  );
}
