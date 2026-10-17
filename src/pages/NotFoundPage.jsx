import Link from '../components/Link.jsx'
import { usePageTitle } from '../lib/pageTitle.js'

export default function NotFoundPage({ message = 'This page does not exist.' }) {
  usePageTitle('Not found')
  return (
    <div className="container page-body not-found">
      <h1 className="not-found__title">404</h1>
      <p className="not-found__text">{message}</p>
      <p className="not-found__links">
        <Link className="text-link" href="/projects">
          All projects <span aria-hidden="true">→</span>
        </Link>
        <Link className="text-link" href="/">
          Home <span aria-hidden="true">→</span>
        </Link>
      </p>
    </div>
  )
}
