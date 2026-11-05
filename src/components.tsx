import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  ArrowUpRight,
  ArrowRight,
  Clock3,
  Instagram,
  MapPin,
  Menu,
  Phone,
  X,
  Check,
} from 'lucide-react';
import { business, getBarber, selectedServices, totalDuration, type Appointment } from './data';
import { dateLabel, timeLabel } from './booking';

export const Arrow = () => <ArrowUpRight size={18} strokeWidth={1.5} aria-hidden="true" />;
export const Eyebrow = ({ children, light = false }: { children: ReactNode; light?: boolean }) => (
  <p className={`eyebrow${light ? ' light' : ''}`}>
    <span />
    {children}
  </p>
);
export function Brand({ footer = false }: { footer?: boolean }) {
  return (
    <Link to="/" className={`brand${footer ? ' footer-brand' : ''}`} aria-label="Groom & Glam home">
      <img src="/assets/logo.png" alt="" width="52" height="52" />
      <span>
        GROOM <em>&</em> GLAM<small>SALON & SPA</small>
      </span>
    </Link>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const menuButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.search]);
  useEffect(() => {
    const close = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        setOpen(false);
        menuButton.current?.focus();
      }
    };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [open]);
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <div className="topbar">
        <span>
          <MapPin size={12} aria-hidden="true" /> MAIN GPO CHOWK, QUETTA
        </span>
        <span>
          TUESDAY–SUNDAY <i /> 12 PM–12 AM
        </span>
        <a href={business.phoneLink}>{business.phone}</a>
      </div>
      <header className="site-header">
        <div className="header-inner">
          <Brand />
          <nav
            aria-label="Main navigation"
            id="main-navigation"
            className={open ? 'navigation is-open' : 'navigation'}
          >
            {[
              ['/', 'Home'],
              ['/services', 'Services'],
              ['/barbers', 'Our Barbers'],
              ['/about', 'About'],
              ['/contact', 'Contact'],
            ].map(([path, label]) => (
              <NavLink key={path} to={path} end={path === '/'}>
                {label}
              </NavLink>
            ))}
            <Link to="/book" className="button dark mobile-nav-book">
              Book an Appointment <Arrow />
            </Link>
          </nav>
          <Link to="/book" className="button dark header-book">
            Book an Appointment <Arrow />
          </Link>
          <button
            className="icon-button menu-toggle"
            ref={menuButton}
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-controls="main-navigation"
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </header>
    </>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-main">
        <div>
          <Brand footer />
          <p>
            Good grooming. Your own style.
            <br />
            Find us in the heart of Quetta.
          </p>
          <a className="social-link" href={business.instagramLink} target="_blank" rel="noreferrer">
            <Instagram size={17} /> Instagram <Arrow />
          </a>
        </div>
        <div>
          <h2>EXPLORE</h2>
          <Link to="/services">Services</Link>
          <Link to="/barbers">Our Barbers</Link>
          <Link to="/about">About the salon</Link>
          <Link to="/book">Book an Appointment</Link>
        </div>
        <div>
          <h2>FIND US</h2>
          <p>
            Main GPO Chowk, Circular Road,
            <br />
            opposite P & T Colony, Quetta.
          </p>
          <a href={business.mapsLink} target="_blank" rel="noreferrer">
            Get directions <Arrow />
          </a>
          <a href={business.phoneLink}>{business.phone}</a>
        </div>
        <div>
          <h2>OPENING HOURS</h2>
          <p>
            Tuesday–Sunday
            <br />
            12:00 PM–12:00 AM
          </p>
          <p className="muted-light">Monday closed</p>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} Groom & Glam Salon & Spa.</span>
        <span>
          Quetta, Pakistan <span className="small-dot">·</span>{' '}
          <Link to="/owner-demo">
            Owner Demo <ArrowUpRight size={12} />
          </Link>
        </span>
      </div>
    </footer>
  );
}

export function PageIntro({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: ReactNode;
  text: string;
}) {
  return (
    <section className="page-intro container">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h1>{title}</h1>
      <p>{text}</p>
    </section>
  );
}

export function BookingCTA() {
  return (
    <section className="booking-cta">
      <div className="container">
        <div>
          <Eyebrow light>A LITTLE TIME FOR YOURSELF</Eyebrow>
          <h2>
            Your next good hair day
            <br />
            starts <em>here.</em>
          </h2>
        </div>
        <Link to="/book" className="button gold">
          Book an Appointment <Arrow />
        </Link>
      </div>
    </section>
  );
}

