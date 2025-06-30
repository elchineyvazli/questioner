import './globals.css'
import { Inter } from 'next/font/google'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import ThemeSwitcher from './components/ThemeSwitcher'
import Providers from './components/Providers'
import { OnboardingWrapper } from './components/OnboardingModal'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

export const metadata = {
  title: 'Sorgulayanlar Kulübü',
  description: 'Sorgulayıcılar için modern bir tartışma ve soru-cevap platformu',
}

export default function RootLayout({ children }) {
  return (
    <html lang="tr" className="scroll-smooth" suppressHydrationWarning={true}>
      <body
        suppressHydrationWarning={true}
        className={`${inter.className} bg-white text-gray-900 dark:bg-zinc-900 dark:text-white transition-colors duration-300`}
      >
        <Providers>
          <OnboardingWrapper>
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <div className="flex flex-1">
                <Sidebar />
                <main className="w-full max-w-6xl mx-auto px-4 py-6 pt-8 md:pt-10 lg:pt-12">
                  {children}
                </main>
              </div>
            </div>
            <ThemeSwitcher />
          </OnboardingWrapper>
        </Providers>
      </body>
    </html>
  )
}
