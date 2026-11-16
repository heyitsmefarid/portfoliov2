import { systems } from '../data/systems.js'
import './SystemSketch.css'

// A small entity diagram in crow's-foot notation, ruled straight in ink:
// the main record in the middle, related records either side.
const W = 400
const H = 176
const BOX_H = 40
const CENTER = { x: 148, y: (H - BOX_H) / 2, w: 104 }
const SIDE_W = 104
const LEFT_X = 6
const RIGHT_X = W - 6 - SIDE_W

function placements(count) {
  const left = Math.ceil(count / 2)
  const right = count - left
  const ys = (n) => (n === 1 ? [CENTER.y] : [10, H - 10 - BOX_H])
  return [
    ...ys(left).map((y) => ({ side: 'left', y })),
    ...ys(right).map((y) => ({ side: 'right', y })),
  ]
}

function Connector({ side, y, many }) {
  const cy = CENTER.y + BOX_H / 2
  const sy = y + BOX_H / 2
  const dir = side === 'left' ? -1 : 1
  const from = side === 'left' ? CENTER.x : CENTER.x + CENTER.w
  const to = side === 'left' ? LEFT_X + SIDE_W : RIGHT_X
  const elbow = (from + to) / 2
  const one = from + dir * 8

  return (
    <g className="sketch__link">
      <path d={`M${from} ${cy}H${elbow}V${sy}H${to}`} />
      {/* "one" on the main record's side */}
      <path d={`M${one} ${cy - 6}V${cy + 6}`} />
      {many ? (
        <path d={`M${to - dir * 12} ${sy}L${to} ${sy - 7}M${to - dir * 12} ${sy}L${to} ${sy}M${to - dir * 12} ${sy}L${to} ${sy + 7}`} />
      ) : (
        <path d={`M${to - dir * 8} ${sy - 6}V${sy + 6}`} />
      )}
    </g>
  )
}

export default function SystemSketch({ id, className = '' }) {
  const system = systems[id]
  if (!system) return null
  const spots = placements(system.links.length)
  const summary = system.links.map((link) => `${link.many ? 'many' : 'one'} ${link.name}`).join(', ')

  return (
    <figure className={`sketch ${className}`}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Data sketch: each ${system.center} has ${summary}.`}>
        {system.links.map((link, index) => (
          <Connector key={link.name} {...spots[index]} many={link.many} />
        ))}
        {system.links.map((link, index) => {
          const { side, y } = spots[index]
          const x = side === 'left' ? LEFT_X : RIGHT_X
          return (
            <g key={link.name} className="sketch__entity">
              <rect x={x} y={y} width={SIDE_W} height={BOX_H} rx="2" />
              <text x={x + SIDE_W / 2} y={y + BOX_H / 2}>
                {link.name}
              </text>
            </g>
          )
        })}
        <g className="sketch__entity sketch__entity--main">
          <rect x={CENTER.x} y={CENTER.y} width={CENTER.w} height={BOX_H} rx="2" />
          <text x={CENTER.x + CENTER.w / 2} y={CENTER.y + BOX_H / 2}>
            {system.center}
          </text>
        </g>
      </svg>
      <figcaption className="sketch__caption">Data model, simplified</figcaption>
    </figure>
  )
}
