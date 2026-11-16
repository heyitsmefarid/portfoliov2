// A simplified sketch of each project's data: the main record in the middle and
// the records that hang off it. Drawn as a small entity diagram next to the
// project, the way an Information Systems student sketches a system.
//
//   center – the main record (≤ 12 characters)
//   links  – up to four related records (≤ 12 characters each), each with
//            `many: true` when the main record has many of them
//
// Keep these true to the project's features; they're labelled "simplified".

export const systems = {
  iskonnect: {
    center: 'Scholar',
    links: [
      { name: 'Requirement', many: true },
      { name: 'Grade', many: true },
      { name: 'Attendance', many: true },
      { name: 'Grant', many: true },
    ],
  },
  bahadvisory: {
    center: 'Flood zone',
    links: [
      { name: 'Road', many: true },
      { name: 'Report', many: true },
      { name: 'Safe route', many: true },
      { name: 'Alert', many: true },
    ],
  },
  studyspace: {
    center: 'Study space',
    links: [
      { name: 'Note', many: true },
      { name: 'Flashcard', many: true },
      { name: 'Quiz', many: true },
      { name: 'Session', many: true },
    ],
  },
  applypilot: {
    center: 'Job',
    links: [
      { name: 'Match score' },
      { name: 'Document', many: true },
      { name: 'Application' },
      { name: 'Reply', many: true },
    ],
  },
  tailfinder: {
    center: 'Pet',
    links: [
      { name: 'Request', many: true },
      { name: 'Adopter', many: true },
      { name: 'Inquiry', many: true },
    ],
  },
  'meu-gear-up': {
    center: 'Branch',
    links: [
      { name: 'Booking', many: true },
      { name: 'Stock', many: true },
      { name: 'Sale', many: true },
      { name: 'Mechanic', many: true },
    ],
  },
  'library-management': {
    center: 'Loan',
    links: [
      { name: 'Book' },
      { name: 'Borrower' },
      { name: 'Penalty', many: true },
    ],
  },
  checkers: {
    center: 'Player',
    links: [
      { name: 'Match', many: true },
      { name: 'Series', many: true },
      { name: 'Rank' },
    ],
  },
  'guhit-arts': {
    center: 'Order',
    links: [
      { name: 'Customer' },
      { name: 'Product', many: true },
      { name: 'Design', many: true },
      { name: 'Payment' },
    ],
  },
}
