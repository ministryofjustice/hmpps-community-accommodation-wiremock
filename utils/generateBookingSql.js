const crypto = require('crypto')

const offenders = require('../data/offenders.json')

const crns = offenders.map(o => o.otherIds.crn)
const nomsNumbers = offenders.map(o => o.otherIds.nomsNumber)

const rooms = require('../data/rooms.json')

const randomOffender = () => offenders[Math.floor(Math.random() * offenders.length)]

const insertAPBooking = (crn, noms_number, arrival_date, departure_date, id = crypto.randomUUID()) =>
  insertBooking(crn, noms_number, arrival_date, departure_date, id, '459eeaba-55ac-4a1f-bae2-bad810d4016b', 'approved-premises')

const insertTABooking = (crn, noms_number, arrival_date, departure_date, bedId, id = crypto.randomUUID()) =>
  insertBooking(crn, noms_number, arrival_date, departure_date, id, 'd33006b7-55d9-4a8e-b722-5e18093dbcdf', 'temporary-accommodation', bedId)

const insertBooking = (crn, noms_number, arrival_date, departure_date, id, premisesID, service, bedId = null) => {
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
    "created_at",
    "noms_number"
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
    CURRENT_DATE,
   '${noms_number}'
  )
ON CONFLICT(id) DO NOTHING;
`
}

const insertConfirmation = (bookingId) => {
  return `
INSERT INTO
  confirmations (
    "id",
    "booking_id",
    "date_time",
    "notes",
    "created_at"
  )
VALUES
  (
    '${crypto.randomUUID()}',
    '${bookingId}',
    CURRENT_DATE,
    NULL,
    CURRENT_DATE
  )
ON CONFLICT(id) DO NOTHING;
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
  )
ON CONFLICT(id) DO NOTHING;
  `
}

const insertDeparture = (bookingId, departureDateTime, departureReasonId, moveOnCategoryId, destinationProviderId = null) => {
  return `
INSERT INTO
  departures (
    "id",
    "date_time",
    "departure_reason_id",
    "move_on_category_id",
    "destination_provider_id",
    "notes",
    "booking_id",
    "created_at"
  )
VALUES
  (
    '${crypto.randomUUID()}',
    ${departureDateTime},
    '${departureReasonId}',
    '${moveOnCategoryId}',
    ${destinationProviderId ? `'${destinationProviderId}'` : 'NULL'},
    NULL,
    '${bookingId}',
    CURRENT_DATE
  )
ON CONFLICT(id) DO NOTHING;
  `
}

const insertCancellation = (bookingId, cancellationDate, cancellationReasonId) => {
  return `
INSERT INTO
  cancellations (
    "id",
    "date",
    "notes",
    "booking_id",
    "cancellation_reason_id",
    "created_at"
  )
VALUES
  (
    '${crypto.randomUUID()}',
    ${cancellationDate},
    NULL,
    '${bookingId}',
    '${cancellationReasonId}',
    CURRENT_DATE
  )
ON CONFLICT(id) DO NOTHING;
  `
}

const insertNonArrival = (bookingId, nonArrivalDate, nonArrivalReasonId) => {
  return `
INSERT INTO
  non_arrivals (
    "id",
    "date",
    "notes",
    "booking_id",
    "non_arrival_reason_id",
    "created_at"
  )
VALUES
  (
    '${crypto.randomUUID()}',
    ${nonArrivalDate},
    NULL,
    '${bookingId}',
    '${nonArrivalReasonId}',
    CURRENT_DATE
  )
ON CONFLICT(id) DO NOTHING;
  `
}

const insertArrivedBooking = (crn, noms_number, arrival_date, departure_date) => {
  sql = []
  bookingId = crypto.randomUUID()
  sql.push(
    insertAPBooking(crn, noms_number, arrival_date, departure_date, bookingId)
  )
  sql.push(
    insertArrival(arrival_date, bookingId, departure_date)
  )

  return sql.join('\r\n')
}

const ta_statuses = ['provisional', 'confirmed', 'arrived', 'departed', 'cancelled', 'not-arrived']
const insertTABookingWithStatus = (crn, noms_number, arrival_date, departure_date, bed_id, current_status = null) => {
  currentStatus = current_status || ta_statuses[crypto.randomInt(statuses.length)]

  sql = []
  bookingId = crypto.randomUUID()
  sql.push(
    insertTABooking(crn, noms_number, arrival_date, departure_date, bed_id, bookingId)
  )

  switch (currentStatus) {
    case 'not-arrived':
      nonArrivalReasonId = 'e9184f2e-f409-461e-b149-492a02cb1655' // Failed to Arrive
      sql.push(
        insertNonArrival(bookingId, `${arrival_date} + 2`, nonArrivalReasonId)
      )
      sql.push(
        insertConfirmation(bookingId)
      )
      break

    case 'cancelled':
      cancellationReasonId = 'd2a0d037-53db-4bb2-b9f7-afa07948a3f5' // Administrative error
      sql.push(
        insertCancellation(bookingId, `${arrival_date} - 14`, cancellationReasonId)
      )
      break

    // The following cases should fall through so that (for example) a departed booking has an arrival and a confirmation.

    case 'departed':
      departureReasonId = 'f4d00e1c-8bfd-40e9-8241-a7d0f744e737' // Planned move-on
      moveOnCategoryId = '587dc0dc-9073-4992-9d58-5576753050e9' // Rental accommodation - private rental
      sql.push(
        insertDeparture(bookingId, departure_date, departureReasonId, moveOnCategoryId)
      )

    case 'arrived':
      sql.push(
        insertArrival(arrival_date, bookingId, departure_date)
      )

    case 'confirmed':
      sql.push(
        insertConfirmation(bookingId)
      )
    
    case 'provisional':
    default:
  }

  return sql.join('\r\n')
}

const arrivingToday = [0, 1, 2].map(
  index => insertAPBooking(crns[index], nomsNumbers[index], 'CURRENT_DATE', 'CURRENT_DATE + 84')
)

const dueToArrive = [3, 4, 6, 7].map(
  index => insertAPBooking(crns[index], nomsNumbers[index], `CURRENT_DATE + ${Math.floor(Math.random() * 4) + 1}`, 'CURRENT_DATE + 84')
)

const departingToday = [8, 9].map(
  index => insertArrivedBooking(crns[index], nomsNumbers[index], 'CURRENT_DATE - 84', 'CURRENT_DATE')
)

const departingSoon = [8, 9].map(
  index => insertArrivedBooking(crns[index], nomsNumbers[index], 'CURRENT_DATE - 84', `CURRENT_DATE + ${Math.floor(Math.random() * 4) + 1}`)
)

const currentBookings = [10, 11, 12, 13, 15].map(
  index => insertArrivedBooking(crns[index], nomsNumbers[index], 'CURRENT_DATE - 7', `CURRENT_DATE + ${Math.floor(Math.random() * 60) + 1}`)
)

const taBookings = rooms.
  filter((room) => room.createBooking === undefined || room.createBooking === true).
  map((room, index) => insertTABookingWithStatus(randomOffender().otherIds.crn, randomOffender().otherIds.nomsNumber, 'CURRENT_DATE', 'CURRENT_DATE + 84', room.beds[0].id, ta_statuses[index % ta_statuses.length]))

console.log(
  `
-- \${flyway:timestamp}
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
