import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useSeo } from '../lib/useSeo'

export default function NotFound() {
  useSeo('Page not found')
  return (
    <section className="container-x flex min-h-svh flex-col items-start justify-center">
      <p className="font-name text-[clamp(5rem,3rem+12vw,12rem)] leading-none font-bold text-surface-2">
        4<span className="text-danger">0</span>4
      </p>
      <h1 className="mt-4 text-3xl font-semibold">Signal lost.</h1>
      <p className="mt-3 max-w-md text-muted">The page you’re looking for doesn’t exist or has moved.</p>
      <Link to="/" className="btn btn-primary mt-8">
        <ArrowLeft size={16} /> Back home
      </Link>
    </section>
  )
}
