import test from 'node:test';
import assert from 'node:assert/strict';
import {
  availableBarbers,
  createAppointment,
  decodeAppointments,
  isAppointment,
  minutesNow,
  seedAppointments,
  slots,
  today,
  validDate,
  validPhone,
  validateBooking,
} from '../src/booking';
import { services, type BookingDraft } from '../src/data';

const at = new Date('2026-11-05T05:00:00Z'); // Thursday, 10 AM in Pakistan.
const draft: BookingDraft = {
  serviceIds: ['haircut'],
  barberId: 'barber-a',
  date: '2026-11-06',
  time: 960,
  name: 'Demo Guest',
  phone: '0300 0000000',
  notes: '',
};

test('all date and time calculations use Asia/Karachi, including day rollover', () => {
  assert.equal(today(new Date('2026-11-04T20:00:00Z')), '2026-11-05');
  assert.equal(minutesNow(new Date('2026-11-04T20:15:00Z')), 75);
  assert.equal(minutesNow(new Date('2026-11-04T19:00:00Z')), 0);
});
test('invalid and impossible dates are rejected', () => {
  for (const date of ['', 'not-a-date', '2026-02-30', '2026-13-01', '2026-1-01'])
    assert.equal(validDate(date), false);
  assert.equal(validDate('2028-02-29'), true);
});
test('Pakistani mobile formats and Quetta landlines validate', () => {
  for (const phone of [
    '03122576653',
    '0312 2576653',
    '+92 312 2576653',
    '923122576653',
    '0092-312-2576653',
    '+92 (81) 2345678',
  ])
    assert.equal(validPhone(phone), true, phone);
  for (const phone of [
    '',
    '123',
    '0312257665',
    '+1 234 5678901',
    '03xx xxxxxxx',
    '03122576653<script>',
  ])
    assert.equal(validPhone(phone), false, phone);
});
test('Mondays, past dates, and times already started are unavailable', () => {
  assert.deepEqual(availableBarbers('2026-11-09', 900, 'haircut', [], undefined, at), []);
  assert.deepEqual(availableBarbers('2026-11-04', 900, 'haircut', [], undefined, at), []);
  const later = new Date('2026-11-05T10:00:00Z');
  assert.deepEqual(availableBarbers('2026-11-05', 900, 'haircut', [], undefined, later), []);
  assert.equal(availableBarbers('2026-11-05', 915, 'haircut', [], undefined, later).length, 3);
});
test('appointments may finish exactly at midnight, but never after', () => {
  assert.deepEqual(availableBarbers('2026-11-06', 1395, 'haircut', [], undefined, at), [
    'barber-a',
  ]);
  assert.deepEqual(availableBarbers('2026-11-06', 1410, 'haircut', [], undefined, at), []);
  assert.deepEqual(availableBarbers('2026-11-06', 1290, 'keratin', [], undefined, at), [
    'barber-a',
  ]);
  assert.deepEqual(availableBarbers('2026-11-06', 1305, 'keratin', [], undefined, at), []);
});
test('barber shift start and finish are enforced', () => {
  assert.deepEqual(availableBarbers('2026-11-06', 720, 'haircut', [], undefined, at), [
    'barber-a',
    'barber-c',
  ]);
  assert.deepEqual(availableBarbers('2026-11-06', 1335, 'haircut', [], undefined, at), [
    'barber-a',
    'barber-b',
  ]);
  assert.deepEqual(availableBarbers('2026-11-06', 1350, 'haircut', [], undefined, at), [
    'barber-a',
  ]);
});
test('overlap, containment, and identical starts are blocked; adjacent visits are allowed', () => {
  const appointment = createAppointment(draft, [], 'Online', at);
  for (const time of [930, 945, 960, 975, 990])
    assert.equal(
      availableBarbers(draft.date, time, 'haircut', [appointment], undefined, at).includes(
        'barber-a',
      ),
      false,
      String(time),
    );
  assert.equal(
    availableBarbers(draft.date, 915, 'haircut', [appointment], undefined, at).includes('barber-a'),
    true,
  );
  assert.equal(
    availableBarbers(draft.date, 1005, 'haircut', [appointment], undefined, at).includes(
      'barber-a',
    ),
    true,
  );
  assert.equal(
    availableBarbers(draft.date, 900, 'keratin', [appointment], undefined, at).includes('barber-a'),
    false,
  );
  assert.equal(
    availableBarbers(draft.date, 960, 'haircut', [appointment], undefined, at).includes('barber-b'),
    true,
  );
});
test('any available barber resolves to an actual available profile', () => {
  const first = createAppointment(draft, [], 'Online', at);
  const second = createAppointment({ ...draft, barberId: 'any' }, [first], 'Online', at);
  assert.equal(second.barberId, 'barber-b');
  const third = createAppointment({ ...draft, barberId: 'any' }, [first, second], 'Online', at);
  assert.equal(third.barberId, 'barber-c');
  assert.throws(
    () => createAppointment({ ...draft, barberId: 'any' }, [first, second, third], 'Online', at),
    /no longer available/,
  );
});
test('revalidation catches a slot taken after the initial selection', () => {
  const first = createAppointment(draft, [], 'Online', at);
  assert.throws(() => createAppointment(draft, [first], 'Online', at), /no longer available/);
});
test('rescheduling ignores its own original appointment while respecting other records', () => {
  const appointment = createAppointment(draft, [], 'Online', at);
  assert.equal(
    validateBooking({ ...draft, time: 975 }, [appointment], appointment.id, at).barberId,
    'barber-a',
  );
  const other = createAppointment({ ...draft, time: 1020 }, [appointment], 'Walk-in', at);
  assert.ok(
    validateBooking({ ...draft, time: 990 }, [appointment, other], appointment.id, at).error,
  );
});
test('cancellation releases time, while completion retains occupied history', () => {
  const appointment = createAppointment(draft, [], 'Online', at);
  assert.equal(
    availableBarbers(
      draft.date,
      draft.time,
      draft.serviceIds,
      [{ ...appointment, status: 'Cancelled' }],
      undefined,
      at,
    ).includes('barber-a'),
    true,
  );
  assert.equal(
    availableBarbers(
      draft.date,
      draft.time,
      draft.serviceIds,
      [{ ...appointment, status: 'Completed' }],
      undefined,
      at,
    ).includes('barber-a'),
    false,
  );
});
test('walk-ins and online bookings use identical scheduling validation', () => {
  const appointment = createAppointment(draft, [], 'Walk-in', at);
  assert.equal(appointment.source, 'Walk-in');
  assert.throws(
    () => createAppointment(draft, [appointment], 'Walk-in', at),
    /no longer available/,
  );
  assert.throws(
    () => createAppointment({ ...draft, date: '2026-11-09' }, [], 'Walk-in', at),
    /no longer available/,
  );
});
test('required customer fields, services, and malformed times are rejected', () => {
  for (const change of [
    { name: ' ' },
    { phone: '123' },
    { notes: 'a'.repeat(501) },
    { serviceIds: ['missing'] },
    { barberId: 'missing' },
    { time: NaN },
    { time: 961 },
  ])
    assert.ok(validateBooking({ ...draft, ...change }, [], undefined, at).error);
});
test('all services generate a valid slot list with closing-time rules', () => {
  for (const service of services) {
    const all = slots('2026-11-06', service.id, 'barber-a', [], undefined, at);
    assert.equal(all.length, 48);
    for (const slot of all.filter((s) => s.available))
      assert.ok(slot.time + service.duration <= 1440);
  }
});
test('saved records round-trip and malformed data recovers gracefully', () => {
  const samples = seedAppointments(at);
  assert.ok(samples.every(isAppointment));
  assert.deepEqual(decodeAppointments(JSON.stringify(samples), at), {
    appointments: samples,
    recovered: false,
  });
  assert.deepEqual(decodeAppointments('[]', at).appointments, []);
  assert.ok(decodeAppointments('invalid json', at).recovered);
  assert.ok(decodeAppointments('{"not":"an array"}', at).recovered);
  assert.deepEqual(decodeAppointments(null, at).appointments, samples);
  assert.equal(
    decodeAppointments(JSON.stringify([samples[0], { broken: true }]), at).appointments.length,
    1,
  );
});
test('corrupt, duplicate, and overlapping persisted records are discarded', () => {
  const appointment = createAppointment(draft, [], 'Online', at);
  const decoded = decodeAppointments(
    JSON.stringify([
      appointment,
      appointment,
      { ...appointment, id: 'overlap' },
      { ...appointment, id: 'invalid-time', time: 1490 },
    ]),
    at,
  );
  assert.deepEqual(decoded.appointments, [appointment]);
  assert.equal(decoded.recovered, true);
});

