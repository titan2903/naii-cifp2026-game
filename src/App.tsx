import { useEffect } from 'react'
import { Shell } from './components/Shell'
import { LanguageProvider } from './context/LanguageContext'
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
  const { clearPlayer, stampCount, passportOpen, qrModalOpen } = usePlayer()

  // Pastikan setiap perpindahan layar di smartphone selalu mulai dari posisi paling atas
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [route])

  // Kunci scroll latar belakang saat modal Paspor atau QR terbuka di smartphone
  useEffect(() => {
    const locked = passportOpen || qrModalOpen
    document.body.classList.toggle('overflow-hidden', locked)
    return () => {
      document.body.classList.remove('overflow-hidden')
    }
  }, [passportOpen, qrModalOpen])

  // Reset otomatis hanya jika pengunjung belum membuka stamp dan tidak sedang membuka modal (mencegah Stamp #01 terhapus saat daftar ke www.naii.co)
  useIdleReset(
    route !== 'home' && route !== 'leaderboard' && stampCount === 0 && !passportOpen && !qrModalOpen,
    180_000,
    () => {
      clearPlayer()
      navigate('home')
    },
  )

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
      <LanguageProvider>
        <PlayerProvider>
          <BoothRouter />
        </PlayerProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}
