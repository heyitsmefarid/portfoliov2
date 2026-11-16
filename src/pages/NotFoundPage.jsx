import Link from '../components/Link.jsx'
import { usePageTitle } from '../lib/pageTitle.js'

export default function NotFoundPage({ message = 'This page does not exist.' }) {
  usePageTitle('Not found')
  return (
    <div className="form">
      <div className="cell not-found">
        <p className="not-found__stamp" aria-hidden="true">
          Void
        </p>
        <h1 className="page-title">Page not found</h1>
        <p>{message}</p>
        <p className="not-found__links">
          <Link className="link" href="/">
            Back to the form
          </Link>
          <Link className="link" href="/projects">
            See all projects
          </Link>
        </p>
      </div>
    </div>
  )
}
