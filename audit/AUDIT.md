# Groom & Glam delivery audit

Audit date: **5 November 2026**. Local Windows project; Node 24, React 19, TypeScript, and Vite. No deployment was performed.

## Available-time display update

The shared customer/walk-in/rescheduling picker now displays only start times where the chosen barber is free for the full combined service duration. Occupied starts and starts that would run into a later appointment are hidden, including empty time-of-day groups. Selecting a start shows the visit's end time. Fully booked days display a clear empty state.

The production build and **22 scheduling-rule tests passed**. Three new browser scenarios passed: a customer reserves 2:00–3:30 PM for 90 minutes, the next customer cannot see overlapping starts for that barber, 3:30 PM is available, another free barber retains independent availability, and fully booked days show no time buttons. The selected-time screen passed accessibility and overflow checks at 390 and 1440 px. Screenshots: `screenshots/free-times-390.png` and `screenshots/free-times-1440.png`.

## Multiple-service update

Customers and owners can now select multiple services for one consecutive appointment with the same barber. Selection counts, all service names, total minutes, availability, confirmation, walk-ins, editing, and rescheduling use the full selection. Existing single-service local records migrate automatically without resetting data.

Verification: production build passed; **21 rule tests passed**, the **10 existing browser scenarios passed**, and **2 new multi-service browser scenarios passed** at 390 and 1440 px. The new scenarios cover toggling/deselection, required selection, Back navigation, combined closing-time limits, persisted summaries, adding services during editing, cancellation, and multi-service walk-ins. Automated accessibility and overflow checks passed for the selected-service state. Screenshots: `screenshots/multiple-services-390.png` and `screenshots/multiple-services-1440.png`.

In the restricted execution profile, the `tsx` runner failed while reading OS user information. The same unit-test source was bundled locally with the installed esbuild and all 21 tests executed successfully through Node's test runner; no security settings were changed.

## Outcome

The complete customer website, booking flow, and owner appointment dashboard are implemented. The build and booking-rule tests pass. The full Chromium browser suite passed **10 tests**, including automated accessibility checks at **390, 768, and 1440 px**. A final focused pass rechecked the booking stages and owner editor after the last focus/scroll improvements.

## Functional checks

| Check | Result |
| --- | --- |
| Public Home, Services, Our Barbers, About, Contact routes | Pass |
| Service link preselection | Pass |
| Booking steps and Back preserve customer selections | Pass |
| Required name and Pakistani phone validation | Pass |
| Monday closure and past-date/time prevention | Pass |
| Service duration, barber shifts, and midnight closing | Pass |
| Same-barber overlaps blocked; adjacent appointments allowed | Pass |
| “Any available barber” resolves to a real sample profile | Pass |
| Submit rechecks fresh availability, including another tab taking the slot | Pass |
| Customer booking visible in owner records | Pass |
| Edit customer details and reschedule | Pass |
| Rescheduling excludes its own original interval | Pass |
| Cancel confirmation and subsequent slot release | Pass |
| Add walk-in and mark completed | Pass |
| Refresh persistence and phone search | Pass |
| Reset confirmation restores seven fictional samples | Pass |
| Malformed storage recovery and storage-unavailable notice | Pass |

The shared rule suite contains **16 passing tests**. Browser scenarios use a fixed test clock (5 November 2026, 10:00 AM Pakistan time) for reproducibility; the actual application uses the current date in Asia/Karachi.

## Visual and accessibility checks

- All seven routes checked at three requested widths: **21 route/viewport combinations**.
- Calendar, customer details, review, confirmation, and the owner editor also checked at all three widths: **15 additional state/viewport combinations**.
- Zero detected axe-core violations under WCAG 2 A/AA and WCAG 2.1 AA rules in the checked states. This is an automated test result, not an accessibility certification.
- No detected horizontal overflow, broken images, empty `#` links, or browser errors in the route audit.
- Mobile menu opens, follows links, and closes; Escape returns focus to the menu button.
- Native dialogs contain keyboard focus, support Escape, and restore focus on dismissal.
- Mobile appointment records replace the desktop table layout.
- Keyboard labels/focus, required-field errors, unavailable times, confirmation, empty state, and cancellation/reset dialogs are implemented.
- Screenshots were reviewed for typography, spacing, photography, calendar layout, confirmation clarity, and mobile records. The local screenshots are available in `audit/screenshots/`.

## Corrections made during the audit

1. Darkened secondary copy to meet contrast requirements on the warm-stone surface.
2. Improved booking-step focus and scroll placement so continuing a long mobile selection list brings the next step into view.
3. Added focus to the confirmation heading and kept dialog headers/actions reachable while scrolling.
4. Improved mobile headline wrapping and repaired spacing where a desktop line break is hidden.
5. Included the year in full appointment-date labels.
6. Bundled only the required Latin font subsets locally.
7. Used direct Node entry points so build/dev/test scripts work in the Windows project path containing `&`.
8. Reformatted source files for maintainability.

## Scope and limits

- This is a frontend presentation demo. Appointments are saved only in the browser; no actual salon booking or notification is sent.
- Staff identities, shifts, service durations, and seed customers are explicitly fictional/configurable demo data. Business details follow the supplied brief.
- Owner access is intentionally open and is not authentication. There are no payments, accounts, backend, revenue analytics, or messaging integrations.
- Actual supplied logo and cropped salon photographs are used. No unsupported reviews, awards, employee identities, or commercial pricing appear in the UI.
- Browser execution was verified in Chromium on Windows. Safari, Firefox, real-device screen readers, and external destination availability were not separately tested.

Run commands, data locations, image provenance, and reset instructions are in the project README.
