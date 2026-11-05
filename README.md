# Groom & Glam Salon & Spa

A client presentation demo built with React, TypeScript, and Vite. The customer website and owner appointment desk share browser-local records. No backend, account, payment, or messaging service is connected.

## Run locally

Use Node.js 22.12+ or Node.js 24 (verified with Node 24 on Windows).

```powershell
cd 'C:\Users\muham\Documents\Mine\Zevron Studio\Groom & Glam'
npm install
npm run dev
```

Open **http://127.0.0.1:5173**. The owner dashboard is **http://127.0.0.1:5173/owner-demo**, also linked in the footer. Keep the terminal running; press Ctrl+C to stop. The scripts use direct Node entry points so this folder's spaces and ampersand are supported.

```powershell
npm run build
npm run preview
```

The production bundle is written to `dist/`. The production preview defaults to **http://127.0.0.1:4173**. Use one consistent origin when presenting: different ports and `localhost` versus `127.0.0.1` have separate browser storage. The site has not been published.

## Presentation routes

| Route         | Experience                                                                                                 |
| ------------- | ---------------------------------------------------------------------------------------------------------- |
| `/`           | Photography-led salon introduction, services, booking explanation, location                                |
| `/services`   | Six service groups, duration estimates, preselected booking links                                          |
| `/barbers`    | Three explicitly labelled sample barber profiles                                                           |
| `/about`      | Business introduction and authentic salon/signage photography                                              |
| `/contact`    | Address, hours, click-to-call, Instagram, Google Maps directions                                           |
| `/book`       | Service → barber → date/time → customer → review → confirmation                                            |
| `/owner-demo` | Shared appointment list, filters, search, walk-ins, editing, rescheduling, cancellation, completion, reset |

## Business facts and configurable demo data

Edit **`src/data.ts`** to replace business details, services, durations, barber profiles, and schedules.

- Supplied facts: brand/descriptor, address, phone, Instagram, Tuesday–Sunday opening from noon to midnight, and Monday closure. Main identity is Groom & Glam Salon & Spa; the service offering focuses on men's grooming.
- Service categories and names are supported by the supplied profile, service screenshots, and rate list. No prices or proposal commercial terms appear in the app.
- **Every service duration is a sample estimate**, not a verified salon commitment.
- **Barber A, B, and C are neutral sample profiles.** Their focus labels, shifts, and identical service eligibility are configurable demo settings. No actual employee names, credentials, or photographs were supplied.
- Sample shifts: A noon–midnight, B 1–11 PM, C noon–10 PM, on all salon opening days. All services can currently be booked with each barber.
- Seeded guests are named `Sample Guest 01`, etc., and use the dummy number `0300 0000000`.
- Seed dates are relative to the browser's current day in **Asia/Karachi**, not hardcoded to the presentation date.

Business facts follow the supplied brief. The proposal was consulted for booking and appointment-management requirements only; its production authentication and commercial scope were intentionally excluded under the demo brief.

## Images and styling

Original supplied documents remain in `Docx/`. All displayed images are local, exact crops of the supplied screenshots in **`public/assets/`**. No generated logo, stock employee, stock interior, follower counts, price lists, or screenshot controls are displayed.

| Asset                  | Supplied source / treatment                                                             |
| ---------------------- | --------------------------------------------------------------------------------------- |
| `logo.png`             | Instagram profile logo, 140 × 140; rendered modestly beside a text wordmark             |
| `salon-warm.webp`      | Warm interior screenshot, 462 × 490; UI cropped away                                    |
| `salon-interior.webp`  | Neutral interior screenshot, 461 × 505; UI cropped away                                 |
| `haircut.webp`         | Finished haircut from supplied Instagram grid, 267 × 310; a customer haircut, not staff |
| `storefront.webp`      | Storefront from supplied grid, 268 × 307                                                |
| `storefront-sign.webp` | Separate sign screenshot, 457 × 121; overlay text cropped away                          |

Replace these files with approved higher-resolution originals as they become available. Preserve the actual logo proportions. Design tokens and responsive layouts are in **`src/styles.css`**. Fonts are bundled locally through Fontsource: Cormorant Garamond and DM Sans. The app does not request remote fonts, maps embeds, or photography. Google Maps, Instagram, and phone links are ordinary external links.

## Booking and storage behavior

Customers can select multiple services in one appointment. Each card toggles independently; the selection count, service list, and combined duration update immediately. All selected services run consecutively with one assigned barber. Availability, closing-time checks, confirmation, owner records, walk-ins, and rescheduling use the combined duration. Changing services clears the chosen start time so it can be checked again.

Previously saved single-service records automatically migrate from `serviceId` to `serviceIds` without resetting the demo or losing customer details. The localStorage key remains unchanged.

The date/time picker shows **only available start times** for the entire selected duration. For example, a 90-minute visit from 2:00–3:30 PM blocks that barber until 3:30 PM. Earlier starts are also excluded if the new visit would overlap that reservation. “Any available barber” can still offer the time when another barber is free for the whole visit. The selected time shows the calculated end time; a fully booked day shows an empty-state message. Customer bookings, walk-ins, and rescheduling share this picker.

`src/booking.ts` contains the shared scheduling rules: 15-minute start intervals, service duration, barber shifts, past-time prevention, Monday closure, midnight end boundary, overlap prevention, and resolution of “any available barber.” Submission revalidates current availability. Rescheduling excludes the record's own original interval; cancellation releases the interval. Completed appointments retain their occupied historical interval. Customer fields can be corrected on existing confirmed appointments even if their scheduled time has passed; moving them requires a valid future time.

`src/store.tsx` persists records in localStorage under **`groom-glam-appointments-v1`**. Missing data seeds the demo; malformed data is recovered with a visible notice, retaining valid nonconflicting records. If storage is unavailable, changes continue in memory with a persistence notice. Storage events sync open tabs. Where supported, Web Locks serialize writes across tabs; this remains a frontend demo, not a guarantee suitable for a production booking system.

To reset, open the owner demo and choose **Reset Demo Data**, then confirm. This restores the seven fictional seed appointments and removes demo changes in that browser. There is no authentication; the owner route is intentionally accessible. Data is not synchronized across devices or browsers, and no real appointment, SMS, email, or WhatsApp message is sent. Use fictional customer data for presentations.

## Verification

```powershell
npm test
node node_modules/@playwright/test/cli.js install chromium
npm run test:e2e
npm run build
```

- Unit tests cover timezone boundaries, input validation, Mondays, past dates/times, midnight closing, barber shifts, interval overlaps, any-barber assignment, rescheduling, cancellation, walk-ins, and malformed saved records.
- Browser tests exercise the complete customer-to-owner workflow, persistence, filters, reset, cross-tab revalidation, storage failure notices, mobile navigation, dialog focus, and Escape dismissal.
- Responsive and automated accessibility checks cover all seven routes at **390, 768, and 1440 px**, including image loading, overflow, console errors, and empty anchor links.
- Screenshots are saved in **`audit/screenshots/`**; Playwright's detailed HTML report is in `playwright-report/` after a test run. See **`audit/AUDIT.md`** for the delivery audit.

For any future static hosting, configure all application routes to fall back to `index.html`. Hosting and production integrations are outside this local demo.
