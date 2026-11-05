import { useEffect, useRef } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { Footer, Header } from './components';
import { About, Barbers, Contact, Home, NotFound, Services } from './pages';
import BookingFlow from './BookingFlow';
import OwnerDashboard from './OwnerDashboard';
import { useAppointments } from './store';

const titles: Record<string, string> = {
  '/': 'Groom & Glam — Salon & Spa, Quetta',
  '/services': 'Services — Groom & Glam',
  '/barbers': 'Our Barbers — Groom & Glam',
  '/about': 'About the Salon — Groom & Glam',
  '/contact': 'Visit Us — Groom & Glam',
  '/book': 'Book an Appointment — Groom & Glam',
  '/owner-demo': 'Owner Demo — Groom & Glam',
};

export default function App() {
  const { pathname } = useLocation();
  const { notice } = useAppointments();
  const main = useRef<HTMLElement>(null);
  useEffect(() => {
    document.title = titles[pathname] ?? 'Page not found — Groom & Glam';
    window.scrollTo({ top: 0, behavior: 'instant' });
    main.current?.focus({ preventScroll: true });
  }, [pathname]);
  return (
    <>
      <Header />
      {notice && (
        <div className="storage-notice" role="status">
          {notice}
        </div>
      )}
      <main id="main" ref={main} tabIndex={-1}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/barbers" element={<Barbers />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/book" element={<BookingFlow />} />
          <Route path="/owner-demo" element={<OwnerDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
