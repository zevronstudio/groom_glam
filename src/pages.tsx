import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Scissors,
  Sparkles,
  Wind,
  CalendarDays,
  UserRound,
  Check,
  MapPin,
  Clock3,
  Phone,
  Instagram,
} from 'lucide-react';
import { Arrow, BookingCTA, Eyebrow, LocationStrip, PageIntro } from './components';
import { barbers, business, categories, services, type Category } from './data';

export function Home() {
  return (
    <>
      <section className="hero container">
        <div className="hero-copy">
          <Eyebrow>GROOMING, WITH INTENTION. QUETTA.</Eyebrow>
          <h1>
            A fresh look.
            <br />A little <em>more you.</em>
          </h1>
          <p>
            Good hair. A well-kept beard. Time for yourself.
            <br className="desktop-break" /> Come in, settle into the chair, and leave feeling
            fresh.
          </p>
          <div className="hero-actions">
            <Link to="/book" className="button dark">
              Book an Appointment <Arrow />
            </Link>
            <Link to="/services" className="text-link">
              Explore services <ArrowRight size={17} />
            </Link>
          </div>
          <div className="hero-footnote">
            <span className="line" />
            <span>YOUR NEIGHBOURHOOD SALON. YOUR OWN STYLE.</span>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-photo">
            <img
              src="/assets/salon-warm.webp"
              alt="Warmly lit mirrors and barber chairs inside Groom & Glam in Quetta"
              width="462"
              height="490"
              fetchPriority="high"
            />
            <div className="photo-label">
              <span>THE SPACE</span>
              <span>
                Groom & Glam, Quetta <Arrow />
              </span>
            </div>
          </div>
          <div className="vertical-caption">HAIR · BEARD · COLOUR · CARE</div>
          <span className="photo-index">01 / A CHAIR WITH YOUR NAME ON IT</span>
        </div>
      </section>
      <LocationStrip />
      <section className="section services-preview container">
        <div className="section-heading">
          <div>
            <Eyebrow>THE GROOMING EDIT</Eyebrow>
            <h2>
              Small details.
              <br />
              <em>A noticeable difference.</em>
            </h2>
          </div>
          <div>
            <p>
              From your regular tidy-up to a new look.
              <br /> Choose what feels right for you.
            </p>
            <Link to="/services" className="text-link">
              View all services <Arrow />
            </Link>
          </div>
        </div>
        <div className="service-feature-grid">
          <Link
            to="/services?category=Hair%20%26%20styling"
            className="feature-service photo-service"
          >
            <img
              src="/assets/haircut.webp"
              alt="A finished men's haircut shared by Groom & Glam"
              width="267"
              height="310"
              loading="lazy"
            />
            <div>
              <span className="service-number">01</span>
              <h3>Hair & styling</h3>
              <p>A fresh cut. A clean finish.</p>
              <span className="round-arrow">
                <Arrow />
              </span>
            </div>
          </Link>
          <div className="service-feature-stack">
            <Link
              to="/services?category=Beard%20%26%20shave"
              className="feature-service ink-service"
            >
              <Scissors size={32} strokeWidth={1.2} />
              <span className="service-number">02</span>
              <div>
                <h3>Beard & shave</h3>
                <p>Good lines make all the difference.</p>
              </div>
              <span className="round-arrow">
                <Arrow />
              </span>
            </Link>
            <Link
              to="/services?category=Hair%20treatments"
              className="feature-service stone-service"
            >
              <Wind size={32} strokeWidth={1.2} />
              <span className="service-number">03</span>
              <div>
                <h3>Colour & care</h3>
                <p>Something new. Something for you.</p>
              </div>
              <span className="round-arrow">
                <Arrow />
              </span>
            </Link>
          </div>
        </div>
      </section>
      <section className="salon-story">
        <div className="container story-grid">
          <div className="story-images">
            <img
              className="story-main-image"
              src="/assets/salon-interior.webp"
              alt="The salon's illuminated mirrors and black barber chairs"
              width="461"
              height="505"
              loading="lazy"
            />
            <span className="image-caption">A LOOK INSIDE GROOM & GLAM</span>
          </div>
          <div className="story-copy">
            <Eyebrow light>YOUR TIME IN THE CHAIR</Eyebrow>
            <h2>
              Step in.
              <br />
              Slow down.
              <br />
              <em>Freshen up.</em>
            </h2>
            <p>
              A welcoming space for your next haircut, beard tidy, or a little extra care. Find
              Groom & Glam Salon & Spa at Main GPO Chowk, right here in Quetta.
            </p>
            <Link to="/about" className="text-link light-link">
              Get to know the salon <Arrow />
            </Link>
            <div className="story-detail">
              <span>G&G</span>
              <p>
                Considered grooming.
                <br />
                An easy part of your routine.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="section container booking-explainer">
        <div className="section-heading">
          <div>
            <Eyebrow>LESS PLANNING. MORE YOU.</Eyebrow>
            <h2>
              A few clicks.
              <br />
              <em>Then take a seat.</em>
            </h2>
          </div>
          <Link to="/book" className="text-link">
            Find your time <Arrow />
          </Link>
        </div>
        <div className="booking-steps">
          {[
            {
              icon: Scissors,
              title: 'Choose your service',
              text: 'A cut, a beard tidy, or a little more. Start with what you need.',
            },
            {
              icon: CalendarDays,
              title: 'Make it your time',
              text: 'Pick a barber, find an available time, and add your details.',
            },
            {
              icon: Check,
              title: 'You’re all set',
              text: 'Review your appointment and get your demo confirmation on screen.',
            },
          ].map(({ icon: Icon, title, text }, index) => (
            <div key={title}>
              <div className="step-top">
                <Icon size={25} strokeWidth={1.3} />
                <span>0{index + 1}</span>
              </div>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="barber-preview container">
        <div>
          <Eyebrow>YOUR CHAIR. YOUR CHOICE.</Eyebrow>
          <h2>
            A familiar face.
            <br />
            Or a <em>fresh perspective.</em>
          </h2>
          <p>Choose a preferred barber, or let us find the next available chair.</p>
          <Link to="/barbers" className="text-link">
            Explore barber selection <Arrow />
          </Link>
        </div>
        <div className="barber-preview-panel">
          <div className="avatar-line">
            {barbers.map((b) => (
              <span className="avatar" key={b.id}>
                {b.initials}
              </span>
            ))}
          </div>
          <h3>Who’s your pick?</h3>
          <p>Choose a barber when you book.</p>
          <span className="sample-label">Sample profiles for this demo</span>
          <Link to="/book" className="button outline">
            Find an available chair <Arrow />
          </Link>
        </div>
      </section>
      <BookingCTA />
    </>
  );
}

export function Services() {
  const query = new URLSearchParams(window.location.search).get('category');
  const [selected, setSelected] = useState<Category | 'All services'>(
    categories.includes(query as Category) ? (query as Category) : 'All services',
  );
  const shown = selected === 'All services' ? categories : [selected];
  return (
    <>
      <PageIntro
        eyebrow="THE SERVICE MENU"
        title={
          <>
            Good grooming.
            <br />
            <em>Made personal.</em>
          </>
        }
        text="Your regular refresh or a change of pace. Find a little time for the details."
      />
      <section className="container services-page">
        <div className="service-tabs" aria-label="Filter services">
          {(['All services', ...categories] as const).map((category) => (
            <button
              key={category}
              className={selected === category ? 'active' : ''}
              onClick={() => setSelected(category)}
              aria-pressed={selected === category}
            >
              {category}
            </button>
          ))}
        </div>
        <div className="service-directory">
          {shown.map((category) => (
            <section key={category} className="service-category">
              <div className="category-title">
                <span>0{categories.indexOf(category) + 1}</span>
                <h2>{category}</h2>
              </div>
              <div>
                {services
                  .filter((s) => s.category === category)
                  .map((service) => (
                    <article className="service-row" key={service.id}>
                      <div>
                        <h3>{service.name}</h3>
                        <p>{service.description}</p>
                        <span className="duration">
                          <Clock3 size={13} /> Approx. {service.duration} min
                        </span>
                      </div>
                      <Link
                        to={`/book?service=${service.id}`}
                        className="service-book"
                        aria-label={`Book ${service.name}`}
                      >
                        Book <Arrow />
                      </Link>
                    </article>
                  ))}
              </div>
            </section>
          ))}
        </div>
        <p className="subtle-note">
          Treatment times are indicative. Your service can be discussed with the salon.
        </p>
      </section>
      <BookingCTA />
    </>
  );
}

export function Barbers() {
  return (
    <>
      <PageIntro
        eyebrow="FIND YOUR CHAIR"
        title={
          <>
            Your grooming.
            <br />
            <em>Your choice.</em>
          </>
        }
        text="Pick a preferred barber, or choose any available barber and we’ll match your time to an open chair."
      />
      <section className="container barbers-page">
        <div className="sample-banner">
          <UserRound size={18} />
          <p>
            Meet the booking experience. These are sample profiles; the salon’s team will be added
            here.
          </p>
        </div>
        <div className="barber-grid">
          {barbers.map((barber, index) => (
            <article className="barber-profile" key={barber.id}>
              <div className={`barber-portrait portrait-${index}`}>
                <span>{barber.initials}</span>
                <small>SAMPLE PROFILE</small>
                <Scissors size={36} strokeWidth={1} />
              </div>
              <div className="barber-profile-copy">
                <span className="eyebrow plain">{barber.focus}</span>
                <h2>{barber.name}</h2>
                <p>{barber.description}</p>
                <Link className="text-link" to={`/book?barber=${barber.id}`}>
                  Choose {barber.name} <Arrow />
                </Link>
              </div>
            </article>
          ))}
        </div>
        <div className="any-barber-callout">
          <div>
            <Sparkles size={23} strokeWidth={1.4} />
            <span>
              <h2>No preference? No problem.</h2>
              <p>We’ll assign an available barber for the service and time you choose.</p>
            </span>
          </div>
          <Link className="button dark" to="/book?barber=any">
            Any available barber <Arrow />
          </Link>
        </div>
      </section>
      <BookingCTA />
    </>
  );
}

export function About() {
  return (
    <>
      <PageIntro
        eyebrow="GROOM & GLAM · QUETTA"
        title={
          <>
            A space for
            <br />
            <em>looking after yourself.</em>
          </>
        }
        text="Hair, beard, and a little breathing room. Welcome to Groom & Glam Salon & Spa."
      />
      <section className="container about-layout">
        <div className="about-photo">
          <img
            src="/assets/salon-interior.webp"
            alt="Inside the real Groom & Glam salon in Quetta"
            width="461"
            height="505"
          />
          <span className="image-caption">OUR SALON, MAIN GPO CHOWK</span>
        </div>
        <div>
          <Eyebrow>COME AS YOU ARE</Eyebrow>
          <h2>
            A fresh look,
            <br />
            close to <em>home.</em>
          </h2>
          <p>
            At Groom & Glam, men’s grooming brings together the everyday essentials and the
            finishing touches: haircuts, beard care, colour, and hair treatments.
          </p>
          <p>
            You’ll find the salon on Circular Road, opposite P & T Colony. Drop in for a familiar
            style, plan for an occasion, or make a little space in your week for yourself.
          </p>
          <Link to="/services" className="text-link">
            Find your next service <Arrow />
          </Link>
          <div className="about-sign">
            <img
              src="/assets/storefront-sign.webp"
              alt="The actual Groom & Glam Salon & Spa storefront sign"
              width="457"
              height="121"
              loading="lazy"
            />
            <span>LOOK FOR THE GOLD LETTERING.</span>
          </div>
        </div>
      </section>
      <LocationStrip />
      <BookingCTA />
    </>
  );
}

export function Contact() {
  return (
    <>
      <PageIntro
        eyebrow="COME ON OVER"
        title={
          <>
            Your next stop.
            <br />
            <em>Groom & Glam.</em>
          </>
        }
        text="Find us at Main GPO Chowk in Quetta. Call the salon or plan your next visit."
      />
      <section className="container contact-grid">
        <div className="contact-information">
          <div className="contact-block">
            <MapPin size={23} strokeWidth={1.3} />
            <div>
              <h2>In the neighbourhood</h2>
              <p>{business.address}</p>
              <a href={business.mapsLink} className="text-link" target="_blank" rel="noreferrer">
                Get directions on Google Maps <Arrow />
              </a>
            </div>
          </div>
          <div className="contact-block">
            <Clock3 size={23} strokeWidth={1.3} />
            <div>
              <h2>A time that suits you</h2>
              <dl className="hours-list">
                <div>
                  <dt>Tuesday–Sunday</dt>
                  <dd>12:00 PM–12:00 AM</dd>
                </div>
                <div>
                  <dt>Monday</dt>
                  <dd>Closed</dd>
                </div>
              </dl>
              <small>All hours are in Pakistan time (Asia/Karachi).</small>
            </div>
          </div>
          <div className="contact-block">
            <Phone size={23} strokeWidth={1.3} />
            <div>
              <h2>Let’s talk</h2>
              <a className="contact-phone" href={business.phoneLink}>
                {business.phone}
              </a>
              <p>For questions about your visit, give the salon a call.</p>
            </div>
          </div>
          <div className="contact-block">
            <Instagram size={23} strokeWidth={1.3} />
            <div>
              <h2>A little inspiration</h2>
              <a
                className="text-link"
                href={business.instagramLink}
                target="_blank"
                rel="noreferrer"
              >
                @{business.instagram} <Arrow />
              </a>
            </div>
          </div>
        </div>
        <div className="contact-visual">
          <img
            src="/assets/storefront.webp"
            alt="The entrance to Groom & Glam Salon & Spa on Circular Road"
            width="268"
            height="307"
          />
          <div>
            <Eyebrow>FIND THE GOLD SIGN</Eyebrow>
            <h2>
              See you
              <br />
              <em>in the chair.</em>
            </h2>
            <p>
              Main GPO Chowk
              <br />
              Circular Road, Quetta
            </p>
            <a className="button dark" href={business.mapsLink} target="_blank" rel="noreferrer">
              Plan your route <Arrow />
            </a>
          </div>
        </div>
      </section>
      <BookingCTA />
    </>
  );
}

export function NotFound() {
  return (
    <section className="container not-found">
      <Eyebrow>404 · A WRONG TURN</Eyebrow>
      <h1>
        Let’s get you
        <br />
        <em>back in the chair.</em>
      </h1>
      <p>We couldn’t find that page.</p>
      <Link to="/" className="button dark">
        Back to home <ArrowRight size={18} />
      </Link>
    </section>
  );
}
