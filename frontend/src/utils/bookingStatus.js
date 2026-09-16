export const BOOKING_STATUSES = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  CANCELLED: "CANCELLED",
  CHECKED_IN: "CHECKED_IN",
  CHECKED_OUT: "CHECKED_OUT",
}


export function getNextStatuses(
  currentStatus
) {

  switch (currentStatus) {

    case BOOKING_STATUSES.PENDING:

      return [
        BOOKING_STATUSES.CONFIRMED,
        BOOKING_STATUSES.CANCELLED,
      ]


    case BOOKING_STATUSES.CONFIRMED:

      return [
        BOOKING_STATUSES.CHECKED_IN,
        BOOKING_STATUSES.CANCELLED,
      ]


    case BOOKING_STATUSES.CHECKED_IN:

      return [
        BOOKING_STATUSES.CHECKED_OUT,
      ]


    case BOOKING_STATUSES.CHECKED_OUT:

      return []


    case BOOKING_STATUSES.CANCELLED:

      return []


    default:

      return []

  }

}


export function formatBookingStatus(
  status
) {

  return status
    .replaceAll("_", " ")
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase()
    )

}