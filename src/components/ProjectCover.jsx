// Abstract cover art for projects that don't have a screenshot yet. Each one is
// a motif from the project's subject — never a fake UI — and animates slightly
// when its card is hovered. Replace with a real screenshot by setting `image`
// on the project in src/data/projects.js.

const W = 640
const H = 400

function Board() {
  const size = 34
  const x0 = (W - size * 8) / 2
  const y0 = (H - size * 8) / 2
  const squares = []
  for (let row = 0; row < 8; row += 1) {
    for (let col = 0; col < 8; col += 1) {
      if ((row + col) % 2 === 1) {
        squares.push(<rect key={`${row}-${col}`} x={x0 + col * size} y={y0 + row * size} width={size} height={size} style={{ fill: 'var(--cover-cell)' }} />)
      }
    }
  }
  const piece = (col, row, kind, extra = {}) => (
    <circle
      key={`${kind}-${col}-${row}`}
      cx={x0 + col * size + size / 2}
      cy={y0 + row * size + size / 2}
      r={11}
      className={`cover__piece cover__piece--${kind}`}
      {...extra}
    />
  )

  return (
    <>
      <rect x={x0} y={y0} width={size * 8} height={size * 8} style={{ fill: 'var(--cover-board)', stroke: 'var(--cover-stroke)' }} />
      {squares}
      {[
        [1, 0], [3, 0], [5, 0], [7, 0], [0, 1], [4, 1], [6, 1], [3, 2],
      ].map(([c, r]) => piece(c, r, 'dark'))}
      {[
        [0, 5], [2, 5], [6, 5], [1, 6], [3, 6], [7, 6], [0, 7], [4, 7],
      ].map(([c, r]) => piece(c, r, 'light'))}
      {/* The move: this piece jumps diagonally on hover */}
      <path
        d={`M${x0 + 4.5 * size} ${y0 + 5.5 * size} L${x0 + 5.5 * size} ${y0 + 4.5 * size}`}
        className="cover__move-path"
      />
      <g className="cover__mover">{piece(4, 5, 'amber')}</g>
    </>
  )
}

function gearPath(cx, cy, outer, inner, teeth) {
  const points = []
  const step = (Math.PI * 2) / teeth
  for (let i = 0; i < teeth; i += 1) {
    const a = i * step
    const corners = [
      [inner, a - step * 0.32],
      [outer, a - step * 0.18],
      [outer, a + step * 0.18],
      [inner, a + step * 0.32],
    ]
    for (const [radius, angle] of corners) {
      points.push(`${(cx + radius * Math.cos(angle)).toFixed(1)} ${(cy + radius * Math.sin(angle)).toFixed(1)}`)
    }
  }
  return `M${points.join(' L')} Z`
}

function Gear() {
  return (
    <>
      <g className="cover__gear cover__gear--big">
        <path d={gearPath(280, 200, 118, 98, 14)} style={{ fill: 'var(--cover-fill)', stroke: 'var(--cover-mid)' }} strokeWidth="1.5" />
        <circle cx="280" cy="200" r="58" fill="none" style={{ stroke: 'var(--cover-ring)' }} strokeWidth="1.5" />
        <circle cx="280" cy="200" r="18" style={{ fill: 'var(--cover-board)', stroke: 'var(--cover-mid)' }} strokeWidth="1.5" />
      </g>
      <g className="cover__gear cover__gear--small">
        <path d={gearPath(438, 124, 58, 45, 9)} style={{ fill: 'var(--cover-fill-2)', stroke: 'var(--cover-accent)' }} strokeWidth="1.5" />
        <circle cx="438" cy="124" r="12" fill="none" style={{ stroke: 'var(--cover-accent)' }} strokeWidth="1.5" />
      </g>
    </>
  )
}

function Paw({ x, y, rotate, className }) {
  return (
    <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rotate})`} className={className}>
      <path d="M0 2c7 0 13 6 13 12 0 5-4 7-7 7-3 0-4-2-6-2s-3 2-6 2c-3 0-7-2-7-7C-13 8-7 2 0 2z" />
      <ellipse cx="-13" cy="-6" rx="4.2" ry="5.4" transform="rotate(-20 -13 -6)" />
      <ellipse cx="-5" cy="-14" rx="4.4" ry="5.8" transform="rotate(-6 -5 -14)" />
      <ellipse cx="5" cy="-14" rx="4.4" ry="5.8" transform="rotate(6 5 -14)" />
      <ellipse cx="13" cy="-6" rx="4.2" ry="5.4" transform="rotate(20 13 -6)" />
    </g>
  )
}

function Paws() {
  // Walk from bottom-left to top-right; feet alternate either side of the path.
  const start = [130, 350]
  const end = [500, 70]
  const count = 7
  const angle = Math.atan2(end[1] - start[1], end[0] - start[0])
  const heading = (angle * 180) / Math.PI + 90 // prints point "up" by default
  const side = [Math.cos(angle + Math.PI / 2), Math.sin(angle + Math.PI / 2)]
  const steps = Array.from({ length: count }, (_, i) => {
    const t = i / (count - 1)
    const offset = i % 2 ? 18 : -18
    return [
      start[0] + (end[0] - start[0]) * t + side[0] * offset,
      start[1] + (end[1] - start[1]) * t + side[1] * offset,
    ]
  })

  return (
    <>
      {steps.map(([x, y], index) => (
        <Paw
          key={index}
          x={x}
          y={y}
          rotate={heading.toFixed(1)}
          className={`cover__paw${index === count - 1 ? ' cover__paw--last' : ''}`}
        />
      ))}
    </>
  )
}

function Halftone() {
  const dots = []
  const gap = 20
  for (let y = gap / 2; y < H; y += gap) {
    for (let x = gap / 2; x < W; x += gap) {
      const d = Math.hypot(x - 420, y - 170) / 330
      const r = Math.max(0, 7.5 * (1 - d))
      if (r > 0.6) {
        const amber = Math.hypot(x - 470, y - 140) < 70
        dots.push(<circle key={`${x}-${y}`} cx={x} cy={y} r={r.toFixed(2)} className={amber ? 'cover__dot cover__dot--amber' : 'cover__dot'} />)
      }
    }
  }
  return <g className="cover__halftone">{dots}</g>
}

function Grid() {
  const lines = []
  for (let x = 40; x < W; x += 40) lines.push(<line key={`x${x}`} x1={x} y1="0" x2={x} y2={H} />)
  for (let y = 40; y < H; y += 40) lines.push(<line key={`y${y}`} x1="0" y1={y} x2={W} y2={y} />)
  return (
    <>
      <g style={{ stroke: 'var(--cover-grid)' }}>{lines}</g>
      <rect x="200" y="120" width="240" height="160" fill="none" style={{ stroke: 'var(--cover-accent)' }} strokeDasharray="4 6" />
    </>
  )
}

const VARIANTS = { board: Board, gear: Gear, paw: Paws, halftone: Halftone, grid: Grid }

export default function ProjectCover({ variant }) {
  const Art = VARIANTS[variant] ?? Grid
  return (
    <svg className={`cover cover--${variant}`} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <rect width={W} height={H} style={{ fill: 'var(--cover-bg)' }} />
      <Art />
    </svg>
  )
}