test('multiple services reserve their combined duration and enforce closing and shift limits', () => {
  const combined = { ...draft, serviceIds: ['haircut', 'beard'] };
  const appointment = createAppointment(combined, [], 'Online', at);
  assert.deepEqual(appointment.serviceIds, ['haircut', 'beard']);
  assert.equal(
    availableBarbers(draft.date, 1020, 'haircut', [appointment], undefined, at).includes(
      'barber-a',
    ),
    false,
  );
  assert.equal(
    availableBarbers(draft.date, 1035, 'haircut', [appointment], undefined, at).includes(
      'barber-a',
    ),
    true,
  );
  assert.deepEqual(availableBarbers(draft.date, 1365, combined.serviceIds, [], undefined, at), [
    'barber-a',
  ]);
  assert.deepEqual(availableBarbers(draft.date, 1380, combined.serviceIds, [], undefined, at), []);
  assert.equal(
    availableBarbers(draft.date, 1260, combined.serviceIds, [], undefined, at).includes('barber-c'),
    false,
  );
});

test('empty, duplicate, and partially invalid service selections are rejected', () => {
  for (const serviceIds of [[], ['haircut', 'haircut'], ['haircut', 'missing']]) {
    assert.ok(validateBooking({ ...draft, serviceIds }, [], undefined, at).error);
    assert.deepEqual(availableBarbers(draft.date, draft.time, serviceIds, [], undefined, at), []);
  }
});

