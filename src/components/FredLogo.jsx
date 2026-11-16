import { useState } from 'react'

// FredLogo: the animated FG mark + "fred." wordmark from Fred's logo kit.
// - Strokes use currentColor, so the logo follows the text colour around it.
// - The accent square uses --fred-accent (sage on the forest bar, moss on mint).
// - Draws itself on load, replays on hover. On the first visit the intro
//   plays the draw-on full-screen and lands on this one.
// - Respects reduced motion.
const BODY = 'M114 16H16V72A34 34 0 0 0 50 106H106V76H50'
const ARM = 'M8 46H76'
const LETTERS = [
  ['M10 100V14H46', 'M4 46H34'], // f
  ['M56 100V46H88'], // r
  ['M104 70H144V46H104V76A18 18 0 0 0 122 94H150'], // e
  ['M208 8V100', 'M208 46H164V76A18 18 0 0 0 182 94H208'], // d
]

const CSS = `
.fgl-s{fill:none;stroke:currentColor;stroke-linecap:butt;stroke-linejoin:miter}
.fgl-b,.fgl-a{stroke-dasharray:1 1}
.fgl-b{animation:fgl-draw .9s cubic-bezier(.65,0,.35,1) .1s both}
.fgl-a{animation:fgl-draw .35s cubic-bezier(.3,0,.2,1) .85s both}
.fgl-c{animation:fgl-pop .01s step-end 1.15s both}
.fgl-l1{animation:fgl-pop .01s step-end 1.40s both}
.fgl-l2{animation:fgl-pop .01s step-end 1.52s both}
.fgl-l3{animation:fgl-pop .01s step-end 1.64s both}
.fgl-l4{animation:fgl-pop .01s step-end 1.76s both}
.fgl-dot{animation:fgl-pop .01s step-end 1.92s both,fgl-blink 1.1s step-end 2.5s infinite}
.fgl-mark .fgl-c{animation:fgl-pop .01s step-end 1.15s both,fgl-blink 1.1s step-end 1.7s infinite}
@keyframes fgl-draw{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}
@keyframes fgl-pop{from{opacity:0}to{opacity:1}}
@keyframes fgl-blink{0%{opacity:1}50%{opacity:0}}
@media (prefers-reduced-motion:reduce){.fgl *{animation:none!important;stroke-dasharray:none!important}}
`

export default function FredLogo({
  variant = 'lockup', // 'lockup' | 'mark'
  height = 36,
  replayOnHover = true,
  // Set when a surrounding link already names it ("Fred Anthony Gallano, home")
  decorative = false,
  title = 'Fred Anthony Gallano',
  className = '',
}) {
  const [run, setRun] = useState(0)
  const isMark = variant === 'mark'
  const width = isMark ? 122 : 388

  return (
    <svg
      key={run}
      className={`fgl ${isMark ? 'fgl-mark' : ''} ${className}`}
      viewBox={`0 0 ${width} 122`}
      height={height}
      width={(height * width) / 122}
      {...(decorative ? { 'aria-hidden': true, focusable: 'false' } : { role: 'img', 'aria-label': title })}
      onMouseEnter={replayOnHover ? () => setRun((n) => n + 1) : undefined}
    >
      <style>{CSS}</style>
      <g className="fgl-s" strokeWidth="16">
        <path className="fgl-b" pathLength="1" d={BODY} />
        <path className="fgl-a" pathLength="1" d={ARM} />
      </g>
      <rect className="fgl-c" x="92" y="38" width="16" height="16" style={{ fill: 'var(--fred-accent, #8FB8A8)' }} />
      {!isMark && (
        <g transform="translate(146 14)">
          <g className="fgl-s" strokeWidth="12">
            {LETTERS.map((paths, i) => (
              <g key={i} className={`fgl-l${i + 1}`}>
                {paths.map((d) => (
                  <path key={d} d={d} />
                ))}
              </g>
            ))}
          </g>
          <rect className="fgl-dot" x="222" y="88" width="12" height="12" style={{ fill: 'var(--fred-accent, #8FB8A8)' }} />
        </g>
      )}
    </svg>
  )
}
