import { useEffect } from 'react'
import { Shell } from './components/Shell'
import { PlayerProvider, usePlayer } from './context/PlayerContext'
import { ThemeProvider } from './context/ThemeContext'
import { useHashRoute } from './hooks/useHashRoute'
import { useIdleReset } from './hooks/useIdleReset'
import { HomeScreen } from './screens/HomeScreen'
import { LeaderboardScreen } from './screens/LeaderboardScreen'
import { RealVsAiScreen } from './screens/RealVsAiScreen'
import { SimulatorScreen } from './screens/SimulatorScreen'
import { TriviaScreen } from './screens/TriviaScreen'

function BoothRouter() {
  const { route, navigate } = useHashRoute()
  const { clearPlayer } = usePlayer()

  // Pastikan setiap perpindahan layar di smartphone selalu mulai dari posisi paling atas
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [route])

  // Reset otomatis ke beranda setelah 3 menit tanpa sentuhan di tablet booth (kecuali layar TV Leaderboard)
  useIdleReset(route !== 'home' && route !== 'leaderboard', 180_000, () => {
    clearPlayer()
    navigate('home')
  })

  return (
    <Shell currentRoute={route}>
      {route === 'home' && <HomeScreen navigate={navigate} />}
      {route === 'simulator' && <SimulatorScreen />}
      {route === 'trivia' && <TriviaScreen />}
      {route === 'realvsai' && <RealVsAiScreen />}
      {route === 'leaderboard' && <LeaderboardScreen />}
    </Shell>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <PlayerProvider>
        <BoothRouter />
      </PlayerProvider>
    </ThemeProvider>
  )
}
