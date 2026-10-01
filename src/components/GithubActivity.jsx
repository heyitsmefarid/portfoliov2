import { useEffect, useMemo, useRef, useState } from 'react'
import { profile } from '../data/profile.js'
import { fetchContributions, formatDay, monthLabels, toWeeks } from '../lib/github.js'
import Panel from './Panel.jsx'
import ContributionSkyline from './ContributionSkyline.jsx'
import './GithubActivity.css'

const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', '']

function Calendar({ data, weeks }) {
  const months = useMemo(() => monthLabels(weeks), [weeks])
  const scrollRef = useRef(null)

  // On narrow screens, start scrolled to the most recent weeks.
  useEffect(() => {
    const element = scrollRef.current
    if (element) element.scrollLeft = element.scrollWidth
  }, [weeks])

  const summary = `${data.total.toLocaleString('en-US')} contributions in the last year`

  return (
    <div className="gh__scroll" ref={scrollRef} tabIndex={0} role="region" aria-label="Contribution graph">
      <div className="gh__calendar" role="img" aria-label={`GitHub contribution graph: ${summary}.`} style={{ '--weeks': weeks.length }}>
        <div className="gh__months" aria-hidden="true">
          {months.map((label, index) => (
            <span key={index} style={{ gridColumn: index + 1 }}>
              {label}
            </span>
          ))}
        </div>
        <div className="gh__days" aria-hidden="true">
          {DAY_LABELS.map((label, index) => (
            <span key={index}>{label}</span>
          ))}
        </div>
        <div className="gh__grid" aria-hidden="true">
          {weeks.map((week, w) =>
            week.map((day, d) =>
              day ? (
                <span
                  key={day.date}
                  className="gh__cell"
                  data-level={day.level}
                  style={{ gridColumn: w + 1, gridRow: d + 1, '--w': w }}
                  title={`${day.count === 0 ? 'No' : day.count} contribution${day.count === 1 ? '' : 's'} on ${formatDay(day.date)}`}
                />
              ) : null,
            ),
          )}
        </div>
      </div>
    </div>
  )
}

// Grid (like GitHub) or a 3D skyline of the same data.
function ContributionViews({ data }) {
  const weeks = useMemo(() => toWeeks(data.days), [data.days])
  const [view, setView] = useState(() => (window.matchMedia('(min-width: 720px)').matches ? '3d' : 'grid'))

  return (
    <>
      <div className="gh__views" role="group" aria-label="Graph style">
        {[
          ['grid', 'Grid'],
          ['3d', '3D skyline'],
        ].map(([key, label]) => (
          <button key={key} type="button" className="gh__view" aria-pressed={view === key} onClick={() => setView(key)}>
            {label}
          </button>
        ))}
      </div>
      {view === '3d' ? <ContributionSkyline weeks={weeks} total={data.total} /> : <Calendar data={data} weeks={weeks} />}
    </>
  )
}

function Legend() {
  return (
    <div className="gh__legend" aria-hidden="true">
      <span>Less</span>
      {[0, 1, 2, 3, 4].map((level) => (
        <span key={level} className="gh__cell gh__cell--legend" data-level={level} />
      ))}
      <span>More</span>
    </div>
  )
}

export default function GithubActivity() {
  const { githubUsername, github } = profile.contact
  const [state, setState] = useState({ status: 'idle' })
  const bodyRef = useRef(null)

  // Load once the panel is close to the viewport, not on page load.
  useEffect(() => {
    const element = bodyRef.current
    if (!element) return

    let cancelled = false
    const load = () => {
      fetchContributions(githubUsername)
        .then((data) => !cancelled && setState({ status: 'ready', data }))
        .catch(() => !cancelled && setState({ status: 'error' }))
    }

    if (!('IntersectionObserver' in window)) {
      load()
      return () => {
        cancelled = true
      }
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.disconnect()
          load()
        }
      },
      { rootMargin: '600px 0px' },
    )
    observer.observe(element)
    return () => {
      cancelled = true
      observer.disconnect()
    }
  }, [githubUsername])

  return (
    <Panel
      id="github"
      title="GitHub contributions"
      aside={
        <a className="panel-link" href={github} target="_blank" rel="noopener noreferrer">
          View GitHub profile <span aria-hidden="true">↗</span>
          <span className="visually-hidden"> (opens in a new tab)</span>
        </a>
      }
    >
      <div className="gh" ref={bodyRef}>
        {state.status === 'ready' ? (
          <ContributionViews data={state.data} />
        ) : state.status === 'error' ? (
          <p className="gh__empty">
            Contribution data couldn't be loaded right now — the graph is on{' '}
            <a href={github} target="_blank" rel="noopener noreferrer">
              @{githubUsername}'s GitHub profile
            </a>
            .
          </p>
        ) : (
          <div className="gh__skeleton" aria-hidden="true" />
        )}

        <div className="gh__footer">
          <p className="gh__total" aria-live="polite">
            {state.status === 'ready' ? (
              <>
                <strong>{state.data.total.toLocaleString('en-US')}</strong> contributions in the last year{' '}
                <span className="gh__user">· @{githubUsername}</span>
              </>
            ) : state.status === 'idle' ? (
              'Loading contributions…'
            ) : (
              `@${githubUsername}`
            )}
          </p>
          {state.status === 'ready' && <Legend />}
        </div>
      </div>
    </Panel>
  )
}
