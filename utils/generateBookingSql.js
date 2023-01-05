const crypto = require('crypto')

const offenders = require('../data/offenders.json')

const crns = offenders.map(o => o.otherIds.crn)

const rooms = require('../data/rooms.json')

const randomCrn = () => crns[Math.floor(Math.random() * crns.length)]

const insertAPBooking = (crn, arrival_date, departure_date, id = crypto.randomUUID()) =>
  insertBooking(crn, arrival_date, departure_date, id, '459eeaba-55ac-4a1f-bae2-bad810d4016b', 'approved-premises')

const insertTABooking = (crn, arrival_date, departure_date, bedId, id = crypto.randomUUID()) =>
  insertBooking(crn, arrival_date, departure_date, id, 'd33006b7-55d9-4a8e-b722-5e18093dbcdf', 'temporary-accommodation', bedId)

const insertBooking = (crn, arrival_date, departure_date, id, premisesID, service, bedId = null) => {
  return `
INSERT INTO
  bookings (
    "id",
    "arrival_date",
    "departure_date",
    "crn",
    "original_arrival_date",
    "original_departure_date",
    "premises_id",
    "bed_id",
    "service",
    "created_at"
  )
VALUES
  (
    '${id}',
    ${arrival_date},
    ${departure_date},
    '${crn}',
    ${arrival_date},
    ${departure_date},
    '${premisesID}',
    ${bedId ? `'${bedId}'` : 'NULL'},
    '${service}',
    CURRENT_DATE
  );
`
}

const insertArrival = (arrivalDate, bookingId, expectedDepartureDate) => {
  return `
INSERT INTO
  arrivals (
    "arrival_date",
    "booking_id",
    "created_at",
    "expected_departure_date",
    "id",
    "notes"
  )
VALUES
  (
    ${arrivalDate},
    '${bookingId}',
    CURRENT_DATE,
    ${expectedDepartureDate},
    '${crypto.randomUUID()}',
    NULL
  );
  `
}

const insertArrivedBooking = (crn, arrival_date, departure_date) => {
  sql = []
  bookingId = crypto.randomUUID()
  sql.push(
    insertAPBooking(crn, arrival_date, departure_date, bookingId)
  )
  sql.push(
    insertArrival(arrival_date, bookingId, departure_date)
  )

  return sql.join('\r\n')
}

const arrivingToday = [crns[0], crns[1], crns[2]].map(
  crn => insertAPBooking(crn, 'CURRENT_DATE', 'CURRENT_DATE + 84')
)

const dueToArrive = [crns[3], crns[4], crns[6], crns[7]].map(
  crn => insertAPBooking(crn, `CURRENT_DATE + ${Math.floor(Math.random() * 4) + 1}`, 'CURRENT_DATE + 84')
)

const departingToday = [crns[8], crns[9]].map(
  crn => insertArrivedBooking(crn, 'CURRENT_DATE - 84', 'CURRENT_DATE')
)

const departingSoon = [crns[8], crns[9]].map(
  crn => insertArrivedBooking(crn, 'CURRENT_DATE - 84', `CURRENT_DATE + ${Math.floor(Math.random() * 4) + 1}`)
)

const currentBookings = [crns[10], crns[11], crns[12], crns[13], crns[15]].map(
  crn => insertArrivedBooking(crn, 'CURRENT_DATE - 7', `CURRENT_DATE + ${Math.floor(Math.random() * 60) + 1}`)
)

const taBookings = rooms.map(room => insertTABooking(randomCrn(), 'CURRENT_DATE', 'CURRENT_DATE + 84', room.beds[0].id))

console.log(
  `
-- \${flyway:timestamp}
TRUNCATE TABLE arrivals CASCADE;
TRUNCATE TABLE bookings CASCADE;
--- Add some Bookings arriving today ---
${arrivingToday.join('\r\n')}
--- Add some Temporary accommodation bookings ---
${taBookings.join('\r\n')}
--- Add some Bookings arriving soon ---
${dueToArrive.join('\r\n')}
--- Add some Bookings departing today ---
${departingToday.join('\r\n')}
--- Add some Bookings departing soon ---
${departingSoon.join('\r\n')}
--- Add some arrived Bookings ---
${currentBookings.join('\r\n')}
  `
)
