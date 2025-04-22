import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Agent Worker Dashboard',
  description: 'Monitor and manage agent worker sessions',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full bg-gray-50">
      <body className={`${inter.className} h-full`}>
        <div className="min-h-full">
          <nav className="bg-white shadow-sm">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 justify-between">
                <div className="flex">
                  <div className="flex flex-shrink-0 items-center">
                    <h1 className="text-xl font-semibold">Agent Worker Dashboard</h1>
                  </div>
                  <div className="ml-10 flex items-center space-x-4">
                    <Link 
                      href="/" 
                      className="px-3 py-2 text-sm font-medium text-gray-900 rounded-md hover:bg-gray-100"
                    >
                      Sessions
                    </Link>
                    <Link 
                      href="/jobs" 
                      className="px-3 py-2 text-sm font-medium text-gray-900 rounded-md hover:bg-gray-100"
                    >
                      Jobs
                    </Link>
                    <Link 
                      href="/api-docs" 
                      className="px-3 py-2 text-sm font-medium text-gray-900 rounded-md hover:bg-gray-100"
                    >
                      API Docs
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </nav>
          <main>
            <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  )
} 