test('adding a service to an existing booking rechecks the extended interval', () => {
  const original = createAppointment(draft, [], 'Online', at);
  const next = createAppointment({ ...draft, time: 1005 }, [original], 'Walk-in', at);
  assert.ok(
    validateBooking(
      { ...draft, serviceIds: ['haircut', 'beard'] },
      [original, next],
      original.id,
      at,
    ).error,
  );
  assert.equal(
    validateBooking(
      { ...draft, serviceIds: ['haircut', 'beard'], time: 1110 },
      [original, next],
      original.id,
      at,
    ).barberId,
    'barber-a',
  );
});

test('old single-service records migrate without losing customer or booking details', () => {
  const original = createAppointment(draft, [], 'Online', at);
  const { serviceIds, ...rest } = original;
  const legacy = { ...rest, serviceId: serviceIds[0] };
  const decoded = decodeAppointments(JSON.stringify([legacy]), at);
  assert.deepEqual(decoded, { appointments: [original], recovered: false });
  assert.equal('serviceId' in decoded.appointments[0], false);
});

test('multi-service records survive reload and cancellation releases their full interval', () => {
  const original = createAppointment(
    { ...draft, serviceIds: ['haircut', 'beard'] },
    [],
    'Online',
    at,
  );
  assert.deepEqual(decodeAppointments(JSON.stringify([original]), at).appointments, [original]);
  assert.equal(
    availableBarbers(
      draft.date,
      1020,
      'haircut',
      [{ ...original, status: 'Cancelled' }],
      undefined,
      at,
    ).includes('barber-a'),
    true,
  );
  const overlapping = { ...original, id: 'overlap', time: 1020 };
  assert.deepEqual(decodeAppointments(JSON.stringify([original, overlapping]), at).appointments, [
    original,
  ]);
});

test('a 90-minute booking excludes its whole interval and a new visit must fit the remaining gap', () => {
  const first = createAppointment(
    { ...draft, serviceIds: ['haircut', 'fade'], time: 840 },
    [],
    'Online',
    at,
  );
  const later = createAppointment({ ...draft, time: 1020 }, [first], 'Online', at);
  const freeTimes = slots(
    draft.date,
    ['haircut', 'fade'],
    'barber-a',
    [first, later],
    undefined,
    at,
  )
    .filter((slot) => slot.available)
    .map((slot) => slot.time);
  for (const time of [795, 810, 825, 840, 855, 870, 885, 900, 915, 945]) {
    assert.equal(
      freeTimes.includes(time),
      false,
      `Overlapping start ${time} should not be offered`,
    );
  }
  assert.ok(freeTimes.includes(750)); // 12:30–2:00 fits before the first customer.
  assert.ok(freeTimes.includes(930)); // 3:30–5:00 fits exactly between both customers.
  assert.ok(freeTimes.includes(1065)); // 5:45 starts after the later customer leaves.
  assert.ok(
    availableBarbers(draft.date, 840, ['haircut', 'fade'], [first, later], undefined, at).includes(
      'barber-b',
    ),
  );
});
