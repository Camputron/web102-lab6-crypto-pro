import { Link } from "react-router"

function NotFound() {
  return (
    <div className="not-found">
      <h1>404</h1>
      <h2>This coin wandered off the charts.</h2>
      <p>The page you're looking for doesn't exist.</p>
      <Link className="back-home" to="/">
        ← Back to Home
      </Link>
    </div>
  )
}

export default NotFound
