import { useEffect, useState } from 'react'

// Fred's local time, e.g. "10:42 PM in Calapan City". Updates every 15 s.
export default function LocalTime({ timeZone, place }) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 15_000)
    return () => clearInterval(timer)
  }, [])

  const time = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone }).format(now)
  const [clock, meridiem] = time.split(' ')
  const [hours, minutes] = clock.split(':')

  return (
    <time className="local-time" dateTime={now.toISOString()}>
      {hours}
      <span className="local-time__colon">:</span>
      {minutes} {meridiem} in {place}
    </time>
  )
}