export function LocationStrip() {
  return (
    <section className="location-strip container">
      <div>
        <MapPin size={24} strokeWidth={1.3} />
        <span>
          <strong>IN THE HEART OF QUETTA</strong>
          <Link to="/contact">
            Main GPO Chowk, Circular Road <Arrow />
          </Link>
        </span>
      </div>
      <div>
        <Clock3 size={24} strokeWidth={1.3} />
        <span>
          <strong>MAKE TIME FOR YOURSELF</strong>
          <span>Tuesday–Sunday · 12 PM–12 AM</span>
        </span>
      </div>
      <a href={business.phoneLink}>
        <Phone size={18} /> Let’s talk <Arrow />
      </a>
    </section>
  );
}

export function Modal({
  title,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const dialog = ref.current!;
    dialog.showModal();
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      dialog.close();
      document.body.style.overflow = oldOverflow;
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={`modal${wide ? ' modal-wide' : ''}`}
      aria-labelledby="dialog-title"
      onCancel={(e) => {
        e.preventDefault();
        closeRef.current();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          const rect = e.currentTarget.getBoundingClientRect();
          if (
            e.clientX < rect.left ||
            e.clientX > rect.right ||
            e.clientY < rect.top ||
            e.clientY > rect.bottom
          )
            closeRef.current();
        }
      }}
    >
      <div className="modal-header">
        <h2 id="dialog-title">{title}</h2>
        <button className="icon-button" onClick={onClose} aria-label="Close dialog">
          <X size={20} />
        </button>
      </div>
      {children}
    </dialog>
  );
}

export function StatusBadge({ status }: { status: Appointment['status'] }) {
  return (
    <span className={`status status-${status.toLowerCase()}`}>
      <span />
      {status}
    </span>
  );
}

export function AppointmentSummary({
  appointment,
  showCustomer = true,
}: {
  appointment: Appointment;
  showCustomer?: boolean;
}) {
  const chosenServices = selectedServices(appointment.serviceIds);
  const duration = totalDuration(appointment.serviceIds);
  return (
    <dl className="summary-list">
      <div>
        <dt>Services</dt>
        <dd>
          <ul className="selected-service-list">
            {chosenServices.map((service) => (
              <li key={service.id}>{service.name}</li>
            ))}
          </ul>
          <small>{duration} minutes total</small>
        </dd>
      </div>
      <div>
        <dt>Barber</dt>
        <dd>
          {getBarber(appointment.barberId)?.name}
          <small>Sample profile</small>
        </dd>
      </div>
      <div>
        <dt>Date & time</dt>
        <dd>
          {dateLabel(appointment.date)}
          <small>
            {timeLabel(appointment.time)}–{timeLabel(appointment.time + duration)} · Pakistan time
          </small>
        </dd>
      </div>
      {showCustomer && (
        <>
          <div>
            <dt>Customer</dt>
            <dd>
              {appointment.name}
              <small>{appointment.phone}</small>
            </dd>
          </div>
          {appointment.notes && (
            <div>
              <dt>Notes</dt>
              <dd className="wrap-text">{appointment.notes}</dd>
            </div>
          )}
        </>
      )}
      <div>
        <dt>Location</dt>
        <dd>{business.address}</dd>
      </div>
    </dl>
  );
}

export function Confirmation({
  appointment,
  owner = false,
}: {
  appointment: Appointment;
  owner?: boolean;
}) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    titleRef.current?.focus({ preventScroll: true });
  }, []);
  return (
    <div className="confirmation">
      <div className="success-icon">
        <Check size={28} strokeWidth={1.5} />
      </div>
      <Eyebrow>ALL SET</Eyebrow>
      <h1 ref={titleRef} tabIndex={-1}>
        Your time is <em>reserved.</em>
      </h1>
      <p>Your demo appointment is saved. We’ll keep the details right here.</p>
      <div className="confirmation-card">
        <div className="confirmation-reference">
          <span>BOOKING REFERENCE</span>
          <strong>{appointment.reference}</strong>
        </div>
        <AppointmentSummary appointment={appointment} />
        <p className="demo-note">
          This is a demo. No real appointment or notification has been sent.
        </p>
      </div>
      <div className="button-row">
        <Link to={owner ? '/owner-demo' : '/'} className="button dark">
          {owner ? 'View appointments' : 'Back to home'} <ArrowRight size={17} />
        </Link>
        <Link to="/services" className="text-link">
          Explore services <Arrow />
        </Link>
      </div>
    </div>
  );
}
