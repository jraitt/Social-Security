import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Social Security Benefits Calculator',
  description: 'Calculate optimal Social Security claiming strategies for individuals and couples',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          <header className="bg-blue-600 text-white py-6 shadow-md">
            <div className="container mx-auto px-4">
              <h1 className="text-3xl font-bold">Social Security Benefits Calculator</h1>
              <p className="text-blue-100 mt-2">Optimize your retirement claiming strategy</p>
            </div>
          </header>
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
          <footer className="bg-gray-800 text-gray-300 py-6 mt-12">
            <div className="container mx-auto px-4 text-center">
              <p>&copy; {new Date().getFullYear()} Social Security Calculator. All rights reserved.</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
