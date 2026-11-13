import { useCallback, useEffect, useState } from 'react'

export type Route = 'home' | 'simulator' | 'trivia' | 'realvsai' | 'battle' | 'leaderboard'

const ROUTES: Record<string, Route> = {
  '': 'home',
  '/': 'home',
  '/simulator': 'simulator',
  '/trivia': 'trivia',
  '/real-vs-ai': 'realvsai',
  '/battle': 'battle',
  '/prompt-battle': 'battle',
  '/leaderboard': 'leaderboard',
}

export const ROUTE_PATHS: Record<Route, string> = {
  home: '#/',
  simulator: '#/simulator',
  trivia: '#/trivia',
  realvsai: '#/real-vs-ai',
  battle: '#/battle',
  leaderboard: '#/leaderboard',
}

function parse(): Route {
  const path = window.location.hash.replace(/^#/, '').split('?')[0]
  return ROUTES[path] ?? 'home'
}

/**
 * Hash routing tanpa dependency — aman di Vercel/Netlify tanpa konfigurasi rewrite,
 * dan QR code bisa langsung menunjuk ke game tertentu (mis. /#/trivia).
 */
export function useHashRoute() {
  const [route, setRoute] = useState<Route>(parse)

  useEffect(() => {
    const onChange = () => {
      setRoute(parse())
      window.scrollTo({ top: 0 })
    }
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  const navigate = useCallback((to: Route) => {
    window.location.hash = ROUTE_PATHS[to]
  }, [])

  return { route, navigate }
}
